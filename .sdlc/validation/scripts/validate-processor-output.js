#!/usr/bin/env node

/**
 * validate-processor-output.js
 * Validates that processor outputs match the manifest specification
 * Usage: node validate-processor-output.js [manifest-path]
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Default manifest path
const DEFAULT_MANIFEST = '.sdlc/05-backlog/A-accounts/master-view/processor-manifest.json';

class ProcessorValidator {
  constructor(manifestPath) {
    this.manifestPath = manifestPath;
    this.manifest = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  loadManifest() {
    try {
      if (!fs.existsSync(this.manifestPath)) {
        throw new Error(`Manifest not found: ${this.manifestPath}`);
      }
      
      const content = fs.readFileSync(this.manifestPath, 'utf8');
      this.manifest = JSON.parse(content);
      
      this.log(`✓ Loaded manifest: ${this.manifestPath}`, 'green');
      this.log(`  Story: ${this.manifest.story}, Slice: ${this.manifest.slice}`, 'blue');
      
      return true;
    } catch (error) {
      this.log(`✗ Failed to load manifest: ${error.message}`, 'red');
      return false;
    }
  }

  checkFileExists(filePath) {
    const fullPath = path.resolve(filePath);
    return fs.existsSync(fullPath);
  }

  findSimilarFiles(expectedPath) {
    const dir = path.dirname(expectedPath);
    const baseName = path.basename(expectedPath, path.extname(expectedPath));
    const ext = path.extname(expectedPath);
    
    if (!fs.existsSync(dir)) {
      return [];
    }
    
    const files = fs.readdirSync(dir);
    const similar = files.filter(file => {
      // Look for files with similar names
      return file.includes(baseName.toLowerCase()) || 
             file.includes(baseName.replace(/([A-Z])/g, '-$1').toLowerCase()) ||
             (file.endsWith(ext) && file.toLowerCase().includes(baseName.toLowerCase().substring(0, 5)));
    });
    
    return similar.map(f => path.join(dir, f));
  }

  validateProcessor(processor, index) {
    const result = {
      sequence: processor.sequence,
      processor: processor.processor,
      purpose: processor.purpose,
      status: 'unknown',
      messages: []
    };

    this.results.total++;

    // Check output file if specified
    if (processor.output) {
      if (this.checkFileExists(processor.output)) {
        result.status = 'passed';
        result.messages.push(`✓ Output file exists: ${processor.output}`);
        this.results.passed++;
      } else {
        result.status = 'failed';
        result.messages.push(`✗ Expected output file missing: ${processor.output}`);
        
        // Look for similar files
        const similar = this.findSimilarFiles(processor.output);
        if (similar.length > 0) {
          result.messages.push(`  Possible alternatives found:`);
          similar.forEach(file => {
            result.messages.push(`    - ${file}`);
          });
          result.status = 'warning';
          this.results.warnings++;
          this.results.failed--;
        } else {
          this.results.failed++;
        }
      }
    }

    // Check target file if specified (for modify operations)
    if (processor.target_file) {
      if (this.checkFileExists(processor.target_file)) {
        result.messages.push(`✓ Target file exists: ${processor.target_file}`);
        if (result.status === 'unknown') {
          result.status = 'passed';
          this.results.passed++;
        }
      } else {
        result.status = 'failed';
        result.messages.push(`✗ Target file missing: ${processor.target_file}`);
        this.results.failed++;
      }
    }

    // If no output or target specified, mark as info
    if (!processor.output && !processor.target_file) {
      result.status = 'info';
      result.messages.push(`ℹ No output/target file specified`);
      this.results.passed++;
    }

    this.results.details.push(result);
    return result;
  }

  validateAll() {
    this.log('\n=== Validating Processor Outputs ===\n', 'blue');
    
    this.manifest.processors.forEach((processor, index) => {
      const result = this.validateProcessor(processor, index);
      
      // Display result
      const statusColor = {
        'passed': 'green',
        'failed': 'red',
        'warning': 'yellow',
        'info': 'blue',
        'unknown': 'reset'
      }[result.status];
      
      this.log(`[${result.sequence}/${this.manifest.processors.length}] ${result.processor}`, statusColor);
      this.log(`  Purpose: ${result.purpose}`, 'reset');
      
      result.messages.forEach(msg => {
        const msgColor = msg.includes('✓') ? 'green' : 
                        msg.includes('✗') ? 'red' : 
                        msg.includes('ℹ') ? 'blue' : 'yellow';
        this.log(`  ${msg}`, msgColor);
      });
      
      console.log('');
    });
  }

  generateReport() {
    this.log('=== Validation Summary ===\n', 'blue');
    
    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    const status = this.results.failed === 0 ? 'PASSED' : 'FAILED';
    const statusColor = this.results.failed === 0 ? 'green' : 'red';
    
    this.log(`Total Processors: ${this.results.total}`, 'reset');
    this.log(`Passed: ${this.results.passed}`, 'green');
    this.log(`Failed: ${this.results.failed}`, 'red');
    this.log(`Warnings: ${this.results.warnings}`, 'yellow');
    this.log(`Pass Rate: ${passRate}%`, 'reset');
    this.log(`\nOverall Status: ${status}`, statusColor);
    
    // Generate detailed report file
    const reportPath = `validation-report-${Date.now()}.json`;
    const report = {
      timestamp: new Date().toISOString(),
      manifest: this.manifestPath,
      story: this.manifest.story,
      slice: this.manifest.slice,
      summary: this.results,
      details: this.results.details
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\nDetailed report saved to: ${reportPath}`, 'blue');
    
    return this.results.failed === 0;
  }

  run() {
    if (!this.loadManifest()) {
      process.exit(1);
    }
    
    this.validateAll();
    const success = this.generateReport();
    
    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  }
}

// Main execution
function main() {
  const manifestPath = process.argv[2] || DEFAULT_MANIFEST;
  
  console.log(colors.blue + '🔍 Processor Output Validator\n' + colors.reset);
  
  const validator = new ProcessorValidator(manifestPath);
  validator.run();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ProcessorValidator;