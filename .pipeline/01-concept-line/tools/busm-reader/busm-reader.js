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
   * Load BUSM from JSON file
   */
  loadBUSM(busmPath) {
    try {
      const absolutePath = path.resolve(busmPath);
      const busmData = fs.readFileSync(absolutePath, 'utf8');
      this.busm = JSON.parse(busmData);
      
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

module.exports = {
  BUSMReader,
  BUSMFactory
};