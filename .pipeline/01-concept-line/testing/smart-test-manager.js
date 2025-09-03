#!/usr/bin/env node

/**
 * Smart Test Manager - High-volume incremental testing
 * Handles large volumes of test outputs with intelligent organization
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class SmartTestManager {
  constructor(options = {}) {
    this.baseDir = path.join(__dirname, '..');
    this.testingDir = path.join(__dirname);
    this.baselinesDir = path.join(this.testingDir, 'baselines');
    this.incrementalDir = path.join(this.testingDir, 'incremental');
    this.comparisonsDir = path.join(this.testingDir, 'comparisons');
    this.reportsDir = path.join(this.testingDir, 'reports');
    
    this.options = {
      maxIncrementalTests: 50,
      keepDays: 7,
      autoCleanup: true,
      ...options
    };
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.baselinesDir, this.incrementalDir, this.comparisonsDir, this.reportsDir]
      .forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
  }

  generateTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').slice(0, 19);
  }

  async runIncrementalTest(testName = 'pipeline-test') {
    console.log(`🧪 Starting incremental test: ${testName}`);
    
    const timestamp = this.generateTimestamp();
    const testDir = path.join(this.incrementalDir, timestamp);
    const outputsDir = path.join(testDir, 'outputs');
    const diffsDir = path.join(testDir, 'diffs');
    const metricsFile = path.join(testDir, 'metrics.json');
    
    // Create test directory structure
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(outputsDir, { recursive: true });
    fs.mkdirSync(diffsDir, { recursive: true });
    
    const testStart = Date.now();
    
    try {
      // Run the pipeline
      const pipelineResult = await this.executePipeline();
      
      // Copy outputs to test directory
      await this.captureOutputs(outputsDir);
      
      // Generate metrics
      const metrics = {
        testName,
        timestamp,
        duration: Date.now() - testStart,
        pipelineResult,
        status: 'completed',
        artifactCount: this.countArtifacts(outputsDir),
        qualityScore: pipelineResult.artifacts?.validation?.qualityScore || 0
      };
      
      fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
      
      // Compare with baseline
      const diffs = await this.compareWithBaseline(outputsDir, diffsDir);
      
      // Generate analysis
      const analysis = await this.analyzeResults(metrics, diffs);
      
      // Update latest symlink
      this.updateLatestLink(testDir);
      
      // Auto-cleanup if enabled
      if (this.options.autoCleanup) {
        await this.performCleanup();
      }
      
      // Generate summary
      this.displayTestSummary(analysis);
      
      return {
        testDir,
        metrics,
        diffs,
        analysis
      };
      
    } catch (error) {
      const errorMetrics = {
        testName,
        timestamp,
        duration: Date.now() - testStart,
        status: 'error',
        error: error.message
      };
      
      fs.writeFileSync(metricsFile, JSON.stringify(errorMetrics, null, 2));
      
      console.error(`❌ Test failed: ${error.message}`);
      throw error;
    }
  }

  async executePipeline() {
    const EnhancedPipeline = require('../core/enhanced-pipeline-orchestrator');
    const pipeline = new EnhancedPipeline({ 
      visual: false, // Disable visual output for testing
      dryRun: false  // Run actual pipeline
    });
    
    return await pipeline.run();
  }

  async captureOutputs(targetDir) {
    const pipelineOutputsDir = path.join(this.baseDir, 'outputs');
    
    if (fs.existsSync(pipelineOutputsDir)) {
      // Copy all outputs
      this.copyDirectory(pipelineOutputsDir, targetDir);
    }
    
    // Also capture visual outputs
    const visualDir = path.join(this.baseDir, 'models/live');
    if (fs.existsSync(visualDir)) {
      const visualTargetDir = path.join(targetDir, 'visual');
      fs.mkdirSync(visualTargetDir, { recursive: true });
      this.copyDirectory(visualDir, visualTargetDir);
    }
  }

  copyDirectory(source, target) {
    if (!fs.existsSync(source)) return;
    
    const files = fs.readdirSync(source);
    
    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        fs.mkdirSync(targetPath, { recursive: true });
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  countArtifacts(outputsDir) {
    let count = 0;
    
    const countInDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          countInDir(filePath);
        } else {
          count++;
        }
      });
    };
    
    countInDir(outputsDir);
    return count;
  }

  async compareWithBaseline(outputsDir, diffsDir) {
    if (!fs.existsSync(this.baselinesDir)) {
      console.log('⚠️  No baseline found - this will become the baseline');
      return { isFirstRun: true };
    }
    
    const baselineFiles = fs.readdirSync(this.baselinesDir);
    const latestBaseline = baselineFiles.find(file => file.endsWith('.json'));
    
    if (!latestBaseline) {
      console.log('⚠️  No baseline metrics found');
      return { isFirstRun: true };
    }
    
    const baselineData = JSON.parse(
      fs.readFileSync(path.join(this.baselinesDir, latestBaseline), 'utf8')
    );
    
    // Get current test data
    const currentFiles = this.getAllFiles(outputsDir);
    const baselineOutputs = path.join(this.baselinesDir, 'outputs');
    const baselineFiles_list = fs.existsSync(baselineOutputs) ? this.getAllFiles(baselineOutputs) : [];
    
    const diffs = {
      isFirstRun: false,
      filesAdded: [],
      filesRemoved: [],
      filesModified: [],
      identical: [],
      contentDiffs: {},
      summary: {}
    };
    
    // Compare file lists
    const currentPaths = currentFiles.map(f => f.relativePath);
    const baselinePaths = baselineFiles_list.map(f => f.relativePath);
    
    diffs.filesAdded = currentPaths.filter(p => !baselinePaths.includes(p));
    diffs.filesRemoved = baselinePaths.filter(p => !currentPaths.includes(p));
    
    // Compare file contents
    for (const currentFile of currentFiles) {
      const baselineFile = baselineFiles_list.find(f => f.relativePath === currentFile.relativePath);
      
      if (baselineFile) {
        const currentHash = this.getFileHash(currentFile.fullPath);
        const baselineHash = this.getFileHash(baselineFile.fullPath);
        
        if (currentHash === baselineHash) {
          diffs.identical.push(currentFile.relativePath);
        } else {
          diffs.filesModified.push(currentFile.relativePath);
          diffs.contentDiffs[currentFile.relativePath] = this.generateContentDiff(
            currentFile.fullPath,
            baselineFile.fullPath,
            path.join(diffsDir, `${currentFile.relativePath.replace(/[\/\\]/g, '_')}.diff`)
          );
        }
      }
    }
    
    // Generate summary
    diffs.summary = {
      totalFiles: currentFiles.length,
      identicalFiles: diffs.identical.length,
      modifiedFiles: diffs.filesModified.length,
      addedFiles: diffs.filesAdded.length,
      removedFiles: diffs.filesRemoved.length,
      changePercentage: ((diffs.filesModified.length + diffs.filesAdded.length + diffs.filesRemoved.length) / Math.max(currentFiles.length, 1) * 100).toFixed(1)
    };
    
    return diffs;
  }

  getAllFiles(dir, basePath = '') {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const entries = fs.readdirSync(dir);
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const relativePath = path.join(basePath, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, relativePath));
      } else {
        files.push({ fullPath, relativePath });
      }
    });
    
    return files;
  }

  getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  generateContentDiff(currentFile, baselineFile, diffOutputFile) {
    try {
      const currentContent = fs.readFileSync(currentFile, 'utf8');
      const baselineContent = fs.readFileSync(baselineFile, 'utf8');
      
      // Simple diff (enhance with proper diff library if needed)
      const diffContent = {
        type: 'content-diff',
        currentLength: currentContent.length,
        baselineLength: baselineContent.length,
        lengthDiff: currentContent.length - baselineContent.length,
        identical: currentContent === baselineContent
      };
      
      fs.writeFileSync(diffOutputFile, JSON.stringify(diffContent, null, 2));
      
      return diffContent;
      
    } catch (error) {
      return { type: 'error', message: error.message };
    }
  }

  async analyzeResults(metrics, diffs) {
    const analysis = {
      classification: 'unknown',
      severity: 'medium',
      recommendation: '',
      insights: []
    };
    
    // Classify the test result
    if (diffs.isFirstRun) {
      analysis.classification = 'baseline';
      analysis.severity = 'info';
      analysis.recommendation = 'This is your first test. Consider setting it as baseline if results look good.';
    } else if (diffs.summary.changePercentage === '0.0') {
      analysis.classification = 'identical';
      analysis.severity = 'success';
      analysis.recommendation = 'Perfect! No changes from baseline.';
    } else if (parseFloat(diffs.summary.changePercentage) < 10) {
      analysis.classification = 'minor-changes';
      analysis.severity = 'info';
      analysis.recommendation = 'Small changes detected. Review and consider updating baseline.';
    } else if (parseFloat(diffs.summary.changePercentage) < 50) {
      analysis.classification = 'moderate-changes';
      analysis.severity = 'warning';
      analysis.recommendation = 'Moderate changes detected. Investigate if this is expected.';
    } else {
      analysis.classification = 'major-changes';
      analysis.severity = 'error';
      analysis.recommendation = 'Major changes detected! This may indicate a problem.';
    }
    
    // Add insights
    if (metrics.qualityScore < 80) {
      analysis.insights.push('Quality score below 80% - consider investigating');
    }
    
    if (metrics.duration > 1000) {
      analysis.insights.push('Pipeline execution took over 1 second - performance concern');
    }
    
    if (diffs.filesAdded?.length > 0) {
      analysis.insights.push(`${diffs.filesAdded.length} new files generated`);
    }
    
    return analysis;
  }

  updateLatestLink(testDir) {
    const latestLink = path.join(this.incrementalDir, 'latest');
    
    // Remove existing symlink if it exists
    if (fs.existsSync(latestLink)) {
      fs.unlinkSync(latestLink);
    }
    
    // Create new symlink (or copy on Windows)
    try {
      if (process.platform === 'win32') {
        // On Windows, create a file with the path
        fs.writeFileSync(latestLink, testDir);
      } else {
        fs.symlinkSync(testDir, latestLink);
      }
    } catch (error) {
      console.warn('Could not create latest link:', error.message);
    }
  }

  async performCleanup() {
    const tests = fs.readdirSync(this.incrementalDir)
      .filter(name => name !== 'latest')
      .map(name => ({
        name,
        path: path.join(this.incrementalDir, name),
        mtime: fs.statSync(path.join(this.incrementalDir, name)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime); // Newest first
    
    // Keep only the most recent tests or those within time limit
    const cutoffDate = new Date(Date.now() - (this.options.keepDays * 24 * 60 * 60 * 1000));
    const testsToKeep = tests.slice(0, this.options.maxIncrementalTests);
    const testsToDelete = tests.slice(this.options.maxIncrementalTests)
      .filter(test => test.mtime < cutoffDate);
    
    if (testsToDelete.length > 0) {
      console.log(`🧹 Cleaning up ${testsToDelete.length} old tests...`);
      
      testsToDelete.forEach(test => {
        this.deleteDirectory(test.path);
      });
    }
  }

  deleteDirectory(dir) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  displayTestSummary(analysis) {
    const { classification, severity, recommendation, insights } = analysis;
    
    const severityIcons = {
      success: '✅',
      info: 'ℹ️ ',
      warning: '⚠️ ',
      error: '❌'
    };
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    console.log(`${severityIcons[severity]} Classification: ${classification}`);
    console.log(`💡 Recommendation: ${recommendation}`);
    
    if (insights.length > 0) {
      console.log('\n🔍 Insights:');
      insights.forEach(insight => console.log(`  • ${insight}`));
    }
    
    console.log('='.repeat(60));
  }

  async setBaseline(testDir) {
    console.log('📐 Setting new baseline...');
    
    // Copy test results to baseline
    const outputsSource = path.join(testDir, 'outputs');
    const outputsTarget = path.join(this.baselinesDir, 'outputs');
    
    if (fs.existsSync(outputsTarget)) {
      this.deleteDirectory(outputsTarget);
    }
    
    if (fs.existsSync(outputsSource)) {
      this.copyDirectory(outputsSource, outputsTarget);
    }
    
    // Copy metrics as baseline
    const metricsSource = path.join(testDir, 'metrics.json');
    const metricsTarget = path.join(this.baselinesDir, 'baseline-metrics.json');
    
    if (fs.existsSync(metricsSource)) {
      fs.copyFileSync(metricsSource, metricsTarget);
    }
    
    console.log('✅ Baseline updated');
  }

  generateDailySummary() {
    const today = new Date().toISOString().split('T')[0];
    const todaysTests = fs.readdirSync(this.incrementalDir)
      .filter(name => name.startsWith(today.replace(/-/g, '-')))
      .map(name => {
        try {
          const metricsPath = path.join(this.incrementalDir, name, 'metrics.json');
          if (fs.existsSync(metricsPath)) {
            return JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
          }
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
    
    if (todaysTests.length === 0) {
      console.log('📊 No tests run today');
      return;
    }
    
    const summary = {
      date: today,
      totalTests: todaysTests.length,
      successfulTests: todaysTests.filter(t => t.status === 'completed').length,
      failedTests: todaysTests.filter(t => t.status === 'error').length,
      avgDuration: Math.round(todaysTests.reduce((sum, t) => sum + t.duration, 0) / todaysTests.length),
      avgQualityScore: Math.round(todaysTests.reduce((sum, t) => sum + (t.qualityScore || 0), 0) / todaysTests.length)
    };
    
    const summaryPath = path.join(this.reportsDir, `daily-summary-${today}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('📊 Daily Summary:');
    console.log(`   Tests: ${summary.successfulTests}/${summary.totalTests} successful`);
    console.log(`   Avg Duration: ${summary.avgDuration}ms`);
    console.log(`   Avg Quality: ${summary.avgQualityScore}%`);
    
    return summary;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new SmartTestManager();
  
  switch (command) {
    case 'run':
      const testName = args[1] || 'manual-test';
      manager.runIncrementalTest(testName)
        .then(() => console.log('✅ Test completed'))
        .catch(error => {
          console.error('❌ Test failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'baseline':
      const testDir = args[1];
      if (!testDir) {
        console.error('❌ Please specify test directory to use as baseline');
        process.exit(1);
      }
      manager.setBaseline(testDir)
        .then(() => console.log('✅ Baseline set'))
        .catch(error => {
          console.error('❌ Failed to set baseline:', error.message);
          process.exit(1);
        });
      break;
      
    case 'summary':
      manager.generateDailySummary();
      break;
      
    case 'cleanup':
      manager.performCleanup()
        .then(() => console.log('✅ Cleanup completed'))
        .catch(error => {
          console.error('❌ Cleanup failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Smart Test Manager - High-volume incremental testing');
      console.log('');
      console.log('Commands:');
      console.log('  run [test-name]     - Run incremental test');
      console.log('  baseline <test-dir> - Set test as new baseline');
      console.log('  summary            - Generate daily summary');
      console.log('  cleanup            - Clean up old tests');
      console.log('');
      console.log('Examples:');
      console.log('  node smart-test-manager.js run feature-test');
      console.log('  node smart-test-manager.js baseline incremental/2025-01-27-10-30-00');
      console.log('  node smart-test-manager.js summary');
  }
}

module.exports = SmartTestManager;