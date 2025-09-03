#!/usr/bin/env node

/**
 * Unified Concept Line Entry Point
 * Single command to rule them all: npm run concept-line
 */

const path = require('path');
const { execSync } = require('child_process');
const EnhancedPipeline = require('./core/enhanced-pipeline-orchestrator');
const SmartTestManager = require('./testing/smart-test-manager');
const BaselineMeasurement = require('./core/baseline-measurement');

class ConceptLineController {
  constructor() {
    this.commands = {
      'run': this.runPipeline.bind(this),
      'test': this.runTest.bind(this),
      'baseline': this.createBaseline.bind(this),
      'measure': this.measurePerformance.bind(this),
      'visual': this.openVisual.bind(this),
      'summary': this.showSummary.bind(this),
      'help': this.showHelp.bind(this)
    };
  }

  async execute(args) {
    const command = args[0] || 'run';
    const options = this.parseOptions(args.slice(1));
    
    console.log('🏭 Concept Line - Production Ready Pipeline');
    console.log('=' .repeat(50));
    
    if (!this.commands[command]) {
      console.error(`❌ Unknown command: ${command}`);
      this.showHelp();
      process.exit(1);
    }
    
    try {
      await this.commands[command](options);
    } catch (error) {
      console.error(`❌ Command failed: ${error.message}`);
      process.exit(1);
    }
  }

  parseOptions(args) {
    const options = {
      visual: true,
      dryRun: false,
      verbose: false,
      test: false
    };
    
    args.forEach(arg => {
      switch (arg) {
        case '--dry-run':
          options.dryRun = true;
          break;
        case '--no-visual':
          options.visual = false;
          break;
        case '--verbose':
          options.verbose = true;
          break;
        case '--test':
          options.test = true;
          break;
        default:
          if (arg.startsWith('--')) {
            console.warn(`Unknown option: ${arg}`);
          }
      }
    });
    
    return options;
  }

  async runPipeline(options = {}) {
    console.log('🚀 Running Concept Line Pipeline...');
    
    const startTime = Date.now();
    
    // Create pipeline instance
    const pipeline = new EnhancedPipeline({
      visual: options.visual,
      dryRun: options.dryRun,
      verbose: options.verbose
    });
    
    try {
      // Execute pipeline
      const result = await pipeline.run();
      
      const duration = Date.now() - startTime;
      
      // Display results
      console.log('\n🎉 PIPELINE COMPLETED SUCCESSFULLY!');
      console.log(`⏱️  Total Duration: ${duration}ms`);
      console.log(`📊 Quality Score: ${result.artifacts?.validation?.qualityScore || 'N/A'}%`);
      console.log(`📁 Entities: ${result.artifacts?.entities?.length || 0}`);
      console.log(`🎨 Components: ${result.artifacts?.components?.length || 0}`);
      
      if (options.visual && result.visualSummary) {
        console.log('\n📊 Visual Outputs:');
        console.log('  🌐 HTML: models/live/pipeline-visualization.html');
        console.log('  📈 Mermaid: models/live/pipeline-flow.mmd');
      }
      
      // Suggest next actions
      console.log('\n💡 Next Actions:');
      if (options.dryRun) {
        console.log('  • Run without --dry-run to generate actual outputs');
      } else {
        console.log('  • Open visual dashboard: concept-line visual');
        console.log('  • Run tests: concept-line test');
        console.log('  • View outputs: ls outputs/');
      }
      
      return result;
      
    } catch (error) {
      console.error('\n❌ Pipeline execution failed!');
      console.error(`Error: ${error.message}`);
      
      console.log('\n🔧 Troubleshooting:');
      console.log('  • Check pipeline logs above for specific error');
      console.log('  • Try with --dry-run to test without side effects');
      console.log('  • Run: concept-line measure to check system health');
      
      throw error;
    }
  }

  async runTest(options = {}) {
    console.log('🧪 Running Smart Test...');
    
    const testName = options.name || `test-${Date.now()}`;
    const manager = new SmartTestManager();
    
    try {
      const result = await manager.runIncrementalTest(testName);
      
      console.log('\n✅ TEST COMPLETED');
      console.log(`📁 Test Directory: ${path.basename(result.testDir)}`);
      console.log(`⏱️  Duration: ${result.metrics.duration}ms`);
      console.log(`📊 Quality Score: ${result.metrics.qualityScore}%`);
      
      if (result.analysis) {
        console.log(`🔍 Classification: ${result.analysis.classification}`);
        console.log(`💡 Recommendation: ${result.analysis.recommendation}`);
      }
      
      console.log('\n💡 Next Actions:');
      console.log('  • Set as baseline: concept-line baseline');
      console.log('  • View daily summary: concept-line summary');
      console.log('  • Run another test: concept-line test');
      
      return result;
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      throw error;
    }
  }

  async createBaseline(options = {}) {
    console.log('📐 Setting New Baseline...');
    
    const manager = new SmartTestManager();
    
    // Find latest test
    const testingDir = path.join(__dirname, 'testing/incremental');
    const latestPath = path.join(testingDir, 'latest');
    
    let testDir;
    if (require('fs').existsSync(latestPath)) {
      try {
        testDir = require('fs').readFileSync(latestPath, 'utf8').trim();
      } catch (error) {
        // Try to find most recent test directory
        const dirs = require('fs').readdirSync(testingDir)
          .filter(name => name !== 'latest')
          .sort()
          .reverse();
        
        if (dirs.length > 0) {
          testDir = path.join(testingDir, dirs[0]);
        }
      }
    }
    
    if (!testDir) {
      console.error('❌ No test found to use as baseline');
      console.log('💡 Run a test first: concept-line test');
      return;
    }
    
    await manager.setBaseline(testDir);
    
    console.log('✅ Baseline updated successfully!');
    console.log(`📁 Used test: ${path.basename(testDir)}`);
    
    console.log('\n💡 Next Actions:');
    console.log('  • Run new tests to compare against this baseline');
    console.log('  • View baseline files: ls testing/baselines/');
  }

