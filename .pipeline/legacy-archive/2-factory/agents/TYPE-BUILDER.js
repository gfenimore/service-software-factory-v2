#!/usr/bin/env node

/**
 * TYPE-BUILDER Processor
 * Converts JavaScript with 'any' types to proper TypeScript
 * Works progressively: 
 *   - Concept: Allows any
 *   - Prototype: Strict types
 *   - Production: Runtime validation
 */

const fs = require('fs');
const path = require('path');

class TypeBuilder {
    constructor(targetLine = 'prototype') {
        this.targetLine = targetLine;
        this.config = this.loadConfig();
    }

    loadConfig() {
        return {
            concept: {
                allowAny: true,
                strictMode: false,
                validation: 'none'
            },
            prototype: {
                allowAny: false,
                strictMode: true,
                validation: 'compile-time'
            },
            production: {
                allowAny: false,
                strictMode: true,
                validation: 'runtime'
            }
        };
    }

    /**
     * Analyze JavaScript code and infer types
     */
    analyzeCode(jsCode) {
        const typeInferences = {
            variables: new Map(),
            functions: new Map(),
            returns: new Map()
        };

        // Pattern matching for common cases
        const patterns = {
            // let selectedAccount = null; -> Account | null
            nullInit: /let\s+(\w+)\s*=\s*null/g,
            // const mockAccounts = [{...}] -> Account[]
            arrayLiteral: /const\s+(\w+)\s*=\s*\[/g,
            // function selectAccount(account) -> (account: Account) => void
            functionDef: /function\s+(\w+)\s*\(([^)]*)\)/g,
            // { id: 1, name: "..." } -> infer shape
            objectLiteral: /\{([^}]+)\}/g,
            // document.getElementById -> HTMLElement | null
            domQuery: /document\.(getElementById|querySelector)/g
        };

        // Infer types from variable names (heuristic)
        const namePatterns = {
            account: 'Account',
            location: 'ServiceLocation',
            workOrder: 'WorkOrder',
            selected: '| null',
            mock: '[]',
            is: 'boolean',
            has: 'boolean',
            count: 'number',
            name: 'string',
            id: 'number',
            date: 'string', // or Date
            status: 'Status'
        };

        // Scan for variables
        let match;
        while ((match = patterns.nullInit.exec(jsCode)) !== null) {
            const varName = match[1];
            let inferredType = 'unknown';
            
            // Check name patterns
            for (const [pattern, type] of Object.entries(namePatterns)) {
                if (varName.toLowerCase().includes(pattern)) {
                    inferredType = type;
                    if (type.includes('|')) {
                        inferredType = inferredType.replace('|', '') + ' | null';
                    }
                    break;
                }
            }
            
            typeInferences.variables.set(varName, inferredType);
        }

