# Business Rules Engine - Implementation Plan
## Building What Was Actually Requested

### Version: 1.0.0
### Date: 2025-08-25
### Status: Planning

---

## 📋 Executive Summary

We need to build a proper Business Rules Engine that can:
1. Define structured rules (not free text)
2. Execute rule logic (not just store descriptions)
3. Integrate with generators (not just export JSON)
4. Support all rule types from PRD

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│            Business Rules Engine             │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐      ┌──────────────┐    │
│  │Rule          │      │Rule          │    │
│  │Definition    │─────▶│Parser        │    │
│  │Layer         │      │              │    │
│  └──────────────┘      └──────────────┘    │
│                              │              │
│                              ▼              │
│  ┌──────────────┐      ┌──────────────┐    │
│  │Rule          │◀─────│Rule          │    │
│  │Storage       │      │Executor      │    │
│  │              │      │              │    │
│  └──────────────┘      └──────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     Integration Layer (API)         │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    ▼                   ▼                   ▼
Generators          Validators         Runtime
```

---

## 🚀 Implementation Phases

### Phase 1: Core Engine Structure (Week 1)

#### 1.1 Rule Schema Definition
```typescript
interface Rule {
  id: string;
  entity: string;
  type: 'validation' | 'logic' | 'state' | 'calculation' | 'requirement';
  definition: RuleDefinition;
  metadata: RuleMetadata;
}

interface ValidationRule extends Rule {
  field: string;
  validator: ValidatorType;
  params: any;
  message: string;
}

interface BusinessLogic extends Rule {
  trigger: 'onCreate' | 'onUpdate' | 'onDelete';
  condition: Expression;
  actions: Action[];
}
```

#### 1.2 File Structure
```
business-rules-engine/
├── src/
│   ├── core/
│   │   ├── RuleEngine.js
│   │   ├── RuleRegistry.js
│   │   └── RuleContext.js
│   ├── types/
│   │   ├── ValidationRule.js
│   │   ├── BusinessLogic.js
│   │   ├── StateTransition.js
│   │   ├── Calculation.js
│   │   └── ConditionalRequirement.js
│   ├── parser/
│   │   ├── ExpressionParser.js
│   │   ├── FormulaParser.js
│   │   └── ConditionParser.js
│   ├── executor/
│   │   ├── RuleExecutor.js
│   │   ├── ValidationExecutor.js
│   │   └── LogicExecutor.js
│   └── storage/
│       ├── RuleStore.js
│       └── RuleSerializer.js
```

---

### Phase 2: Rule Definition & Storage (Week 2)

#### 2.1 Validation Rules
```javascript
class ValidationRuleBuilder {
  required(field, message) {
    return {
      type: 'validation',
      field,
      validator: 'required',
      message
    };
  }
  
  pattern(field, regex, message) {
    return {
      type: 'validation',
      field,
      validator: 'pattern',
      params: { pattern: regex },
      message
    };
  }
  
  unique(field, scope, message) {
    return {
      type: 'validation',
      field,
      validator: 'unique',
      params: { scope },
      message
    };
  }
}
```

#### 2.2 Storage Format
```json
{
  "version": "1.0.0",
  "entities": {
    "Account": {
      "rules": [
        {
          "id": "acc-val-001",
          "type": "validation",
          "field": "accountName",
          "validator": "required",
          "message": "Account name is required"
        },
        {
          "id": "acc-val-002",
          "type": "validation",
          "field": "email",
          "validator": "pattern",
          "params": {
            "pattern": "^[^@]+@[^@]+\\.[^@]+$"
          },
          "message": "Invalid email format"
        }
      ]
    }
  }
}
```

---

### Phase 3: Expression Parser (Week 3)

#### 3.1 Expression Language
```javascript
class ExpressionParser {
  parse(expression) {
    // Parse expressions like:
    // "status === 'Active' && amount > 10000"
    // "age(createdDate) > 30"
    // "contains(description, 'urgent')"
    
    return {
      type: 'expression',
      ast: this.buildAST(expression),
      variables: this.extractVariables(expression),
      functions: this.extractFunctions(expression)
    };
  }
  
  evaluate(expression, context) {
    const ast = this.parse(expression);
    return this.evalAST(ast, context);
  }
}
```

#### 3.2 Supported Operations
- Comparisons: `===`, `!==`, `>`, `<`, `>=`, `<=`
- Logical: `&&`, `||`, `!`
- Functions: `age()`, `contains()`, `between()`, `today()`, `now()`
- Math: `+`, `-`, `*`, `/`, `%`

---

### Phase 4: Rule Executor (Week 4)

#### 4.1 Validation Executor
```javascript
class ValidationExecutor {
  async execute(rules, data) {
    const results = [];
    
    for (const rule of rules) {
      const result = await this.executeRule(rule, data);
      results.push(result);
    }
    
    return {
      valid: results.every(r => r.valid),
      errors: results.filter(r => !r.valid).map(r => r.error)
    };
  }
  
