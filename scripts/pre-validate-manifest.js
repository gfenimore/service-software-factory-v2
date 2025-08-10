#!/usr/bin/env node

/**
 * pre-validate-manifest.js
 * Pre-execution validation to ensure manifest is achievable
 * Checks for conflicts, existing files, and path issues
 */

const fs = require('fs');
const path = require('path');

// Load path configuration
const loadPathConfig = () => {
  const configPath = '.sdlc/config/path-config.json';
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  // Fallback defaults
  return {
    paths: {
      manifestPath: '.sdlc/05-backlog/A-accounts/master-view/'
    }
  };
};

const config = loadPathConfig();

class ManifestPreValidator {
  constructor(manifestPath) {
    this.manifestPath = manifestPath;
    this.manifest = null;
    this.issues = {
      errors: [],
      warnings: [],
      info: []
    };
  }

  log(level, message) {
    const symbols = {
      error: '✗',
      warning: '⚠',
      info: 'ℹ',
      success: '✓'
    };
    
    const colors = {
      error: '\x1b[31m',
      warning: '\x1b[33m',
      info: '\x1b[34m',
      success: '\x1b[32m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[level]}${symbols[level]} ${message}${colors.reset}`);
    
    if (level !== 'success') {
      this.issues[level + 's']?.push(message);
    }
  }

  loadManifest() {
    try {
      const content = fs.readFileSync(this.manifestPath, 'utf8');
      this.manifest = JSON.parse(content);
      this.log('success', `Loaded manifest: ${this.manifestPath}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to load manifest: ${error.message}`);
      return false;
    }
  }

  checkPathConflicts() {
    console.log('\n=== Checking for Path Conflicts ===\n');
    
    const outputPaths = new Map();
    
    this.manifest.processors.forEach((proc, index) => {
      if (proc.output) {
        if (outputPaths.has(proc.output)) {
          const existing = outputPaths.get(proc.output);
          this.log('error', 
            `Duplicate output path "${proc.output}" in processors ${existing.sequence} and ${proc.sequence}`
          );
        } else {
          outputPaths.set(proc.output, proc);
        }
      }
    });
    
    if (outputPaths.size > 0) {
      this.log('info', `${outputPaths.size} unique output paths defined`);
    }
  }

  checkExistingFiles() {
    console.log('\n=== Checking Existing Files ===\n');
    
    const filesToCreate = [];
    const filesToModify = [];
    
    this.manifest.processors.forEach(proc => {
      if (proc.output) {
        filesToCreate.push({
          path: proc.output,
          processor: proc.processor,
          sequence: proc.sequence
        });
      }
      
      if (proc.target_file) {
        filesToModify.push({
          path: proc.target_file,
          processor: proc.processor,
          sequence: proc.sequence
        });
      }
    });
    
    // Check files to create
    filesToCreate.forEach(file => {
      if (fs.existsSync(file.path)) {
        this.log('warning', 
          `File already exists: ${file.path} (processor ${file.sequence} may overwrite)`
        );
        
        // Check if file is empty
        const stats = fs.statSync(file.path);
        if (stats.size === 0) {
          this.log('info', `  File is empty (safe to overwrite)`);
        } else {
          this.log('info', `  File has ${stats.size} bytes of content`);
        }
      } else {
        // Check if parent directory exists
        const dir = path.dirname(file.path);
        if (!fs.existsSync(dir)) {
          this.log('warning', `Parent directory doesn't exist: ${dir}`);
        }
      }
    });
    
    // Check files to modify
    filesToModify.forEach(file => {
      if (!fs.existsSync(file.path)) {
        this.log('error', 
          `Target file doesn't exist: ${file.path} (processor ${file.sequence} will fail)`
        );
      }
    });
  }

  checkInputFiles() {
    console.log('\n=== Checking Input Files ===\n');
    
    const inputFiles = new Set();
    
    this.manifest.processors.forEach(proc => {
      if (proc.input && proc.input !== 'null') {
        inputFiles.add(proc.input);
      }
    });
    
    inputFiles.forEach(inputFile => {
      if (!fs.existsSync(inputFile)) {
        this.log('error', `Input file not found: ${inputFile}`);
      } else {
        const stats = fs.statSync(inputFile);
        if (stats.size === 0) {
          this.log('warning', `Input file is empty: ${inputFile}`);
        } else {
          this.log('success', `Input file exists: ${inputFile} (${stats.size} bytes)`);
        }
      }
    });
  }

  checkDependencies() {
    console.log('\n=== Checking Dependencies ===\n');
    
    // Check for processors that depend on outputs from previous processors
    const outputsCreated = new Set();
    
    this.manifest.processors.forEach(proc => {
      // Check if this processor needs something from a previous one
      if (proc.target_file) {
        const isFromPreviousProcessor = Array.from(outputsCreated).some(
          output => output === proc.target_file
        );
        
        if (isFromPreviousProcessor) {
          this.log('info', 
            `Processor ${proc.sequence} depends on output from earlier processor`
          );
        }
      }
      
      // Add this processor's output to the set
      if (proc.output) {
        outputsCreated.add(proc.output);
      }
    });
  }

  checkNamingConsistency() {
    console.log('\n=== Checking Naming Consistency ===\n');
    
    // Extract expected patterns from outputs
    const typeFiles = [];
    const componentFiles = [];
    const hookFiles = [];
    
    this.manifest.processors.forEach(proc => {
      if (proc.output) {
        if (proc.output.includes('/types/')) {
          typeFiles.push(proc.output);
        } else if (proc.output.includes('/components/')) {
          componentFiles.push(proc.output);
        } else if (proc.output.includes('/hooks/')) {
          hookFiles.push(proc.output);
        }
      }
    });
    
    // Check type files follow pattern
    typeFiles.forEach(file => {
      const fileName = path.basename(file);
      if (!fileName.endsWith('.types.ts')) {
        this.log('warning', `Type file doesn't follow naming convention: ${file}`);
        this.log('info', `  Expected pattern: *.types.ts`);
      }
    });
    
    // Check hook files follow pattern
    hookFiles.forEach(file => {
      const fileName = path.basename(file);
      if (!fileName.startsWith('use')) {
        this.log('warning', `Hook file doesn't follow naming convention: ${file}`);
        this.log('info', `  Expected pattern: use*.ts`);
      }
    });
  }

  suggestAlternatives() {
    console.log('\n=== Suggestions ===\n');
    
    // Look for existing similar files
    this.manifest.processors.forEach(proc => {
      if (proc.output && !fs.existsSync(proc.output)) {
        const dir = path.dirname(proc.output);
        const baseName = path.basename(proc.output, path.extname(proc.output));
        
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const similar = files.filter(file => {
            const lowerFile = file.toLowerCase();
            const lowerBase = baseName.toLowerCase();
            return lowerFile.includes(lowerBase.substring(0, 5)) ||
                   file.includes(baseName.replace(/([A-Z])/g, '-$1').toLowerCase());
          });
          
          if (similar.length > 0) {
            this.log('info', `Similar files exist for ${proc.output}:`);
            similar.forEach(file => {
              console.log(`    - ${path.join(dir, file)}`);
            });
          }
        }
      }
    });
  }

