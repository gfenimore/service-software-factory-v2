# Data Processor PRD

**Component**: Data Processor  
**Version**: 1.0  
**Date**: 2025-08-27  
**Stage**: Stage 2 - Configuration Enrichment  
**Author**: Factory Development Team

---

## Overview

The Data Processor handles the core data validation and transformation operations for Stage 2 enrichment. It consolidates entity loading, rule validation, relationship mapping, and metadata building into a single cohesive processing engine. Called by the Configuration Enricher to transform raw Stage 1 data into validated, mapped configuration components.

## Business Context

### Problem Statement
Stage 1 outputs contain raw entity definitions and business rules that need validation, cross-referencing, and relationship mapping before ViewForge consumption. The Data Processor ensures data integrity and creates the relationship structures needed for configuration enrichment.

### Success Criteria
- Validate all entities against BUSM subset definitions
- Validate business rule syntax and entity references
- Create comprehensive entity relationship mappings
- Generate processing metadata for traceability

---

## Functional Requirements

### FR-001: Stage 1 Data Loading
**Requirement**: Load and parse all Stage 1 output files
**Acceptance Criteria**:
- Load entities.json with validation of JSON structure
- Load business-rules.json with syntax checking
- Load busm-subset.mmd for entity reference validation
- Handle file access errors gracefully
- Return parsed data in standardized format

### FR-002: Entity Validation
**Requirement**: Validate entities against BUSM subset
**Acceptance Criteria**:
- Check each entity exists in BUSM subset
- Validate entity name format and conventions
- Identify missing or invalid entities
- Log validation errors with specific details
- Return list of validated entities

### FR-003: Business Rules Validation
**Requirement**: Validate business rule syntax and references
**Acceptance Criteria**:
- Parse and validate JSON rule structure
- Check entity references against validated entities
- Validate rule syntax for required fields
- Identify circular dependencies in rules
- Return validated rules with error details

### FR-004: Entity Relationship Mapping
**Requirement**: Create comprehensive entity relationship maps
**Acceptance Criteria**:
- Identify primary and related entities
- Extract entity fields and data types
- Map one-to-many and many-to-one relationships
- Create navigation paths between entities
- Generate relationship metadata

### FR-005: Metadata Generation
**Requirement**: Build processing metadata for configuration tracking
**Acceptance Criteria**:
- Generate timestamps and version numbers
- Track validation results and statistics
- Record processing parameters and settings
- Create stage completion markers
- Return comprehensive metadata object

### FR-006: Error Handling and Recovery
**Requirement**: Handle validation errors with graceful degradation
**Acceptance Criteria**:
- Continue processing after individual entity failures
- Collect and categorize all validation errors
- Provide detailed error context and suggestions
- Support partial success scenarios
- Return error summary with processing results

---

## Technical Requirements

### TR-001: File Processing
**Requirement**: Efficient processing of Stage 1 output files
**Specification**:
- Support JSON and Mermaid file formats
- Handle large files (100+ entities) efficiently
- Validate file integrity before processing
- Support both synchronous and asynchronous processing

### TR-002: Validation Engine
**Requirement**: Comprehensive validation with detailed reporting
**Specification**:
- JSON schema validation for structured data
- Custom validation rules for business logic
- Entity cross-reference validation
- Performance target: 100+ entities in under 15 seconds

### TR-003: Relationship Analysis
**Requirement**: Advanced entity relationship detection and mapping
**Specification**:
- Parse entity definitions for relationship hints
- Detect foreign key relationships
- Build bidirectional relationship maps
- Support complex many-to-many relationships

### TR-004: Error Management
**Requirement**: Structured error handling and reporting
**Specification**:
- Categorized error types (syntax, reference, structure)
- Error severity levels (warning, error, critical)
- Detailed error context with line numbers/entity names
- Error recovery strategies for each error type

---

## Interface Specifications

### Primary Interface
```javascript
class DataProcessor {
  /**
   * Load and validate Stage 1 data files
   * @param {Object} inputFiles - Paths to Stage 1 output files
   * @returns {Object} Validated data and processing results
   */
  async loadStage1Data(inputFiles) {
    // Load entities, business rules, BUSM subset
  }

  /**
   * Validate business rules against entities
   * @param {Array} businessRules - Raw business rules
   * @param {Array} validatedEntities - Validated entity list
   * @returns {Object} Validated rules and error details
   */
  async validateBusinessRules(businessRules, validatedEntities) {
    // Rule syntax and reference validation
  }

  /**
   * Map entity relationships and create navigation paths
   * @param {Array} validatedEntities - Validated entities
   * @param {String} busmSubset - BUSM subset content
   * @returns {Object} Entity mappings and relationship data
   */
  async mapEntityRelationships(validatedEntities, busmSubset) {
    // Relationship analysis and mapping
  }

  /**
   * Build processing metadata for tracking
   * @param {Object} processingResults - Results from all processing steps
   * @returns {Object} Comprehensive metadata object
   */
  buildMetadata(processingResults) {
    // Metadata generation
  }
}
```

