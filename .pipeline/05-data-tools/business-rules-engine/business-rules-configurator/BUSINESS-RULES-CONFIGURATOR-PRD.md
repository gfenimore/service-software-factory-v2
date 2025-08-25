# Business Rules Configurator - Product Requirements Document
*Where Business Logic Lives*

## 1. Purpose

The Business Rules Configurator provides a centralized system for defining validation rules, business logic, state transitions, calculations, and conditional requirements - keeping BUSM focused on data structure while business behavior lives here.

## 2. Problem Statement

**Current State:**
- Business rules mixed with data definitions
- Validation logic scattered across generators
- No single source for business behavior
- Rules hardcoded in components

**Future State:**
- Clear separation: BUSM = structure, Rules = behavior
- All business logic in one place
- Rules consumed by all lines
- Dynamic rule application

## 3. Core Functionality

### 3.1 Rule Definition
```javascript
class BusinessRulesConfigurator {
  // Define validation rule
  addValidationRule(entity: string, field: string, rule: ValidationRule): void
  
  // Define business logic
  addBusinessLogic(entity: string, logic: BusinessLogic): void
  
  // Define state transitions
  addStateTransition(entity: string, transition: StateTransition): void
  
  // Define calculations
  addCalculation(entity: string, calculation: Calculation): void
  
  // Define conditional requirements
  addConditionalRequirement(entity: string, condition: ConditionalRequirement): void
}
```

### 3.2 Rule Retrieval
```javascript
  // Get all rules for entity
  getRulesForEntity(entity: string): EntityRules
  
  // Get field validation rules
  getFieldValidation(entity: string, field: string): ValidationRule[]
  
  // Get state transitions
  getStateTransitions(entity: string, currentState: string): StateTransition[]
  
  // Get calculations
  getCalculations(entity: string): Calculation[]
  
  // Check conditional requirements
  checkRequirements(entity: string, data: any): RequirementResult
```

### 3.3 Rule Execution
```javascript
  // Validate data against rules
  validate(entity: string, data: any): ValidationResult
  
  // Execute business logic
  executeLogic(entity: string, operation: string, data: any): LogicResult
  
  // Calculate derived values
  calculate(entity: string, data: any): CalculationResult
  
  // Get next valid states
  getValidTransitions(entity: string, currentState: string): string[]
```

## 4. Rule Types

### 4.1 Validation Rules
```json
{
  "entity": "Account",
  "validations": {
    "accountName": [
      {
        "type": "required",
        "message": "Account name is required"
      },
      {
        "type": "unique",
        "message": "Account name must be unique"
      },
      {
        "type": "pattern",
        "pattern": "^[A-Za-z0-9 .-]+$",
        "message": "Account name contains invalid characters"
      }
    ],
    "email": [
      {
        "type": "email",
        "message": "Invalid email format"
      }
    ],
    "annualRevenue": [
      {
        "type": "min",
        "value": 0,
        "message": "Revenue cannot be negative"
      }
    ]
  }
}
```

### 4.2 Business Logic
```json
{
  "entity": "Account",
  "logic": {
    "onCreate": [
      {
        "action": "setDefaultStatus",
        "value": "Prospect"
      },
      {
        "action": "generateAccountNumber",
        "format": "ACC-{YYYY}-{SEQUENCE}"
      }
    ],
    "onStatusChange": [
      {
        "condition": "status === 'Active' && previousStatus === 'Prospect'",
        "action": "sendWelcomeEmail"
      }
    ],
    "onDelete": [
      {
        "condition": "hasOpenOpportunities",
        "action": "preventDelete",
        "message": "Cannot delete account with open opportunities"
      }
    ]
  }
}
```

### 4.3 State Transitions
```json
{
  "entity": "Opportunity",
  "states": {
    "Draft": {
      "transitions": ["Submitted", "Cancelled"],
      "actions": {
        "onExit": "validateRequiredFields"
      }
    },
    "Submitted": {
      "transitions": ["In Review", "Withdrawn"],
      "actions": {
        "onEnter": "notifyApprover"
      }
    },
    "In Review": {
      "transitions": ["Approved", "Rejected", "Needs Info"],
      "actions": {
        "onEnter": "startReviewTimer"
      }
    },
    "Approved": {
      "transitions": ["Closed Won"],
      "final": false
    },
    "Closed Won": {
      "transitions": [],
      "final": true,
      "actions": {
        "onEnter": "createInvoice"
      }
    }
  }
}
```