  generateReport() {
    console.log('\n=== Pre-Validation Report ===\n');
    
    const hasErrors = this.issues.errors.length > 0;
    const hasWarnings = this.issues.warnings.length > 0;
    
    console.log(`Errors: ${this.issues.errors.length}`);
    console.log(`Warnings: ${this.issues.warnings.length}`);
    console.log(`Info: ${this.issues.info.length}`);
    
    if (hasErrors) {
      console.log('\n\x1b[31m✗ Manifest has critical issues that will cause failures\x1b[0m');
      console.log('\nRecommendations:');
      console.log('1. Fix missing input files');
      console.log('2. Ensure target files exist for modification');
      console.log('3. Resolve path conflicts');
      
      return false;
    } else if (hasWarnings) {
      console.log('\n\x1b[33m⚠ Manifest has warnings but can proceed\x1b[0m');
      console.log('\nConsiderations:');
      console.log('1. Review files that will be overwritten');
      console.log('2. Check naming conventions');
      console.log('3. Verify parent directories exist');
      
      return true;
    } else {
      console.log('\n\x1b[32m✓ Manifest validation passed with no issues\x1b[0m');
      return true;
    }
  }

  run() {
    if (!this.loadManifest()) {
      return false;
    }
    
    this.checkInputFiles();
    this.checkPathConflicts();
    this.checkExistingFiles();
    this.checkDependencies();
    this.checkNamingConsistency();
    this.suggestAlternatives();
    
    return this.generateReport();
  }
}

// Main execution
function main() {
  const manifestPath = process.argv[2] || path.join(config.paths.manifestPath, 'processor-manifest.json');
  
  console.log('\x1b[34m🔍 Manifest Pre-Validation Tool\x1b[0m');
  console.log(`Analyzing: ${manifestPath}\n`);
  
  const validator = new ManifestPreValidator(manifestPath);
  const isValid = validator.run();
  
  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = ManifestPreValidator;