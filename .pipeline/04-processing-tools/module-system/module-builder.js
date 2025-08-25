#!/usr/bin/env node

/**
 * Module Builder - Interactive CLI for creating module definitions
 * 
 * Uses BUSM Reader to import entities and create module YAMLs automatically
 * No more manual YAML creation!
 */

const inquirer = require('inquirer');
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');
const { BUSMReader } = require('../busm-reader/busm-reader');

class ModuleBuilder {
  constructor() {
    this.busm = new BUSMReader();
    this.moduleConfig = {};
    
    // Load BUSM model
    const busmPath = path.join(__dirname, '../busm-reader/busm-model.json');
    this.busm.loadBUSM(busmPath);
  }

  /**
   * Main entry point - build a module interactively
   */
  async build() {
    console.log('\n' + '='.repeat(80));
    console.log('MODULE BUILDER - Create Module from BUSM Automatically');
    console.log('='.repeat(80) + '\n');

    try {
      // Step 1: Module basics
      await this.getModuleBasics();
      
      // Step 2: Select entities
      await this.selectEntities();
      
      // Step 3: Configure fields
      await this.configureFields();
      
      // Step 4: Define views
      await this.defineViews();
      
      // Step 5: Add business rules
      await this.addBusinessRules();
      
      // Step 6: Generate and save
      await this.generateModule();
      
      console.log('\n✅ Module created successfully!');
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
    }
  }

