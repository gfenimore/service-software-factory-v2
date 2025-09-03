#!/usr/bin/env node

/**
 * Data Processor - Stage 2 Core Processing Engine
 * Handles validation, transformation, and relationship mapping of Stage 1 data
 * Consolidates Entity Loading, Rule Validation, Entity Mapping, and Metadata Building
 */

const fs = require('fs').promises;
const path = require('path');

class DataProcessor {
  constructor() {
    this.validationCache = new Map();
    this.processingStats = {
      entitiesProcessed: 0,
      rulesProcessed: 0,
      mappingsCreated: 0,
      errorsFound: 0,
      warningsFound: 0
    };
  }

  /**
   * Load and validate Stage 1 data files
   * @param {Object} inputFiles - Paths to Stage 1 output files
   * @returns {Object} Validated data and processing results
   */
  async loadStage1Data(inputFiles) {
    const results = {
      validatedEntities: [],
      businessRules: [],
      busmSubset: '',
      validationSummary: {
        totalEntities: 0,
        validEntities: 0,
        invalidEntities: 0,
        errors: []
      },
      errors: []
    };

    try {
      console.log('  📂 Loading entities file...');
      const entitiesData = await this._loadEntitiesFile(inputFiles.entitiesFile);
      results.validatedEntities = entitiesData.entities;
      results.validationSummary.totalEntities = entitiesData.entities.length;
      results.validationSummary.validEntities = entitiesData.entities.filter(e => e.valid).length;
      results.validationSummary.invalidEntities = entitiesData.entities.filter(e => !e.valid).length;
      
      if (entitiesData.errors?.length > 0) {
        results.errors.push(...entitiesData.errors);
        results.validationSummary.errors.push(...entitiesData.errors);
      }

      console.log('  📂 Loading business rules file...');
      const rulesData = await this._loadBusinessRulesFile(inputFiles.businessRulesFile);
      results.businessRules = rulesData.rules;
      
      if (rulesData.errors?.length > 0) {
        results.errors.push(...rulesData.errors);
      }

      console.log('  📂 Loading BUSM subset file...');
      const busmData = await this._loadBusmSubsetFile(inputFiles.busmSubsetFile);
      results.busmSubset = busmData.content;
      
      if (busmData.errors?.length > 0) {
        results.errors.push(...busmData.errors);
      }

      // Cross-validate entities against BUSM subset
      console.log('  🔍 Cross-validating entities against BUSM...');
      const crossValidation = await this._validateEntitiesAgainstBusm(
        results.validatedEntities,
        results.busmSubset
      );
      
      if (crossValidation.errors?.length > 0) {
        results.errors.push(...crossValidation.errors);
        results.validationSummary.errors.push(...crossValidation.errors);
      }

      this.processingStats.entitiesProcessed = results.validatedEntities.length;
      console.log(`  ✓ Loaded ${results.validatedEntities.length} entities, ${results.businessRules.length} rules`);

      return results;

    } catch (error) {
      results.errors.push({
        type: 'LOAD_ERROR',
        message: `Failed to load Stage 1 data: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      return results;
    }
  }

  /**
   * Validate business rules against entities
   * @param {Array} businessRules - Raw business rules
   * @param {Array} validatedEntities - Validated entity list
   * @returns {Object} Validated rules and error details
   */
  async validateBusinessRules(businessRules, validatedEntities) {
    const results = {
      validRules: [],
      invalidRules: [],
      validationSummary: {
        totalRules: businessRules.length,
        validRules: 0,
        invalidRules: 0,
        errors: []
      },
      errors: []
    };

    try {
      console.log(`  🔍 Validating ${businessRules.length} business rules...`);
      
      const entityNames = validatedEntities.map(e => e.name);
      
      for (const rule of businessRules) {
        const ruleValidation = await this._validateSingleRule(rule, entityNames);
        
        if (ruleValidation.valid) {
          results.validRules.push({
            ...rule,
            valid: true,
            validatedAt: new Date().toISOString()
          });
          results.validationSummary.validRules++;
        } else {
          results.invalidRules.push({
            ...rule,
            valid: false,
            errors: ruleValidation.errors,
            validatedAt: new Date().toISOString()
          });
          results.validationSummary.invalidRules++;
          results.errors.push(...ruleValidation.errors);
          results.validationSummary.errors.push(...ruleValidation.errors);
        }
      }

      this.processingStats.rulesProcessed = businessRules.length;
      console.log(`  ✓ Validated ${results.validRules.length}/${businessRules.length} rules`);

      return results;

    } catch (error) {
      results.errors.push({
        type: 'RULE_VALIDATION_ERROR',
        message: `Failed to validate business rules: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      return results;
    }
  }

  /**
   * Map entity relationships and create navigation paths
   * @param {Array} validatedEntities - Validated entities
   * @param {String} busmSubset - BUSM subset content
   * @returns {Object} Entity mappings and relationship data
   */
  async mapEntityRelationships(validatedEntities, busmSubset) {
    const results = {
      mappings: {},
      relationshipGraph: {
        nodes: [],
        edges: []
      },
      navigationPaths: [],
      errors: []
    };

    try {
      console.log(`  🗺️ Mapping relationships for ${validatedEntities.length} entities...`);

      // Create entity nodes
      for (const entity of validatedEntities) {
        if (!entity.valid) continue;

        const entityMapping = await this._analyzeEntityStructure(entity, busmSubset);
        results.mappings[entity.name] = entityMapping;
        
        results.relationshipGraph.nodes.push({
          id: entity.name,
          type: 'entity',
          fields: entityMapping.fields || []
        });
      }

      // Analyze relationships between entities
      for (const entityName of Object.keys(results.mappings)) {
        const relationships = await this._identifyEntityRelationships(
          entityName,
          results.mappings[entityName],
          results.mappings
        );
        
        results.mappings[entityName].relationships = relationships.relationships;
        results.mappings[entityName].navigationPaths = relationships.navigationPaths;
        
        // Add relationship edges
        for (const [relatedEntity, relInfo] of Object.entries(relationships.relationships)) {
          results.relationshipGraph.edges.push({
            source: entityName,
            target: relatedEntity,
            type: relInfo.type,
            key: relInfo.key
          });
        }
      }

      // Generate navigation paths
      results.navigationPaths = this._generateNavigationPaths(results.mappings);

      this.processingStats.mappingsCreated = Object.keys(results.mappings).length;
      console.log(`  ✓ Created ${Object.keys(results.mappings).length} entity mappings`);

      return results;

    } catch (error) {
      results.errors.push({
        type: 'MAPPING_ERROR',
        message: `Failed to map entity relationships: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      return results;
    }
  }

  /**
   * Build processing metadata for tracking
   * @param {Object} processingResults - Results from all processing steps
   * @returns {Object} Comprehensive metadata object
   */
  buildMetadata(processingResults) {
    const metadata = {
      timestamp: new Date().toISOString(),
      version: this._generateVersionNumber(),
      stage: 'stage-2-complete',
      processing: {
        entitiesProcessed: this.processingStats.entitiesProcessed,
        entitiesValid: processingResults.loadedData?.validatedEntities?.filter(e => e.valid).length || 0,
        rulesProcessed: this.processingStats.rulesProcessed,
        rulesValid: processingResults.ruleValidation?.validRules?.length || 0,
        relationshipsMapped: this.processingStats.mappingsCreated,
        processingTimeMs: Date.now() - processingResults.processingStart
      },
      validation: {
        errors: this._consolidateErrors(processingResults),
        warnings: this._consolidateWarnings(processingResults),
        summary: this._generateValidationSummary(processingResults)
      },
      inputs: {
        entitiesFile: processingResults.loadedData?.entitiesFile || 'unknown',
        businessRulesFile: processingResults.loadedData?.businessRulesFile || 'unknown',
        busmSubsetFile: processingResults.loadedData?.busmSubsetFile || 'unknown'
      }
    };

    console.log('  📊 Generated processing metadata');
    return metadata;
  }

  // Private helper methods

  async _loadEntitiesFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);
      
      const entities = Array.isArray(data) ? data : (data.entities || []);
      const validatedEntities = entities.map(entity => ({
        name: entity.name || entity.id || 'unknown',
        fields: entity.fields || [],
        definition: entity,
        valid: this._validateEntityStructure(entity),
        loadedAt: new Date().toISOString()
      }));

      return {
        entities: validatedEntities,
        errors: validatedEntities.filter(e => !e.valid).map(e => ({
          type: 'ENTITY_STRUCTURE_ERROR',
          message: `Invalid entity structure: ${e.name}`,
          entity: e.name,
          timestamp: new Date().toISOString()
        }))
      };
    } catch (error) {
      return {
        entities: [],
        errors: [{
          type: 'FILE_LOAD_ERROR',
          message: `Cannot load entities file: ${error.message}`,
          file: filepath,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  async _loadBusinessRulesFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);
      
      const rules = Array.isArray(data) ? data : (data.rules || []);
      
      return {
        rules: rules.map(rule => ({
          ...rule,
          loadedAt: new Date().toISOString()
        })),
        errors: []
      };
    } catch (error) {
      return {
        rules: [],
        errors: [{
          type: 'FILE_LOAD_ERROR',
          message: `Cannot load business rules file: ${error.message}`,
          file: filepath,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  async _loadBusmSubsetFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      return {
        content,
        errors: []
      };
    } catch (error) {
      return {
        content: '',
        errors: [{
          type: 'FILE_LOAD_ERROR',
          message: `Cannot load BUSM subset file: ${error.message}`,
          file: filepath,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  async _validateEntitiesAgainstBusm(entities, busmSubset) {
    const errors = [];
    
    for (const entity of entities) {
      if (!entity.valid) continue;
      
      const entityInBusm = busmSubset.includes(entity.name);
      if (!entityInBusm) {
        errors.push({
          type: 'BUSM_REFERENCE_ERROR',
          message: `Entity '${entity.name}' not found in BUSM subset`,
          entity: entity.name,
          timestamp: new Date().toISOString()
        });
        entity.valid = false;
        entity.errors = entity.errors || [];
        entity.errors.push('Not found in BUSM subset');
      }
    }
    
    return { errors };
  }

  async _validateSingleRule(rule, entityNames) {
    const validation = {
      valid: true,
      errors: []
    };

    // Check required fields
    if (!rule.id) {
      validation.valid = false;
      validation.errors.push({
        type: 'RULE_STRUCTURE_ERROR',
        message: 'Rule missing required id field',
        rule: rule.name || 'unknown',
        timestamp: new Date().toISOString()
      });
    }

    if (!rule.entity) {
      validation.valid = false;
      validation.errors.push({
        type: 'RULE_STRUCTURE_ERROR',
        message: 'Rule missing required entity field',
        rule: rule.id || 'unknown',
        timestamp: new Date().toISOString()
      });
    }

    // Check entity reference
    if (rule.entity && !entityNames.includes(rule.entity)) {
      validation.valid = false;
      validation.errors.push({
        type: 'RULE_REFERENCE_ERROR',
        message: `Rule references non-existent entity: ${rule.entity}`,
        rule: rule.id || 'unknown',
        entity: rule.entity,
        timestamp: new Date().toISOString()
      });
    }

    return validation;
  }

  async _analyzeEntityStructure(entity, busmSubset) {
    const structure = {
      fields: entity.fields || [],
      relationships: {},
      navigationPaths: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        busmReference: busmSubset.includes(entity.name)
      }
    };

    // Extract field information
    if (entity.definition) {
      structure.fields = this._extractEntityFields(entity.definition);
    }

    return structure;
  }

  async _identifyEntityRelationships(entityName, entityMapping, allMappings) {
    const relationships = {};
    const navigationPaths = [];

    // Simple relationship detection based on field names
    for (const field of entityMapping.fields) {
      // Look for foreign key patterns (ending in 'Id' or containing other entity names)
      if (field.endsWith('Id')) {
        const possibleEntity = field.replace('Id', '');
        const targetEntity = this._findEntityByName(possibleEntity, allMappings);
        
        if (targetEntity) {
          relationships[targetEntity] = {
            type: 'many-to-one',
            key: field,
            field: field
          };
          navigationPaths.push(`${entityName} → ${targetEntity}.${field}`);
        }
      }
      
      // Look for reverse relationships
      for (const [otherEntityName, otherMapping] of Object.entries(allMappings)) {
        if (otherEntityName === entityName) continue;
        
        const reverseField = `${entityName.toLowerCase()}Id`;
        if (otherMapping.fields.includes(reverseField)) {
          relationships[otherEntityName] = {
            type: 'one-to-many',
            key: reverseField,
            field: reverseField
          };
          navigationPaths.push(`${entityName} → ${otherEntityName}.${reverseField}`);
        }
      }
    }

    return { relationships, navigationPaths };
  }

  _extractEntityFields(entityDefinition) {
    const fields = [];
    
    if (entityDefinition.fields) {
      fields.push(...entityDefinition.fields);
    }
    
    if (entityDefinition.properties) {
      fields.push(...Object.keys(entityDefinition.properties));
    }
    
    if (entityDefinition.attributes) {
      fields.push(...entityDefinition.attributes.map(attr => attr.name || attr));
    }
    
    // Default fields if none found
    if (fields.length === 0) {
      fields.push('id', 'name');
    }
    
    return [...new Set(fields)]; // Remove duplicates
  }

  _findEntityByName(name, allMappings) {
    const entityNames = Object.keys(allMappings);
    return entityNames.find(entityName => 
      entityName.toLowerCase() === name.toLowerCase()
    );
  }

  _generateNavigationPaths(mappings) {
    const paths = [];
    
    for (const [entityName, mapping] of Object.entries(mappings)) {
      if (mapping.navigationPaths) {
        paths.push(...mapping.navigationPaths);
      }
    }
    
    return [...new Set(paths)]; // Remove duplicates
  }

  _validateEntityStructure(entity) {
    return !!(entity && (entity.name || entity.id) && typeof entity === 'object');
  }

  _generateVersionNumber() {
    const date = new Date();
    return `2.${date.getMonth() + 1}.${date.getDate()}`;
  }

  _consolidateErrors(processingResults) {
    const errors = [];
    
    if (processingResults.loadedData?.errors) {
      errors.push(...processingResults.loadedData.errors);
    }
    
    if (processingResults.ruleValidation?.errors) {
      errors.push(...processingResults.ruleValidation.errors);
    }
    
    if (processingResults.entityMappings?.errors) {
      errors.push(...processingResults.entityMappings.errors);
    }
    
    return errors;
  }

  _consolidateWarnings(processingResults) {
    const warnings = [];
    
    // Add logic to identify warnings from processing results
    // For now, return empty array
    
    return warnings;
  }

  _generateValidationSummary(processingResults) {
    const validEntities = processingResults.loadedData?.validatedEntities?.filter(e => e.valid).length || 0;
    const totalEntities = processingResults.loadedData?.validatedEntities?.length || 0;
    const validRules = processingResults.ruleValidation?.validRules?.length || 0;
    const totalRules = processingResults.ruleValidation?.validationSummary?.totalRules || 0;
    
    return `${validEntities}/${totalEntities} entities valid, ${validRules}/${totalRules} rules valid`;
  }
}

// CLI Support
if (require.main === module) {
  const processor = new DataProcessor();
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Data Processor - Stage 2 Core Processing Engine

Usage:
  node data-processor.js [command] [options]

Commands:
  load      Load and validate Stage 1 data
  validate  Validate business rules  
  map       Map entity relationships
  metadata  Build processing metadata

Options:
  --entities <path>    Path to entities.json file
  --rules <path>       Path to business-rules.json file
  --busm <path>        Path to busm-subset.mmd file
  --help, -h           Show this help message

Example:
  node data-processor.js load --entities ./entities.json --rules ./rules.json --busm ./busm.mmd
`);
    process.exit(0);
  }

  console.log('Data Processor ready for integration testing');
}

module.exports = DataProcessor;