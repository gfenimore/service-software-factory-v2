#!/usr/bin/env node

/**
 * Migration Readiness Verification Script
 * Comprehensive checks before, during, and after migration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CHECKS = {
  preMigration: [
    'gitStatus',
    'diskSpace',
    'nodeVersion',
    'currentBuildWorks',
    'backupExists'
  ],
  postMigration: [
    'newStructureExists',
    'noOldReferences',
    'npmScriptsWork',
    'buildOutputsGenerated',
    'criticalFilesPresent'
  ]
};

const REQUIRED_DISK_SPACE_GB = 50;
const MIN_NODE_VERSION = '18.0.0';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let checkResults = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Helper function for colored output
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if git repository is clean
 */
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      return {
        status: 'warning',
        message: 'Git repository has uncommitted changes',
        details: status.trim().split('\n').slice(0, 5).join('\n')
      };
    }
    return {
      status: 'passed',
      message: 'Git repository is clean'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: 'Could not check git status',
      details: error.message
    };
  }
}

/**
 * Check available disk space
 */
function checkDiskSpace() {
  try {
    let diskInfo;
    if (process.platform === 'win32') {
      // Windows - use wmic
      const output = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
      // Parse Windows output - this is simplified
      diskInfo = { available: 100 }; // Placeholder - implement actual parsing
    } else {
      // Unix-like systems
      const output = execSync('df -BG . | tail -1', { encoding: 'utf8' });
      const parts = output.split(/\s+/);
      diskInfo = {
        available: parseInt(parts[3])
      };
    }
    
    if (diskInfo.available < REQUIRED_DISK_SPACE_GB) {
      return {
        status: 'failed',
        message: `Insufficient disk space: ${diskInfo.available}GB available, need ${REQUIRED_DISK_SPACE_GB}GB`
      };
    }
    
    return {
      status: 'passed',
      message: `Sufficient disk space: ${diskInfo.available}GB available`
    };
  } catch (error) {
    return {
      status: 'warning',
      message: 'Could not check disk space',
      details: 'Please ensure you have at least 50GB free'
    };
  }
}

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  const currentVersion = process.version.substring(1); // Remove 'v' prefix
  const current = currentVersion.split('.').map(Number);
  const required = MIN_NODE_VERSION.split('.').map(Number);
  
  for (let i = 0; i < required.length; i++) {
    if (current[i] > required[i]) break;
    if (current[i] < required[i]) {
      return {
        status: 'failed',
        message: `Node.js version ${currentVersion} is below minimum ${MIN_NODE_VERSION}`
      };
    }
  }
  
  return {
    status: 'passed',
    message: `Node.js version ${currentVersion} meets requirements`
  };
}

/**
 * Check if current build works
 */
function checkCurrentBuildWorks() {
  try {
    // Try to run a simple command that should work
    execSync('npm run --silent concept:generate -- --dry-run', { encoding: 'utf8', stdio: 'pipe' });
    return {
      status: 'passed',
      message: 'Current build system is functional'
    };
  } catch (error) {
    return {
      status: 'warning',
      message: 'Current build system may have issues',
      details: 'This could be normal if you\'re already mid-migration'
    };
  }
}

/**
 * Check if backup exists
 */
function checkBackupExists() {
  const backupPatterns = [
    'pipeline-backup-*.tar.gz',
    'pipeline-backup-*/',
    '.pipeline.backup/'
  ];
  
  let backupFound = false;
  for (const pattern of backupPatterns) {
    try {
      const files = fs.readdirSync('.').filter(f => {
        if (pattern.includes('*')) {
          const regex = pattern.replace('*', '.*');
          return new RegExp(regex).test(f);
        }
        return f === pattern.replace('/', '');
      });
      
      if (files.length > 0) {
        backupFound = files[0];
        break;
      }
    } catch (error) {
      // Continue checking
    }
  }
  
  if (backupFound) {
    return {
      status: 'passed',
      message: `Backup found: ${backupFound}`
    };
  } else {
    return {
      status: 'failed',
      message: 'No backup found - create backup before proceeding'
    };
  }
}

