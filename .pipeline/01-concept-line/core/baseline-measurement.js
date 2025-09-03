#!/usr/bin/env node

/**
 * Baseline Performance Measurement System
 * Creates initial metrics for tracking improvement
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BaselineMeasurement {
  constructor() {
    this.timestamp = new Date().toISOString();
    this.results = {};
  }

  async measurePipelinePerformance() {
    console.log('📊 Measuring current pipeline performance...');
    
    const measurements = [];
    
    for (let i = 0; i < 5; i++) {
      console.log(`  Run ${i + 1}/5...`);
      
      const start = Date.now();
      try {
        execSync('node ../orchestrator/pipeline-orchestrator.js', {
          cwd: __dirname,
          stdio: 'pipe'
        });
        const duration = Date.now() - start;
        measurements.push({ success: true, duration });
      } catch (error) {
        const duration = Date.now() - start;
        measurements.push({ success: false, duration, error: error.message });
      }
    }
    
    this.results.pipelinePerformance = {
      measurements,
      avgDuration: measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length,
      successRate: measurements.filter(m => m.success).length / measurements.length,
      minDuration: Math.min(...measurements.map(m => m.duration)),
      maxDuration: Math.max(...measurements.map(m => m.duration))
    };
    
    return this.results.pipelinePerformance;
  }

  measureCodebaseSize() {
    console.log('📏 Measuring codebase size...');
    
    const dirs = [
      '../tools',
      '../configs', 
      '../models',
      '../outputs'
    ];
    
    const stats = {};
    
    dirs.forEach(dir => {
      const fullPath = path.join(__dirname, dir);
      if (fs.existsSync(fullPath)) {
        stats[dir] = this.getDirectoryStats(fullPath);
      }
    });
    
    this.results.codebaseSize = stats;
    return stats;
  }

  getDirectoryStats(dir) {
    let fileCount = 0;
    let totalSize = 0;
    let jsFiles = 0;
    let htmlFiles = 0;
    let jsonFiles = 0;
    
    const walkDir = (currentPath) => {
      try {
        const files = fs.readdirSync(currentPath);
        
        files.forEach(file => {
          const filePath = path.join(currentPath, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            if (!file.includes('node_modules')) {
              walkDir(filePath);
            }
          } else {
            fileCount++;
            totalSize += stat.size;
            
            const ext = path.extname(file);
            if (ext === '.js') jsFiles++;
            else if (ext === '.html') htmlFiles++;
            else if (ext === '.json') jsonFiles++;
          }
        });
      } catch (error) {
        console.warn(`Could not read directory: ${currentPath}`);
      }
    };
    
    walkDir(dir);
    
    return {
      fileCount,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      fileTypes: { jsFiles, htmlFiles, jsonFiles }
    };
  }

  measureOutputQuality() {
    console.log('🎯 Measuring output quality...');
    
    const outputDir = path.join(__dirname, '../outputs');
    
    if (!fs.existsSync(outputDir)) {
      this.results.outputQuality = { error: 'No outputs directory found' };
      return this.results.outputQuality;
    }
    
    const quality = {
      stages: {},
      totalArtifacts: 0,
      validHtml: 0,
      validJson: 0
    };
    
    // Check each stage directory
    for (let i = 1; i <= 6; i++) {
      const stageDir = path.join(outputDir, `stage${i}`);
      if (fs.existsSync(stageDir)) {
        const files = fs.readdirSync(stageDir);
        quality.stages[`stage${i}`] = {
          artifactCount: files.length,
          files: files
        };
        quality.totalArtifacts += files.length;
        
        // Basic validation
        files.forEach(file => {
          const filePath = path.join(stageDir, file);
          if (file.endsWith('.html')) {
            if (this.isValidHtml(filePath)) quality.validHtml++;
          } else if (file.endsWith('.json')) {
            if (this.isValidJson(filePath)) quality.validJson++;
          }
        });
      }
    }
    
    this.results.outputQuality = quality;
    return quality;
  }

  isValidHtml(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes('<html') && content.includes('</html>');
    } catch {
      return false;
    }
  }

  isValidJson(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  async generateReport() {
    console.log('📋 Generating baseline report...');
    
    const report = {
      timestamp: this.timestamp,
      version: '1.0.0',
      system: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      measurements: this.results
    };
    
    // Save JSON report
    const jsonPath = path.join(__dirname, `baseline-${this.timestamp.split('T')[0]}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    
    // Generate human-readable report
    const markdown = this.generateMarkdownReport(report);
    const mdPath = path.join(__dirname, `baseline-${this.timestamp.split('T')[0]}.md`);
    fs.writeFileSync(mdPath, markdown);
    
    console.log(`✅ Baseline report saved:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   Markdown: ${mdPath}`);
    
    return report;
  }

  generateMarkdownReport(report) {
    return `# Concept Line Baseline Measurement
## ${report.timestamp}

## Pipeline Performance
- **Average Duration**: ${report.measurements.pipelinePerformance?.avgDuration || 'N/A'}ms
- **Success Rate**: ${Math.round((report.measurements.pipelinePerformance?.successRate || 0) * 100)}%
- **Min/Max Duration**: ${report.measurements.pipelinePerformance?.minDuration || 'N/A'}ms / ${report.measurements.pipelinePerformance?.maxDuration || 'N/A'}ms

## Codebase Size
${Object.entries(report.measurements.codebaseSize || {}).map(([dir, stats]) => 
  `- **${dir}**: ${stats.fileCount} files (${stats.totalSizeMB}MB)`
).join('\n')}

## Output Quality
- **Total Artifacts**: ${report.measurements.outputQuality?.totalArtifacts || 0}
- **Valid HTML**: ${report.measurements.outputQuality?.validHtml || 0}
- **Valid JSON**: ${report.measurements.outputQuality?.validJson || 0}

## System Info
- **Node.js**: ${report.system.node}
- **Platform**: ${report.system.platform}
- **Architecture**: ${report.system.arch}

---
*Baseline measurement for Concept Line consolidation project*
`;
  }

  async run() {
    console.log('🚀 Starting Concept Line Baseline Measurement');
    console.log('=' .repeat(50));
    
    try {
      await this.measurePipelinePerformance();
      this.measureCodebaseSize();
      this.measureOutputQuality();
      
      const report = await this.generateReport();
      
      console.log('\n🎯 Baseline Summary:');
      console.log(`   Pipeline: ${Math.round(report.measurements.pipelinePerformance.avgDuration)}ms avg`);
      console.log(`   Success Rate: ${Math.round(report.measurements.pipelinePerformance.successRate * 100)}%`);
      console.log(`   Total Artifacts: ${report.measurements.outputQuality.totalArtifacts}`);
      
      return report;
    } catch (error) {
      console.error('❌ Error during baseline measurement:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const baseline = new BaselineMeasurement();
  baseline.run().catch(console.error);
}

module.exports = BaselineMeasurement;