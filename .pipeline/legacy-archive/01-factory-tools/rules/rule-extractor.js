#!/usr/bin/env node

/**
 * Rule Extractor Agent
 * Automatically extracts and generates rules from multiple sources
 * Priority: BUSM > Story > ViewForge > Templates
 */

const fs = require('fs');
const path = require('path');

class RuleExtractor {
  constructor() {
    this.pipelineRoot = path.join(__dirname, '..', '..');
    this.templatesPath = path.join(__dirname, 'rule-templates.json');
    this.templates = this.loadTemplates();
    this.extractedRules = [];
    this.ruleIdCounter = 1;
  }

  /**
   * Load rule templates
   */
  loadTemplates() {
    if (fs.existsSync(this.templatesPath)) {
      return JSON.parse(fs.readFileSync(this.templatesPath, 'utf8'));
    }
    console.error('❌ Rule templates not found');
    return null;
  }

  /**
   * Generate unique rule ID
   */
  generateRuleId(prefix = 'RULE') {
    const id = `${prefix}-${String(this.ruleIdCounter).padStart(3, '0')}`;
    this.ruleIdCounter++;
    return id;
  }

  /**
   * Extract rules from ViewForge configuration
   */
  extractFromViewForge(configPath) {
    const rules = [];
    
    if (!fs.existsSync(configPath)) {
      return rules;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const entityType = config.entityType;
    const contextType = config.contextType; // list-view, detail-view, form-view

    // Extract field-level rules
    const allFields = [];
    
    // Collect fields from header
    if (config.header && config.header.fields) {
      allFields.push(...config.header.fields);
    }
    
    // Collect fields from body rows
    if (config.body) {
      config.body.forEach(row => {
        if (row.fields) {
          allFields.push(...row.fields);
        }
      });
    }

    // Generate rules from fields
    allFields.forEach(field => {
      // Required field rule
      if (field.required) {
        rules.push({
          id: this.generateRuleId(),
          source: 'viewforge',
          entity: entityType,
          field: field.path,
          name: `${field.label} is required`,
          category: 'validation',
          type: 'required',
          priority: 3, // ViewForge priority
          expressions: {
            concept: `Show asterisk next to ${field.label}`,
            prototype: `Validate ${field.label} on form submit`,
            production: `Validate ${field.label} with database constraint`
          },
          enabled: true,
          parameters: {
            fieldPath: field.path,
            fieldLabel: field.label,
            required: true
          }
        });
      }

      // Field type validation rule
      if (field.type) {
        const typeValidation = this.getTypeValidation(field.type);
        if (typeValidation) {
          rules.push({
            id: this.generateRuleId(),
            source: 'viewforge',
            entity: entityType,
            field: field.path,
            name: `${field.label} must be valid ${field.type}`,
            category: 'validation',
            type: 'format',
            priority: 3,
            expressions: typeValidation.expressions,
            enabled: true,
            parameters: {
              fieldPath: field.path,
              fieldType: field.type,
              validation: typeValidation.validation
            }
          });
        }
      }
    });

    // Apply context-specific template rules
    if (contextType && this.templates) {
      const templateKey = this.getTemplateKey(contextType);
      if (templateKey && this.templates.templates[templateKey]) {
        const template = this.templates.templates[templateKey];
        template.rules.forEach(templateRule => {
          rules.push({
            id: this.generateRuleId(),
            source: 'template',
            entity: entityType,
            name: templateRule.name,
            category: templateRule.category,
            type: templateRule.id,
            priority: 4, // Template priority (lowest)
            expressions: templateRule.expressions,
            enabled: templateRule.defaultEnabled,
            parameters: templateRule.parameters
          });
        });
      }
    }

    return rules;
  }

  /**
   * Extract rules from User Stories
   */
  extractFromStory(storyPath) {
    const rules = [];
    
    if (!fs.existsSync(storyPath)) {
      return rules;
    }

    const storyContent = fs.readFileSync(storyPath, 'utf8');
    const lines = storyContent.split('\n');

    // Look for business rules section
    let inBusinessRules = false;
    let inAcceptanceCriteria = false;
    let entityType = this.extractEntityFromStory(storyContent);

    lines.forEach(line => {
      // Detect sections
      if (line.includes('## Business Rules')) {
        inBusinessRules = true;
        inAcceptanceCriteria = false;
      } else if (line.includes('## Acceptance Criteria')) {
        inAcceptanceCriteria = true;
        inBusinessRules = false;
      } else if (line.startsWith('##')) {
        inBusinessRules = false;
        inAcceptanceCriteria = false;
      }

      // Extract rules from Business Rules section
      if (inBusinessRules && line.startsWith('-')) {
        const ruleText = line.substring(1).trim();
        if (ruleText.length > 0) {
          rules.push(this.parseBusinessRule(ruleText, entityType));
        }
      }

      // Extract from Acceptance Criteria
      if (inAcceptanceCriteria && line.includes('must') || line.includes('should')) {
        rules.push(this.parseAcceptanceCriteria(line, entityType));
      }
    });

    // Look for Gherkin scenarios
    const gherkinRules = this.extractFromGherkin(storyContent, entityType);
    rules.push(...gherkinRules);

    return rules;
  }

  /**
   * Extract entity type from story
   */
  extractEntityFromStory(content) {
    // Look for US-XXX patterns and common entity names
    const patterns = [
      /account/i,
      /service.?location/i,
      /work.?order/i,
      /technician/i,
      /customer/i
    ];

    for (let pattern of patterns) {
      if (pattern.test(content)) {
        return pattern.source.replace(/[^a-z]/gi, '').toLowerCase();
      }
    }

    return 'unknown';
  }

  /**
   * Parse a business rule from text
   */
  parseBusinessRule(ruleText, entityType) {
    const rule = {
      id: this.generateRuleId(),
      source: 'story',
      entity: entityType,
      name: ruleText,
      category: 'business',
      type: 'custom',
      priority: 2, // Story priority
      enabled: true,
      parameters: {}
    };

    // Determine rule expressions based on keywords
    if (ruleText.includes('display') || ruleText.includes('show')) {
      rule.category = 'display';
      rule.expressions = {
        concept: ruleText,
        prototype: `${ruleText} with proper styling`,
        production: `${ruleText} with role-based visibility`
      };
    } else if (ruleText.includes('validate') || ruleText.includes('must')) {
      rule.category = 'validation';
      rule.expressions = {
        concept: `Visual indication of: ${ruleText}`,
        prototype: `Client-side: ${ruleText}`,
        production: `Server-side: ${ruleText} with audit`
      };
    } else if (ruleText.includes('when') || ruleText.includes('if')) {
      rule.category = 'interaction';
      rule.expressions = {
        concept: `Basic: ${ruleText}`,
        prototype: `Interactive: ${ruleText}`,
        production: `Smart: ${ruleText} with optimization`
      };
    } else {
      rule.expressions = {
        concept: `Simple: ${ruleText}`,
        prototype: `Enhanced: ${ruleText}`,
        production: `Full: ${ruleText}`
      };
    }

    return rule;
  }

  /**
   * Parse acceptance criteria
   */
  parseAcceptanceCriteria(line, entityType) {
    const cleanLine = line.replace(/^[-\[\]\*\s]+/, '').trim();
    
    return {
      id: this.generateRuleId(),
      source: 'story-acceptance',
      entity: entityType,
      name: cleanLine,
      category: 'acceptance',
      type: 'criteria',
      priority: 2,
      expressions: {
        concept: `Demonstrate: ${cleanLine}`,
        prototype: `Implement: ${cleanLine}`,
        production: `Guarantee: ${cleanLine}`
      },
      enabled: true,
      parameters: {}
    };
  }

  /**
   * Extract rules from Gherkin scenarios
   */
  extractFromGherkin(content, entityType) {
    const rules = [];
    const gherkinPattern = /(?:Given|When|Then)\s+(.+)/g;
    let match;

    while ((match = gherkinPattern.exec(content)) !== null) {
      const scenarioText = match[1];
      rules.push({
        id: this.generateRuleId(),
        source: 'story-gherkin',
        entity: entityType,
        name: scenarioText,
        category: 'behavior',
        type: 'scenario',
        priority: 2,
        expressions: {
          concept: `Mock: ${scenarioText}`,
          prototype: `Test: ${scenarioText}`,
          production: `Ensure: ${scenarioText}`
        },
        enabled: true,
        parameters: {}
      });
    }

    return rules;
  }

  /**
   * Extract rules from BUSM (Business Model)
   */
  extractFromBUSM(busmPath) {
    const rules = [];
    
    // For now, we'll simulate BUSM extraction
    // In reality, this would parse the BUSM.mmd file
    
    // Relationship rules
    rules.push({
      id: this.generateRuleId('BUSM'),
      source: 'busm',
      entity: 'account',
      name: 'Account can have multiple Service Locations',
      category: 'relationship',
      type: 'cardinality',
      priority: 1, // BUSM highest priority
      expressions: {
        concept: 'Show locations under account',
        prototype: 'Lazy load related locations',
        production: 'Optimize with database joins'
      },
      enabled: true,
      parameters: {
        parent: 'account',
        child: 'serviceLocation',
        cardinality: 'one-to-many'
      }
    });

    rules.push({
      id: this.generateRuleId('BUSM'),
      source: 'busm',
      entity: 'serviceLocation',
      name: 'Service Location requires Account',
      category: 'relationship',
      type: 'dependency',
      priority: 1,
      expressions: {
        concept: 'Location shown with account context',
        prototype: 'Validate account exists on location create',
        production: 'Foreign key constraint enforced'
      },
      enabled: true,
      parameters: {
        entity: 'serviceLocation',
        requires: 'account',
        cascade: true
      }
    });

    // Add more BUSM rules as needed
    
    return rules;
  }

  /**
   * Get type validation based on field type
   */
  getTypeValidation(fieldType) {
    const validations = {
      email: {
        validation: 'email',
        expressions: {
          concept: 'Show @ symbol hint',
          prototype: 'Validate email format',
          production: 'Validate email with DNS check'
        }
      },
      phone: {
        validation: 'phone',
        expressions: {
          concept: 'Show phone format hint',
          prototype: 'Validate phone format',
          production: 'Validate with carrier lookup'
        }
      },
      currency: {
        validation: 'number',
        expressions: {
          concept: 'Show $ symbol',
          prototype: 'Validate numeric with 2 decimals',
          production: 'Currency validation with conversion'
        }
      },
      date: {
        validation: 'date',
        expressions: {
          concept: 'Show date picker',
          prototype: 'Validate date format',
          production: 'Timezone-aware date validation'
        }
      },
      status: {
        validation: 'enum',
        expressions: {
          concept: 'Show as dropdown',
          prototype: 'Validate against enum values',
          production: 'State machine validation'
        }
      }
    };

    return validations[fieldType] || null;
  }

  /**
   * Get template key from context type
   */
  getTemplateKey(contextType) {
    const mapping = {
      'list-view': 'list-view',
      'detail-view': 'detail-view',
      'form-view': 'form-view',
      'card-view': 'list-view',
      'grid-view': 'list-view'
    };
    
    return mapping[contextType] || null;
  }

  /**
   * Merge and deduplicate rules
   */
  mergeRules(allRules) {
    const mergedRules = {};
    
    // Group rules by name and entity
    allRules.forEach(rule => {
      const key = `${rule.entity}-${rule.name}`;
      
      if (!mergedRules[key]) {
        mergedRules[key] = rule;
      } else {
        // Conflict resolution: higher priority wins
        if (rule.priority < mergedRules[key].priority) {
          console.log(`⚠️ Rule conflict resolved: "${rule.name}" - ${rule.source} overrides ${mergedRules[key].source}`);
          mergedRules[key] = rule;
        }
      }
    });

    return Object.values(mergedRules);
  }

  /**
   * Extract all rules for an entity
   */
  extractAllRules(options = {}) {
    const {
      entity,
      viewForgeConfig,
      storyPath,
      busmPath,
      iterationPath
    } = options;

    console.log('\n📋 Extracting Rules\n');
    console.log('='.repeat(60));

    const allRules = [];

    // 1. Extract from BUSM (Priority 1)
    if (busmPath && fs.existsSync(busmPath)) {
      const busmRules = this.extractFromBUSM(busmPath);
      allRules.push(...busmRules);
      console.log(`✅ Extracted ${busmRules.length} rules from BUSM`);
    }

    // 2. Extract from Story (Priority 2)
    if (storyPath && fs.existsSync(storyPath)) {
      const storyRules = this.extractFromStory(storyPath);
      allRules.push(...storyRules);
      console.log(`✅ Extracted ${storyRules.length} rules from Story`);
    }

    // 3. Extract from ViewForge (Priority 3)
    if (viewForgeConfig && fs.existsSync(viewForgeConfig)) {
      const viewForgeRules = this.extractFromViewForge(viewForgeConfig);
      allRules.push(...viewForgeRules);
      console.log(`✅ Extracted ${viewForgeRules.length} rules from ViewForge`);
    }

    // 4. Merge and resolve conflicts
    const mergedRules = this.mergeRules(allRules);
    console.log(`\n📊 Total unique rules: ${mergedRules.length}`);

    // 5. Save rules to iteration if path provided
    if (iterationPath) {
      const rulesPath = path.join(iterationPath, 'rules', 'extracted-rules.json');
      const rulesDir = path.dirname(rulesPath);
      
      if (!fs.existsSync(rulesDir)) {
        fs.mkdirSync(rulesDir, { recursive: true });
      }

      const rulesOutput = {
        entity,
        extractedAt: new Date().toISOString(),
        sources: {
          busm: busmPath || null,
          story: storyPath || null,
          viewForge: viewForgeConfig || null
        },
        ruleCount: mergedRules.length,
        rules: mergedRules
      };

      fs.writeFileSync(rulesPath, JSON.stringify(rulesOutput, null, 2));
      console.log(`\n💾 Rules saved to: ${path.relative(this.pipelineRoot, rulesPath)}`);
    }

    return mergedRules;
  }

  /**
   * Generate rule configuration interface
   */
  generateRuleConfig(rules, outputPath) {
    const config = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      ruleCount: rules.length,
      categories: {},
      rules: {}
    };

    // Organize rules by category
    rules.forEach(rule => {
      if (!config.categories[rule.category]) {
        config.categories[rule.category] = [];
      }
      config.categories[rule.category].push(rule.id);
      
      config.rules[rule.id] = {
        ...rule,
        userConfigurable: {
          enabled: rule.enabled,
          parameters: rule.parameters
        }
      };
    });

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
      console.log(`\n📝 Rule configuration saved to: ${path.relative(this.pipelineRoot, outputPath)}`);
    }

