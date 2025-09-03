# Base System Loader PRD

**Component**: Base System Loader (formerly Data Processor)  
**Version**: 2.0  
**Date**: 2025-09-02  
**Stage**: Stage 2 - Prototype Generation  
**Author**: Factory Development Team

---

## Overview

The Base System Loader handles the loading and customization of the 17-entity universal service model for Stage 2 prototype generation. It loads the base system template, applies domain-specific customizations (Pest Control, HVAC, etc.), and prepares the enriched system configuration for View Generator consumption. Called by the Prototype Line Orchestrator to transform base system configurations into customized service models.

## Business Context

### Problem Statement
Stage 1 outputs contain base system configurations (17 universal entities + domain customizations) that need to be loaded, validated, and enriched with domain-specific extensions before prototype generation. The Base System Loader ensures the universal service model is properly customized for specific service domains.

### Success Criteria
- Load 17-entity universal service model successfully
- Apply domain customizations (additional fields, business rules) correctly
- Validate base system + customization compatibility
- Prepare enriched system configuration for prototype generation
- Generate processing metadata for customization tracking

---

## Functional Requirements

### FR-001: Base System Loading
**Requirement**: Load and validate 17-entity universal service model
**Acceptance Criteria**:
- Load base system template with 17 universal entities
- Load core entity relationships (ACCOUNT, SERVICE_LOCATION, WORK_ORDER)
- Validate base system structure and integrity
- Handle missing or corrupt base system files gracefully
- Return loaded base system in standardized format

### FR-002: Domain Customization Application
**Requirement**: Apply domain-specific customizations to base system
**Acceptance Criteria**:
- Apply additional fields for specific service domains (Pest Control, HVAC, etc.)
- Integrate domain-specific business rules
- Validate customization compatibility with base system
- Handle conflicting customizations gracefully
- Return customized system configuration

### FR-003: System Configuration Validation
**Requirement**: Validate enriched system configuration
**Acceptance Criteria**:
- Validate entity structure after customization application
- Check field compatibility between base system and customizations
- Validate business rule references to customized entities
- Identify configuration conflicts or inconsistencies
- Return validation results with error details

### FR-004: View Configuration Preparation
**Requirement**: Prepare system configuration for Master and Analysis views
**Acceptance Criteria**:
- Configure entities for 3-column Master View layout
- Configure entities for spreadsheet-like Analysis View layout
- Map customized fields to appropriate view sections
- Define view navigation paths and relationships
- Generate view-specific configuration metadata

### FR-005: Customization Metadata Generation
**Requirement**: Build customization metadata for prototype generation
**Acceptance Criteria**:
- Generate timestamps and version numbers for customizations
- Track domain customizations applied and their sources
- Record base system modifications and extensions
- Create customization completion markers
- Return comprehensive customization metadata object

### FR-006: Customization Error Handling
**Requirement**: Handle customization errors with graceful degradation
**Acceptance Criteria**:
- Continue loading base system if some customizations fail
- Collect and categorize customization errors
- Provide detailed error context for failed customizations
- Support partial customization success scenarios
- Return error summary with customization results

---

## Technical Requirements

### TR-001: Base System Loading
**Requirement**: Efficient loading of base system template and customizations
**Specification**:
- Support JSON configuration formats for base system and customizations
- Handle 17-entity universal model efficiently
- Validate configuration integrity before processing
- Support both synchronous and asynchronous loading

### TR-002: Customization Engine
**Requirement**: Comprehensive customization application with detailed reporting
**Specification**:
- JSON schema validation for customization structures
- Custom validation rules for domain-specific extensions
- Base system + customization compatibility validation
- Performance target: Apply domain customizations in under 15 seconds

### TR-003: View Configuration
**Requirement**: Advanced view configuration preparation
**Specification**:
- Configure entities for Master View (3-column layout)
- Configure entities for Analysis View (spreadsheet layout)
- Map customized fields to appropriate view sections
- Support complex view relationship mapping

### TR-004: Customization Error Management
**Requirement**: Structured customization error handling and reporting
**Specification**:
- Categorized error types (compatibility, structure, reference)
- Error severity levels (warning, error, critical)
- Detailed error context with customization names/field conflicts
- Error recovery strategies for each customization error type

