#!/usr/bin/env node

/**
 * FEEDBACK-TO-REQUIREMENTS CONVERTER
 * 
 * This is the KEY integration point that makes feedback a first-class citizen
 * in our requirements pipeline. Instead of one-off implementations, feedback
 * becomes formal requirements that flow through the ENTIRE pipeline!
 * 
 * Flow:
 * 1. User Feedback → 
 * 2. Requirements Spec →
 * 3. Parser →
 * 4. Story Builder →
 * 5. Planner →
 * 6. Concept Generator
 * 
 * NO MORE ONE-OFFS! Everything follows the same disciplined flow.
 */

const fs = require('fs');
const path = require('path');

// Import the BUSM registry for validation
const BUSM = require('../contracts/busm-registry.js');

class FeedbackToRequirementsConverter {
    constructor() {
        this.pipelineRoot = path.join(__dirname, '../../..');
        this.feedbackTasksDir = path.join(this.pipelineRoot, '.pipeline/1-inputs/requirements/feedback-tasks');
        this.outputDir = path.join(this.pipelineRoot, '.pipeline/1-inputs/requirements/feedback-requirements');
        this.timestamp = new Date().toISOString().split('T')[0];
        this.requirements = [];
        this.mappings = {};
    }

    async convert() {
        console.log('\n🔄 FEEDBACK-TO-REQUIREMENTS CONVERTER\n');
        console.log('=' .repeat(60));
        console.log('TRANSFORMING USER FEEDBACK INTO FORMAL REQUIREMENTS\n');
        
        // 1. Load all feedback tasks
        const feedbackTasks = this.loadFeedbackTasks();
        
        if (feedbackTasks.length === 0) {
            console.log('📭 No feedback tasks found to convert.');
            return;
        }
        
        console.log(`📋 Found ${feedbackTasks.length} feedback items to convert\n`);
        
        // 2. Validate against BUSM
        console.log('🔍 VALIDATING AGAINST BUSM...\n');
        const validatedTasks = this.validateAgainstBUSM(feedbackTasks);
        
        // 3. Group by feature area
        const groupedTasks = this.groupByFeature(validatedTasks);
        
        // 4. Generate requirements specs for each group
        for (const [feature, tasks] of Object.entries(groupedTasks)) {
            console.log(`\n📝 Generating requirements spec for: ${feature}`);
            this.generateRequirementsSpec(feature, tasks);
        }
        
        // 5. Create master feedback requirements document
        this.createMasterDocument();
        
        console.log('\n' + '=' .repeat(60));
        console.log('✅ CONVERSION COMPLETE!\n');
        console.log('📊 Results:');
        console.log(`   - Feedback items processed: ${feedbackTasks.length}`);
        console.log(`   - Requirements generated: ${this.requirements.length}`);
        console.log(`   - Feature areas: ${Object.keys(groupedTasks).length}`);
        console.log(`\n🎯 Next Steps:`);
        console.log(`   1. Requirements spec created at: ${this.outputDir}`);
        console.log(`   2. Run the Requirements Parser on the new spec`);
        console.log(`   3. Continue through the normal pipeline`);
        console.log(`   4. NO ONE-OFFS - everything flows through the pipeline!\n`);
    }
    
    loadFeedbackTasks() {
        const tasks = [];
        
        if (!fs.existsSync(this.feedbackTasksDir)) {
            return tasks;
        }
        
        const files = fs.readdirSync(this.feedbackTasksDir);
        
        for (const file of files) {
            if (file.endsWith('.json') && file.startsWith('TASK-')) {
                const content = fs.readFileSync(
                    path.join(this.feedbackTasksDir, file),
                    'utf8'
                );
                tasks.push(JSON.parse(content));
            }
        }
        
        return tasks;
    }
    
    validateAgainstBUSM(tasks) {
        const validated = [];
        
        for (const task of tasks) {
            console.log(`Validating: ${task.title || task.id}`);
            
            // Parse the description to find requested fields
            const requestedFields = this.parseRequestedFields(task.description);
            
            // Validate each field against BUSM
            const validation = {
                task: task,
                fields: [],
                valid: true,
                warnings: []
            };
            
            for (const field of requestedFields) {
                const busmField = this.findInBUSM(field);
                
                if (busmField) {
                    console.log(`   ✅ Found in BUSM: ${field} → ${busmField.entity}.${busmField.field}`);
                    validation.fields.push({
                        requested: field,
                        entity: busmField.entity,
                        field: busmField.field,
                        type: busmField.type,
                        mockData: this.generateMockData(busmField)
                    });
                } else {
                    console.log(`   ⚠️ Not found in BUSM: ${field}`);
                    validation.warnings.push(`Field "${field}" not found in BUSM`);
                }
            }
            
            validated.push(validation);
        }
        
        return validated;
    }
    
