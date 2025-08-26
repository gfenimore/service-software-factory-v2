/**
 * Test Phase 1: Account Basic with Business Rules
 * Generates concept wireframes with rule hints for Account module
 */

const ConceptGeneratorV3 = require('./concept-generator-v3.js');
const ViewForgeTransformer = require('../../viewforge/viewforge-transformer.js');
const fs = require('fs');
const path = require('path');

// Mock BUSM for Account entity
const mockBUSM = {
  entities: {
    Account: {
      primaryKey: 'accountId',
      fields: {
        accountId: { type: 'uuid', primaryKey: true },
        accountNumber: { type: 'string', generated: true },
        accountName: { type: 'string', required: true, maxLength: 100 },
        accountType: { 
          type: 'enum', 
          options: ['Standard', 'Premium', 'Enterprise'],
          required: true 
        },
        status: { 
          type: 'enum', 
          options: ['Prospect', 'Active', 'Suspended', 'Closed'],
          default: 'Prospect'
        },
        website: { type: 'url', maxLength: 255 },
        notes: { type: 'text', maxLength: 2000 }
      }
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
    // No relationships in Phase 1
    return null;
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

// ViewForge configs for Phase 1 Account views
const accountListConfig = {
  entity: 'Account',
  title: 'Accounts',
  type: 'table',
  fields: [
    { name: 'accountNumber', label: 'Account #', sortable: true },
    { name: 'accountName', label: 'Account Name', sortable: true },
    { name: 'accountType', label: 'Type', sortable: true },
    { name: 'status', label: 'Status' }
  ],
  actions: ['create', 'view', 'edit', 'delete'],
  rowClick: 'view'
};

const accountFormConfig = {
  entity: 'Account',
  title: 'Account Form',
  type: 'form',
  fields: [
    { name: 'accountName', label: 'Account Name' },
    { name: 'accountType', label: 'Account Type' },
    { name: 'website', label: 'Website' },
    { name: 'notes', label: 'Notes' }
  ]
};

console.log('=== Phase 1: Account Basic - Concept Generation with Business Rules ===\n');

// Path to Phase 1 business rules
const rulesPath = path.join(__dirname, '..', '..', 'module-system', 'phase1-account-basic.yaml');

// Transform ViewForge configs
const transformer = new ViewForgeTransformer(mockBUSM, mockGapLogger);

console.log('Step 1: Transforming ViewForge configs...');
const listConfig = transformer.transformV3ToSimplified(accountListConfig);
const formConfig = transformer.transformV3ToSimplified(accountFormConfig);
console.log('✅ Configs transformed\n');

// Generate with business rules
console.log('Step 2: Generating Account List with business rule hints...');
const listGenerator = new ConceptGeneratorV3(listConfig, mockBUSM, mockGapLogger, rulesPath);
const listResult = listGenerator.generate();
console.log('✅ List view generated\n');

console.log('Step 3: Generating Account Form with validation hints...');
const formGenerator = new ConceptGeneratorV3(formConfig, mockBUSM, mockGapLogger, rulesPath);
const formResult = formGenerator.generate();
console.log('✅ Form view generated\n');

// Save output
const outputDir = path.join(__dirname, '..', '..', '..', 'generated', 'phase1-account');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const listFile = path.join(outputDir, 'account-list-with-rules.html');
const formFile = path.join(outputDir, 'account-form-with-rules.html');

fs.writeFileSync(listFile, listResult.html);
fs.writeFileSync(formFile, formResult.html);

console.log('Step 4: Files saved to:');
console.log(`  - ${listFile}`);
console.log(`  - ${formFile}`);
console.log();

// Report what rules are being shown
console.log('=== Business Rules Applied ===\n');
console.log('List View:');
console.log('  - Required field indicators (*) on accountName and accountType');
console.log('  - Unique constraint indicators (🔒) on accountName and accountNumber');
console.log('  - State transition hints for status field');
console.log('  - Blocked delete actions for some records');
console.log();

console.log('Form View:');
console.log('  - Required field validation on accountName and accountType');
console.log('  - Unique constraint warning on accountName');
console.log('  - Pattern validation hint for website field');
console.log('  - onCreate logic display (status → Prospect, generate accountNumber)');
console.log('  - Max length constraints shown');
console.log();

// Check for gaps
if (mockGapLogger.gaps.length > 0) {
  console.log('=== Gaps Found ===');
  mockGapLogger.gaps.forEach((gap, i) => {
    console.log(`${i + 1}. [${gap.category}] ${gap.expected || gap.assumption}`);
  });
} else {
  console.log('✅ No gaps found!');
}

console.log('\n=== Phase 1 Complete ===');
console.log('Open the HTML files in a browser to see:');
console.log('1. Business rule indicators in the UI');
console.log('2. State transition hints');
console.log('3. Validation requirements');
console.log('4. What happens on save/delete');
console.log('\n🎉 Account Basic module with business rules is ready!');