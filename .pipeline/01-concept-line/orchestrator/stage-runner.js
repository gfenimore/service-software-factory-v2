#!/usr/bin/env node

/**
 * Incremental Stage Runner - Run individual stages for testing
 * 
 * Usage:
 *   node stage-runner.js 1           # Run only Stage 1
 *   node stage-runner.js 1 2         # Run Stages 1-2
 *   node stage-runner.js 1 2 3       # Run Stages 1-3
 *   node stage-runner.js all         # Run all stages (same as pipeline-orchestrator)
 */

const ConceptLinePipeline = require('./pipeline-orchestrator');

class IncrementalStageRunner extends ConceptLinePipeline {
  constructor() {
    super();
    this.currentStage = 0;
  }

  async runStages(stageNumbers) {
    this.log('=== Incremental Stage Runner Starting ===');
    const startTime = Date.now();
    
    try {
      for (const stageNum of stageNumbers) {
        if (!this.stages[stageNum]) {
          throw new Error(`Invalid stage number: ${stageNum}`);
        }
        
        const stage = this.stages[stageNum];
        this.log(`\n--- Stage ${stageNum}: ${stage.name} ---`);
        this.currentStage = stageNum;
        
        await stage.handler();
        
        this.log(`✅ Stage ${stageNum} complete - Ready for next stage`);
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(3);
      this.log(`\n=== Stages ${stageNumbers.join(', ')} Complete in ${duration}s ===`);
      
      // Show what's ready for next stage
      this.showStageStatus(stageNumbers);
      
      return {
        success: true,
        duration: duration,
        stagesCompleted: stageNumbers,
        artifacts: this.artifacts
      };
    } catch (error) {
      this.log(`❌ Stage ${this.currentStage} failed: ${error.message}`, 'ERROR');
      this.log(`🔧 Check inputs and outputs for debugging`, 'ERROR');
      return {
        success: false,
        failedAt: this.currentStage,
        error: error.message,
        artifacts: this.artifacts
      };
    }
  }

  showStageStatus(completedStages) {
    this.log('\n📋 STAGE STATUS:');
    
    for (let i = 1; i <= 6; i++) {
      const stage = this.stages[i];
      const status = completedStages.includes(i) ? '✅' : '⏸️';
      const next = completedStages.includes(i) ? '' : ' (ready to run)';
      this.log(`${status} Stage ${i}: ${stage.name}${next}`);
    }
    
    this.log('\n📁 OUTPUT FILES:');
    completedStages.forEach(stageNum => {
      const outputPath = `.pipeline/01-concept-line/outputs/stage${stageNum}/`;
      this.log(`   Stage ${stageNum}: ${outputPath}`);
    });
    
    if (completedStages.length < 6) {
      const nextStage = Math.max(...completedStages) + 1;
      if (nextStage <= 6) {
        this.log(`\n🚀 NEXT: Run "node stage-runner.js ${completedStages.join(' ')} ${nextStage}" to continue`);
      }
    } else {
      this.log('\n🎉 All stages complete! POC ready at: http://localhost:3000/accounts/master-view');
    }
  }

  // Override to add step-by-step logging for Stage 1
  async stage1_requirements() {
    this.log('🔍 Stage 1: Requirements Capture (Step-by-Step)');
    
    // Step 1: Setup paths
    this.log('📁 Step 1: Setting up paths...');
    const busmPath = require('path').join(this.baseDir, '00-requirements/models/BUSM.mmd');
    const featureSpecPath = require('path').join(this.baseDir, '../.product-specs/00-platform-core/epics/EP-001-accounts/features/FEA-001-master-view/master-view-feature.md');
    const outputPath = require('path').join(this.outputDir, 'stage1');
    
    this.log(`   BUSM path: ${busmPath}`);
    this.log(`   Feature spec path: ${featureSpecPath}`);
    this.log(`   Output path: ${outputPath}`);
    
    // Step 2: Create output directory
    this.log('📂 Step 2: Creating output directory...');
    if (!require('fs').existsSync(outputPath)) {
      require('fs').mkdirSync(outputPath, { recursive: true });
      this.log('   ✅ Directory created');
    } else {
      this.log('   ✅ Directory already exists');
    }

    // Step 3: Validate input files
    this.log('🔎 Step 3: Validating input files...');
    if (!require('fs').existsSync(busmPath)) {
      throw new Error(`BUSM file not found at ${busmPath}`);
    }
    this.log('   ✅ BUSM.mmd found');
    
    if (!require('fs').existsSync(featureSpecPath)) {
      throw new Error(`Feature spec not found at ${featureSpecPath}`);
    }
    this.log('   ✅ Feature spec found');

    // Step 4: Read input files
    this.log('📖 Step 4: Reading input files...');
    const busmContent = require('fs').readFileSync(busmPath, 'utf8');
    const featureContent = require('fs').readFileSync(featureSpecPath, 'utf8');
    
    this.log(`   ✅ BUSM content: ${busmContent.length} characters`);
    this.log(`   ✅ Feature content: ${featureContent.length} characters`);
    
    // Step 5: Extract entities
    this.log('🏗️ Step 5: Extracting entities from feature spec...');
    const entities = this.extractEntitiesFromFeature(featureContent);
    this.log(`   ✅ Extracted entities: ${entities.join(', ')}`);
    
    // Step 6: Create BUSM subset
    this.log('✂️ Step 6: Creating BUSM subset...');
    const busmSubset = this.extractBusmSubset(busmContent, entities);
    this.log(`   ✅ BUSM subset: ${busmSubset.length} characters`);
    
    // Step 7: Write BUSM subset file
    this.log('💾 Step 7: Writing busm-subset.mmd...');
    require('fs').writeFileSync(
      require('path').join(outputPath, 'busm-subset.mmd'),
      busmSubset
    );
    this.log('   ✅ busm-subset.mmd written');
    
    // Step 8: Write feature spec copy
    this.log('💾 Step 8: Writing feature-spec.md...');
    require('fs').writeFileSync(
      require('path').join(outputPath, 'feature-spec.md'),
      featureContent
    );
    this.log('   ✅ feature-spec.md written');
    
    // Step 9: Generate business rules
    this.log('📋 Step 9: Generating business rules...');
    const businessRules = this.promptForBusinessRules();
    this.log(`   ✅ Generated ${businessRules.rules.length} business rules`);
    
    // Step 10: Write business rules file
    this.log('💾 Step 10: Writing business-rules.json...');
    require('fs').writeFileSync(
      require('path').join(outputPath, 'business-rules.json'),
      JSON.stringify(businessRules, null, 2)
    );
    this.log('   ✅ business-rules.json written');
    
    // Step 11: Store in memory
    this.log('🧠 Step 11: Storing artifacts in memory...');
    this.artifacts.requirements = {
      busm: busmSubset,
      featureSpec: featureContent,
      businessRules: businessRules,
      entities: entities
    };
    this.log('   ✅ Artifacts stored');
    
    this.log('🎉 Stage 1 complete: Requirements captured with step-by-step validation');
    return this.artifacts.requirements;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node stage-runner.js <stage-numbers...>');
    console.log('');
    console.log('Examples:');
    console.log('  node stage-runner.js 1           # Run only Stage 1');
    console.log('  node stage-runner.js 1 2         # Run Stages 1-2');
    console.log('  node stage-runner.js 1 2 3       # Run Stages 1-3');
    console.log('  node stage-runner.js all         # Run all stages');
    console.log('');
    console.log('Available stages:');
    console.log('  1: Requirements Capture');
    console.log('  2: Configuration');
    console.log('  3: ViewForge');
    console.log('  4: AST Generation');
    console.log('  5: Validation');
    console.log('  6: Deployment');
    process.exit(1);
  }
  
  let stageNumbers;
  if (args[0] === 'all') {
    stageNumbers = [1, 2, 3, 4, 5, 6];
  } else {
    stageNumbers = args.map(arg => {
      const num = parseInt(arg);
      if (isNaN(num) || num < 1 || num > 6) {
        console.error(`Invalid stage number: ${arg}`);
        process.exit(1);
      }
      return num;
    });
  }
  
  const runner = new IncrementalStageRunner();
  runner.runStages(stageNumbers).then(result => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
}