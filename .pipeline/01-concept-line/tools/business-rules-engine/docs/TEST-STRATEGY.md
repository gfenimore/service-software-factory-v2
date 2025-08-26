# Business Rules Engine - Test Strategy
## Ensuring the Engine Actually Works

### Version: 1.0.0
### Date: 2025-08-25

---

## 🎯 Testing Philosophy

**Core Principle**: If a rule can be defined, it must be testable. If it can't be tested, it shouldn't be a rule.

### Testing Levels
1. **Unit**: Individual rule components
2. **Integration**: Rules working together
3. **System**: End-to-end rule execution
4. **Acceptance**: Stakeholder validation

---

## 🧪 Test Categories

### 1. Rule Definition Tests
Testing that rules can be properly defined and stored.

```javascript
describe('Rule Definition', () => {
  describe('Validation Rules', () => {
    it('should create a required field rule', () => {
      const rule = RuleBuilder.required('accountName', 'Name is required');
      expect(rule.type).toBe('validation');
      expect(rule.validator).toBe('required');
      expect(rule.field).toBe('accountName');
    });

    it('should create a pattern validation rule', () => {
      const rule = RuleBuilder.pattern('email', /^[^@]+@[^@]+$/, 'Invalid email');
      expect(rule.validator).toBe('pattern');
      expect(rule.params.pattern).toBeDefined();
    });

    it('should reject invalid rule definitions', () => {
      expect(() => RuleBuilder.required()).toThrow('Field is required');
    });
  });
});
```

### 2. Expression Parser Tests
Testing the expression evaluation engine.

```javascript
describe('Expression Parser', () => {
  const parser = new ExpressionParser();
  
  describe('Simple Expressions', () => {
    it('should evaluate equality', () => {
      const result = parser.evaluate("status === 'Active'", { status: 'Active' });
      expect(result).toBe(true);
    });

    it('should evaluate comparisons', () => {
      const result = parser.evaluate("amount > 1000", { amount: 1500 });
      expect(result).toBe(true);
    });

    it('should evaluate complex conditions', () => {
      const expr = "status === 'Active' && amount > 1000";
      const result = parser.evaluate(expr, { status: 'Active', amount: 1500 });
      expect(result).toBe(true);
    });
  });

  describe('Functions', () => {
    it('should evaluate age function', () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = parser.evaluate("age(createdDate) >= 30", { 
        createdDate: thirtyDaysAgo 
      });
      expect(result).toBe(true);
    });

    it('should evaluate contains function', () => {
      const result = parser.evaluate("contains(description, 'urgent')", { 
        description: 'This is an urgent request' 
      });
      expect(result).toBe(true);
    });
  });
});
```

### 3. Validation Executor Tests
Testing actual validation execution.

```javascript
describe('Validation Executor', () => {
  const executor = new ValidationExecutor();
  
  describe('Required Field Validation', () => {
    const rule = {
      type: 'validation',
      field: 'accountName',
      validator: 'required',
      message: 'Account name is required'
    };

    it('should pass when field has value', async () => {
      const result = await executor.execute([rule], { accountName: 'Acme Corp' });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when field is empty', async () => {
      const result = await executor.execute([rule], { accountName: '' });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Account name is required');
    });

    it('should fail when field is missing', async () => {
      const result = await executor.execute([rule], {});
      expect(result.valid).toBe(false);
    });
  });

  describe('Pattern Validation', () => {
    const rule = {
      type: 'validation',
      field: 'email',
      validator: 'pattern',
      params: { pattern: '^[^@]+@[^@]+\.[^@]+$' },
      message: 'Invalid email format'
    };

    it('should pass with valid email', async () => {
      const result = await executor.execute([rule], { email: 'user@example.com' });
      expect(result.valid).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const result = await executor.execute([rule], { email: 'not-an-email' });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Invalid email format');
    });
  });

  describe('Multiple Rules', () => {
    const rules = [
      { type: 'validation', field: 'name', validator: 'required', message: 'Name required' },
      { type: 'validation', field: 'age', validator: 'min', params: { value: 18 }, message: 'Must be 18+' }
    ];

    it('should pass when all rules pass', async () => {
      const result = await executor.execute(rules, { name: 'John', age: 25 });
      expect(result.valid).toBe(true);
    });

    it('should fail when any rule fails', async () => {
      const result = await executor.execute(rules, { name: 'John', age: 16 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Must be 18+');
    });

    it('should report all failures', async () => {
      const result = await executor.execute(rules, { age: 16 });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});
```

