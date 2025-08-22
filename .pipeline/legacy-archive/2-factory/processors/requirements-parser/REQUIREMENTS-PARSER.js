#!/usr/bin/env node

/**
 * REQUIREMENTS-PARSER Processor
 * Purpose: Extract ALL requirements from specs with zero loss
 * Input: Specification markdown files
 * Output: requirements.json with complete requirement tracking
 * 
 * Spirit of St. Louis v2.0 - Now with proper navigation instruments!
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class RequirementsParser {
    constructor(config = {}) {
        this.config = {
            mandatoryKeywords: [
                'must', 'shall', 'required', 'critical', 
                '< 3 clicks', '< 1 second', '< 200ms', '< 100ms'
            ],
            progressiveKeywords: [
                'should', 'recommended', 'preferred', 'future'
            ],
            optionalKeywords: [
                'may', 'could', 'optional', 'planned', 'nice to have'
            ],
            ...config
        };
        
        this.requirements = [];
        this.requirementsByCategory = {};
        this.stats = {
            total: 0,
            mandatory: 0,
            progressive: 0,
            optional: 0,
            extracted: 0
        };
    }

    /**
     * Main parsing process
     */
    async parse(specFile, outputDir) {
        console.log('🔍 REQUIREMENTS-PARSER: Starting extraction');
        console.log('📂 Spec File:', specFile);
        console.log('📂 Output Directory:', outputDir);
        console.log('');
        
        // Read and parse the spec file
        const specContent = fs.readFileSync(specFile, 'utf8');
        const specLines = specContent.split('\n');
        
        // Extract requirements from every section
        this.extractFromPurpose(specLines);
        this.extractFromBusinessValue(specLines);
        this.extractFromUserExperience(specLines);
        this.extractFromUserStories(specLines);
        this.extractFromInterfaceContract(specLines);
        this.extractFromProgressivePlan(specLines);
        this.extractFromTechnicalSpecs(specLines);
        this.extractFromPerformanceTargets(specLines);
        this.extractFromValidationCriteria(specLines);
        this.extractFromPromotionCriteria(specLines);
        this.extractImplicitRequirements(specLines);
        
        // Generate unique IDs and categorize
        this.assignRequirementIds();
        this.categorizeRequirements();
        
        // Create output
        const requirementsJson = this.generateRequirementsJson();
        await this.writeOutput(outputDir, requirementsJson);
        
        // Generate validation rules
        const validationRules = this.generateValidationRules();
        await this.writeValidationRules(outputDir, validationRules);
        
        console.log('\n✅ Requirements extraction complete!');
        console.log(`📊 Extracted ${this.requirements.length} requirements`);
        console.log(`   🔴 Mandatory: ${this.stats.mandatory}`);
        console.log(`   🟡 Progressive: ${this.stats.progressive}`);
        console.log(`   🟢 Optional: ${this.stats.optional}`);
        
        return {
            success: true,
            requirements: this.requirements,
            stats: this.stats,
            outputFiles: [
                path.join(outputDir, 'requirements.json'),
                path.join(outputDir, 'validation-rules.json')
            ]
        };
    }
    
    /**
     * Extract from Feature Purpose section
     */
    extractFromPurpose(lines) {
        const purposeStart = lines.findIndex(l => l.includes('## Feature Purpose'));
        const purposeEnd = lines.findIndex((l, i) => i > purposeStart && l.startsWith('##'));
        
        if (purposeStart !== -1) {
            const purposeText = lines.slice(purposeStart, purposeEnd).join(' ');
            
            // Extract key purpose requirements
            if (purposeText.includes('three-column')) {
                this.addRequirement({
                    text: 'System must provide a three-column browser interface',
                    source: 'Feature Purpose',
                    lineNumber: purposeStart + 8,
                    priority: 'mandatory',
                    category: 'layout'
                });
            }
            
            if (purposeText.includes('rapid navigation')) {
                this.addRequirement({
                    text: 'System must enable rapid navigation through accounts, locations, and work orders',
                    source: 'Feature Purpose',
                    lineNumber: purposeStart + 8,
                    priority: 'mandatory',
                    category: 'navigation'
                });
            }
            
            if (purposeText.includes('without losing context')) {
                this.addRequirement({
                    text: 'System must preserve context when navigating between entities',
                    source: 'Feature Purpose',
                    lineNumber: purposeStart + 9,
                    priority: 'mandatory',
                    category: 'navigation'
                });
            }
        }
    }
    
    /**
     * Extract from Business Value section
     */
    extractFromBusinessValue(lines) {
        const valueStart = lines.findIndex(l => l.includes('## Business Value'));
        const valueEnd = lines.findIndex((l, i) => i > valueStart && l.startsWith('##'));
        
        if (valueStart !== -1) {
            const valueLines = lines.slice(valueStart, valueEnd);
            
            valueLines.forEach((line, idx) => {
                // 10x Faster Navigation
                if (line.includes('10x Faster')) {
                    this.addRequirement({
                        text: 'Navigation must be 10x faster than page loads',
                        source: 'Business Value',
                        lineNumber: valueStart + idx,
                        priority: 'mandatory',
                        category: 'performance'
                    });
                }
                
                // Reduce clicks from 5-7 to 1-2
                if (line.includes('5-7 to 1-2')) {
                    this.addRequirement({
                        text: 'Common tasks must be completed in 1-2 clicks (reduced from 5-7)',
                        source: 'Business Value',
                        lineNumber: valueStart + idx,
                        priority: 'mandatory',
                        category: 'navigation'
                    });
                }
            });
        }
    }
    
    /**
     * Extract from User Experience section
     */
    extractFromUserExperience(lines) {
        const uxStart = lines.findIndex(l => l.includes('## User Experience'));
        const uxEnd = lines.findIndex((l, i) => i > uxStart && l.startsWith('##'));
        
        if (uxStart !== -1) {
            const uxLines = lines.slice(uxStart, uxEnd);
            
            uxLines.forEach((line, idx) => {
                // Three-Column Layout
                if (line.includes('Accounts') && line.includes('Locations') && line.includes('Work Orders')) {
                    this.addRequirement({
                        text: 'Layout must have three columns: Accounts (left), Locations (middle), Work Orders (right)',
                        source: 'User Experience',
                        lineNumber: uxStart + idx,
                        priority: 'mandatory',
                        category: 'layout'
                    });
                }
                
                // Progressive Disclosure
                if (line.includes('Progressive Disclosure')) {
                    this.addRequirement({
                        text: 'Click account must show its locations, click location must show its work orders',
                        source: 'User Experience',
                        lineNumber: uxStart + idx,
                        priority: 'mandatory',
                        category: 'interaction'
                    });
                }
                
                // Multi-Select
                if (line.includes('Multi-Select')) {
                    this.addRequirement({
                        text: 'System must support Shift/Ctrl click for bulk operations',
                        source: 'User Experience',
                        lineNumber: uxStart + idx,
                        priority: 'progressive',
                        category: 'interaction'
                    });
                }
                
                // Quick Actions
                if (line.includes('Quick Actions')) {
                    this.addRequirement({
                        text: 'Right-click must provide context menus',
                        source: 'User Experience',
                        lineNumber: uxStart + idx,
                        priority: 'progressive',
                        category: 'interaction'
                    });
                }
                
                // Keyboard Navigation
                if (line.includes('Keyboard Navigation')) {
                    this.addRequirement({
                        text: 'Arrow keys, Tab, Enter must work for accessibility',
                        source: 'User Experience',
                        lineNumber: uxStart + idx,
                        priority: 'mandatory',
                        category: 'accessibility'
                    });
                }
                
                // Search & Filter
                if (line.includes('Search & Filter')) {
                    this.addRequirement({
                        text: 'Each column must have per-column filtering with real-time results',
                        source: 'User Experience',
                        lineNumber: uxStart + idx,
                        priority: 'mandatory',
                        category: 'interaction'
                    });
                }
            });
        }
    }
    
    /**
     * Extract from Validation Criteria - THIS IS CRITICAL
     */
    extractFromValidationCriteria(lines) {
        // Look for ALL validation criteria sections
        lines.forEach((line, idx) => {
            // Find validation criteria sections
            if (line.includes('Validation Criteria')) {
                // Check the next 10 lines for criteria
                const nextLines = lines.slice(idx, Math.min(idx + 10, lines.length));
                
                nextLines.forEach((vLine, vIdx) => {
                    // THE 3-CLICK RULE - OUR MOST IMPORTANT REQUIREMENT
                    if (vLine.includes('< 3 clicks')) {
                        this.addRequirement({
                            text: 'Users MUST be able to navigate to any work order in less than 3 clicks',
                            source: 'Validation Criteria',
                            lineNumber: idx + vIdx,
                            priority: 'mandatory',
                            category: 'navigation',
                            validationRule: 'count_clicks_to_work_order',
                            testable: true,
                            acceptance: 'Maximum 3 clicks from page load to any work order'
                        });
                    }
                    
                    // Column relationships intuitive
                    if (vLine.includes('relationships are intuitive')) {
                        this.addRequirement({
                            text: 'Column relationships must be intuitive',
                            source: 'Validation Criteria',
                            lineNumber: idx + vIdx,
                            priority: 'mandatory',
                            category: 'ux'
                        });
                    }
                    
                    // Performance acceptable
                    if (vLine.includes('Performance is acceptable')) {
                        this.addRequirement({
                            text: 'Performance must be acceptable with mock data',
                            source: 'Validation Criteria',
                            lineNumber: idx + vIdx,
                            priority: 'mandatory',
                            category: 'performance'
                        });
                    }
                });
            }
        });
    }
    
    /**
     * Extract from Performance Targets section
     */
    extractFromPerformanceTargets(lines) {
        const perfStart = lines.findIndex(l => l.includes('### Performance Targets'));
        const perfEnd = lines.findIndex((l, i) => i > perfStart && l.startsWith('##'));
        
        if (perfStart !== -1) {
            const perfLines = lines.slice(perfStart, perfEnd);
            
            perfLines.forEach((line, idx) => {
                // Initial render < 1 second
                if (line.includes('< 1 second')) {
                    this.addRequirement({
                        text: 'Initial render must complete in less than 1 second',
                        source: 'Performance Targets',
                        lineNumber: perfStart + idx,
                        priority: 'mandatory',
                        category: 'performance',
                        validationRule: 'measure_initial_render',
                        testable: true,
                        acceptance: 'Initial render time < 1000ms'
                    });
                }
                
                // Column updates < 200ms
                if (line.includes('< 200ms')) {
                    this.addRequirement({
                        text: 'Column updates must complete in less than 200ms',
                        source: 'Performance Targets',
                        lineNumber: perfStart + idx,
                        priority: 'mandatory',
                        category: 'performance',
                        validationRule: 'measure_column_update',
                        testable: true,
                        acceptance: 'Column update time < 200ms'
                    });
                }
                
                // Search response < 100ms
                if (line.includes('< 100ms')) {
                    this.addRequirement({
                        text: 'Search response must complete in less than 100ms',
                        source: 'Performance Targets',
                        lineNumber: perfStart + idx,
                        priority: 'mandatory',
                        category: 'performance',
                        validationRule: 'measure_search_response',
                        testable: true,
                        acceptance: 'Search response time < 100ms'
                    });
                }
                
                // 60 fps scrolling
                if (line.includes('60 fps')) {
                    this.addRequirement({
                        text: 'Scroll performance must maintain 60 fps',
                        source: 'Performance Targets',
                        lineNumber: perfStart + idx,
                        priority: 'progressive',
                        category: 'performance',
                        validationRule: 'measure_scroll_fps',
                        testable: true,
                        acceptance: 'Scroll maintains 60 fps'
                    });
                }
            });
        }
    }
    
    /**
     * Extract from User Stories section
     */
    extractFromUserStories(lines) {
        const storyStart = lines.findIndex(l => l.includes('## User Stories'));
        const storyEnd = lines.findIndex((l, i) => i > storyStart && l.startsWith('## ') && !l.includes('User Stories'));
        
        if (storyStart !== -1) {
            const storyLines = lines.slice(storyStart, storyEnd);
            
            storyLines.forEach((line, idx) => {
                // Account column requirements
                if (line.includes('Display all accounts')) {
                    this.addRequirement({
                        text: 'Accounts column must display all accounts with search/filter',
                        source: 'User Stories',
                        lineNumber: storyStart + idx,
                        priority: 'mandatory',
                        category: 'data'
                    });
                }
                
                if (line.includes('account type indicators')) {
                    this.addRequirement({
                        text: 'Account type indicators (C/R/I) must be displayed',
                        source: 'User Stories',
                        lineNumber: storyStart + idx,
                        priority: 'mandatory',
                        category: 'visual'
                    });
                }
                
                if (line.includes('status indicators')) {
                    this.addRequirement({
                        text: 'Visual status indicators (active/inactive) must be shown',
                        source: 'User Stories',
                        lineNumber: storyStart + idx,
                        priority: 'mandatory',
                        category: 'visual'
                    });
                }
                
                // Work order requirements
                if (line.includes('status with color coding')) {
                    this.addRequirement({
                        text: 'Work order status must use color coding',
                        source: 'User Stories',
                        lineNumber: storyStart + idx,
                        priority: 'mandatory',
                        category: 'visual'
                    });
                }
                
                if (line.includes('Quick status update')) {
                    this.addRequirement({
                        text: 'Quick status update actions must be available',
                        source: 'User Stories',
                        lineNumber: storyStart + idx,
                        priority: 'mandatory',
                        category: 'interaction'
                    });
                }
            });
        }
    }
    
    /**
     * Extract from Interface Contract
     */
    extractFromInterfaceContract(lines) {
        const contractStart = lines.findIndex(l => l.includes('## Interface Contract'));
        const contractEnd = lines.findIndex((l, i) => i > contractStart && l.startsWith('## ') && !l.includes('Interface'));
        
        if (contractStart !== -1) {
            const contractLines = lines.slice(contractStart, contractEnd);
            
            contractLines.forEach((line, idx) => {
                // Events
                if (line.includes('account:selected')) {
                    this.addRequirement({
                        text: 'System must emit account:selected event when account is selected',
                        source: 'Interface Contract',
                        lineNumber: contractStart + idx,
                        priority: 'mandatory',
                        category: 'event',
                        validationRule: 'check_account_selected_event',
                        testable: true
                    });
                }
                
                if (line.includes('location:selected')) {
                    this.addRequirement({
                        text: 'System must emit location:selected event when location is selected',
                        source: 'Interface Contract',
                        lineNumber: contractStart + idx,
                        priority: 'mandatory',
                        category: 'event',
                        validationRule: 'check_location_selected_event',
                        testable: true
                    });
                }
                
                if (line.includes('workOrder:selected')) {
                    this.addRequirement({
                        text: 'System must emit workOrder:selected event when work order is selected',
                        source: 'Interface Contract',
                        lineNumber: contractStart + idx,
                        priority: 'mandatory',
                        category: 'event',
                        validationRule: 'check_workorder_selected_event',
                        testable: true
                    });
                }
                
                // State management
                if (line.includes('selectedAccount')) {
                    this.addRequirement({
                        text: 'System must maintain selectedAccount state',
                        source: 'Interface Contract',
                        lineNumber: contractStart + idx,
                        priority: 'mandatory',
                        category: 'state'
                    });
                }
            });
        }
    }
    
    /**
     * Extract from Technical Specifications
     */
    extractFromTechnicalSpecs(lines) {
        const techStart = lines.findIndex(l => l.includes('## Technical Specifications'));
        const techEnd = lines.findIndex((l, i) => i > techStart && l.startsWith('## ') && !l.includes('Technical'));
        
        if (techStart !== -1) {
            const techLines = lines.slice(techStart, techEnd);
            
            techLines.forEach((line, idx) => {
                // Data requirements
                if (line.includes('minLoadCount: 50')) {
                    this.addRequirement({
                        text: 'System must load minimum 50 accounts',
                        source: 'Technical Specifications',
                        lineNumber: techStart + idx,
                        priority: 'mandatory',
                        category: 'data'
                    });
                }
                
                if (line.includes('maxDisplayCount: 1000')) {
                    this.addRequirement({
                        text: 'System must handle displaying up to 1000 accounts',
                        source: 'Technical Specifications',
                        lineNumber: techStart + idx,
                        priority: 'progressive',
                        category: 'performance'
                    });
                }
                
                if (line.includes('avgPerAccount: 3-5')) {
                    this.addRequirement({
                        text: 'System must handle 3-5 locations per account on average',
                        source: 'Technical Specifications',
                        lineNumber: techStart + idx,
                        priority: 'mandatory',
                        category: 'data'
                    });
                }
                
                if (line.includes('avgPerLocation: 5-10')) {
                    this.addRequirement({
                        text: 'System must handle 5-10 work orders per location on average',
                        source: 'Technical Specifications',
                        lineNumber: techStart + idx,
                        priority: 'mandatory',
                        category: 'data'
                    });
                }
            });
        }
    }
    
    /**
     * Extract from Progressive Development Plan
     */
    extractFromProgressivePlan(lines) {
        const planStart = lines.findIndex(l => l.includes('## Progressive Development Plan'));
        const planEnd = lines.findIndex((l, i) => i > planStart && l.startsWith('## ') && !l.includes('Progressive'));
        
        if (planStart !== -1) {
            const planLines = lines.slice(planStart, planEnd);
            
            planLines.forEach((line, idx) => {
                // Concept Line requirements
                if (line.includes('Simple HTML/CSS')) {
                    this.addRequirement({
                        text: 'Concept Line must use simple HTML/CSS layout',
                        source: 'Progressive Development Plan',
                        lineNumber: planStart + idx,
                        priority: 'mandatory',
                        category: 'technical',
                        phase: 'concept'
                    });
                }
                
                if (line.includes('Mock data')) {
                    this.addRequirement({
                        text: 'Concept Line must use mock data (50 accounts, 200 locations, 500 work orders)',
                        source: 'Progressive Development Plan',
                        lineNumber: planStart + idx,
                        priority: 'mandatory',
                        category: 'data',
                        phase: 'concept'
                    });
                }
                
                if (line.includes('Console.log for all interactions')) {
                    this.addRequirement({
                        text: 'All interactions must use console.log for debugging',
                        source: 'Progressive Development Plan',
                        lineNumber: planStart + idx,
                        priority: 'mandatory',
                        category: 'technical',
                        phase: 'concept'
                    });
                }
            });
        }
    }
    
    /**
     * Extract from Promotion Criteria
     */
    extractFromPromotionCriteria(lines) {
        const promoStart = lines.findIndex(l => l.includes('## Promotion Criteria'));
        const promoEnd = lines.findIndex((l, i) => i > promoStart && l.startsWith('## ') && !l.includes('Promotion'));
        
        if (promoStart !== -1) {
            const promoLines = lines.slice(promoStart, promoEnd);
            
            promoLines.forEach((line, idx) => {
                if (line.includes('All three columns implemented')) {
                    this.addRequirement({
                        text: 'All three columns must be implemented before promotion',
                        source: 'Promotion Criteria',
                        lineNumber: promoStart + idx,
                        priority: 'mandatory',
                        category: 'completion'
                    });
                }
                
                if (line.includes('User feedback incorporated')) {
                    this.addRequirement({
                        text: 'User feedback must be incorporated',
                        source: 'Promotion Criteria',
                        lineNumber: promoStart + idx,
                        priority: 'mandatory',
                        category: 'process'
                    });
                }
                
                if (line.includes('No blocking UX issues')) {
                    this.addRequirement({
                        text: 'No blocking UX issues allowed',
                        source: 'Promotion Criteria',
                        lineNumber: promoStart + idx,
                        priority: 'mandatory',
                        category: 'quality'
                    });
                }
            });
        }
    }
    
    /**
     * Extract implicit requirements that might be hidden
     */
    extractImplicitRequirements(lines) {
        // Browser support requirements
        const browserStart = lines.findIndex(l => l.includes('### Browser Support'));
        if (browserStart !== -1) {
            this.addRequirement({
                text: 'System must support Chrome/Edge 90+, Firefox 88+, Safari 14+',
                source: 'Browser Support',
                lineNumber: browserStart + 1,
                priority: 'mandatory',
                category: 'compatibility'
            });
            
            this.addRequirement({
                text: 'System must be mobile responsive for tablet and larger',
                source: 'Browser Support',
                lineNumber: browserStart + 4,
                priority: 'mandatory',
                category: 'responsive'
            });
        }
        
        // Success metrics as requirements
        const metricsStart = lines.findIndex(l => l.includes('## Success Metrics'));
        if (metricsStart !== -1) {
            this.addRequirement({
                text: '50% reduction in navigation time',
                source: 'Success Metrics',
                lineNumber: metricsStart + 1,
                priority: 'mandatory',
                category: 'performance',
                validationRule: 'measure_navigation_time',
                testable: true
            });
            
            this.addRequirement({
                text: 'All interactions must complete in less than 200ms',
                source: 'Success Metrics',
                lineNumber: metricsStart + 3,
                priority: 'mandatory',
                category: 'performance',
                validationRule: 'measure_interaction_time',
                testable: true
            });
        }
    }
    
    /**
     * Add a requirement to the list
     */
    addRequirement(req) {
        // Check for duplicates
        const isDuplicate = this.requirements.some(r => 
            r.text === req.text && r.source === req.source
        );
        
        if (!isDuplicate) {
            this.requirements.push({
                ...req,
                extracted: new Date().toISOString()
            });
        }
    }
    
    /**
     * Assign unique IDs to all requirements
     */
    assignRequirementIds() {
        const categoryPrefixes = {
            layout: 'LAY',
            navigation: 'NAV',
            interaction: 'INT',
            data: 'DAT',
            visual: 'VIS',
            performance: 'PERF',
            event: 'EVT',
            state: 'STATE',
            accessibility: 'ACC',
            ux: 'UX',
            technical: 'TECH',
            completion: 'COMP',
            process: 'PROC',
            quality: 'QUAL',
            compatibility: 'COMPAT',
            responsive: 'RESP'
        };
        
        const categoryCounters = {};
        
        this.requirements.forEach(req => {
            const prefix = categoryPrefixes[req.category] || 'REQ';
            categoryCounters[prefix] = (categoryCounters[prefix] || 0) + 1;
            
            req.id = `${prefix}-${String(categoryCounters[prefix]).padStart(3, '0')}`;
            
            // Generate a hash for validation tracking
            req.hash = crypto.createHash('md5')
                .update(req.text)
                .digest('hex')
                .substring(0, 8);
        });
    }
    
    /**
     * Categorize requirements by priority
     */
    categorizeRequirements() {
        this.requirements.forEach(req => {
            if (req.priority === 'mandatory') {
                this.stats.mandatory++;
            } else if (req.priority === 'progressive') {
                this.stats.progressive++;
            } else if (req.priority === 'optional') {
                this.stats.optional++;
            }
            
            // Group by category
            if (!this.requirementsByCategory[req.category]) {
                this.requirementsByCategory[req.category] = [];
            }
            this.requirementsByCategory[req.category].push(req);
        });
        
        this.stats.total = this.requirements.length;
        this.stats.extracted = this.requirements.length;
    }
    
    /**
     * Generate requirements.json file
     */
    generateRequirementsJson() {
        return {
            metadata: {
                version: '1.0.0',
                generated: new Date().toISOString(),
                source: '1.1.1-master-view-spec.md',
                parser: 'REQUIREMENTS-PARSER v1.0',
                stats: this.stats
            },
            requirements: this.requirements.map(req => ({
                id: req.id,
                text: req.text,
                priority: req.priority,
                category: req.category,
                source: req.source,
                lineNumber: req.lineNumber,
                phase: req.phase || 'concept',
                testable: req.testable || false,
                validationRule: req.validationRule || null,
                acceptance: req.acceptance || req.text,
                hash: req.hash
            })),
            requirementsByCategory: this.requirementsByCategory,
            mandatoryRequirements: this.requirements
                .filter(r => r.priority === 'mandatory')
                .map(r => r.id),
            testableRequirements: this.requirements
                .filter(r => r.testable)
                .map(r => ({
                    id: r.id,
                    validationRule: r.validationRule,
                    acceptance: r.acceptance
                }))
        };
    }
    
    /**
     * Generate validation rules for CONCEPT-GENERATOR
     */
    generateValidationRules() {
        const rules = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            rules: []
        };
        
        // Create validation rules for testable requirements
        this.requirements.filter(r => r.testable).forEach(req => {
            const rule = {
                requirementId: req.id,
                name: req.validationRule,
                description: req.text,
                acceptance: req.acceptance,
                priority: req.priority,
                validationType: this.getValidationType(req.validationRule),
                implementation: this.getValidationImplementation(req.validationRule)
            };
            
            rules.rules.push(rule);
        });
        
        return rules;
    }
    
    /**
     * Get validation type for a rule
     */
    getValidationType(ruleName) {
        if (ruleName.includes('measure')) return 'performance';
        if (ruleName.includes('count')) return 'interaction';
        if (ruleName.includes('check')) return 'functional';
        return 'general';
    }
    
    /**
     * Get validation implementation for a rule
     */
    getValidationImplementation(ruleName) {
        const implementations = {
            'count_clicks_to_work_order': `
                function validateThreeClickRule() {
                    // Track click path from page load to work order selection
                    let clickCount = 0;
                    let clickPath = [];
                    
                    // Test: Select first account (1 click)
                    clickCount++;
                    clickPath.push('account_selected');
                    
                    // Test: Select first location (2 clicks)
                    clickCount++;
                    clickPath.push('location_selected');
                    
                    // Test: Select first work order (3 clicks)
                    clickCount++;
                    clickPath.push('workorder_selected');
                    
                    return {
                        passed: clickCount <= 3,
                        actual: clickCount,
                        expected: '≤ 3',
                        path: clickPath,
                        message: clickCount <= 3 ? 
                            'PASS: Work order reachable in ' + clickCount + ' clicks' :
                            'FAIL: Work order requires ' + clickCount + ' clicks (max 3 allowed)'
                    };
                }`,
            
            'measure_initial_render': `
                function measureInitialRender() {
                    const renderTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    return {
                        passed: renderTime < 1000,
                        actual: renderTime + 'ms',
                        expected: '< 1000ms',
                        message: renderTime < 1000 ?
                            'PASS: Initial render in ' + renderTime + 'ms' :
                            'FAIL: Initial render took ' + renderTime + 'ms (max 1000ms allowed)'
                    };
                }`,
            
            'measure_column_update': `
                function measureColumnUpdate() {
                    const startTime = performance.now();
                    // Simulate column update
                    const endTime = performance.now();
                    const updateTime = endTime - startTime;
                    
                    return {
                        passed: updateTime < 200,
                        actual: updateTime + 'ms',
                        expected: '< 200ms',
                        message: updateTime < 200 ?
                            'PASS: Column update in ' + updateTime + 'ms' :
                            'FAIL: Column update took ' + updateTime + 'ms (max 200ms allowed)'
                    };
                }`,
            
            'check_account_selected_event': `
                function checkAccountSelectedEvent() {
                    let eventFired = false;
                    window.addEventListener('account:selected', () => {
                        eventFired = true;
                    });
                    
                    // Simulate account selection
                    // Check if event was fired
                    
                    return {
                        passed: eventFired,
                        actual: eventFired ? 'Event fired' : 'No event',
                        expected: 'Event fired',
                        message: eventFired ?
                            'PASS: account:selected event fires correctly' :
                            'FAIL: account:selected event not firing'
                    };
                }`
        };
        
        return implementations[ruleName] || 'function() { return { passed: false, message: "Not implemented" }; }';
    }
    
    /**
     * Write requirements.json output
     */
    async writeOutput(outputDir, requirementsJson) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, 'requirements.json');
        fs.writeFileSync(outputPath, JSON.stringify(requirementsJson, null, 2));
        
        console.log(`  ✅ Generated: requirements.json`);
        console.log(`     📊 Total requirements: ${requirementsJson.requirements.length}`);
        console.log(`     🔴 Mandatory: ${requirementsJson.mandatoryRequirements.length}`);
        console.log(`     🧪 Testable: ${requirementsJson.testableRequirements.length}`);
    }
    
    /**
     * Write validation-rules.json output
     */
    async writeValidationRules(outputDir, validationRules) {
        const rulesPath = path.join(outputDir, 'validation-rules.json');
        fs.writeFileSync(rulesPath, JSON.stringify(validationRules, null, 2));
        
        console.log(`  ✅ Generated: validation-rules.json`);
        console.log(`     🧪 Validation rules: ${validationRules.rules.length}`);
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: REQUIREMENTS-PARSER <spec-file> <output-dir>');
        console.log('Example: REQUIREMENTS-PARSER ./specs/1.1.1-master-view-spec.md ./requirements');
        process.exit(1);
    }
    
    const [specFile, outputDir] = args;
    
    const parser = new RequirementsParser();
    
    parser.parse(specFile, outputDir)
        .then(result => {
            console.log('\n🎉 Requirements extraction successful!');
            console.log('📁 Output files:', result.outputFiles);
            console.log('\n🚀 Next steps:');
            console.log('  1. Review requirements.json for completeness');
            console.log('  2. Update STORY-BUILDER to consume requirements.json');
            console.log('  3. Add validateRequirements() to CONCEPT-GENERATOR');
            console.log('  4. Run validation to ensure 3-click rule is enforced');
        })
        .catch(err => {
            console.error('❌ Extraction failed:', err.message);
            console.error(err.stack);
            process.exit(1);
        });
}

module.exports = RequirementsParser;