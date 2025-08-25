# ViewForge Transformation Example
*From Current v3 to New Simplified Format*

## Current ViewForge v3 Format
```javascript
// From v3-app.js
const accountListView = {
  entity: 'Account',
  title: 'Account List',
  type: 'table',
  settings: {
    pageSize: 25,
    sortable: true,
    filterable: true
  },
  fields: [
    { name: 'accountName', label: 'Account Name', type: 'text', sortable: true },
    { name: 'status', label: 'Status', type: 'enum', options: ['Active', 'Inactive'] },
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'annualRevenue', label: 'Annual Revenue', type: 'currency' },
    { name: 'primaryContact.name', label: 'Primary Contact', type: 'relationship' }
  ],
  actions: ['view', 'edit', 'delete'],
  rowClick: 'view'
};
```

## Problems with Current Format
1. **Mixed Concerns** - UI settings mixed with data definitions
2. **Type Duplication** - Field types should come from BUSM
3. **No Clear Navigation** - "rowClick: 'view'" is vague
4. **Options in Wrong Place** - Enum options belong in BUSM

## New Simplified Format
```json
{
  "id": "account-list",
  "type": "list",
  "entity": "Account",
  "title": "Account List",
  
  "display": {
    "fields": [
      {
        "path": "accountName",
        "label": "Account Name",
        "sortable": true,
        "clickable": true
      },
      {
        "path": "status",
        "label": "Status"
      },
      {
        "path": "industry",
        "label": "Industry"
      },
      {
        "path": "annualRevenue",
        "label": "Annual Revenue",
        "sortable": true
      },
      {
        "path": "primaryContact.name",
        "label": "Primary Contact",
        "clickable": true
      }
    ],
    "actions": ["view", "edit", "delete"]
  },
  
  "navigation": {
    "onRowClick": {
      "target": "account-detail",
      "params": ["accountId"]
    },
    "onFieldClick": {
      "primaryContact.name": {
        "target": "contact-detail",
        "params": ["primaryContact.contactId"]
      }
    },
    "onActionClick": {
      "view": {
        "target": "account-detail",
        "params": ["accountId"]
      },
      "edit": {
        "target": "account-form",
        "mode": "edit",
        "params": ["accountId"]
      },
      "delete": {
        "confirm": true,
        "action": "deleteAccount",
        "params": ["accountId"]
      }
    }
  },
  
  "dataSource": {
    "entity": "Account",
    "includes": ["primaryContact"],
    "orderBy": "accountName",
    "limit": 25
  }
}
```

## What Gets Pulled from BUSM

```javascript
// BUSM already has this information
const busmAccount = {
  accountId: { type: 'uuid', primaryKey: true },
  accountName: { type: 'string', required: true, maxLength: 100 },
  status: { 
    type: 'enum', 
    options: ['Active', 'Inactive', 'Prospect'],
    default: 'Active'
  },
  industry: { type: 'string', maxLength: 50 },
  annualRevenue: { type: 'decimal', precision: 15, scale: 2 },
  primaryContactId: { type: 'uuid', foreignKey: 'Contact.contactId' }
};

// Relationships already defined
const relationships = {
  primaryContact: {
    type: 'one-to-one',
    from: 'Account.primaryContactId',
    to: 'Contact.contactId'
  }
};
```

## Gap Logger in Action

```javascript
function processViewForgeConfig(config) {
  const gaps = [];
  
  // Check each field
  config.display.fields.forEach(field => {
    // Check if field exists in BUSM
    if (!busm.hasField(config.entity, field.path)) {
      gapLogger.log({
        category: 'MISSING_FIELD',
        entity: config.entity,
        field: field.path,
        expected: 'Field definition in BUSM',
        found: 'none',
        assumption: 'Skipping field',
        impact: 'HIGH',
        suggestedFix: `Add ${field.path} to BUSM entity ${config.entity}`
      });
    }
    
    // Check if relationship navigation defined
    if (field.path.includes('.')) {
      const relationshipName = field.path.split('.')[0];
      if (!config.navigation.onFieldClick?.[field.path]) {
        gapLogger.log({
          category: 'MISSING_NAVIGATION',
          entity: config.entity,
          field: field.path,
          expected: 'Navigation rule for relationship field',
          assumption: `Navigate to ${relationshipName}-detail`,
          impact: 'MEDIUM',
          suggestedFix: 'Add explicit navigation rule'
        });
      }
    }
  });
  
  return gaps;
}
```

## Generator Usage Example

### Concept Line (HTML)
```javascript
function generateFromViewForge(viewConfig) {
  const busm = loadBUSM();
  const entity = busm.entities[viewConfig.entity];
  
  // Simple HTML structure
  let html = `<div class="concept-view">
    <h1>${viewConfig.title}</h1>
    <table>`;
  
  // Generate header
  html += '<thead><tr>';
  viewConfig.display.fields.forEach(field => {
    html += `<th>${field.label}</th>`;
  });
  html += '<th>Actions</th></tr></thead>';
  
  // Generate sample rows
  html += '<tbody>';
  for (let i = 0; i < 5; i++) {
    html += '<tr>';
    viewConfig.display.fields.forEach(field => {
      if (field.clickable) {
        html += `<td><a href="#" onclick="navigate('${field.path}')">[${field.label} ${i}]</a></td>`;
      } else {
        html += `<td>[${field.label} ${i}]</td>`;
      }
    });
    html += '<td>';
    viewConfig.display.actions.forEach(action => {
      html += `<button onclick="action('${action}')">${action}</button> `;
    });
    html += '</td></tr>';
  }
  html += '</tbody></table></div>';
  
  return html;
}
```

### Prototype Line (React)
```javascript
function generateReactFromViewForge(viewConfig) {
  const busm = loadBUSM();
  const entity = busm.entities[viewConfig.entity];
  
  // Get type information from BUSM
  const fieldTypes = {};
  viewConfig.display.fields.forEach(field => {
    const fieldDef = busm.getFieldDefinition(viewConfig.entity, field.path);
    fieldTypes[field.path] = fieldDef?.type || 'string';
  });
  
  // Generate React component with proper types
  return generateReactComponent({
    name: `${viewConfig.entity}ListView`,
    fields: viewConfig.display.fields,
    fieldTypes: fieldTypes,
    navigation: viewConfig.navigation,
    actions: viewConfig.display.actions
  });
}
```

## Benefits of Transformation

1. **Cleaner ViewForge** - Only defines view structure and navigation
2. **BUSM as Source** - Types, constraints, relationships from BUSM
3. **Clear Navigation** - Explicit rules for every click
4. **Gap Discovery** - Know exactly what's missing
5. **Progressive Enhancement** - Each line adds more capability

---

*This transformation makes ViewForge do ONE thing well: define wireframe structure and navigation*