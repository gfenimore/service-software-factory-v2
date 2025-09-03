#!/usr/bin/env node

/**
 * Config Generator - Stage 2 Output Assembly and Generation
 * Handles final assembly and output generation for ViewForge-ready configurations
 * Consolidates Config Building and Output Generation into a single cohesive component
 */

const fs = require('fs').promises;
const path = require('path');

class ConfigGenerator {
  constructor() {
    this.outputTemplates = {
      enrichedConfig: {
        metadata: {},
        entities: [],
        businessRules: [],
        entityMappings: {}
      },
      entityMappings: {
        mappings: {},
        relationshipGraph: {
          nodes: [],
          edges: []
        }
      },
      configMetadata: {
        build: {},
        processing: {},
        validation: {},
        outputs: {}
      }
    };
  }

  /**
   * Assemble complete enriched configuration
   * @param {Object} processedData - Validated data from Data Processor
   * @returns {Object} Assembled configuration object
   */
  assembleConfiguration(processedData) {
    console.log('  🔧 Assembling enriched configuration...');
    
    try {
      const enrichedConfig = {
        metadata: {
          version: processedData.metadata?.version || '1.0.0',
          timestamp: processedData.metadata?.timestamp || new Date().toISOString(),
          stage: 'stage-2-complete',
          assembledAt: new Date().toISOString()
        },
        entities: this._assembleEntityDefinitions(processedData.validatedEntities),
        businessRules: this._assembleBusinessRules(processedData.validatedRules),
        entityMappings: processedData.entityMappings || {},
        processing: processedData.metadata?.processing || {}
      };

      // Validate configuration completeness
      const validation = this._validateConfigurationCompleteness(enrichedConfig);
      enrichedConfig.validation = validation;

      console.log(`    ✓ Assembled configuration with ${enrichedConfig.entities.length} entities, ${enrichedConfig.businessRules.length} rules`);
      return enrichedConfig;

    } catch (error) {
      console.error('    ❌ Configuration assembly failed:', error.message);
      throw new Error(`Configuration assembly failed: ${error.message}`);
    }
  }

