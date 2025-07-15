#!/usr/bin/env node

/**
 * Verification script for TypeScript automation setup
 * Checks that all components are properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, colors.green);
    return true;
  } else {
    log(`❌ ${description}`, colors.red);
    return false;
  }
}

function checkPackageScript(scriptName, expectedContent) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const script = packageJson.scripts[scriptName];
    
    if (script && script.includes(expectedContent)) {
      log(`✅ package.json script: ${scriptName}`, colors.green);
      return true;
    } else {
      log(`❌ package.json script missing or incorrect: ${scriptName}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, colors.red);
    return false;
  }
}

function checkDevDependency(depName) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const devDeps = packageJson.devDependencies || {};
    
    if (devDeps[depName]) {
      log(`✅ Dev dependency: ${depName}@${devDeps[depName]}`, colors.green);
      return true;
    } else {
      log(`❌ Missing dev dependency: ${depName}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error checking dependencies: ${error.message}`, colors.red);
    return false;
  }
}

function runCommand(command, description) {
  try {
    log(`🔄 Testing: ${description}`, colors.cyan);
    const output = execSync(command, { 
      stdio: 'pipe', 
      timeout: 30000,
      encoding: 'utf8'
    });
    log(`✅ ${description}`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, colors.red);
    return false;
  }
}

async function main() {
  log('🔍 TypeScript Automation Setup Verification', colors.bright);
  log('═══════════════════════════════════════════', colors.blue);
  
  let totalChecks = 0;
  let passedChecks = 0;
  
  const checks = [
    // Configuration files
    () => checkFile('tsconfig.json', 'TypeScript configuration exists'),
    () => checkFile('.prettierrc', 'Prettier configuration exists'),
    () => checkFile('.prettierignore', 'Prettier ignore file exists'),
    () => checkFile('next.config.js', 'Next.js configuration exists'),
    
    // Husky setup
    () => checkFile('.husky/pre-commit', 'Husky pre-commit hook exists'),
    
    // GitHub Actions
    () => checkFile('.github/workflows/typescript-check.yml', 'GitHub Actions workflow exists'),
    
    // Scripts
    () => checkFile('scripts/type-check.js', 'Enhanced type checking script exists'),
    () => checkFile('scripts/verify-typescript-setup.js', 'Verification script exists'),
    
    // Documentation
    () => checkFile('docs/typescript-automation-setup.md', 'Setup documentation exists'),
    
    // Package.json scripts
    () => checkPackageScript('type-check', 'tsc --noEmit'),
    () => checkPackageScript('type-check:watch', '--watch'),
    () => checkPackageScript('type-check:ci', '--pretty false'),
    () => checkPackageScript('pre-commit', 'type-check'),
    () => checkPackageScript('prepare', 'husky install'),
    
    // Dependencies
    () => checkDevDependency('husky'),
    () => checkDevDependency('lint-staged'),
    () => checkDevDependency('prettier'),
    () => checkDevDependency('typescript'),
    
    // Functional tests
    () => runCommand('npm run type-check', 'TypeScript type checking'),
    () => runCommand('npx tsc --version', 'TypeScript compiler available'),
    () => runCommand('npx prettier --version', 'Prettier available'),
    () => runCommand('npx eslint --version', 'ESLint available'),
  ];
  
  log('\n📋 Running checks...\n', colors.blue);
  
  for (const check of checks) {
    totalChecks++;
    if (check()) {
      passedChecks++;
    }
  }
  
  log('\n📊 Results', colors.blue);
  log('═══════════', colors.blue);
  log(`Total checks: ${totalChecks}`);
  log(`Passed: ${passedChecks}`, passedChecks === totalChecks ? colors.green : colors.yellow);
  log(`Failed: ${totalChecks - passedChecks}`, totalChecks - passedChecks === 0 ? colors.green : colors.red);
  
  const successRate = Math.round((passedChecks / totalChecks) * 100);
  log(`Success rate: ${successRate}%`, successRate === 100 ? colors.green : colors.yellow);
  
  if (passedChecks === totalChecks) {
    log('\n🎉 All checks passed! TypeScript automation is properly configured.', colors.green);
    log('\n📋 Next steps:', colors.blue);
    log('1. Run `npm install` to install any missing dependencies');
    log('2. Run `npm run prepare` to initialize husky');
    log('3. Test the pre-commit hook by making a commit');
    log('4. Create a PR to test GitHub Actions workflow');
  } else {
    log('\n⚠️  Some checks failed. Please review the setup.', colors.yellow);
    log('\n🔧 To fix issues:', colors.blue);
    log('1. Install missing dependencies: `npm install --save-dev [dependency]`');
    log('2. Run setup commands from docs/typescript-automation-setup.md');
    log('3. Re-run this verification script');
  }
  
  process.exit(passedChecks === totalChecks ? 0 : 1);
}

main().catch((error) => {
  log(`\n💥 Verification failed: ${error.message}`, colors.red);
  process.exit(1);
}); 