# Rule Authoring Workbench - Product Requirements Document
## The Power User's Heavy-Lifting Interface

### Document Information
- **Version**: 1.0.0
- **Date**: 2025-08-25
- **Author**: Pipeline Team
- **Status**: Design Specification
- **Component of**: Business Rule Management System (BRMS)

---

## 1. Executive Summary

### Purpose
The Rule Authoring Workbench is the professional interface where power users build the foundational rule framework that powers the entire Business Rule Management System. This is where the "heavy lifting" happens - creating the 80-90% of rules that will be used across all projects.

### Key Innovation
A three-column layout that provides complete visibility and control:
- Column 1: Entity attributes (navigation)
- Column 2: Auto-generated and template rules (review/accept)
- Column 3: Custom rule creation (author new rules)

### Target User
Technical power users who understand both the business domain and rule logic, responsible for building the rule foundation.

---

## 2. Generic Rule Definition

### 2.1 Core Rule Structure
```typescript
interface BusinessRule {
  // Identity
  id: string;                    // AUTO-001, TMPL-001, CUS-001
  version: string;               // 1.0.0
  type: RuleType;                // See section 2.2
  source: 'generated' | 'template' | 'custom';
  
  // Context
  entity: string;                // Account
  attribute: string;             // accountType
  module?: string;               // Accounts Module
  
  // Rule Logic
  trigger?: TriggerCondition;    // When rule fires
  condition?: Expression;        // What must be true
  action: Action;               // What happens
  exception?: Expression;        // Override conditions
  
  // Metadata
  priority: number;              // 1-1000 (execution order)
  active: boolean;               // Enabled/disabled
  message?: string;              // User-facing message
  description?: string;          // Internal documentation
  tags?: string[];               // Categorization
  
  // Audit
  createdBy: string;
  createdAt: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
}
```

### 2.2 Rule Types
```typescript
enum RuleType {
  // Data Integrity Rules
  VALIDATION = 'validation',         // Data correctness
  FORMAT = 'format',                 // Pattern matching
  CONSTRAINT = 'constraint',         // Min/max/length/unique
  
  // Business Logic Rules
  CONDITIONAL = 'conditional',       // If-then logic
  CALCULATION = 'calculation',       // Computed values
  DERIVATION = 'derivation',        // Derived fields
  
  // Process Control Rules
  WORKFLOW = 'workflow',             // State transitions
  AUTHORIZATION = 'authorization',   // Permissions
  AUTOMATION = 'automation',         // Triggered actions
  
  // Data Relationship Rules
  DEPENDENCY = 'dependency',         // Prerequisites
  CASCADE = 'cascade',              // Propagation
  REFERENCE = 'reference'           // Foreign keys
}
```

### 2.3 Rule Components by Type

#### Validation Rule
```javascript
{
  type: 'validation',
  attribute: 'email',
  action: {
    validator: 'required',
    message: 'Email is required'
  }
}
```

#### Format Rule
```javascript
{
  type: 'format',
  attribute: 'phone',
  action: {
    pattern: '^\\d{3}-\\d{3}-\\d{4}$',
    message: 'Phone must be XXX-XXX-XXXX format'
  }
}
```

#### Conditional Rule
```javascript
{
  type: 'conditional',
  attribute: 'creditLimit',
  condition: "accountType === 'Enterprise'",
  action: {
    set: { creditLimit: 100000 },
    require: ['taxId', 'dunsNumber']
  }
}
```

#### Calculation Rule
```javascript
{
  type: 'calculation',
  attribute: 'totalAmount',
  trigger: ['subtotal', 'taxRate', 'discount'],
  action: {
    formula: 'subtotal * (1 + taxRate) - discount'
  }
}
```

#### Workflow Rule
```javascript
{
  type: 'workflow',
  attribute: 'status',
  action: {
    states: {
      'Draft': {
        transitions: ['Submitted', 'Cancelled'],
        onExit: 'validateDraft'
      },
      'Submitted': {
        transitions: ['Approved', 'Rejected'],
        onEnter: 'notifyApprover'
      }
    }
  }
}
```

---

## 3. Interface Design

