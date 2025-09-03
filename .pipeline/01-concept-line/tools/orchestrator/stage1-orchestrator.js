#!/usr/bin/env node
/**
 * Stage 1 Pipeline Orchestrator
 * Processes UI configuration and generates Stage 1 output artifacts
 */

const fs = require('fs');
const path = require('path');

// Use pipeline configuration for path management
const config = require('../../../../pipeline-config');

class Stage1Orchestrator {
    constructor() {
        this.startTime = Date.now();
        this.results = {
            entities: 0,
            components: 0,
            rules: 0,
            artifacts: 0
        };
    }

    /**
     * Main orchestration method
     * @param {Object} uiConfig - Configuration from Concept Line UI
     */
    async process(uiConfig) {
        console.log('🚀 Starting Stage 1 Pipeline Orchestration...');
        console.log('📝 Input Configuration:', uiConfig);

        try {
            // Ensure output directory exists
            config.ensureOutputDir('concept', config.isLegacyMode());
            const outputPath = config.getOutputPath('concept', config.isLegacyMode());

            // Step 1: Parse BUSM entities (using logical name)
            const busmParser = this.getBusmParser();
            const entities = await this.parseEntities(busmParser, uiConfig.selectedEntities);
            
            // Step 2: Generate components
            const components = await this.generateComponents(entities, uiConfig);
            
            // Step 3: Generate business rules
            const businessRules = await this.generateBusinessRules(entities, uiConfig);
            
            // Step 4: Create output artifacts
            await this.writeArtifacts(outputPath, {
                uiConfig,
                entities,
                components,
                businessRules
            });

            // Step 5: Validate outputs
            await this.validateOutputs(outputPath);

            // Report completion
            this.reportCompletion();
            
            return this.results;

        } catch (error) {
            console.error('❌ Stage 1 Orchestration Failed:', error.message);
            throw error;
        }
    }

    /**
     * Get BUSM parser using configuration
     */
    getBusmParser() {
        // Use logical name from pipeline config when BUSM parser is implemented
        // For now, return mock parser for rough sketch
        return {
            parseEntities: async (selectedList) => {
                // Mock entity parsing - replace with actual BUSM parser
                const mockEntities = {
                    ACCOUNT: { name: 'ACCOUNT', fields: 8, type: 'master' },
                    CONTACT: { name: 'CONTACT', fields: 7, type: 'detail' },
                    SERVICE_LOCATION: { name: 'SERVICE_LOCATION', fields: 14, type: 'detail' },
                    WORK_ORDER: { name: 'WORK_ORDER', fields: 10, type: 'transaction' }
                };
                
                return selectedList.map(name => mockEntities[name]).filter(Boolean);
            }
        };
    }

    /**
     * Parse selected entities from BUSM
     */
    async parseEntities(parser, selectedEntities) {
        console.log('📊 Parsing BUSM entities...');
        const entities = await parser.parseEntities(selectedEntities);
        this.results.entities = entities.length;
        console.log(`✅ Parsed ${entities.length} entities`);
        return entities;
    }

    /**
     * Generate 3-column component specifications
     */
    async generateComponents(entities, uiConfig) {
        console.log('🔧 Generating component specifications...');
        
        // Auto-generate 3-column layout based on entity types
        const components = [];
        
        entities.forEach(entity => {
            // Generate list view for all entities
            components.push({
                name: `${entity.name}ListView`,
                type: 'list',
                entity: entity.name,
                fields: entity.fields,
                layout: 'table'
            });

            // Generate detail view for master and transaction entities
            if (entity.type === 'master' || entity.type === 'transaction') {
                components.push({
                    name: `${entity.name}DetailView`,
                    type: 'detail',
                    entity: entity.name,
                    fields: entity.fields,
                    layout: 'form'
                });
            }
        });

        // Apply 3-column mapping based on service type
        const columnMapping = this.generateColumnMapping(entities, uiConfig.serviceType);
        
        this.results.components = components.length;
        console.log(`✅ Generated ${components.length} components`);
        
        return { components, columnMapping };
    }

    /**
     * Generate 3-column mapping for Master View layout
     */
    generateColumnMapping(entities, serviceType) {
        const mapping = {
            serviceType,
            layout: 'three-column',
            columns: {
                left: { title: 'Account Hub', entities: [] },
                center: { title: 'Service Locations', entities: [] },
                right: { title: 'Work Orders', entities: [] }
            }
        };

        // Auto-assign entities to columns based on type and service
        entities.forEach(entity => {
            switch (entity.type) {
                case 'master':
                    mapping.columns.left.entities.push(entity.name);
                    break;
                case 'detail':
                    mapping.columns.center.entities.push(entity.name);
                    break;
                case 'transaction':
                    mapping.columns.right.entities.push(entity.name);
                    break;
            }
        });

        return mapping;
    }

