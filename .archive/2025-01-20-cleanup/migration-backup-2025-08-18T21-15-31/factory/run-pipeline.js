#!/usr/bin/env node

/**
 * Pipeline Runner
 * Orchestrates the transformation from concept to prototype
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FACTORY PIPELINE RUNNER');
console.log('========================\n');

// Configuration
const CONCEPT_FILE = '../concept/1.1.1-master-view/1.1.1-master-view-CONCEPT.html';
const WORK_DIR = './pipeline-output';
const TRANSFORMERS_DIR = './transformers';

// Clean work directory
if (fs.existsSync(WORK_DIR)) {
    fs.rmSync(WORK_DIR, { recursive: true });
}
fs.mkdirSync(WORK_DIR, { recursive: true });

try {
    // Step 1: Extract
    console.log('📦 Step 1: EXTRACT-PROCESSOR');
    console.log('   Extracting concept HTML into intermediate format...');
    
    const extractOutput = path.join(WORK_DIR, 'extracted');
    execSync(
        `node ${TRANSFORMERS_DIR}/EXTRACT-PROCESSOR.js ${CONCEPT_FILE} ${extractOutput}`,
        { stdio: 'inherit' }
    );
    
    console.log('\n✅ Extraction complete!\n');
    
    // Step 2: Generate Components
    console.log('🔨 Step 2: COMPONENT-GENERATOR');
    console.log('   Generating React components from intermediate format...');
    
    const componentsOutput = path.join(WORK_DIR, 'components');
    execSync(
        `node ${TRANSFORMERS_DIR}/COMPONENT-GENERATOR.js ${extractOutput} ${componentsOutput} prototype`,
        { stdio: 'inherit' }
    );
    
    console.log('\n✅ Component generation complete!\n');
    
    // Step 3: Summary
    console.log('📊 Pipeline Summary');
    console.log('==================');
    
    // Count files
    const extractedFiles = fs.readdirSync(extractOutput);
    const componentFiles = fs.readdirSync(componentsOutput);
    
    console.log(`   Extracted files: ${extractedFiles.length}`);
    extractedFiles.forEach(f => console.log(`     - ${f}`));
    
    console.log(`\n   Generated components: ${componentFiles.length}`);
    componentFiles.forEach(f => console.log(`     - ${f}`));
    
    console.log('\n🎉 Pipeline Complete!');
    console.log(`   Output: ${path.resolve(componentsOutput)}`);
    console.log('\n   Next steps:');
    console.log('   1. Run ASSEMBLY-PROCESSOR to create runnable app');
    console.log('   2. Run tests on generated components');
    console.log('   3. Deploy to Vercel');
    
} catch (error) {
    console.error('\n❌ Pipeline failed:', error.message);
    process.exit(1);
}