    return config;
  }
}

// CLI Interface
function main() {
  const extractor = new RuleExtractor();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'extract':
      // Example: node rule-extractor.js extract --entity account --viewforge path/to/config.json
      const options = {};
      for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        options[key] = args[i + 1];
      }
      
      const rules = extractor.extractAllRules({
        entity: options.entity,
        viewForgeConfig: options.viewforge,
        storyPath: options.story,
        busmPath: options.busm,
        iterationPath: options.iteration
      });

      if (options.output) {
        extractor.generateRuleConfig(rules, options.output);
      }
      break;

    case 'templates':
      // Show available templates
      if (extractor.templates) {
        console.log('\n📚 Available Rule Templates:\n');
        Object.keys(extractor.templates.templates).forEach(key => {
          const template = extractor.templates.templates[key];
          console.log(`${key}:`);
          console.log(`  ${template.description}`);
          console.log(`  Rules: ${template.rules.length}`);
        });
      }
      break;

    default:
      console.log(`
Rule Extractor Agent v1.0.0

Usage:
  node rule-extractor.js <command> [options]

Commands:
  extract           Extract rules from various sources
  templates         Show available rule templates

Extract Options:
  --entity          Entity name (e.g., account)
  --viewforge       Path to ViewForge config
  --story           Path to user story
  --busm            Path to BUSM model
  --iteration       Path to iteration directory
  --output          Output path for rule config

Example:
  node rule-extractor.js extract \\
    --entity account \\
    --viewforge configs/account-list.json \\
    --story stories/US-004.md \\
    --iteration iterations/current \\
    --output rules/account-rules.json
      `);
  }
}

// Export for module use
module.exports = RuleExtractor;

// Run if called directly
if (require.main === module) {
  main();
}