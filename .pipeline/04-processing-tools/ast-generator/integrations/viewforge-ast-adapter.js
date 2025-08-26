/**
 * ViewForge to AST Adapter
 * Transforms ViewForge configurations into AST-generated components
 * 
 * This bridges the gap between ViewForge's simplified config and
 * our AST generator's structured component creation
 */

const { SimpleASTBuilder, PatternFactory } = require('../core/ast-builder-simple');
const fs = require('fs');
const path = require('path');

class ViewForgeASTAdapter {
  constructor() {
    this.builder = new SimpleASTBuilder();
    this.patterns = new PatternFactory(this.builder);
    this.gaps = [];
  }

  /**
   * Transform ViewForge config to AST-generated components
   */
  transform(viewForgeConfig) {
    console.log('Transforming ViewForge config to AST...');
    
    // Add standard imports
    this.addStandardImports();
    
    // Process entity if defined
    if (viewForgeConfig.entity) {
      this.processEntity(viewForgeConfig.entity);
    }
    
    // Process each view
    if (viewForgeConfig.views) {
      viewForgeConfig.views.forEach(view => {
        this.processView(view, viewForgeConfig.entity);
      });
    }
    
    // Generate the code
    const generatedCode = this.builder.generate();
    
    // Get gap report
    const gapReport = this.builder.getGapReport();
    
    return {
      code: generatedCode,
      gaps: gapReport,
      components: this.getComponentList()
    };
  }

  /**
   * Add standard React imports
   */
  addStandardImports() {
    this.builder.addImport('react', ['useState', 'useEffect', 'useMemo'], 'React');
  }

  /**
   * Process entity definition
   */
  processEntity(entity) {
    // Create TypeScript interface for the entity
    const properties = [];
    
    if (entity.fields) {
      entity.fields.forEach(field => {
        properties.push({
          name: field.name,
          type: this.mapFieldType(field.type),
          optional: field.required !== true
        });
      });
    }
    
    // Add standard fields
    if (!entity.fields?.find(f => f.name === 'id')) {
      properties.unshift({ name: 'id', type: 'string' });
    }
    if (!entity.fields?.find(f => f.name === 'createdAt')) {
      properties.push({ name: 'createdAt', type: 'Date' });
    }
    if (!entity.fields?.find(f => f.name === 'updatedAt')) {
      properties.push({ name: 'updatedAt', type: 'Date' });
    }
    
    this.builder.createInterface(entity.name, properties);
    
    // Create enums if defined
    if (entity.enums) {
      Object.entries(entity.enums).forEach(([name, values]) => {
        this.builder.createEnum(name, values);
      });
    }
  }

  /**
   * Process a view configuration
   */
  processView(viewConfig, entity) {
    const { type, name, config = {} } = viewConfig;
    
    switch (type) {
      case 'list':
        this.createListView(name || `${entity.name}List`, entity, config);
        break;
      
      case 'table':
        this.createTableView(name || `${entity.name}Table`, entity, config);
        break;
      
      case 'form':
        this.createFormView(name || `${entity.name}Form`, entity, config);
        break;
      
      case 'detail':
        this.createDetailView(name || `${entity.name}Detail`, entity, config);
        break;
      
      case 'custom':
        this.createCustomView(name, config);
        break;
      
      default:
        this.logGap('UNKNOWN_VIEW_TYPE', `Unknown view type: ${type}`);
    }
  }

  /**
   * Create a list view component
   */
  createListView(name, entity, config) {
    const component = {
      name,
      props: [
        { name: 'items', type: `${entity.name}[]` },
        { name: 'onSelect', type: `(item: ${entity.name}) => void`, optional: true },
        { name: 'loading', type: 'boolean', optional: true }
      ],
      state: [
        { name: 'filter', type: 'string', initial: '' },
        { name: 'selectedItem', type: `${entity.name} | null`, initial: null }
      ],
      handlers: [
        {
          name: 'handleFilter',
          params: ['value: string'],
          body: ['setFilter(value);']
        },
        {
          name: 'handleSelect',
          params: [`item: ${entity.name}`],
          body: [
            'setSelectedItem(item);',
            'props.onSelect?.(item);'
          ]
        }
      ],
      render: this.createListRender(entity, config)
    };
    
    this.builder.createComponent(component);
  }

  /**
   * Create a table view component
   */
  createTableView(name, entity, config) {
    const fields = config.fields || entity.fields || [];
    
    this.patterns.createDataTable(entity.name, 
      fields.map(f => ({
        name: f.name || f,
        label: f.label || f.name || f,
        type: f.type
      }))
    );
  }

  /**
   * Create a form view component
   */
  createFormView(name, entity, config) {
    const fields = config.fields || entity.fields || [];
    
    // Check for validation rules
    if (!config.validation) {
      this.logGap('MISSING_VALIDATION', `Form ${name} has no validation rules defined`);
    }
    
    this.patterns.createForm(entity.name,
      fields.map(f => ({
        name: f.name || f,
        type: this.mapFieldType(f.type),
        label: f.label || f.name || f,
        required: f.required
      }))
    );
  }

