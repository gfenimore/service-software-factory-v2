#!/usr/bin/env node

/**
 * FACTORY EXECUTOR
 * Orchestrates agents and processors through the progressive pipeline
 * This is the actual factory that builds software!
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class FactoryExecutor {
    constructor() {
        this.currentLine = 'concept';
        this.config = this.loadConfig();
        this.executionLog = [];
    }

    loadConfig() {
        const configPath = path.join(__dirname, '../config/factory-standards.yaml');
        // For now, return hardcoded config
        return {
            lines: ['concept', 'prototype', 'production'],
            processors: {
                concept: [
                    'STORY-BUILDER',
                    'UI-BUILDER',
                    'MOCK-BUILDER'
                ],
                prototype: [
                    'TYPE-BUILDER',
                    'COMPONENT-BUILDER',
                    'TEST-BUILDER',
                    'STYLE-EXTRACTOR'
                ],
                production: [
                    'SECURITY-HARDENER',
                    'PERFORMANCE-OPTIMIZER',
                    'MONITORING-INJECTOR',
                    'ACCESSIBILITY-ENHANCER'
                ]
            }
        };
    }

    /**
     * Execute complete pipeline for a sub-module
     */
    async executePipeline(subModuleId, startLine = 'concept') {
        console.log(`
╔════════════════════════════════════════════╗
║     SOFTWARE FACTORY PIPELINE EXECUTOR     ║
╠════════════════════════════════════════════╣
║  Sub-Module: ${subModuleId.padEnd(30)}║
║  Starting Line: ${startLine.padEnd(27)}║
╚════════════════════════════════════════════╝
        `);

        const results = {
            subModule: subModuleId,
            startTime: new Date(),
            lines: {}
        };

        // Execute each line in sequence
        for (const line of this.config.lines) {
            if (this.shouldExecuteLine(line, startLine)) {
                console.log(`\n${'='.repeat(50)}`);
                console.log(`📍 Entering ${line.toUpperCase()} Line`);
                console.log(${'='.repeat(50)}`);
                
                results.lines[line] = await this.executeLine(subModuleId, line);
                
                // Check promotion criteria
                if (!this.meetsPromotionCriteria(line, results.lines[line])) {
                    console.log(`\n❌ Failed promotion criteria for ${line}`);
                    break;
                }
                
                console.log(`\n✅ ${line} line complete!`);
            }
        }

        results.endTime = new Date();
        results.duration = (results.endTime - results.startTime) / 1000;
        
        this.generateReport(results);
        return results;
    }

    /**
     * Execute all processors for a specific line
     */
    async executeLine(subModuleId, line) {
        const processors = this.config.processors[line];
        const lineResults = {
            line,
            processors: [],
            artifacts: [],
            startTime: new Date()
        };

        console.log(`\n🔧 Running ${processors.length} processors for ${line} line:`);
        
        for (const processor of processors) {
            console.log(`\n  ▶ ${processor}`);
            
            const result = await this.runProcessor(processor, subModuleId, line);
            lineResults.processors.push(result);
            
            if (!result.success) {
                console.log(`    ❌ Failed: ${result.error}`);
                break;
            }
            
            console.log(`    ✅ Success: ${result.artifactsGenerated} artifacts`);
        }

        lineResults.endTime = new Date();
        lineResults.duration = (lineResults.endTime - lineResults.startTime) / 1000;
        
        return lineResults;
    }

    /**
     * Run a specific processor
     */
    async runProcessor(processorName, subModuleId, line) {
        const result = {
            processor: processorName,
            line,
            success: false,
            artifactsGenerated: 0,
            artifacts: [],
            error: null
        };

        try {
            const processorPath = path.join(__dirname, 'processors', `${processorName}.js`);
            
            // Check if processor exists
            if (!fs.existsSync(processorPath)) {
                // Try agents directory
                const agentPath = path.join(__dirname, 'agents', `${processorName}.js`);
                if (fs.existsSync(agentPath)) {
                    processorPath = agentPath;
                } else {
                    result.error = `Processor not found: ${processorName}`;
                    return result;
                }
            }

            // Determine input and output paths
            const inputPath = this.getInputPath(subModuleId, line, processorName);
            const outputPath = this.getOutputPath(subModuleId, line, processorName);

            // Execute processor
            const command = `node ${processorPath} ${inputPath} ${outputPath} ${line}`;
            console.log(`    📂 Input: ${inputPath}`);
            console.log(`    📂 Output: ${outputPath}`);
            
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                result.error = stderr;
                return result;
            }

            // Check for generated artifacts
            if (fs.existsSync(outputPath)) {
                result.artifacts.push(outputPath);
                result.artifactsGenerated++;
            }

            result.success = true;
            
        } catch (error) {
            result.error = error.message;
        }

        return result;
    }

    /**
     * Determine input path for processor
     */
    getInputPath(subModuleId, line, processor) {
        const basePath = path.join(__dirname, '..', line, subModuleId);
        
        // Special cases for first processor in each line
        if (line === 'concept' && processor === 'STORY-BUILDER') {
            // Story builder reads requirements
            return path.join(__dirname, '../../requirements/1.1-modules/account-management/1.1.1-sub-modules/master-view');
        } else if (line === 'prototype' && processor === 'TYPE-BUILDER') {
            // Type builder reads concept output
            return path.join(__dirname, '../concept', subModuleId, `${subModuleId}-CONCEPT.html`);
        } else if (line === 'production' && processor === 'SECURITY-HARDENER') {
            // Security hardener reads prototype output
            return path.join(__dirname, '../prototype', subModuleId, 'dist');
        }
        
        // Default: read from current line directory
        return basePath;
    }

    /**
     * Determine output path for processor
     */
    getOutputPath(subModuleId, line, processor) {
        const basePath = path.join(__dirname, '..', line, subModuleId);
        
        // Create directory if needed
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }
        
        // Processor-specific outputs
        const outputs = {
            'STORY-BUILDER': 'stories/user-story.md',
            'UI-BUILDER': 'ui/index.html',
            'MOCK-BUILDER': 'data/mock-data.js',
            'TYPE-BUILDER': 'src/types.ts',
            'COMPONENT-BUILDER': 'src/components/',
            'TEST-BUILDER': 'tests/',
            'STYLE-EXTRACTOR': 'styles/',
            'SECURITY-HARDENER': 'dist/secure/',
            'PERFORMANCE-OPTIMIZER': 'dist/optimized/',
            'MONITORING-INJECTOR': 'dist/monitored/',
            'ACCESSIBILITY-ENHANCER': 'dist/accessible/'
        };
        
        return path.join(basePath, outputs[processor] || 'output');
    }

    /**
     * Check if line should be executed
     */
    shouldExecuteLine(line, startLine) {
        const lineOrder = ['concept', 'prototype', 'production'];
        return lineOrder.indexOf(line) >= lineOrder.indexOf(startLine);
    }

    /**
     * Check promotion criteria
     */
    meetsPromotionCriteria(line, lineResults) {
        // Check if all processors succeeded
        const allSuccess = lineResults.processors.every(p => p.success);
        
        if (!allSuccess) {
            return false;
        }
        
        // Line-specific criteria
        switch (line) {
            case 'concept':
                // Concept always promotes if processors succeed
                return true;
                
            case 'prototype':
                // Check for TypeScript compilation and tests
                // TODO: Run actual validation
                return true;
                
            case 'production':
                // Check security, performance, accessibility
                // TODO: Run actual validation
                return true;
                
            default:
                return false;
        }
    }

    /**
     * Generate execution report
     */
    generateReport(results) {
        const reportPath = path.join(__dirname, '../runs', `run-${Date.now()}.json`);
        
        console.log(`
╔════════════════════════════════════════════╗
║           EXECUTION SUMMARY                ║
╚════════════════════════════════════════════╝

Sub-Module: ${results.subModule}
Duration: ${results.duration}s
Lines Executed: ${Object.keys(results.lines).join(', ')}

Processors Run:
${Object.entries(results.lines).map(([line, data]) => 
    `  ${line}: ${data.processors.length} processors (${data.duration}s)`
).join('\n')}

Report saved to: ${reportPath}
        `);
        
        // Save detailed report
        if (!fs.existsSync(path.dirname(reportPath))) {
            fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        }
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log(`
Usage: factory-executor <sub-module-id> [start-line]

Examples:
  factory-executor 1.1.1-master-view
  factory-executor 1.1.1-master-view prototype
  factory-executor 1.1.2-detail-view concept
        `);
        process.exit(1);
    }
    
    const [subModuleId, startLine = 'concept'] = args;
    const executor = new FactoryExecutor();
    
    executor.executePipeline(subModuleId, startLine)
        .then(() => {
            console.log('\n🎉 Factory execution complete!');
        })
        .catch(err => {
            console.error('\n❌ Factory execution failed:', err);
            process.exit(1);
        });
}

module.exports = FactoryExecutor;