  async executeRule(rule, data) {
    switch (rule.validator) {
      case 'required':
        return this.validateRequired(rule, data);
      case 'pattern':
        return this.validatePattern(rule, data);
      case 'unique':
        return this.validateUnique(rule, data);
      // ... more validators
    }
  }
}
```

#### 4.2 Logic Executor
```javascript
class LogicExecutor {
  async execute(logic, event, data) {
    // Check if trigger matches
    if (logic.trigger !== event) return;
    
    // Evaluate condition
    const conditionMet = await this.evaluateCondition(logic.condition, data);
    if (!conditionMet) return;
    
    // Execute actions
    for (const action of logic.actions) {
      await this.executeAction(action, data);
    }
  }
}
```

---

### Phase 5: State Machine (Week 5)

#### 5.1 State Transition Engine
```javascript
class StateEngine {
  constructor(states) {
    this.states = states;
    this.currentState = null;
  }
  
  canTransition(from, to) {
    const state = this.states[from];
    return state.transitions.includes(to);
  }
  
  async transition(from, to, context) {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid transition: ${from} -> ${to}`);
    }
    
    // Execute exit actions
    await this.executeActions(this.states[from].onExit, context);
    
    // Perform transition
    this.currentState = to;
    
    // Execute entry actions
    await this.executeActions(this.states[to].onEnter, context);
  }
}
```

---

### Phase 6: Integration Layer (Week 6)

#### 6.1 API Interface
```javascript
class RuleEngineAPI {
  // For generators
  getRulesForEntity(entity) { }
  getValidationRules(entity, field) { }
  getStateTransitions(entity) { }
  
  // For runtime
  validate(entity, data) { }
  executeLogic(entity, event, data) { }
  checkTransition(entity, from, to) { }
  calculate(entity, data) { }
}
```

#### 6.2 Generator Integration
```javascript
// In ViewForge
const rules = ruleEngine.getRulesForEntity('Account');
const validations = rules.filter(r => r.type === 'validation');

// Generate validation attributes
validations.forEach(rule => {
  component.addValidation(rule);
});
```

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
describe('ValidationExecutor', () => {
  it('should validate required fields', async () => {
    const rule = {
      type: 'validation',
      field: 'name',
      validator: 'required'
    };
    
    const result = await executor.execute([rule], { name: '' });
    expect(result.valid).toBe(false);
  });
});
```

### Integration Tests
```javascript
describe('Rule Engine Integration', () => {
  it('should process complete rule lifecycle', async () => {
    // Define rule
    const rule = engine.defineRule('Account', 'validation', {...});
    
    // Store rule
    await engine.store(rule);
    
    // Retrieve rule
    const retrieved = await engine.getRule(rule.id);
    
    // Execute rule
    const result = await engine.execute(retrieved, testData);
    
    expect(result).toBeDefined();
  });
});
```

---

## 🚢 Deployment Plan

### Local Development
```bash
npm install
npm run dev     # Start with hot reload
npm test       # Run tests
npm run build  # Build for production
```

### Pipeline Integration
```javascript
// In pipeline-orchestrator.js
const RuleEngine = require('./business-rules-engine');
const engine = new RuleEngine();

// Load rules
await engine.loadRules('./rules/business-rules.json');

// Use in stages
const rules = engine.getRulesForEntity('Account');
```

---

## 📊 Success Metrics

### Functional Metrics
- [ ] All 5 rule types implemented
- [ ] Expression parser handles all PRD examples
- [ ] State machine supports complex workflows
- [ ] Calculations execute correctly
- [ ] Conditional requirements work dynamically

### Performance Metrics
- [ ] Rule evaluation < 10ms
- [ ] Support 1000+ rules per entity
- [ ] Concurrent execution support
- [ ] Caching for repeated evaluations

### Quality Metrics
- [ ] 90% test coverage
- [ ] 0 critical bugs
- [ ] PRD requirements 100% met
- [ ] Integration with all generators

---

## 🎯 MVP Definition

### Minimum Viable Engine (2 weeks)
1. **Validation Rules Only**
   - Required validator
   - Pattern validator
   - Min/max validators

2. **Simple Expression Parser**
   - Basic comparisons
   - AND/OR logic
   - Field access

3. **Basic Executor**
   - Validate method
   - Error collection
   - JSON storage

4. **Simple API**
   - getRules()
   - validate()
   - Basic integration

This MVP would be 10x more powerful than current "Rule Collection UI" while building toward full PRD vision.

---

## 🔄 Migration Strategy

### From Rule Collection UI to Rule Engine
1. Keep UI for rule "drafting"
2. Add "Convert to Engine Rule" button
3. Transform free text to structured rules
4. Validate and test converted rules
5. Deploy to engine

---

## 📝 Next Steps

1. **Immediate** (Today)
   - [ ] Get stakeholder approval on plan
   - [ ] Decide on MVP vs Full implementation
   - [ ] Set timeline expectations

2. **Short Term** (This Week)
   - [ ] Build rule schema
   - [ ] Create validation executor
   - [ ] Test with simple rules

3. **Medium Term** (Next 2 Weeks)
   - [ ] Complete expression parser
   - [ ] Add remaining rule types
   - [ ] Integrate with pipeline

---

*"We're not building a notepad, we're building an engine!"*

---

**Plan Status**: Ready for Review
**Estimated Timeline**: 6 weeks for full implementation, 2 weeks for MVP
**Confidence Level**: High (now that we understand requirements!)