  /**
   * Create a detail view component
   */
  createDetailView(name, entity, config) {
    const component = {
      name,
      props: [
        { name: 'item', type: entity.name },
        { name: 'onEdit', type: `() => void`, optional: true },
        { name: 'onDelete', type: `() => void`, optional: true }
      ],
      state: [
        { name: 'isEditing', type: 'boolean', initial: false }
      ],
      handlers: [
        {
          name: 'handleEdit',
          params: [],
          body: [
            'setIsEditing(true);',
            'props.onEdit?.();'
          ]
        }
      ],
      render: {
        element: 'div',
        props: { className: 'detail-view' },
        children: [
          { element: 'h2', children: [`${entity.name} Details`] },
          {
            element: 'div',
            props: { className: 'detail-content' },
            children: ['{/* Detail fields */}']
          },
          {
            element: 'div',
            props: { className: 'actions' },
            children: [
              {
                element: 'button',
                props: { onClick: 'handleEdit' },
                children: ['Edit']
              }
            ]
          }
        ]
      }
    };
    
    this.builder.createComponent(component);
  }

  /**
   * Create a custom view component
   */
  createCustomView(name, config) {
    if (!config.component) {
      this.logGap('MISSING_COMPONENT_DEF', `Custom view ${name} has no component definition`);
      return;
    }
    
    this.builder.createComponent(config.component);
  }

  /**
   * Create list render structure
   */
  createListRender(entity, config) {
    return {
      element: 'div',
      props: { className: 'list-view' },
      children: [
        {
          element: 'div',
          props: { className: 'list-header' },
          children: [
            { element: 'h2', children: [`${entity.name} List`] },
            {
              element: 'input',
              props: {
                type: 'text',
                placeholder: 'Search...',
                onChange: '(e) => handleFilter(e.target.value)'
              }
            }
          ]
        },
        {
          element: 'div',
          props: { className: 'list-items' },
          children: [
            '{props.items.map(item => (',
            '  <div key={item.id} onClick={() => handleSelect(item)}>',
            '    {item.name || item.id}',
            '  </div>',
            '))}'
          ]
        }
      ]
    };
  }

  /**
   * Map field types from ViewForge to TypeScript
   */
  mapFieldType(fieldType) {
    const typeMap = {
      'text': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'date': 'Date',
      'datetime': 'Date',
      'email': 'string',
      'phone': 'string',
      'url': 'string',
      'select': 'string',
      'multiselect': 'string[]',
      'reference': 'string', // ID reference
      'json': 'any'
    };
    
    return typeMap[fieldType] || 'any';
  }

  /**
   * Log a gap
   */
  logGap(category, message) {
    this.gaps.push({
      category,
      message,
      timestamp: new Date().toISOString()
    });
    console.log(`[GAP] ${category}: ${message}`);
  }

  /**
   * Get list of generated components
   */
  getComponentList() {
    return this.builder.components.map(c => ({
      name: c.name,
      type: c.type,
      hasProps: c.props.length > 0,
      hasState: c.hooks.state.length > 0,
      hasEffects: c.hooks.effects.length > 0
    }));
  }
}

/**
 * Integration with Business Rules
 */
class BusinessRulesIntegration {
  constructor(adapter) {
    this.adapter = adapter;
  }

  /**
   * Apply business rules to component generation
   */
  applyRules(rules, component) {
    // Add validation based on rules
    if (rules.validation) {
      this.addValidation(component, rules.validation);
    }
    
    // Add business logic based on rules
    if (rules.businessLogic) {
      this.addBusinessLogic(component, rules.businessLogic);
    }
    
    // Add state transitions based on rules
    if (rules.stateTransitions) {
      this.addStateTransitions(component, rules.stateTransitions);
    }
  }

  /**
   * Add validation logic
   */
  addValidation(component, validationRules) {
    validationRules.forEach(rule => {
      const handlerName = `validate${this.capitalize(rule.field)}`;
      
      // Check if validation handler exists
      if (!component.handlers.find(h => h.name === handlerName)) {
        component.handlers.push({
          name: handlerName,
          params: ['value: any'],
          body: this.generateValidationBody(rule)
        });
      }
    });
  }

  /**
   * Generate validation body based on rule
   */
  generateValidationBody(rule) {
    const body = [];
    
    if (rule.required) {
      body.push('if (!value) return "This field is required";');
    }
    
    if (rule.min) {
      body.push(`if (value.length < ${rule.min}) return "Minimum length is ${rule.min}";`);
    }
    
    if (rule.max) {
      body.push(`if (value.length > ${rule.max}) return "Maximum length is ${rule.max}";`);
    }
    
    if (rule.pattern) {
      body.push(`if (!/${rule.pattern}/.test(value)) return "Invalid format";`);
    }
    
    body.push('return null;');
    
    return body;
  }

  /**
   * Add business logic
   */
  addBusinessLogic(component, logic) {
    // Implementation would add business logic handlers
  }

  /**
   * Add state transitions
   */
  addStateTransitions(component, transitions) {
    // Implementation would add state transition logic
  }

  /**
   * Capitalize helper
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = {
  ViewForgeASTAdapter,
  BusinessRulesIntegration
};