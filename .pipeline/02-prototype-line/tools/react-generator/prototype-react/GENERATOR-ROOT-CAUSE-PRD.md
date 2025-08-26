# React Component Generator - Root Cause PRD
*Fixing the Disease, Not the Symptoms*

## 1. The Fundamental Problem

### What We Keep Doing Wrong

**Current Approach:**
```
Template String → Hope it Works → It Doesn't → Add Validation → Add Fixes
```

**The Root Causes:**
1. **String Templates Don't Know TypeScript** - We concatenate strings hoping they form valid code
2. **No Compilation During Generation** - We never verify output is valid
3. **Implicit Dependencies** - Generated code assumes React, types, etc. exist
4. **Configuration Mismatch** - Config structure doesn't map cleanly to component needs
5. **No Contract Enforcement** - Generator doesn't guarantee working output

### The Disease We're Treating

**We're building a FACTORY that produces DEFECTIVE PRODUCTS!**

It's like:
- A car factory that ships cars without testing if they start
- A bakery that doesn't taste the bread
- A printer that doesn't check if ink came out

## 2. The Root Cause Solution

### Principle: "Never Generate Invalid Code"

**New Approach:**
```
Validated Input → Compiled Generation → Guaranteed Working Output
```

### The Three Pillars of Correct Generation

#### Pillar 1: Input Contract Enforcement
```typescript
// The generator MUST validate input completely
interface GeneratorInput {
  entity: EntityDefinition;     // From BUSM
  fields: FieldDefinition[];     // Validated types
  layout: LayoutDefinition;      // Known patterns
  features: FeatureFlags;        // Explicit capabilities
}

// REJECT invalid input before generation
if (!isValidInput(input)) {
  throw new Error("Fix input BEFORE generation");
}
```

#### Pillar 2: AST-Based Generation (Not String Templates)
```typescript
// WRONG - String concatenation
const component = `
  export const ${name}: React.FC = () => {
    return <div>${content}</div>
  }
`;

// RIGHT - AST construction
const component = ts.createFunctionDeclaration(
  [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
  undefined,
  ts.createIdentifier(name),
  undefined,
  [/* parameters */],
  ts.createTypeReferenceNode('React.FC'),
  ts.createBlock([/* statements */])
);

// AST guarantees syntactically correct code
```

#### Pillar 3: Compilation Verification
```typescript
// Every generation MUST compile successfully
function generateComponent(input: GeneratorInput): GeneratedOutput {
  const ast = buildAST(input);
  const code = printAST(ast);
  
  // Compile in-memory to verify
  const result = ts.transpileModule(code, {
    compilerOptions: {
      jsx: 'react',
      strict: true
    }
  });
  
  if (result.diagnostics?.length > 0) {
    throw new Error("Generator produced invalid code - FIX THE GENERATOR");
  }
  
  return {
    code,
    compiled: result.outputText,
    sourceMap: result.sourceMapText
  };
}
```

## 3. The Correct Generator Architecture

### Layer 1: Input Validation (Strict)
```typescript
class InputValidator {
  // Validate EVERYTHING upfront
  validate(input: any): ValidatedInput {
    this.validateEntity(input.entity);
    this.validateFields(input.fields);
    this.validateLayout(input.layout);
    this.validateRelationships(input.relationships);
    
    return input as ValidatedInput;
  }
  
  validateEntity(entity: any) {
    // Must exist in BUSM
    // Must have primary key
    // Must have defined attributes
  }
  
  validateFields(fields: any[]) {
    fields.forEach(field => {
      // Must have valid type
      // Must have valid path
      // Must map to entity attribute
    });
  }
}
```

### Layer 2: Component Builder (Type-Safe)
```typescript
class ComponentBuilder {
  private imports: Set<Import> = new Set();
  private props: Map<string, Type> = new Map();
  private state: Map<string, Type> = new Map();
  private effects: Effect[] = [];
  
  addImport(module: string, items: string[]) {
    // Track all imports needed
  }
  
  addProp(name: string, type: Type, required: boolean) {
    // Build prop interface
  }
  
  addState(name: string, type: Type, initial: any) {
    // Track state with types
  }
  
  build(): ComponentAST {
    // Construct complete component AST
    // All types verified
    // All imports present
    // No missing dependencies
  }
}
```

### Layer 3: Code Emitter (Verified)
```typescript
class CodeEmitter {
  emit(ast: ComponentAST): VerifiedOutput {
    // 1. Print AST to code
    const code = this.printToString(ast);
    
    // 2. Verify imports resolve
    this.verifyImports(ast.imports);
    
    // 3. Compile to check
    const compiled = this.compile(code);
    
    // 4. Format with Prettier
    const formatted = this.format(compiled);
    
    // 5. Return ONLY if valid
    return {
      source: formatted,
      compiled: compiled,
      types: this.extractTypes(ast),
      imports: Array.from(ast.imports)
    };
  }
  
  private compile(code: string): string {
    const result = ts.transpileModule(code, STRICT_CONFIG);
    if (result.diagnostics.length > 0) {
      // Generator bug - MUST fix generator
      throw new GeneratorBugError(result.diagnostics);
    }
    return result.outputText;
  }
}
```

## 4. The Contract: What the Generator GUARANTEES