### Input Formats
```javascript
// inputFiles parameter
{
  entitiesFile: './stage1-outputs/entities.json',
  businessRulesFile: './stage1-outputs/business-rules.json',
  busmSubsetFile: './stage1-outputs/busm-subset.mmd'
}

// businessRules array format
[
  {
    id: 'rule-001',
    name: 'Account Validation',
    entity: 'Account',
    conditions: [...],
    actions: [...]
  }
]
```

### Output Formats
```javascript
// Validated entities format
{
  validatedEntities: [
    {
      name: 'Account',
      fields: ['id', 'name', 'email', 'orgId'],
      valid: true,
      errors: []
    }
  ],
  validationSummary: {
    totalEntities: 5,
    validEntities: 4,
    invalidEntities: 1,
    errors: [...]
  }
}

// Entity mappings format
{
  'Account': {
    fields: ['id', 'name', 'email', 'orgId'],
    relationships: {
      'User': { type: 'one-to-many', key: 'accountId' },
      'Organization': { type: 'many-to-one', key: 'orgId' }
    },
    navigationPaths: [
      'Account → User.accountId',
      'Account → Organization.id'
    ]
  }
}

// Metadata format
{
  timestamp: '2025-08-27T10:00:00Z',
  version: '1.2.0',
  stage: 'stage-2-complete',
  processing: {
    entitiesProcessed: 5,
    entitiesValid: 4,
    rulesProcessed: 12,
    rulesValid: 10,
    relationshipsMapped: 8
  },
  errors: [...],
  warnings: [...]
}
```

---

## Dependencies

### Internal Dependencies
- **Configuration Enricher**: Calls this component for data processing
- **Config Generator**: Receives processed data from this component

### External Dependencies
- Node.js filesystem APIs for file access
- JSON parsing and validation libraries
- Mermaid parser for BUSM subset analysis
- Lodash or similar for data manipulation

---

## Implementation Notes

### Architecture
- Modular design with separate functions for each major operation
- Pipeline architecture where each step feeds the next
- Comprehensive error collection without stopping processing
- Memory-efficient streaming for large datasets

### Validation Strategy
- Schema-first validation for structure checking
- Business logic validation for content checking
- Cross-reference validation for data integrity
- Progressive validation with early error detection

### Performance Optimization
- Parallel processing where data dependencies allow
- Efficient data structures for relationship mapping
- Caching of frequently accessed validation results
- Streaming processing for large entity sets

---

## Quality Attributes

### Reliability
- Comprehensive error handling for all failure modes
- Data integrity validation throughout processing
- Graceful degradation for partial failures
- Complete error reporting and recovery guidance

### Performance
- Target: Process 100+ entities in under 15 seconds
- Memory-efficient processing of large datasets
- Parallel validation where possible
- Optimized data structures for relationship mapping

### Maintainability
- Clear separation of validation, mapping, and metadata functions
- Well-documented validation rules and error conditions
- Consistent error handling patterns
- Comprehensive unit test coverage

---

## Testing Strategy

### Unit Tests
- Test each validation function independently
- Test relationship mapping with various entity combinations
- Test error handling for all failure scenarios
- Test metadata generation with different input combinations

### Integration Tests
- End-to-end processing with real Stage 1 outputs
- Cross-reference validation with actual BUSM subsets
- Performance testing with large entity sets
- Error recovery testing with corrupted inputs

### Acceptance Tests
- Process real Concept Line Stage 1 outputs
- Validate outputs work correctly with Config Generator
- Test integration with Configuration Enricher
- Verify error reporting meets operational needs

---

## Acceptance Criteria

### Phase 1 (MVP)
- [x] Load and validate Stage 1 data files
- [x] Entity validation against BUSM subset
- [x] Business rule validation and cross-referencing
- [x] Basic entity relationship mapping
- [x] Processing metadata generation

### Phase 2 (Enhanced)
- [ ] Advanced relationship detection algorithms
- [ ] Performance optimization for large datasets
- [ ] Enhanced error recovery mechanisms
- [ ] Detailed validation reporting

### Phase 3 (Production)
- [ ] Production monitoring integration
- [ ] Performance metrics collection
- [ ] Advanced caching strategies
- [ ] Operational documentation

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

### Risk: Large Dataset Performance
**Mitigation**: Streaming processing and parallel validation where possible

### Risk: Complex Relationship Detection
**Mitigation**: Progressive enhancement of relationship algorithms

### Risk: Validation Rule Maintenance
**Mitigation**: Configuration-driven validation rules

### Risk: Error Handling Complexity
**Mitigation**: Structured error categorization and recovery strategies

---

**Status**: Ready for Implementation  
**Priority**: High  
**Estimated Effort**: 3-4 days