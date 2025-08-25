# ViewForge Output Specification
*What ViewForge Should Generate for the Factory*

## Purpose
ViewForge generates "clickable wireframes" for workflow validation. It defines:
1. **What to show** (fields, layout)
2. **Where clicks go** (navigation based on relationships)

Business logic comes from BUSM and Business Rules Configurator (future).

## Output Format

### Core Structure
```json
{
  "view": {
    "id": "account-list",
    "type": "list",
    "entity": "Account",
    "title": "Accounts",
    
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
          "label": "Status",
          "sortable": false
        },
        {
          "path": "primaryContact.name",
          "label": "Primary Contact",
          "clickable": true
        }
      ],
      "actions": ["create", "view", "edit", "delete"]
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
        "create": {
          "target": "account-form",
          "mode": "create"
        },
        "edit": {
          "target": "account-form",
          "mode": "edit",
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
}
```

### What ViewForge DOES Define

1. **View Identification**
   - Unique ID
   - View type (list, detail, form)
   - Target entity
   - Display title

2. **Field Display**
   - Which fields to show
   - Field labels
   - Field paths (including relationships)
   - Interactive properties (sortable, clickable)

3. **Navigation Rules**
   - Where clicks navigate
   - What parameters to pass
   - Based on entity relationships

4. **Data Requirements**
   - Which entity
   - Which relationships to include
   - Sort order
   - Pagination

### What ViewForge DOES NOT Define

1. **Business Rules** (from Business Rules Configurator)
   - Validation rules
   - Required fields
   - Conditional logic
   - State transitions

2. **Data Types** (from BUSM)
   - Field types
   - Constraints
   - Relationships
   - Primary keys

3. **UI Styling** (from Theme System)
   - Colors
   - Spacing
   - Typography
   - Component styles

4. **Implementation Details** (from Generators)
   - React components
   - State management
   - API calls
   - Error handling

## Navigation Based on Relationships

### Automatic Navigation Detection
```javascript
// ViewForge reads BUSM relationships and creates navigation
if (field.isRelationship) {
  navigation = {
    target: `${field.relatedEntity}-detail`,
    params: [field.foreignKey]
  };
}
```

### Example Navigations

#### One-to-One (Account → Primary Contact)
```json
{
  "onFieldClick": {
    "primaryContact.name": {
      "target": "contact-detail",
      "params": ["primaryContact.contactId"]
    }
  }
}
```

#### One-to-Many (Account → Opportunities)
```json
{
  "onFieldClick": {
    "opportunities.count": {
      "target": "opportunity-list",
      "filter": {"accountId": "{current.accountId}"}
    }
  }
}
```

#### Many-to-Many (Account → Products via Junction)
```json
{
  "onFieldClick": {
    "products.list": {
      "target": "product-list",
      "filter": {"accountProducts.accountId": "{current.accountId}"}
    }
  }
}
```

## Simplified ViewForge Configuration

### Before (Too Complex)
```json
{
  "rows": [
    {
      "columns": [
        {"field": "accountName", "width": 6},
        {"field": "status", "width": 3}
      ]
    }
  ],
  "features": {
    "sorting": true,
    "filtering": true
  }
}
```

### After (Simplified)
```json
{
  "view": "account-list",
  "type": "list",
  "entity": "Account",
  "display": ["accountName", "status", "primaryContact.name"],
  "actions": ["create", "view", "edit", "delete"]
}
```

The generator fills in the rest from BUSM and conventions.

## Gap Logging Integration

When ViewForge processes configuration, it logs gaps:

```javascript
// If no navigation defined for relationship
gapLogger.log({
  category: 'MISSING_NAVIGATION',
  entity: 'Account',
  field: 'primaryContact',
  expected: 'Navigation rule for relationship',
  assumption: 'Click navigates to contact-detail',
  suggestedFix: 'Add explicit navigation in ViewForge config'
});

// If no label defined
gapLogger.log({
  category: 'MISSING_LABEL',
  field: 'accountName',
  expected: 'Display label',
  assumption: 'Using field name as label',
  suggestedFix: 'Add label to ViewForge or BUSM'
});
```

## Usage in Generators

### Concept Line Generator
```javascript
function generateConceptView(viewConfig) {
  // Simple HTML - just structure
  const fields = viewConfig.display.fields;
  const navigation = viewConfig.navigation;
  
  return `
    <div class="view-${viewConfig.type}">
      <h1>${viewConfig.title}</h1>
      ${generateFieldsHTML(fields, navigation)}
    </div>
  `;
}
```

### Prototype Line Generator
```javascript
function generatePrototypeView(viewConfig) {
  // React with mock data and interactions
  const entity = busm.getEntity(viewConfig.entity);
  const mockData = generateMockData(entity);
  
  return generateReactComponent({
    fields: viewConfig.display.fields,
    navigation: viewConfig.navigation,
    data: mockData
  });
}
```

## Benefits of This Approach

1. **Clear Separation of Concerns**
   - ViewForge: What and where
   - BUSM: Data structure
   - Business Rules: Behavior
   - Generators: Implementation

2. **Progressive Enhancement**
   - Concept: Basic structure
   - Prototype: Add interactions
   - Production: Full implementation

3. **Single Source of Truth**
   - Each aspect has one owner
   - No duplication
   - Clear responsibility

4. **Gap Discovery**
   - Log what's missing
   - Build tools to fill gaps
   - Continuous improvement

---

*Version: 1.0.0*
*Status: Specification for simplified ViewForge output*