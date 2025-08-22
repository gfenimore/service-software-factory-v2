#!/usr/bin/env node

/**
 * Complete Pipeline Runner
 * Orchestrates the full transformation from concept to runnable app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 COMPLETE FACTORY PIPELINE');
console.log('============================\n');

// Configuration
const CONCEPT_FILE = '../concept/1.1.1-master-view/1.1.1-master-view-CONCEPT.html';
const WORK_DIR = './pipeline-run';
const TRANSFORMERS_DIR = './transformers';
const FRAMEWORK = process.argv[2] || 'next'; // Allow framework selection

// Clean work directory
if (fs.existsSync(WORK_DIR)) {
    fs.rmSync(WORK_DIR, { recursive: true });
}
fs.mkdirSync(WORK_DIR, { recursive: true });

try {
    // Step 1: Extract
    console.log('📦 Step 1: EXTRACT-PROCESSOR');
    console.log('   Breaking apart concept HTML...\n');
    
    const extractOutput = path.join(WORK_DIR, 'extracted');
    execSync(
        `node ${TRANSFORMERS_DIR}/EXTRACT-PROCESSOR.js ${CONCEPT_FILE} ${extractOutput}`,
        { stdio: 'inherit' }
    );
    
    console.log('\n✅ Extraction complete!\n');
    
    // Step 2: Generate Components
    console.log('🔨 Step 2: COMPONENT-GENERATOR');
    console.log('   Generating React components...\n');
    
    const componentsOutput = path.join(WORK_DIR, 'components');
    execSync(
        `node ${TRANSFORMERS_DIR}/COMPONENT-GENERATOR.js ${extractOutput} ${componentsOutput} prototype`,
        { stdio: 'inherit' }
    );
    
    console.log('\n✅ Component generation complete!\n');
    
    // Step 3: Assemble Application
    console.log('🏗️ Step 3: ASSEMBLY-PROCESSOR');
    console.log(`   Creating ${FRAMEWORK} application...\n`);
    
    const appOutput = path.join(WORK_DIR, 'master-view-app');
    execSync(
        `node ${TRANSFORMERS_DIR}/ASSEMBLY-PROCESSOR.js ${componentsOutput} ${appOutput} ${FRAMEWORK} prototype`,
        { stdio: 'inherit' }
    );
    
    console.log('\n✅ Assembly complete!\n');
    
    // Step 4: Summary
    console.log('=' .repeat(60));
    console.log('📊 PIPELINE COMPLETE!');
    console.log('=' .repeat(60));
    
    const appPath = path.resolve(appOutput);
    console.log(`\n✨ Your application is ready at:`);
    console.log(`   ${appPath}\n`);
    
    console.log('🚀 To run your application:\n');
    console.log(`   cd ${appOutput}`);
    console.log('   npm install');
    console.log(`   ${FRAMEWORK === 'next' ? 'npm run dev' : 'npm start'}\n`);
    
    console.log('📦 To build for production:\n');
    console.log(`   cd ${appOutput}`);
    console.log('   npm run build\n');
    
    console.log('☁️ To deploy to Vercel:\n');
    console.log(`   cd ${appOutput}`);
    console.log('   npx vercel\n');
    
    // Show what was created
    const stats = {
        extractedFiles: fs.readdirSync(extractOutput).length,
        components: fs.readdirSync(componentsOutput).length,
        appFiles: countFilesRecursive(appOutput)
    };
    
    console.log('📈 Pipeline Statistics:');
    console.log(`   • Extracted files: ${stats.extractedFiles}`);
    console.log(`   • Generated components: ${stats.components}`);
    console.log(`   • Application files: ${stats.appFiles}`);
    console.log(`   • Framework: ${FRAMEWORK}`);
    console.log(`   • Target line: prototype`);
    
    // Create a summary file
    const summary = {
        timestamp: new Date().toISOString(),
        pipeline: 'concept → prototype → app',
        input: CONCEPT_FILE,
        output: appOutput,
        framework: FRAMEWORK,
        statistics: stats,
        processors: [
            'EXTRACT-PROCESSOR',
            'COMPONENT-GENERATOR',
            'ASSEMBLY-PROCESSOR'
        ]
    };
    
    fs.writeFileSync(
        path.join(WORK_DIR, 'pipeline-summary.json'),
        JSON.stringify(summary, null, 2)
    );
    
    console.log(`\n📄 Pipeline summary saved to: ${path.join(WORK_DIR, 'pipeline-summary.json')}`);
    
} catch (error) {
    console.error('\n❌ Pipeline failed:', error.message);
    process.exit(1);
}

function countFilesRecursive(dir) {
    let count = 0;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            count += countFilesRecursive(fullPath);
        } else {
            count++;
        }
    }
    
    return count;
}