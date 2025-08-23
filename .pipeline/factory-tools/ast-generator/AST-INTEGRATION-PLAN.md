# AST Integration Plan for the Factory
*The Complete Blueprint for AST-Based Generation*

## Executive Summary

AST (Abstract Syntax Tree) generation is the **foundational technology** that will transform our factory from "hopeful string concatenation" to "guaranteed valid code generation". This document provides the complete integration plan.

## Why AST is Critical to Our Factory

### Current State (String-Based) = Defective Products
```
ViewForge Config → String Templates → ??? → TypeScript Errors → Manual Fixes → Still Broken
```

### Future State (AST-Based) = Guaranteed Quality
```
ViewForge Config → AST Builder → Valid Tree → Compiler Verification → ✅ Working Code
```

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AST INTEGRATION ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────┘

INPUT LAYER:
═══════════════════════════════════════════════════════════════════
[ViewForge Config]    [BUSM Data]    [Business Rules]    [Theme]
        │                  │               │                │
        └──────────┬───────┴───────────────┴────────────────┘
                   ▼
         ┌─────────────────────┐
         │ Input Validator      │
         │ - Contract enforce   │
         │ - Gap logging        │
         │ - Type checking      │
         └─────────┬───────────┘
                   ▼
AST GENERATION LAYER:
═══════════════════════════════════════════════════════════════════
         ┌─────────────────────┐
         │ AST Builder Core     │
         ├─────────────────────┤
         │ Component Builder    │──→ Creates component structure
         │ Import Manager       │──→ Manages all imports
         │ Type Builder         │──→ Builds TypeScript types
         │ JSX Builder          │──→ Creates JSX elements
         │ Hook Builder         │──→ Generates React hooks
         │ State Builder        │──→ Creates state management
         └─────────┬───────────┘
                   ▼
         ┌─────────────────────┐
         │ AST Tree (In-Memory) │
         │ - Valid structure    │
         │ - Type-safe          │
         │ - Complete           │
         └─────────┬───────────┘
                   ▼
VERIFICATION LAYER:
═══════════════════════════════════════════════════════════════════
         ┌─────────────────────┐
         │ TypeScript Compiler  │
         │ - Strict mode        │
         │ - In-memory compile  │
         │ - Error detection    │
         └─────────┬───────────┘
                   │
                   ▼
              [Pass/Fail]
                   │
         ┌─────────┴───────────┐
         ▼                     ▼
    [✅ Output]           [❌ Throw Error]
    Perfect Code          Fix Generator
```

## Implementation Phases

### Phase 1: AST Foundation (Week 1)
**Goal:** Build core AST generation infrastructure

#### 1.1 Core AST Builder
```typescript
// File: ast-builder-core.ts
export class ASTBuilder {
  private sourceFile: ts.SourceFile;
  private imports: Map<string, ImportDeclaration>;
  private statements: ts.Statement[];
  
  constructor() {
    this.initialize();
  }
  
  addImport(module: string, imports: string[]): void
  addComponent(component: ComponentDefinition): void
  addType(type: TypeDefinition): void
  build(): ts.SourceFile
  print(): string
  compile(): CompilationResult
}
```

#### 1.2 Component AST Builder
```typescript
// File: component-ast-builder.ts
export class ComponentASTBuilder {
  createFunctionalComponent(name: string, props: Props): ts.Node
  createClassComponent(name: string, props: Props): ts.Node
  createJSXElement(tag: string, props: any, children: any[]): ts.Node
  createHook(hookName: string, deps: any[]): ts.Node
  createState(name: string, type: ts.Type, initial: any): ts.Node
}
```

#### 1.3 Type AST Builder
```typescript
// File: type-ast-builder.ts
export class TypeASTBuilder {
  createInterface(name: string, properties: Property[]): ts.Node
  createType(name: string, type: ts.Type): ts.Node
  createEnum(name: string, values: string[]): ts.Node
  createGeneric(base: string, args: ts.Type[]): ts.Node
}
```

### Phase 2: Generator Integration (Week 2)
**Goal:** Replace string concatenation with AST in generators

#### 2.1 Prototype Generator Refactor
```typescript
// OLD: String-based
function generateComponent(config) {
  return `export const ${config.name} = () => { ... }`;
}

// NEW: AST-based
function generateComponent(config) {
  const ast = new ASTBuilder();
  
  // Add imports
  ast.addImport('react', ['React', 'useState']);
  
  // Build component
  const component = ast.createComponent({
    name: config.name,
    props: config.props,
    body: ast.createJSX(config.layout)
  });
  
  // Compile and verify
  const result = ast.compile();
  if (!result.success) {
    throw new GeneratorError(result.errors);
  }
  
  return result.code;
}
```

#### 2.2 Migration Strategy
1. Keep old generator working
2. Build AST generator in parallel
3. A/B test outputs
4. Switch when AST is proven

### Phase 3: Compilation Verification (Week 3)
**Goal:** Ensure 100% compilation success

#### 3.1 Verification Pipeline
```typescript
export class VerificationPipeline {
  // Verify syntax
  verifySyntax(ast: ts.SourceFile): ValidationResult
  