---

## Interface Specifications

### Primary Interface
```javascript
class BaseSystemLoader {
  /**
   * Load base system template with 17 universal entities
   * @param {Object} baseSystemConfig - Base system configuration
   * @returns {Object} Loaded base system and processing results
   */
  async loadBaseSystem(baseSystemConfig) {
    // Load 17-entity universal service model
  }

  /**
   * Apply domain customizations to base system
   * @param {Object} baseSystem - Loaded base system
   * @param {Object} domainCustomizations - Domain-specific customizations
   * @returns {Object} Customized system configuration
   */
  async applyDomainCustomizations(baseSystem, domainCustomizations) {
    // Apply Pest Control, HVAC, etc. customizations
  }

  /**
   * Prepare view configurations for Master and Analysis views
   * @param {Object} customizedSystem - System with customizations applied
   * @returns {Object} View configurations for prototype generation
   */
  async prepareViewConfigurations(customizedSystem) {
    // Configure for 3-column Master and spreadsheet Analysis views
  }

  /**
   * Build customization metadata for tracking
   * @param {Object} customizationResults - Results from customization process
   * @returns {Object} Comprehensive customization metadata
   */
  buildCustomizationMetadata(customizationResults) {
    // Customization metadata generation
  }
}
```

### Input Formats
```javascript
// baseSystemConfig parameter
{
  baseSystem: {
    entities: 17,
    coreEntities: ["ACCOUNT", "SERVICE_LOCATION", "WORK_ORDER"],
    views: ["Master View", "Analysis View"]
  },
  domainCustomizations: {
    serviceDomain: "pestControl",
    additionalFields: {
      "SERVICE_LOCATION": ["pestType", "treatmentHistory"],
      "WORK_ORDER": ["chemicalsUsed", "safetyNotes"]
    },
    businessRules: [
      {
        id: 'pest-control-001',
        name: 'Chemical Safety Validation',
        entity: 'WORK_ORDER',
        conditions: [...],
        actions: [...]
      }
    ]
  }
}
```

### Output Formats
```javascript
// Customized system format
{
  customizedEntities: [
    {
      name: 'ACCOUNT',
      baseFields: ['id', 'name', 'email', 'organizationId'],
      customFields: ['preferredTechnician', 'serviceFrequency'],
      viewConfigs: {
        masterView: { column: 1, order: 1 },
        analysisView: { visible: true, sortable: true }
      },
      customizationStatus: 'SUCCESS'
    }
  ],
  customizationSummary: {
    totalEntities: 17,
    entitiesCustomized: 8,
    customizationErrors: 0,
    domain: 'pestControl'
  }
}

// View configurations format
{
  masterViewConfig: {
    leftColumn: ['ACCOUNT', 'SERVICE_LOCATION'],
    centerColumn: ['WORK_ORDER', 'SERVICE_ITEM'],
    rightColumn: ['INVOICE', 'PAYMENT'],
    customFields: {
      'SERVICE_LOCATION': ['pestType', 'treatmentHistory'],
      'WORK_ORDER': ['chemicalsUsed', 'safetyNotes']
    }
  },
  analysisViewConfig: {
    visibleEntities: ['ACCOUNT', 'SERVICE_LOCATION', 'WORK_ORDER'],
    sortableFields: ['id', 'name', 'date', 'status'],
    filterableFields: ['pestType', 'serviceFrequency'],
    customColumns: ['treatmentHistory', 'chemicalsUsed']
  }
}

// Customization metadata format
{
  timestamp: '2025-09-02T10:00:00Z',
  version: '2.0.0',
  stage: 'base-system-loaded',
  customization: {
    baseEntitiesLoaded: 17,
    coreEntitiesConfigured: 3,
    domainCustomizationsApplied: 8,
    viewConfigurationsGenerated: 2,
    domain: 'pestControl',
    client: 'ABC Pest Control'
  },
  errors: [...],
  warnings: [...]
}
```

---

## Dependencies

