/**
 * Test Concept Generator V2
 * Tests generation with simplified ViewForge format
 */

const ConceptGeneratorV2 = require('./concept-generator-v2.js');
const ViewForgeTransformer = require('../../viewforge/viewforge-transformer.js');
const fs = require('fs');
const path = require('path');

// Mock BUSM
const mockBUSM = {
  entities: {
    Account: {
      primaryKey: 'accountId',
      fields: {
        accountId: { type: 'uuid', primaryKey: true },
        accountName: { type: 'string', required: true },
        status: { type: 'enum', options: ['Active', 'Inactive', 'Prospect'] },
        industry: { type: 'string' },
        annualRevenue: { type: 'decimal' }
      }
    },
    Contact: {
      primaryKey: 'contactId',
      fields: {
        contactId: { type: 'uuid', primaryKey: true },
        firstName: { type: 'string' },
        lastName: { type: 'string' }
      }
    }
  },
  
  relationships: {
    'Account.primaryContact': {
      type: 'one-to-one',
      from: 'Account',
      to: 'Contact',
      foreignKey: 'primaryContactId',
      targetEntity: 'Contact',
      targetKey: 'contactId'
    }
  },
  
  getEntity(name) {
    return this.entities[name];
  },
  
  getField(entity, fieldPath) {
    const ent = this.entities[entity];
    if (!ent) return null;
    return ent.fields[fieldPath];
  },
  
  getRelationship(entity, relationName) {
    return this.relationships[`${entity}.${relationName}`];
  }
};

// Mock Gap Logger
const mockGapLogger = {
  gaps: [],
  
  log(gap) {
    this.gaps.push(gap);
    console.log(`  GAP: [${gap.category}] ${gap.assumption || gap.expected}`);
  },
  
  getCurrentGaps() {
    return this.gaps;
  }
};

// ViewForge v3 config
const v3Config = {
  entity: 'Account',
  title: 'Account Management',
  type: 'table',
  settings: {
    pageSize: 25,
    sortable: true
  },
  fields: [
    { name: 'accountName', label: 'Account Name', sortable: true },
    { name: 'status', label: 'Status' },
    { name: 'industry', label: 'Industry' },
    { name: 'annualRevenue', label: 'Annual Revenue', sortable: true },
    { name: 'primaryContact.name', label: 'Primary Contact', type: 'relationship' }
  ],
  actions: ['view', 'edit', 'delete', 'create'],
  rowClick: 'view'
};

console.log('=== Testing Concept Generator V2 ===\n');

// Step 1: Transform ViewForge config
console.log('Step 1: Transforming ViewForge v3 to simplified format...');
const transformer = new ViewForgeTransformer(mockBUSM, mockGapLogger);
const simplifiedConfig = transformer.transformV3ToSimplified(v3Config);
console.log('✅ Transformation complete\n');

// Step 2: Generate concept HTML
console.log('Step 2: Generating concept HTML...');
mockGapLogger.gaps = []; // Reset gaps
const generator = new ConceptGeneratorV2(simplifiedConfig, mockBUSM, mockGapLogger);
const result = generator.generate();
console.log('✅ Generation complete\n');

// Step 3: Save output
const outputDir = path.join(__dirname, '..', '..', '..', 'generated', 'concept');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, `${simplifiedConfig.id}.html`);
fs.writeFileSync(outputFile, result.html);
console.log(`Step 3: Saved HTML to ${outputFile}\n`);

// Step 4: Report results
console.log('=== Generation Report ===\n');
console.log(`View ID: ${result.viewId}`);
console.log(`Entity: ${result.entity}`);
console.log(`Success: ${result.success ? '✅ Yes' : '❌ No'}`);
console.log(`HTML Size: ${(result.html.length / 1024).toFixed(2)} KB`);

if (result.gaps.length > 0) {
  console.log(`\nGaps Found: ${result.gaps.length}`);
  result.gaps.forEach((gap, i) => {
    console.log(`  ${i + 1}. [${gap.category}] ${gap.assumption || gap.expected}`);
  });
} else {
  console.log('\nNo gaps found during generation!');
}

// Step 5: Test other view types
console.log('\n=== Testing Other View Types ===\n');

// Test detail view
const detailConfig = {
  id: 'account-detail',
  type: 'detail',
  entity: 'Account',
  title: 'Account Details',
  display: {
    fields: [
      { path: 'accountName', label: 'Account Name' },
      { path: 'status', label: 'Status' },
      { path: 'industry', label: 'Industry' },
      { path: 'annualRevenue', label: 'Annual Revenue' },
      { path: 'primaryContact.name', label: 'Primary Contact', clickable: true }
    ],
    actions: ['edit', 'delete']
  },
  navigation: {
    onFieldClick: {
      'primaryContact.name': {
        target: 'contact-detail',
        params: ['primaryContact.contactId']
      }
    },
    onActionClick: {
      'edit': { target: 'account-form', mode: 'edit', params: ['accountId'] },
      'delete': { confirm: true, action: 'deleteAccount', params: ['accountId'] }
    }
  },
  dataSource: {
    entity: 'Account',
    includes: ['primaryContact']
  }
};

const detailGenerator = new ConceptGeneratorV2(detailConfig, mockBUSM, mockGapLogger);
const detailResult = detailGenerator.generate();
const detailFile = path.join(outputDir, 'account-detail.html');
fs.writeFileSync(detailFile, detailResult.html);
console.log(`✅ Generated detail view: ${detailFile}`);

// Test form view
const formConfig = {
  id: 'account-form',
  type: 'form',
  entity: 'Account',
  title: 'Edit Account',
  display: {
    fields: [
      { path: 'accountName', label: 'Account Name' },
      { path: 'status', label: 'Status' },
      { path: 'industry', label: 'Industry' },
      { path: 'annualRevenue', label: 'Annual Revenue' }
    ],
    actions: []
  },
  navigation: {},
  dataSource: { entity: 'Account' }
};

const formGenerator = new ConceptGeneratorV2(formConfig, mockBUSM, mockGapLogger);
const formResult = formGenerator.generate();
const formFile = path.join(outputDir, 'account-form.html');
fs.writeFileSync(formFile, formResult.html);
console.log(`✅ Generated form view: ${formFile}`);

console.log('\n=== Test Complete ===');
console.log(`\nGenerated files:`);
console.log(`  - ${outputFile}`);
console.log(`  - ${detailFile}`);
console.log(`  - ${formFile}`);
console.log(`\nOpen these files in a browser to see the clickable wireframes!`);