/**
 * Simplified AST Builder
 * Demonstrates the concept of AST-based generation without TypeScript compiler complexities
 * 
 * This shows how we'll guarantee syntactically valid code through structured generation
 */

class SimpleASTBuilder {
  constructor() {
    this.imports = new Map();
    this.interfaces = [];
    this.components = [];
    this.enums = [];
    this.gaps = [];
  }

  /**
   * Add an import
   */
  addImport(module, imports = [], defaultImport = null) {
    if (!this.imports.has(module)) {
      this.imports.set(module, { named: new Set(), default: null });
    }
    
    const entry = this.imports.get(module);
    if (defaultImport) entry.default = defaultImport;
    imports.forEach(i => entry.named.add(i));
  }

  /**
   * Create an interface
   */
  createInterface(name, properties) {
    const interface_ = {
      type: 'interface',
      name,
      properties: properties.map(p => ({
        name: p.name,
        type: p.type,
        optional: p.optional || false
      }))
    };
    
    this.interfaces.push(interface_);
    return interface_;
  }

  /**
   * Create an enum
   */
  createEnum(name, values) {
    const enum_ = {
      type: 'enum',
      name,
      values
    };
    
    this.enums.push(enum_);
    return enum_;
  }

  /**
   * Create a functional component
   */
  createComponent(config) {
    const component = {
      type: 'component',
      name: config.name,
      props: config.props || [],
      hooks: {
        state: config.state || [],
        effects: config.effects || []
      },
      handlers: config.handlers || [],
      render: config.render || { type: 'jsx', element: 'div', children: [`${config.name} Component`] }
    };
    
    // Check for gaps
    this.checkForGaps(component);
    
    this.components.push(component);
    return component;
  }

  /**
   * Check for gaps in component definition
   */
  checkForGaps(component) {
    // Check if props have types defined
    component.props.forEach(prop => {
      if (!prop.type) {
        this.gaps.push({
          category: 'MISSING_TYPE',
          message: `Prop '${prop.name}' in component '${component.name}' has no type`,
          severity: 'HIGH'
        });
      }
    });

    // Check if state has initial values
    component.hooks.state.forEach(state => {
      if (state.initial === undefined) {
        this.gaps.push({
          category: 'MISSING_INITIAL_VALUE',
          message: `State '${state.name}' in component '${component.name}' has no initial value`,
          severity: 'MEDIUM'
        });
      }
    });

    // Check if handlers have implementations
    component.handlers.forEach(handler => {
      if (!handler.body || handler.body.length === 0) {
        this.gaps.push({
          category: 'MISSING_IMPLEMENTATION',
          message: `Handler '${handler.name}' in component '${component.name}' has no implementation`,
          severity: 'HIGH'
        });
      }
    });
  }

  /**
   * Generate TypeScript code
   */
  generate() {
    const code = [];
    
    // Generate imports
    for (const [module, data] of this.imports) {
      const named = Array.from(data.named);
      let importStr = 'import ';
      
      if (data.default && named.length > 0) {
        importStr += `${data.default}, { ${named.join(', ')} }`;
      } else if (data.default) {
        importStr += data.default;
      } else if (named.length > 0) {
        importStr += `{ ${named.join(', ')} }`;
      }
      
      importStr += ` from '${module}';`;
      code.push(importStr);
    }
    
    if (this.imports.size > 0) code.push('');
    
    // Generate enums
    this.enums.forEach(enum_ => {
      code.push(`export enum ${enum_.name} {`);
      enum_.values.forEach(v => {
        code.push(`  ${v} = '${v}',`);
      });
      code.push('}');
      code.push('');
    });
    
    // Generate interfaces
    this.interfaces.forEach(interface_ => {
      code.push(`export interface ${interface_.name} {`);
      interface_.properties.forEach(prop => {
        const optional = prop.optional ? '?' : '';
        code.push(`  ${prop.name}${optional}: ${prop.type};`);
      });
      code.push('}');
      code.push('');
    });
    
    // Generate components
    this.components.forEach(component => {
      // Props interface
      if (component.props.length > 0) {
        code.push(`interface ${component.name}Props {`);
        component.props.forEach(prop => {
          const optional = prop.optional ? '?' : '';
          code.push(`  ${prop.name}${optional}: ${prop.type || 'any'};`);
        });
        code.push('}');
        code.push('');
      }
      
      // Component function
      const propsParam = component.props.length > 0 ? `props: ${component.name}Props` : '';
      code.push(`export const ${component.name} = (${propsParam}) => {`);
      
      // State hooks
      component.hooks.state.forEach(state => {
        const initial = this.getInitialValue(state.initial);
        code.push(`  const [${state.name}, set${this.capitalize(state.name)}] = useState(${initial});`);
      });
      
      if (component.hooks.state.length > 0) code.push('');
      
      // Effects
      component.hooks.effects.forEach(effect => {
        code.push('  useEffect(() => {');
        code.push(`    ${effect.body || '// Effect implementation'}`);
        const deps = effect.dependencies ? `[${effect.dependencies.join(', ')}]` : '[]';
        code.push(`  }, ${deps});`);
      });
      
      if (component.hooks.effects.length > 0) code.push('');
      
      // Handlers
      component.handlers.forEach(handler => {
        const params = handler.params ? handler.params.join(', ') : '';
        code.push(`  const ${handler.name} = (${params}) => {`);
        if (handler.body && handler.body.length > 0) {
          handler.body.forEach(line => code.push(`    ${line}`));
        } else {
          code.push('    // Handler implementation');
        }
        code.push('  };');
      });
      
      if (component.handlers.length > 0) code.push('');
      
      // Render
      code.push('  return (');
      this.generateJSX(component.render, code, '    ');
      code.push('  );');
      code.push('};');
      code.push('');
    });
    
    return code.join('\n');
  }