  // Verify types
  verifyTypes(ast: ts.SourceFile): ValidationResult
  
  // Verify imports
  verifyImports(ast: ts.SourceFile): ValidationResult
  
  // Compile test
  compileTest(code: string): CompilationResult
  
  // Runtime test (optional)
  runtimeTest(component: any): RuntimeResult
}
```

#### 3.2 Error Handling
```typescript
export class GeneratorError extends Error {
  constructor(
    public diagnostics: ts.Diagnostic[],
    public ast: ts.Node,
    public input: any
  ) {
    super('Generator produced invalid code');
    this.logToGapLogger();
  }
  
  private logToGapLogger() {
    gapLogger.log({
      category: 'GENERATOR_ERROR',
      severity: 'CRITICAL',
      diagnostics: this.diagnostics,
      fix: 'Fix generator logic, not output'
    });
  }
}
```

## Integration Points

### 1. ViewForge → AST
```typescript
// ViewForge simplified config feeds AST builder
const viewConfig = viewForgeTransformer.transform(v3Config);
const ast = astBuilder.buildFromViewConfig(viewConfig);
```

### 2. BUSM → AST
```typescript
// BUSM provides types for AST
const entity = busmReader.getEntity('Account');
const types = astBuilder.createTypesFromEntity(entity);
```

### 3. Business Rules → AST
```typescript
// Business rules become component logic
const rules = rulesConfig.getRules('Account');
const validation = astBuilder.createValidation(rules);
```

### 4. Theme → AST
```typescript
// Theme provides className strings
const theme = themeEngine.load('default');
const styles = astBuilder.applyTheme(component, theme);
```

## Testing Strategy

### Unit Tests
```typescript
describe('AST Builder', () => {
  it('creates valid TypeScript AST', () => {
    const ast = builder.createComponent('Test');
    expect(ts.isSourceFile(ast)).toBe(true);
  });
  
  it('compiles without errors', () => {
    const result = builder.compile();
    expect(result.diagnostics).toHaveLength(0);
  });
});
```

### Integration Tests
```typescript
describe('AST Integration', () => {
  it('generates from ViewForge config', () => {
    const config = loadViewForgeConfig();
    const component = generateWithAST(config);
    const compiled = typescript.compile(component);
    expect(compiled.errors).toHaveLength(0);
  });
});
```

### Performance Tests
```typescript
describe('AST Performance', () => {
  it('generates 100 components in < 10 seconds', () => {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      generateWithAST(configs[i]);
    }
    expect(Date.now() - start).toBeLessThan(10000);
  });
});
```

## Success Metrics

### Must Have (Day 1)
- ✅ Zero syntax errors in generated code
- ✅ 100% TypeScript compilation success
- ✅ All imports resolve correctly
- ✅ No manual fixes required

### Should Have (Week 1)
- ✅ Performance < 100ms per component
- ✅ Memory usage < 100MB for batch generation
- ✅ Comprehensive error messages
- ✅ Gap logging integration

### Nice to Have (Month 1)
- ✅ AST optimization
- ✅ Code formatting perfection
- ✅ Comment generation
- ✅ Source maps

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| AST API complexity | High | Create abstraction layer |
| Performance degradation | Medium | Implement caching |
| Learning curve | High | Build incrementally |
| Debugging difficulty | Medium | Add AST visualizer |

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-morph": "^21.0.0"  // Optional: Simpler AST API
  }
}
```

### Required Knowledge
- TypeScript Compiler API
- AST node types
- JSX transformation
- React component patterns

## File Structure
```
.pipeline/factory-tools/ast-generator/
├── core/
│   ├── ast-builder.ts
│   ├── compiler.ts
│   └── verifier.ts
├── builders/
│   ├── component-builder.ts
│   ├── type-builder.ts
│   ├── jsx-builder.ts
│   └── import-builder.ts
├── integrations/
│   ├── viewforge-adapter.ts
│   ├── busm-adapter.ts
│   └── theme-adapter.ts
├── tests/
│   ├── ast-builder.test.ts
│   └── integration.test.ts
└── index.ts
```

## Next Steps

### Immediate (Today)
1. [ ] Create ast-generator directory structure
2. [ ] Install TypeScript compiler dependencies
3. [ ] Build basic AST builder prototype
4. [ ] Test with simple component

### Tomorrow
5. [ ] Integrate with ViewForge transformer
6. [ ] Add BUSM type generation
7. [ ] Implement compilation verification
8. [ ] Create first working example

### This Week
9. [ ] Complete Phase 1 (AST Foundation)
10. [ ] Begin Phase 2 (Generator Integration)
11. [ ] Document learnings
12. [ ] Update PRDs with results

## The Promise

When this integration is complete:
- **Every generated component will compile** ✅
- **Zero TypeScript errors** ✅
- **No manual fixes needed** ✅
- **"NEVER SHIP BROKEN CODE" achieved** ✅

---

*AST Integration Plan Version: 1.0.0*
*Status: Ready to implement*
*Priority: CRITICAL - Fixes root cause*

## Final Note

AST is not just an improvement - it's the **foundation** that makes our factory principle possible. Without AST, we're just hoping code works. With AST, we're **guaranteeing** it works.

Let's build it! 🚀