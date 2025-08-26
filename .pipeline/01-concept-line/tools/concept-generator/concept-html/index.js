/**
 * Concept Line Generator - Main Entry Point
 * Generates pure HTML from ViewForge configurations
 * 
 * Principle: "If it doesn't work in black and white, colors won't save it."
 */

const { validateConfiguration } = require('./validator');
const { parseConfiguration } = require('./parser');
const { generateTable } = require('./generators/table');
const { generateList } = require('./generators/list');
const { generateDetail } = require('./generators/detail');
const { wrapWithMetadata } = require('./metadata');

// Generator registry
const generators = {
    'table': generateTable,
    'list': generateList,
    'detail': generateDetail
};

/**
 * Main generation function
 * @param {Object} config - ViewForge configuration JSON
 * @returns {string} Generated HTML
 */
function generateConcept(config) {
    // 1. Validate input
    const validation = validateConfiguration(config);
    if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    
    // 2. Parse configuration
    const parsed = parseConfiguration(config);
    
    // 3. Select generator based on layout type
    const layoutType = parsed.layout?.type || 'table';
    const generator = generators[layoutType];
    
    if (!generator) {
        throw new Error(`Unknown layout type: ${layoutType}`);
    }
    
    // 4. Generate HTML content
    const htmlContent = generator(parsed);
    
    // 5. Wrap with metadata and complete HTML structure
    const finalHtml = wrapWithMetadata(htmlContent, parsed);
    
    return finalHtml;
}

// Export for use as module
module.exports = {
    generateConcept
};

// CLI support
if (require.main === module) {
    const fs = require('fs');
    const path = require('path');
    
    // Read configuration from stdin or file
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Usage: node index.js <config.json> [output.html]');
        process.exit(1);
    }
    
    const configPath = args[0];
    const outputPath = args[1] || 'output.html';
    
    try {
        const configJson = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configJson);
        const html = generateConcept(config);
        
        fs.writeFileSync(outputPath, html, 'utf8');
        console.log(`✓ Generated ${outputPath}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}