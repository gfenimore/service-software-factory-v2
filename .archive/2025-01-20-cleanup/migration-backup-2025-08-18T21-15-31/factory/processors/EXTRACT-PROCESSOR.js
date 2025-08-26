#!/usr/bin/env node

/**
 * EXTRACT-PROCESSOR
 * Breaks apart monolithic HTML files into separate concerns
 * Essential for concept → prototype transformation
 */

const fs = require('fs');
const path = require('path');

class ExtractProcessor {
    constructor(targetLine = 'prototype') {
        this.targetLine = targetLine;
        this.extracted = {
            html: '',
            styles: '',
            scripts: '',
            mockData: {},
            metadata: {
                sourceFile: '',
                extractedAt: new Date().toISOString(),
                targetLine: targetLine,
                statistics: {}
            }
        };
    }

    /**
     * Main processing function
     */
    async process(inputPath, outputDir) {
        console.log('🔍 EXTRACT-PROCESSOR Starting...');
        console.log(`📂 Input: ${inputPath}`);
        console.log(`📂 Output: ${outputDir}`);
        
        // Read the input file
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }
        
        const content = fs.readFileSync(inputPath, 'utf8');
        this.extracted.metadata.sourceFile = inputPath;
        
        // Extract different parts
        this.extractHTML(content);
        this.extractStyles(content);
        this.extractScripts(content);
        this.extractMockData(this.extracted.scripts);
        this.gatherStatistics();
        
        // Write outputs
        await this.writeOutputs(outputDir);
        