### Guarantees to Users

1. **Output ALWAYS Compiles**
   - No TypeScript errors
   - No missing imports
   - No undefined references

2. **Output ALWAYS Runs**
   - Valid React component
   - Proper prop types
   - No runtime errors from generation

3. **Output ALWAYS Typed**
   - Full TypeScript types
   - Proper generic constraints
   - Interface contracts

### What It Does NOT Guarantee

1. **Business Logic Correctness** - That's config's job
2. **Performance** - That's optimization's job
3. **Styling Preferences** - That's theming's job

## 5. Configuration That Maps to Components

### Current Problem: Config Doesn't Match Component Needs

**Current Config (ViewForge):**
```json
{
  "rows": [
    {"fields": ["field1", "field2"]}
  ]
}
```

**What Component Actually Needs:**
```typescript
{
  entity: "Account",
  primaryKey: "accountId",
  displayFields: [
    {
      source: "account.name",
      type: "string",
      label: "Account Name",
      sortable: true
    }
  ],
  relations: [
    {
      entity: "Contact",
      type: "one-to-one",
      foreignKey: "primaryContactId"
    }
  ]
}
```

### Solution: Config Must Match Output Needs

```typescript
interface ComponentConfig {
  // Entity (what data)
  entity: {
    name: string;
    source: 'table' | 'view' | 'function';
    primaryKey: string;
  };
  
  // Fields (what to show)
  fields: Array<{
    path: string;          // account.name
    type: DataType;        // string, number, etc.
    label: string;         // Display label
    required: boolean;     // For forms
    sortable?: boolean;    // For tables
    filterable?: boolean;  // For lists
  }>;
  
  // Features (what it can do)
  features: {
    create?: boolean;
    read: boolean;
    update?: boolean;
    delete?: boolean;
    sort?: boolean;
    filter?: boolean;
    paginate?: boolean;
  };
  
  // Layout (how it looks)
  layout: {
    type: 'table' | 'list' | 'grid' | 'form';
    responsive: boolean;
    density: 'compact' | 'normal' | 'comfortable';
  };
}
```

## 6. Testing Strategy: Prevent Regression

### Unit Tests for Generator
```typescript
describe('Component Generator', () => {
  it('ALWAYS produces compilable code', () => {
    const configs = loadAllTestConfigs();
    configs.forEach(config => {
      const output = generator.generate(config);
      const result = ts.transpileModule(output.code, STRICT_CONFIG);
      expect(result.diagnostics).toHaveLength(0);
    });
  });
  
  it('NEVER has missing imports', () => {
    const output = generator.generate(testConfig);
    const imports = extractImports(output.code);
    imports.forEach(imp => {
      expect(resolveImport(imp)).toBeDefined();
    });
  });
});
```

### Integration Tests
```typescript
it('Generated component renders without errors', () => {
  const output = generator.generate(testConfig);
  const Component = evalComponent(output.code);
  
  const { container } = render(<Component {...mockProps} />);
  expect(container).toBeInTheDocument();
  expect(console.error).not.toHaveBeenCalled();
});
```

## 7. Migration Path: Fix Without Breaking

### Phase 1: Build New Generator Alongside Old
- Keep existing generator working
- Build AST-based generator in parallel
- A/B test outputs

### Phase 2: Validate Both Produce Same UI
- Generate both ways
- Compare visual output
- Ensure feature parity

### Phase 3: Switch to New Generator
- Route all new generation through AST generator
- Keep old generator for compatibility
- Migrate existing components gradually

## 8. Success Metrics

### MUST Have (Generator is Broken Without These)
- ✅ 100% of output compiles successfully
- ✅ 0 TypeScript errors in strict mode
- ✅ All imports resolve correctly
- ✅ Component renders without console errors

### SHOULD Have (Quality Metrics)
- ✅ Generated code passes ESLint defaults
- ✅ Props have JSDoc comments
- ✅ Code is properly formatted
- ✅ Bundle size is reasonable

### NICE to Have (Excellence Metrics)
- ✅ Generated code has unit tests
- ✅ Storybook stories generated
- ✅ Accessibility attributes included
- ✅ Performance optimizations applied

## 9. The Root Cause We're Solving

**Current State:**
"We generate code and hope it works"

**Future State:**
"We guarantee generated code works"

**The Difference:**
- No more validation tools needed
- No more escape hatches
- No more TypeScript errors
- No more "death by thousand cuts"

## 10. Implementation Checklist

### Must Do First
- [ ] Define complete input schema
- [ ] Build AST construction layer
- [ ] Add compilation verification
- [ ] Create comprehensive test suite

### Then Do
- [ ] Migrate ViewForge config format
- [ ] Build backward compatibility layer
- [ ] Update all documentation
- [ ] Train team on new approach

### Finally
- [ ] Deprecate old generator
- [ ] Remove validation tools
- [ ] Remove escape hatches
- [ ] Celebrate working code!

---

## The Bottom Line

**Stop generating strings. Start generating guaranteed-valid AST.**

**Stop validating output. Start ensuring correct generation.**

**Stop treating symptoms. Start preventing the disease.**

---

*PRD Version: 1.0.0*
*Status: Critical - Current Generator is Fundamentally Flawed*
*Recommendation: Rebuild with AST approach immediately*