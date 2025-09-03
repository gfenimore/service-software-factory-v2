#!/usr/bin/env node

/**
 * Code Manager - Standalone Implementation
 * 
 * Provides the same functionality as the Claude Code Agent
 * until MCP integration issues are resolved.
 * 
 * Usage:
 *   node scripts/code-manager.js status
 *   node scripts/code-manager.js summary [path]
 *   node scripts/code-manager.js changes [timeframe]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const command = process.argv[2];
const args = process.argv.slice(3);

function execGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays === 0) {
    return diffHours === 0 ? 'just now' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function getRecentChanges(timeframe = 'yesterday') {
  const gitSince = timeframe === 'today' ? 'today' : timeframe;
  const changes = execGit(`git log --since="${gitSince}" --oneline --name-only`);
  
  if (!changes) return [];
  
  const lines = changes.split('\n');
  const commits = [];
  let currentCommit = null;
  
  for (const line of lines) {
    if (line.match(/^[a-f0-9]{7,}/)) {
      // This is a commit line
      if (currentCommit) commits.push(currentCommit);
      const [hash, ...messageParts] = line.split(' ');
      currentCommit = {
        hash: hash,
        message: messageParts.join(' '),
        files: []
      };
    } else if (line.trim() && currentCommit) {
      // This is a file line
      currentCommit.files.push(line.trim());
    }
  }
  if (currentCommit) commits.push(currentCommit);
  
  return commits;
}

function getCurrentStatus() {
  const status = execGit('git status --porcelain');
  const branch = execGit('git branch --show-current');
  const lastCommit = execGit('git log -1 --format="%h %s (%ar)"');
  
  const statusLines = status.split('\n').filter(line => line.trim());
  const modified = statusLines.filter(line => line.startsWith(' M') || line.startsWith('M')).map(line => line.substring(2).trim());
  const added = statusLines.filter(line => line.startsWith('??')).map(line => line.substring(2).trim());
  
  return { branch, lastCommit, modified, added };
}

function getFileDescription(filePath) {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath);
  
  // Simple file type descriptions
  const descriptions = {
    '.js': 'JavaScript module',
    '.md': 'Documentation',
    '.json': 'Configuration file',
    '.html': 'HTML template/mockup',
    '.css': 'Stylesheet',
    '.tsx': 'TypeScript React component',
    '.ts': 'TypeScript module'
  };
  
  let desc = descriptions[ext] || 'File';
  
  // Special patterns
  if (filePath.includes('config')) desc = 'Configuration';
  if (filePath.includes('test')) desc = 'Test file';
  if (filePath.includes('mockup')) desc = 'UI mockup';
  if (filePath.includes('PRD')) desc = 'Requirements document';
  if (filePath.includes('.pipeline')) desc = 'Pipeline tool/config';
  
  return desc;
}

function handleStatus() {
  console.log('## Recent Changes');
  
  const recentChanges = getRecentChanges('yesterday');
  if (recentChanges.length === 0) {
    console.log('• No recent changes');
  } else {
    const recentFiles = new Set();
    recentChanges.forEach(commit => {
      commit.files.forEach(file => recentFiles.add(file));
    });
    
    Array.from(recentFiles).slice(0, 5).forEach(file => {
      console.log(`• Modified: ${file} (${getFileDescription(file)})`);
    });
  }
  
  console.log('\n## Current Status');
  const status = getCurrentStatus();
  
  if (status.modified.length > 0) {
    status.modified.forEach(file => {
      console.log(`• Modified: ${file} (${getFileDescription(file)})`);
    });
  }
  
  if (status.added.length > 0) {
    status.added.forEach(file => {
      console.log(`• Added: ${file}`);
    });
  }
  
  console.log('\n## Active Features');
  console.log(`• Current branch: ${status.branch}`);
  if (status.lastCommit) {
    console.log(`• Last commit: ${status.lastCommit}`);
  }
  
  console.log('\n## Key Files Modified Today');
  const todayChanges = getRecentChanges('today');
  if (todayChanges.length === 0) {
    console.log('• No changes today');
  } else {
    const todayFiles = new Set();
    todayChanges.forEach(commit => {
      commit.files.forEach(file => todayFiles.add(file));
    });
    
    Array.from(todayFiles).slice(0, 3).forEach(file => {
      console.log(`• ${file} (${getFileDescription(file)})`);
    });
  }
}

function handleSummary(targetPath = '.') {
  const fullPath = path.resolve(targetPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Path not found: ${targetPath}`);
    return;
  }
  
  const stat = fs.statSync(fullPath);
  
  if (stat.isDirectory()) {
    console.log(`## Directory Summary: ${targetPath}`);
    const files = fs.readdirSync(fullPath);
    const subdirs = files.filter(f => fs.statSync(path.join(fullPath, f)).isDirectory());
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    console.log(`• Contains: ${files.length} items`);
    if (subdirs.length > 0) console.log(`• Subdirectories: ${subdirs.slice(0, 3).join(', ')}${subdirs.length > 3 ? '...' : ''}`);
    if (jsFiles.length > 0) console.log(`• JavaScript files: ${jsFiles.length}`);
    if (mdFiles.length > 0) console.log(`• Documentation: ${mdFiles.length} files`);
    
  } else {
    console.log(`## File Summary: ${targetPath}`);
    console.log(`• Type: ${getFileDescription(targetPath)}`);
    console.log(`• Size: ${Math.round(stat.size / 1024)} KB`);
    console.log(`• Modified: ${formatTime(stat.mtime)}`);
    
    // Try to read first few lines for context
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').slice(0, 3);
      if (lines[0] && lines[0].trim()) {
        console.log(`• Preview: ${lines[0].trim()}`);
      }
    } catch (error) {
      console.log('• Content: Binary file or access denied');
    }
  }
}

function handleChanges(timeframe = 'yesterday') {
  console.log(`## Changes Since ${timeframe}`);
  
  const changes = getRecentChanges(timeframe);
  if (changes.length === 0) {
    console.log(`• No changes since ${timeframe}`);
    return;
  }
  
  changes.forEach(commit => {
    console.log(`\n### ${commit.hash} - ${commit.message}`);
    commit.files.forEach(file => {
      console.log(`  • ${file} (${getFileDescription(file)})`);
    });
  });
}

// Main command handler
switch (command) {
  case 'status':
    handleStatus();
    break;
    
  case 'summary':
    handleSummary(args[0]);
    break;
    
  case 'changes':
    handleChanges(args[0]);
    break;
    
  default:
    console.log('Code Manager - Standalone Implementation');
    console.log('\nAvailable commands:');
    console.log('  status                   - Show current project status');
    console.log('  summary [path]          - Summarize file or directory');
    console.log('  changes [timeframe]     - Show changes since timeframe');
    console.log('\nExamples:');
    console.log('  node scripts/code-manager.js status');
    console.log('  node scripts/code-manager.js summary .pipeline');
    console.log('  node scripts/code-manager.js changes "2 days ago"');
    break;
}