### 3.1 Three-Column Layout
```
┌───────────────────────────────────────────────────────────────────────┐
│ Rule Authoring Workbench - [Entity Name]                      □ ─ X  │
├───────────────────────────────────────────────────────────────────────┤
│ Industry: [Services ▼] Module: [Accounts ▼] Entity: [Account ▼]      │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ATTRIBUTES (1)      GENERATED RULES (2)     CUSTOM RULES (3)        │
│  ──────────────     ───────────────────     ─────────────────       │
│                                                                        │
│  ┌──────────────┐   ┌───────────────────┐   ┌───────────────────┐   │
│  │              │   │                   │   │                   │   │
│  │  Attribute   │   │  Rule Cards       │   │  Rule Builder     │   │
│  │  Tree View   │   │  for Selected     │   │  & Custom Rules   │   │
│  │              │   │  Attribute        │   │                   │   │
│  └──────────────┘   └───────────────────┘   └───────────────────┘   │
│                                                                        │
│  Status Bar: 47 attributes | 126 rules (89 auto, 23 template, 14 custom)
└───────────────────────────────────────────────────────────────────────┘
```

### 3.2 Column 1: Attribute Navigator
```
┌─────────────────────┐
│ ATTRIBUTES          │
├─────────────────────┤
│ 🔍 [Search____]     │
├─────────────────────┤
│ ▼ Basic Info    (8) │
│   • accountId   [3] │
│   ▶ accountName [4] │
│   • accountType [6] │
│   • status     [5] │
│                     │
│ ▼ Contact      (5) │
│   • email      [3] │
│   • phone      [3] │
│   • address    [2] │
│                     │
│ ▶ Financial    (6) │
│ ▶ Operational  (4) │
│ ▶ Metadata     (3) │
│                     │
│ [Expand All]        │
└─────────────────────┘

Legend:
▼/▶ = Expanded/Collapsed
(n) = Attribute count
[n] = Rule count
• = Selected attribute
```

### 3.3 Column 2: Generated Rules Display
```
┌────────────────────────┐
│ Rules for: accountName │
├────────────────────────┤
│ Filter: [All Types ▼]  │
├────────────────────────┤
│                        │
│ ┌────────────────────┐ │
│ │ ✓ AUTO-VAL-001  🔧 │ │
│ │ VALIDATION          │ │
│ │ Required field      │ │
│ │ "Cannot be empty"   │ │
│ │ [Edit] [Disable]    │ │
│ └────────────────────┘ │
│                        │
│ ┌────────────────────┐ │
│ │ ✓ AUTO-FMT-001  🔧 │ │
│ │ FORMAT              │ │
│ │ Max length: 100     │ │
│ │ "Too long"          │ │
│ │ [Edit] [Disable]    │ │
│ └────────────────────┘ │
│                        │
│ ┌────────────────────┐ │
│ │ ⚠ TMPL-BUS-001  🔧 │ │
│ │ CONDITIONAL         │ │
│ │ Industry template   │ │
│ │ "Naming convention" │ │
│ │ [Review] [Accept]   │ │
│ └────────────────────┘ │
│                        │
│ [Bulk Actions ▼]       │
└────────────────────────┘
```

### 3.4 Column 3: Custom Rule Builder
```
┌────────────────────────┐
│ Custom Rules           │
├────────────────────────┤
│ + New Rule             │
│ ────────────────────── │
│ Type: [Conditional ▼]  │
│                        │
│ Name: [___________]    │
│                        │
│ When (trigger):        │
│ [onChange ▼]           │
│                        │
│ If (condition):        │
│ [_______________]      │
│                        │
│ Then (action):         │
│ [_______________]      │
│                        │
│ Unless (exception):    │
│ [_______________]      │
│                        │
│ Message:               │
│ [_______________]      │
│                        │
│ [Test] [Save] [Clear]  │
├────────────────────────┤
│ Existing Custom (2)    │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ CUS-BUS-001    🔧  │ │
│ │ VIP Benefits       │ │
│ │ [Edit] [Delete]    │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ CUS-CAL-001    🔧  │ │
│ │ Loyalty Discount   │ │
│ │ [Edit] [Delete]    │ │
│ └────────────────────┘ │
└────────────────────────┘
```

---

## 4. Functional Requirements

### 4.1 Attribute Management
- **F1.1**: Display all entity attributes in hierarchical tree
- **F1.2**: Show rule count per attribute
- **F1.3**: Group attributes by category
- **F1.4**: Search/filter attributes
- **F1.5**: Expand/collapse groups

