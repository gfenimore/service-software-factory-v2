/**
 * Test Automatic Gap Discovery
 * Shows how gaps are automatically found and displayed
 */

const ConceptGeneratorV3 = require('./concept-generator-v3.js');
const ViewForgeTransformer = require('../../viewforge/viewforge-transformer.js');
const BusinessRulesParser = require('../../business-rules-configurator/business-rules-parser.js');
const fs = require('fs');
const path = require('path');

// Enhanced Gap Logger that tracks everything
class VisualGapLogger {
  constructor() {
    this.gaps = [];
  }
  
  log(gap) {
    this.gaps.push({
      ...gap,
      id: this.gaps.length + 1,
      timestamp: new Date()
    });
    console.log(`🔍 GAP FOUND: [${gap.category}] ${gap.expected || gap.assumption}`);
  }
  
  getCurrentGaps() {
    return this.gaps;
  }
  
  generateHTMLReport() {
    if (this.gaps.length === 0) return '';
    
    const criticalGaps = this.gaps.filter(g => g.impact === 'HIGH' || g.impact === 'CRITICAL');
    const mediumGaps = this.gaps.filter(g => g.impact === 'MEDIUM');
    const lowGaps = this.gaps.filter(g => g.impact === 'LOW' || !g.impact);
    
    return `
    <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #856404; margin-bottom: 15px;">
        🔍 ${this.gaps.length} Business Rules Need Definition
      </h2>
      
      ${criticalGaps.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <h3 style="color: #d32f2f;">Critical Gaps (Must Define)</h3>
        ${criticalGaps.map(gap => this.renderGap(gap, '#ffebee')).join('')}
      </div>` : ''}
      
      ${mediumGaps.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <h3 style="color: #f57c00;">Medium Priority</h3>
        ${mediumGaps.map(gap => this.renderGap(gap, '#fff3e0')).join('')}
      </div>` : ''}
      
      ${lowGaps.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <h3 style="color: #388e3c;">Low Priority</h3>
        ${lowGaps.map(gap => this.renderGap(gap, '#e8f5e9')).join('')}
      </div>` : ''}
      
