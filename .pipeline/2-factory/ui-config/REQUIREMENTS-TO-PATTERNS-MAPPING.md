# Requirements to Pattern Configuration Mapping

## The Translation Flow

```
Requirements Spec → Extract Key Info → Select Pattern → Configure Fields → Generate UI
```

---

## Example: Master View Requirements → Pattern Configuration

### 1. Starting Point: Requirements Spec
From `1.1.1-master-view-spec.md`:

```markdown
### 1.1.1.1 US-004: Accounts Column
- Display all accounts with search/filter
- Show account type indicators (C/R/I)
- Visual status indicators (active/inactive)
- Click to load related locations
```

### 2. Extract Display Requirements

**What needs to be shown:**
- Account name (primary identifier)
- Account type (C/R/I indicators)
- Status (active/inactive)
- Clickable for navigation

**How many visible:**
- "50 accounts" mentioned in mock data
- Need high density

### 3. Pattern Selection Logic

```javascript
// In field-configuration.js
recommendPattern('account', viewportWidth, itemCount) {
  // 50 accounts = high density needed
  // Requirements say "all accounts" visible
  // → Choose COMPACT pattern (10+ items)
}
```

### 4. Field Configuration Translation

**Requirements → Configuration:**

```javascript
// Requirements say: "Show account type indicators (C/R/I)"
// This becomes:
getAccountCardConfig('compact') {
  fields: {
    title: 'AccountName',           // Main identifier
    badge: 'AccountStatus',          // Visual status indicator
    metadata: [
      'AccountType',                 // C/R/I indicator
      'BillingCity',                 // Added for context
      'ServiceLocationCount'         // Useful metric
    ]
  }
}
```

---

## Mapping Table: Requirements → Patterns

| Requirement | Pattern Decision | Configuration |
|------------|------------------|---------------|
| "Display all accounts" | Use `compact` pattern | 10+ items visible |
| "Show account type indicators (C/R/I)" | Add to `metadata` field | `AccountType` with formatting |
| "Visual status indicators" | Use `badge` slot | Color-coded badges |
| "Click to load related" | Add onClick handler | `selectAccount()` function |
| "Search/filter" | Add search input | Filters array dynamically |

---

## Another Example: Service Locations

### Requirements (US-006):
```markdown
- Display locations for selected account
- Show service status indicators
- Display next service date
- Click to load related work orders
```

### Pattern Configuration:
```javascript
getLocationCardConfig('list') {
  pattern: 'list',  // Medium density (8-12 items)
  fields: {
    avatar: { field: 'LocationType', format: 'icon' },  // Visual indicator
    primary: 'LocationName',                            // Main identifier
    secondary: 'ServiceAddress',                        // Context
    action: { 
      field: 'NextServiceDate',                        // Key date info
      format: 'date' 
    }
  }
}
```

---

## Decision Tree for Pattern Selection

```
How many items need to be visible?
├─ 10+ items → COMPACT pattern
├─ 8-12 items → LIST pattern
├─ 5-7 items → METRIC pattern
└─ 3-5 items → DATA pattern

What's the primary purpose?
├─ Quick scanning → COMPACT or LIST
├─ KPI monitoring → METRIC
└─ Detailed review → DATA
```

---

## Field Selection Rules

### 1. Primary Information (Always Include)
- Entity name/title
- Current status
- Key identifier

### 2. Context Information (Usually Include)
- Type/Category
- Location/Address
- Related counts

### 3. Action Information (When Relevant)
- Due dates
- Assigned person
- Priority level

---

## Practical Workflow

### Step 1: Read Requirements
Look for:
- **Nouns** → Fields to display
- **Verbs** → Actions/interactions
- **Numbers** → Density requirements
- **Adjectives** → Visual treatments

### Step 2: Create Configuration

```javascript
// Example: "Show urgent work orders with technician assignments"

getWorkOrderCardConfig() {
  pattern: 'list',  // "Show" = need visibility
  fields: {
    primary: 'Title',
    secondary: 'AssignedTechnician',  // "technician assignments"
    badge: {
      field: 'Priority',
      format: 'urgency-color'  // "urgent" = visual priority
    }
  }
}
```

### Step 3: Test & Adjust
1. Generate UI
2. Check against requirements
3. Adjust pattern or fields
4. Regenerate

---

## Configuration Decisions Map

### From Spec to Config:

| Spec Says | You Configure | Result |
|-----------|---------------|--------|
| "Display all accounts" | `pattern: 'compact'` | High density |
| "Show status" | `badge: 'Status'` | Colored badges |
| "With search" | Add search input | Filter capability |
| "Progressive disclosure" | onClick handlers | Navigation |
| "Quick actions" | Context menus | Right-click menu |
| "Color coding" | CSS classes | Visual feedback |

---

## Special Cases

### Multi-Value Fields
**Requirement:** "Show contact name and phone"
```javascript
secondary: {
  fields: ['ContactName', 'Phone'],
  format: '{{0}} • {{1}}'  // "John Doe • (555) 123-4567"
}
```

### Calculated Values
**Requirement:** "Show location count"
```javascript
metadata: [
  { field: 'ServiceLocations', format: '{{count}} locations' }
]
```

### Conditional Formatting
**Requirement:** "Highlight overdue items"
```javascript
badge: {
  field: 'DueDate',
  format: 'overdue-if-past'  // Red if past, normal otherwise
}
```

---

## Quick Reference: Requirements Keywords

| When Spec Says | Use This Pattern/Config |
|----------------|------------------------|
| "All", "List all" | `compact` pattern |
| "Details", "Full information" | `data` pattern |
| "Monitor", "KPIs", "Metrics" | `metric` pattern |
| "Browse", "Select from" | `list` pattern |
| "Status", "State" | `badge` field |
| "Type", "Category" | `metadata` field |
| "Primary", "Main" | `title` field |
| "Contact", "Assigned" | `secondary` field |

---

## The Magic Formula

```
Requirements Spec
    ↓
Extract: [Entities] [Fields] [Density] [Actions]
    ↓
Select: Pattern based on density
    ↓
Configure: Map fields to slots
    ↓
Generate: UI automatically created
```

---

## Your Turn!

When you have a requirement like:
> "I need to see all pending work orders with their priority and assigned technician"

We translate:
1. "all" → `compact` pattern (high density)
2. "pending" → filter by status
3. "priority" → `badge` field with color
4. "assigned technician" → `metadata` field

Result:
```javascript
getWorkOrderCardConfig('compact') {
  filter: wo => wo.Status === 'Pending',
  fields: {
    title: 'WorkOrderNumber',
    badge: { field: 'Priority', format: 'priority-color' },
    metadata: ['AssignedTechnician', 'DueDate']
  }
}
```

This is how we go from requirements → patterns → UI without mockups!