  async measurePerformance(options = {}) {
    console.log('📊 Measuring Pipeline Performance...');
    
    const baseline = new BaselineMeasurement();
    const report = await baseline.run();
    
    console.log('\n📈 PERFORMANCE REPORT');
    console.log('='.repeat(30));
    
    const perf = report.measurements.pipelinePerformance;
    if (perf) {
      console.log(`Average Duration: ${Math.round(perf.avgDuration)}ms`);
      console.log(`Success Rate: ${Math.round(perf.successRate * 100)}%`);
      console.log(`Performance Range: ${perf.minDuration}ms - ${perf.maxDuration}ms`);
    }
    
    const quality = report.measurements.outputQuality;
    if (quality) {
      console.log(`Total Artifacts: ${quality.totalArtifacts}`);
      console.log(`Valid HTML: ${quality.validHtml}`);
      console.log(`Valid JSON: ${quality.validJson}`);
    }
    
    console.log('\n💡 Next Actions:');
    console.log('  • View detailed report: cat core/baseline-*.md');
    console.log('  • Compare with future measurements');
    console.log('  • Investigate any performance issues');
    
    return report;
  }

  async openVisual(options = {}) {
    console.log('🌐 Opening Visual Dashboard...');
    
    const visualPath = path.join(__dirname, 'models/live/pipeline-visualization.html');
    
    if (!require('fs').existsSync(visualPath)) {
      console.log('⚠️  Visual dashboard not found');
      console.log('💡 Run the pipeline first: concept-line run');
      return;
    }
    
    try {
      // Try to open in browser
      const openCommand = process.platform === 'win32' ? 'start' : 
                         process.platform === 'darwin' ? 'open' : 'xdg-open';
      
      execSync(`${openCommand} "${visualPath}"`, { stdio: 'ignore' });
      console.log('✅ Visual dashboard opened in browser');
      
    } catch (error) {
      console.log('⚠️  Could not automatically open browser');
      console.log(`📁 Manual path: ${visualPath}`);
    }
    
    // Also show other visual outputs
    console.log('\n📊 Available Visual Outputs:');
    console.log(`  🌐 HTML Dashboard: ${visualPath}`);
    console.log(`  📈 Mermaid Diagram: models/live/pipeline-flow.mmd`);
    console.log(`  📄 JSON Model: models/live/latest-execution.json`);
  }

  async showSummary(options = {}) {
    console.log('📊 Concept Line Summary...');
    
    try {
      const manager = new SmartTestManager();
      const dailySummary = manager.generateDailySummary();
      
      // Also show latest pipeline status
      const latestModel = path.join(__dirname, 'models/live/latest-execution.json');
      if (require('fs').existsSync(latestModel)) {
        const model = JSON.parse(require('fs').readFileSync(latestModel, 'utf8'));
        
        console.log('\n📈 Latest Pipeline Execution:');
        console.log(`  Duration: ${model.totalDuration}ms`);
        console.log(`  Stages: ${model.successCount}/${model.stageCount} successful`);
        console.log(`  Success Rate: ${Math.round(model.successRate * 100)}%`);
      }
      
      // Show directory status
      const outputsDir = path.join(__dirname, 'outputs');
      if (require('fs').existsSync(outputsDir)) {
        const stages = require('fs').readdirSync(outputsDir);
        console.log(`\n📁 Output Stages: ${stages.length} stages with artifacts`);
      }
      
    } catch (error) {
      console.warn('⚠️  Could not generate complete summary:', error.message);
    }
    
    console.log('\n💡 Available Commands:');
    console.log('  • concept-line run     - Execute pipeline');
    console.log('  • concept-line test    - Run smart test');
    console.log('  • concept-line visual  - Open dashboard');
    console.log('  • concept-line measure - Performance check');
  }

  showHelp() {
    console.log(`
🏭 CONCEPT LINE - Unified Pipeline Controller

COMMANDS:
  run [options]     Execute the complete pipeline
  test [options]    Run smart incremental test
  baseline         Set latest test as baseline
  measure          Measure pipeline performance  
  visual           Open visual dashboard
  summary          Show system summary
  help             Show this help

OPTIONS:
  --dry-run        Execute without generating outputs
  --no-visual      Disable visual tracking
  --verbose        Detailed output
  
EXAMPLES:
  concept-line                    # Run complete pipeline
  concept-line run --dry-run      # Test pipeline without outputs
  concept-line test              # Run incremental test
  concept-line visual            # Open browser dashboard
  concept-line measure           # Performance baseline
  
WORKFLOW:
  1. concept-line measure        # Check system health
  2. concept-line run           # Execute pipeline  
  3. concept-line visual        # Review results
  4. concept-line test          # Test changes
  5. concept-line baseline      # Set new standard

📚 Documentation: Check docs/ directory for detailed guides
🐛 Issues: Review logs and use --verbose for troubleshooting
    `);
  }
}

// CLI execution
if (require.main === module) {
  const controller = new ConceptLineController();
  const args = process.argv.slice(2);
  
  controller.execute(args).catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = ConceptLineController;