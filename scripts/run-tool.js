#!/usr/bin/env node

/**
 * Tool Runner - Configuration-based Tool Execution
 * 
 * Usage: node scripts/run-tool.js <tool-name> [args...]
 * Example: node scripts/run-tool.js concept-generator --preview
 * 
 * This wrapper resolves tool names to paths via pipeline-config.js,
 * eliminating hardcoded path dependencies.
 */

const config = require('../pipeline-config');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get tool name and arguments
const tool = process.argv[2];
const args = process.argv.slice(3);

// Validate input
if (!tool) {
  console.error('❌ Error: Tool name required');
  console.log('\nUsage: node scripts/run-tool.js <tool-name> [args...]');
  console.log('\nAvailable tools:');
  const tools = config.getAvailableTools();
  Object.keys(tools).forEach(name => {
    console.log(`  ${name.padEnd(20)} → ${tools[name]}`);
  });
  process.exit(1);
}

// Resolve tool path
const toolPath = config.getPath(tool);

// Validate tool exists
if (!config.validateTool(tool)) {
  console.error(`❌ Error: Tool '${tool}' not found at path: ${toolPath}`);
  console.log('\nAvailable tools:');
  const tools = config.getAvailableTools();
  Object.keys(tools).forEach(name => {
    const exists = config.validateTool(name);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${name.padEnd(20)} → ${tools[name]}`);
  });
  process.exit(1);
}

// Log what we're running
console.log(`🔧 Running: ${tool}`);
console.log(`📍 Path: ${toolPath}`);
if (args.length > 0) {
  console.log(`📋 Args: ${args.join(' ')}`);
}
console.log('─'.repeat(50));

// Set up environment with pipeline configuration
const env = {
  ...process.env,
  PIPELINE_CONFIG: JSON.stringify(config),
  PIPELINE_ROOT: config.PIPELINE_ROOT,
  BUILD_ROOT: config.BUILD_ROOT,
  // Legacy compatibility
  PIPELINE_LEGACY_MODE: config.isLegacyMode() ? 'true' : 'false'
};

// Spawn the tool
const child = spawn('node', [toolPath, ...args], {
  stdio: 'inherit',
  env: env,
  cwd: process.cwd()
});

// Handle errors
child.on('error', (error) => {
  console.error(`❌ Failed to start tool '${tool}':`, error.message);
  process.exit(1);
});

// Handle exit
child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`\n⚠️  Tool '${tool}' was killed with signal ${signal}`);
    process.exit(1);
  } else if (code === 0) {
    console.log(`\n✅ Tool '${tool}' completed successfully`);
  } else {
    console.log(`\n❌ Tool '${tool}' exited with code ${code}`);
  }
  process.exit(code);
});

// Handle interrupt
process.on('SIGINT', () => {
  console.log('\n⚠️  Interrupted by user');
  child.kill('SIGINT');
});