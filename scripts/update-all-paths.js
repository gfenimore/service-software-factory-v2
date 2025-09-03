#!/usr/bin/env node

/**
 * Automated Path Update Script for Pipeline Migration
 * Updates all hardcoded .pipeline references to new structure
 */

const fs = require('fs');
const path = require('path');

// Path mappings from old to new structure
const PATH_MAPPINGS = {
  // Direct path replacements
  '.pipeline/factory-tools': './factory/generators',
  '.pipeline/01-factory-tools': './factory/generators',
  '.pipeline/02-concept-line': './factory/generators/concept',
  '.pipeline/03-prototype-assembly': './factory/generators/prototype',
  '.pipeline/04-production-ready': './factory/generators/production',
  '.pipeline/05-data-tools': './factory/generators/data-tools',
  '.pipeline/06-control-panel': './factory/control-panel',
  '.pipeline/00-requirements': './definitions/requirements',
  '.pipeline/configurations': './definitions/configurations',
  
  // Output directories
  '.pipeline/02-concept-line/output': './.build/current/concept',
  '.pipeline/03-prototype-assembly/output': './.build/current/prototype',
  '.pipeline/04-production-ready/output': './.build/current/production',
  
  // Specific tool paths
  '.pipeline/factory-tools/module-system/module-builder.js': './factory/generators/module-system/module-builder.js',
  '.pipeline/factory-tools/generators/concept-html/concept-generator-v3.js': './factory/generators/concept-html/concept-generator-v3.js',
  '.pipeline/factory-tools/viewforge/viewforge-transformer.js': './factory/generators/viewforge/viewforge-transformer.js',
  '.pipeline/06-control-panel/server.js': './factory/control-panel/server.js'
};

// Files to update
const FILES_TO_UPDATE = [
  'package.json',
  '.pipeline/package.json',
  'scripts/generate-contract-registry.js',
  'CLAUDE.md',
  'TEAM-COLLABORATION-GUIDE.md'
];

// Patterns to search for additional files
const SEARCH_PATTERNS = [
  'factory/**/*.js',
  'scripts/**/*.js',
  'definitions/**/*.json',
  '*.md'
];

let totalUpdates = 0;
let filesModified = 0;
let errors = [];

/**
 * Update paths in a single file
 */
function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let updates = 0;
    
    // Apply each mapping
    for (const [oldPath, newPath] of Object.entries(PATH_MAPPINGS)) {
      // Count occurrences first
      const occurrences = (content.match(new RegExp(escapeRegex(oldPath), 'g')) || []).length;
      
      if (occurrences > 0) {
        content = content.replace(new RegExp(escapeRegex(oldPath), 'g'), newPath);
        updates += occurrences;
        console.log(`    • ${oldPath} → ${newPath} (${occurrences} occurrences)`);
      }
    }
    
    // Write back if changed
    if (content !== originalContent) {
      // Create backup
      fs.writeFileSync(`${filePath}.backup-${Date.now()}`, originalContent);
      
      // Write updated content
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Updated ${filePath} (${updates} changes)`);
      totalUpdates += updates;
      filesModified++;
      return true;
    } else {
      console.log(`  ⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error updating ${filePath}: ${error.message}`);
    errors.push({ file: filePath, error: error.message });
    return false;
  }
}

/**
 * Escape regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find files matching pattern (simple implementation without glob)
 */
function findFiles(pattern) {
  // This is a simplified version - in production use glob package
  const files = [];
  
  if (pattern.includes('**')) {
    // Recursive search
    const [basePath, filePattern] = pattern.split('/**/');
    if (fs.existsSync(basePath)) {
      walkDir(basePath, filePattern, files);
    }
  } else if (pattern.includes('*')) {
    // Single directory search
    const dir = path.dirname(pattern);
    const filePattern = path.basename(pattern);
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(file => {
        if (matchPattern(file, filePattern)) {
          files.push(path.join(dir, file));
        }
      });
    }
  } else {
    // Direct file
    if (fs.existsSync(pattern)) {
      files.push(pattern);
    }
  }
  
  return files;
}

/**
 * Walk directory recursively
 */
function walkDir(dir, pattern, results) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath, pattern, results);
      } else if (matchPattern(file, pattern)) {
        results.push(fullPath);
      }
    });
  } catch (error) {
    console.warn(`Could not read directory: ${dir}`);
  }
}

/**
 * Simple pattern matching
 */
function matchPattern(filename, pattern) {
  const regex = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regex}$`).test(filename);
}

/**
 * Create detailed report
 */
function createReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesModified,
      totalUpdates,
      errors: errors.length
    },
    mappings: PATH_MAPPINGS,
    filesProcessed: FILES_TO_UPDATE,
    errors
  };
  
  fs.writeFileSync('migration-path-update-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: migration-path-update-report.json');
}

/**
 * Main execution
 */
console.log('🔄 Starting Automated Path Update for Pipeline Migration');
console.log('=' .repeat(60));
console.log(`\n📋 Will update ${Object.keys(PATH_MAPPINGS).length} path mappings\n`);

// Update specified files
console.log('Updating known files:');
FILES_TO_UPDATE.forEach(file => {
  updateFile(file);
});

// Search for additional files
console.log('\nSearching for additional files to update:');
SEARCH_PATTERNS.forEach(pattern => {
  const files = findFiles(pattern);
  console.log(`\nPattern: ${pattern}`);
  files.forEach(file => {
    if (!FILES_TO_UPDATE.includes(file)) {
      updateFile(file);
    }
  });
});

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📊 Update Summary:');
console.log(`  Files modified: ${filesModified}`);
console.log(`  Total path updates: ${totalUpdates}`);
console.log(`  Errors encountered: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n⚠️  Errors:');
  errors.forEach(err => {
    console.log(`  - ${err.file}: ${err.error}`);
  });
}

// Create report
createReport();

// Exit code
process.exit(errors.length > 0 ? 1 : 0);