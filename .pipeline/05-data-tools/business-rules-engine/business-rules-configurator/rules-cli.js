#!/usr/bin/env node

/**
 * Business Rules CLI
 * Interactive tool for updating business rules
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class BusinessRulesCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.currentRules = null;
    this.rulesPath = null;
  }

  async start() {
    console.log('\n🏭 Business Rules Configurator CLI v1.0');
    console.log('=========================================\n');
    
    // Load existing rules or create new
    const action = await this.askQuestion(
      'What would you like to do?\n' +
      '1. Edit Phase 1 Account rules\n' +
      '2. Create new module rules\n' +
      '3. Quick edit (specific field)\n' +
      'Choice (1-3): '
    );
    
    switch(action) {
      case '1':
        await this.editPhase1Rules();
        break;
      case '2':
        await this.createNewRules();
        break;
      case '3':
        await this.quickEdit();
        break;
      default:
        console.log('Invalid choice');
    }
    
    this.rl.close();
  }

  async editPhase1Rules() {
    // Load Phase 1 rules
    this.rulesPath = path.join(__dirname, '..', 'module-system', 'phase1-account-basic.yaml');
    
    try {
      const fileContents = fs.readFileSync(this.rulesPath, 'utf8');
      this.currentRules = yaml.load(fileContents);
      console.log('\n✅ Loaded Phase 1 Account rules\n');
    } catch (error) {
      console.error('❌ Could not load rules:', error.message);
      return;
    }
    
    // Show current state
    this.showCurrentRules();
    
    // Edit menu
    let done = false;
    while (!done) {
      const choice = await this.askQuestion(
        '\nWhat would you like to update?\n' +
        '1. Required fields\n' +
        '2. Unique fields\n' +
        '3. Field validation patterns\n' +
        '4. State transitions\n' +
        '5. Business logic (onCreate, onDelete, etc.)\n' +
        '6. Add conditional rules\n' +
        '7. Save and exit\n' +
        '8. Exit without saving\n' +
        'Choice: '
      );
      
      switch(choice) {
        case '1':
          await this.editRequiredFields();
          break;
        case '2':
          await this.editUniqueFields();
          break;
        case '3':
          await this.editValidationPatterns();
          break;
        case '4':
          await this.editStateTransitions();
          break;
        case '5':
          await this.editBusinessLogic();
          break;
        case '6':
          await this.addConditionalRules();
          break;
        case '7':
          await this.saveRules();
          done = true;
          break;
        case '8':
          console.log('Exiting without saving...');
          done = true;
          break;
      }
    }
  }

  showCurrentRules() {
    const rules = this.currentRules.business_rules.Account;
    
    console.log('=== Current Account Rules ===\n');
    
    console.log('Required Fields:', rules.validation.required.join(', '));
    console.log('Unique Fields:', rules.validation.unique.join(', '));
    
    if (rules.validation.patterns) {
      console.log('Validation Patterns:');
      Object.entries(rules.validation.patterns).forEach(([field, pattern]) => {
        console.log(`  ${field}: ${pattern}`);
      });
    }
    
    console.log('\nStates:');
    Object.entries(rules.states).forEach(([state, config]) => {
      const transitions = Array.isArray(config) ? config : config.transitions;
      console.log(`  ${state} → ${transitions.length > 0 ? transitions.join(', ') : '(terminal)'}`);
    });
  }

  async editRequiredFields() {
    const rules = this.currentRules.business_rules.Account;
    
    console.log('\nCurrent required fields:', rules.validation.required.join(', '));
    console.log('Available fields: accountNumber, accountName, accountType, status, website, notes\n');
    
    const action = await this.askQuestion('Add or remove? (a/r): ');
    
    if (action === 'a') {
      const field = await this.askQuestion('Field to add as required: ');
      if (!rules.validation.required.includes(field)) {
        rules.validation.required.push(field);
        console.log(`✅ Added ${field} as required`);
      } else {
        console.log('Field is already required');
      }
    } else if (action === 'r') {
      const field = await this.askQuestion('Field to remove from required: ');
      const index = rules.validation.required.indexOf(field);
      if (index > -1) {
        rules.validation.required.splice(index, 1);
        console.log(`✅ Removed ${field} from required`);
      } else {
        console.log('Field was not required');
      }
    }
  }

  async editUniqueFields() {
    const rules = this.currentRules.business_rules.Account;
    
    console.log('\nCurrent unique fields:', rules.validation.unique.join(', '));
    
    const action = await this.askQuestion('Add or remove? (a/r): ');
    
    if (action === 'a') {
      const field = await this.askQuestion('Field to add as unique: ');
      if (!rules.validation.unique.includes(field)) {
        rules.validation.unique.push(field);
        console.log(`✅ Added ${field} as unique`);
      }
    } else if (action === 'r') {
      const field = await this.askQuestion('Field to remove from unique: ');
      const index = rules.validation.unique.indexOf(field);
      if (index > -1) {
        rules.validation.unique.splice(index, 1);
        console.log(`✅ Removed ${field} from unique`);
      }
    }
  }

  async editValidationPatterns() {
    const rules = this.currentRules.business_rules.Account;
    
    if (!rules.validation.patterns) {
      rules.validation.patterns = {};
    }
    
    console.log('\nCurrent patterns:');
    Object.entries(rules.validation.patterns).forEach(([field, pattern]) => {
      console.log(`  ${field}: ${pattern}`);
    });
    
    const field = await this.askQuestion('\nField to set pattern for: ');
    
    console.log('\nCommon patterns:');
    console.log('1. Email: ^[^@]+@[^@]+\\.[^@]+$');
    console.log('2. Phone: ^\\+?[1-9]\\d{1,14}$');
    console.log('3. URL: ^https?://.*');
    console.log('4. Alphanumeric: ^[A-Za-z0-9]+$');
    console.log('5. Custom pattern');
    
    const choice = await this.askQuestion('Choice (1-5): ');
    
    let pattern;
    switch(choice) {
      case '1':
        pattern = '^[^@]+@[^@]+\\.[^@]+$';
        break;
      case '2':
        pattern = '^\\+?[1-9]\\d{1,14}$';
        break;
      case '3':
        pattern = '^https?://.*';
        break;
      case '4':
        pattern = '^[A-Za-z0-9]+$';
        break;
      case '5':
        pattern = await this.askQuestion('Enter pattern: ');
        break;
    }
    
    if (pattern) {
      rules.validation.patterns[field] = pattern;
      console.log(`✅ Set pattern for ${field}`);
    }
  }

  async editStateTransitions() {
    const rules = this.currentRules.business_rules.Account;
    
    console.log('\nCurrent states and transitions:');
    Object.entries(rules.states).forEach(([state, config]) => {
      const transitions = Array.isArray(config) ? config : config.transitions;
      console.log(`  ${state} → ${transitions.join(', ') || '(none)'}`);
    });
    
    const state = await this.askQuestion('\nWhich state to edit: ');
    
    if (!rules.states[state]) {
      console.log('State not found');
      return;
    }
    
    const currentConfig = rules.states[state];
    const currentTransitions = Array.isArray(currentConfig) ? currentConfig : currentConfig.transitions;
    
    console.log(`\nCurrent transitions from ${state}: ${currentTransitions.join(', ') || '(none)'}`);
    console.log('Available states: Prospect, Active, Suspended, Closed');
    
    const newTransitions = await this.askQuestion('New transitions (comma-separated, or "none"): ');
    
    if (newTransitions === 'none') {
      if (typeof currentConfig === 'object') {
        currentConfig.transitions = [];
      } else {
        rules.states[state] = [];
      }
    } else {
      const transitions = newTransitions.split(',').map(t => t.trim());
      if (typeof currentConfig === 'object') {
        currentConfig.transitions = transitions;
      } else {
        rules.states[state] = transitions;
      }
    }
    
    console.log(`✅ Updated transitions for ${state}`);
  }

  async editBusinessLogic() {
    const rules = this.currentRules.business_rules.Account;
    
    if (!rules.logic) {
      rules.logic = {};
    }
    
    console.log('\nBusiness logic events:');
    console.log('1. onCreate - When record is created');
    console.log('2. onUpdate - When record is updated');
    console.log('3. onDelete - When record is deleted');
    console.log('4. onStateChange - When status changes');
    
    const event = await this.askQuestion('Which event (1-4): ');
    
    let eventName;
    switch(event) {
      case '1': eventName = 'onCreate'; break;
      case '2': eventName = 'onUpdate'; break;
      case '3': eventName = 'onDelete'; break;
      case '4': eventName = 'onStateChange'; break;
      default: return;
    }
    
    if (!rules.logic[eventName]) {
      rules.logic[eventName] = [];
    }
    
    console.log(`\nCurrent ${eventName} actions:`);
    rules.logic[eventName].forEach((action, i) => {
      console.log(`  ${i + 1}. ${action.action}: ${action.value || action.field || action.message || ''}`);
    });
    
    console.log('\nAction types:');
    console.log('1. setState - Set a field value');
    console.log('2. generateField - Auto-generate a field');
    console.log('3. validateField - Validate a field');
    console.log('4. preventIf - Prevent action if condition');
    console.log('5. log - Log an action');
    
    const actionType = await this.askQuestion('Add action type (1-5): ');
    
    let newAction = {};
    switch(actionType) {
      case '1':
        newAction.action = 'setState';
        newAction.value = await this.askQuestion('State value: ');
        break;
      case '2':
        newAction.action = 'generateField';
        newAction.field = await this.askQuestion('Field name: ');
        newAction.format = await this.askQuestion('Format (e.g., ACC-{YYYY}-{0000}): ');
        break;
      case '3':
        newAction.action = 'validateField';
        newAction.field = await this.askQuestion('Field to validate: ');
        break;
      case '4':
        newAction.action = 'preventIf';
        newAction.condition = await this.askQuestion('Condition: ');
        newAction.message = await this.askQuestion('Error message: ');
        break;
      case '5':
        newAction.action = 'log';
        newAction.message = await this.askQuestion('Log message: ');
        break;
    }
    
    rules.logic[eventName].push(newAction);
    console.log(`✅ Added ${newAction.action} to ${eventName}`);
  }

  async addConditionalRules() {
    const rules = this.currentRules.business_rules.Account;
    
    if (!rules.conditional) {
      rules.conditional = [];
    }
    
    console.log('\nConditional rules make fields required based on conditions');
    console.log('Example: When accountType = "Enterprise", require annualRevenue\n');
    
    const condition = await this.askQuestion('Condition (e.g., accountType == "Enterprise"): ');
    const requiredFields = await this.askQuestion('Fields to require (comma-separated): ');
    const message = await this.askQuestion('Message to show: ');
    
    rules.conditional.push({
      when: condition,
      require: requiredFields.split(',').map(f => f.trim()),
      message: message
    });
    
    console.log('✅ Added conditional rule');
  }

  async quickEdit() {
    this.rulesPath = path.join(__dirname, '..', 'module-system', 'phase1-account-basic.yaml');
    
    try {
      const fileContents = fs.readFileSync(this.rulesPath, 'utf8');
      this.currentRules = yaml.load(fileContents);
    } catch (error) {
      console.error('❌ Could not load rules:', error.message);
      return;
    }
    
    console.log('\nQuick Edit Mode\n');
    console.log('Examples:');
    console.log('  require accountName     - Make accountName required');
    console.log('  unique email           - Make email unique');
    console.log('  transition Active Closed - Allow Active → Closed');
    
    const command = await this.askQuestion('\nCommand: ');
    const parts = command.split(' ');
    
    const rules = this.currentRules.business_rules.Account;
    
    switch(parts[0]) {
      case 'require':
        if (!rules.validation.required.includes(parts[1])) {
          rules.validation.required.push(parts[1]);
          console.log(`✅ Made ${parts[1]} required`);
          await this.saveRules();
        }
        break;
        
      case 'unique':
        if (!rules.validation.unique.includes(parts[1])) {
          rules.validation.unique.push(parts[1]);
          console.log(`✅ Made ${parts[1]} unique`);
          await this.saveRules();
        }
        break;
        
      case 'transition':
        const fromState = parts[1];
        const toState = parts[2];
        if (rules.states[fromState]) {
          const config = rules.states[fromState];
          const transitions = Array.isArray(config) ? config : config.transitions;
          if (!transitions.includes(toState)) {
            transitions.push(toState);
            console.log(`✅ Added ${fromState} → ${toState}`);
            await this.saveRules();
          }
        }
        break;
        
      default:
        console.log('Unknown command');
    }
  }

  async saveRules() {
    try {
      const yamlStr = yaml.dump(this.currentRules, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });
      
      // Create backup
      const backupPath = this.rulesPath + '.backup';
      const original = fs.readFileSync(this.rulesPath, 'utf8');
      fs.writeFileSync(backupPath, original);
      
      // Save new rules
      fs.writeFileSync(this.rulesPath, yamlStr);
      
      console.log('\n✅ Rules saved successfully!');
      console.log(`📁 File: ${this.rulesPath}`);
      console.log(`📁 Backup: ${backupPath}`);
      
      // Regenerate to see changes
      const regen = await this.askQuestion('\nRegenerate concept views? (y/n): ');
      if (regen === 'y') {
        console.log('\nRun: npm run generate:phase1\n');
      }
      
    } catch (error) {
      console.error('❌ Failed to save:', error.message);
    }
  }

  askQuestion(question) {
    return new Promise(resolve => {
      this.rl.question(question, answer => {
        resolve(answer.trim());
      });
    });
  }

  async createNewRules() {
    console.log('\nCreate new module rules - Coming soon!');
    console.log('For now, copy phase1-account-basic.yaml and modify it.');
  }
}

// Run CLI
const cli = new BusinessRulesCLI();
cli.start().catch(console.error);