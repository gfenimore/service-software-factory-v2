# ViewForge Integration Support PRD
## Enabling Integration Declarations in Visual Configuration

**Document Type**: Product Requirements Document  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Draft  
**Owner**: Factory Tools Team  
**Priority**: Critical - Blocks Integration Discovery Scanner  

---

## Executive Summary

This PRD defines the minimal changes needed to ViewForge to support integration declarations in the visual configuration tool. These declarations will be passed through to the generated concept HTML as `data-integration` attributes, enabling the Integration Discovery Scanner to identify and validate integration points.

## Problem Statement

ViewForge currently generates pure structural HTML for the concept phase but has no mechanism to declare integration points. Without this capability:

- Integration requirements are invisible in concepts
- The Integration Discovery Scanner has nothing to discover
- Integration planning happens too late (at prototype phase)
- No validation of integration completeness
- Manual tracking of which components need integrations

This is a **blocking dependency** for the entire Integration Architecture implementation.

## Goals

### Primary Goals
1. **Enable** integration declarations in ViewForge configuration
2. **Generate** appropriate `data-integration` attributes in concept HTML
3. **Maintain** ViewForge's zero-dependency principle
4. **Preserve** black-and-white visual output
5. **Document** integration intent at concept phase

### Non-Goals
- Does not implement actual integrations
- Does not add visual integration representations
- Does not validate integration configurations
- Does not generate integration code
- Does not add external dependencies

## User Stories

### As a Concept Designer
- I want to declare that a field needs address validation
- I want to specify integration dependencies
- I want to see available integration types
- I want the configuration to remain simple

### As a Factory Developer
- I want integration declarations in the HTML output
- I want to know which integrations are required vs optional
- I want clear attribute naming conventions
- I want integration metadata preserved

### As an Integration Developer
- I want to discover all integration points
- I want to understand integration relationships
- I want to validate against available integrations
- I want consistent integration patterns

## Functional Requirements

### 1. Configuration Schema Extension

#### Current Configuration
```json
{
  "entityType": "account",
  "viewType": "detail",
  "title": "Account Details",
  "fields": [
    {
      "name": "serviceAddress",
      "label": "Service Address",
      "type": "text",
      "required": true
    }
  ]
}
```

#### Enhanced Configuration with Integrations
```json
{
  "entityType": "account",
  "viewType": "detail",
  "title": "Account Details",
  "fields": [
    {
      "name": "serviceAddress",
      "label": "Service Address",
      "type": "text",
      "required": true,
      "integration": {
        "type": "address-validation",
        "required": true,
        "capabilities": ["autocomplete", "validation", "geocoding"]
      }
    }
  ],
  "sections": [
    {
      "name": "locationDisplay",
      "type": "map",
      "integration": {
        "type": "geographic-display",
        "dependsOn": ["serviceAddress"],
        "required": false
      }
    }
  ]
}
```

### 2. HTML Generation Updates

#### Generated HTML Output
```html
<!-- Without integration support (current) -->
<div class="field-group">
  <label for="serviceAddress">Service Address</label>
  <input type="text" id="serviceAddress" name="serviceAddress" required>
</div>

<!-- With integration support (new) -->
<div class="field-group" 
     data-integration="address-validation"
     data-integration-required="true"
     data-integration-capabilities="autocomplete,validation,geocoding">
  <label for="serviceAddress">Service Address</label>
  <input type="text" id="serviceAddress" name="serviceAddress" required>
</div>

<div class="section-map"
     data-integration="geographic-display"
     data-depends-on="serviceAddress"
     data-integration-required="false">
  <!-- Map placeholder -->
</div>
```

### 3. ViewForge UI Updates

#### Integration Panel in Visual Editor
```javascript
// New panel in ViewForge UI
class IntegrationPanel {
  renderFieldIntegration(field) {
    return `
      <div class="integration-config">
        <h4>Integration Settings</h4>
        
        <label>
          <input type="checkbox" 
                 onchange="toggleIntegration('${field.id}')"
                 ${field.integration ? 'checked' : ''}>
          Requires Integration
        </label>
        
        ${field.integration ? this.renderIntegrationOptions(field) : ''}
      </div>
    `;
  }
  
  renderIntegrationOptions(field) {
    return `
      <select onchange="setIntegrationType('${field.id}', this.value)">
        <option value="">Select Integration Type...</option>
        <option value="address-validation">Address Validation</option>
        <option value="phone-validation">Phone Validation</option>
        <option value="email-validation">Email Validation</option>
        <option value="payment-processing">Payment Processing</option>
        <option value="geographic-display">Geographic Display</option>
        <option value="document-storage">Document Storage</option>
        <option value="notification-service">Notification Service</option>
      </select>
      
      <label>
        <input type="checkbox" 
               onchange="setRequired('${field.id}', this.checked)"
               ${field.integration?.required ? 'checked' : ''}>
        Required for this field
      </label>
    `;
  }
}
```