### 4.2 Rule Display
- **F2.1**: Show all rules for selected attribute
- **F2.2**: Differentiate rule sources (auto/template/custom)
- **F2.3**: Display rule type with visual indicators
- **F2.4**: Show rule status (active/disabled/needs-review)
- **F2.5**: Provide quick actions per rule

### 4.3 Rule Creation
- **F3.1**: Context-aware rule builder
- **F3.2**: Rule type selection
- **F3.3**: Condition expression builder
- **F3.4**: Action definition interface
- **F3.5**: Real-time validation

### 4.4 Rule Operations
- **F4.1**: Edit existing rules
- **F4.2**: Enable/disable rules
- **F4.3**: Delete custom rules
- **F4.4**: Accept/reject template rules
- **F4.5**: Bulk operations

### 4.5 Testing & Validation
- **F5.1**: Test individual rules
- **F5.2**: Test rule combinations
- **F5.3**: Provide sample data input
- **F5.4**: Show execution path
- **F5.5**: Identify conflicts

---

## 5. User Interactions

### 5.1 Workflow: Review and Accept Generated Rules
```
1. Select entity from dropdown
2. Click attribute in Column 1
3. Review generated rules in Column 2
4. For each template rule (yellow):
   - Click [Review]
   - Modify if needed
   - Click [Accept] or [Reject]
5. Bulk accept all reviewed rules
```

### 5.2 Workflow: Create Custom Rule
```
1. Select attribute in Column 1
2. Click "+ New Rule" in Column 3
3. Select rule type from dropdown
4. Fill in rule details:
   - Name/identifier
   - Trigger condition
   - Logic expression
   - Action definition
5. Click [Test] to validate
6. Click [Save] to add to system
```

### 5.3 Workflow: Modify Existing Rule
```
1. Locate rule in Column 2 or 3
2. Click [Edit] on rule card
3. Rule expands to edit mode
4. Modify fields
5. Click [Test] to revalidate
6. Click [Save] or [Cancel]
```

---

## 6. Visual Design Specifications

### 6.1 Color Scheme (Monochrome + Accents)
```css
/* Base Colors */
--background: #000000;
--surface: #111111;
--border: #333333;
--text-primary: #FFFFFF;
--text-secondary: #999999;

/* Status Colors */
--active: #00FF00;      /* Green - Active rules */
--warning: #FFFF00;     /* Yellow - Needs review */
--custom: #00FFFF;      /* Cyan - Custom rules */
--disabled: #666666;    /* Gray - Disabled */
--error: #FF0000;       /* Red - Conflicts */
```

### 6.2 Rule Card Design
```
┌─────────────────────┐
│ [✓] CODE-001   [🔧] │  Status icon | Rule ID | Config icon
│ ───────────────────│  Separator line
│ RULE TYPE           │  Rule type in caps
│                     │  
│ Brief description   │  One-line description
│ "User message"      │  User-facing message in quotes
│                     │
│ [Action] [Action]   │  Context-appropriate actions
└─────────────────────┘
```

### 6.3 Typography
```css
/* Fonts */
--font-primary: 'Monaco', 'Consolas', monospace;
--font-size-small: 11px;
--font-size-normal: 12px;
--font-size-large: 14px;

/* Weights */
--font-weight-normal: 400;
--font-weight-bold: 700;
```

---

## 7. Technical Requirements

### 7.1 Performance
- **Load time**: < 2 seconds for 1000 rules
- **Search response**: < 100ms
- **Rule save**: < 500ms
- **Test execution**: < 1 second

### 7.2 Data Handling
- **Auto-save**: Every 30 seconds
- **Undo/Redo**: Last 50 operations
- **Import/Export**: JSON, YAML formats
- **Version control**: Track all changes

### 7.3 Keyboard Shortcuts
```
Ctrl+N     - New rule
Ctrl+S     - Save current
Ctrl+T     - Test rule
Ctrl+D     - Duplicate rule
Ctrl+/     - Toggle disable
Delete     - Delete rule (custom only)
Tab        - Navigate columns
↑/↓        - Navigate attributes
Enter      - Select/Edit
Esc        - Cancel operation
```

---

## 8. Integration Points

### 8.1 With Rule Generation Engine
```javascript
// Receive auto-generated rules
const generated = RuleEngine.generateForEntity(entity);
workbench.displayGenerated(generated);
```

