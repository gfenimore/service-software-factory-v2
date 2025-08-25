/**
 * Test Business Rules Parser
 * Tests loading and parsing of Phase 1 Account rules
 */

const BusinessRulesParser = require('./business-rules-parser.js');
const fs = require('fs');
const path = require('path');

// Mock Gap Logger
const mockGapLogger = {
  gaps: [],
  log(gap) {
    this.gaps.push(gap);
    console.log(`  GAP: [${gap.category}] ${gap.assumption || gap.expected}`);
  }
};

// Create test instance
const parser = new BusinessRulesParser(mockGapLogger);

console.log('=== Testing Business Rules Parser ===\n');

// Test 1: Load Phase 1 Account Rules
console.log('Test 1: Loading Phase 1 Account Basic rules...');
try {
  const rulesPath = path.join(__dirname, '..', 'module-system', 'phase1-account-basic.yaml');
  parser.loadRules(rulesPath);
  console.log('✅ Rules loaded successfully\n');
} catch (error) {
  console.error(`❌ Failed to load rules: ${error.message}\n`);
  process.exit(1);
}

// Test 2: Validate Rules Structure
console.log('Test 2: Validating rules structure...');
const validation = parser.validateRules();
if (validation.valid) {
  console.log('✅ Rules structure is valid\n');
} else {
  console.log('❌ Rule validation errors:');
  validation.errors.forEach(err => console.log(`  - ${err}`));
  console.log();
}

// Test 3: Get Account Validation Rules
console.log('Test 3: Getting Account validation rules...');
const accountValidation = parser.getValidationRules('Account');
console.log('Required fields:', accountValidation.required || []);
console.log('Unique fields:', accountValidation.unique || []);
console.log('Patterns:', Object.keys(accountValidation.patterns || {}));
console.log();

// Test 4: Check Required Fields
console.log('Test 4: Checking required fields...');
const requiredFields = ['accountName', 'accountType', 'status', 'website'];
requiredFields.forEach(field => {
  const isRequired = parser.isFieldRequired('Account', field);
  console.log(`  ${field}: ${isRequired ? '✅ Required' : '⭕ Optional'}`);
});
console.log();

// Test 5: Get State Transitions
console.log('Test 5: Getting state transitions...');
const states = ['Prospect', 'Active', 'Suspended', 'Closed'];
states.forEach(state => {
  const transitions = parser.getAllowedTransitions('Account', state);
  const display = parser.getStateDisplay('Account', state);
  console.log(`  ${state}:`);
  console.log(`    Can transition to: ${transitions.length > 0 ? transitions.join(', ') : '(none - terminal)'}`);
  console.log(`    Display: ${display.color} ${display.icon}`);
});
console.log();

// Test 6: Get Business Logic
console.log('Test 6: Getting business logic...');
const onCreate = parser.getBusinessLogic('Account', 'onCreate');
console.log('onCreate actions:');
onCreate.forEach(action => {
  console.log(`  - ${action.action}: ${action.value || action.field || action.message || ''}`);
});
console.log();

// Test 7: Get Concept Display Hints
console.log('Test 7: Getting Concept Line display hints...');
const hints = parser.getConceptDisplayHints('Account');
console.log('Display hints for Concept Line:');
console.log(`  Show required indicators: ${hints.showRequired ? '✅' : '❌'}`);
console.log(`  Show unique constraints: ${hints.showUnique ? '✅' : '❌'}`);
console.log(`  Show state transitions: ${hints.showStates ? '✅' : '❌'}`);
console.log(`  Show validation patterns: ${hints.showValidation ? '✅' : '❌'}`);
console.log(`  Required fields: ${hints.requiredFields.join(', ')}`);
console.log(`  Unique fields: ${hints.uniqueFields.join(', ')}`);
console.log();

// Test 8: Get Validation Messages
console.log('Test 8: Getting validation messages...');
const messageTests = [
  { field: 'accountName', type: 'required' },
  { field: 'accountName', type: 'unique' },
  { field: 'website', type: 'pattern' }
];
messageTests.forEach(test => {
  const message = parser.getValidationMessage('Account', test.field, test.type);
  console.log(`  ${test.field} (${test.type}): "${message}"`);
});
console.log();

// Test 9: Check for Gaps
console.log('Test 9: Checking for logged gaps...');
if (mockGapLogger.gaps.length > 0) {
  console.log(`Found ${mockGapLogger.gaps.length} gaps:`);
  mockGapLogger.gaps.forEach((gap, i) => {
    console.log(`  ${i + 1}. [${gap.category}] ${gap.expected || gap.assumption}`);
  });
} else {
  console.log('✅ No gaps found - all rules properly defined!\n');
}

// Summary
console.log('=== Parser Test Summary ===');
console.log(`Module: ${parser.module?.name || 'Unknown'}`);
console.log(`Entity: Account`);
console.log(`Required Fields: ${parser.getRequiredFields('Account').length}`);
console.log(`Unique Fields: ${parser.getUniqueFields('Account').length}`);
console.log(`States: ${Object.keys(parser.getStateTransitions('Account')).length}`);
console.log(`Validation: ${validation.valid ? '✅ Valid' : '❌ Invalid'}`);
console.log('\n✨ Business Rules Parser is ready for integration!');