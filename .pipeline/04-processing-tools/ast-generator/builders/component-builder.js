/**
 * Component AST Builder
 * Specialized builder for React components with proper JSX support
 */

const ts = require('typescript');

class ComponentASTBuilder {
  constructor() {
    this.factory = ts.factory;
  }

  /**
   * Create a complete functional component with hooks and JSX
   */
  createFunctionalComponent(config) {
    const {
      name,
      props = [],
      imports = [],
      hooks = [],
      state = [],
      effects = [],
      handlers = [],
      render
    } = config;

    // Build component body statements
    const bodyStatements = [
      ...this.createStateHooks(state),
      ...this.createEffectHooks(effects),
      ...this.createHandlers(handlers),
      this.createReturnStatement(render || this.createDefaultRender(name))
    ];

    // Create props parameter with TypeScript type
    const propsParam = props.length > 0 ? 
      this.createPropsParameter(`${name}Props`) : [];

    // Create the arrow function
    const arrowFunction = this.factory.createArrowFunction(
      undefined, // modifiers
      undefined, // type parameters
      propsParam, // parameters
      undefined, // type
      this.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      this.factory.createBlock(bodyStatements, true)
    );

    // Export the component
    return this.factory.createVariableStatement(
      [this.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      this.factory.createVariableDeclarationList(
        [this.factory.createVariableDeclaration(
          this.factory.createIdentifier(name),
          undefined,
          undefined,
          arrowFunction
        )],
        ts.NodeFlags.Const
      )
    );
  }

  /**
   * Create props parameter with type annotation
   */
  createPropsParameter(typeName) {
    return [
      this.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        this.factory.createIdentifier('props'),
        undefined,
        this.factory.createTypeReferenceNode(typeName, undefined),
        undefined
      )
    ];
  }

  /**
   * Create useState hooks
   */
  createStateHooks(stateDefinitions) {
    return stateDefinitions.map(({ name, type, initial }) => {
      // const [value, setValue] = useState<Type>(initial);
      const stateCall = this.factory.createCallExpression(
        this.factory.createIdentifier('useState'),
        type ? [this.factory.createTypeReferenceNode(type, undefined)] : undefined,
        initial ? [this.createInitialValue(initial)] : []
      );

      return this.factory.createVariableStatement(
        undefined,
        this.factory.createVariableDeclarationList(
          [this.factory.createVariableDeclaration(
            this.factory.createArrayBindingPattern([
              this.factory.createBindingElement(undefined, undefined, this.factory.createIdentifier(name)),
              this.factory.createBindingElement(undefined, undefined, this.factory.createIdentifier(`set${this.capitalize(name)}`))
            ]),
            undefined,
            undefined,
            stateCall
          )],
          ts.NodeFlags.Const
        )
      );
    });
  }

