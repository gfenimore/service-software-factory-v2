# AST Generator - Product Requirements Document
*The Foundation of Guaranteed Valid Code*

## 1. Purpose

The AST Generator is the core technology that transforms our factory from producing "probably valid" code to producing "guaranteed valid" code by building Abstract Syntax Trees instead of concatenating strings.

## 2. Problem Statement

**Current State:**
- String concatenation produces invalid syntax
- TypeScript errors discovered after generation
- Manual fixes required for each component
- "Death by thousand cuts" from small errors
- No guarantee generated code will compile

**Future State:**
- AST construction guarantees valid syntax
- Zero TypeScript errors by design
- No manual fixes ever needed
- Errors impossible at syntax level
- 100% compilation guarantee

## 3. Core Functionality

### 3.1 AST Building Operations
```typescript
interface ASTGenerator {
  // Core building
  createSourceFile(): ts.SourceFile
  createComponent(config: ComponentConfig): ts.Node
  createImport(module: string, imports: string[]): ts.Node
  createType(definition: TypeDefinition): ts.Node
  
  // JSX operations
  createJSXElement(tag: string, props: any, children: any[]): ts.JsxElement
  createJSXAttribute(name: string, value: any): ts.JsxAttribute
  createJSXExpression(expression: string): ts.JsxExpression
  
  // TypeScript operations
  createInterface(name: string, properties: Property[]): ts.InterfaceDeclaration
  createFunction(name: string, params: Param[], body: Statement[]): ts.FunctionDeclaration
  createVariable(name: string, type: Type, value: any): ts.VariableDeclaration
}
```

### 3.2 Compilation Operations
```typescript
interface Compiler {
  // Compilation
  compile(ast: ts.SourceFile): CompilationResult
  transpile(ast: ts.SourceFile): string
  
  // Verification
  verify(code: string): VerificationResult
  checkTypes(ast: ts.SourceFile): TypeCheckResult
  
  // Error handling
  getDiagnostics(ast: ts.SourceFile): ts.Diagnostic[]
  formatError(diagnostic: ts.Diagnostic): string
}
```

### 3.3 Integration Operations
```typescript
interface ASTIntegration {
  // Input adapters
  fromViewForge(config: ViewForgeConfig): ts.SourceFile
  fromBUSM(entity: EntityDefinition): ts.InterfaceDeclaration
  
  // Output formats
  toTypeScript(ast: ts.SourceFile): string
  toJavaScript(ast: ts.SourceFile): string
  toSourceMap(ast: ts.SourceFile): string
  
  // Utilities
  optimize(ast: ts.SourceFile): ts.SourceFile
  format(code: string): string
}
```

## 4. Technical Architecture

### 4.1 Core Components

```typescript
// AST Builder Core
export class ASTBuilder {
  private factory: ts.NodeFactory;
  private printer: ts.Printer;
  private sourceFile: ts.SourceFile;
  
  constructor() {
    this.factory = ts.factory;
    this.printer = ts.createPrinter();
    this.sourceFile = this.createSourceFile();
  }
  
  build(): ts.SourceFile {
    return this.sourceFile;
  }
  
  print(): string {
    return this.printer.printFile(this.sourceFile);
  }
}
```

### 4.2 Component Builder

```typescript
export class ComponentBuilder extends ASTBuilder {
  createReactComponent(name: string, props: Props): ts.Node {
    // Create props interface
    const propsInterface = this.createPropsInterface(name, props);
    
    // Create component function
    const component = this.factory.createFunctionDeclaration(
      [this.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      undefined,
      this.factory.createIdentifier(name),
      undefined,
      [this.createPropsParameter(name)],
      this.createReactFCType(name),
      this.createComponentBody(props)
    );
    
    return component;
  }
}
```

### 4.3 Verification Engine

```typescript
export class VerificationEngine {
  verify(ast: ts.SourceFile): VerificationResult {
    const program = ts.createProgram({
      rootNames: ['virtual.tsx'],
      options: {
        strict: true,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true
      },
      host: this.createVirtualHost(ast)
    });
    
    const diagnostics = ts.getPreEmitDiagnostics(program);
    
    return {
      success: diagnostics.length === 0,
      errors: diagnostics.map(d => this.formatDiagnostic(d))
    };
  }
}
```

## 5. Usage Examples