### 4. Integration Type Registry

#### Available Integration Types
```javascript
// Integration types that can be declared in concepts
const INTEGRATION_TYPES = {
  // Validation integrations
  'address-validation': {
    category: 'validation',
    description: 'Validates and standardizes addresses',
    capabilities: ['autocomplete', 'validation', 'geocoding'],
    commonFields: ['address', 'serviceLocation', 'billingAddress']
  },
  
  'phone-validation': {
    category: 'validation',
    description: 'Validates and formats phone numbers',
    capabilities: ['format', 'validation', 'carrier-lookup'],
    commonFields: ['phone', 'mobile', 'fax']
  },
  
  'email-validation': {
    category: 'validation',
    description: 'Validates email addresses',
    capabilities: ['syntax-check', 'domain-verification'],
    commonFields: ['email', 'contactEmail']
  },
  
  // Display integrations
  'geographic-display': {
    category: 'display',
    description: 'Shows locations on a map',
    capabilities: ['markers', 'routing', 'territories'],
    dependencies: ['address-validation']
  },
  
  // Processing integrations
  'payment-processing': {
    category: 'transaction',
    description: 'Processes payments and transactions',
    capabilities: ['credit-card', 'ach', 'invoicing'],
    commonFields: ['payment', 'billing']
  },
  
  // Communication integrations
  'notification-service': {
    category: 'communication',
    description: 'Sends notifications to users',
    capabilities: ['sms', 'email', 'push'],
    commonFields: ['notifications', 'alerts']
  }
};
```

### 5. Validation Rules

#### Configuration Validation
```javascript
function validateIntegrationConfig(config) {
  const errors = [];
  
  // Check integration type is valid
  if (config.integration && !INTEGRATION_TYPES[config.integration.type]) {
    errors.push(`Unknown integration type: ${config.integration.type}`);
  }
  
  // Check dependencies exist
  if (config.integration?.dependsOn) {
    for (const dep of config.integration.dependsOn) {
      if (!fieldExists(dep)) {
        errors.push(`Dependency field not found: ${dep}`);
      }
    }
  }
  
  // Warn about common patterns
  if (config.name.includes('address') && !config.integration) {
    errors.push(`Warning: Field '${config.name}' might need address-validation`);
  }
  
  return errors;
}
```

### 6. Export Format Updates

#### Configuration Export
```javascript
// Export includes integration declarations
function exportConfiguration(config) {
  return {
    version: '2.0',  // Version bump to indicate integration support
    entityType: config.entityType,
    viewType: config.viewType,
    fields: config.fields.map(field => ({
      ...field,
      integration: field.integration || null
    })),
    integrations: extractAllIntegrations(config)  // Summary of all integrations
  };
}

function extractAllIntegrations(config) {
  const integrations = [];
  
  config.fields.forEach(field => {
    if (field.integration) {
      integrations.push({
        fieldName: field.name,
        integrationType: field.integration.type,
        required: field.integration.required,
        dependsOn: field.integration.dependsOn || []
      });
    }
  });
  
  return integrations;
}
```

## Technical Implementation

### Changes to ViewForge Core

#### 1. Update Configuration Parser
```javascript
// viewforge/js/core/parser.js
function parseFieldConfiguration(fieldConfig) {
  const field = {
    ...existingParsing(fieldConfig),
    
    // NEW: Parse integration settings
    integration: fieldConfig.integration ? {
      type: fieldConfig.integration.type,
      required: fieldConfig.integration.required || false,
      capabilities: fieldConfig.integration.capabilities || [],
      dependsOn: fieldConfig.integration.dependsOn || []
    } : null
  };
  
  return field;
}
```

#### 2. Update HTML Generator
```javascript
// viewforge/js/generators/html-generator.js
function generateFieldHTML(field) {
  let html = `<div class="field-group"`;
  
  // NEW: Add integration attributes
  if (field.integration) {
    html += ` data-integration="${field.integration.type}"`;
    html += ` data-integration-required="${field.integration.required}"`;
    
    if (field.integration.capabilities.length > 0) {
      html += ` data-integration-capabilities="${field.integration.capabilities.join(',')}"`;
    }
    
    if (field.integration.dependsOn.length > 0) {
      html += ` data-depends-on="${field.integration.dependsOn.join(',')}"`;
    }
  }
  
  html += `>`;
  // ... rest of field generation
  
  return html;
}
```

#### 3. Update UI Components
```javascript
// viewforge/js/ui/field-editor.js
class FieldEditor {
  renderIntegrationSection(field) {
    if (!this.showIntegrations) return '';
    
    return `
      <div class="integration-section">
        <h4>
          <input type="checkbox" 
                 id="has-integration-${field.id}"
                 ${field.integration ? 'checked' : ''}
                 onchange="this.toggleIntegration('${field.id}')">
          <label for="has-integration-${field.id}">
            Requires Integration
          </label>
        </h4>
        
        ${field.integration ? this.renderIntegrationDetails(field) : ''}
      </div>
    `;
  }
}
```

