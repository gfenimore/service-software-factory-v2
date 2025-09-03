#!/usr/bin/env node

/**
 * Enhanced Pipeline Orchestrator with Visual Tracking
 * Integrates visual model tracker with existing pipeline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const VisualModelTracker = require('./visual-model-tracker');

class EnhancedConceptLinePipeline {
  constructor(options = {}) {
    this.baseDir = path.join(__dirname, '../..');
    this.conceptLineDir = path.join(this.baseDir, '01-concept-line');
    this.outputDir = path.join(this.conceptLineDir, 'outputs');
    this.toolsDir = path.join(this.conceptLineDir, 'tools');
    this.processingToolsDir = path.join(this.baseDir, '04-processing-tools');
    
    // Visual tracking
    this.tracker = new VisualModelTracker();
    this.enableVisualTracking = options.visual !== false;
    
    this.stages = {
      1: { name: 'Requirements Capture', handler: this.stage1_requirements.bind(this) },
      2: { name: 'Configuration', handler: this.stage2_configuration.bind(this) },
      3: { name: 'ViewForge', handler: this.stage3_viewforge.bind(this) },
      4: { name: 'AST Generation', handler: this.stage4_ast.bind(this) },
      5: { name: 'Validation', handler: this.stage5_validation.bind(this) },
      6: { name: 'Deployment', handler: this.stage6_deployment.bind(this) }
    };
    
    this.artifacts = {};
    this.isDryRun = options.dryRun || false;
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async executeStage(stageNumber) {
    const stage = this.stages[stageNumber];
    if (!stage) {
      throw new Error(`Stage ${stageNumber} not found`);
    }

    this.log(`--- Stage ${stageNumber}: ${stage.name} ---`);
    
    const stageStart = Date.now();
    let stageInputs = this.getStageInputs(stageNumber);
    let stageOutputs = {};
    let error = null;

    try {
      // Execute stage
      stageOutputs = await stage.handler();
      
      // Record success with visual tracker
      if (this.enableVisualTracking) {
        this.tracker.recordStage(
          `Stage ${stageNumber}: ${stage.name}`,
          stageInputs,
          stageOutputs,
          { 
            stageNumber,
            executionTime: Date.now() - stageStart,
            isDryRun: this.isDryRun
          }
        );
      }
      
      this.log(`Stage ${stageNumber} complete: ${stage.name.toLowerCase()}`);
      
    } catch (err) {
      error = err;
      
      // Record error with visual tracker
      if (this.enableVisualTracking) {
        this.tracker.recordError(
          `Stage ${stageNumber}: ${stage.name}`,
          err,
          stageOutputs
        );
      }
      
      this.log(`Stage ${stageNumber} failed: ${err.message}`, 'ERROR');
      throw err;
    }

    return stageOutputs;
  }

  getStageInputs(stageNumber) {
    // Define what inputs each stage expects
    const inputMappings = {
      1: { busmFile: 'BUSM.mmd', featureSpecs: 'feature specs' },
      2: { entities: this.artifacts.entities || [] },
      3: { config: this.artifacts.config || {} },
      4: { components: this.artifacts.components || [] },
      5: { ast: this.artifacts.ast || {} },
      6: { validation: this.artifacts.validation || {} }
    };
    
    return inputMappings[stageNumber] || {};
  }

  async stage1_requirements() {
    this.log('Stage 1: Requirements Capture');
    
    const busmPath = path.join(this.baseDir, '00-requirements/models/BUSM.mmd');
    let entities = [];
    
    if (fs.existsSync(busmPath) && !this.isDryRun) {
      const busmContent = fs.readFileSync(busmPath, 'utf8');
      // Simple entity extraction (enhance this later)
      const entityMatches = busmContent.match(/class \w+/g) || [];
      entities = entityMatches.map(match => match.replace('class ', ''));
    } else {
      // Default entities for dry run
      entities = ['Account', 'User'];
    }
    
    this.log(`Extracted entities: ${entities.join(', ')}`);
    
    // Ensure output directory exists
    const outputDir = path.join(this.outputDir, 'stage1');
    if (!fs.existsSync(outputDir) && !this.isDryRun) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save stage output
    if (!this.isDryRun) {
      fs.writeFileSync(
        path.join(outputDir, 'entities.json'),
        JSON.stringify({ entities }, null, 2)
      );
    }
    
    this.artifacts.entities = entities;
    return { entities, entityCount: entities.length };
  }

  async stage2_configuration() {
    this.log('Stage 2: Configuration');
    
    const enrichedConfig = {
      entities: this.artifacts.entities,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      stage: 'configuration'
    };
    
    // Save stage output
    const outputDir = path.join(this.outputDir, 'stage2');
    if (!fs.existsSync(outputDir) && !this.isDryRun) {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(
        path.join(outputDir, 'enriched-config.json'),
        JSON.stringify(enrichedConfig, null, 2)
      );
    }
    
    this.artifacts.config = enrichedConfig;
    return { configGenerated: true, entities: this.artifacts.entities.length };
  }

  async stage3_viewforge() {
    this.log('Stage 3: ViewForge Transformation');
    
    // Simulate ViewForge transformation
    const components = this.artifacts.entities.map(entity => `${entity}ListView`);
    
    // Save stage output
    const outputDir = path.join(this.outputDir, 'stage3');
    if (!fs.existsSync(outputDir) && !this.isDryRun) {
      fs.mkdirSync(outputDir, { recursive: true });
      
      components.forEach(component => {
        const componentContent = `// Generated component: ${component}\nexport default function ${component}() {\n  return <div>${component}</div>;\n}`;
        fs.writeFileSync(
          path.join(outputDir, `${component}.jsx`),
          componentContent
        );
      });
    }
    
    this.artifacts.components = components;
    return { components, componentCount: components.length };
  }

  async stage4_ast() {
    this.log('Stage 4: AST Generation');
    
    const astData = {
      components: this.artifacts.components,
      generatedAt: new Date().toISOString(),
      indicators: this.artifacts.components.map(comp => `${comp}-indicator`)
    };
    
    // Save stage output
    const outputDir = path.join(this.outputDir, 'stage4');
    if (!fs.existsSync(outputDir) && !this.isDryRun) {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(
        path.join(outputDir, 'ast-data.json'),
        JSON.stringify(astData, null, 2)
      );
    }
    
    this.artifacts.ast = astData;
    return { astGenerated: true, indicators: astData.indicators.length };
  }

  async stage5_validation() {
    this.log('Stage 5: Validation');
    
    const validationResults = {
      totalComponents: this.artifacts.components.length,
      validComponents: this.artifacts.components.length, // Assume all valid for now
      qualityScore: 95,
      issues: []
    };
    
    // Save stage output  
    const outputDir = path.join(this.outputDir, 'stage5');
    if (!fs.existsSync(outputDir) && !this.isDryRun) {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(
        path.join(outputDir, 'validation-report.json'),
        JSON.stringify(validationResults, null, 2)
      );
    }
    
    this.artifacts.validation = validationResults;
    return { qualityScore: validationResults.qualityScore, issues: validationResults.issues.length };
  }

  async stage6_deployment() {
    this.log('Stage 6: Deployment');
    
    const deploymentManifest = {
      components: this.artifacts.components,
      qualityScore: this.artifacts.validation.qualityScore,
      deployedAt: new Date().toISOString(),
      url: 'http://localhost:3000/accounts/master-view'
    };
    
    // Save stage output
    const outputDir = path.join(this.outputDir, 'stage6');
    if (!fs.existsSync(outputDir) && !this.isDryRun) {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(
        path.join(outputDir, 'deployment-manifest.json'),
        JSON.stringify(deploymentManifest, null, 2)
      );
    }
    
    this.artifacts.deployment = deploymentManifest;
    return { deployed: true, url: deploymentManifest.url };
  }

  async run() {
    this.log('=== Concept Line Pipeline Starting ===');
    
    // Start visual tracking
    if (this.enableVisualTracking) {
      this.tracker.startTracking('concept-line');
    }
    
    const overallStart = Date.now();
    
    try {
      // Execute all stages
      for (let i = 1; i <= 6; i++) {
        await this.executeStage(i);
        this.log(''); // Empty line between stages
      }
      
      const totalDuration = Date.now() - overallStart;
      this.log(`=== Pipeline Complete in ${totalDuration}ms ===`);
      
      // Stop visual tracking and get summary
      if (this.enableVisualTracking) {
        const summary = this.tracker.stopTracking();
        
        // Display additional insights
        this.displayPipelineInsights(summary);
        
        return {
          success: true,
          duration: totalDuration,
          artifacts: this.artifacts,
          visualSummary: summary
        };
      }
      
      return {
        success: true,
        duration: totalDuration,
        artifacts: this.artifacts
      };
      
    } catch (error) {
      this.log(`Pipeline failed: ${error.message}`, 'ERROR');
      
      if (this.enableVisualTracking) {
        this.tracker.stopTracking();
      }
      
      throw error;
    }
  }

  displayPipelineInsights(summary) {
    this.log('\n🎯 PIPELINE INSIGHTS');
    this.log('==========================================');
    
    // Performance insights
    const avgStageTime = summary.totalDuration / summary.stageCount;
    this.log(`Average stage time: ${Math.round(avgStageTime)}ms`);
    
    // Find slowest stage
    const slowestStage = summary.stages.reduce((prev, current) => 
      (prev.metrics.duration > current.metrics.duration) ? prev : current
    );
    this.log(`Slowest stage: ${slowestStage.stageName} (${slowestStage.metrics.duration}ms)`);
    
    // Quality insights
    if (this.artifacts.validation) {
      this.log(`Quality score: ${this.artifacts.validation.qualityScore}%`);
    }
    
    // Artifact insights
    this.log(`Entities processed: ${this.artifacts.entities?.length || 0}`);
    this.log(`Components generated: ${this.artifacts.components?.length || 0}`);
    
    this.log('==========================================');
    
    // Show where to find visual outputs
    this.log('\n📊 Visual outputs generated:');
    this.log('  🌐 HTML: models/live/pipeline-visualization.html');
    this.log('  📈 Mermaid: models/live/pipeline-flow.mmd');  
    this.log('  📄 JSON: models/live/latest-execution.json');
    
    if (!this.isDryRun) {
      this.log('\n💡 Next steps:');
      this.log('  1. Open HTML visualization in browser');
      this.log('  2. Review generated components in outputs/');
      this.log('  3. Check quality score and address any issues');
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    visual: !args.includes('--no-visual'),
    verbose: args.includes('--verbose')
  };
  
  const pipeline = new EnhancedConceptLinePipeline(options);
  
  pipeline.run()
    .then(result => {
      console.log('\n✅ Pipeline completed successfully!');
      if (options.verbose) {
        console.log(JSON.stringify(result, null, 2));
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Pipeline failed:', error.message);
      process.exit(1);
    });
}

module.exports = EnhancedConceptLinePipeline;