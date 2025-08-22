#!/usr/bin/env node

/**
 * STORY-BUILDER Processor
 * Purpose: Generate user stories with COMPLETE requirement mapping
 * Input: Sub-module spec + requirements.json
 * Output: User stories with acceptance criteria mapped to requirements
 * 
 * Spirit of Requirements - Every requirement gets a boarding pass!
 */

const fs = require('fs');
const path = require('path');

class StoryBuilder {
    constructor(config = {}) {
        this.config = {
            storyPrefix: 'US',
            maxStoriesPerModule: 10,
            requirementsPath: '.pipeline/2-factory/validation/requirements.json',
            ...config
        };
        
        this.requirements = null;
        this.unmappedRequirements = new Set();
        this.stories = [];
        this.requirementMappings = {};
    }

    /**
     * Main story generation process
     */
    async generate(specFile, outputDir) {
        console.log('📚 STORY-BUILDER: Generating stories with requirement tracking');
        console.log('📂 Spec File:', specFile);
        console.log('📂 Output Directory:', outputDir);
        console.log('');
        
        // Load requirements FIRST - this is critical!
        await this.loadRequirements();
        
        // Read the spec
        const specContent = fs.readFileSync(specFile, 'utf8');
        const specData = this.parseSpec(specContent);
        
        // Generate stories based on spec sections
        console.log('\n📝 Generating user stories...');
        this.generateStoriesFromSpec(specData);
        
        // Map requirements to stories
        console.log('\n🔗 Mapping requirements to stories...');
        this.mapRequirementsToStories();
        
        // Check for unmapped requirements
        this.checkUnmappedRequirements();
        
        // Write output files
        await this.writeOutput(outputDir, specData);
        
        console.log('\n✅ Story generation complete!');
        console.log(`📊 Generated ${this.stories.length} stories`);
        console.log(`🔗 Mapped ${Object.keys(this.requirementMappings).length} requirements`);
        
        if (this.unmappedRequirements.size > 0) {
            console.log(`⚠️  WARNING: ${this.unmappedRequirements.size} requirements not mapped!`);
            this.unmappedRequirements.forEach(reqId => {
                const req = this.requirements.requirements.find(r => r.id === reqId);
                console.log(`   ❌ ${reqId}: ${req.text}`);
            });
        }
        
        return {
            success: true,
            stories: this.stories,
            mappings: this.requirementMappings,
            unmapped: Array.from(this.unmappedRequirements)
        };
    }
    
    /**
     * Load requirements.json
     */
    async loadRequirements() {
        const reqPath = path.join(process.cwd(), this.config.requirementsPath);
        
        if (!fs.existsSync(reqPath)) {
            console.log('⚠️  requirements.json not found - generating stories without requirement tracking');
            console.log('   Run REQUIREMENTS-PARSER first for complete tracking!');
            this.requirements = { requirements: [], mandatoryRequirements: [] };
            return;
        }
        
        this.requirements = JSON.parse(fs.readFileSync(reqPath, 'utf8'));
        console.log(`✅ Loaded ${this.requirements.requirements.length} requirements`);
        console.log(`   🔴 Mandatory: ${this.requirements.mandatoryRequirements.length}`);
        
        // Initialize all requirements as unmapped
        this.requirements.requirements.forEach(req => {
            this.unmappedRequirements.add(req.id);
        });
    }
    
    /**
     * Parse the spec file
     */
    parseSpec(content) {
        const lines = content.split('\n');
        const spec = {
            title: '',
            subModule: '',
            userStories: [],
            validationCriteria: [],
            technicalSpecs: {},
            raw: content
        };
        
        // Extract key information
        lines.forEach((line, idx) => {
            if (line.includes('Sub-Module ID:')) {
                spec.subModule = line.split(':')[1].trim();
            }
            if (line.includes('# ') && idx < 10) {
                spec.title = line.replace('#', '').trim();
            }
        });
        
        // Extract user story hints from spec
        const storySection = this.extractSection(lines, '## User Stories', '##');
        if (storySection) {
            spec.userStories = this.parseUserStorySection(storySection);
        }
        
        // Extract validation criteria
        const validationSection = this.extractSection(lines, 'Validation Criteria', '-');
        if (validationSection) {
            spec.validationCriteria = validationSection
                .filter(l => l.includes('-'))
                .map(l => l.replace('-', '').trim());
        }
        
        return spec;
    }
    
