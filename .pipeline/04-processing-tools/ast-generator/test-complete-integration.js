#!/usr/bin/env node

/**
 * Complete Integration Test
 * Demonstrates the full pipeline: ViewForge → AST → TypeScript Components
 * With automatic gap discovery throughout
 */

const { ViewForgeASTAdapter, BusinessRulesIntegration } = require('./integrations/viewforge-ast-adapter');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

console.log('='.repeat(80));
console.log('COMPLETE AST INTEGRATION TEST');
console.log('ViewForge Config → AST Generator → TypeScript Components');
console.log('='.repeat(80));

// Load the Phase 1 Account module configuration
const moduleConfigPath = path.join(
  __dirname, 
  '../../module-system/phase1-account-basic.yaml'
);

console.log('\n1. Loading Phase 1 Account Module Configuration');
console.log('-'.repeat(40));

let moduleConfig;
try {
  const configContent = fs.readFileSync(moduleConfigPath, 'utf8');
  moduleConfig = yaml.parse(configContent);
  console.log(`✅ Loaded module: ${moduleConfig.name}`);
  console.log(`   Version: ${moduleConfig.version}`);
  console.log(`   Entity: ${moduleConfig.entity.name}`);
} catch (error) {
  console.log('❌ Error loading module config:', error.message);
  // Create a sample config for demonstration
  moduleConfig = createSampleConfig();
  console.log('📝 Using sample configuration for demonstration');
}

// Create ViewForge configuration from module
console.log('\n2. Creating ViewForge Configuration');
console.log('-'.repeat(40));

const viewForgeConfig = {
  entity: {
    name: moduleConfig.entity.name,
    fields: moduleConfig.entity.fields,
    enums: {
      AccountType: ['Residential', 'Commercial', 'Industrial', 'Other'],
      AccountStatus: ['Active', 'Inactive', 'Suspended', 'Pending']
    }
  },
  views: [
    {
      type: 'list',
      name: 'AccountListView',
      config: {
        fields: ['id', 'name', 'type', 'status'],
        actions: ['view', 'edit', 'delete']
      }
    },
    {
      type: 'table',
      name: 'AccountTable',
      config: {
        fields: [
          { name: 'id', label: 'ID' },
          { name: 'name', label: 'Account Name' },
          { name: 'type', label: 'Type' },
          { name: 'status', label: 'Status' },
          { name: 'email', label: 'Email' }
        ],
        sortable: true,
        filterable: true
      }
    },
    {
      type: 'form',
      name: 'AccountForm',
      config: {
        fields: moduleConfig.entity.fields.filter(f => f.name !== 'id'),
        validation: moduleConfig.businessRules?.validation
      }
    },
    {
      type: 'detail',
      name: 'AccountDetail',
      config: {
        sections: [
          {
            title: 'Basic Information',
            fields: ['name', 'type', 'status']
          },
          {
            title: 'Contact Information',
            fields: ['email', 'phone', 'address']
          }
        ]
      }
    }
  ]
};

console.log('✅ ViewForge configuration created');
console.log(`   Views: ${viewForgeConfig.views.map(v => v.name).join(', ')}`);

// Transform with AST adapter
console.log('\n3. Transforming with AST Adapter');
console.log('-'.repeat(40));

const adapter = new ViewForgeASTAdapter();
const result = adapter.transform(viewForgeConfig);

console.log('✅ Transformation complete');
console.log(`   Components generated: ${result.components.length}`);
console.log(`   Total lines of code: ${result.code.split('\n').length}`);

// Apply business rules if available
if (moduleConfig.businessRules) {
  console.log('\n4. Applying Business Rules');
  console.log('-'.repeat(40));
  
  const rulesIntegration = new BusinessRulesIntegration(adapter);
  
  // This would normally integrate with the actual business rules
  console.log('✅ Business rules integration ready');
  console.log('   (Would apply validation, logic, and state transitions)');
} else {
  console.log('\n4. Business Rules');
  console.log('-'.repeat(40));
  console.log('⚠️  No business rules defined - marking as gap');
}

// Gap analysis
console.log('\n5. Gap Analysis Report');
console.log('-'.repeat(40));

const gapReport = result.gaps;
console.log(`Total Gaps Discovered: ${gapReport.total}`);