### Internal Dependencies
- **Prototype Line Orchestrator**: Calls this component for base system loading
- **View Generator**: Receives customized system configuration from this component

### External Dependencies
- Node.js filesystem APIs for base system template access
- JSON parsing and validation libraries for configurations
- Template processing libraries for customization application
- Lodash or similar for data manipulation and merging

---

## Implementation Notes

### Architecture
- Modular design with separate functions for loading, customization, and view preparation
- Pipeline architecture where base system → customization → view configuration
- Comprehensive error collection without stopping customization process
- Memory-efficient processing for complex customization sets

### Customization Strategy
- Template-based loading for base system structure
- Domain-specific extension application
- Compatibility validation between base system and customizations
- Progressive customization with early error detection

### Performance Optimization
- Parallel customization application where dependencies allow
- Efficient data structures for view configuration mapping
- Caching of frequently accessed base system templates
- Streaming processing for complex customization sets

---

## Quality Attributes

### Reliability
- Comprehensive error handling for all customization failure modes
- System integrity validation throughout customization process
- Graceful degradation for partial customization failures
- Complete error reporting and customization recovery guidance

### Performance
- Target: Load base system + apply customizations in under 15 seconds
- Memory-efficient processing of complex customization sets
- Parallel customization application where possible
- Optimized data structures for view configuration mapping

### Maintainability
- Clear separation of loading, customization, and view preparation functions
- Well-documented customization rules and compatibility requirements
- Consistent error handling patterns
- Comprehensive unit test coverage

---

## Testing Strategy

### Unit Tests
- Test each customization function independently
- Test view configuration with various customization combinations
- Test error handling for all customization failure scenarios
- Test metadata generation with different domain combinations

### Integration Tests
- End-to-end processing with real base system configurations
- Customization compatibility testing with actual domain extensions
- Performance testing with complex customization sets
- Error recovery testing with incompatible customizations

### Acceptance Tests
- Process real base system configurations from Concept Line
- Validate outputs work correctly with View Generator
- Test integration with Prototype Line Orchestrator
- Verify customization error reporting meets operational needs

---

## Acceptance Criteria

### Phase 1 (MVP)
- [ ] Load 17-entity universal service model
- [ ] Apply domain customizations (Pest Control, HVAC, etc.)
- [ ] System configuration validation and compatibility checking
- [ ] Basic view configuration preparation
- [ ] Customization metadata generation

### Phase 2 (Enhanced)
- [ ] Advanced customization merge algorithms
- [ ] Performance optimization for complex customization sets
- [ ] Enhanced customization error recovery mechanisms
- [ ] Detailed customization reporting and analytics

### Phase 3 (Production)
- [ ] Production customization monitoring integration
- [ ] Performance metrics collection for customization operations
- [ ] Advanced base system template caching strategies
- [ ] Operational documentation for domain customizations

---

## Error Scenarios and Handling

### Missing or Corrupt Files
- **Detection**: File existence and JSON parsing validation
- **Handling**: Clear error message, continue with available data
- **Recovery**: Provide guidance for fixing missing files

### Invalid Entity References
- **Detection**: Cross-reference validation against BUSM subset
- **Handling**: Log specific entity and validation failure
- **Recovery**: Continue processing valid entities

### Rule Syntax Errors
- **Detection**: JSON schema and business logic validation
- **Handling**: Detailed syntax error reporting
- **Recovery**: Continue processing valid rules

### Relationship Mapping Failures
- **Detection**: Entity field analysis and reference checking
- **Handling**: Log mapping failures with context
- **Recovery**: Provide partial mappings for valid relationships

---

## Risks and Mitigations

### Risk: Complex Customization Performance
**Mitigation**: Parallel customization application and efficient template processing

### Risk: Customization Compatibility Issues
**Mitigation**: Progressive validation and compatibility checking algorithms

### Risk: Domain Customization Maintenance
**Mitigation**: Configuration-driven customization templates and rules

### Risk: Customization Error Handling Complexity
**Mitigation**: Structured customization error categorization and recovery strategies

---

**Status**: Requires Redesign Implementation  
**Priority**: High  
**Estimated Effort**: 3-4 days (includes component redesign)