#!/usr/bin/env node

/**
 * EXTRACT-PROCESSOR
 * Transformation Processor: Concept → Prototype
 * 
 * Takes monolithic concept HTML and extracts into intermediate JSON format:
 * - components.json: UI structure and hierarchy
 * - styles.json: Style definitions and mappings
 * - mockData.json: Data structures and samples
 * - events.json: Event handlers and flows
 * 
 * This intermediate format is the CONTRACT between lines
 */

const fs = require('fs');
const path = require('path');

class ExtractProcessor {
    constructor(config = {}) {
        // Configurable extraction rules
        this.config = {
            // Patterns for identifying components
            componentPatterns: {
                column: /class="column"|id="\w+-column"/,
                card: /class="card"/,
                searchBox: /type="text".*placeholder="Search/,
                button: /<button/,
                modal: /class="modal"|role="dialog"/
            },
            
            // Patterns for extracting mock data
            mockDataPatterns: {
                array: /const\s+mock(\w+)\s*=\s*(\[[\s\S]*?\]);/g,
                object: /const\s+mock(\w+)\s*=\s*({[\s\S]*?});/g
            },
            
            // Patterns for identifying events
            eventPatterns: {
                onClick: /onclick="([^"]*)"/g,
                addEventListener: /addEventListener\(['"](\w+)['"]/g,
                customEvent: /dispatchEvent\(new\s+CustomEvent\(['"]([^'"]+)/g,
                windowEvent: /window\.addEventListener\(['"]([^'"]+)/g
            },
            
            // Style extraction rules
            stylePatterns: {
                classes: /class="([^"]*)"/g,
                inlineStyles: /style="([^"]*)"/g,
                cssRules: /\.([a-zA-Z0-9-_]+)\s*{([^}]*)}/g
            },
            
            ...config
        };
        
        // Output structure
        this.output = {
            components: {},
            styles: {},
            mockData: {},
            events: {}
        };
    }
    
    /**
     * Main extraction process
     */
    async extract(inputPath, outputDir) {
        console.log('🔬 EXTRACT-PROCESSOR: Concept → Prototype Transformation');
        console.log('📂 Input:', inputPath);
        console.log('📂 Output:', outputDir);
        console.log('');
        
        // Store inputPath for later use
        this.inputPath = inputPath;
        
        // Read input file
        const content = fs.readFileSync(inputPath, 'utf8');
        
        // Extract all parts
        console.log('📊 Extracting components...');
        this.extractComponents(content);
        
        console.log('🎨 Extracting styles...');
        this.extractStyles(content);
        
        console.log('📦 Extracting mock data...');
        this.extractMockData(content);
        
        console.log('⚡ Extracting events...');
        this.extractEvents(content);
        
        // Write outputs
        await this.writeOutputs(outputDir);
        
        console.log('✅ Extraction complete!');
        return this.output;
    }
    
    /**
     * Extract component structure
     */
    extractComponents(content) {
        const components = {
            name: 'MasterView',
            type: 'container',
            props: {},
            children: [],
            htmlStructure: null
        };
        
        // Extract body content
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
        if (bodyMatch) {
            const bodyContent = bodyMatch[1];
            
            // Parse the main structure
            components.htmlStructure = this.parseHTMLStructure(bodyContent);
            
            // Identify columns
            const columnMatches = bodyContent.match(/<div[^>]*class="column"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g);
            if (columnMatches) {
                columnMatches.forEach((columnHTML, index) => {
                    const columnId = this.extractId(columnHTML);
                    const columnTitle = this.extractColumnTitle(columnHTML);
                    
                    components.children.push({
                        name: columnId || `Column${index + 1}`,
                        type: 'column',
                        title: columnTitle,
                        props: {
                            searchable: columnHTML.includes('search'),
                            hasCounter: columnHTML.includes('count')
                        },
                        htmlSnippet: this.cleanHTML(columnHTML)
                    });
                });
            }
            
            // Identify other components
            this.identifySubComponents(bodyContent, components);
        }
        
        this.output.components = {
            root: components,
            inventory: this.generateComponentInventory(components),
            hierarchy: this.generateHierarchy(components),
            metadata: {
                totalComponents: 0,
                types: {}
            }
        };
        
        // Count components
        this.countComponents(components);
    }
    