        return typeInferences;
    }

    /**
     * Generate TypeScript interfaces from mock data
     */
    generateInterfacesFromMockData(jsCode) {
        const interfaces = [];
        
        // Find mock data arrays
        const mockDataRegex = /const\s+mock(\w+)\s*=\s*(\[[\s\S]*?\]);/g;
        let match;
        
        while ((match = mockDataRegex.exec(jsCode)) !== null) {
            const entityName = match[1];
            const dataString = match[2];
            
            try {
                // Safely evaluate the mock data
                const mockData = eval(dataString);
                if (Array.isArray(mockData) && mockData.length > 0) {
                    const sample = mockData[0];
                    const interfaceDef = this.inferInterface(entityName, sample);
                    interfaces.push(interfaceDef);
                }
            } catch (e) {
                console.log(`Could not parse mock data for ${entityName}`);
            }
        }
        
        return interfaces;
    }

    /**
     * Infer TypeScript interface from object
     */
    inferInterface(name, obj) {
        const lines = [`export interface ${name.replace(/s$/, '')} {`];
        
        for (const [key, value] of Object.entries(obj)) {
            let type = 'unknown';
            
            if (value === null) {
                type = 'null';
            } else if (typeof value === 'string') {
                // Check for enums
                if (key === 'type' && ['Commercial', 'Residential', 'Industrial'].includes(value)) {
                    type = "'Commercial' | 'Residential' | 'Industrial'";
                } else if (key === 'status') {
                    type = "'Active' | 'Pending' | 'Suspended' | 'Completed' | 'In Progress'";
                } else {
                    type = 'string';
                }
            } else if (typeof value === 'number') {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            } else if (Array.isArray(value)) {
                type = 'any[]'; // Would need deeper analysis
            } else if (typeof value === 'object') {
                type = 'Record<string, unknown>';
            }
            
            lines.push(`  ${key}: ${type};`);
        }
        
        lines.push('}');
        return lines.join('\n');
    }

    /**
     * Convert HTML/JS to TypeScript based on target line
     */
    async processFile(inputPath, outputPath) {
        console.log(`🔧 TYPE-BUILDER Processing: ${inputPath}`);
        console.log(`📍 Target Line: ${this.targetLine}`);
        
        const content = fs.readFileSync(inputPath, 'utf8');
        const lineConfig = this.config[this.targetLine];
        
        if (this.targetLine === 'concept') {
            console.log('✅ Concept line: No type conversion needed');
            return content;
        }
        
        // For prototype and production
        const output = {
            interfaces: '',
            code: '',
            imports: ''
        };
        
        // Extract JavaScript from HTML if needed
        let jsCode = content;
        if (content.includes('<script>')) {
            const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
            if (scriptMatch) {
                jsCode = scriptMatch[1];
            }
        }
        
        // Generate interfaces from mock data
        const interfaces = this.generateInterfacesFromMockData(jsCode);
        output.interfaces = interfaces.join('\n\n');
        
        // Analyze code for type inference
        const typeInfo = this.analyzeCode(jsCode);
        
        // Convert to TypeScript
        let tsCode = jsCode;
        
        // Add type annotations to variables
        for (const [varName, type] of typeInfo.variables.entries()) {
            if (!lineConfig.allowAny && type !== 'unknown') {
                // let selectedAccount = null -> let selectedAccount: Account | null = null
                const pattern = new RegExp(`let\\s+${varName}\\s*=\\s*null`, 'g');
                tsCode = tsCode.replace(pattern, `let ${varName}: ${type} = null`);
            }
        }
        
        // Add function parameter types
        tsCode = tsCode.replace(/function\s+(\w+)\s*\((\w+)\)/g, (match, funcName, param) => {
            // Infer parameter type from name
            let paramType = 'any';
            if (!lineConfig.allowAny) {
                if (param.includes('account')) paramType = 'Account';
                else if (param.includes('location')) paramType = 'ServiceLocation';
                else if (param.includes('order')) paramType = 'WorkOrder';
                else if (param.includes('event')) paramType = 'Event';
            }
            return `function ${funcName}(${param}: ${paramType})`;
        });
        
        // For production, add runtime validation
        if (this.targetLine === 'production') {
            output.imports = `import { z } from 'zod';\n`;
            output.code = this.addRuntimeValidation(tsCode);
        } else {
            output.code = tsCode;
        }
        
        // Write output files
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write types file
        fs.writeFileSync(
            path.join(outputDir, 'types.ts'),
            output.interfaces
        );
        
        // Write main TypeScript file
        const finalCode = `${output.imports}
// Generated by TYPE-BUILDER for ${this.targetLine} line
// Types are in ./types.ts

${output.code}`;
        
        fs.writeFileSync(outputPath, finalCode);
        
        console.log(`✅ Type conversion complete: ${outputPath}`);
        console.log(`📝 Generated types.ts with ${interfaces.length} interfaces`);
        
        return finalCode;
    }

    /**
     * Add runtime validation for production
     */
    addRuntimeValidation(tsCode) {
        // Add Zod schemas for runtime validation
        const schemas = `
// Runtime validation schemas
const AccountSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: z.enum(['Commercial', 'Residential', 'Industrial']),
    status: z.enum(['Active', 'Pending', 'Suspended'])
});

const LocationSchema = z.object({
    id: z.number(),
    accountId: z.number(),
    name: z.string(),
    address: z.string(),
    nextService: z.string()
});

// Validate data at runtime
function validateAccount(data: unknown): Account {
    return AccountSchema.parse(data);
}
`;
        
        return schemas + '\n\n' + tsCode;
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: TYPE-BUILDER <input-file> <output-file> [target-line]');
        console.log('Example: TYPE-BUILDER concept.html prototype.ts prototype');
        process.exit(1);
    }
    
    const [input, output, line = 'prototype'] = args;
    const builder = new TypeBuilder(line);
    
    builder.processFile(input, output).catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

module.exports = TypeBuilder;