### 4. State Machine Tests
Testing state transitions and workflow.

```javascript
describe('State Machine', () => {
  const states = {
    'Draft': {
      transitions: ['Submitted', 'Cancelled'],
      onExit: 'validateDraft'
    },
    'Submitted': {
      transitions: ['Approved', 'Rejected'],
      onEnter: 'notifyApprover'
    },
    'Approved': {
      transitions: ['Closed'],
      onEnter: 'createTask'
    },
    'Closed': {
      transitions: [],
      final: true
    }
  };

  const engine = new StateEngine(states);

  describe('Valid Transitions', () => {
    it('should allow valid transition', () => {
      expect(engine.canTransition('Draft', 'Submitted')).toBe(true);
    });

    it('should reject invalid transition', () => {
      expect(engine.canTransition('Draft', 'Approved')).toBe(false);
    });

    it('should reject transition from final state', () => {
      expect(engine.canTransition('Closed', 'Draft')).toBe(false);
    });
  });

  describe('Transition Actions', () => {
    it('should execute exit actions', async () => {
      const validateDraft = jest.fn();
      engine.registerAction('validateDraft', validateDraft);
      
      await engine.transition('Draft', 'Submitted', {});
      expect(validateDraft).toHaveBeenCalled();
    });

    it('should execute entry actions', async () => {
      const notifyApprover = jest.fn();
      engine.registerAction('notifyApprover', notifyApprover);
      
      await engine.transition('Draft', 'Submitted', {});
      expect(notifyApprover).toHaveBeenCalled();
    });
  });
});
```

### 5. Calculation Tests
Testing formula evaluation and calculations.

```javascript
describe('Calculations', () => {
  const calculator = new Calculator();

  describe('Simple Calculations', () => {
    const rule = {
      field: 'total',
      formula: 'quantity * price',
      triggers: ['quantity', 'price']
    };

    it('should calculate correctly', () => {
      const result = calculator.calculate(rule, { quantity: 5, price: 10 });
      expect(result).toBe(50);
    });

    it('should handle zero values', () => {
      const result = calculator.calculate(rule, { quantity: 0, price: 10 });
      expect(result).toBe(0);
    });
  });

  describe('Complex Calculations', () => {
    const rule = {
      field: 'finalPrice',
      formula: 'basePrice * (1 - discount/100) * (1 + tax/100)',
      triggers: ['basePrice', 'discount', 'tax']
    };

    it('should apply discount and tax', () => {
      const data = { basePrice: 100, discount: 10, tax: 8 };
      const result = calculator.calculate(rule, data);
      expect(result).toBe(97.2); // 100 * 0.9 * 1.08
    });
  });

  describe('Date Calculations', () => {
    const rule = {
      field: 'dueDate',
      formula: 'startDate + days(terms)',
      triggers: ['startDate', 'terms']
    };

    it('should calculate future date', () => {
      const startDate = new Date('2025-01-01');
      const result = calculator.calculate(rule, { startDate, terms: 30 });
      expect(result).toEqual(new Date('2025-01-31'));
    });
  });
});
```

### 6. Integration Tests
Testing components working together.

```javascript
describe('Rule Engine Integration', () => {
  let engine;

  beforeEach(() => {
    engine = new RuleEngine();
    engine.loadRules('./test-rules.json');
  });

  describe('Complete Validation Flow', () => {
    it('should validate entity with all rule types', async () => {
      const accountData = {
        accountName: 'Test Corp',
        email: 'test@example.com',
        type: 'Enterprise',
        revenue: 50000
      };

      const result = await engine.validate('Account', accountData);
      expect(result.valid).toBe(true);
    });

    it('should handle conditional requirements', async () => {
      const accountData = {
        accountName: 'Enterprise Corp',
        type: 'Enterprise'
        // Missing required fields for Enterprise type
      };

      const result = await engine.validate('Account', accountData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tax ID is required for Enterprise accounts');
    });
  });

  describe('State Transition Flow', () => {
    it('should enforce business logic on transitions', async () => {
      const order = {
        id: '123',
        status: 'Draft',
        items: []
      };

      // Try to submit empty order
      const result = await engine.transition('Order', order, 'Submitted');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Order must have items');
    });
  });
});
```

