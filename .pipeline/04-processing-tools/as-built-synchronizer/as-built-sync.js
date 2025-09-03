#!/usr/bin/env node

/**
 * As-Built Synchronizer - Command Line Interface
 * Implements UX-001: Command Line Interface from PRD
 */

const fs = require('fs').promises;
const path = require('path');
const { CodeAnalyzer } = require('./core/code-analyzer');
const { PrdParser } = require('./core/prd-parser');
const { GapDetector } = require('./core/gap-detector');

class AsBuiltSynchronizer {
    constructor() {
        this.codeAnalyzer = new CodeAnalyzer();
        this.prdParser = new PrdParser();
        this.gapDetector = new GapDetector();
        this.config = null;
    }

    async init() {
        await this.loadConfiguration();
    }

    async loadConfiguration() {
        const configPath = path.join(__dirname, 'sync-config.json');
        
        try {
            const configData = await fs.readFile(configPath, 'utf8');
            this.config = JSON.parse(configData);
        } catch (error) {
            // Create default configuration if none exists
            this.config = {
                components: [],
                syncSettings: {
                    autoUpdateEnabled: false,
                    reviewRequired: true,
                    alignmentThreshold: 85
                },
                outputDir: './sync-reports',
                reportFormat: 'json'
            };
            
            await this.saveConfiguration();
            console.log('✨ Created default configuration at sync-config.json');
        }
    }

    async saveConfiguration() {
        const configPath = path.join(__dirname, 'sync-config.json');
        await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
    }