  /**
   * Create useEffect hooks
   */
  createEffectHooks(effects) {
    return effects.map(({ body, dependencies = [] }) => {
      const effectBody = this.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        this.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        this.factory.createBlock(
          typeof body === 'string' ? 
            [this.createCommentStatement(body)] : 
            body,
          true
        )
      );

      const deps = this.factory.createArrayLiteralExpression(
        dependencies.map(d => this.factory.createIdentifier(d))
      );

      return this.factory.createExpressionStatement(
        this.factory.createCallExpression(
          this.factory.createIdentifier('useEffect'),
          undefined,
          [effectBody, deps]
        )
      );
    });
  }

  /**
   * Create event handlers
   */
  createHandlers(handlers) {
    return handlers.map(({ name, params = [], body }) => {
      const handlerFunction = this.factory.createArrowFunction(
        undefined,
        undefined,
        params.map(p => 
          this.factory.createParameterDeclaration(
            undefined, undefined, undefined,
            this.factory.createIdentifier(p.name),
            undefined,
            p.type ? this.factory.createTypeReferenceNode(p.type, undefined) : undefined
          )
        ),
        undefined,
        this.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        this.factory.createBlock(body || [], true)
      );

      return this.factory.createVariableStatement(
        undefined,
        this.factory.createVariableDeclarationList(
          [this.factory.createVariableDeclaration(
            this.factory.createIdentifier(name),
            undefined,
            undefined,
            handlerFunction
          )],
          ts.NodeFlags.Const
        )
      );
    });
  }

  /**
   * Create JSX return statement
   */
  createReturnStatement(jsxElement) {
    return this.factory.createReturnStatement(jsxElement);
  }

  /**
   * Create a JSX element with proper TypeScript AST nodes
   */
  createJSXElement(tagName, attributes = {}, children = []) {
    // Create opening element
    const openingElement = this.factory.createJsxOpeningElement(
      this.factory.createIdentifier(tagName),
      undefined, // type arguments
      this.factory.createJsxAttributes(
        this.createJSXAttributes(attributes)
      )
    );

    // Create closing element
    const closingElement = this.factory.createJsxClosingElement(
      this.factory.createIdentifier(tagName)
    );

    // Create JSX element with children
    return this.factory.createJsxElement(
      openingElement,
      children.map(child => this.createJSXChild(child)),
      closingElement
    );
  }

  /**
   * Create JSX self-closing element
   */
  createJSXSelfClosingElement(tagName, attributes = {}) {
    return this.factory.createJsxSelfClosingElement(
      this.factory.createIdentifier(tagName),
      undefined,
      this.factory.createJsxAttributes(
        this.createJSXAttributes(attributes)
      )
    );
  }

  /**
   * Create JSX attributes
   */
  createJSXAttributes(attributes) {
    return Object.entries(attributes).map(([key, value]) => {
      return this.factory.createJsxAttribute(
        this.factory.createIdentifier(key),
        typeof value === 'string' ?
          this.factory.createStringLiteral(value) :
          this.factory.createJsxExpression(
            undefined,
            value
          )
      );
    });
  }

  /**
   * Create JSX child (text or element)
   */
  createJSXChild(child) {
    if (typeof child === 'string') {
      return this.factory.createJsxText(child);
    }
    return child;
  }

  /**
   * Create a default render for testing
   */
  createDefaultRender(componentName) {
    return this.createJSXElement(
      'div',
      { className: `${componentName.toLowerCase()}-container` },
      [
        this.createJSXElement('h1', {}, [componentName]),
        this.createJSXElement('p', {}, ['Component generated by AST'])
      ]
    );
  }

  /**
   * Create initial value for state
   */
  createInitialValue(initial) {
    if (typeof initial === 'string') {
      return this.factory.createStringLiteral(initial);
    }
    if (typeof initial === 'number') {
      return this.factory.createNumericLiteral(initial);
    }
    if (typeof initial === 'boolean') {
      return initial ? 
        this.factory.createTrue() : 
        this.factory.createFalse();
    }
    if (initial === null) {
      return this.factory.createNull();
    }
    if (Array.isArray(initial)) {
      return this.factory.createArrayLiteralExpression([]);
    }
    if (typeof initial === 'object') {
      return this.factory.createObjectLiteralExpression([]);
    }
    return this.factory.createIdentifier('undefined');
  }

  /**
   * Create a comment statement
   */
  createCommentStatement(text) {
    return this.factory.createExpressionStatement(
      this.factory.createIdentifier(`// ${text}`)
    );
  }

  /**
   * Utility: Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Create a custom hook
   */
  createCustomHook(name, params = [], body = []) {
    const hookFunction = this.factory.createFunctionDeclaration(
      undefined,
      [this.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      undefined,
      this.factory.createIdentifier(name),
      undefined,
      params.map(p => 
        this.factory.createParameterDeclaration(
          undefined, undefined, undefined,
          this.factory.createIdentifier(p.name),
          undefined,
          p.type ? this.factory.createTypeReferenceNode(p.type, undefined) : undefined
        )
      ),
      undefined,
      this.factory.createBlock(body, true)
    );

    return hookFunction;
  }

  /**
   * Create context provider component
   */
  createContextProvider(name, value) {
    const contextName = `${name}Context`;
    
    // Create context
    const createContext = this.factory.createVariableStatement(
      [this.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      this.factory.createVariableDeclarationList(
        [this.factory.createVariableDeclaration(
          this.factory.createIdentifier(contextName),
          undefined,
          undefined,
          this.factory.createCallExpression(
            this.factory.createIdentifier('createContext'),
            undefined,
            [value || this.factory.createNull()]
          )
        )],
        ts.NodeFlags.Const
      )
    );

    // Create provider component
    const provider = this.createFunctionalComponent({
      name: `${name}Provider`,
      props: [{ name: 'children', type: 'ReactNode' }],
      render: this.createJSXElement(
        `${contextName}.Provider`,
        { value: this.factory.createIdentifier('value') },
        [this.factory.createIdentifier('props.children')]
      )
    });

    return { context: createContext, provider };
  }
}

/**
 * Specialized builders for common patterns
 */
class PatternBuilders {
  constructor(componentBuilder) {
    this.builder = componentBuilder;
  }

  /**
   * Create a data list component with CRUD operations
   */
  createDataList(entity, fields) {
    return this.builder.createFunctionalComponent({
      name: `${entity}List`,
      props: [
        { name: 'items', type: `${entity}[]` },
        { name: 'onEdit', type: `(item: ${entity}) => void` },
        { name: 'onDelete', type: `(id: string) => void` }
      ],
      state: [
        { name: 'selectedItem', type: entity, initial: null },
        { name: 'isLoading', type: 'boolean', initial: false }
      ],
      handlers: [
        {
          name: 'handleEdit',
          params: [{ name: 'item', type: entity }],
          body: [
            // setSelectedItem(item);
            // props.onEdit(item);
          ]
        },
        {
          name: 'handleDelete',
          params: [{ name: 'id', type: 'string' }],
          body: [
            // if (confirm('Are you sure?')) {
            //   props.onDelete(id);
            // }
          ]
        }
      ],
      render: this.builder.createJSXElement(
        'div',
        { className: 'data-list' },
        [
          this.builder.createJSXElement('h2', {}, [`${entity} List`]),
          // Table or cards would go here
        ]
      )
    });
  }

  /**
   * Create a form component with validation
   */
  createForm(entity, fields, validationRules) {
    const formStates = fields.map(f => ({
      name: f.name,
      type: f.type || 'string',
      initial: ''
    }));

    const validationHandlers = fields.map(f => ({
      name: `validate${this.builder.capitalize(f.name)}`,
      params: [{ name: 'value', type: f.type || 'string' }],
      body: [
        // Validation logic based on rules
      ]
    }));

    return this.builder.createFunctionalComponent({
      name: `${entity}Form`,
      props: [
        { name: 'onSubmit', type: `(data: ${entity}) => void` },
        { name: 'initialData', type: entity }
      ],
      state: [
        ...formStates,
        { name: 'errors', type: 'Record<string, string>', initial: {} }
      ],
      handlers: [
        ...validationHandlers,
        {
          name: 'handleSubmit',
          params: [{ name: 'e', type: 'FormEvent' }],
          body: [
            // e.preventDefault();
            // Validate all fields
            // If valid, call props.onSubmit(formData)
          ]
        }
      ],
      render: this.builder.createJSXElement(
        'form',
        { onSubmit: this.builder.factory.createIdentifier('handleSubmit') },
        fields.map(f => 
          this.builder.createJSXElement(
            'div',
            { className: 'form-field' },
            [
              this.builder.createJSXElement('label', {}, [f.name]),
              this.builder.createJSXSelfClosingElement('input', {
                type: f.type === 'number' ? 'number' : 'text',
                name: f.name,
                value: this.builder.factory.createIdentifier(f.name)
              })
            ]
          )
        )
      )
    });
  }
}

module.exports = {
  ComponentASTBuilder,
  PatternBuilders
};