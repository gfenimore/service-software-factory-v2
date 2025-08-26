/**
 * Business Rules Parser v1
 * Parses YAML business rules and provides them to generators
 */

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class BusinessRulesParser {
  constructor(gapLogger) {
    this.gapLogger = gapLogger;
    this.rules = null;
    this.module = null;
  }

  /**
   * Load rules from YAML file
   */
  loadRules(filePath) {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.load(fileContents);
      
      // Extract module info if present
      if (parsed.module) {
        this.module = parsed.module;
      }
      
      // Extract business rules
      if (parsed.business_rules) {
        this.rules = parsed.business_rules;
      } else {
        throw new Error('No business_rules section found in YAML');
      }
      
      console.log(`✅ Loaded business rules for module: ${this.module?.id || 'unknown'}`);
      return this.rules;
      
    } catch (error) {
      console.error(`❌ Failed to load rules: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get validation rules for an entity
   */
  getValidationRules(entityName) {
    if (!this.rules || !this.rules[entityName]) {
      this.gapLogger?.log({
        category: 'MISSING_RULES',
        entity: entityName,
        expected: 'Business rules definition',
        assumption: 'No validation rules',
        impact: 'MEDIUM'
      });
      return {};
    }
    
    return this.rules[entityName].validation || {};
  }

  /**
   * Get required fields for an entity
   */
  getRequiredFields(entityName) {
    const validation = this.getValidationRules(entityName);
    return validation.required || [];
  }

  /**
   * Get unique fields for an entity
   */
  getUniqueFields(entityName) {
    const validation = this.getValidationRules(entityName);
    return validation.unique || [];
  }

  /**
   * Get field validation patterns
   */
  getFieldPatterns(entityName) {
    const validation = this.getValidationRules(entityName);
    return validation.patterns || {};
  }

  /**
   * Get state transitions for an entity
   */
  getStateTransitions(entityName) {
    if (!this.rules || !this.rules[entityName]) {
      return {};
    }
    
    return this.rules[entityName].states || {};
  }

  /**
   * Get allowed transitions from a state
   */
  getAllowedTransitions(entityName, currentState) {
    const states = this.getStateTransitions(entityName);
    
    if (!states[currentState]) {
      this.gapLogger?.log({
        category: 'MISSING_STATE',
        entity: entityName,
        state: currentState,
        expected: 'State transition definition',
        assumption: 'No transitions allowed',
        impact: 'LOW'
      });
      return [];
    }
    
    const stateConfig = states[currentState];
    
    // Handle both array and object formats
    if (Array.isArray(stateConfig)) {
      return stateConfig;
    } else if (stateConfig.transitions) {
      return stateConfig.transitions;
    }
    
    return [];
  }

  /**
   * Get state display configuration
   */
  getStateDisplay(entityName, state) {
    const states = this.getStateTransitions(entityName);
    
    if (!states[state]) {
      return { color: 'gray', icon: 'circle' };
    }
    
    const stateConfig = states[state];
    
    // Return display properties if they exist
    return {
      color: stateConfig.color || 'gray',
      icon: stateConfig.icon || 'circle',
      label: state
    };
  }

  /**
   * Get business logic for an event
   */
  getBusinessLogic(entityName, event) {
    if (!this.rules || !this.rules[entityName]) {
      return [];
    }
    
    const logic = this.rules[entityName].logic || {};
    return logic[event] || [];
  }

  /**
   * Check if a field is required
   */
  isFieldRequired(entityName, fieldName) {
    const required = this.getRequiredFields(entityName);
    return required.includes(fieldName);
  }

  /**
   * Check if a field is unique
   */
  isFieldUnique(entityName, fieldName) {
    const unique = this.getUniqueFields(entityName);
    return unique.includes(fieldName);
  }

  /**
   * Get validation message for a field
   */
  getValidationMessage(entityName, fieldName, validationType) {
    const validation = this.getValidationRules(entityName);
    
    if (validation.messages && 
        validation.messages[fieldName] && 
        validation.messages[fieldName][validationType]) {
      return validation.messages[fieldName][validationType];
    }
    
    // Default messages
    const defaults = {
      required: `${fieldName} is required`,
      unique: `${fieldName} must be unique`,
      pattern: `${fieldName} format is invalid`
    };
    
    return defaults[validationType] || `${fieldName} validation failed`;
  }

  /**
   * Get all rules for an entity (summary)
   */
  getEntityRules(entityName) {
    if (!this.rules || !this.rules[entityName]) {
      return null;
    }
    
    return {
      validation: this.getValidationRules(entityName),
      states: this.getStateTransitions(entityName),
      logic: this.rules[entityName].logic || {},
      required: this.getRequiredFields(entityName),
      unique: this.getUniqueFields(entityName),
      patterns: this.getFieldPatterns(entityName)
    };
  }

  /**
   * Get rules for display in Concept Line
   */
  getConceptDisplayHints(entityName) {
    const rules = this.getEntityRules(entityName);
    
    if (!rules) {
      return {
        showRequired: false,
        showUnique: false,
        showStates: false,
        showValidation: false
      };
    }
    
    return {
      showRequired: rules.required.length > 0,
      showUnique: rules.unique.length > 0,
      showStates: Object.keys(rules.states).length > 0,
      showValidation: Object.keys(rules.patterns).length > 0,
      requiredFields: rules.required,
      uniqueFields: rules.unique,
      states: rules.states,
      patterns: rules.patterns
    };
  }

  /**
   * Validate rules structure
   */
  validateRules() {
    const errors = [];
    
    if (!this.rules) {
      errors.push('No rules loaded');
      return { valid: false, errors };
    }
    
    // Check each entity's rules
    Object.keys(this.rules).forEach(entity => {
      const entityRules = this.rules[entity];
      
      // Check validation structure
      if (entityRules.validation) {
        if (entityRules.validation.required && !Array.isArray(entityRules.validation.required)) {
          errors.push(`${entity}.validation.required must be an array`);
        }
        if (entityRules.validation.unique && !Array.isArray(entityRules.validation.unique)) {
          errors.push(`${entity}.validation.unique must be an array`);
        }
      }
      
      // Check states structure
      if (entityRules.states) {
        Object.keys(entityRules.states).forEach(state => {
          const stateConfig = entityRules.states[state];
          
          // Check if transitions are properly defined
          if (!Array.isArray(stateConfig) && !Array.isArray(stateConfig.transitions)) {
            errors.push(`${entity}.states.${state} must have transitions array`);
          }
        });
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BusinessRulesParser;
}