  /**
   * Generate JSX
   */
  generateJSX(jsx, code, indent) {
    if (typeof jsx === 'string') {
      code.push(`${indent}${jsx}`);
      return;
    }
    
    const { element, props = {}, children = [] } = jsx;
    
    // Opening tag
    const propsStr = Object.entries(props)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    
    if (children.length === 0) {
      code.push(`${indent}<${element}${propsStr ? ' ' + propsStr : ''} />`);
    } else {
      code.push(`${indent}<${element}${propsStr ? ' ' + propsStr : ''}>`);
      children.forEach(child => {
        if (typeof child === 'string') {
          code.push(`${indent}  ${child}`);
        } else {
          this.generateJSX(child, code, indent + '  ');
        }
      });
      code.push(`${indent}</${element}>`);
    }
  }

  /**
   * Get initial value as string
   */
  getInitialValue(value) {
    if (value === undefined || value === null) return 'null';
    if (typeof value === 'string') return `'${value}'`;
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) return '[]';
    if (typeof value === 'object') return '{}';
    return 'null';
  }

  /**
   * Capitalize helper
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get gap report
   */
  getGapReport() {
    return {
      total: this.gaps.length,
      gaps: this.gaps,
      bySeverity: this.gaps.reduce((acc, gap) => {
        if (!acc[gap.severity]) acc[gap.severity] = 0;
        acc[gap.severity]++;
        return acc;
      }, {}),
      byCategory: this.gaps.reduce((acc, gap) => {
        if (!acc[gap.category]) acc[gap.category] = 0;
        acc[gap.category]++;
        return acc;
      }, {})
    };
  }
}

/**
 * Pattern factory for common components
 */
class PatternFactory {
  constructor(builder) {
    this.builder = builder;
  }

  /**
   * Create a data table component
   */
  createDataTable(entity, fields) {
    return this.builder.createComponent({
      name: `${entity}Table`,
      props: [
        { name: 'data', type: `${entity}[]` },
        { name: 'onEdit', type: `(item: ${entity}) => void`, optional: true },
        { name: 'onDelete', type: `(id: string) => void`, optional: true }
      ],
      state: [
        { name: 'sortBy', type: 'string', initial: 'id' },
        { name: 'sortOrder', type: 'string', initial: 'asc' }
      ],
      handlers: [
        {
          name: 'handleSort',
          params: ['field'],
          body: [
            'setSortBy(field);',
            "setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');"
          ]
        }
      ],
      render: {
        element: 'table',
        props: { className: 'data-table' },
        children: [
          {
            element: 'thead',
            children: [
              {
                element: 'tr',
                children: fields.map(f => ({
                  element: 'th',
                  props: { onClick: `() => handleSort('${f.name}')` },
                  children: [f.label || f.name]
                }))
              }
            ]
          },
          {
            element: 'tbody',
            children: ['{/* Table rows */}']
          }
        ]
      }
    });
  }

  /**
   * Create a form component
   */
  createForm(entity, fields) {
    const formStates = fields.map(f => ({
      name: f.name,
      type: f.type || 'string',
      initial: ''
    }));

    return this.builder.createComponent({
      name: `${entity}Form`,
      props: [
        { name: 'onSubmit', type: `(data: ${entity}) => void` },
        { name: 'initialData', type: entity, optional: true }
      ],
      state: [
        ...formStates,
        { name: 'errors', type: 'Record<string, string>', initial: {} }
      ],
      effects: [
        {
          body: '// Initialize form with data',
          dependencies: ['initialData']
        }
      ],
      handlers: [
        {
          name: 'handleSubmit',
          params: ['e: React.FormEvent'],
          body: [
            'e.preventDefault();',
            '// Validate and submit'
          ]
        }
      ],
      render: {
        element: 'form',
        props: { onSubmit: 'handleSubmit' },
        children: [
          ...fields.map(f => ({
            element: 'div',
            props: { className: 'form-field' },
            children: [
              { element: 'label', children: [f.label || f.name] },
              {
                element: 'input',
                props: {
                  type: f.type === 'number' ? 'number' : 'text',
                  name: f.name,
                  value: f.name
                }
              }
            ]
          })),
          {
            element: 'button',
            props: { type: 'submit' },
            children: ['Submit']
          }
        ]
      }
    });
  }
}

module.exports = {
  SimpleASTBuilder,
  PatternFactory
};