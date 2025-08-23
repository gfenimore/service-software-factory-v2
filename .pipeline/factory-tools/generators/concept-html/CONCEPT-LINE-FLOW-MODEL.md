# Concept Line Flow Model
*From Configuration to Clickable Wireframes*

## Text Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CONCEPT LINE FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

INPUT SOURCES:
═══════════════════════════════════════════════════════════════════════

[ViewForge v3 Config]                    [BUSM Data]
    account-list.json                    busm-model.json
         │                                     │
         │  ┌──────────────────────────────────┤
         │  │                                  │
         ▼  ▼                                  ▼
┌──────────────────────┐            ┌──────────────────────┐
│ ViewForge            │◄───────────│ BUSM Reader          │
│ Transformer          │            │                      │
│                      │            │ - Entity definitions │
│ Transforms v3 format │            │ - Field types        │
│ to simplified output │            │ - Relationships      │
│                      │            │ - Constraints        │
└──────────┬───────────┘            └──────────────────────┘
           │
           │ Simplified ViewForge Config
           │ {
           │   "id": "account-list",
           │   "type": "list",
           │   "entity": "Account",
           │   "display": {...},
           │   "navigation": {...}
           │ }
           │
           ▼
┌──────────────────────┐            ┌──────────────────────┐
│ Gap Logger           │◄───────────│ Gap Discovery        │
│                      │            │                      │
│ Logs missing info:   │            │ - Missing labels     │
│ - Navigation rules   │            │ - Missing navigation │
│ - Display hints      │            │ - Missing validation │
│ - Sort preferences   │            │ - Assumed defaults   │
└──────────┬───────────┘            └──────────────────────┘
           │
           │ Gap Report
           │ gaps.json
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ Concept Generator V2                                     │
│                                                           │
│ ┌───────────────┐  ┌────────────────┐  ┌──────────────┐│
│ │ View Router   │──►│ View Generator │──►│ HTML Builder ││
│ │               │  │                │  │              ││
│ │ - List view   │  │ - Sample data  │  │ - Styles     ││
│ │ - Detail view │  │ - Field render │  │ - Scripts    ││
│ │ - Form view   │  │ - Navigation   │  │ - Layout     ││
│ └───────────────┘  └────────────────┘  └──────────────┘│
└──────────────────────────────────────────────────────────┘
           │
           │
           ▼
═══════════════════════════════════════════════════════════════════════
OUTPUT FILES:
═══════════════════════════════════════════════════════════════════════

    .pipeline/generated/concept/
    ├── account-list.html     (Clickable table with navigation)
    ├── account-detail.html   (Detail view with field display)
    ├── account-form.html     (Interactive form wireframe)
    └── gap-report.json       (Missing information log)
```

## Component Details

### 1. ViewForge Transformer
**File:** `viewforge-transformer.js`
**Input:** ViewForge v3 configuration (JSON)
**Output:** Simplified wireframe configuration
**Purpose:** Convert complex configs to "what to show, where to click"

```javascript
// Input Example
{
  entity: 'Account',
  type: 'table',
  fields: [{name: 'accountName', type: 'text'}]
}

// Output Example  
{
  id: 'account-table',
  type: 'list',
  display: {
    fields: [{path: 'accountName', label: 'Account Name'}]
  },
  navigation: {
    onRowClick: {target: 'account-detail'}
  }
}
```

### 2. BUSM Reader
**File:** Built into transformer/generator
**Input:** BUSM model definition
**Output:** Entity metadata, relationships, field types
**Purpose:** Provide data structure information

```javascript
// Provides
{
  entities: {Account: {...}},
  relationships: {'Account.primaryContact': {...}},
  getEntity(), getField(), getRelationship()
}
```

### 3. Gap Logger
**File:** `gap-logger.js` (integration)
**Input:** Missing information during processing
**Output:** Gap report (JSON/console)
**Purpose:** Track what's missing for continuous improvement

```javascript
// Logs entries like
{
  category: 'MISSING_NAVIGATION',
  entity: 'Account',
  field: 'primaryContact',
  assumption: 'Click navigates to contact-detail',
  suggestedFix: 'Add navigation rule to ViewForge'
}
```

### 4. Concept Generator V2
**File:** `concept-generator-v2.js`
**Input:** Simplified ViewForge config + BUSM data
**Output:** HTML wireframes
**Purpose:** Generate clickable wireframes for workflow validation

#### Sub-components:

**4.1 View Router**
- Determines which view type to generate (list/detail/form)
- Routes to appropriate generator method

**4.2 View Generator**
- Generates sample data
- Renders fields according to type
- Adds navigation handlers
- Creates interactive elements

**4.3 HTML Builder**
- Adds CSS styles (inline)
- Adds JavaScript (navigation/actions)
- Structures complete HTML document
- Makes wireframe interactive

## Data Flow Example

### Step 1: ViewForge Config (Original)
```json
{
  "entity": "Account",
  "type": "table",
  "fields": [
    {"name": "accountName", "label": "Account Name"},
    {"name": "primaryContact.name", "label": "Primary Contact"}
  ],
  "rowClick": "view"
}
```

### Step 2: Transformation
```
ViewForge Transformer reads config
→ Detects relationship field (primaryContact.name)
→ Queries BUSM for relationship details
→ Logs gap if relationship undefined
→ Outputs simplified config with navigation
```

### Step 3: Simplified Config
```json
{
  "id": "account-table",
  "type": "list",
  "navigation": {
    "onRowClick": {"target": "account-detail"},
    "onFieldClick": {
      "primaryContact.name": {"target": "contact-detail"}
    }
  }
}
```

### Step 4: Generation
```
Concept Generator receives config
→ Routes to generateListView()
→ Creates 5 sample Account records
→ Builds HTML table with clickable rows
→ Adds navigation JavaScript
→ Outputs complete HTML file
```

### Step 5: Final Output
```html
<!DOCTYPE html>
<html>
<head>
  <title>Account List - Concept</title>
  <style>/* Wireframe styles */</style>
</head>
<body>
  <table>
    <tr onclick="navigateToView('account-detail', 'account-1')">
      <td>Sample Account 1</td>
      <td><a onclick="navigateToView('contact-detail')">John Doe</a></td>
    </tr>
  </table>
  <script>
    function navigateToView(target, id) {
      alert('Navigate to: ' + target);
    }
  </script>
</body>
</html>
```

## Files Generated

| File | Size | Purpose |
|------|------|---------|
| `account-list.html` | ~12KB | Clickable table view with sorting, pagination |
| `account-detail.html` | ~8KB | Detail view with all fields displayed |
| `account-form.html` | ~8KB | Interactive form with input fields |
| `gap-report.json` | ~2KB | Log of missing information and assumptions |

## Key Design Principles

1. **Single Responsibility** - Each component does one thing
2. **Data Flow** - Unidirectional transformation pipeline
3. **Gap Discovery** - Log everything missing
4. **Progressive Enhancement** - Start simple, add complexity
5. **Validation Focus** - Wireframes for workflow testing

## Success Metrics

- ✅ All navigation paths clickable
- ✅ Sample data displays correctly
- ✅ Forms are interactive (but don't submit)
- ✅ Gaps logged for improvement
- ✅ No external dependencies (pure HTML/CSS/JS)

---

*This flow model shows how the Concept Line transforms configuration into clickable wireframes for workflow validation*