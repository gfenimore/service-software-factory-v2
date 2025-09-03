#!/usr/bin/env node

/**
 * Configuration Enricher - Stage 2 Main Orchestrator
 * Coordinates the complete Stage 2 enrichment process
 * Called by Pipeline Orchestrator to transform Stage 1 outputs into ViewForge-ready configurations
 */

const fs = require('fs').promises;
const path = require('path');
const DataProcessor = require('./data-processor');
const ConfigGenerator = require('./config-generator');

class ConfigurationEnricher {
  constructor() {
    this.dataProcessor = new DataProcessor();
    this.configGenerator = new ConfigGenerator();
  }

  /**
   * Main entry point for Stage 2 enrichment
   * @param {Object} stage1Outputs - Paths to Stage 1 output files
   * @returns {Object} Processing results with status and metrics
   */
  async enrichConfiguration(stage1Outputs) {
    const startTime = Date.now();
    const results = {
      status: 'SUCCESS',
      entitiesProcessed: 0,
      rulesValidated: 0,
      mappingsCreated: 0,
      outputsGenerated: 0,
      processingTimeMs: 0,
      errors: [],
      outputs: {}
    };

    try {
      console.log('🚀 Starting Stage 2 Configuration Enrichment...');
      
      // Step 1: Validate inputs
      await this._validateInputs(stage1Outputs);
      console.log('✓ Stage 1 inputs validated');

      // Step 2: Load and process data
      console.log('📂 Loading Stage 1 data...');
      const loadedData = await this.dataProcessor.loadStage1Data(stage1Outputs);
      results.entitiesProcessed = loadedData.validatedEntities?.length || 0;
      
      if (loadedData.errors?.length > 0) {
        results.errors.push(...loadedData.errors);
      }

      // Step 3: Validate business rules
      console.log('🔍 Validating business rules...');
      const ruleValidation = await this.dataProcessor.validateBusinessRules(
        loadedData.businessRules,
        loadedData.validatedEntities
      );
      results.rulesValidated = ruleValidation.validRules?.length || 0;

      if (ruleValidation.errors?.length > 0) {
        results.errors.push(...ruleValidation.errors);
      }

      // Step 4: Map entity relationships
      console.log('🗺️ Mapping entity relationships...');
      const entityMappings = await this.dataProcessor.mapEntityRelationships(
        loadedData.validatedEntities,
        loadedData.busmSubset
      );
      results.mappingsCreated = Object.keys(entityMappings.mappings || {}).length;

      // Step 5: Build processing metadata
      console.log('📊 Building metadata...');
      const metadata = this.dataProcessor.buildMetadata({
        loadedData,
        ruleValidation,
        entityMappings,
        processingStart: startTime
      });

      // Step 6: Assemble enriched configuration
      console.log('🔧 Assembling enriched configuration...');
      const enrichedConfig = this.configGenerator.assembleConfiguration({
        validatedEntities: loadedData.validatedEntities,
        validatedRules: ruleValidation.validRules,
        entityMappings: entityMappings.mappings,
        metadata
      });

      // Step 7: Generate output files
      console.log('📝 Generating output files...');
      const outputDir = path.join(process.cwd(), '.pipeline/01-concept-line/outputs/stage2');
      const outputResults = await this.configGenerator.generateOutputFiles(
        enrichedConfig,
        entityMappings,
        metadata,
        outputDir
      );

      results.outputs = outputResults.outputs;
      results.outputsGenerated = Object.keys(outputResults.outputs).length;

      // Step 8: Final validation
      await this._validateOutputs(outputDir);
      
      results.processingTimeMs = Date.now() - startTime;
      
      // Determine final status
      if (results.errors.length === 0) {
        results.status = 'SUCCESS';
        console.log('✅ Stage 2 Configuration Enrichment completed successfully');
      } else if (results.outputsGenerated > 0) {
        results.status = 'PARTIAL';
        console.log('⚠️ Stage 2 completed with warnings');
      } else {
        results.status = 'FAILED';
        console.log('❌ Stage 2 Configuration Enrichment failed');
      }

      console.log(`📈 Processing Summary:
  - Entities processed: ${results.entitiesProcessed}
  - Rules validated: ${results.rulesValidated}
  - Mappings created: ${results.mappingsCreated}
  - Outputs generated: ${results.outputsGenerated}
  - Processing time: ${results.processingTimeMs}ms
  - Status: ${results.status}`);

      return results;

    } catch (error) {
      results.status = 'FAILED';
      results.processingTimeMs = Date.now() - startTime;
      results.errors.push({
        type: 'SYSTEM_ERROR',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      console.error('💥 Fatal error in Configuration Enricher:', error);
      return results;
    }
  }

  /**
   * Validate Stage 1 input files exist and are accessible
   * @param {Object} stage1Outputs - Input file paths
   * @private
   */
  async _validateInputs(stage1Outputs) {
    const requiredFiles = ['entitiesFile', 'businessRulesFile', 'busmSubsetFile'];
    
    for (const fileKey of requiredFiles) {
      if (!stage1Outputs[fileKey]) {
        throw new Error(`Missing required input: ${fileKey}`);
      }
      
      try {
        await fs.access(stage1Outputs[fileKey]);
      } catch (error) {
        throw new Error(`Cannot access ${fileKey}: ${stage1Outputs[fileKey]} - ${error.message}`);
      }
    }
  }

  /**
   * Validate generated output files
   * @param {string} outputDir - Output directory path
   * @private
   */
  async _validateOutputs(outputDir) {
    const expectedOutputs = [
      'enriched-config.json',
      'entity-mappings.json', 
      'config-metadata.json'
    ];

    for (const filename of expectedOutputs) {
      const filepath = path.join(outputDir, filename);
      try {
        await fs.access(filepath);
        const content = await fs.readFile(filepath, 'utf8');
        JSON.parse(content); // Validate JSON structure
        console.log(`✓ Validated output: ${filename}`);
      } catch (error) {
        throw new Error(`Output validation failed for ${filename}: ${error.message}`);
      }
    }
  }

  /**
   * Get processing status for monitoring
   * @returns {Object} Current processing status
   */
  getStatus() {
    return {
      component: 'Configuration Enricher',
      version: '1.0.0',
      status: 'ready',
      dependencies: ['DataProcessor', 'ConfigGenerator'],
      lastProcessed: this.lastProcessed || null
    };
  }
}

// CLI Support
if (require.main === module) {
  const enricher = new ConfigurationEnricher();
  
  // Example usage with default Stage 1 output paths
  const defaultStage1Outputs = {
    entitiesFile: './.pipeline/01-concept-line/outputs/stage1/entities.json',
    businessRulesFile: './.pipeline/01-concept-line/outputs/stage1/business-rules.json',
    busmSubsetFile: './.pipeline/01-concept-line/outputs/stage1/busm-subset.mmd'
  };

  // Parse command line arguments
  const args = process.argv.slice(2);
  let stage1Outputs = defaultStage1Outputs;

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Configuration Enricher - Stage 2 Pipeline Component

Usage:
  node configuration-enricher.js [options]

Options:
  --entities <path>       Path to entities.json file
  --rules <path>          Path to business-rules.json file  
  --busm <path>           Path to busm-subset.mmd file
  --help, -h              Show this help message

Default paths:
  --entities ./.pipeline/01-concept-line/outputs/stage1/entities.json
  --rules    ./.pipeline/01-concept-line/outputs/stage1/business-rules.json
  --busm     ./.pipeline/01-concept-line/outputs/stage1/busm-subset.mmd

Example:
  node configuration-enricher.js
  node configuration-enricher.js --entities ./custom/entities.json
`);
    process.exit(0);
  }

  // Parse custom file paths
  const entitiesIndex = args.indexOf('--entities');
  if (entitiesIndex !== -1 && args[entitiesIndex + 1]) {
    stage1Outputs.entitiesFile = args[entitiesIndex + 1];
  }

  const rulesIndex = args.indexOf('--rules');
  if (rulesIndex !== -1 && args[rulesIndex + 1]) {
    stage1Outputs.businessRulesFile = args[rulesIndex + 1];
  }

  const busmIndex = args.indexOf('--busm');
  if (busmIndex !== -1 && args[busmIndex + 1]) {
    stage1Outputs.busmSubsetFile = args[busmIndex + 1];
  }

  // Run the enrichment
  enricher.enrichConfiguration(stage1Outputs)
    .then(results => {
      console.log('\n📊 Final Results:', JSON.stringify(results, null, 2));
      process.exit(results.status === 'SUCCESS' ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Enrichment failed:', error);
      process.exit(1);
    });
}

module.exports = ConfigurationEnricher;