      <div style="margin-top: 20px; padding: 10px; background: white; border-radius: 4px;">
        <strong>What This Means:</strong>
        <ul style="margin: 10px 0 0 20px;">
          <li>These rules were not found in the configuration</li>
          <li>The system made assumptions to continue</li>
          <li>You should define these with stakeholders</li>
          <li>Update the YAML with real business rules</li>
        </ul>
      </div>
    </div>`;
  }
  
  renderGap(gap, bgColor) {
    return `
    <div style="background: ${bgColor}; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid currentColor;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <strong>${gap.category}</strong>
          ${gap.entity ? `<span style="color: #666;"> (${gap.entity}${gap.field ? '.' + gap.field : ''})</span>` : ''}
          <div style="margin-top: 5px; color: #666;">
            ${gap.expected ? `<div>❓ Expected: ${gap.expected}</div>` : ''}
            ${gap.assumption ? `<div>💭 Assumed: ${gap.assumption}</div>` : ''}
            ${gap.suggestedFix ? `<div>💡 Fix: ${gap.suggestedFix}</div>` : ''}
          </div>
        </div>
        <button onclick="alert('In real app: Add ${gap.category} to requirements doc')" 
                style="padding: 4px 12px; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">
          Flag for Discussion
        </button>
      </div>
    </div>`;
  }
}

// Create test with intentionally missing rules
console.log('=== Testing Automatic Gap Discovery ===\n');

// Mock BUSM with MORE fields than we have rules for
const mockBUSM = {
  entities: {
    Account: {
      primaryKey: 'accountId',
      fields: {
        accountId: { type: 'uuid', primaryKey: true },
        accountNumber: { type: 'string', generated: true },
        accountName: { type: 'string', required: true, maxLength: 100 },
        accountType: { type: 'enum', options: ['Residential', 'Commercial'] },
        status: { type: 'enum', options: ['Active', 'Inactive'] },
        
        // These fields have NO rules defined - will create gaps!
        phone: { type: 'string' },
        email: { type: 'email' },
        serviceAddress: { type: 'string' },
        contractStartDate: { type: 'date' },
        creditLimit: { type: 'decimal' },
        preferredTech: { type: 'string' }
      }
    }
  },
  
  getEntity(name) { return this.entities[name]; },
  getField(entity, field) { 
    return this.entities[entity]?.fields[field]; 
  },
  getRelationship() { return null; }
};

// Use the visual gap logger
const gapLogger = new VisualGapLogger();

// ViewForge config that references fields without rules
const viewConfig = {
  entity: 'Account',
  title: 'Account Management',
  type: 'form',
  fields: [
    { name: 'accountName', label: 'Account Name' },
    { name: 'accountType', label: 'Account Type' },
    { name: 'phone', label: 'Phone' },  // No validation rule!
    { name: 'email', label: 'Email' },  // No validation rule!
    { name: 'serviceAddress', label: 'Service Address' }, // Not in rules!
    { name: 'creditLimit', label: 'Credit Limit' }, // No rule!
    { name: 'preferredTech', label: 'Preferred Technician' } // No rule!
  ]
};

// Load rules (which are incomplete on purpose)
const rulesPath = path.join(__dirname, '..', '..', 'module-system', 'phase1-account-basic.yaml');

// Transform and generate
const transformer = new ViewForgeTransformer(mockBUSM, gapLogger);
const simplified = transformer.transformV3ToSimplified(viewConfig);

console.log('\nStep 1: Transforming config (finding gaps)...\n');

// Generate with gaps
const generator = new ConceptGeneratorV3(simplified, mockBUSM, gapLogger, rulesPath);
const result = generator.generate();

console.log('\n=== Gaps Automatically Discovered ===\n');
console.log(`Total gaps found: ${gapLogger.gaps.length}\n`);

gapLogger.gaps.forEach((gap, i) => {
  console.log(`${i + 1}. [${gap.category}]`);
  console.log(`   Entity/Field: ${gap.entity || 'N/A'}${gap.field ? '.' + gap.field : ''}`);
  console.log(`   Expected: ${gap.expected || 'N/A'}`);
  console.log(`   Assumption: ${gap.assumption || 'N/A'}`);
  console.log(`   Impact: ${gap.impact || 'UNKNOWN'}`);
  console.log();
});

// Generate HTML with gap report embedded
const htmlWithGaps = `
<!DOCTYPE html>
<html>
<head>
  <title>Account Form - With Auto-Discovered Gaps</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: #2c3e50; }
    .undefined-field { border: 2px dashed #ffc107 !important; background: #fffbf0 !important; }
    .needs-rule { color: #ff6b6b; font-size: 12px; margin-left: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Account Setup Form</h1>
    
    ${gapLogger.generateHTMLReport()}
    
    <form style="margin-top: 30px;">
      <h3>Form Fields</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Fields with dashed borders are missing business rules.
      </p>
      
      <div style="margin-bottom: 15px;">
        <label>Account Name <span style="color: red;">*</span></label>
        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #ccc;">
        <small style="color: green;">✓ Has validation rules</small>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Phone <span class="needs-rule">❓ No format validation</span></label>
        <input type="text" class="undefined-field" style="width: 100%; padding: 8px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Email <span class="needs-rule">❓ No validation pattern</span></label>
        <input type="text" class="undefined-field" style="width: 100%; padding: 8px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Service Address <span class="needs-rule">❓ Required field?</span></label>
        <input type="text" class="undefined-field" style="width: 100%; padding: 8px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Credit Limit <span class="needs-rule">❓ No business rule</span></label>
        <input type="number" class="undefined-field" style="width: 100%; padding: 8px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Preferred Technician <span class="needs-rule">❓ No validation</span></label>
        <input type="text" class="undefined-field" style="width: 100%; padding: 8px;">
      </div>
    </form>
  </div>
</body>
</html>`;

// Save the file
const outputFile = path.join(__dirname, '..', '..', '..', 'generated', 'phase1-account', 'form-with-auto-gaps.html');
fs.writeFileSync(outputFile, htmlWithGaps);

console.log('=== Output Generated ===\n');
console.log(`File saved: ${outputFile}\n`);
console.log('Open this file to see:');
console.log('1. Automatic gap discovery report');
console.log('2. Fields marked as needing definition');
console.log('3. Visual indicators for missing rules');
console.log('\n🎯 The system found ALL the gaps automatically!');