### File Structure Changes

```
viewforge/
├── js/
│   ├── core/
│   │   ├── app.js
│   │   ├── parser.js         [MODIFY]
│   │   └── state.js
│   ├── generators/
│   │   └── html-generator.js [MODIFY]
│   ├── ui/
│   │   ├── field-editor.js   [MODIFY]
│   │   └── integration-panel.js [NEW]
│   └── integrations/
│       └── integration-types.js [NEW]
└── css/
    └── integration-panel.css  [NEW]
```

## Migration Strategy

### For Existing ViewForge Configurations

1. **Backward Compatibility**: Old configurations without integrations continue to work
2. **Auto-Detection**: Suggest integrations based on field names
3. **Bulk Update Tool**: Script to add integrations to existing configs

```javascript
// migration/add-integrations.js
function migrateConfiguration(oldConfig) {
  const newConfig = { ...oldConfig };
  
  newConfig.fields = oldConfig.fields.map(field => {
    // Auto-suggest integrations based on field names
    if (field.name.toLowerCase().includes('address')) {
      field.integration = {
        type: 'address-validation',
        required: true,
        suggested: true  // Flag for review
      };
    }
    return field;
  });
  
  return newConfig;
}
```

## Testing Requirements

### Unit Tests
- Configuration parsing with integrations
- HTML generation with data attributes
- Validation of integration configurations
- Dependency resolution

### Integration Tests
- Full ViewForge flow with integrations
- Export/import with integration data
- UI interaction for adding integrations

### Manual Testing
- Add integrations to various field types
- Verify HTML output contains correct attributes
- Test dependency declarations
- Validate integration type selection

## Success Criteria

- [ ] ViewForge accepts integration declarations in configuration
- [ ] Generated HTML contains `data-integration` attributes
- [ ] UI provides integration configuration interface
- [ ] No visual changes to concept output (remains black & white)
- [ ] Backward compatibility maintained
- [ ] Integration types are well-documented
- [ ] Validation catches configuration errors
- [ ] Export includes integration metadata
- [ ] Zero external dependencies added

## Performance Impact

- **Minimal** - Only adds attributes to HTML
- **No runtime overhead** - Integrations not executed in concept phase
- **Small configuration increase** - ~10-20% larger config files
- **No visual rendering impact** - Attributes are invisible

## Documentation Requirements

1. **Integration Types Catalog** - List all available types
2. **Configuration Guide** - How to add integrations
3. **Migration Guide** - Updating existing configs
4. **Best Practices** - When to use which integration

## Rollout Plan

### Phase 1: Core Support (Day 1-2)
- Update parser and generator
- Basic integration attributes
- Manual configuration only

### Phase 2: UI Support (Day 3-4)
- Add integration panel to UI
- Integration type dropdown
- Dependency configuration

### Phase 3: Validation (Day 5)
- Configuration validation
- Auto-suggestions
- Migration tools

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaks existing configs | High | Backward compatibility, thorough testing |
| Complex UI | Medium | Keep UI minimal, hide behind "Advanced" |
| Performance degradation | Low | Benchmark before/after |
| Incomplete integration list | Medium | Start with core set, extensible design |

## Appendix: Example Configurations

### Simple Field with Validation
```json
{
  "name": "serviceAddress",
  "label": "Service Address",
  "type": "text",
  "integration": {
    "type": "address-validation",
    "required": true
  }
}
```

### Complex Section with Dependencies
```json
{
  "name": "serviceTerritory",
  "type": "section",
  "integration": {
    "type": "geographic-display",
    "required": false,
    "dependsOn": ["serviceAddress", "territoryBoundaries"],
    "capabilities": ["markers", "territories", "routing"]
  }
}
```

### Generated HTML Example
```html
<div class="account-detail-view">
  <div class="field-group" 
       data-integration="address-validation"
       data-integration-required="true">
    <label>Service Address</label>
    <input type="text" name="serviceAddress">
  </div>
  
  <div class="section-territory"
       data-integration="geographic-display"
       data-depends-on="serviceAddress,territoryBoundaries"
       data-integration-required="false"
       data-integration-capabilities="markers,territories,routing">
    <!-- Territory display placeholder -->
  </div>
</div>
```

## Conclusion

This minimal enhancement to ViewForge enables the entire Integration Architecture to function while maintaining ViewForge's core principles. The changes are focused, backward-compatible, and require no external dependencies. Once implemented, the Integration Discovery Scanner will have the concept HTML it needs to validate and manage integrations throughout the factory pipeline.