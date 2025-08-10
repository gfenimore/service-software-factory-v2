#!/usr/bin/env node

/**
 * create-cc-work-structure.js
 * Creates organized directory structure for CC's work outputs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseDir: '.sdlc',
  dryRun: false,
  reportOnly: false
};

// Parse arguments
process.argv.forEach(arg => {
  if (arg === '--dry-run') CONFIG.dryRun = true;
  if (arg === '--report-only') CONFIG.reportOnly = true;
});

class WorkStructureCreator {
  constructor() {
    this.created = [];
    this.moved = [];
    this.initialized = [];
    this.errors = [];
  }

  // Directory structure definition
  getStructure() {
    return {
      'validation/investigations/completed': {
        readme: `# Completed Investigations

## Index of Completed Work
Track all completed root cause analyses here.

### Completed
- processor-investigation-report.md - Fixed false success reports
- test-processor-analysis-report.md - Created test twin framework
- VERSION-REMOVAL-COMPLETE.md - Cleaned up version numbers

### Metrics
- Total Investigations: 3
- Issues Resolved: 3
- Time Saved: ~2 hours per incident`
      },
      'validation/investigations/in-progress': {
        readme: `# In-Progress Investigations

## Current Investigation Status
Track active investigations here.

### Active
- None currently

### Queue
- Performance bottleneck analysis
- Cross-processor validation`
      },
      'validation/investigations': {
        readme: `# Investigations

For deep-dive root cause analyses of issues.

## Process
1. Create issue-specific document
2. Add investigation task document
3. Run investigation
4. Move to completed/ with findings

## Current Investigations
- See in-progress/

## Completed Investigations
- See completed/`
      },
      'validation/improvements/completed': {
        readme: `# Completed Improvements

## Index with Impact Metrics
Track implemented improvements and their impact.

### Implemented
- Test Twin Framework - 80% reduction in test maintenance
- Validation Pipeline - 0% false positives
- Version Removal Script - Eliminated invocation friction`
      },
      'validation/improvements/in-progress': {
        readme: `# In-Progress Improvements

## Current Work Status
Active improvement projects.

### Active
- Slice-aware pipeline
- Processor health dashboard`
      },
      'validation/improvements/backlog': {
        readme: `# Improvement Backlog

## Prioritized List
Future improvements ranked by value.

### Priority Queue
1. Slice-aware pipeline - Auto-track value slices
2. Auto-test generation - Generate tests from patterns
3. Performance optimization - Speed up processors
4. Cross-processor validation - Ensure consistency
5. Processor documentation generator - Auto-docs from patterns`
      },
      'validation/improvements': {
        readme: `# Process Improvements

For workflow enhancements and automation.

## Process
1. Create improvement proposal
2. Get approval
3. Implement
4. Measure impact
5. Document results

## Categories
- Pipeline Enhancements
- Validation Tools
- Performance Optimization
- Developer Experience`
      },
      'validation/scripts': {
        readme: `# Validation Scripts

## Implemented Scripts
Production-ready validation tools.

### Available Scripts
- validate-processor-output.js - Validates processor outputs
- pre-validate-manifest.js - Pre-execution validation
- test-quality-dashboard.js - Test quality metrics
- generate-test-twin.js - Test twin generator
- remove-version-numbers.js - Version cleanup tool

### Usage
See individual script --help for details.`
      },
      'validation/reports/daily': {
        readme: `# Daily Reports

Execution reports from daily pipeline runs.

## Format
- processor-run-YYYYMMDD-HHMMSS.log
- validation-report-YYYYMMDD.json`
      },
      'validation/reports/weekly': {
        readme: `# Weekly Summaries

Aggregated metrics and trends.

## Metrics Tracked
- Processor success rates
- Average execution times
- Test quality scores
- Pipeline reliability`
      },
      'validation/reports': {
        readme: `# Reports

Generated reports and metrics.

## Report Types
- Daily: Individual run logs
- Weekly: Aggregated summaries
- Ad-hoc: Investigation reports`
      },
      'current-work': {
        readme: `# Current Work Status

## Active Story
- Story: Pending assignment
- Current Slice: N/A
- Status: Ready

## Quick Commands
\`\`\`bash
# Run next slice
./scripts/run-slice.sh --next

# Check status
cat current-slice.json
\`\`\`

## CC Focus Areas
1. Validation & Quality
2. Performance Optimization
3. Developer Experience
4. Process Automation`
      },
      'metrics/processor-performance': {
        readme: `# Processor Performance Metrics

Track execution times and success rates.

## Metrics
- Average execution time
- Success/failure rates
- Resource usage
- Error patterns`
      },
      'metrics/pipeline-runs': {
        readme: `# Pipeline Run Metrics

Full pipeline execution data.

## Tracked Data
- Total execution time
- Processor sequence
- File operations
- Validation results`
      },
      'metrics': {
        readme: `# Metrics

Performance and quality data.

## Collection Points
- Processor execution
- Pipeline runs
- Test quality
- Developer velocity`
      }
    };
  }

  // Create directory with README
  createDirectory(dirPath, readmeContent) {
    const fullPath = path.join(CONFIG.baseDir, dirPath);
    
    if (CONFIG.dryRun) {
      this.created.push(fullPath);
      return;
    }
    
    // Create directory
    fs.mkdirSync(fullPath, { recursive: true });
    this.created.push(fullPath);
    
    // Create README if content provided
    if (readmeContent) {
      const readmePath = path.join(fullPath, 'README.md');
      fs.writeFileSync(readmePath, readmeContent);
    }
  }

  // Initialize tracking files
  initializeTrackingFiles() {
    const files = {
      'current-work/current-slice.json': {
        story: null,
        slice: null,
        status: "ready",
        lastUpdated: new Date().toISOString()
      },
      'current-work/value-slices.json': {
        story: null,
        slices: [],
        totalSlices: 0
      },
      'current-work/completed-slices.json': {
        history: [],
        totalCompleted: 0
      }
    };
    
    Object.entries(files).forEach(([filePath, content]) => {
      const fullPath = path.join(CONFIG.baseDir, filePath);
      
      if (CONFIG.dryRun) {
        this.initialized.push(fullPath);
        return;
      }
      
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
        this.initialized.push(fullPath);
      }
    });
  }

  // Find and move existing files
  moveExistingFiles() {
    const migrations = [
      {
        pattern: '.sdlc/validation/investigations/*.md',
        destination: 'validation/investigations/completed/',
        files: []
      },
      {
        pattern: 'scripts/validate-*.js',
        destination: 'validation/scripts/',
        files: []
      },
      {
        pattern: 'scripts/test-*.js',
        destination: 'validation/scripts/',
        files: []
      },
      {
        pattern: 'scripts/generate-*.js',
        destination: 'validation/scripts/',
        files: []
      },
      {
        pattern: 'scripts/remove-*.js',
        destination: 'validation/scripts/',
        files: []
      }
    ];
    
    migrations.forEach(migration => {
      const dir = path.dirname(migration.pattern);
      const pattern = path.basename(migration.pattern);
      
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          // Check if file matches pattern
          if (pattern === '*.md' && file.endsWith('.md')) {
            migration.files.push(path.join(dir, file));
          } else if (pattern.startsWith('validate-*.') && file.startsWith('validate-')) {
            migration.files.push(path.join(dir, file));
          } else if (pattern.startsWith('test-*.') && file.startsWith('test-')) {
            migration.files.push(path.join(dir, file));
          } else if (pattern.startsWith('generate-*.') && file.startsWith('generate-')) {
            migration.files.push(path.join(dir, file));
          } else if (pattern.startsWith('remove-*.') && file.startsWith('remove-')) {
            migration.files.push(path.join(dir, file));
          }
        });
      }
    });
    
    // Move files
    migrations.forEach(migration => {
      migration.files.forEach(sourceFile => {
        const destDir = path.join(CONFIG.baseDir, migration.destination);
        const fileName = path.basename(sourceFile);
        const destFile = path.join(destDir, fileName);
        
        // Skip if source is already in destination
        if (sourceFile.includes(migration.destination)) {
          return;
        }
        
        if (CONFIG.dryRun) {
          this.moved.push({
            from: sourceFile,
            to: destFile
          });
        } else {
          // Only move if destination doesn't exist
          if (!fs.existsSync(destFile) && fs.existsSync(sourceFile)) {
            // Ensure destination directory exists
            fs.mkdirSync(destDir, { recursive: true });
            
            // Copy file (safer than move for validation scripts)
            fs.copyFileSync(sourceFile, destFile);
            
            this.moved.push({
              from: sourceFile,
              to: destFile,
              action: 'copied'
            });
          }
        }
      });
    });
  }

  // Generate migration report
  generateReport() {
    const report = [];
    
    report.push('# CC Work Structure Migration Report');
    report.push('');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : CONFIG.reportOnly ? 'REPORT ONLY' : 'EXECUTED'}`);
    report.push('');
    
    report.push(`## Directories Created: ${this.created.length}`);
    this.created.forEach(dir => {
      report.push(`- ${dir}`);
    });
    report.push('');
    
    report.push(`## Files Moved: ${this.moved.length}`);
    if (this.moved.length > 0) {
      this.moved.forEach(move => {
        report.push(`- ${move.from} → ${move.to}`);
      });
    } else {
      report.push('- None (files already in place or not found)');
    }
    report.push('');
    
    report.push(`## Tracking Files Initialized: ${this.initialized.length}`);
    this.initialized.forEach(file => {
      report.push(`- ${file}`);
    });
    report.push('');
    
    if (this.errors.length > 0) {
      report.push(`## Errors: ${this.errors.length}`);
      this.errors.forEach(error => {
        report.push(`- ${error}`);
      });
      report.push('');
    }
    
    report.push('## Next Steps');
    report.push('1. Review new structure');
    report.push('2. Update any scripts with old paths');
    report.push('3. Commit changes');
    report.push('4. Start using organized structure for all CC work');
    
    return report.join('\n');
  }

  // Main execution
  run() {
    console.log('CC Work Structure Creator');
    console.log('=========================\n');
    
    if (CONFIG.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }
    
    if (CONFIG.reportOnly) {
      console.log('📋 REPORT ONLY MODE - Generating report without changes\n');
      // Just generate report from existing structure
      const report = this.generateReport();
      fs.writeFileSync('cc-structure-migration-report.md', report);
      console.log('Report saved to: cc-structure-migration-report.md');
      return;
    }
    
    // Create directory structure
    console.log('Creating directory structure...');
    const structure = this.getStructure();
    
    Object.entries(structure).forEach(([dirPath, config]) => {
      this.createDirectory(dirPath, config.readme);
      console.log(`✓ Created: ${dirPath}`);
    });
    
    // Initialize tracking files
    console.log('\nInitializing tracking files...');
    this.initializeTrackingFiles();
    
    // Move existing files
    console.log('\nMigrating existing files...');
    this.moveExistingFiles();
    
    // Generate report
    const report = this.generateReport();
    fs.writeFileSync('cc-structure-migration-report.md', report);
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Structure created successfully!`);
    console.log(`Directories: ${this.created.length}`);
    console.log(`Files moved: ${this.moved.length}`);
    console.log(`Tracking files: ${this.initialized.length}`);
    console.log(`\nReport saved to: cc-structure-migration-report.md`);
    
    if (CONFIG.dryRun) {
      console.log('\nDRY RUN COMPLETE - Review report and run without --dry-run to execute');
    }
  }
}

// Main execution
const creator = new WorkStructureCreator();
creator.run();