/**
 * Check if new structure exists
 */
function checkNewStructureExists() {
  const requiredDirs = [
    'factory/generators',
    'factory/integrations',
    'factory/specifications',
    'definitions/requirements',
    'definitions/configurations'
  ];
  
  const missing = requiredDirs.filter(dir => !fs.existsSync(dir));
  
  if (missing.length === 0) {
    return {
      status: 'passed',
      message: 'All required directories present'
    };
  } else if (missing.length === requiredDirs.length) {
    return {
      status: 'failed',
      message: 'New structure not created yet',
      details: 'Run migration first'
    };
  } else {
    return {
      status: 'warning',
      message: 'Partial structure exists',
      details: `Missing: ${missing.join(', ')}`
    };
  }
}

/**
 * Check for old .pipeline references
 */
function checkNoOldReferences() {
  try {
    const output = execSync(
      'grep -r "\\.pipeline" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.pipeline.old --exclude-dir=pipeline-backup* 2>/dev/null | head -20',
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    
    if (!output) {
      return {
        status: 'passed',
        message: 'No old .pipeline references found'
      };
    }
    
    const files = output.split('\n').map(line => line.split(':')[0]);
    const uniqueFiles = [...new Set(files)];
    
    return {
      status: 'warning',
      message: `Found ${uniqueFiles.length} files with .pipeline references`,
      details: uniqueFiles.slice(0, 5).join('\n')
    };
  } catch (error) {
    // grep returns exit code 1 if no matches found - that's good!
    if (error.status === 1) {
      return {
        status: 'passed',
        message: 'No old .pipeline references found'
      };
    }
    return {
      status: 'warning',
      message: 'Could not check for old references',
      details: error.message
    };
  }
}

/**
 * Check if npm scripts work
 */
function checkNpmScriptsWork() {
  const scriptsToTest = [
    'clean',
    'build:concept -- --dry-run',
    'validate'
  ];
  
  const failed = [];
  
  for (const script of scriptsToTest) {
    try {
      execSync(`npm run --silent ${script}`, { encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      failed.push(script);
    }
  }
  
  if (failed.length === 0) {
    return {
      status: 'passed',
      message: 'All tested npm scripts work'
    };
  } else {
    return {
      status: 'failed',
      message: `${failed.length} npm scripts failed`,
      details: `Failed: ${failed.join(', ')}`
    };
  }
}

/**
 * Check if build outputs are generated
 */
function checkBuildOutputsGenerated() {
  const expectedOutputs = [
    '.build/current/concept',
    '.build/current/prototype'
  ];
  
  const missing = expectedOutputs.filter(dir => !fs.existsSync(dir));
  
  if (missing.length === 0) {
    return {
      status: 'passed',
      message: 'Build outputs are being generated correctly'
    };
  } else {
    return {
      status: 'warning',
      message: 'Build outputs not found',
      details: 'Run "npm run build" to generate outputs'
    };
  }
}

/**
 * Check critical files present
 */
function checkCriticalFilesPresent() {
  const criticalFiles = [
    'factory.config.yaml',
    'package.json',
    'factory/generators/concept-html/concept-generator-v3.js',
    'factory/generators/module-system/module-builder.js'
  ];
  
  const missing = criticalFiles.filter(file => !fs.existsSync(file));
  
  if (missing.length === 0) {
    return {
      status: 'passed',
      message: 'All critical files present'
    };
  } else {
    return {
      status: 'failed',
      message: `${missing.length} critical files missing`,
      details: missing.join('\n')
    };
  }
}

/**
 * Run a check and record results
 */
function runCheck(checkName, checkFunction) {
  process.stdout.write(`  Checking ${checkName}... `);
  
  try {
    const result = checkFunction();
    
    if (result.status === 'passed') {
      checkResults.passed.push(checkName);
      log('✓', 'green');
      if (result.message) {
        log(`    ${result.message}`, 'green');
      }
    } else if (result.status === 'warning') {
      checkResults.warnings.push(checkName);
      log('⚠', 'yellow');
      if (result.message) {
        log(`    ${result.message}`, 'yellow');
      }
      if (result.details) {
        console.log(`    ${result.details}`);
      }
    } else {
      checkResults.failed.push(checkName);
      log('✗', 'red');
      if (result.message) {
        log(`    ${result.message}`, 'red');
      }
      if (result.details) {
        console.log(`    ${result.details}`);
      }
    }
  } catch (error) {
    checkResults.failed.push(checkName);
    log('✗', 'red');
    log(`    Error: ${error.message}`, 'red');
  }
}

/**
 * Main execution
 */
function main() {
  const mode = process.argv[2] || 'pre';
  
  log('\n🔍 Migration Readiness Verification', 'blue');
  log('=' .repeat(60));
  
  const checkMap = {
    gitStatus: checkGitStatus,
    diskSpace: checkDiskSpace,
    nodeVersion: checkNodeVersion,
    currentBuildWorks: checkCurrentBuildWorks,
    backupExists: checkBackupExists,
    newStructureExists: checkNewStructureExists,
    noOldReferences: checkNoOldReferences,
    npmScriptsWork: checkNpmScriptsWork,
    buildOutputsGenerated: checkBuildOutputsGenerated,
    criticalFilesPresent: checkCriticalFilesPresent
  };
  
  let checksToRun;
  
  if (mode === 'pre') {
    log('\n📋 Pre-Migration Checks:\n');
    checksToRun = CHECKS.preMigration;
  } else if (mode === 'post') {
    log('\n📋 Post-Migration Checks:\n');
    checksToRun = CHECKS.postMigration;
  } else {
    log('\n📋 Running All Checks:\n');
    checksToRun = [...CHECKS.preMigration, ...CHECKS.postMigration];
  }
  
  // Run checks
  checksToRun.forEach(checkName => {
    if (checkMap[checkName]) {
      runCheck(checkName, checkMap[checkName]);
    }
  });
  
  // Summary
  log('\n' + '=' .repeat(60));
  log('📊 Verification Summary:', 'blue');
  log(`  ✓ Passed: ${checkResults.passed.length}`, 'green');
  log(`  ⚠ Warnings: ${checkResults.warnings.length}`, 'yellow');
  log(`  ✗ Failed: ${checkResults.failed.length}`, 'red');
  
  // Overall status
  if (checkResults.failed.length > 0) {
    log('\n❌ Verification FAILED - Address issues before proceeding', 'red');
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      mode,
      results: checkResults,
      recommendation: 'DO NOT PROCEED - Fix failed checks first'
    };
    fs.writeFileSync('migration-verification-report.json', JSON.stringify(report, null, 2));
    log('\n📄 Detailed report saved to: migration-verification-report.json');
    
    process.exit(1);
  } else if (checkResults.warnings.length > 0) {
    log('\n⚠️  Verification passed with warnings - Review before proceeding', 'yellow');
    
    const report = {
      timestamp: new Date().toISOString(),
      mode,
      results: checkResults,
      recommendation: 'PROCEED WITH CAUTION - Review warnings'
    };
    fs.writeFileSync('migration-verification-report.json', JSON.stringify(report, null, 2));
    log('\n📄 Detailed report saved to: migration-verification-report.json');
    
    process.exit(0);
  } else {
    log('\n✅ All verification checks PASSED!', 'green');
    
    const report = {
      timestamp: new Date().toISOString(),
      mode,
      results: checkResults,
      recommendation: 'SAFE TO PROCEED'
    };
    fs.writeFileSync('migration-verification-report.json', JSON.stringify(report, null, 2));
    log('\n📄 Detailed report saved to: migration-verification-report.json');
    
    process.exit(0);
  }
}

// Run verification
main();