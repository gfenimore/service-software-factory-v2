# Business Rules Configurator v1 - User Experience Design
*How You'll Actually Define and See Business Rules*

## The User Journey

### Step 1: Starting with BUSM
You have your BUSM with pure data structure:
```json
{
  "Account": {
    "accountId": { "type": "uuid" },
    "accountName": { "type": "string", "maxLength": 100 },
    "status": { "type": "enum", "options": ["Draft", "Active", "Suspended"] },
    "accountType": { "type": "enum", "options": ["Standard", "Premium", "Enterprise"] },
    "annualRevenue": { "type": "decimal" }
  }
}
```

### Step 2: Creating Business Rules
You run: `npm run rules:create Account`

The tool asks you questions interactively:

```
🏭 Business Rules Configurator v1
Creating rules for: Account

1. VALIDATION RULES
==================
Which fields are required? (space to select, enter to continue)
❯ ◉ accountName
  ◯ status
  ◉ accountType
  ◯ annualRevenue

Should accountName be unique? (Y/n): Y

Add validation pattern for accountName? (regex or skip): skip

2. STATE TRANSITIONS
====================
Does Account have state transitions? (Y/n): Y

Current states from BUSM: [Draft, Active, Suspended]

From "Draft", which states are allowed?
❯ ◉ Active
  ◯ Suspended

From "Active", which states are allowed?
❯ ◉ Suspended
  ◯ Draft

From "Suspended", which states are allowed?
❯ ◉ Active
  ◯ Draft

3. CONDITIONAL RULES
====================
Any fields required based on conditions? (Y/n): Y

Add condition: When accountType = "Enterprise"
Which fields become required?
❯ ◉ annualRevenue
  ◯ status

4. BUSINESS LOGIC
=================
Add onCreate rules? (Y/n): Y
What should happen on create?
❯ ◉ Set status to "Draft"
  ◉ Generate account number
  ◯ Send notification

Add onDelete rules? (Y/n): Y
What should prevent deletion?
❯ ◉ Has related Opportunities
  ◉ Has open Invoices
  ◯ Created within 30 days
```

### Step 3: Rules Output
The tool generates `account-rules.json`:

```json
{
  "entity": "Account",
  "version": "1.0.0",
  "created": "2025-01-23",
  
  "validation": {
    "required": ["accountName", "accountType"],
    "unique": ["accountName"],
    "patterns": {},
    "custom": []
  },
  
  "states": {
    "transitions": {
      "Draft": ["Active"],
      "Active": ["Suspended"],
      "Suspended": ["Active"]
    },
    "initial": "Draft",
    "final": []
  },
  
  "conditional": {
    "accountType_Enterprise": {
      "when": "accountType === 'Enterprise'",
      "require": ["annualRevenue"]
    }
  },
  
  "logic": {
    "onCreate": [
      { "action": "setState", "value": "Draft" },
      { "action": "generateField", "field": "accountNumber", "format": "ACC-{YYYY}-{0000}" }
    ],
    "onDelete": [
      { "condition": "hasRelated('Opportunity')", "prevent": true, "message": "Cannot delete account with opportunities" },
      { "condition": "hasRelated('Invoice', 'status=Open')", "prevent": true, "message": "Cannot delete account with open invoices" }
    ]
  }
}
```

## How It Shows in Each Line

### Concept Line - Subtle Rule Hints (Your Idea!)
I love your suggestion! We could show rules as **visual hints** without functionality:

```html
<!-- Account List View -->
<table>
  <tr>
    <td>Acme Corp</td>
    <td>
      <span class="status-badge" title="Can transition to: Active">
        Draft → 
      </span>
    </td>
    <td>
      <button disabled title="Cannot delete: Has 3 opportunities">
        🗑 Delete (blocked)
      </button>
    </td>
  </tr>
</table>

<!-- Account Form -->
<form>
  <label>Account Name <span class="required">*</span></label>
  <input placeholder="Required, must be unique">
  
  <label>Account Type <span class="required">*</span></label>
  <select>
    <option>Standard</option>
    <option>Enterprise (requires revenue)</option>
  </select>
  
  <div class="conditional-hint">
    ℹ️ Selecting "Enterprise" will require Annual Revenue
  </div>
</form>
```

