/**
 * Test ViewForge Transformer
 * Tests the transformation from v3 to simplified format
 */

const ViewForgeTransformer = require('./viewforge-transformer.js');

// Mock BUSM for testing
const mockBUSM = {
  entities: {
    Account: {
      primaryKey: 'accountId',
      fields: {
        accountId: { type: 'uuid', primaryKey: true },
        accountName: { type: 'string', required: true },
        status: { type: 'enum', options: ['Active', 'Inactive'] },
        industry: { type: 'string' },
        annualRevenue: { type: 'decimal' },
        primaryContactId: { type: 'uuid', foreignKey: 'Contact.contactId' }
      }
    },
    Contact: {
      primaryKey: 'contactId',
      fields: {
        contactId: { type: 'uuid', primaryKey: true },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' }
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
  
  getRelationship(entity, relationName) {
    return this.relationships[`${entity}.${relationName}`];
  }
};

// Mock Gap Logger
const mockGapLogger = {
  gaps: [],
  
  log(gap) {
    this.gaps.push(gap);
    console.log(`GAP: [${gap.category}] ${gap.assumption || gap.expected}`);
  },
  
  getCurrentGaps() {
    return this.gaps;
  },
  
  reset() {
    this.gaps = [];
  }
};

// Test v3 config (from ViewForge v3)
const v3AccountListConfig = {
  entity: 'Account',
  title: 'Account List',
  type: 'table',
  settings: {
    pageSize: 25,
    sortable: true,
    filterable: true
  },
  fields: [
    { name: 'accountName', label: 'Account Name', type: 'text', sortable: true },
    { name: 'status', label: 'Status', type: 'enum' },
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'annualRevenue', label: 'Annual Revenue', type: 'currency' },
    { name: 'primaryContact.name', label: 'Primary Contact', type: 'relationship' }
  ],
  actions: ['view', 'edit', 'delete'],
  rowClick: 'view'
};

// Test transformation
console.log('=== Testing ViewForge Transformer ===\n');

const transformer = new ViewForgeTransformer(mockBUSM, mockGapLogger);

console.log('Input (v3 Config):');
console.log(JSON.stringify(v3AccountListConfig, null, 2));
console.log('\n' + '='.repeat(50) + '\n');

// Transform to simplified format
const simplified = transformer.transformV3ToSimplified(v3AccountListConfig);

console.log('Output (Simplified Format):');
console.log(JSON.stringify(simplified, null, 2));
console.log('\n' + '='.repeat(50) + '\n');

// Display gaps found
const gaps = mockGapLogger.getCurrentGaps();
if (gaps.length > 0) {
  console.log('Gaps Discovered:');
  gaps.forEach((gap, index) => {
    console.log(`\n${index + 1}. ${gap.category}`);
    if (gap.field) console.log(`   Field: ${gap.field}`);
    if (gap.expected) console.log(`   Expected: ${gap.expected}`);
    if (gap.assumption) console.log(`   Assumption: ${gap.assumption}`);
    if (gap.suggestedFix) console.log(`   Fix: ${gap.suggestedFix}`);
    console.log(`   Impact: ${gap.impact || 'UNKNOWN'}`);
  });
} else {
  console.log('No gaps found!');
}

console.log('\n' + '='.repeat(50) + '\n');

// Test with minimal config
console.log('Testing with minimal config...\n');
mockGapLogger.reset();

const minimalConfig = {
  entity: 'Account',
  type: 'table',
  fields: [
    { name: 'accountName' },
    { name: 'status' }
  ]
};

const minimalSimplified = transformer.transformV3ToSimplified(minimalConfig);

console.log('Minimal Config Result:');
console.log(JSON.stringify(minimalSimplified, null, 2));

console.log('\nGaps from Minimal Config:');
const minimalGaps = mockGapLogger.getCurrentGaps();
console.log(`Found ${minimalGaps.length} gaps`);

// Validate structure
console.log('\n' + '='.repeat(50) + '\n');
console.log('Validation Results:');

function validate(config, name) {
  const checks = [
    { name: 'Has ID', pass: !!config.id },
    { name: 'Has Type', pass: !!config.type },
    { name: 'Has Entity', pass: !!config.entity },
    { name: 'Has Display Fields', pass: config.display && config.display.fields && config.display.fields.length > 0 },
    { name: 'Has Navigation', pass: !!config.navigation },
    { name: 'Has Data Source', pass: !!config.dataSource },
    { name: 'Navigation has onRowClick', pass: config.navigation && config.navigation.onRowClick },
    { name: 'Data Source has entity', pass: config.dataSource && config.dataSource.entity }
  ];
  
  console.log(`\n${name}:`);
  checks.forEach(check => {
    console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
  });
  
  const passed = checks.filter(c => c.pass).length;
  const total = checks.length;
  console.log(`  Score: ${passed}/${total} (${Math.round(passed/total * 100)}%)`);
}

validate(simplified, 'Full Config');
validate(minimalSimplified, 'Minimal Config');

console.log('\n=== Test Complete ===');