  /**
   * Step 1: Get module basics
   */
  async getModuleBasics() {
    console.log('\n📋 STEP 1: Module Basics\n');
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Module ID (e.g., account-management):',
        validate: input => input.length > 0 || 'Module ID is required'
      },
      {
        type: 'input',
        name: 'name',
        message: 'Module Name (e.g., Account Management):',
        validate: input => input.length > 0 || 'Module name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Module Description:',
        default: ''
      },
      {
        type: 'list',
        name: 'phase',
        message: 'Development Phase:',
        choices: [
          { name: 'Phase 1 - Essential features only', value: 1 },
          { name: 'Phase 2 - Common features', value: 2 },
          { name: 'Phase 3 - Advanced features', value: 3 }
        ],
        default: 1
      }
    ]);

    this.moduleConfig = {
      module: {
        id: answers.id,
        name: answers.name,
        version: '1.0.0',
        description: answers.description,
        phase: answers.phase
      }
    };
  }

  /**
   * Step 2: Select entities from BUSM
   */
  async selectEntities() {
    console.log('\n🗂️ STEP 2: Select Entities from BUSM\n');
    
    const summary = this.busm.getSummary();
    console.log(`Available entities in BUSM: ${summary.entities.join(', ')}\n`);
    
    // Select primary entity
    const primary = await inquirer.prompt([
      {
        type: 'list',
        name: 'entity',
        message: 'Select PRIMARY entity for this module:',
        choices: summary.entities
      }
    ]);

    // Ask about related entities
    const relatedChoices = summary.entities.filter(e => e !== primary.entity);
    const related = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'entities',
        message: 'Select RELATED entities (optional):',
        choices: relatedChoices
      }
    ]);

    this.moduleConfig.module.entities = {
      owned: [primary.entity],
      referenced: related.entities
    };

    console.log(`\n✅ Primary entity: ${primary.entity}`);
    if (related.entities.length > 0) {
      console.log(`✅ Related entities: ${related.entities.join(', ')}`);
    }
  }

  /**
   * Step 3: Configure fields based on phase
   */
  async configureFields() {
    console.log('\n⚙️ STEP 3: Configure Fields\n');
    
    const phase = this.moduleConfig.module.phase;
    const primaryEntity = this.moduleConfig.module.entities.owned[0];
    
    // Get fields filtered by phase
    const allFields = this.busm.getFields(primaryEntity);
    const phaseFields = this.busm.filterFieldsForPhase(primaryEntity, phase);
    
    console.log(`Entity "${primaryEntity}" has ${allFields.length} total fields`);
    console.log(`Phase ${phase} includes ${phaseFields.length} fields automatically:\n`);
    
    // Show what's included
    phaseFields.forEach(field => {
      const required = field.required ? '(required)' : '(optional)';
      console.log(`  • ${field.name} - ${field.type} ${required}`);
    });

    // Ask if they want to customize
    const customize = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'customize',
        message: '\nDo you want to customize field selection?',
        default: false
      }
    ]);

    if (customize.customize) {
      const fieldChoices = allFields.map(f => ({
        name: `${f.name} (${f.type}) ${f.required ? '[required]' : ''}`,
        value: f.name,
        checked: phaseFields.some(pf => pf.name === f.name)
      }));

      const selected = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'fields',
          message: 'Select fields to include:',
          choices: fieldChoices,
          validate: input => {
            // Ensure required fields are selected
            const requiredFields = this.busm.getRequiredFields(primaryEntity);
            const missing = requiredFields.filter(rf => !input.includes(rf));
            if (missing.length > 0) {
              return `Required fields must be included: ${missing.join(', ')}`;
            }
            return true;
          }
        }
      ]);

      // Update field list
      this.moduleConfig.fields = selected.fields.map(fieldName => 
        allFields.find(f => f.name === fieldName)
      );
    } else {
      this.moduleConfig.fields = phaseFields;
    }

    console.log(`\n✅ ${this.moduleConfig.fields.length} fields configured`);
  }

  /**
   * Step 4: Define views
   */
  async defineViews() {
    console.log('\n📱 STEP 4: Define Views\n');
    
    const primaryEntity = this.moduleConfig.module.entities.owned[0];
    
    // Common view patterns
    const viewPatterns = [
      { name: `${primaryEntity} List`, value: 'list', selected: true },
      { name: `${primaryEntity} Detail`, value: 'detail', selected: true },
      { name: `${primaryEntity} Form (Create/Edit)`, value: 'form', selected: true },
      { name: `${primaryEntity} Table`, value: 'table', selected: false },
      { name: `${primaryEntity} Cards`, value: 'cards', selected: false },
      { name: `${primaryEntity} Dashboard`, value: 'dashboard', selected: false }
    ];

    const views = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'views',
        message: 'Select views to generate:',
        choices: viewPatterns.map(p => ({
          name: p.name,
          value: p.value,
          checked: p.selected
        }))
      }
    ]);

    this.moduleConfig.module.views = views.views.map(type => ({
      type,
      name: `${primaryEntity.toLowerCase()}-${type}`,
      entity: primaryEntity
    }));

    console.log(`\n✅ ${views.views.length} views configured`);
  }

  /**
   * Step 5: Add business rules
   */
  async addBusinessRules() {
    console.log('\n📏 STEP 5: Business Rules\n');
    
    const primaryEntity = this.moduleConfig.module.entities.owned[0];
    
    // Get enums from BUSM
    const entityDef = this.busm.getEntity(primaryEntity);
    const enumFields = this.moduleConfig.fields.filter(f => f.type === 'enum');
    
    const rules = {
      validation: {},
      enums: {}
    };

    // Add validation for required fields
    const requiredFields = this.moduleConfig.fields.filter(f => f.required);
    if (requiredFields.length > 0) {
      rules.validation.required = requiredFields.map(f => f.name);
      console.log(`✓ Added required field validation for: ${rules.validation.required.join(', ')}`);
    }

    // Add enum definitions
    for (const field of enumFields) {
      if (field.enum) {
        const enumValues = this.busm.getEnumValues(field.enum);
        if (enumValues.length > 0) {
          rules.enums[field.name] = enumValues;
          console.log(`✓ Added enum for ${field.name}: ${enumValues.join(', ')}`);
        }
      }
    }

    // Ask about state transitions
    if (enumFields.some(f => f.name === 'status' || f.name === 'state')) {
      const addTransitions = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'add',
          message: '\nAdd state transition rules?',
          default: true
        }
      ]);

      if (addTransitions.add) {
        // Simple state transition for status field
        const statusField = enumFields.find(f => f.name === 'status' || f.name === 'state');
        if (statusField && statusField.enum) {
          const states = this.busm.getEnumValues(statusField.enum);
          
          // Default transitions
          rules.stateTransitions = {
            'Pending': ['Active', 'Inactive'],
            'Active': ['Inactive', 'Suspended'],
            'Inactive': ['Active', 'Archived'],
            'Suspended': ['Active', 'Inactive'],
            'Archived': []  // Terminal state
          };
          
          console.log('✓ Added default state transitions');
        }
      }
    }

    this.moduleConfig.businessRules = rules;
    console.log('\n✅ Business rules configured');
  }

  /**
   * Step 6: Generate and save module
   */
  async generateModule() {
    console.log('\n💾 STEP 6: Generate Module\n');
    
    // Build the complete module YAML structure
    const moduleYAML = {
      module: this.moduleConfig.module,
      entity: {
        name: this.moduleConfig.module.entities.owned[0],
        source: `BUSM.${this.moduleConfig.module.entities.owned[0]}`,
        phase: this.moduleConfig.module.phase,
        fields: this.moduleConfig.fields.map(f => ({
          name: f.name,
          type: f.type,
          required: f.required || false,
          source: `BUSM.${this.moduleConfig.module.entities.owned[0]}.${f.name}`,
          ...(f.constraints ? { constraints: f.constraints } : {}),
          ...(f.validation ? { validation: f.validation } : {}),
          ...(f.enum ? { enum: f.enum } : {})
        }))
      },
      views: this.moduleConfig.module.views,
      businessRules: this.moduleConfig.businessRules,
      navigation: {
        mainMenu: this.moduleConfig.module.views
          .filter(v => ['list', 'dashboard'].includes(v.type))
          .map(v => ({
            label: v.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            view: v.name,
            icon: v.type === 'dashboard' ? 'dashboard' : 'list'
          }))
      }
    };

    // Ask where to save
    const save = await inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Save module as (filename):',
        default: `${this.moduleConfig.module.id}.yaml`
      }
    ]);

    // Save the file
    const outputPath = path.join(__dirname, save.filename);
    const yamlContent = yaml.stringify(moduleYAML);
    
    fs.writeFileSync(outputPath, yamlContent);
    console.log(`\n✅ Module saved to: ${outputPath}`);

    // Show summary
    console.log('\n' + '='.repeat(80));
    console.log('MODULE SUMMARY');
    console.log('='.repeat(80));
    console.log(`Module: ${this.moduleConfig.module.name}`);
    console.log(`Entity: ${this.moduleConfig.module.entities.owned[0]}`);
    console.log(`Phase: ${this.moduleConfig.module.phase}`);
    console.log(`Fields: ${this.moduleConfig.fields.length}`);
    console.log(`Views: ${this.moduleConfig.module.views.length}`);
    console.log(`Business Rules: ${Object.keys(this.moduleConfig.businessRules).length} categories`);
    
    // Show what to do next
    console.log('\n📋 Next Steps:');
    console.log('1. Run concept generator: npm run generate:concept --module ' + this.moduleConfig.module.id);
    console.log('2. Run AST generator: npm run generate:ast --module ' + this.moduleConfig.module.id);
    console.log('3. View wireframes in browser');
    
    return moduleYAML;
  }

  /**
   * Quick start - create a module with minimal prompts
   */
  async quickStart(entityName, phase = 1) {
    console.log('\n🚀 Quick Start Mode\n');
    
    // Check if entity exists
    if (!this.busm.hasEntity(entityName)) {
      throw new Error(`Entity "${entityName}" not found in BUSM`);
    }

    // Auto-configure module
    this.moduleConfig = {
      module: {
        id: `${entityName.toLowerCase()}-management`,
        name: `${entityName} Management`,
        version: '1.0.0',
        description: `Manage ${entityName} entities`,
        phase: phase,
        entities: {
          owned: [entityName],
          referenced: []
        },
        views: [
          { type: 'list', name: `${entityName.toLowerCase()}-list`, entity: entityName },
          { type: 'detail', name: `${entityName.toLowerCase()}-detail`, entity: entityName },
          { type: 'form', name: `${entityName.toLowerCase()}-form`, entity: entityName }
        ]
      },
      fields: this.busm.filterFieldsForPhase(entityName, phase),
      businessRules: {
        validation: {
          required: this.busm.getRequiredFields(entityName)
        }
      }
    };

    // Generate immediately
    return await this.generateModule();
  }
}

// CLI execution
if (require.main === module) {
  const builder = new ModuleBuilder();
  
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--quick') {
    // Quick start mode
    const entity = args[1] || 'Account';
    const phase = parseInt(args[2]) || 1;
    
    builder.quickStart(entity, phase)
      .then(() => process.exit(0))
      .catch(err => {
        console.error(err.message);
        process.exit(1);
      });
  } else {
    // Interactive mode
    builder.build()
      .then(() => process.exit(0))
      .catch(err => {
        console.error(err.message);
        process.exit(1);
      });
  }
}

module.exports = ModuleBuilder;