        console.log('✅ Extraction complete!');
        return this.extracted.metadata;
    }
    
    /**
     * Extract HTML structure (without scripts and styles)
     */
    extractHTML(content) {
        console.log('  📄 Extracting HTML structure...');
        
        let html = content;
        
        // Remove script tags but keep the structure
        html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '<!-- SCRIPT REMOVED -->');
        
        // Remove style tags but mark their location
        html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '<!-- STYLES REMOVED -->');
        
        // Clean up inline styles if in prototype/production mode
        if (this.targetLine !== 'concept') {
            // Extract inline styles to data attributes for later processing
            html = html.replace(/style="([^"]*)"/g, (match, styles) => {
                return `data-extracted-style="${styles.replace(/"/g, '&quot;')}"`;
            });
        }
        
        // Extract the body content if it's a full HTML document
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
            this.extracted.html = bodyMatch[1].trim();
        } else {
            this.extracted.html = html;
        }
        
        // Count elements
        const divCount = (html.match(/<div/g) || []).length;
        const buttonCount = (html.match(/<button/g) || []).length;
        const inputCount = (html.match(/<input/g) || []).length;
        
        this.extracted.metadata.statistics.htmlElements = {
            divs: divCount,
            buttons: buttonCount,
            inputs: inputCount
        };
        
        console.log(`    Found ${divCount} divs, ${buttonCount} buttons, ${inputCount} inputs`);
    }
    
    /**
     * Extract CSS styles
     */
    extractStyles(content) {
        console.log('  🎨 Extracting styles...');
        
        const styles = [];
        
        // Extract from <style> tags
        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let match;
        while ((match = styleRegex.exec(content)) !== null) {
            styles.push(match[1].trim());
        }
        
        // Extract inline styles if needed
        if (this.targetLine !== 'concept') {
            const inlineRegex = /style="([^"]*)"/g;
            const inlineStyles = new Set();
            
            while ((match = inlineRegex.exec(content)) !== null) {
                inlineStyles.add(match[1]);
            }
            
            if (inlineStyles.size > 0) {
                styles.push(`/* Extracted inline styles */`);
                inlineStyles.forEach((style, index) => {
                    styles.push(`.extracted-inline-${index} { ${style} }`);
                });
            }
        }
        
        this.extracted.styles = styles.join('\n\n');
        
        // Count CSS rules
        const ruleCount = (this.extracted.styles.match(/{/g) || []).length;
        this.extracted.metadata.statistics.cssRules = ruleCount;
        
        console.log(`    Extracted ${ruleCount} CSS rules`);
    }
    
    /**
     * Extract JavaScript code
     */
    extractScripts(content) {
        console.log('  📜 Extracting scripts...');
        
        const scripts = [];
        
        // Extract from <script> tags
        const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = scriptRegex.exec(content)) !== null) {
            // Skip external scripts
            if (!match[0].includes('src=')) {
                scripts.push(match[1].trim());
            }
        }
        
        this.extracted.scripts = scripts.join('\n\n');
        
        // Analyze the scripts
        const functionCount = (this.extracted.scripts.match(/function\s+\w+/g) || []).length;
        const eventListenerCount = (this.extracted.scripts.match(/addEventListener/g) || []).length;
        const globalVarCount = (this.extracted.scripts.match(/^(let|const|var)\s+\w+/gm) || []).length;
        
        this.extracted.metadata.statistics.javascript = {
            functions: functionCount,
            eventListeners: eventListenerCount,
            globalVariables: globalVarCount,
            totalLines: this.extracted.scripts.split('\n').length
        };
        
        console.log(`    Found ${functionCount} functions, ${eventListenerCount} event listeners`);
    }
    
    /**
     * Extract mock data from JavaScript
     */
    extractMockData(scriptContent) {
        console.log('  📊 Extracting mock data...');
        
        const mockData = {};
        
        // Pattern to find mock data declarations
        const patterns = [
            // const mockAccounts = [...]
            /const\s+mock(\w+)\s*=\s*(\[[\s\S]*?\]);/g,
            // const mockLocations = {...}
            /const\s+mock(\w+)\s*=\s*({[\s\S]*?});/g
        ];
        
        patterns.forEach(pattern => {
            let match;
            const regex = new RegExp(pattern);
            while ((match = regex.exec(scriptContent)) !== null) {
                const dataName = match[1];
                const dataString = match[2];
                
                try {
                    // Safely evaluate the data (in production, use a proper parser)
                    // For now, we'll just store the string
                    mockData[dataName] = dataString;
                    
                    // Try to parse array length
                    if (dataString.startsWith('[')) {
                        const items = dataString.match(/\{[^}]+\}/g) || [];
                        console.log(`    Found mock${dataName}: ${items.length} items`);
                    }
                } catch (e) {
                    console.log(`    Could not parse mock${dataName}`);
                }
            }
        });
        
        this.extracted.mockData = mockData;
        this.extracted.metadata.statistics.mockDataSets = Object.keys(mockData).length;
    }
    
    /**
     * Gather overall statistics
     */
    gatherStatistics() {
        this.extracted.metadata.statistics.summary = {
            totalFiles: 1,
            htmlSize: this.extracted.html.length,
            cssSize: this.extracted.styles.length,
            jsSize: this.extracted.scripts.length,
            mockDataSets: Object.keys(this.extracted.mockData).length
        };
    }
    
    /**
     * Write extracted parts to files
     */
    async writeOutputs(outputDir) {
        console.log('  💾 Writing extracted files...');
        
        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const files = [
            {
                name: 'structure.html',
                content: this.formatHTML(this.extracted.html)
            },
            {
                name: 'styles.css',
                content: this.formatCSS(this.extracted.styles)
            },
            {
                name: 'scripts.js',
                content: this.formatJS(this.extracted.scripts)
            },
            {
                name: 'mock-data.json',
                content: JSON.stringify(this.extracted.mockData, null, 2)
            },
            {
                name: 'extraction-metadata.json',
                content: JSON.stringify(this.extracted.metadata, null, 2)
            }
        ];
        
        files.forEach(file => {
            const filePath = path.join(outputDir, file.name);
            fs.writeFileSync(filePath, file.content);
            console.log(`    ✅ ${file.name} (${file.content.length} bytes)`);
        });
        
        // Create a summary file for the next processor
        const summary = {
            timestamp: new Date().toISOString(),
            sourceFile: this.extracted.metadata.sourceFile,
            targetLine: this.targetLine,
            outputs: files.map(f => ({
                file: f.name,
                size: f.content.length,
                purpose: this.getFilePurpose(f.name)
            })),
            nextProcessor: this.getNextProcessor(),
            statistics: this.extracted.metadata.statistics
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'extraction-summary.json'),
            JSON.stringify(summary, null, 2)
        );
    }
    
    /**
     * Format HTML for better readability
     */
    formatHTML(html) {
        // Add header comment
        const header = `<!-- 
    Extracted HTML Structure
    Generated by: EXTRACT-PROCESSOR
    Target Line: ${this.targetLine}
    Date: ${new Date().toISOString()}
    
    This file contains only the HTML structure.
    Scripts and styles have been extracted to separate files.
-->

`;
        return header + html;
    }
    
    /**
     * Format CSS
     */
    formatCSS(css) {
        const header = `/**
 * Extracted Styles
 * Generated by: EXTRACT-PROCESSOR
 * Target Line: ${this.targetLine}
 * Date: ${new Date().toISOString()}
 */

`;
        return header + css;
    }
    
    /**
     * Format JavaScript
     */
    formatJS(js) {
        const header = `/**
 * Extracted Scripts
 * Generated by: EXTRACT-PROCESSOR
 * Target Line: ${this.targetLine}
 * Date: ${new Date().toISOString()}
 * 
 * This file contains all JavaScript extracted from the HTML.
 * Ready for TYPE-PROCESSOR and COMPONENT-PROCESSOR.
 */

`;
        return header + js;
    }
    
    /**
     * Get purpose description for each file
     */
    getFilePurpose(filename) {
        const purposes = {
            'structure.html': 'HTML structure for COMPONENT-PROCESSOR',
            'styles.css': 'Styles for STYLE-PROCESSOR',
            'scripts.js': 'JavaScript for TYPE-PROCESSOR and COMPONENT-PROCESSOR',
            'mock-data.json': 'Mock data for TYPE-PROCESSOR and SERVICE-PROCESSOR',
            'extraction-metadata.json': 'Metadata for pipeline tracking'
        };
        return purposes[filename] || 'Supporting file';
    }
    
    /**
     * Determine next processor based on target line
     */
    getNextProcessor() {
        if (this.targetLine === 'prototype') {
            return 'TYPE-PROCESSOR';
        } else if (this.targetLine === 'production') {
            return 'SECURITY-PROCESSOR';
        }
        return 'NEXT-PROCESSOR';
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: EXTRACT-PROCESSOR <input-html> <output-dir> [target-line]');
        console.log('Example: EXTRACT-PROCESSOR concept.html ./extracted prototype');
        process.exit(1);
    }
    
    const [inputPath, outputDir, targetLine = 'prototype'] = args;
    
    const processor = new ExtractProcessor(targetLine);
    
    processor.process(inputPath, outputDir)
        .then(metadata => {
            console.log('\n📊 Extraction Summary:');
            console.log(JSON.stringify(metadata.statistics.summary, null, 2));
        })
        .catch(err => {
            console.error('❌ Extraction failed:', err.message);
            process.exit(1);
        });
}

module.exports = ExtractProcessor;