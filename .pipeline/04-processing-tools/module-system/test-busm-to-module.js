#!/usr/bin/env node

/**
 * Test BUSM to Module Generation
 * Creates a module YAML from BUSM automatically
 */

const { BUSMReader } = require('../busm-reader/busm-reader');
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('TEST: BUSM to Module Generation');
console.log('Creating Account Module from BUSM Automatically!');
console.log('='.repeat(80));

// Initialize BUSM Reader
const busm = new BUSMReader();
const busmPath = path.join(__dirname, '../busm-reader/busm-model.json');

console.log('\n1. Loading BUSM Model...');
busm.loadBUSM(busmPath);

const summary = busm.getSummary();
console.log(`✅ Loaded ${summary.entityCount} entities from BUSM`);
console.log(`   Entities: ${summary.entities.join(', ')}`);

// Create Account Module for Phase 1
console.log('\n2. Creating Account Module (Phase 1)...');

const entityName = 'Account';
const phase = 1;

// Get entity from BUSM
const entity = busm.getEntity(entityName);
if (!entity) {
  console.error(`❌ Entity ${entityName} not found in BUSM`);
  process.exit(1);
}

// Get fields filtered for Phase 1
const allFields = busm.getFields(entityName);
const phaseFields = busm.filterFieldsForPhase(entityName, phase);

console.log(`   Total fields in BUSM: ${allFields.length}`);
console.log(`   Phase 1 fields: ${phaseFields.length}`);

// Create module configuration
const moduleConfig = {
  module: {
    id: 'account-management-phase1',
    name: 'Account Management Phase 1',
    version: '1.0.0',
    description: 'Core account management functionality - Phase 1',
    phase: 1,
    generatedFrom: 'BUSM',
    generatedAt: new Date().toISOString()
  },
  
  entity: {
    name: entityName,
    source: `BUSM.${entityName}`,
    phase: phase,
    fields: phaseFields.map(field => ({
      name: field.name,
      type: field.type,
      required: field.required || false,
      source: `BUSM.${entityName}.${field.name}`,
      ...(field.constraints ? { constraints: field.constraints } : {}),
      ...(field.validation ? { validation: field.validation } : {}),
      ...(field.enum ? { enum: field.enum } : {}),
      ...(field.description ? { description: field.description } : {})
    }))
  },
  
  views: [
    {
      type: 'list',
      name: 'account-list',
      entity: entityName,
      title: 'Account List',
      fields: ['accountName', 'accountType', 'status', 'email']
    },
    {
      type: 'detail',
      name: 'account-detail',
      entity: entityName,
      title: 'Account Details',
      sections: [
        {
          title: 'Basic Information',
          fields: ['accountName', 'accountType', 'status']
        },
        {
          title: 'Contact Information',
          fields: ['email', 'phone', 'address', 'city', 'state', 'zipCode']
        }
      ]
    },
    {
      type: 'form',
      name: 'account-form',
      entity: entityName,
      title: 'Account Form',
      fields: phaseFields.filter(f => !f.system).map(f => f.name)
    },
    {
      type: 'table',
      name: 'account-table',
      entity: entityName,
      title: 'Account Table',
      columns: [
        { field: 'accountName', label: 'Name', sortable: true },
        { field: 'accountType', label: 'Type', sortable: true },
        { field: 'status', label: 'Status', sortable: true },
        { field: 'email', label: 'Email' },
        { field: 'phone', label: 'Phone' }
      ]
    }
  ],
  
  businessRules: {
    validation: {
      required: busm.getRequiredFields(entityName)
    },
    enums: {}
  },
  
  navigation: {
    mainMenu: [
      {
        label: 'Accounts',
        view: 'account-list',
        icon: 'building'
      }
    ],
    dashboardWidgets: [
      'recent-accounts',
      'accounts-by-type',
      'accounts-by-status'
    ]
  }
};

// Add enum definitions from BUSM
const enumFields = phaseFields.filter(f => f.enum);
for (const field of enumFields) {
  const enumValues = busm.getEnumValues(field.enum);
  if (enumValues.length > 0) {
    moduleConfig.businessRules.enums[field.name] = enumValues;
    console.log(`   Added enum for ${field.name}: ${enumValues.join(', ')}`);
  }
}

// Add state transitions for status field
if (moduleConfig.businessRules.enums.status) {
  moduleConfig.businessRules.stateTransitions = {
    status: {
      'Pending': ['Active', 'Inactive'],
      'Active': ['Inactive', 'Suspended'],
      'Inactive': ['Active', 'Archived'],
      'Suspended': ['Active', 'Inactive'],
      'Archived': []  // Terminal state
    }
  };
  console.log('   Added state transitions for status field');
}

// Save the module configuration
console.log('\n3. Saving Module Configuration...');

const outputPath = path.join(__dirname, 'account-module-phase1-auto.yaml');
const yamlContent = yaml.stringify(moduleConfig);

fs.writeFileSync(outputPath, yamlContent);
console.log(`✅ Module saved to: ${outputPath}`);

// Display summary
console.log('\n' + '='.repeat(80));
console.log('MODULE GENERATION SUMMARY');
console.log('='.repeat(80));
console.log('\nGenerated from BUSM:');
console.log(`  Entity: ${entityName}`);
console.log(`  Phase: ${phase}`);
console.log(`  Fields: ${phaseFields.length} (from ${allFields.length} total)`);
console.log(`  Views: ${moduleConfig.views.length}`);
console.log(`  Required Fields: ${moduleConfig.businessRules.validation.required.join(', ')}`);
console.log(`  Enums: ${Object.keys(moduleConfig.businessRules.enums).join(', ')}`);

console.log('\nFields included in Phase 1:');
phaseFields.forEach(field => {
  const req = field.required ? '(required)' : '';
  const type = field.enum ? `enum[${field.enum}]` : field.type;
  console.log(`  • ${field.name}: ${type} ${req}`);
});

console.log('\n✨ SUCCESS! Module created automatically from BUSM!');
console.log('\n📋 What just happened:');
console.log('1. Loaded BUSM model (the enterprise source of truth)');
console.log('2. Selected Account entity');
console.log('3. Filtered fields for Phase 1 (essential only)');
console.log('4. Generated complete module configuration');
console.log('5. Added business rules and enums from BUSM');
console.log('6. Created views automatically');
console.log('7. Saved as YAML - ready for generators!');

console.log('\n🚀 Next steps:');
console.log('1. Run ViewForge transformer on this module');
console.log('2. Generate components with AST generator');
console.log('3. View wireframes with embedded gaps');

console.log('\n🎯 NO MANUAL YAML CREATION NEEDED!');