### 8.2 With Template System
```javascript
// Load industry templates
const templates = TemplateSystem.getForIndustry('services');
workbench.displayTemplates(templates);
```

### 8.3 With Gap Analyzer
```javascript
// Highlight gaps
const gaps = GapAnalyzer.analyze(entity, rules);
workbench.highlightMissingRules(gaps);
```

### 8.4 With Business Rule Configurator
```javascript
// Export for stakeholder use
const package = workbench.packageRules();
configurator.importFoundation(package);
```

---

## 9. User Experience Considerations

### 9.1 Information Density
- Maximize visible information
- Minimal whitespace
- Compact card design
- No unnecessary graphics

### 9.2 Efficiency Features
- Keyboard-driven navigation
- Bulk operations
- Quick filters
- Instant search
- Auto-complete

### 9.3 Power User Features
- Regular expression support
- Formula builder
- Code view toggle
- Advanced search
- Macro recording

---

## 10. Success Metrics

### Quantitative
- Create 50+ rules per hour
- Review 200+ generated rules per hour
- Less than 3 clicks per operation
- Zero syntax errors in created rules

### Qualitative
- Power users prefer this over manual coding
- Complete rule coverage achieved
- Consistent rule quality
- Reduced cognitive load

---

## 11. Future Enhancements

### Phase 2
- AI-powered rule suggestions
- Conflict detection and resolution
- Rule dependency visualization
- Performance profiling

### Phase 3
- Collaborative editing
- Rule versioning and rollback
- A/B testing framework
- Machine learning optimization

---

## 12. Acceptance Criteria

### MVP Requirements
- [ ] Three-column layout functional
- [ ] Display all entity attributes
- [ ] Show generated rules
- [ ] Create custom rules
- [ ] Save and load rules
- [ ] Basic testing capability

### Full Release Requirements
- [ ] All rule types supported
- [ ] Complete keyboard navigation
- [ ] Bulk operations working
- [ ] Import/export functional
- [ ] Gap analysis integrated
- [ ] Performance targets met

---

## Appendix A: Sample Rule Definitions

### Auto-Generated Validation Rule
```json
{
  "id": "AUTO-VAL-001",
  "type": "validation",
  "source": "generated",
  "entity": "Account",
  "attribute": "accountName",
  "action": {
    "validator": "required",
    "message": "Account name is required"
  },
  "priority": 100,
  "active": true
}
```

### Template Business Rule
```json
{
  "id": "TMPL-BUS-001",
  "type": "conditional",
  "source": "template",
  "entity": "Account",
  "attribute": "accountType",
  "condition": "accountType === 'Enterprise'",
  "action": {
    "set": {
      "creditLimit": 100000,
      "paymentTerms": "NET30"
    }
  },
  "priority": 200,
  "active": false,
  "requiresReview": true
}
```

### Custom Calculation Rule
```json
{
  "id": "CUS-CAL-001",
  "type": "calculation",
  "source": "custom",
  "entity": "Account",
  "attribute": "loyaltyDiscount",
  "trigger": ["accountAge", "totalPurchases"],
  "action": {
    "formula": "min(0.2, accountAge * 0.01 + totalPurchases / 100000)"
  },
  "priority": 300,
  "active": true,
  "description": "Calculate loyalty discount based on age and purchase history"
}
```

---

## Appendix B: Keyboard Navigation Map

```
┌─────────────────────────────────────────┐
│         TAB →        TAB →              │
│    ┌─────────┐  ┌──────────┐  ┌──────┐ │
│    │ Col 1   │  │  Col 2   │  │ Col 3│ │
│    │   ↕     │  │    ↕     │  │   ↕  │ │
│    │ ↑↓ Nav  │  │ ↑↓ Scroll│  │ Tab  │ │
│    │ Enter   │  │ Enter    │  │ Fields│ │
│    │ Select  │  │ Edit     │  │      │ │
│    └─────────┘  └──────────┘  └──────┘ │
│                                         │
│    Esc = Cancel/Back                    │
│    Ctrl+S = Save                        │
│    Delete = Delete (if allowed)         │
└─────────────────────────────────────────┘
```

---

*End of PRD - Rule Authoring Workbench v1.0*

*"Where the heavy lifting happens - efficiently, visually, powerfully"*