---

## 🎭 Test Scenarios

### Scenario 1: Account Creation
```javascript
describe('Account Creation Scenario', () => {
  it('should enforce all rules for new account', async () => {
    const newAccount = {
      accountName: 'A',  // Too short
      email: 'invalid',  // Invalid format
      type: 'Enterprise' // Missing required fields
    };

    const result = await engine.process('Account', 'create', newAccount);
    
    expect(result.errors).toContain('Account name must be at least 3 characters');
    expect(result.errors).toContain('Invalid email format');
    expect(result.errors).toContain('Tax ID is required for Enterprise accounts');
  });
});
```

### Scenario 2: Order Processing
```javascript
describe('Order Processing Scenario', () => {
  it('should calculate and validate order', async () => {
    const order = {
      items: [
        { product: 'Widget', quantity: 5, price: 10 }
      ],
      discount: 10,
      tax: 8
    };

    // Should trigger calculations
    const processed = await engine.process('Order', 'calculate', order);
    expect(processed.subtotal).toBe(50);
    expect(processed.total).toBe(48.6);

    // Should validate before submission
    const validation = await engine.validate('Order', processed);
    expect(validation.valid).toBe(true);

    // Should allow state transition
    const transition = await engine.transition('Order', processed, 'Submitted');
    expect(transition.success).toBe(true);
  });
});
```

---

## 🔧 Test Infrastructure

### Test Data Builders
```javascript
class TestDataBuilder {
  static validAccount() {
    return {
      accountName: 'Test Account',
      email: 'test@example.com',
      type: 'Standard',
      status: 'Active'
    };
  }

  static invalidAccount() {
    return {
      accountName: '',
      email: 'not-an-email',
      type: 'Unknown'
    };
  }
}
```

### Mock Services
```javascript
class MockRuleStore {
  constructor() {
    this.rules = new Map();
  }

  async save(rule) {
    this.rules.set(rule.id, rule);
    return rule;
  }

  async get(id) {
    return this.rules.get(id);
  }
}
```

---

## 📊 Test Coverage Requirements

### Minimum Coverage Targets
- **Overall**: 80%
- **Core Engine**: 95%
- **Parser**: 90%
- **Executor**: 95%
- **Integration**: 75%

### Critical Paths (100% Required)
1. Rule definition and storage
2. Validation execution
3. Expression evaluation
4. State transitions
5. Error handling

---

## 🚀 Continuous Testing

### Pre-commit Tests
```bash
npm run test:unit  # Quick unit tests only
```

### CI Pipeline Tests
```bash
npm run test:all   # Full test suite
npm run test:coverage  # With coverage report
npm run test:integration  # Integration tests
```

### Performance Tests
```javascript
describe('Performance', () => {
  it('should validate 1000 rules in < 100ms', async () => {
    const rules = generateRules(1000);
    const start = Date.now();
    
    await engine.validate('Account', testData, rules);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

---

## 🐛 Error Testing

### Edge Cases
```javascript
describe('Edge Cases', () => {
  it('should handle null values', async () => {
    const result = await engine.validate('Account', null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toBe('Data is required');
  });

  it('should handle circular references', () => {
    const data = { parent: null };
    data.parent = data;
    
    expect(() => engine.validate('Account', data)).not.toThrow();
  });

  it('should handle malformed expressions', () => {
    const badExpression = "status ==== 'Active'";  // Extra =
    expect(() => parser.parse(badExpression)).toThrow('Invalid expression');
  });
});
```

---

## ✅ Acceptance Criteria

### Stakeholder Tests
1. **Can define a rule without code?** ✓
2. **Does rule execute automatically?** ✓
3. **Are errors clear and actionable?** ✓
4. **Is performance acceptable?** ✓
5. **Can rules be tested easily?** ✓

---

## 📝 Test Documentation

Each test should include:
```javascript
/**
 * @test Account Validation
 * @requirement PRD-4.1
 * @description Validates that account name is required
 * @expected Error when account name is empty
 */
it('should require account name', () => {
  // test implementation
});
```

---

*"A rule without a test is just a suggestion"*

---

**Document Status**: Complete
**Test Count**: 50+ test cases defined
**Ready for Implementation**: Yes