### 5.1 Simple Component Generation
```typescript
const generator = new ASTGenerator();

// Build component AST
const ast = generator.createComponent({
  name: 'UserList',
  props: [
    { name: 'users', type: 'User[]' }
  ],
  body: generator.createJSXElement('div', {}, [
    generator.createJSXElement('h1', {}, ['Users']),
    generator.createJSXExpression('users.map(u => ...)')
  ])
});

// Compile and verify
const result = generator.compile(ast);
console.log(result.success); // true - ALWAYS!
console.log(result.code); // Perfect TypeScript/React code
```

### 5.2 Complex Generation with Types
```typescript
// Generate from ViewForge config
const config = viewForgeTransformer.transform(v3Config);
const ast = generator.fromViewForge(config);

// Add BUSM types
const entity = busmReader.getEntity('Account');
const types = generator.createTypesFromEntity(entity);
ast.addTypes(types);

// Apply business rules
const rules = rulesConfig.getRules('Account');
const validation = generator.createValidation(rules);
ast.addValidation(validation);

// Compile with guarantee
const component = generator.compile(ast);
// This CANNOT fail syntactically!
```

## 6. Key Differentiators

### String Concatenation vs AST

| Aspect | String Concatenation | AST Generation |
|--------|---------------------|----------------|
| Syntax Errors | Common | Impossible |
| Type Safety | None | Built-in |
| Escaping Issues | Frequent | Handled automatically |
| Import Management | Manual | Automatic |
| Compilation | Hope it works | Guaranteed |
| Debugging | Find the bad string | Clear error at build |
| Refactoring | Search & replace | AST transformation |

### Error Prevention Examples

```typescript
// String approach - Multiple failure points
const bad = `
  const ${name} = "${value}"; // What if name="class"? value has quotes?
`;

// AST approach - Cannot fail
const good = factory.createVariableStatement(
  undefined,
  factory.createVariableDeclarationList([
    factory.createVariableDeclaration(
      factory.createIdentifier(sanitizeName(name)),
      undefined,
      undefined,
      factory.createStringLiteral(value)
    )
  ])
);
// Handles ALL edge cases automatically!
```

## 7. Integration Requirements

### 7.1 Dependencies
```json
{
  "dependencies": {
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-morph": "^21.0.0"
  }
}
```

### 7.2 Interfaces
```typescript
// Must integrate with:
interface FactoryIntegrations {
  viewForge: ViewForgeTransformer;
  busm: BUSMReader;
  rules: BusinessRulesConfigurator;
  theme: ThemeEngine;
  gapLogger: GapLogger;
}
```

## 8. Success Metrics

### Critical (Day 1)
- ✅ 100% syntax validity
- ✅ 0 TypeScript errors
- ✅ All imports resolved
- ✅ Compiles in strict mode

### Important (Week 1)
- ✅ < 100ms per component
- ✅ < 50MB memory usage
- ✅ Readable output code
- ✅ Proper formatting

### Nice to Have (Month 1)
- ✅ Comments preserved
- ✅ Source maps generated
- ✅ Optimization passes
- ✅ Multiple output formats

## 9. Implementation Timeline

### Phase 1: Core AST (Days 1-3)
- Basic AST builder
- Simple component generation
- Compilation verification

### Phase 2: Integration (Days 4-7)
- ViewForge adapter
- BUSM type generation
- Theme integration

### Phase 3: Migration (Week 2)
- Replace string generators
- Test extensively
- Document patterns

## 10. Testing Strategy

### Unit Tests
```typescript
test('generates valid AST', () => {
  const ast = generator.createComponent('Test');
  expect(ts.isSourceFile(ast)).toBe(true);
});

test('compiles without errors', () => {
  const result = generator.compile(ast);
  expect(result.errors).toHaveLength(0);
});
```

### Integration Tests
```typescript
test('handles edge cases', () => {
  const edgeCases = [
    { name: 'class' }, // Reserved word
    { name: "User's" }, // Quotes
    { name: null } // Missing data
  ];
  
  edgeCases.forEach(config => {
    const result = generator.generate(config);
    expect(result.success).toBe(true);
  });
});
```

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex API | High | Create simple abstraction |
| Learning curve | High | Build incrementally |
| Performance | Medium | Implement caching |
| Debugging | Medium | Add visualizer |

## 12. The Bottom Line

**Without AST Generator:**
- Generate code
- Find errors
- Fix manually
- Repeat endlessly
- Never confident

**With AST Generator:**
- Generate code
- It works
- Every time
- No exceptions
- Ship with confidence

This is not an incremental improvement - it's a fundamental transformation that makes "NEVER SHIP BROKEN CODE" achievable.

---

*PRD Version: 1.0.0*
*Status: Critical - Ready to implement*
*Priority: HIGHEST - Solves root cause*