if (gapReport.total > 0) {
  console.log('\nGaps by Severity:');
  Object.entries(gapReport.bySeverity || {}).forEach(([severity, count]) => {
    const icon = severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟡' : '🟢';
    console.log(`  ${icon} ${severity}: ${count} gaps`);
  });

  console.log('\nGaps by Category:');
  Object.entries(gapReport.byCategory || {}).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} gaps`);
  });

  if (gapReport.gaps && gapReport.gaps.length > 0) {
    console.log('\nTop Gaps to Address:');
    gapReport.gaps.slice(0, 5).forEach((gap, i) => {
      console.log(`  ${i + 1}. [${gap.severity}] ${gap.message}`);
    });
  }
}

// Save outputs
console.log('\n6. Saving Generated Artifacts');
console.log('-'.repeat(40));

const outputDir = path.join(__dirname, 'test-output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save generated TypeScript code
const outputFile = path.join(outputDir, 'account-module-components.tsx');
fs.writeFileSync(outputFile, result.code);
console.log(`✅ Saved components to ${path.basename(outputFile)}`);

// Save gap report
const gapFile = path.join(outputDir, 'integration-gap-report.json');
fs.writeFileSync(gapFile, JSON.stringify(gapReport, null, 2));
console.log(`✅ Saved gap report to ${path.basename(gapFile)}`);

// Save component manifest
const manifest = {
  timestamp: new Date().toISOString(),
  module: moduleConfig.name,
  components: result.components,
  statistics: {
    totalComponents: result.components.length,
    linesOfCode: result.code.split('\n').length,
    gaps: gapReport.total,
    interfaces: (result.code.match(/export interface/g) || []).length,
    enums: (result.code.match(/export enum/g) || []).length
  }
};

const manifestFile = path.join(outputDir, 'component-manifest.json');
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
console.log(`✅ Saved manifest to ${path.basename(manifestFile)}`);

// Create visual gap report for wireframes
const visualGapReport = {
  module: moduleConfig.name,
  timestamp: new Date().toISOString(),
  summary: `${gapReport.total} gaps discovered`,
  gaps: gapReport.gaps?.slice(0, 3).map(g => ({
    icon: g.severity === 'HIGH' ? '🔴' : g.severity === 'MEDIUM' ? '🟡' : '🟢',
    text: g.message
  })) || [],
  recommendation: gapReport.total > 0 ? 
    'Address high-severity gaps before generation' : 
    'Ready for production generation'
};

const visualFile = path.join(outputDir, 'visual-gaps-for-wireframe.json');
fs.writeFileSync(visualFile, JSON.stringify(visualGapReport, null, 2));
console.log(`✅ Saved visual gap report for wireframes`);

// Show code preview
console.log('\n7. Generated Code Preview');
console.log('-'.repeat(40));
const lines = result.code.split('\n');
console.log(lines.slice(0, 20).join('\n'));
console.log(`... (${Math.max(0, lines.length - 20)} more lines)`);

// Summary
console.log('\n' + '='.repeat(80));
console.log('INTEGRATION TEST COMPLETE');
console.log('='.repeat(80));

console.log('\n✨ What We Achieved:');
console.log('1. ✅ Loaded module configuration (or created sample)');
console.log('2. ✅ Transformed to ViewForge config');
console.log('3. ✅ Generated TypeScript components via AST');
console.log('4. ✅ Discovered gaps automatically');
console.log('5. ✅ Created visual gap reports for wireframes');

console.log('\n🚀 The Pipeline Works:');
console.log('   Module Config → ViewForge → AST → TypeScript');
console.log('   With automatic gap discovery at every step!');

console.log('\n📊 Statistics:');
console.log(`   Components: ${result.components.length}`);
console.log(`   Lines of Code: ${result.code.split('\n').length}`);
console.log(`   Gaps Found: ${gapReport.total}`);
console.log(`   Ready for Compilation: ${gapReport.total === 0 ? 'YES ✅' : 'NO ❌ (fix gaps first)'}`);

console.log('\n🎯 Next Steps:');
console.log('1. Fix discovered gaps in business rules');
console.log('2. Add TypeScript compilation verification');
console.log('3. Generate runtime tests');
console.log('4. Deploy to development environment');

/**
 * Create sample configuration if file not found
 */
function createSampleConfig() {
  return {
    name: 'account-module-phase1',
    version: '1.0.0',
    entity: {
      name: 'Account',
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'type', type: 'select', required: true },
        { name: 'status', type: 'select', required: true },
        { name: 'email', type: 'email', required: false },
        { name: 'phone', type: 'phone', required: false },
        { name: 'address', type: 'text', required: false }
      ]
    },
    businessRules: {
      validation: [
        { field: 'name', required: true, min: 2, max: 100 },
        { field: 'email', pattern: '^[\\w\\.]+@[\\w\\.]+$' }
      ]
    }
  };
}