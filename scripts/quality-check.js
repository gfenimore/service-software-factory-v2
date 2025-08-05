#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

console.log('🔍 Running Quality Checks...\n');

const checks = [
  { 
    name: 'TypeScript', 
    cmd: 'npm run type-check',
    description: 'Checking TypeScript compilation...'
  },
  { 
    name: 'ESLint', 
    cmd: 'npm run lint',
    description: 'Running ESLint...'
  },
  { 
    name: 'Tests', 
    cmd: 'npm test -- --watchAll=false --passWithNoTests',
    description: 'Running tests...'
  },
  { 
    name: 'Build', 
    cmd: 'npm run build',
    description: 'Building application...'
  }
];

let allPassed = true;
const results = [];

// Run each check
checks.forEach(({ name, cmd, description }) => {
  console.log(`\n📋 ${description}`);
  
  try {
    // Run command and capture output
    execSync(cmd, { stdio: 'inherit' });
    
    console.log(`✅ ${name}: PASS`);
    results.push({ name, status: 'PASS' });
  } catch {
    console.log(`❌ ${name}: FAIL`);
    results.push({ name, status: 'FAIL' });
    allPassed = false;
  }
});

// Summary report
console.log('\n' + '='.repeat(50));
console.log('📊 QUALITY CHECK SUMMARY');
console.log('='.repeat(50));

results.forEach(({ name, status }) => {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${name}: ${status}`);
});

console.log('='.repeat(50));

if (!allPassed) {
  console.log('\n❌ Quality checks failed. Please fix issues before proceeding.');
  console.log('💡 Tip: Run each command individually for detailed error messages.\n');
  process.exit(1);
} else {
  console.log('\n✅ All quality checks passed! Ready to proceed.\n');
  process.exit(0);
}