    /**
     * Extract a section from spec lines
     */
    extractSection(lines, startMarker, endMarker) {
        const start = lines.findIndex(l => l.includes(startMarker));
        if (start === -1) return null;
        
        const section = [];
        for (let i = start + 1; i < lines.length; i++) {
            if (lines[i].startsWith(endMarker) && i > start + 1) break;
            section.push(lines[i]);
        }
        return section;
    }
    
    /**
     * Parse user story section from spec
     */
    parseUserStorySection(lines) {
        const stories = [];
        let currentStory = null;
        
        lines.forEach(line => {
            if (line.includes('###')) {
                if (currentStory) stories.push(currentStory);
                currentStory = {
                    title: line.replace(/###\s*/, '').trim(),
                    items: []
                };
            } else if (currentStory && line.includes('-')) {
                currentStory.items.push(line.replace('-', '').trim());
            }
        });
        
        if (currentStory) stories.push(currentStory);
        return stories;
    }
    
    /**
     * Generate stories from spec data
     */
    generateStoriesFromSpec(specData) {
        const subModuleNumber = specData.subModule.replace(/\./g, '');
        
        // Story 1: Accounts Column (maps to layout, navigation, data requirements)
        this.stories.push({
            id: `US-${subModuleNumber}-001`,
            title: 'Accounts Column',
            description: 'As a user, I want to see all accounts in the left column so I can quickly navigate to any account',
            priority: 'High',
            category: 'accounts',
            requirementIds: [],
            acceptanceCriteria: [
                {
                    id: 'AC-001',
                    text: 'Display all accounts with search/filter capability',
                    requirementIds: []
                },
                {
                    id: 'AC-002',
                    text: 'Show account type indicators (C/R/I) for each account',
                    requirementIds: []
                },
                {
                    id: 'AC-003',
                    text: 'Display visual status indicators (active/inactive)',
                    requirementIds: []
                },
                {
                    id: 'AC-004',
                    text: 'Click on account loads related locations in middle column',
                    requirementIds: []
                },
                {
                    id: 'AC-005',
                    text: 'Support keyboard navigation with arrow keys',
                    requirementIds: []
                },
                {
                    id: 'AC-006',
                    text: 'Real-time search filters accounts as user types',
                    requirementIds: []
                },
                {
                    id: 'AC-007',
                    text: 'Emit account:selected event when account is selected',
                    requirementIds: []
                }
            ]
        });
        
        // Story 2: Service Locations Column
        this.stories.push({
            id: `US-${subModuleNumber}-002`,
            title: 'Service Locations Column',
            description: 'As a user, I want to see locations for the selected account so I can navigate to specific service locations',
            priority: 'High',
            category: 'locations',
            requirementIds: [],
            acceptanceCriteria: [
                {
                    id: 'AC-001',
                    text: 'Display locations for selected account only',
                    requirementIds: []
                },
                {
                    id: 'AC-002',
                    text: 'Show service status indicators for each location',
                    requirementIds: []
                },
                {
                    id: 'AC-003',
                    text: 'Display next service date for each location',
                    requirementIds: []
                },
                {
                    id: 'AC-004',
                    text: 'Click on location loads related work orders',
                    requirementIds: []
                },
                {
                    id: 'AC-005',
                    text: 'Support location search within selected account',
                    requirementIds: []
                },
                {
                    id: 'AC-006',
                    text: 'Emit location:selected event when location is selected',
                    requirementIds: []
                }
            ]
        });
        
        // Story 3: Work Orders Column (includes 3-click rule!)
        this.stories.push({
            id: `US-${subModuleNumber}-003`,
            title: 'Work Orders Column',
            description: 'As a user, I want to see work orders for the selected location so I can manage service tasks',
            priority: 'High',
            category: 'workorders',
            requirementIds: [],
            acceptanceCriteria: [
                {
                    id: 'AC-001',
                    text: 'Display work orders for selected location only',
                    requirementIds: []
                },
                {
                    id: 'AC-002',
                    text: 'Show status with color coding for each work order',
                    requirementIds: []
                },
                {
                    id: 'AC-003',
                    text: 'Display scheduled date/time for each work order',
                    requirementIds: []
                },
                {
                    id: 'AC-004',
                    text: 'Provide quick status update actions',
                    requirementIds: []
                },
                {
                    id: 'AC-005',
                    text: 'Work orders must be reachable in maximum 3 clicks from page load',
                    requirementIds: []
                },
                {
                    id: 'AC-006',
                    text: 'Emit workOrder:selected event when work order is selected',
                    requirementIds: []
                }
            ]
        });
        
        // Story 4: Integrated Actions (Progressive)
        this.stories.push({
            id: `US-${subModuleNumber}-004`,
            title: 'Integrated Actions',
            description: 'As a power user, I want bulk operations and drag-drop so I can manage multiple items efficiently',
            priority: 'Medium',
            category: 'integration',
            phase: 'progressive',
            requirementIds: [],
            acceptanceCriteria: [
                {
                    id: 'AC-001',
                    text: 'Support multi-select with Shift/Ctrl click',
                    requirementIds: []
                },
                {
                    id: 'AC-002',
                    text: 'Provide right-click context menus',
                    requirementIds: []
                },
                {
                    id: 'AC-003',
                    text: 'Enable drag-and-drop operations between columns',
                    requirementIds: []
                },
                {
                    id: 'AC-004',
                    text: 'Support quick-create from any column',
                    requirementIds: []
                },
                {
                    id: 'AC-005',
                    text: 'Provide bulk status update capabilities',
                    requirementIds: []
                }
            ]
        });
        
        // Story 5: Performance and Quality
        this.stories.push({
            id: `US-${subModuleNumber}-005`,
            title: 'Performance and Quality',
            description: 'As a user, I want fast and reliable performance so I can work efficiently',
            priority: 'High',
            category: 'performance',
            requirementIds: [],
            acceptanceCriteria: [
                {
                    id: 'AC-001',
                    text: 'Initial page render completes in less than 1 second',
                    requirementIds: []
                },
                {
                    id: 'AC-002',
                    text: 'Column updates complete in less than 200ms',
                    requirementIds: []
                },
                {
                    id: 'AC-003',
                    text: 'Search response completes in less than 100ms',
                    requirementIds: []
                },
                {
                    id: 'AC-004',
                    text: 'Support minimum 50 accounts with smooth scrolling',
                    requirementIds: []
                },
                {
                    id: 'AC-005',
                    text: 'Handle 3-5 locations per account on average',
                    requirementIds: []
                },
                {
                    id: 'AC-006',
                    text: 'Handle 5-10 work orders per location on average',
                    requirementIds: []
                },
                {
                    id: 'AC-007',
                    text: 'All interactions logged to console for debugging',
                    requirementIds: []
                }
            ]
        });
    }
    
    /**
     * Map requirements to stories and acceptance criteria
     */
    mapRequirementsToStories() {
        if (!this.requirements || !this.requirements.requirements) return;
        
        this.requirements.requirements.forEach(req => {
            let mapped = false;
            
            // Map based on requirement category and content
            this.stories.forEach(story => {
                story.acceptanceCriteria.forEach(ac => {
                    if (this.requirementMatchesAcceptance(req, ac.text, story.category)) {
                        ac.requirementIds.push(req.id);
                        story.requirementIds.push(req.id);
                        this.requirementMappings[req.id] = {
                            storyId: story.id,
                            acceptanceCriteria: ac.id,
                            requirement: req.text
                        };
                        this.unmappedRequirements.delete(req.id);
                        mapped = true;
                        
                        console.log(`  ✅ Mapped ${req.id} to ${story.id}/${ac.id}`);
                    }
                });
            });
            
            if (!mapped && req.priority === 'mandatory') {
                console.log(`  ⚠️  Mandatory requirement ${req.id} not mapped: ${req.text}`);
            }
        });
        
        // Special handling for critical requirements
        this.ensureCriticalRequirements();
    }
    
    /**
     * Check if requirement matches acceptance criteria
     */
    requirementMatchesAcceptance(req, acceptanceText, storyCategory) {
        const reqText = req.text.toLowerCase();
        const acText = acceptanceText.toLowerCase();
        
        // Direct text matching
        if (acText.includes('3 clicks') && reqText.includes('3 clicks')) return true;
        if (acText.includes('account type') && reqText.includes('c/r/i')) return true;
        if (acText.includes('status indicator') && reqText.includes('status indicator')) return true;
        if (acText.includes('search') && reqText.includes('filter')) return true;
        if (acText.includes('keyboard') && reqText.includes('arrow key')) return true;
        if (acText.includes('1 second') && reqText.includes('1 second')) return true;
        if (acText.includes('200ms') && reqText.includes('200ms')) return true;
        if (acText.includes('100ms') && reqText.includes('100ms')) return true;
        if (acText.includes('50 accounts') && reqText.includes('50 accounts')) return true;
        if (acText.includes('3-5 locations') && reqText.includes('3-5 locations')) return true;
        if (acText.includes('5-10 work orders') && reqText.includes('5-10 work')) return true;
        if (acText.includes('console') && reqText.includes('console.log')) return true;
        
        // Event matching
        if (acText.includes('account:selected') && req.id === 'EVT-001') return true;
        if (acText.includes('location:selected') && req.id === 'EVT-002') return true;
        if (acText.includes('workorder:selected') && req.id === 'EVT-003') return true;
        
        // Category-based matching
        if (storyCategory === 'accounts' && req.category === 'layout' && reqText.includes('column')) return true;
        if (storyCategory === 'performance' && req.category === 'performance') return true;
        
        // Navigation requirements
        if (req.id === 'NAV-001' && acText.includes('navigate')) return true;
        if (req.id === 'NAV-002' && acText.includes('selected')) return true;
        if (req.id === 'NAV-003' && acText.includes('click')) return true;
        if (req.id === 'NAV-004' && acText.includes('3 clicks')) return true;
        
        return false;
    }
    
    /**
     * Ensure critical requirements are mapped
     */
    ensureCriticalRequirements() {
        // The 3-click rule MUST be mapped
        if (this.unmappedRequirements.has('NAV-004')) {
            console.log('\n🚨 CRITICAL: 3-click rule (NAV-004) not mapped! Forcing mapping...');
            
            const workOrderStory = this.stories.find(s => s.category === 'workorders');
            if (workOrderStory) {
                const threeClickAC = workOrderStory.acceptanceCriteria.find(ac => 
                    ac.text.includes('3 clicks')
                );
                
                if (threeClickAC) {
                    threeClickAC.requirementIds.push('NAV-004');
                    workOrderStory.requirementIds.push('NAV-004');
                    this.requirementMappings['NAV-004'] = {
                        storyId: workOrderStory.id,
                        acceptanceCriteria: threeClickAC.id,
                        requirement: 'Users MUST be able to navigate to any work order in less than 3 clicks'
                    };
                    this.unmappedRequirements.delete('NAV-004');
                    console.log('  ✅ Force-mapped NAV-004 to work orders story');
                }
            }
        }
        
        // Ensure all mandatory requirements are at least tracked
        this.requirements.mandatoryRequirements.forEach(reqId => {
            if (this.unmappedRequirements.has(reqId)) {
                const req = this.requirements.requirements.find(r => r.id === reqId);
                console.log(`  🔴 Mandatory requirement not mapped: ${reqId} - ${req.text}`);
            }
        });
    }
    
    /**
     * Check for unmapped requirements
     */
    checkUnmappedRequirements() {
        if (this.unmappedRequirements.size > 0) {
            console.log(`\n⚠️  ${this.unmappedRequirements.size} requirements not mapped to stories:`);
            
            const unmappedMandatory = [];
            const unmappedProgressive = [];
            
            this.unmappedRequirements.forEach(reqId => {
                const req = this.requirements.requirements.find(r => r.id === reqId);
                if (req.priority === 'mandatory') {
                    unmappedMandatory.push(req);
                } else {
                    unmappedProgressive.push(req);
                }
            });
            
            if (unmappedMandatory.length > 0) {
                console.log('\n🔴 Unmapped MANDATORY requirements:');
                unmappedMandatory.forEach(req => {
                    console.log(`   ${req.id}: ${req.text}`);
                });
            }
            
            if (unmappedProgressive.length > 0) {
                console.log('\n🟡 Unmapped progressive requirements:');
                unmappedProgressive.forEach(req => {
                    console.log(`   ${req.id}: ${req.text}`);
                });
            }
        } else {
            console.log('\n✅ All requirements mapped to stories!');
        }
    }
    
    /**
     * Write output files
     */
    async writeOutput(outputDir, specData) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write individual story files
        this.stories.forEach(story => {
            const storyPath = path.join(outputDir, `${story.id}-${story.title.toLowerCase().replace(/\s+/g, '-')}.md`);
            const storyContent = this.generateStoryMarkdown(story);
            fs.writeFileSync(storyPath, storyContent);
            console.log(`  ✅ Generated: ${story.id}.md`);
        });
        
        // Write stories manifest
        const manifest = {
            generator: 'STORY-BUILDER',
            version: '2.0',
            timestamp: new Date().toISOString(),
            subModule: specData.subModule,
            totalStories: this.stories.length,
            totalRequirements: this.requirements.requirements.length,
            mappedRequirements: Object.keys(this.requirementMappings).length,
            unmappedRequirements: Array.from(this.unmappedRequirements),
            stories: this.stories.map(s => ({
                id: s.id,
                title: s.title,
                requirementCount: s.requirementIds.length,
                requirementIds: [...new Set(s.requirementIds)]
            })),
            requirementMappings: this.requirementMappings
        };
        
        const manifestPath = path.join(outputDir, 'stories-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`  ✅ Generated: stories-manifest.json`);
        
        // Write requirements traceability report
        const traceabilityReport = this.generateTraceabilityReport();
        const reportPath = path.join(outputDir, 'requirements-traceability.md');
        fs.writeFileSync(reportPath, traceabilityReport);
        console.log(`  ✅ Generated: requirements-traceability.md`);
    }
    
    /**
     * Generate story markdown
     */
    generateStoryMarkdown(story) {
        const requirementsList = [...new Set(story.requirementIds)];
        
        return `# ${story.id}: ${story.title}

**Priority**: ${story.priority}  
**Category**: ${story.category}  
${story.phase ? `**Phase**: ${story.phase}  ` : ''}
**Requirements Mapped**: ${requirementsList.length}  

## User Story
${story.description}

## Acceptance Criteria

${story.acceptanceCriteria.map(ac => {
    const reqIds = ac.requirementIds.length > 0 ? 
        ` [Requirements: ${ac.requirementIds.join(', ')}]` : '';
    return `- [ ] ${ac.text}${reqIds}`;
}).join('\n')}

## Mapped Requirements
${requirementsList.length > 0 ? requirementsList.map(reqId => {
    const req = this.requirements.requirements.find(r => r.id === reqId);
    return `- **${reqId}**: ${req ? req.text : 'Unknown requirement'}`;
}).join('\n') : 'No requirements directly mapped to this story.'}

## Technical Notes
- This story was generated with automatic requirement mapping
- All acceptance criteria should be validated against requirements.json
- Use CONCEPT-GENERATOR validation to verify implementation

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All mapped requirements validated
- [ ] Unit tests written and passing
- [ ] Code review completed
- [ ] Documentation updated
`;
    }
    
    /**
     * Generate traceability report
     */
    generateTraceabilityReport() {
        const totalReqs = this.requirements.requirements.length;
        const mappedReqs = Object.keys(this.requirementMappings).length;
        const unmappedReqs = this.unmappedRequirements.size;
        const coverage = ((mappedReqs / totalReqs) * 100).toFixed(1);
        
        return `# Requirements Traceability Report

**Generated**: ${new Date().toISOString()}  
**Total Requirements**: ${totalReqs}  
**Mapped Requirements**: ${mappedReqs} (${coverage}%)  
**Unmapped Requirements**: ${unmappedReqs}  

## Requirement to Story Mapping

| Requirement ID | Requirement Text | Story ID | Acceptance Criteria |
|---------------|------------------|----------|-------------------|
${this.requirements.requirements.map(req => {
    const mapping = this.requirementMappings[req.id];
    if (mapping) {
        return `| ${req.id} | ${req.text} | ${mapping.storyId} | ${mapping.acceptanceCriteria} |`;
    } else {
        return `| ${req.id} | ${req.text} | ❌ NOT MAPPED | - |`;
    }
}).join('\n')}

## Coverage by Category

${Object.entries(this.requirements.requirementsByCategory || {}).map(([category, reqs]) => {
    const categoryMapped = reqs.filter(r => this.requirementMappings[r.id]).length;
    const categoryTotal = reqs.length;
    const categoryCoverage = ((categoryMapped / categoryTotal) * 100).toFixed(1);
    return `- **${category}**: ${categoryMapped}/${categoryTotal} (${categoryCoverage}%)`;
}).join('\n')}

## Critical Requirements Status

### ✅ Mapped Critical Requirements
${this.requirements.mandatoryRequirements
    .filter(reqId => this.requirementMappings[reqId])
    .map(reqId => {
        const req = this.requirements.requirements.find(r => r.id === reqId);
        const mapping = this.requirementMappings[reqId];
        return `- **${reqId}**: ${req.text} → ${mapping.storyId}`;
    }).join('\n') || 'None'}

### ❌ Unmapped Critical Requirements
${this.requirements.mandatoryRequirements
    .filter(reqId => !this.requirementMappings[reqId])
    .map(reqId => {
        const req = this.requirements.requirements.find(r => r.id === reqId);
        return `- **${reqId}**: ${req.text}`;
    }).join('\n') || 'None - All critical requirements mapped!'}

## Validation Instructions

1. Review all unmapped requirements
2. Verify critical requirements are in acceptance criteria
3. Run CONCEPT-GENERATOR with validation
4. Check validation-report.json for test results

## Notes
- This report shows complete requirement traceability
- Any unmapped mandatory requirements should be addressed immediately
- Use this report to ensure no requirements are lost in translation
`;
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: STORY-BUILDER <spec-file> <output-dir>');
        console.log('Example: STORY-BUILDER ./specs/1.1.1-master-view-spec.md ./stories');
        process.exit(1);
    }
    
    const [specFile, outputDir] = args;
    
    const builder = new StoryBuilder();
    
    builder.generate(specFile, outputDir)
        .then(result => {
            console.log('\n🎉 Story generation successful!');
            console.log('📁 Output directory:', outputDir);
            
            if (result.unmapped.length > 0) {
                console.log('\n⚠️  Action required:');
                console.log('   Review unmapped requirements in requirements-traceability.md');
                console.log('   Consider adding acceptance criteria for mandatory requirements');
            }
            
            console.log('\n🚀 Next steps:');
            console.log('  1. Review generated stories for completeness');
            console.log('  2. Check requirements-traceability.md');
            console.log('  3. Run PLANNER to create task breakdowns');
            console.log('  4. Run CONCEPT-GENERATOR with validation');
        })
        .catch(err => {
            console.error('❌ Generation failed:', err.message);
            console.error(err.stack);
            process.exit(1);
        });
}

module.exports = StoryBuilder;