### 4.4 Calculations
```json
{
  "entity": "Opportunity",
  "calculations": [
    {
      "field": "totalValue",
      "formula": "quantity * unitPrice * (1 - discountPercent/100)",
      "triggers": ["quantity", "unitPrice", "discountPercent"]
    },
    {
      "field": "commission",
      "formula": "totalValue * commissionRate",
      "triggers": ["totalValue", "commissionRate"]
    },
    {
      "field": "expectedCloseDate",
      "formula": "createdDate + averageSalesCycleDays",
      "triggers": ["createdDate"]
    }
  ]
}
```

### 4.5 Conditional Requirements
```json
{
  "entity": "Account",
  "conditionalRequirements": [
    {
      "condition": "accountType === 'Enterprise'",
      "requirements": {
        "taxId": "required",
        "creditLimit": "required",
        "paymentTerms": "required"
      }
    },
    {
      "condition": "international === true",
      "requirements": {
        "country": "required",
        "currency": "required",
        "vatNumber": "required"
      }
    }
  ]
}
```

## 5. Rule Expression Language

### 5.1 Simple Expressions
```javascript
// Field comparisons
"status === 'Active'"
"amount > 10000"
"dueDate < today()"

// Multiple conditions
"status === 'Active' && type === 'Premium'"
"priority === 'High' || amount > 50000"

// Functions
"age(createdDate) > 30"
"contains(description, 'urgent')"
"between(amount, 1000, 5000)"
```

### 5.2 Complex Rules
```javascript
{
  "rule": "complexApproval",
  "expression": `
    (amount > 100000 && approverLevel >= 3) ||
    (amount > 50000 && approverLevel >= 2) ||
    (amount <= 50000 && approverLevel >= 1)
  `,
  "message": "Insufficient approval level for amount"
}
```

## 6. Integration Points

### 6.1 Prototype Generator
```javascript
// Apply validation rules
const rules = rulesConfig.getFieldValidation('Account', 'email');
const validation = rules.map(rule => generateValidation(rule));

// Apply state transitions
const transitions = rulesConfig.getStateTransitions('Opportunity', 'Draft');
const stateButtons = transitions.map(state => generateButton(state));
```

### 6.2 Form Generation
```javascript
// Get conditional requirements
const requirements = rulesConfig.checkRequirements('Account', formData);
const requiredFields = requirements.required;

// Generate form with dynamic requirements
const form = generateForm(fields, requiredFields);
```

### 6.3 Workflow Engine
```javascript
// Check valid transitions
const validStates = rulesConfig.getValidTransitions('Order', currentState);
const canTransition = validStates.includes(requestedState);

if (canTransition) {
  // Execute transition actions
  rulesConfig.executeTransition('Order', currentState, requestedState);
}
```

## 7. Rule Storage Format

### 7.1 JSON Structure
```json
{
  "version": "1.0.0",
  "entities": {
    "Account": {
      "validations": {...},
      "logic": {...},
      "states": {...},
      "calculations": {...},
      "conditionalRequirements": {...}
    }
  },
  "globalRules": {
    "emailValidation": {
      "pattern": "^[^@]+@[^@]+\\.[^@]+$"
    },
    "phoneValidation": {
      "pattern": "^\\+?[1-9]\\d{1,14}$"
    }
  }
}
```

### 7.2 YAML Alternative
```yaml
entities:
  Account:
    validations:
      accountName:
        - type: required
          message: Account name is required
    
    states:
      Prospect:
        transitions: [Active, Inactive]
      Active:
        transitions: [Inactive, Suspended]
```

## 8. Success Metrics

- All business logic removed from BUSM
- Rules consumed by all generators
- 100% validation coverage
- State transitions enforced
- Calculations automated

## 9. Testing Strategy

### 9.1 Rule Validation
```javascript
describe('Business Rules', () => {
  it('validates required fields', () => {
    const result = rules.validate('Account', { status: 'Active' });
    expect(result.errors).toContain('accountName is required');
  });
  
  it('enforces state transitions', () => {
    const valid = rules.canTransition('Order', 'Draft', 'Completed');
    expect(valid).toBe(false);
  });
});
```

### 9.2 Integration Testing
- Test with each generator
- Validate rule application
- Test edge cases
- Performance testing

## 10. Future Enhancements

### Phase 2
- Visual rule builder
- Rule versioning
- A/B testing rules
- Rule analytics

### Phase 3
- AI-powered rule suggestions
- Automatic conflict detection
- Rule optimization
- Business process mining

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rule conflicts | High | Conflict detection system |
| Performance with many rules | Medium | Rule caching and indexing |
| Complex rule debugging | Medium | Rule testing framework |

---

*PRD Version: 1.0.0*
*Status: Identified need, not built*
*Priority: HIGH - Critical for proper separation of concerns*