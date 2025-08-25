#!/usr/bin/env node

/**
 * BUSM Registry - Central data model contract for all processors
 * 
 * This registry provides:
 * - Entity definitions and relationships from the BUSM
 * - Validation functions for data integrity
 * - Mock data generation rules
 * - Relationship cardinality enforcement
 */

const BUSM = {
  // Core entity definitions from the BUSM
  entities: {
    Account: {
      tableName: 'ACCOUNT',
      primaryKey: 'AccountID',
      required: ['AccountID', 'AccountName', 'AccountType', 'Status'],
      fields: {
        AccountID: { type: 'int', pk: true },
        AccountName: { type: 'string', maxLength: 255 },
        AccountType: { type: 'string', enum: ['Residential', 'Commercial', 'Municipal', 'Industrial'] },
        BillingStreetAddress: { type: 'string' },
        BillingCity: { type: 'string' },
        BillingState: { type: 'string', maxLength: 2 },
        BillingZipCode: { type: 'string', maxLength: 10 },
        Status: { type: 'string', enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' }
      },
      relationships: {
        contacts: { type: '1:many', target: 'Contact', foreignKey: 'AccountID' },
        serviceLocations: { type: '1:many', target: 'ServiceLocation', foreignKey: 'AccountID' },
        serviceableItems: { type: '1:many', target: 'ServiceableItem', foreignKey: 'AccountID' },
        workOrders: { type: '1:many', target: 'WorkOrder', foreignKey: 'AccountID' },
        invoices: { type: '1:many', target: 'Invoice', foreignKey: 'AccountID' }
      },
      businessRules: {
        'cannotDeleteWithActiveWorkOrders': true,
        'requiresPrimaryContact': true,
        'billingAddressRequired': true
      }
    },

    Contact: {
      tableName: 'CONTACT',
      primaryKey: 'ContactID',
      required: ['ContactID', 'AccountID', 'FirstName', 'LastName'],
      fields: {
        ContactID: { type: 'int', pk: true },
        AccountID: { type: 'int', fk: 'Account' },
        FirstName: { type: 'string', maxLength: 100 },
        LastName: { type: 'string', maxLength: 100 },
        PhoneNumber: { type: 'string', maxLength: 20 },
        EmailAddress: { type: 'string', maxLength: 255, format: 'email' },
        IsPrimaryContact: { type: 'boolean', default: false },
        CommunicationPreference: { type: 'string', enum: ['Voice', 'Text', 'Email'], default: 'Email' }
      },
      relationships: {
        account: { type: 'many:1', target: 'Account', foreignKey: 'AccountID' },
        contactLocations: { type: '1:many', target: 'ContactLocation', foreignKey: 'ContactID' }
      },
      businessRules: {
        'onePrimaryPerAccount': true,
        'requirePhoneOrEmail': true
      }
    },

    ServiceLocation: {
      tableName: 'SERVICE_LOCATION',
      primaryKey: 'ServiceLocationID',
      required: ['ServiceLocationID', 'AccountID', 'LocationName', 'StreetAddress', 'City', 'State', 'PostalCode'],
      fields: {
        ServiceLocationID: { type: 'int', pk: true },
        AccountID: { type: 'int', fk: 'Account' },
        GeographicAreaID: { type: 'int', fk: 'GeographicArea' },
        LocationName: { type: 'string', maxLength: 255 },
        StreetAddress: { type: 'string', maxLength: 255 },
        AddressLine2: { type: 'string', maxLength: 255 },
        City: { type: 'string', maxLength: 100 },
        State: { type: 'string', maxLength: 2 },
        PostalCode: { type: 'string', maxLength: 10 },
        Country: { type: 'string', default: 'USA' },
        Latitude: { type: 'decimal', precision: 10, scale: 7 },
        Longitude: { type: 'decimal', precision: 10, scale: 7 },
        AccessInformation: { type: 'string', maxLength: 500 },
        Notes: { type: 'text' }
      },
      relationships: {
        account: { type: 'many:1', target: 'Account', foreignKey: 'AccountID' },
        geographicArea: { type: 'many:1', target: 'GeographicArea', foreignKey: 'GeographicAreaID' },
        serviceableItems: { type: '1:many', target: 'ServiceableItem', foreignKey: 'PrimaryServiceLocationID' },
        workOrders: { type: '1:many', target: 'WorkOrder', foreignKey: 'ServiceLocationID' },
        contactLocations: { type: '1:many', target: 'ContactLocation', foreignKey: 'ServiceLocationID' }
      },
      businessRules: {
        'uniqueAddressPerAccount': true,
        'requiresGeographicArea': false,
        'coordinatesAutoGenerate': true
      }
    },

    ServiceableItem: {
      tableName: 'SERVICEABLE_ITEM',
      primaryKey: 'ServiceableItemID',
      required: ['ServiceableItemID', 'AccountID', 'DomainID', 'ItemName', 'ItemType', 'Status'],
      fields: {
        ServiceableItemID: { type: 'int', pk: true },
        AccountID: { type: 'int', fk: 'Account' },
        PrimaryServiceLocationID: { type: 'int', fk: 'ServiceLocation' },
        DomainID: { type: 'int', fk: 'Domain' },
        ItemName: { type: 'string', maxLength: 255 },
        ItemType: { type: 'string', maxLength: 100 },
        Identifier1: { type: 'string', maxLength: 100, description: 'VIN, Hull ID, Serial #' },
        Identifier2: { type: 'string', maxLength: 100, description: 'Reg number, Asset Tag' },
        Description: { type: 'text' },
        Status: { type: 'string', enum: ['Active', 'In Storage', 'Needs Repair', 'Retired'], default: 'Active' }
      },
      relationships: {
        account: { type: 'many:1', target: 'Account', foreignKey: 'AccountID' },
        primaryLocation: { type: 'many:1', target: 'ServiceLocation', foreignKey: 'PrimaryServiceLocationID' },
        domain: { type: 'many:1', target: 'Domain', foreignKey: 'DomainID' },
        properties: { type: '1:many', target: 'ServiceableItemProperty', foreignKey: 'ServiceableItemID' },
        workOrders: { type: '1:many', target: 'WorkOrder', foreignKey: 'ServiceableItemID' },
        workOrderItems: { type: '1:many', target: 'WorkOrderItem', foreignKey: 'ServiceableItemID' }
      },
      businessRules: {
        'requiresIdentifier': true,
        'domainSpecificValidation': true
      }
    },

    WorkOrder: {
      tableName: 'WORK_ORDER',
      primaryKey: 'WorkOrderID',
      required: ['WorkOrderID', 'AccountID', 'WorkOrderType', 'WorkOrderStatus'],
      fields: {
        WorkOrderID: { type: 'int', pk: true },
        AccountID: { type: 'int', fk: 'Account' },
        ServiceLocationID: { type: 'int', fk: 'ServiceLocation' },
        ServiceableItemID: { type: 'int', fk: 'ServiceableItem' },
        WorkOrderType: { type: 'string', enum: ['Repair', 'Inspection', 'Maintenance', 'Installation'] },
        WorkOrderStatus: { type: 'string', enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'] },
        ScheduledDateTime: { type: 'datetime' },
        CompletionDateTime: { type: 'datetime' },
        Priority: { type: 'string', enum: ['High', 'Medium', 'Low'], default: 'Medium' },
        Summary: { type: 'string', maxLength: 500 },
        Notes_Internal: { type: 'text' },
        Notes_Customer: { type: 'text' }
      },
      relationships: {
        account: { type: 'many:1', target: 'Account', foreignKey: 'AccountID' },
        serviceLocation: { type: 'many:1', target: 'ServiceLocation', foreignKey: 'ServiceLocationID' },
        serviceableItem: { type: 'many:1', target: 'ServiceableItem', foreignKey: 'ServiceableItemID' },
        workOrderItems: { type: '1:many', target: 'WorkOrderItem', foreignKey: 'WorkOrderID' },
        assignments: { type: '1:many', target: 'WorkOrderAssignment', foreignKey: 'WorkOrderID' },
        invoice: { type: '1:1', target: 'Invoice', foreignKey: 'WorkOrderID' }
      },
      businessRules: {
        'requiresLocationOrItem': true,
        'cannotCompleteWithoutItems': true,
        'autoScheduleBasedOnPriority': true
      }
    },

    Domain: {
      tableName: 'DOMAIN',
      primaryKey: 'DomainID',
      required: ['DomainID', 'Name'],
      fields: {
        DomainID: { type: 'int', pk: true },
        Name: { type: 'string', maxLength: 100, enum: ['Boat', 'Pool', 'Lawncare', 'HVAC', 'Plumbing'] },
        Description: { type: 'text' }
      },
      relationships: {
        serviceableItems: { type: '1:many', target: 'ServiceableItem', foreignKey: 'DomainID' }
      }
    }
  },

  // Validation functions
  validate(entityType, data) {
    const entity = this.entities[entityType];
    if (!entity) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const errors = [];

    // Check required fields
    for (const field of entity.required) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate field types and constraints
    for (const [fieldName, fieldValue] of Object.entries(data)) {
      const fieldDef = entity.fields[fieldName];
      if (!fieldDef) {
        errors.push(`Unknown field: ${fieldName}`);
        continue;
      }

      // Type validation
      if (fieldDef.type === 'int' && !Number.isInteger(fieldValue)) {
        errors.push(`Field ${fieldName} must be an integer`);
      }

      // Enum validation
      if (fieldDef.enum && !fieldDef.enum.includes(fieldValue)) {
        errors.push(`Field ${fieldName} must be one of: ${fieldDef.enum.join(', ')}`);
      }

      // String length validation
      if (fieldDef.maxLength && fieldValue.length > fieldDef.maxLength) {
        errors.push(`Field ${fieldName} exceeds max length of ${fieldDef.maxLength}`);
      }

      // Email format validation
      if (fieldDef.format === 'email' && fieldValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fieldValue)) {
          errors.push(`Field ${fieldName} must be a valid email`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Mock data generation
  generateMock(entityType, overrides = {}, context = {}) {
    const entity = this.entities[entityType];
    if (!entity) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const mock = { ...overrides };

    // Generate required fields if not provided
    for (const fieldName of entity.required) {
      if (mock[fieldName] !== undefined) continue;

      const fieldDef = entity.fields[fieldName];
      
      // Handle foreign keys from context
      if (fieldDef.fk && context[fieldDef.fk]) {
        mock[fieldName] = context[fieldDef.fk];
        continue;
      }

      // Generate based on type
      switch (fieldDef.type) {
        case 'int':
          if (fieldDef.pk) {
            mock[fieldName] = Math.floor(Math.random() * 100000) + 1;
          } else {
            mock[fieldName] = Math.floor(Math.random() * 100) + 1;
          }
          break;
        
        case 'string':
          if (fieldDef.enum) {
            mock[fieldName] = fieldDef.enum[0];
          } else if (fieldName.toLowerCase().includes('name')) {
            mock[fieldName] = `${entityType} ${Math.floor(Math.random() * 1000)}`;
          } else if (fieldName.toLowerCase().includes('email')) {
            mock[fieldName] = `user${Math.floor(Math.random() * 1000)}@example.com`;
          } else if (fieldName.toLowerCase().includes('phone')) {
            mock[fieldName] = `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
          } else if (fieldName.toLowerCase().includes('address')) {
            mock[fieldName] = `${Math.floor(Math.random() * 9999) + 1} Main St`;
          } else if (fieldName.toLowerCase().includes('city')) {
            mock[fieldName] = 'Springfield';
          } else if (fieldName.toLowerCase().includes('state')) {
            mock[fieldName] = 'FL';
          } else if (fieldName.toLowerCase().includes('zip') || fieldName.toLowerCase().includes('postal')) {
            mock[fieldName] = String(Math.floor(Math.random() * 90000) + 10000);
          } else {
            mock[fieldName] = `${fieldName} Value`;
          }
          break;
        
        case 'boolean':
          mock[fieldName] = Math.random() > 0.5;
          break;
        
        case 'decimal':
          mock[fieldName] = (Math.random() * 100).toFixed(2);
          break;
        
        case 'datetime':
          const date = new Date();
          date.setDate(date.getDate() + Math.floor(Math.random() * 30));
          mock[fieldName] = date.toISOString();
          break;
        
        case 'text':
          mock[fieldName] = `${fieldName} description text`;
          break;
      }
    }

    // Apply defaults for non-required fields
    for (const [fieldName, fieldDef] of Object.entries(entity.fields)) {
      if (mock[fieldName] === undefined && fieldDef.default !== undefined) {
        mock[fieldName] = fieldDef.default;
      }
    }

    return mock;
  },

  // Generate related entities respecting relationships
  generateWithRelationships(entityType, count = 1, options = {}) {
    const results = {
      [entityType]: []
    };

    for (let i = 0; i < count; i++) {
      const entity = this.generateMock(entityType, {}, options.context || {});
      results[entityType].push(entity);

      // Generate related entities based on relationships
      const entityDef = this.entities[entityType];
      if (entityDef.relationships && options.includeRelated) {
        for (const [relName, relDef] of Object.entries(entityDef.relationships)) {
          if (relDef.type === '1:many' && options.includeRelated.includes(relName)) {
            const relCount = options.relatedCounts?.[relName] || 3;
            results[relName] = results[relName] || [];
            
            for (let j = 0; j < relCount; j++) {
              const relatedEntity = this.generateMock(relDef.target, {}, {
                [entityType]: entity[entityDef.primaryKey]
              });
              results[relName].push(relatedEntity);
            }
          }
        }
      }
    }

    return results;
  },

  // Get relationship info
  getRelationship(fromEntity, toEntity) {
    const entity = this.entities[fromEntity];
    if (!entity || !entity.relationships) return null;

    for (const [relName, relDef] of Object.entries(entity.relationships)) {
      if (relDef.target === toEntity) {
        return {
          name: relName,
          ...relDef
        };
      }
    }

    return null;
  },

  // Check if entities can be linked
  canLink(entity1Type, entity1Id, entity2Type, entity2Id) {
    const relationship = this.getRelationship(entity1Type, entity2Type);
    if (!relationship) {
      const reverseRel = this.getRelationship(entity2Type, entity1Type);
      return !!reverseRel;
    }
    return true;
  },

  // Get all entities
  getAllEntities() {
    return Object.keys(this.entities);
  },

  // Get entity definition
  getEntity(entityType) {
    return this.entities[entityType];
  },

  // Export for processor use
  exportForProcessor() {
    return {
      entities: this.getAllEntities(),
      validate: this.validate.bind(this),
      generateMock: this.generateMock.bind(this),
      generateWithRelationships: this.generateWithRelationships.bind(this),
      getRelationship: this.getRelationship.bind(this),
      canLink: this.canLink.bind(this),
      getEntity: this.getEntity.bind(this)
    };
  }
};

// Export for use in processors
module.exports = BUSM;

// CLI testing interface
if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'list':
      console.log('Available entities:');
      BUSM.getAllEntities().forEach(e => console.log(`  - ${e}`));
      break;
    
    case 'mock':
      const entityType = args[0];
      if (!entityType) {
        console.error('Please specify entity type');
        process.exit(1);
      }
      const mock = BUSM.generateMock(entityType);
      console.log(JSON.stringify(mock, null, 2));
      break;
    
    case 'validate':
      const valEntityType = args[0];
      const valData = JSON.parse(args[1] || '{}');
      const result = BUSM.validate(valEntityType, valData);
      console.log(JSON.stringify(result, null, 2));
      break;
    
    case 'relationships':
      const relEntity = args[0];
      if (!relEntity) {
        console.error('Please specify entity type');
        process.exit(1);
      }
      const entity = BUSM.getEntity(relEntity);
      if (entity && entity.relationships) {
        console.log(`Relationships for ${relEntity}:`);
        for (const [name, def] of Object.entries(entity.relationships)) {
          console.log(`  ${name}: ${def.type} -> ${def.target}`);
        }
      }
      break;
    
    default:
      console.log(`
BUSM Registry CLI
=================

Commands:
  list                     - List all entities
  mock <entity>           - Generate mock data for entity
  validate <entity> <json> - Validate data against entity schema
  relationships <entity>   - Show relationships for entity

Examples:
  node busm-registry.js list
  node busm-registry.js mock Account
  node busm-registry.js validate Account '{"AccountName":"Test"}'
  node busm-registry.js relationships WorkOrder
      `);
  }
}