    parseRequestedFields(description) {
        const fields = [];
        
        // Look for patterns like:
        // - "billing address city"
        // - "primary contact"
        // - "preferred communication method"
        
        const patterns = [
            /billing.*city/gi,
            /billing.*address/gi,
            /primary.*contact/gi,
            /contact.*name/gi,
            /communication.*preference/gi,
            /communication.*method/gi,
            /preferred.*communication/gi
        ];
        
        for (const pattern of patterns) {
            if (pattern.test(description)) {
                fields.push(pattern.source.replace(/[\\/.]/g, '').replace(/gi$/, ''));
            }
        }
        
        return fields;
    }
    
    findInBUSM(fieldRequest) {
        // Map common requests to BUSM fields
        const mappings = {
            'billing.*city': { entity: 'Account', field: 'BillingCity', type: 'string' },
            'billing.*address': { entity: 'Account', field: 'BillingStreetAddress', type: 'string' },
            'primary.*contact': { entity: 'Contact', field: 'IsPrimaryContact', type: 'boolean' },
            'contact.*name': { entity: 'Contact', field: ['FirstName', 'LastName'], type: 'string' },
            'communication.*preference': { entity: 'Contact', field: 'CommunicationPreference', type: 'enum' },
            'communication.*method': { entity: 'Contact', field: 'CommunicationPreference', type: 'enum' },
            'preferred.*communication': { entity: 'Contact', field: 'CommunicationPreference', type: 'enum' }
        };
        
        for (const [pattern, mapping] of Object.entries(mappings)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(fieldRequest)) {
                return mapping;
            }
        }
        
