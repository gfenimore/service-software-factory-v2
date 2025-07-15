#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Enhanced TypeScript type checking script
 * Provides detailed output and helpful error messages
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');
  const isCI = process.argv.includes('--ci');
  const includeTests = process.argv.includes('--include-tests');

  log('🔍 TypeScript Type Checker', colors.bright);
  log('════════════════════════════', colors.blue);

  if (isWatch) {
    log('👀 Starting in watch mode...', colors.yellow);
  }

  try {
    // Build TypeScript command
    const tscArgs = ['--noEmit'];
    
    if (isWatch) {
      tscArgs.push('--watch');
    }
    
    if (isCI) {
      tscArgs.push('--pretty', 'false');
    }

    if (includeTests) {
      tscArgs.push('--skipLibCheck', 'false');
    }

    log('⚡ Running TypeScript compiler...', colors.cyan);
    await runCommand('npx', ['tsc', ...tscArgs]);
    
    if (!isWatch) {
      log('✅ Type check passed!', colors.green);
      
      // Optional: Run additional checks
      if (!isCI) {
        log('\n📋 Running additional checks...', colors.blue);
        
        try {
          log('🧹 Running ESLint...', colors.cyan);
          await runCommand('npm', ['run', 'lint']);
          log('✅ ESLint passed!', colors.green);
        } catch (error) {
          log('⚠️  ESLint found issues', colors.yellow);
        }
      }
      
      log('\n🎉 All type checks completed successfully!', colors.green);
    }
    
  } catch (error) {
    log('\n❌ Type check failed!', colors.red);
    
    if (!isWatch && !isCI) {
      log('\n💡 Helpful commands:', colors.yellow);
      log('  npm run type-check:watch  - Run in watch mode', colors.reset);
      log('  npm run lint              - Run ESLint', colors.reset);
      log('  npm run lint -- --fix     - Auto-fix ESLint issues', colors.reset);
    }
    
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  log('\n👋 Goodbye!', colors.yellow);
  process.exit(0);
});

main().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
}); 