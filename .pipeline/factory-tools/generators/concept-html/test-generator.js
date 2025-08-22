/**
 * Test the Concept Generator with actual ViewForge output
 */

const fs = require('fs');
const path = require('path');
const { generateConcept } = require('./index');

// Test with account list configuration
console.log('Testing Concept Line Generator...\n');

try {
    // Load test fixture
    const configPath = path.join(__dirname, 'test-fixtures', 'account-list-config.json');
    const configJson = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configJson);
    
    console.log('✓ Loaded configuration:', config.hierarchy.userStory.code);
    console.log('  Entity:', config.entity.primary);
    console.log('  Fields:', config.fields.length);
    console.log('  Layout:', config.layout.type);
    
    // Generate HTML
    console.log('\n✓ Generating HTML...');
    const html = generateConcept(config);
    
    // Save output
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const outputPath = path.join(outputDir, 'account-list.html');
    fs.writeFileSync(outputPath, html, 'utf8');
    
    console.log('✓ Generated:', outputPath);
    console.log('  Size:', (html.length / 1024).toFixed(2), 'KB');
    
    // Basic validation
    const hasNoColors = !html.includes('color:') || html.includes('color: #000');
    const hasTable = html.includes('<table');
    const hasFields = config.fields.every(field => html.includes(field.label));
    
    console.log('\n✓ Validation:');
    console.log('  No colors:', hasNoColors ? '✓' : '✗');
    console.log('  Has table:', hasTable ? '✓' : '✗');
    console.log('  All fields present:', hasFields ? '✓' : '✗');
    
    console.log('\n✓ Test completed successfully!');
    console.log('  Open', outputPath, 'in browser to view results');
    
} catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
}