    /**
     * Generate business rules using 3-layer inheritance
     */
    async generateBusinessRules(entities, uiConfig) {
        console.log('📋 Generating business rules...');
        
        const rules = {
            metadata: {
                generated: new Date().toISOString(),
                serviceType: uiConfig.serviceType,
                clientName: uiConfig.clientName
            },
            layers: {
                layer1: { name: 'Base BUSM Rules', count: 67, source: 'busm-entities' },
                layer2: { name: `${uiConfig.serviceType} Rules`, count: 12, source: 'service-template' },
                layer3: { name: 'Client Customizations', count: 0, source: 'ui-input' }
            },
            rules: []
        };

        // Layer 1: Base rules from BUSM entities
        entities.forEach(entity => {
            rules.rules.push({
                id: `BR_${entity.name}_REQUIRED`,
                layer: 1,
                entity: entity.name,
                type: 'validation',
                description: `${entity.name} required field validation`,
                priority: 'high'
            });
        });

        // Layer 2: Service-specific rules (mock for rough sketch)
        if (uiConfig.serviceType === 'Pest Control') {
            rules.rules.push({
                id: 'BR_SERVICE_SCHEDULE_REQUIRED',
                layer: 2,
                entity: 'WORK_ORDER',
                type: 'business',
                description: 'Pest control services require scheduling',
                priority: 'medium'
            });
        }

        // Layer 3: Client customizations from UI
        if (uiConfig.customRules) {
            try {
                const customRules = JSON.parse(uiConfig.customRules);
                // Process custom rules (simplified for rough sketch)
                rules.layers.layer3.count = Array.isArray(customRules) ? customRules.length : 0;
            } catch (e) {
                console.warn('⚠️ Invalid custom rules JSON, skipping');
            }
        }

        this.results.rules = rules.rules.length;
        console.log(`✅ Generated ${rules.rules.length} business rules`);
        
        return rules;
    }

    /**
     * Write all Stage 1 output artifacts
     */
    async writeArtifacts(outputPath, data) {
        console.log('💾 Writing Stage 1 artifacts...');
        
        const artifacts = [
            {
                filename: 'scope-definition.json',
                content: {
                    serviceType: data.uiConfig.serviceType,
                    clientName: data.uiConfig.clientName,
                    module: data.uiConfig.module,
                    subModule: data.uiConfig.subModule,
                    feature: data.uiConfig.feature,
                    userStory: data.uiConfig.userStory,
                    timestamp: new Date().toISOString()
                }
            },
            {
                filename: 'selected-entities.json',
                content: {
                    entities: data.entities,
                    count: data.entities.length,
                    selectionCriteria: 'manual-ui-selection'
                }
            },
            {
                filename: 'component-specifications.json',
                content: data.components
            },
            {
                filename: 'business-rules.json',
                content: data.businessRules
            }
        ];

        // Add template config if saving template
        if (data.uiConfig.saveTemplate) {
            artifacts.push({
                filename: 'template-config.json',
                content: {
                    templateName: data.uiConfig.templateName,
                    serviceType: data.uiConfig.serviceType,
                    savedAt: new Date().toISOString(),
                    entities: data.uiConfig.selectedEntities,
                    reusable: true
                }
            });
        }

        // Write all artifacts
        for (const artifact of artifacts) {
            const filePath = path.join(outputPath, artifact.filename);
            await fs.promises.writeFile(
                filePath, 
                JSON.stringify(artifact.content, null, 2), 
                'utf8'
            );
            console.log(`📄 Written: ${artifact.filename}`);
        }

        this.results.artifacts = artifacts.length;
    }

    /**
     * Validate output artifacts for format and completeness
     */
    async validateOutputs(outputPath) {
        console.log('🔍 Validating output artifacts...');
        
        const requiredFiles = [
            'scope-definition.json',
            'selected-entities.json',
            'component-specifications.json',
            'business-rules.json'
        ];

        for (const filename of requiredFiles) {
            const filePath = path.join(outputPath, filename);
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`Missing required artifact: ${filename}`);
            }

            // Validate JSON format
            try {
                const content = await fs.promises.readFile(filePath, 'utf8');
                JSON.parse(content);
                console.log(`✅ Valid: ${filename}`);
            } catch (error) {
                throw new Error(`Invalid JSON in ${filename}: ${error.message}`);
            }
        }

        console.log('🎯 All artifacts validated successfully');
    }

    /**
     * Report Stage 1 completion with metrics
     */
    reportCompletion() {
        const duration = Date.now() - this.startTime;
        
        console.log('\n🎉 Stage 1 Complete!');
        console.log('📊 Results Summary:');
        console.log(`   Entities: ${this.results.entities} selected`);
        console.log(`   Components: ${this.results.components} generated`);
        console.log(`   Rules: ${this.results.rules} ready`);
        console.log(`   Artifacts: ${this.results.artifacts} created`);
        console.log(`   Duration: ${duration}ms`);
        console.log('🚀 Ready for Stage 2!');
    }
}

// CLI interface for testing
if (require.main === module) {
    const mockConfig = {
        serviceType: 'Pest Control',
        clientName: 'ABC Pest Control',
        module: 'Accounts',
        subModule: 'Master View',
        selectedEntities: ['ACCOUNT', 'CONTACT', 'SERVICE_LOCATION', 'WORK_ORDER'],
        customRules: '',
        saveTemplate: true,
        templateName: 'PestControl_20250901'
    };

    const orchestrator = new Stage1Orchestrator();
    orchestrator.process(mockConfig)
        .then(results => {
            console.log('✅ Test completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = Stage1Orchestrator;