### Prototype Line - Interactive Rules
```jsx
// Full validation and state management
<AccountForm>
  {accountType === 'Enterprise' && !annualRevenue && (
    <Alert>Annual Revenue is required for Enterprise accounts</Alert>
  )}
  
  <StateTransition 
    current={status}
    allowed={['Active']}
    onTransition={handleTransition}
  />
</AccountForm>
```

### Production Line - Enforced Rules
```vue
// Backend validates all rules
// Frontend shows real-time feedback
// Database constraints enforce uniqueness
```

## The v1 Tool Interface Options

### Option A: Interactive CLI (Shown Above)
**Pros:** 
- Guided experience
- Hard to miss anything
- Good for first-time setup

**Cons:**
- Slow for many entities
- Hard to review all rules at once

### Option B: Visual Rules Editor (Web UI)
```
┌─────────────────────────────────────────┐
│ Account Rules                     [Save] │
├─────────────────────────────────────────┤
│ ▼ Validation                            │
│   ☑ accountName (required, unique)     │
│   ☐ status                             │
│   ☑ accountType (required)             │
│                                         │
│ ▼ State Transitions                    │
│   Draft ──→ Active                     │
│   Active ──→ Suspended                 │
│   Suspended ──→ Active                 │
│                                         │
│ ▼ Conditional Rules                    │
│   IF accountType = "Enterprise"        │
│   THEN require: annualRevenue          │
│                                         │
│ [+ Add Rule]                           │
└─────────────────────────────────────────┘
```

**Pros:**
- See everything at once
- Drag-drop state diagram
- Visual relationships

**Cons:**
- Need to build UI
- More complex for v1

### Option C: YAML Configuration (Manual)
```yaml
# account-rules.yaml
entity: Account
validation:
  required: [accountName, accountType]
  unique: [accountName]

states:
  Draft: [Active]
  Active: [Suspended]
  Suspended: [Active]

conditional:
  - when: accountType == 'Enterprise'
    require: [annualRevenue]

logic:
  onCreate:
    - setState: Draft
    - generateAccountNumber: ACC-{YYYY}-{0000}
```

**Pros:**
- Quick to implement
- Version controllable
- Can edit in any editor

**Cons:**
- Easy to make syntax errors
- No guidance

## My Recommendation for v1

**Start with Option C (YAML) + Validation Tool:**

1. **Manual YAML creation** (fastest to build)
2. **Validation command** to check syntax
3. **Preview command** to see how rules will apply
4. **Show hints in Concept Line** (your great idea!)

```bash
# Workflow
npm run rules:validate account-rules.yaml
npm run rules:preview Account
npm run concept:generate --with-rule-hints
```

## Showing Rules in Concept Line

Your idea about showing rules in wireframes is brilliant! Here's how:

### Visual Indicators
```html
<!-- Required fields -->
<label>Account Name <span class="rule-hint required">*</span></label>

<!-- State transitions -->
<div class="state-indicator">
  Status: Draft 
  <span class="can-transition">→ Active</span>
</div>

<!-- Validation hints -->
<input placeholder="Required, unique, max 100 chars">

<!-- Conditional rules -->
<div class="conditional-notice">
  ⚠️ Enterprise accounts require additional fields
</div>

<!-- Prevented actions -->
<button class="action-blocked" disabled>
  Delete (Has dependencies)
</button>
```

### Benefits of Showing Rules in Concept
1. **Early validation** - Users see rules during wireframe review
2. **Clear expectations** - Know what's required before building
3. **Better feedback** - "Oh, we forgot about X validation"
4. **Smoother handoff** - Prototype already knows what to build

## Next Steps for v1

1. **Build YAML parser** for rules files
2. **Create validator** to check rule syntax
3. **Update Concept Generator** to show rule hints
4. **Create examples** for common patterns
5. **Document rule patterns**

What do you think? Should we start with YAML for v1 and add the visual hints to Concept?