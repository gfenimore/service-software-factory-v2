/**
 * BUSM Reader - The Single Source of Truth Interface
 * 
 * Provides unified access to Business Unified Schema Model (BUSM) data
 * All entity definitions, relationships, and constraints come from here
 */

const fs = require('fs');
const path = require('path');

class BUSMReader {
  constructor(busmPath = null) {
    this.busm = null;
    this.entities = {};
    this.relationships = {};
    this.enums = {};
    
    if (busmPath) {
      this.loadBUSM(busmPath);
    }
  }

  /**
   * Load BUSM from Mermaid erDiagram file or JSON file
   */
  loadBUSM(busmPath) {
    try {
      const absolutePath = path.resolve(busmPath);
      const busmData = fs.readFileSync(absolutePath, 'utf8');
      
      // Detect file type and parse accordingly
      if (busmPath.endsWith('.mmd') || busmData.trim().startsWith('erDiagram')) {
        console.log('📊 Parsing Mermaid erDiagram format...');
        this.busm = this.parseErDiagram(busmData);
      } else {
        console.log('📄 Parsing JSON format...');
        this.busm = JSON.parse(busmData);
      }
      
      // Cache entities for quick access
      this.entities = this.busm.entities || {};
      this.relationships = this.busm.relationships || {};
      this.enums = this.busm.enums || {};
      
      console.log(`✅ BUSM loaded: ${Object.keys(this.entities).length} entities`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load BUSM: ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // erDiagram Parser
  // ============================================

  /**
   * Parse Mermaid erDiagram format into BUSM JSON structure
   */
  parseErDiagram(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const entities = {};
    const relationships = {};
    
    let currentEntity = null;
    let parsingEntity = false;
    
    for (const line of lines) {
      // Skip erDiagram declaration
      if (line === 'erDiagram') {
        continue;
      }
      
      // Entity definition start
      if (line.includes('{') && !line.includes('||') && !line.includes('}|')) {
        const entityMatch = line.match(/^([A-Z_]+)\s*\{/);
        if (entityMatch) {
          currentEntity = entityMatch[1];
          parsingEntity = true;
          entities[currentEntity] = {
            tableName: currentEntity.toLowerCase(),
            primaryKey: 'id',
            description: `${currentEntity} entity`,
            fields: {}
          };
          continue;
        }
      }
      
      // Entity definition end
      if (line === '}') {
        parsingEntity = false;
        currentEntity = null;
        continue;
      }
      
      // Parse entity fields
      if (parsingEntity && currentEntity) {
        const fieldMatch = line.match(/^(\w+)\s+(\w+)(?:\s+(PK|FK))?(?:\s+"([^"]+)")?/);
        if (fieldMatch) {
          const [, type, fieldName, constraint, description] = fieldMatch;
          
          const field = {
            type: this.mapMermaidTypeToStandard(type),
            required: constraint === 'PK' || false,
            primaryKey: constraint === 'PK',
            foreignKey: constraint === 'FK' ? true : undefined,
            description: description || `${currentEntity} ${fieldName}`
          };
          
          // Clean up undefined values
          if (field.foreignKey === undefined) delete field.foreignKey;
          
          entities[currentEntity].fields[fieldName] = field;
          
          // Set primary key
          if (constraint === 'PK') {
            entities[currentEntity].primaryKey = fieldName;
          }
        }
      }
      
      // Parse relationships
      if (line.includes('||--') || line.includes('}|--')) {
        const relMatch = line.match(/^([A-Z_]+)\s+(\|\|--[o{}]+\{?)\s+([A-Z_]+)(?:\s*:\s*"([^"]+)")?/);
        if (relMatch) {
          const [, fromEntity, relSymbol, toEntity, relName] = relMatch;
          
          // Determine relationship type
          let relType = 'one-to-many';
          if (relSymbol.includes('}|--||')) relType = 'many-to-one';
          if (relSymbol.includes('||--||')) relType = 'one-to-one';
          if (relSymbol.includes('}|--o{')) relType = 'many-to-many';
          
          const relationshipKey = `${fromEntity}.${relName || toEntity.toLowerCase()}`;
          relationships[relationshipKey] = {
            name: relName || toEntity.toLowerCase(),
            type: relType,
            from: fromEntity,
            to: toEntity,
            foreignKey: `${toEntity}ID` // Convention-based FK name
          };
        }
      }
    }
    
    return {
      version: '1.0.0',
      metadata: {
        created: new Date().toISOString(),
        description: 'Parsed from Mermaid erDiagram',
        source: 'erDiagram-parser'
      },
      entities,
      relationships,
      enums: {} // erDiagram doesn't define enums directly
    };
  }
  
  /**
   * Map Mermaid field types to standard types
   */
  mapMermaidTypeToStandard(mermaidType) {
    const typeMap = {
      'int': 'integer',
      'string': 'string',
      'bool': 'boolean',
      'decimal': 'decimal',
      'datetime': 'datetime',
      'date': 'date',
      'jsonb': 'json',
      'timestamp': 'datetime'
    };
    
    return typeMap[mermaidType.toLowerCase()] || 'string';
  }

  // ============================================
  // Entity Operations
  // ============================================

  /**
   * Get complete entity definition
   */
  getEntity(entityName) {
    if (!this.entities[entityName]) {
      return null;
    }
    return this.entities[entityName];
  }

  /**
   * Get all entities
   */
  getAllEntities() {
    return Object.values(this.entities);
  }

  /**
   * Get all entity names
   */
  getAllEntityNames() {
    return Object.keys(this.entities);
  }

  /**
   * Check if entity exists
   */
  hasEntity(entityName) {
    return !!this.entities[entityName];
  }

  /**
   * Get entity primary key
   */
  getPrimaryKey(entityName) {
    const entity = this.getEntity(entityName);
    if (!entity) return null;
    
    // Check for explicit primaryKey field
    if (entity.primaryKey) {
      return entity.primaryKey;
    }
    
    // Look for field marked as primary
    for (const [fieldName, field] of Object.entries(entity.fields || {})) {
      if (field.primaryKey) {
        return fieldName;
      }
    }
    
    // Default to 'id' if exists
    if (entity.fields && entity.fields.id) {
      return 'id';
    }
    
    return null;
  }

  // ============================================
  // Field Operations
  // ============================================

  /**
   * Get field definition
   */
  getField(entityName, fieldPath) {
    const entity = this.getEntity(entityName);
    if (!entity || !entity.fields) return null;
    
    // Handle nested paths (e.g., 'contact.email')
    const pathParts = fieldPath.split('.');
    let current = entity.fields;
    
    for (const part of pathParts) {
      if (!current[part]) return null;
      current = current[part];
    }
    
    return current;
  }

  /**
   * Get all fields for entity
   */
  getFields(entityName) {
    const entity = this.getEntity(entityName);
    if (!entity || !entity.fields) return [];
    
    return Object.entries(entity.fields).map(([name, definition]) => ({
      name,
      ...definition
    }));
  }

  /**
   * Get field type
   */
  getFieldType(entityName, fieldPath) {
    const field = this.getField(entityName, fieldPath);
    return field ? field.type : null;
  }

  /**
   * Get field constraints
   */
  getFieldConstraints(entityName, fieldPath) {
    const field = this.getField(entityName, fieldPath);
    return field ? field.constraints || {} : {};
  }

  /**
   * Get required fields
   */
  getRequiredFields(entityName) {
    const fields = this.getFields(entityName);
    return fields
      .filter(field => field.required === true)
      .map(field => field.name);
  }

  // ============================================
  // Relationship Operations
  // ============================================

  /**
   * Get relationship definition
   */
  getRelationship(fromEntity, relationName) {
    const key = `${fromEntity}.${relationName}`;
    return this.relationships[key] || null;
  }

  /**
   * Get all relationships for entity
   */
  getRelationships(entityName) {
    const relationships = [];
    
    for (const [key, relationship] of Object.entries(this.relationships)) {
      if (relationship.from === entityName || relationship.to === entityName) {
        relationships.push(relationship);
      }
    }
    
    return relationships;
  }

  /**
   * Check if two entities are related
   */
  areRelated(entity1, entity2) {
    for (const relationship of Object.values(this.relationships)) {
      if ((relationship.from === entity1 && relationship.to === entity2) ||
          (relationship.from === entity2 && relationship.to === entity1)) {
        return true;
      }
    }
    return false;
  }

  // ============================================
  // Validation Operations
  // ============================================

  /**
   * Get validation rules for field
   */
  getValidationRules(entityName, fieldPath) {
    const field = this.getField(entityName, fieldPath);
    return field ? field.validation || [] : [];
  }

  /**
   * Validate data against BUSM
   */
  validateData(entityName, data) {
    const entity = this.getEntity(entityName);
    if (!entity) {
      return {
        valid: false,
        errors: [`Entity '${entityName}' not found in BUSM`]
      };
    }

    const errors = [];
    
    // Check required fields
    const requiredFields = this.getRequiredFields(entityName);
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        errors.push(`Required field '${field}' is missing`);
      }
    }
    
    // Check field types and constraints
    for (const [fieldName, value] of Object.entries(data)) {
      const field = this.getField(entityName, fieldName);
      if (!field) {
        errors.push(`Field '${fieldName}' not defined in entity '${entityName}'`);
        continue;
      }
      
      // Check constraints
      const constraints = field.constraints || {};
      if (constraints.minLength && value.length < constraints.minLength) {
        errors.push(`Field '${fieldName}' must be at least ${constraints.minLength} characters`);
      }
      if (constraints.maxLength && value.length > constraints.maxLength) {
        errors.push(`Field '${fieldName}' must be at most ${constraints.maxLength} characters`);
      }
      if (constraints.min && value < constraints.min) {
        errors.push(`Field '${fieldName}' must be at least ${constraints.min}`);
      }
      if (constraints.max && value > constraints.max) {
        errors.push(`Field '${fieldName}' must be at most ${constraints.max}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ============================================
  // Enum Operations
  // ============================================

  /**
   * Get enum definition
   */
  getEnum(enumName) {
    return this.enums[enumName] || null;
  }

  /**
   * Get all enum values
   */
  getEnumValues(enumName) {
    const enumDef = this.getEnum(enumName);
    return enumDef ? enumDef.values || [] : [];
  }

  // ============================================
  // Module Support
  // ============================================

  /**
   * Get entities for a specific module
   */
  getModuleEntities(moduleConfig) {
    const result = {
      owned: [],
      referenced: []
    };
    
    // Get owned entities
    if (moduleConfig.entities && moduleConfig.entities.owned) {
      for (const entityName of moduleConfig.entities.owned) {
        const entity = this.getEntity(entityName);
        if (entity) {
          result.owned.push(entity);
        }
      }
    }
    
    // Get referenced entities
    if (moduleConfig.entities && moduleConfig.entities.referenced) {
      for (const entityName of moduleConfig.entities.referenced) {
        const entity = this.getEntity(entityName);
        if (entity) {
          result.referenced.push(entity);
        }
      }
    }
    
    return result;
  }

  /**
   * Filter entity fields for a specific phase
   */
  filterFieldsForPhase(entityName, phase) {
    const entity = this.getEntity(entityName);
    if (!entity) return [];
    
    const fields = this.getFields(entityName);
    
    // Phase-based filtering logic
    if (phase === 1) {
      // Phase 1: Only essential fields
      return fields.filter(field => 
        field.essential === true || 
        field.phase === 1 ||
        field.required === true
      );
    } else if (phase === 2) {
      // Phase 2: Essential + common fields
      return fields.filter(field => 
        field.phase <= 2 ||
        field.complexity !== 'advanced'
      );
    }
    
    // Phase 3+: All fields
    return fields;
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get summary of BUSM contents
   */
  getSummary() {
    return {
      version: this.busm?.version || 'unknown',
      entityCount: Object.keys(this.entities).length,
      entities: Object.keys(this.entities),
      relationshipCount: Object.keys(this.relationships).length,
      enumCount: Object.keys(this.enums).length,
      enums: Object.keys(this.enums)
    };
  }

  /**
   * Export entity as module YAML format
   */
  exportEntityAsYAML(entityName, options = {}) {
    const entity = this.getEntity(entityName);
    if (!entity) return null;
    
    const { phase = 1, includeRelationships = true } = options;
    
    // Filter fields based on phase
    const fields = this.filterFieldsForPhase(entityName, phase);
    
    // Build YAML structure
    const yaml = {
      entity: {
        name: entityName,
        source: `BUSM.${entityName}`,
        phase: phase,
        fields: fields.map(field => ({
          name: field.name,
          type: field.type,
          required: field.required || false,
          constraints: field.constraints,
          validation: field.validation
        }))
      }
    };
    
    if (includeRelationships) {
      yaml.relationships = this.getRelationships(entityName);
    }
    
    return yaml;
  }
}

/**
 * BUSM Factory - Helper to create BUSM from various sources
 */
class BUSMFactory {
  /**
   * Create BUSM from SQL schema
   */
  static fromSQL(sqlSchema) {
    // Parse SQL and create BUSM structure
    // This would be implemented based on SQL parsing needs
    return {
      version: '1.0.0',
      entities: {},
      relationships: {},
      enums: {}
    };
  }

  /**
   * Create BUSM from existing YAML files
   */
  static fromYAML(yamlFiles) {
    // Combine multiple YAML files into BUSM
    // This would be implemented based on YAML structure
    return {
      version: '1.0.0',
      entities: {},
      relationships: {},
      enums: {}
    };
  }

  /**
   * Create sample BUSM for testing
   */
  static createSample() {
    return {
      version: '1.0.0',
      entities: {
        Account: {
          primaryKey: 'id',
          fields: {
            id: {
              type: 'uuid',
              required: true,
              primaryKey: true
            },
            accountName: {
              type: 'string',
              required: true,
              constraints: {
                minLength: 3,
                maxLength: 100
              }
            },
            accountType: {
              type: 'enum',
              enum: 'AccountType',
              required: true
            },
            status: {
              type: 'enum',
              enum: 'AccountStatus',
              required: true
            },
            email: {
              type: 'email',
              required: false,
              validation: [
                { pattern: '^[\\w\\.]+@[\\w\\.]+$' }
              ]
            },
            phone: {
              type: 'phone',
              required: false
            },
            address: {
              type: 'string',
              required: false,
              constraints: {
                maxLength: 500
              }
            },
            creditLimit: {
              type: 'decimal',
              required: false,
              phase: 2
            },
            taxId: {
              type: 'string',
              required: false,
              phase: 2
            }
          }
        },
        Contact: {
          primaryKey: 'id',
          fields: {
            id: {
              type: 'uuid',
              required: true,
              primaryKey: true
            },
            firstName: {
              type: 'string',
              required: true
            },
            lastName: {
              type: 'string',
              required: true
            },
            email: {
              type: 'email',
              required: true
            },
            phone: {
              type: 'phone',
              required: false
            },
            accountId: {
              type: 'uuid',
              required: false,
              foreignKey: 'Account.id'
            }
          }
        }
      },
      relationships: {
        'Account.contacts': {
          name: 'contacts',
          type: 'one-to-many',
          from: 'Account',
          to: 'Contact',
          foreignKey: 'accountId'
        }
      },
      enums: {
        AccountType: {
          values: ['Residential', 'Commercial', 'Industrial', 'Other']
        },
        AccountStatus: {
          values: ['Active', 'Inactive', 'Pending', 'Suspended']
        }
      }
    };
  }
}

// ============================================
// CLI Functionality
// ============================================

/**
 * Generate Stage 1 outputs from BUSM with proper processor/agent separation
 * 
 * ARCHITECTURE: This function now properly separates concerns:
 * - Entity filtering decisions (Agent responsibility) 
 * - Data transformation (Processor responsibility)
 */
function generateStage1Outputs(busmPath, outputDir, featureSpec = null) {
  const fs = require('fs');
  const path = require('path');

  console.log('🚀 Generating Stage 1 outputs from BUSM...');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  }

  // STAGE 1: Load raw BUSM data (Processor)
  const reader = new BUSMReader(busmPath);
  const allAvailableEntities = reader.getAllEntityNames();
  console.log(`📊 Loaded ${allAvailableEntities.length} entities from BUSM`);

  // STAGE 2: Filter entities for business context (Agent Decision)
  let entityNames;
  if (featureSpec) {
    console.log('🧠 Applying Entity Filter Agent logic...');
    entityNames = applyEntityFilterAgent(allAvailableEntities, featureSpec, reader);
    console.log(`🎯 Selected ${entityNames.length}/${allAvailableEntities.length} entities for feature: ${featureSpec.featureName || 'Unknown'}`);
  } else {
    console.log('⚠️  WARNING: No feature specification provided - using ALL entities (architectural violation)');
    console.log('   This should only happen for testing/debugging purposes');
    entityNames = allAvailableEntities;
  }

  // STAGE 3: Transform selected entities (Processor)
  console.log('📋 Generating entities.json...');
  const entities = [];
  
  for (const entityName of entityNames) {
    const entity = reader.getEntity(entityName);
    if (entity) {
      const entityOutput = {
        name: entityName,
        id: entityName.toLowerCase(),
        fields: reader.getFields(entityName).map(field => field.name || field.field),
        properties: entity.fields || {},
        relationships: reader.getRelationships(entityName) || {},
        tableName: entity.tableName,
        primaryKey: entity.primaryKey,
        description: entity.description
      };
      entities.push(entityOutput);
    }
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'entities.json'), 
    JSON.stringify(entities, null, 2)
  );
  console.log(`✓ Generated entities.json with ${entities.length} entities`);

  // Generate business-rules.json
  console.log('📜 Generating business-rules.json...');
  const businessRules = [];
  
  // Extract validation rules from entity fields as business rules
  for (const entityName of entityNames) {
    const entity = reader.getEntity(entityName);
    if (entity && entity.fields) {
      for (const [fieldName, fieldDef] of Object.entries(entity.fields)) {
        if (fieldDef.validation || fieldDef.required || fieldDef.constraints) {
          const rule = {
            id: `BR-${entityName}-${fieldName}`,
            name: `${entityName} ${fieldName} Validation`,
            entity: entityName,
            conditions: [],
            actions: [],
            priority: fieldDef.required ? 'high' : 'medium'
          };

          // Add required field condition
          if (fieldDef.required) {
            rule.conditions.push({
              field: fieldName,
              operator: 'isRequired',
              value: null
            });
            rule.actions.push({
              type: 'validate',
              message: `${entityName} ${fieldName} is required`
            });
          }

          // Add constraint conditions
          if (fieldDef.constraints) {
            const constraints = fieldDef.constraints;
            if (constraints.minLength) {
              rule.conditions.push({
                field: fieldName,
                operator: 'minLength',
                value: constraints.minLength
              });
            }
            if (constraints.maxLength) {
              rule.conditions.push({
                field: fieldName,
                operator: 'maxLength',
                value: constraints.maxLength
              });
            }
            if (constraints.pattern) {
              rule.conditions.push({
                field: fieldName,
                operator: 'matches',
                value: constraints.pattern
              });
            }
          }

          // Add validation rules
          if (fieldDef.validation) {
            for (const validation of fieldDef.validation) {
              if (validation.pattern) {
                rule.conditions.push({
                  field: fieldName,
                  operator: 'matches',
                  value: validation.pattern
                });
              }
            }
          }

          if (rule.conditions.length > 0) {
            businessRules.push(rule);
          }
        }
      }
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'business-rules.json'),
    JSON.stringify(businessRules, null, 2)
  );
  console.log(`✓ Generated business-rules.json with ${businessRules.length} rules`);

  // Generate busm-subset.mmd
  console.log('🗺️ Generating busm-subset.mmd...');
  let mermaidContent = 'erDiagram\n';
  
  for (const entityName of entityNames) {
    const entity = reader.getEntity(entityName);
    if (entity && entity.fields) {
      mermaidContent += `    ${entityName} {\n`;
      
      for (const [fieldName, fieldDef] of Object.entries(entity.fields)) {
        const type = fieldDef.type || 'string';
        const pk = fieldDef.primaryKey ? 'PK' : '';
        const fk = fieldDef.foreignKey ? 'FK' : '';
        const desc = fieldDef.description || `${entityName} ${fieldName}`;
        
        mermaidContent += `        ${type} ${fieldName} ${pk}${fk} "${desc}"\n`;
      }
      
      mermaidContent += '    }\n    \n';
    }
  }

  // Add relationships
  for (const entityName of entityNames) {
    const relationships = reader.getRelationships(entityName);
    for (const [relName, relDef] of Object.entries(relationships)) {
      if (relDef.type === 'one-to-many') {
        mermaidContent += `    ${entityName} ||--o{ ${relDef.to} : "${relName}"\n`;
      } else if (relDef.type === 'many-to-one') {
        mermaidContent += `    ${relDef.to} ||--o{ ${entityName} : "${relName}"\n`;
      }
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'busm-subset.mmd'),
    mermaidContent
  );
  console.log(`✓ Generated busm-subset.mmd with entity relationships`);

  console.log('✅ Stage 1 output generation complete!');
  return {
    entities: entities.length,
    rules: businessRules.length,
    outputDir
  };
}

/**
 * List all entities in BUSM
 */
function listEntities(busmPath) {
  const reader = new BUSMReader(busmPath);
  const entityNames = reader.getAllEntityNames();
  
  console.log(`📋 BUSM Entities (${entityNames.length} total):`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const entityName of entityNames) {
    const entity = reader.getEntity(entityName);
    const fieldCount = entity.fields ? Object.keys(entity.fields).length : 0;
    const relationships = reader.getRelationships(entityName);
    const relCount = Object.keys(relationships).length;
    
    console.log(`${entityName.padEnd(20)} | ${fieldCount} fields | ${relCount} relationships`);
    if (entity.description) {
      console.log(`${''.padEnd(20)} | ${entity.description}`);
    }
  }
  
  return entityNames;
}

/**
 * Validate BUSM model integrity
 */
function validateBUSM(busmPath) {
  console.log('🔍 Validating BUSM model integrity...');
  
  try {
    const reader = new BUSMReader(busmPath);
    const issues = [];
    const warnings = [];
    
    // Check entities
    const entityNames = reader.getAllEntityNames();
    console.log(`✓ Found ${entityNames.length} entities`);
    
    for (const entityName of entityNames) {
      const entity = reader.getEntity(entityName);
      
      // Check for primary key
      if (!entity.primaryKey) {
        issues.push(`Entity '${entityName}' missing primary key`);
      }
      
      // Check fields
      if (!entity.fields || Object.keys(entity.fields).length === 0) {
        issues.push(`Entity '${entityName}' has no fields defined`);
      } else {
        // Check for required fields without constraints
        for (const [fieldName, fieldDef] of Object.entries(entity.fields)) {
          if (fieldDef.required && !fieldDef.constraints && fieldDef.type === 'string') {
            warnings.push(`Entity '${entityName}' field '${fieldName}' is required but has no constraints`);
          }
        }
      }
      
      // Check relationships
      const relationships = reader.getRelationships(entityName);
      for (const [relName, relDef] of Object.entries(relationships)) {
        if (relDef.to && !entityNames.includes(relDef.to)) {
          issues.push(`Entity '${entityName}' relationship '${relName}' references non-existent entity '${relDef.to}'`);
        }
      }
    }
    
    // Report results
    if (issues.length === 0) {
      console.log('✅ BUSM validation passed');
    } else {
      console.log(`❌ BUSM validation failed with ${issues.length} issues:`);
      for (const issue of issues) {
        console.log(`  - ${issue}`);
      }
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️ Found ${warnings.length} warnings:`);
      for (const warning of warnings) {
        console.log(`  - ${warning}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
      warnings,
      entityCount: entityNames.length
    };
    
  } catch (error) {
    console.error('💥 BUSM validation failed:', error.message);
    return {
      valid: false,
      issues: [error.message],
      warnings: [],
      entityCount: 0
    };
  }
}

/**
 * Show BUSM summary
 */
function showSummary(busmPath) {
  console.log('📊 BUSM Model Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const reader = new BUSMReader(busmPath);
    const summary = reader.getSummary();
    
    console.log(`Version: ${summary.version}`);
    console.log(`Entities: ${summary.entityCount}`);
    console.log(`Relationships: ${summary.relationshipCount}`);
    console.log(`Enums: ${summary.enumCount}`);
    
    if (summary.entities.length > 0) {
      console.log('\nEntities:');
      for (const entityName of summary.entities) {
        const entity = reader.getEntity(entityName);
        const fieldCount = entity.fields ? Object.keys(entity.fields).length : 0;
        console.log(`  - ${entityName} (${fieldCount} fields)`);
      }
    }
    
    if (summary.enums.length > 0) {
      console.log('\nEnums:');
      for (const enumName of summary.enums) {
        const enumDef = reader.getEnum(enumName);
        const valueCount = enumDef.values ? enumDef.values.length : 0;
        console.log(`  - ${enumName} (${valueCount} values)`);
      }
    }
    
    return summary;
    
  } catch (error) {
    console.error('💥 Failed to generate summary:', error.message);
    return null;
  }
}

// CLI Handler
if (require.main === module) {
  const args = process.argv.slice(2);
  const defaultBusmPath = path.join(__dirname, '../../../00-requirements/models/BUSM.mmd');
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
BUSM Reader - Business Unified Schema Model Interface

Usage:
  node busm-reader.js <command> [options]

Commands:
  generate         Generate Stage 1 outputs from BUSM
  list-entities    List all entities in BUSM  
  validate         Validate BUSM model integrity
  summary          Show BUSM model summary

Options:
  --busm <path>    Path to BUSM file (.mmd or .json) (default: ../../00-requirements/models/BUSM.mmd)
  --output <dir>   Output directory for generated files (default: ./stage1-outputs)
  --help, -h       Show this help message

Examples:
  node busm-reader.js generate --output ./stage1-outputs
  node busm-reader.js generate --busm /path/to/custom-BUSM.mmd --output ./outputs
  node busm-reader.js list-entities
  node busm-reader.js validate --busm ./custom-busm.mmd
  node busm-reader.js summary
`);
    process.exit(0);
  }

  const command = args[0];
  let busmPath = defaultBusmPath;
  let outputDir = './stage1-outputs';

  // Parse options
  const busmIndex = args.indexOf('--busm');
  if (busmIndex !== -1 && args[busmIndex + 1]) {
    busmPath = args[busmIndex + 1];
  }

  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputDir = args[outputIndex + 1];
  }

  // Execute command
  try {
    switch (command) {
      case 'generate':
        generateStage1Outputs(busmPath, outputDir);
        break;
        
      case 'list-entities':
        listEntities(busmPath);
        break;
        
      case 'validate':
        const validation = validateBUSM(busmPath);
        process.exit(validation.valid ? 0 : 1);
        break;
        
      case 'summary':
        showSummary(busmPath);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('Run with --help to see available commands');
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Command failed:', error.message);
    process.exit(1);
  }
}

// ============================================
// ENTITY FILTER AGENT - Non-Deterministic Business Decisions
// ============================================

/**
 * Entity Filter Agent - Makes business decisions about which entities to include
 * 
 * This implements the non-deterministic business logic that processors cannot handle.
 * It analyzes feature requirements and makes judgment calls about entity relevance.
 */
function applyEntityFilterAgent(availableEntities, featureSpec, reader) {
  console.log('🤔 Entity Filter Agent analyzing feature requirements...');
  
  const startTime = Date.now();
  const filterResult = {
    primaryEntities: [],
    secondaryEntities: [],
    excludedEntities: [],
    businessReason: ''
  };

  // BUSINESS DECISION LOGIC - Non-deterministic analysis
  
  // 1. Analyze feature context
  const featureContext = analyzeFeatureContext(featureSpec);
  
  // 2. Apply business rules for entity selection
  for (const entityName of availableEntities) {
    const entityAnalysis = analyzeEntityRelevance(entityName, featureContext, reader);
    
    if (entityAnalysis.importance === 'CRITICAL') {
      filterResult.primaryEntities.push(entityName);
    } else if (entityAnalysis.importance === 'HIGH' || entityAnalysis.importance === 'MEDIUM') {
      filterResult.secondaryEntities.push(entityName);
    } else {
      filterResult.excludedEntities.push({
        name: entityName,
        reason: entityAnalysis.businessReason
      });
    }
  }
  
  // 3. Validate business logic consistency
  validateEntityFilterDecision(filterResult, featureContext);
  
  const duration = Date.now() - startTime;
  console.log(`🎯 Entity Filter Agent completed in ${duration}ms`);
  console.log(`   Primary: ${filterResult.primaryEntities.length}, Secondary: ${filterResult.secondaryEntities.length}, Excluded: ${filterResult.excludedEntities.length}`);
  
  // Return combined selected entities
  return [...filterResult.primaryEntities, ...filterResult.secondaryEntities];
}

/**
 * Analyze feature context to understand business requirements
 */
function analyzeFeatureContext(featureSpec) {
  // Default feature analysis if none provided
  if (!featureSpec) {
    return {
      domain: 'GENERAL',
      userRole: 'USER',
      primaryWorkflow: 'CRUD',
      complexity: 'MEDIUM'
    };
  }
  
  // Extract context clues from feature specification
  const context = {
    domain: 'GENERAL',
    userRole: featureSpec.userRole || 'USER',
    primaryWorkflow: featureSpec.primaryWorkflow || 'VIEW',
    businessRules: featureSpec.businessRules || [],
    useCases: featureSpec.useCases || [],
    complexity: 'MEDIUM'
  };
  
  // Infer domain from feature name patterns
  if (featureSpec.featureName) {
    const name = featureSpec.featureName.toLowerCase();
    if (name.includes('account')) context.domain = 'ACCOUNT_MANAGEMENT';
    else if (name.includes('contact')) context.domain = 'CONTACT_MANAGEMENT';  
    else if (name.includes('service')) context.domain = 'SERVICE_MANAGEMENT';
    else if (name.includes('invoice') || name.includes('billing')) context.domain = 'FINANCIAL';
    else if (name.includes('report')) context.domain = 'REPORTING';
  }
  
  return context;
}

/**
 * Analyze individual entity relevance for the feature context
 */
function analyzeEntityRelevance(entityName, featureContext, reader) {
  const entity = reader.getEntity(entityName);
  
  // Business decision matrix based on context
  const analysis = {
    importance: 'LOW',
    businessReason: 'Default exclusion - not relevant to feature context'
  };
  
  // DOMAIN-BASED DECISIONS (Business judgment calls)
  
  switch (featureContext.domain) {
    case 'ACCOUNT_MANAGEMENT':
      if (entityName === 'ACCOUNT') {
        analysis.importance = 'CRITICAL';
        analysis.businessReason = 'Core entity for account management features';
      } else if (entityName === 'CONTACT') {
        analysis.importance = 'HIGH'; 
        analysis.businessReason = 'Account managers frequently need contact information';
      } else if (entityName === 'SERVICE_LOCATION') {
        analysis.importance = 'MEDIUM';
        analysis.businessReason = 'Accounts may have multiple service locations';
      }
      break;
      
    case 'CONTACT_MANAGEMENT':
      if (entityName === 'CONTACT') {
        analysis.importance = 'CRITICAL';
        analysis.businessReason = 'Core entity for contact management';
      } else if (entityName === 'ACCOUNT') {
        analysis.importance = 'HIGH';
        analysis.businessReason = 'Contacts belong to accounts - important relationship';
      }
      break;
      
    case 'FINANCIAL': 
      if (entityName === 'INVOICE') {
        analysis.importance = 'CRITICAL';
        analysis.businessReason = 'Primary financial data entity';
      } else if (entityName === 'ACCOUNT') {
        analysis.importance = 'HIGH';
        analysis.businessReason = 'Financial reports grouped by account';
      }
      break;
      
    case 'GENERAL':
      // For general features, include core business entities
      if (['ACCOUNT', 'CONTACT', 'SERVICE_LOCATION'].includes(entityName)) {
        analysis.importance = 'MEDIUM';
        analysis.businessReason = 'Core business entity - generally useful';
      }
      break;
  }
  
  // WORKFLOW-BASED DECISIONS
  
  if (featureContext.primaryWorkflow === 'REPORTING') {
    // Reporting workflows need aggregation entities
    if (['ACCOUNT', 'INVOICE', 'SERVICE_LOCATION'].includes(entityName)) {
      analysis.importance = Math.max(analysis.importance, 'HIGH');
      analysis.businessReason += ' - Important for reporting aggregation';
    }
  }
  
  return analysis;
}

/**
 * Validate that entity filter decisions make business sense
 */
function validateEntityFilterDecision(filterResult, featureContext) {
  const issues = [];
  
  // Must have at least one primary entity
  if (filterResult.primaryEntities.length === 0) {
    issues.push('No primary entities selected - feature will have no core functionality');
  }
  
  // Shouldn't select too many entities for simple features  
  const totalSelected = filterResult.primaryEntities.length + filterResult.secondaryEntities.length;
  if (totalSelected > 10 && featureContext.complexity !== 'COMPLEX') {
    issues.push(`Selected ${totalSelected} entities for ${featureContext.complexity} feature - may be too many`);
  }
  
  if (issues.length > 0) {
    console.log('⚠️  Entity Filter Agent validation warnings:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
}

module.exports = {
  BUSMReader,
  BUSMFactory
};