    /**
     * CLI Command Handlers
     */
    async handleCommand(args) {
        const command = args[2] || 'help';
        const options = this.parseArguments(args.slice(3));

        try {
            switch (command) {
                case 'analyze':
                case 'sync':
                    await this.syncCommand(options);
                    break;
                case 'add-component':
                    await this.addComponentCommand(options);
                    break;
                case 'list-components':
                    await this.listComponentsCommand();
                    break;
                case 'report':
                    await this.reportCommand(options);
                    break;
                case 'config':
                    await this.configCommand(options);
                    break;
                case 'help':
                default:
                    this.showHelp();
                    break;
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }

    async syncCommand(options) {
        console.log('🔍 Starting PRD-Implementation Analysis...\n');

        if (options.component) {
            await this.analyzeComponent(options.component);
        } else if (options.all) {
            await this.analyzeAllComponents();
        } else {
            console.log('Please specify --component=<name> or --all');
            this.showSyncHelp();
        }
    }

    async analyzeComponent(componentName) {
        const component = this.config.components.find(c => c.name === componentName);
        
        if (!component) {
            throw new Error(`Component '${componentName}' not found. Use 'add-component' to add it first.`);
        }

        console.log(`📋 Analyzing component: ${component.name}`);
        
        // Step 1: Parse PRD
        console.log('  1. Parsing PRD...');
        const prdContent = await this.readFile(component.prdPath);
        const prdData = this.prdParser.parsePRD(prdContent);
        console.log(`     ✓ Found ${prdData.functionalRequirements.length} functional requirements`);

        // Step 2: Analyze Implementation
        console.log('  2. Analyzing implementation...');
        const implData = await this.codeAnalyzer.analyzeDirectory(component.implementationPath);
        console.log(`     ✓ Analyzed ${implData.files.length} files`);
        console.log(`     ✓ Found ${implData.functions.length} functions, ${implData.apiEndpoints.length} API endpoints`);

        // Step 3: Detect Gaps
        console.log('  3. Detecting gaps...');
        const gapAnalysis = this.gapDetector.analyzeGaps(prdData, implData);
        console.log(`     ✓ Alignment Score: ${gapAnalysis.alignmentScore}%`);
        console.log(`     ✓ Found ${gapAnalysis.gapCount} gaps, ${gapAnalysis.totalImplemented} matches`);

        // Step 4: Generate Report
        const report = {
            analysisId: `sync-${new Date().toISOString().split('T')[0]}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            component: component.name,
            prd: {
                path: component.prdPath,
                metadata: prdData.metadata,
                requirementsCount: prdData.functionalRequirements.length
            },
            implementation: {
                path: component.implementationPath,
                filesAnalyzed: implData.files.length,
                functionsFound: implData.functions.length,
                apisFound: implData.apiEndpoints.length
            },
            analysis: gapAnalysis
        };

        await this.saveReport(report);
        this.displayResults(report);
    }

    async analyzeAllComponents() {
        if (this.config.components.length === 0) {
            console.log('No components configured. Use "add-component" to add components first.');
            return;
        }

        console.log(`📊 Analyzing ${this.config.components.length} components...\n`);
        
        const allReports = [];
        
        for (const component of this.config.components) {
            try {
                console.log(`\n--- ${component.name} ---`);
                await this.analyzeComponent(component.name);
                
                // Load the generated report
                const reportPath = path.join(this.config.outputDir, `${component.name}-sync-report.json`);
                const reportData = await fs.readFile(reportPath, 'utf8');
                allReports.push(JSON.parse(reportData));
                
            } catch (error) {
                console.log(`❌ Failed to analyze ${component.name}: ${error.message}`);
            }
        }

        // Generate summary report
        await this.generateSummaryReport(allReports);
    }

    async addComponentCommand(options) {
        if (!options.name || !options.prd || !options.implementation) {
            console.log('Usage: add-component --name=<name> --prd=<path> --implementation=<path>');
            return;
        }

        const newComponent = {
            name: options.name,
            prdPath: options.prd,
            implementationPath: options.implementation,
            entryPoint: options.entry || 'index.js',
            apiEndpoints: [],
            configFiles: options.configs ? options.configs.split(',') : []
        };

        // Validate paths exist
        try {
            await fs.access(newComponent.prdPath);
            await fs.access(newComponent.implementationPath);
        } catch (error) {
            throw new Error(`Cannot access specified paths: ${error.message}`);
        }

        this.config.components.push(newComponent);
        await this.saveConfiguration();
        
        console.log(`✅ Added component '${newComponent.name}'`);
        console.log(`   PRD: ${newComponent.prdPath}`);
        console.log(`   Implementation: ${newComponent.implementationPath}`);
    }

    async listComponentsCommand() {
        if (this.config.components.length === 0) {
            console.log('No components configured.');
            return;
        }

        console.log('📋 Configured Components:\n');
        
        for (const component of this.config.components) {
            console.log(`• ${component.name}`);
            console.log(`  PRD: ${component.prdPath}`);
            console.log(`  Implementation: ${component.implementationPath}`);
            console.log('');
        }
    }

    async reportCommand(options) {
        if (options.component) {
            await this.showComponentReport(options.component);
        } else {
            await this.showSummaryReport();
        }
    }

    async configCommand(options) {
        if (options.show) {
            console.log('Current Configuration:');
            console.log(JSON.stringify(this.config, null, 2));
        } else if (options.set) {
            const [key, value] = options.set.split('=');
            this.setConfigValue(key, value);
            await this.saveConfiguration();
            console.log(`✅ Set ${key} = ${value}`);
        } else {
            this.showConfigHelp();
        }
    }

    /**
     * Helper Methods
     */
    parseArguments(args) {
        const options = {};
        
        for (const arg of args) {
            if (arg.startsWith('--')) {
                const [key, value] = arg.substring(2).split('=');
                options[key] = value || true;
            }
        }
        
        return options;
    }

    async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            throw new Error(`Cannot read file ${filePath}: ${error.message}`);
        }
    }

    async saveReport(report) {
        // Ensure output directory exists
        await fs.mkdir(this.config.outputDir, { recursive: true });
        
        const fileName = `${report.component}-sync-report.json`;
        const filePath = path.join(this.config.outputDir, fileName);
        
        await fs.writeFile(filePath, JSON.stringify(report, null, 2));
        console.log(`💾 Report saved: ${filePath}`);
    }

    async generateSummaryReport(reports) {
        const summary = {
            timestamp: new Date().toISOString(),
            totalComponents: reports.length,
            overallStats: {
                averageAlignment: Math.round(reports.reduce((sum, r) => sum + r.analysis.alignmentScore, 0) / reports.length),
                totalGaps: reports.reduce((sum, r) => sum + r.analysis.gapCount, 0),
                totalMatches: reports.reduce((sum, r) => sum + r.analysis.totalImplemented, 0)
            },
            componentResults: reports.map(r => ({
                name: r.component,
                alignmentScore: r.analysis.alignmentScore,
                gapCount: r.analysis.gapCount,
                status: this.getAlignmentStatus(r.analysis.alignmentScore)
            }))
        };

        const summaryPath = path.join(this.config.outputDir, 'summary-report.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
        
        console.log('\n📊 SUMMARY REPORT');
        console.log('=================');
        console.log(`Components Analyzed: ${summary.totalComponents}`);
        console.log(`Average Alignment: ${summary.overallStats.averageAlignment}%`);
        console.log(`Total Gaps Found: ${summary.overallStats.totalGaps}`);
        console.log(`Total Matches: ${summary.overallStats.totalMatches}`);
        console.log(`\nSummary saved: ${summaryPath}`);
    }

    displayResults(report) {
        console.log('\n📊 ANALYSIS RESULTS');
        console.log('==================');
        console.log(`Component: ${report.component}`);
        console.log(`Alignment Score: ${report.analysis.alignmentScore}% ${this.getAlignmentEmoji(report.analysis.alignmentScore)}`);
        console.log(`Status: ${this.getAlignmentStatus(report.analysis.alignmentScore)}`);
        
        if (report.analysis.gapCount > 0) {
            console.log(`\n⚠️  Found ${report.analysis.gapCount} gaps:`);
            
            const gapsBySeverity = report.analysis.summary.gapsBySeverity;
            if (gapsBySeverity.HIGH) console.log(`   🔴 HIGH: ${gapsBySeverity.HIGH}`);
            if (gapsBySeverity.MEDIUM) console.log(`   🟡 MEDIUM: ${gapsBySeverity.MEDIUM}`);
            if (gapsBySeverity.LOW) console.log(`   🟢 LOW: ${gapsBySeverity.LOW}`);
            
            console.log('\nTop gaps:');
            report.analysis.gaps.slice(0, 3).forEach((gap, i) => {
                console.log(`   ${i + 1}. [${gap.severity}] ${gap.message}`);
            });
        }

        console.log(`\n✅ Found ${report.analysis.totalImplemented} matching implementations`);
        console.log(`\n💡 ${report.analysis.summary.recommendation}`);
    }

    getAlignmentEmoji(score) {
        if (score >= 90) return '🟢';
        if (score >= 75) return '🟡';
        return '🔴';
    }

    getAlignmentStatus(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 50) return 'Needs Work';
        return 'Critical';
    }

    setConfigValue(key, value) {
        const keys = key.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        // Convert value to appropriate type
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value)) value = Number(value);
        
        current[keys[keys.length - 1]] = value;
    }

    /**
     * Help Methods
     */
    showHelp() {
        console.log(`
🔄 As-Built Synchronizer v1.0.0
===============================

USAGE:
  as-built-sync <command> [options]

COMMANDS:
  sync            Analyze PRD-implementation alignment
  add-component   Add a new component to track
  list-components Show all configured components  
  report          Show analysis reports
  config          Manage configuration
  help            Show this help

EXAMPLES:
  # Analyze specific component
  as-built-sync sync --component=busm-reader

  # Analyze all components
  as-built-sync sync --all

  # Add new component
  as-built-sync add-component --name=busm-reader --prd=./BUSM-READER-PRD.md --implementation=./busm-reader/

  # Show configuration
  as-built-sync config --show

For detailed help on a command, use: as-built-sync <command> --help
        `);
    }

    showSyncHelp() {
        console.log(`
SYNC COMMAND OPTIONS:
  --component=<name>    Analyze specific component
  --all                Analyze all configured components
  --report             Generate detailed report
  --review             Launch interactive review mode (future)

EXAMPLES:
  as-built-sync sync --component=busm-reader
  as-built-sync sync --all --report
        `);
    }

    showConfigHelp() {
        console.log(`
CONFIG COMMAND OPTIONS:
  --show               Show current configuration
  --set=key=value      Set configuration value

EXAMPLES:
  as-built-sync config --show
  as-built-sync config --set=syncSettings.alignmentThreshold=90
        `);
    }
}

// CLI Entry Point
async function main() {
    const synchronizer = new AsBuiltSynchronizer();
    await synchronizer.init();
    await synchronizer.handleCommand(process.argv);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal Error:', error.message);
        process.exit(1);
    });
}

module.exports = { AsBuiltSynchronizer };