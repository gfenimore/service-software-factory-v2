# ViewForge Transformer - Product Requirements Document
*Bridging ViewForge v3 to Simplified Wireframe Format*

## 1. Purpose

The ViewForge Transformer converts ViewForge v3 configurations into simplified wireframe format, focusing on "what to show and where clicks go" while pulling business logic from BUSM.

## 2. Problem Statement

**Current State:**
- ViewForge v3 mixes UI, data, and business concerns
- Complex configuration structure
- Generators must interpret mixed concerns
- Duplication of information

**Future State:**
- Clean separation of concerns
- ViewForge defines structure and navigation only
- BUSM provides data definitions
- Generators receive simplified, focused config

## 3. Core Functionality

### 3.1 Transformation Operations
```javascript
class ViewForgeTransformer {
  // Main transformation
  transformV3ToSimplified(v3Config: V3Config): SimplifiedConfig
  
  // Batch transformation
  transformMultiple(configs: V3Config[]): SimplifiedConfig[]
  
  // Validation
  validateV3Config(config: V3Config): ValidationResult
  validateSimplifiedConfig(config: SimplifiedConfig): ValidationResult
}
```

### 3.2 Extraction Operations
```javascript
  // Extract display configuration
  transformDisplay(v3Config: V3Config): DisplayConfig
  
  // Extract navigation from relationships
  extractNavigation(v3Config: V3Config): NavigationConfig
  
  // Define data requirements
  defineDataSource(v3Config: V3Config): DataSourceConfig
  
  // Generate unique ID
  generateId(v3Config: V3Config): string
```

### 3.3 Gap Discovery Operations
```javascript
  // Check for missing information
  checkForGaps(v3Config: V3Config, simplified: SimplifiedConfig): Gap[]
  
  // Log transformation assumptions
  logAssumptions(assumptions: Assumption[]): void
  
  // Generate gap report
  generateGapReport(): GapReport
```

## 4. Transformation Rules

### 4.1 View Type Mapping
```javascript
const typeMap = {
  'table': 'list',
  'grid': 'list',
  'form': 'form',
  'detail': 'detail',
  'card': 'detail'
};
```

### 4.2 Field Transformation
```javascript
// V3 Field
{
  name: 'accountName',
  label: 'Account Name',
  type: 'text',
  sortable: true
}

// Simplified Field
{
  path: 'accountName',
  label: 'Account Name',
  sortable: true,
  clickable: false
}
```

### 4.3 Navigation Extraction
```javascript
// From relationships
if (field.includes('.')) {
  // Extract relationship navigation
  navigation.onFieldClick[field] = {
    target: `${relatedEntity}-detail`,
    params: [foreignKey]
  };
}

// From actions
actions.forEach(action => {
  navigation.onActionClick[action] = 
    generateActionNavigation(entity, action);
});
```

## 5. Input/Output Specifications

### 5.1 Input: ViewForge v3 Config
```javascript
{
  entity: 'Account',
  type: 'table',
  title: 'Account List',
  settings: {
    pageSize: 25,
    sortable: true
  },
  fields: [
    { name: 'accountName', label: 'Account Name', type: 'text' },
    { name: 'primaryContact.name', label: 'Contact', type: 'relationship' }
  ],
  actions: ['view', 'edit', 'delete'],
  rowClick: 'view'
}
```

### 5.2 Output: Simplified Config
```javascript
{
  id: 'account-list',
  type: 'list',
  entity: 'Account',
  title: 'Account List',
  
  display: {
    fields: [
      { path: 'accountName', label: 'Account Name' },
      { path: 'primaryContact.name', label: 'Contact', clickable: true }
    ],
    actions: ['view', 'edit', 'delete']
  },
  
  navigation: {
    onRowClick: {
      target: 'account-detail',
      params: ['accountId']
    },
    onFieldClick: {
      'primaryContact.name': {
        target: 'contact-detail',
        params: ['primaryContact.contactId']
      }
    }
  },
  
  dataSource: {
    entity: 'Account',
    includes: ['primaryContact'],
    orderBy: 'accountName',
    limit: 25
  }
}
```

## 6. Integration Requirements

### 6.1 Dependencies
- BUSM Reader - for entity and relationship data
- Gap Logger - for tracking missing information

### 6.2 Usage
```javascript
const transformer = new ViewForgeTransformer(busmReader, gapLogger);
const simplified = transformer.transformV3ToSimplified(v3Config);
```

### 6.3 Error Handling
```javascript
try {
  const result = transformer.transformV3ToSimplified(config);
} catch (error) {
  if (error instanceof InvalidConfigError) {
    // Handle invalid input
  } else if (error instanceof MissingEntityError) {
    // Handle missing BUSM entity
  }
}
```

## 7. Gap Logging

### 7.1 Gaps to Track
- Missing navigation rules
- Missing field labels
- Missing sort preferences
- Undefined relationships
- Missing primary keys
- Absent display hints

### 7.2 Gap Reporting
```javascript
const gaps = transformer.getDiscoveredGaps();
console.log(`Found ${gaps.length} gaps during transformation`);
gaps.forEach(gap => {
  console.log(`${gap.category}: ${gap.assumption}`);
});
```

## 8. Success Metrics

- 100% of v3 configs transform successfully
- All relationships mapped to navigation
- Zero data loss during transformation
- All gaps logged with fix suggestions

## 9. Performance Requirements

- Transform single config in < 100ms
- Batch transform 100 configs in < 5 seconds
- Cache transformation results
- Minimal memory footprint

## 10. Testing Strategy

### 10.1 Unit Tests
- Test each transformation method
- Validate type mappings
- Test navigation extraction
- Verify gap logging

### 10.2 Integration Tests
- Test with real v3 configs
- Verify BUSM integration
- Test gap logger integration

### 10.3 Edge Cases
- Missing entity in BUSM
- Circular relationships
- Empty configurations
- Invalid field paths

## 11. Future Enhancements

### Phase 2
- Auto-fix simple gaps
- Suggest optimal configuration
- Validate against best practices

### Phase 3
- Reverse transformation (simplified to v3)
- Configuration optimization
- AI-powered gap resolution

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking v3 compatibility | High | Maintain backward compatibility |
| Performance with large configs | Medium | Implement caching |
| Missing BUSM data | High | Comprehensive gap logging |

---

*PRD Version: 1.0.0*
*Status: Implemented, needs documentation*
*Priority: HIGH*