  /**
   * Generate all Stage 2 output files
   * @param {Object} enrichedConfig - Assembled configuration
   * @param {Object} entityMappings - Entity relationship mappings
   * @param {Object} metadata - Processing metadata
   * @param {String} outputDir - Target directory for outputs
   * @returns {Object} File generation results
   */
  async generateOutputFiles(enrichedConfig, entityMappings, metadata, outputDir) {
    console.log('  📝 Generating Stage 2 output files...');
    
    const results = {
      outputs: {},
      errors: [],
      summary: {
        filesGenerated: 0,
        totalSize: 0,
        generatedAt: new Date().toISOString()
      }
    };

    try {
      // Ensure output directory exists
      await this._ensureOutputDirectory(outputDir);

      // Generate enriched-config.json
      console.log('    📄 Generating enriched-config.json...');
      const enrichedConfigResult = await this._generateEnrichedConfigFile(
        enrichedConfig,
        path.join(outputDir, 'enriched-config.json')
      );
      results.outputs['enriched-config.json'] = enrichedConfigResult;

      // Generate entity-mappings.json
      console.log('    📄 Generating entity-mappings.json...');
      const entityMappingsResult = await this._generateEntityMappingsFile(
        entityMappings,
        path.join(outputDir, 'entity-mappings.json')
      );
      results.outputs['entity-mappings.json'] = entityMappingsResult;

      // Generate config-metadata.json
      console.log('    📄 Generating config-metadata.json...');
      const metadataResult = await this._generateConfigMetadataFile(
        metadata,
        results.outputs,
        path.join(outputDir, 'config-metadata.json')
      );
      results.outputs['config-metadata.json'] = metadataResult;

      // Validate all outputs
      console.log('    🔍 Validating output integrity...');
      const validationResults = await this._validateOutputIntegrity(outputDir);
      results.validation = validationResults;

      // Calculate summary statistics
      results.summary.filesGenerated = Object.keys(results.outputs).length;
      results.summary.totalSize = this._calculateTotalOutputSize(results.outputs);

      console.log(`    ✓ Generated ${results.summary.filesGenerated} output files (${results.summary.totalSize})`);
      return results;

    } catch (error) {
      console.error('    ❌ Output generation failed:', error.message);
      results.errors.push({
        type: 'OUTPUT_GENERATION_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      return results;
    }
  }

  // Private helper methods

  _assembleEntityDefinitions(validatedEntities) {
    if (!Array.isArray(validatedEntities)) return [];

    return validatedEntities
      .filter(entity => entity.valid)
      .map(entity => ({
        name: entity.name,
        fields: entity.fields || [],
        definition: entity.definition || {},
        relationships: entity.relationships || {},
        validationRules: entity.validationRules || [],
        metadata: {
          valid: entity.valid,
          loadedAt: entity.loadedAt,
          assembledAt: new Date().toISOString()
        }
      }));
  }

  _assembleBusinessRules(validatedRules) {
    if (!Array.isArray(validatedRules)) return [];

    return validatedRules.map(rule => ({
      id: rule.id,
      name: rule.name || rule.id,
      entity: rule.entity,
      conditions: rule.conditions || [],
      actions: rule.actions || [],
      priority: rule.priority || 'normal',
      metadata: {
        valid: rule.valid || true,
        validatedAt: rule.validatedAt,
        assembledAt: new Date().toISOString()
      }
    }));
  }

  _validateConfigurationCompleteness(enrichedConfig) {
    const validation = {
      complete: true,
      gaps: [],
      warnings: [],
      summary: ''
    };

    // Check entity completeness
    for (const entity of enrichedConfig.entities) {
      if (!entity.fields || entity.fields.length === 0) {
        validation.complete = false;
        validation.gaps.push({
          type: 'MISSING_ENTITY_FIELDS',
          entity: entity.name,
          message: `Entity '${entity.name}' has no defined fields`
        });
      }

      if (!entity.definition || Object.keys(entity.definition).length === 0) {
        validation.warnings.push({
          type: 'INCOMPLETE_ENTITY_DEFINITION',
          entity: entity.name,
          message: `Entity '${entity.name}' has minimal definition`
        });
      }
    }

    // Check business rules completeness
    for (const rule of enrichedConfig.businessRules) {
      if (!rule.conditions || rule.conditions.length === 0) {
        validation.warnings.push({
          type: 'RULE_NO_CONDITIONS',
          rule: rule.id,
          message: `Rule '${rule.id}' has no conditions defined`
        });
      }

      if (!rule.actions || rule.actions.length === 0) {
        validation.warnings.push({
          type: 'RULE_NO_ACTIONS',
          rule: rule.id,
          message: `Rule '${rule.id}' has no actions defined`
        });
      }
    }

    validation.summary = `${enrichedConfig.entities.length} entities, ${enrichedConfig.businessRules.length} rules, ${validation.gaps.length} gaps, ${validation.warnings.length} warnings`;
    return validation;
  }

  async _ensureOutputDirectory(outputDir) {
    try {
      await fs.mkdir(outputDir, { recursive: true });
      console.log(`    📁 Output directory ready: ${outputDir}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw new Error(`Cannot create output directory: ${error.message}`);
      }
    }
  }

  async _generateEnrichedConfigFile(enrichedConfig, filepath) {
    try {
      const content = JSON.stringify(enrichedConfig, null, 2);
      await fs.writeFile(filepath, content, 'utf8');
      
      const stats = await fs.stat(filepath);
      return {
        status: 'SUCCESS',
        size: `${(stats.size / 1024).toFixed(1)}KB`,
        path: filepath,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'FAILED',
        error: error.message,
        path: filepath,
        generatedAt: new Date().toISOString()
      };
    }
  }

  async _generateEntityMappingsFile(entityMappings, filepath) {
    try {
      const mappingsOutput = {
        mappings: entityMappings.mappings || {},
        relationshipGraph: entityMappings.relationshipGraph || { nodes: [], edges: [] },
        navigationPaths: entityMappings.navigationPaths || [],
        metadata: {
          totalMappings: Object.keys(entityMappings.mappings || {}).length,
          totalRelationships: (entityMappings.relationshipGraph?.edges || []).length,
          generatedAt: new Date().toISOString()
        }
      };

      const content = JSON.stringify(mappingsOutput, null, 2);
      await fs.writeFile(filepath, content, 'utf8');
      
      const stats = await fs.stat(filepath);
      return {
        status: 'SUCCESS',
        size: `${(stats.size / 1024).toFixed(1)}KB`,
        path: filepath,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'FAILED',
        error: error.message,
        path: filepath,
        generatedAt: new Date().toISOString()
      };
    }
  }

  async _generateConfigMetadataFile(metadata, outputs, filepath) {
    try {
      const metadataOutput = {
        build: {
          timestamp: metadata.timestamp || new Date().toISOString(),
          version: metadata.version || '1.0.0',
          stage: 'stage-2-complete',
          generatedAt: new Date().toISOString()
        },
        processing: metadata.processing || {},
        validation: metadata.validation || {},
        outputs: {}
      };

      // Add output file information
      for (const [filename, fileInfo] of Object.entries(outputs)) {
        metadataOutput.outputs[filename] = {
          status: fileInfo.status,
          size: fileInfo.size,
          generatedAt: fileInfo.generatedAt
        };
      }

      const content = JSON.stringify(metadataOutput, null, 2);
      await fs.writeFile(filepath, content, 'utf8');
      
      const stats = await fs.stat(filepath);
      return {
        status: 'SUCCESS',
        size: `${(stats.size / 1024).toFixed(1)}KB`,
        path: filepath,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'FAILED',
        error: error.message,
        path: filepath,
        generatedAt: new Date().toISOString()
      };
    }
  }

  async _validateOutputIntegrity(outputDir) {
    const validation = {
      allValid: true,
      fileValidations: {},
      errors: []
    };

    const expectedFiles = [
      'enriched-config.json',
      'entity-mappings.json',
      'config-metadata.json'
    ];

    for (const filename of expectedFiles) {
      const filepath = path.join(outputDir, filename);
      
      try {
        // Check file exists
        await fs.access(filepath);
        
        // Check file is readable
        const content = await fs.readFile(filepath, 'utf8');
        
        // Check JSON is valid
        const parsed = JSON.parse(content);
        
        validation.fileValidations[filename] = {
          exists: true,
          readable: true,
          validJson: true,
          size: content.length,
          status: 'VALID'
        };
        
      } catch (error) {
        validation.allValid = false;
        validation.fileValidations[filename] = {
          exists: false,
          readable: false,
          validJson: false,
          status: 'INVALID',
          error: error.message
        };
        
        validation.errors.push({
          file: filename,
          error: error.message
        });
      }
    }

    return validation;
  }

  _calculateTotalOutputSize(outputs) {
    let totalBytes = 0;
    
    for (const output of Object.values(outputs)) {
      if (output.size && output.size.endsWith('KB')) {
        totalBytes += parseFloat(output.size) * 1024;
      }
    }
    
    return `${(totalBytes / 1024).toFixed(1)}KB`;
  }

  /**
   * Get component status for monitoring
   * @returns {Object} Current component status
   */
  getStatus() {
    return {
      component: 'Config Generator',
      version: '1.0.0',
      status: 'ready',
      capabilities: [
        'Configuration Assembly',
        'Entity Mappings Generation',
        'Metadata File Generation',
        'Output Validation'
      ],
      outputFormats: [
        'enriched-config.json',
        'entity-mappings.json',
        'config-metadata.json'
      ]
    };
  }
}

// CLI Support
if (require.main === module) {
  const generator = new ConfigGenerator();
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Config Generator - Stage 2 Output Assembly and Generation

Usage:
  node config-generator.js [command] [options]

Commands:
  assemble     Assemble enriched configuration
  generate     Generate output files
  validate     Validate existing outputs

Options:
  --input <path>       Path to processed data JSON file
  --output <dir>       Output directory for generated files
  --help, -h           Show this help message

Example:
  node config-generator.js generate --input ./processed-data.json --output ./stage2-outputs
`);
    process.exit(0);
  }

  console.log('Config Generator ready for integration testing');
  console.log('Status:', JSON.stringify(generator.getStatus(), null, 2));
}

module.exports = ConfigGenerator;