    /**
     * Parse HTML into structure
     */
    parseHTMLStructure(html) {
        // Simplified structure extraction
        const structure = {
            type: 'root',
            children: []
        };
        
        // Extract main containers
        const containerPattern = /<div[^>]*class="([^"]*)"[^>]*>/g;
        let match;
        const containers = [];
        
        while ((match = containerPattern.exec(html)) !== null) {
            const classes = match[1];
            if (classes.includes('master-view') || classes.includes('column') || classes.includes('header')) {
                containers.push({
                    type: 'container',
                    classes: classes.split(' '),
                    position: match.index
                });
            }
        }
        
        return containers;
    }
    
    /**
     * Extract styles
     */
    extractStyles(content) {
        const styles = {
            global: {},
            components: {},
            inline: [],
            classes: new Set()
        };
        
        // Extract CSS from style tags
        const styleTagMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        if (styleTagMatches) {
            styleTagMatches.forEach(styleTag => {
                const css = styleTag.replace(/<\/?style[^>]*>/gi, '');
                
                // Parse CSS rules
                const rules = css.match(/([^{]+){([^}]+)}/g);
                if (rules) {
                    rules.forEach(rule => {
                        const [selector, properties] = rule.split('{');
                        const cleanSelector = selector.trim();
                        const cleanProps = properties.replace('}', '').trim();
                        
                        if (cleanSelector.startsWith('.')) {
                            // Class selector
                            const className = cleanSelector.substring(1).split(/[\s:,>+~\[]/)[0];
                            styles.components[className] = this.parseProperties(cleanProps);
                            styles.classes.add(className);
                        } else if (cleanSelector.startsWith('#')) {
                            // ID selector
                            const id = cleanSelector.substring(1);
                            styles.components[id] = this.parseProperties(cleanProps);
                        } else {
                            // Global selector
                            styles.global[cleanSelector] = this.parseProperties(cleanProps);
                        }
                    });
                }
            });
        }
        
        // Extract inline styles
        const inlineMatches = [...content.matchAll(this.config.stylePatterns.inlineStyles)];
        inlineMatches.forEach(match => {
            styles.inline.push({
                style: match[1],
                properties: this.parseProperties(match[1])
            });
        });
        
        // Convert Set to Array for JSON
        styles.classes = Array.from(styles.classes);
        
        this.output.styles = {
            ...styles,
            summary: {
                totalRules: Object.keys(styles.global).length + Object.keys(styles.components).length,
                totalClasses: styles.classes.length,
                totalInline: styles.inline.length
            }
        };
    }
    
    /**
     * Parse CSS properties string into object
     */
    parseProperties(propsString) {
        const props = {};
        const declarations = propsString.split(';').filter(d => d.trim());
        
        declarations.forEach(declaration => {
            const [property, value] = declaration.split(':').map(s => s.trim());
            if (property && value) {
                // Convert CSS property to camelCase for React
                const camelProp = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                props[camelProp] = value;
            }
        });
        
        return props;
    }
    
    /**
     * Extract mock data
     */
    extractMockData(content) {
        const mockData = {
            datasets: {},
            types: {},
            relationships: {}
        };
        
        // Extract script content
        const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            const scriptContent = scriptMatch[1];
            
            // Extract mock data arrays
            let match;
            const arrayPattern = new RegExp(this.config.mockDataPatterns.array);
            
            while ((match = arrayPattern.exec(scriptContent)) !== null) {
                const dataName = match[1];
                const dataString = match[2];
                
                try {
                    // Parse the data (safely in production)
                    const data = eval(dataString); // In production, use a safe parser
                    
                    mockData.datasets[dataName] = {
                        data: data,
                        count: Array.isArray(data) ? data.length : 1,
                        sample: Array.isArray(data) ? data[0] : data,
                        schema: this.inferSchema(Array.isArray(data) ? data[0] : data)
                    };
                    
                    // Infer type from name and structure
                    mockData.types[dataName] = this.inferType(dataName, data);
                    
                } catch (e) {
                    console.log(`  ⚠️  Could not parse mock${dataName}`);
                    mockData.datasets[dataName] = {
                        raw: dataString,
                        error: e.message
                    };
                }
            }
            
            // Extract relationships between data
            this.inferRelationships(mockData);
        }
        
        this.output.mockData = mockData;
    }
    
    /**
     * Infer schema from object
     */
    inferSchema(obj) {
        const schema = {};
        
        for (const [key, value] of Object.entries(obj || {})) {
            if (value === null) {
                schema[key] = 'null';
            } else if (Array.isArray(value)) {
                schema[key] = 'array';
            } else {
                schema[key] = typeof value;
            }
        }
        
        return schema;
    }
    
    /**
     * Infer TypeScript type from data
     */
    inferType(name, data) {
        const sample = Array.isArray(data) ? data[0] : data;
        
        // Build interface definition
        const fields = [];
        for (const [key, value] of Object.entries(sample || {})) {
            let type = 'any';
            
            if (typeof value === 'string') {
                // Check for enums
                if (key === 'type') type = "'Commercial' | 'Residential' | 'Industrial'";
                else if (key === 'status') type = "'Active' | 'Pending' | 'Completed'";
                else type = 'string';
            } else if (typeof value === 'number') {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            }
            
            fields.push({ name: key, type, optional: false });
        }
        
        return {
            name: name.replace(/s$/, ''), // Remove plural
            fields
        };
    }
    
    /**
     * Infer relationships between datasets
     */
    inferRelationships(mockData) {
        const relationships = [];
        
        // Look for ID references
        Object.entries(mockData.datasets).forEach(([name1, data1]) => {
            Object.entries(mockData.datasets).forEach(([name2, data2]) => {
                if (name1 !== name2 && data1.sample && data2.sample) {
                    // Check if data2 references data1
                    const data1IdField = Object.keys(data1.sample).find(k => k === 'id');
                    const data2RefField = Object.keys(data2.sample).find(k => 
                        k.toLowerCase().includes(name1.toLowerCase().replace(/s$/, '')) && 
                        k.includes('Id')
                    );
                    
                    if (data1IdField && data2RefField) {
                        relationships.push({
                            from: name2,
                            to: name1,
                            field: data2RefField,
                            type: 'belongsTo'
                        });
                    }
                }
            });
        });
        
        mockData.relationships = relationships;
    }
    
    /**
     * Extract events and handlers
     */
    extractEvents(content) {
        const events = {
            handlers: {},
            customEvents: [],
            listeners: [],
            flows: []
        };
        
        // Extract onClick handlers
        const onClickMatches = [...content.matchAll(this.config.eventPatterns.onClick)];
        onClickMatches.forEach(match => {
            const handler = match[1];
            const functionName = handler.match(/(\w+)\(/)?.[1];
            if (functionName) {
                events.handlers[functionName] = {
                    type: 'click',
                    inline: handler
                };
            }
        });
        
        // Extract custom events
        const customEventMatches = [...content.matchAll(this.config.eventPatterns.customEvent)];
        customEventMatches.forEach(match => {
            events.customEvents.push({
                name: match[1],
                type: 'custom'
            });
        });
        
        // Extract event listeners
        const listenerMatches = [...content.matchAll(this.config.eventPatterns.addEventListener)];
        listenerMatches.forEach(match => {
            events.listeners.push({
                event: match[1],
                type: 'listener'
            });
        });
        
        // Infer event flows (e.g., select account -> load locations -> load work orders)
        if (events.handlers['selectAccount'] && events.handlers['selectLocation']) {
            events.flows.push({
                name: 'Account Selection Flow',
                steps: [
                    { action: 'selectAccount', triggers: 'renderLocations' },
                    { action: 'selectLocation', triggers: 'renderWorkOrders' },
                    { action: 'selectWorkOrder', triggers: 'showDetails' }
                ]
            });
        }
        
        this.output.events = {
            ...events,
            summary: {
                totalHandlers: Object.keys(events.handlers).length,
                totalCustomEvents: events.customEvents.length,
                totalListeners: events.listeners.length,
                totalFlows: events.flows.length
            }
        };
    }
    
    /**
     * Helper methods
     */
    extractId(html) {
        const match = html.match(/id="([^"]*)"/);
        return match ? match[1] : null;
    }
    
    extractColumnTitle(html) {
        const match = html.match(/<span[^>]*class="column-title"[^>]*>([^<]*)</);
        return match ? match[1] : null;
    }
    
    cleanHTML(html) {
        return html
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .substring(0, 200) + '...';
    }
    
    identifySubComponents(html, parent) {
        // Identify search boxes, buttons, cards, etc.
        Object.entries(this.config.componentPatterns).forEach(([type, pattern]) => {
            if (pattern.test(html)) {
                // Component found, add to inventory
                if (!parent.subComponents) parent.subComponents = [];
                parent.subComponents.push(type);
            }
        });
    }
    
    generateComponentInventory(root) {
        const inventory = {
            containers: [],
            inputs: [],
            displays: [],
            controls: []
        };
        
        // Categorize components
        const walk = (component) => {
            if (component.type === 'container' || component.type === 'column') {
                inventory.containers.push(component.name);
            } else if (component.type === 'input' || component.props?.searchable) {
                inventory.inputs.push(component.name);
            }
            
            if (component.children) {
                component.children.forEach(walk);
            }
        };
        
        walk(root);
        return inventory;
    }
    
    generateHierarchy(root) {
        const hierarchy = [];
        
        const walk = (component, level = 0) => {
            hierarchy.push({
                level,
                name: component.name,
                type: component.type
            });
            
            if (component.children) {
                component.children.forEach(child => walk(child, level + 1));
            }
        };
        
        walk(root);
        return hierarchy;
    }
    
    countComponents(root) {
        let total = 0;
        const types = {};
        
        const walk = (component) => {
            total++;
            types[component.type] = (types[component.type] || 0) + 1;
            
            if (component.children) {
                component.children.forEach(walk);
            }
        };
        
        walk(root);
        
        this.output.components.metadata.totalComponents = total;
        this.output.components.metadata.types = types;
    }
    
    /**
     * Write output files
     */
    async writeOutputs(outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const files = [
            { name: 'components.json', data: this.output.components },
            { name: 'styles.json', data: this.output.styles },
            { name: 'mockData.json', data: this.output.mockData },
            { name: 'events.json', data: this.output.events }
        ];
        
        console.log('\n📝 Writing intermediate format files:');
        
        files.forEach(file => {
            const filePath = path.join(outputDir, file.name);
            fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
            const size = fs.statSync(filePath).size;
            console.log(`   ✅ ${file.name} (${size} bytes)`);
        });
        
        // Write manifest for next processor
        const manifest = {
            timestamp: new Date().toISOString(),
            processor: 'EXTRACT-PROCESSOR',
            input: path.basename(this.inputPath || 'unknown'),
            outputs: files.map(f => f.name),
            nextProcessor: 'COMPONENT-GENERATOR',
            statistics: {
                components: this.output.components.metadata,
                styles: this.output.styles.summary,
                mockData: {
                    datasets: Object.keys(this.output.mockData.datasets).length,
                    relationships: this.output.mockData.relationships?.length || 0
                },
                events: this.output.events.summary
            }
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'extraction-manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        console.log('   ✅ extraction-manifest.json');
        console.log('\n📦 Intermediate format ready for COMPONENT-GENERATOR');
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: EXTRACT-PROCESSOR <input.html> <output-dir> [config.json]');
        console.log('Example: EXTRACT-PROCESSOR concept.html ./intermediate');
        process.exit(1);
    }
    
    const [inputPath, outputDir, configPath] = args;
    
    // Load custom config if provided
    let config = {};
    if (configPath && fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    const processor = new ExtractProcessor(config);
    
    processor.extract(inputPath, outputDir)
        .then(() => {
            console.log('\n🎉 Extraction successful!');
            console.log('Next step: Run COMPONENT-GENERATOR on the intermediate files');
        })
        .catch(err => {
            console.error('❌ Extraction failed:', err.message);
            process.exit(1);
        });
}

module.exports = ExtractProcessor;