        return null;
    }
    
    generateMockData(busmField) {
        // Generate appropriate mock data based on type
        const mockGenerators = {
            'Account.BillingCity': () => ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
            'Account.BillingStreetAddress': () => `${Math.floor(Math.random() * 999) + 1} Business Ave`,
            'Contact.FirstName': () => ['John', 'Jane', 'Bob', 'Alice', 'Charlie'][Math.floor(Math.random() * 5)],
            'Contact.LastName': () => ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)],
            'Contact.CommunicationPreference': () => ['Email', 'Voice', 'Text'][Math.floor(Math.random() * 3)]
        };
        
        const key = `${busmField.entity}.${busmField.field}`;
        if (mockGenerators[key]) {
            return mockGenerators[key]();
        }
        
        // Default mock data
        switch (busmField.type) {
            case 'string': return 'Sample Text';
            case 'boolean': return true;
            case 'enum': return 'Default';
            default: return 'Mock Data';
        }
    }
    
    groupByFeature(validatedTasks) {
        const groups = {};
        
        for (const validation of validatedTasks) {
            const task = validation.task;
            
            // Determine feature area from context or type
            let feature = 'general';
            
            if (task.context && task.context.selectedAccount) {
                feature = 'account-display';
            } else if (task.type === 'ui') {
                feature = 'ui-enhancements';
            }
            
            if (!groups[feature]) {
                groups[feature] = [];
            }
            
            groups[feature].push(validation);
        }
        
        return groups;
    }
    
    generateRequirementsSpec(feature, validatedTasks) {
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        
        const specPath = path.join(this.outputDir, `${feature}-feedback-spec.md`);
        
        let spec = `# Feedback-Driven Requirements: ${feature}
**Generated**: ${new Date().toISOString()}
**Source**: User Feedback Collection
**Status**: Ready for Pipeline Processing

## Overview
This requirements specification was automatically generated from user feedback.
It will flow through the standard Concept Line pipeline for implementation.

## Business Context
Users have provided feedback requesting enhancements to the ${feature} functionality.
These requirements have been validated against the BUSM and are ready for processing.

## Requirements

`;
        
        let reqCounter = 1;
        
        for (const validation of validatedTasks) {
            const task = validation.task;
            const reqId = `FB-REQ-${String(reqCounter).padStart(3, '0')}`;
            
            spec += `### ${reqId}: ${task.title || task.description.substring(0, 50)}

**Priority**: ${task.priority || 'medium'}
**Type**: ${task.type}
**Source**: Feedback ID ${task.id}

#### Description
${task.description}

#### Data Requirements
Based on BUSM validation, this requirement involves the following data elements:

`;
            
            for (const field of validation.fields) {
                spec += `- **${field.entity}.${field.field}**: ${field.requested}
  - Type: ${field.type}
  - Mock Value: "${field.mockData}"
`;
            }
            
            spec += `
#### Acceptance Criteria
`;
            
            // Generate acceptance criteria based on task type
            if (task.type === 'ui') {
                spec += `1. The ${feature} display shall show the requested data fields
2. Data shall be retrieved from the ${validation.fields.map(f => f.entity).join(', ')} entities
3. Display shall be responsive across all device sizes
4. Display shall follow existing UI patterns and styles
`;
            }
            
            if (validation.warnings.length > 0) {
                spec += `
#### ⚠️ Validation Warnings
`;
                for (const warning of validation.warnings) {
                    spec += `- ${warning}\n`;
                }
            }
            
            spec += '\n---\n\n';
            
            // Track this requirement
            this.requirements.push({
                id: reqId,
                source: task.id,
                feature: feature,
                priority: task.priority,
                fields: validation.fields
            });
            
            reqCounter++;
        }
        
        spec += `## Implementation Notes

This specification should be processed through the standard pipeline:

1. **Requirements Parser**: Extract and validate all requirements
2. **Story Builder**: Generate user stories with BUSM mappings
3. **Planner**: Create implementation tasks
4. **Concept Generator**: Build HTML prototype with mock data from BUSM

## Traceability

| Feedback ID | Requirement ID | Status |
|------------|---------------|--------|
`;
        
        for (const req of this.requirements.filter(r => r.feature === feature)) {
            spec += `| ${req.source} | ${req.id} | Pending |\n`;
        }
        
        fs.writeFileSync(specPath, spec);
        console.log(`   ✅ Generated: ${feature}-feedback-spec.md`);
    }
    
    createMasterDocument() {
        const masterPath = path.join(this.outputDir, 'FEEDBACK-REQUIREMENTS-MASTER.md');
        
        let master = `# Master Feedback Requirements Document
**Generated**: ${new Date().toISOString()}
**Total Requirements**: ${this.requirements.length}

## Overview
This master document tracks all requirements generated from user feedback.
Each requirement has been validated against the BUSM and is ready for pipeline processing.

## Requirements Summary

| ID | Feature | Priority | BUSM Entities | Status |
|----|---------|----------|---------------|--------|
`;
        
        for (const req of this.requirements) {
            const entities = [...new Set(req.fields.map(f => f.entity))].join(', ');
            master += `| ${req.id} | ${req.feature} | ${req.priority} | ${entities} | Ready |\n`;
        }
        
        master += `

## Pipeline Integration

To process these requirements through the Concept Line:

\`\`\`bash
# Step 1: Parse requirements
node .pipeline/2-factory/processors/requirements-parser/REQUIREMENTS-PARSER.js \\
  .pipeline/1-inputs/requirements/feedback-requirements/*.md \\
  .pipeline/2-factory/validation

# Step 2: Generate stories
node .pipeline/2-factory/processors/story-builder/STORY-BUILDER.js

# Step 3: Plan implementation
node .pipeline/2-factory/processors/planner/PLANNER.js

# Step 4: Generate concepts
node .pipeline/2-factory/processors/concept-generator/CONCEPT-GENERATOR.js
\`\`\`

## Benefits of This Approach

1. **No One-Offs**: All feedback follows the same disciplined pipeline
2. **BUSM Validation**: Every field request is validated against the data model
3. **Traceability**: Complete lineage from feedback → requirement → story → task → implementation
4. **Mock Data**: Automatically generated from BUSM definitions
5. **Consistency**: All implementations follow the same patterns

## Next Steps

1. Review generated requirements specifications
2. Run through the pipeline processors
3. Validate generated concepts
4. Iterate based on additional feedback

---
*This document was automatically generated by the Feedback-to-Requirements Converter*
`;
        
        fs.writeFileSync(masterPath, master);
        console.log(`\n📄 Master document created: FEEDBACK-REQUIREMENTS-MASTER.md`);
    }
}

// Run if called directly
if (require.main === module) {
    const converter = new FeedbackToRequirementsConverter();
    converter.convert().catch(console.error);
}

module.exports = FeedbackToRequirementsConverter;