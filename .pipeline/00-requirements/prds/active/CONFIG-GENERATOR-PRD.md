# Config Generator PRD

**Component**: Config Generator  
**Version**: 1.0  
**Date**: 2025-08-27  
**Stage**: Stage 2 - Configuration Enrichment  
**Author**: Factory Development Team

---

## Overview

The Config Generator handles the final assembly and output generation for Stage 2 enrichment. It takes validated entities, business rules, relationship mappings, and metadata from the Data Processor and assembles them into the complete enriched configuration files required by ViewForge. Responsible for generating all Stage 2 output files with proper formatting and validation.

## Business Context

### Problem Statement
ViewForge requires specific configuration file formats with complete entity definitions, business rules, relationship mappings, and metadata. The Config Generator ensures all processed data is properly assembled and formatted for seamless ViewForge consumption.

### Success Criteria
- Generate complete enriched-config.json for ViewForge
- Create standalone entity-mappings.json for navigation
- Produce config-metadata.json for version tracking
- Validate all output files for integrity and completeness

---

## Functional Requirements

### FR-001: Configuration Assembly
**Requirement**: Assemble complete enriched configuration from processed data
**Acceptance Criteria**:
- Combine validated entities, rules, mappings, and metadata
- Structure data according to ViewForge requirements
- Validate configuration completeness before output
- Handle missing or incomplete data gracefully
- Generate comprehensive configuration object

### FR-002: Entity Mappings Generation
**Requirement**: Create standalone entity relationship mapping file
**Acceptance Criteria**:
- Extract entity mappings from processed data
- Format mappings for navigation and data structure use
- Include bidirectional relationship information
- Provide field-level mapping details
- Generate JSON output for external consumption

### FR-003: Metadata File Generation
**Requirement**: Create build metadata and version tracking file
**Acceptance Criteria**:
- Include processing timestamp and version information
- Record validation results and statistics
- Add stage completion markers
- Include error summaries and warnings
- Generate JSON format for tracking systems

### FR-004: Output File Validation
**Requirement**: Validate all generated output files for integrity
**Acceptance Criteria**:
- Verify JSON structure and syntax
- Validate required fields are present
- Check file completeness against inputs
- Verify file accessibility and permissions
- Report validation status for each file

### FR-005: ViewForge Compatibility
**Requirement**: Ensure all outputs are ViewForge-compatible
**Acceptance Criteria**:
- Format matches ViewForge input specifications
- Include all required configuration sections
- Validate entity definitions meet ViewForge requirements
- Ensure relationship mappings are properly formatted
- Test compatibility with ViewForge validation

### FR-006: Error Handling and Recovery
**Requirement**: Handle assembly and output errors gracefully
**Acceptance Criteria**:
- Continue processing after individual component failures
- Generate partial outputs when possible
- Provide detailed error reporting
- Suggest fixes for common issues
- Return comprehensive status information

---

## Technical Requirements

### TR-001: Output File Management
**Requirement**: Efficient generation and management of output files
**Specification**:
- Atomic file write operations to prevent corruption
- Backup existing files before overwriting
- Support configurable output directory paths
- Handle large configurations (1000+ entities) efficiently

### TR-002: JSON Structure Validation
**Requirement**: Comprehensive JSON validation and formatting
**Specification**:
- Schema validation for all output formats
- Pretty-printing with consistent formatting
- Unicode and special character handling
- File size optimization without losing readability

### TR-003: Configuration Completeness
**Requirement**: Validation of configuration completeness
**Specification**:
- Check all entities have required definitions
- Verify all relationships are properly mapped
- Validate business rules reference valid entities
- Ensure metadata is complete and accurate

### TR-004: Performance Optimization
**Requirement**: Efficient processing of large configurations
**Specification**:
- Target: Generate outputs for 100+ entities in under 10 seconds
- Memory-efficient assembly of large configurations
- Streaming output for very large datasets
- Progress reporting for long-running operations

---

## Interface Specifications

### Primary Interface
```javascript
class ConfigGenerator {
  /**
   * Assemble complete enriched configuration
   * @param {Object} processedData - Validated data from Data Processor
   * @returns {Object} Assembled configuration object
   */
  assembleConfiguration(processedData) {
    // Combine entities, rules, mappings, metadata
  }

  /**
   * Generate all Stage 2 output files
   * @param {Object} enrichedConfig - Assembled configuration
   * @param {Object} entityMappings - Entity relationship mappings
   * @param {Object} metadata - Processing metadata
   * @param {String} outputDir - Target directory for outputs
   * @returns {Object} File generation results
   */
  async generateOutputFiles(enrichedConfig, entityMappings, metadata, outputDir) {
    // Generate enriched-config.json, entity-mappings.json, config-metadata.json
  }
}
```

### Input Formats
```javascript
// processedData parameter
{
  validatedEntities: [
    {
      name: 'Account',
      fields: ['id', 'name', 'email'],
      valid: true,
      definition: {...}
    }
  ],
  validatedRules: [
    {
      id: 'rule-001',
      name: 'Account Validation',
      entity: 'Account',
      valid: true,
      rule: {...}
    }
  ],
  entityMappings: {
    'Account': {
      relationships: {...},
      navigationPaths: [...]
    }
  },
  metadata: {
    timestamp: '2025-08-27T10:00:00Z',
    processing: {...}
  }
}
```

### Output File Formats

#### enriched-config.json
```javascript
{
  "metadata": {
    "version": "1.2.0",
    "timestamp": "2025-08-27T10:00:00Z",
    "stage": "stage-2-complete"
  },
  "entities": [
    {
      "name": "Account",
      "fields": [...],
      "relationships": {...},
      "validationRules": [...]
    }
  ],
  "businessRules": [
    {
      "id": "rule-001",
      "entity": "Account",
      "conditions": [...],
      "actions": [...]
    }
  ],
  "entityMappings": {
    "Account": {...}
  }
}
```

#### entity-mappings.json
```javascript
{
  "mappings": {
    "Account": {
      "fields": ["id", "name", "email"],
      "relationships": {
        "User": { "type": "one-to-many", "key": "accountId" },
        "Organization": { "type": "many-to-one", "key": "orgId" }
      },
      "navigationPaths": [
        "Account → User.accountId",
        "Account → Organization.id"
      ]
    }
  },
  "relationshipGraph": {
    "nodes": [...],
    "edges": [...]
  }
}
```

#### config-metadata.json
```javascript
{
  "build": {
    "timestamp": "2025-08-27T10:00:00Z",
    "version": "1.2.0",
    "stage": "stage-2-complete"
  },
  "processing": {
    "entitiesProcessed": 5,
    "entitiesValid": 4,
    "rulesProcessed": 12,
    "rulesValid": 10,
    "relationshipsMapped": 8
  },
  "validation": {
    "errors": [...],
    "warnings": [...],
    "summary": "4/5 entities valid, 10/12 rules valid"
  },
  "outputs": {
    "enriched-config.json": { "size": "15.2KB", "status": "SUCCESS" },
    "entity-mappings.json": { "size": "8.1KB", "status": "SUCCESS" },
    "config-metadata.json": { "size": "2.3KB", "status": "SUCCESS" }
  }
}
```

---

## Dependencies

### Internal Dependencies
- **Data Processor**: Provides validated and processed data
- **Configuration Enricher**: Coordinates this component's execution
- **ViewForge Components**: Consume the generated output files

### External Dependencies
- Node.js filesystem APIs for file operations
- JSON schema validation libraries
- Path resolution utilities
- File backup and atomic write utilities

---

## Implementation Notes

### Architecture
- Clear separation of assembly and output generation functions
- Template-based output formatting for consistency
- Comprehensive validation pipeline for all outputs
- Atomic file operations to prevent corruption

### Output Strategy
- Generate all outputs before writing any files
- Validate all outputs before file system operations
- Create backup copies of existing files
- Atomic write operations with rollback capability

### Error Recovery
- Continue generation even if individual outputs fail
- Provide detailed error context for debugging
- Support partial output generation
- Clear guidance for fixing common issues

---

## Quality Attributes

### Reliability
- Atomic file operations prevent corruption
- Comprehensive validation ensures output quality
- Backup and rollback capabilities for safety
- Complete error reporting and recovery

### Performance
- Target: Generate outputs for 100+ entities in under 10 seconds
- Memory-efficient assembly of large configurations
- Optimized JSON generation and formatting
- Progress reporting for user feedback

### Maintainability
- Template-based output generation for consistency
- Clear separation of assembly and file operations
- Well-documented output formats and schemas
- Comprehensive error handling patterns

---

## Testing Strategy

### Unit Tests
- Test configuration assembly with various input combinations
- Test output file generation and validation
- Test error handling for all failure scenarios
- Test JSON formatting and schema compliance

### Integration Tests
- End-to-end generation with real Data Processor outputs
- ViewForge compatibility testing with generated files
- Performance testing with large configuration sets
- File system error handling and recovery

### Acceptance Tests
- Generate outputs for real Concept Line configurations
- Verify ViewForge accepts and processes generated files
- Test integration with Configuration Enricher
- Validate operational monitoring and error reporting

---

## Acceptance Criteria

### Phase 1 (MVP)
- [x] Generate enriched-config.json for ViewForge
- [x] Create entity-mappings.json for navigation
- [x] Produce config-metadata.json for tracking
- [x] Validate all output files for integrity
- [x] Handle assembly errors gracefully

### Phase 2 (Enhanced)
- [ ] Performance optimization for large configurations
- [ ] Advanced output validation and quality checks
- [ ] Enhanced error recovery mechanisms
- [ ] Output format versioning support

### Phase 3 (Production)
- [ ] Production monitoring integration
- [ ] Automated testing with ViewForge
- [ ] Performance metrics collection
- [ ] Operational documentation and runbooks

---

## Output File Specifications

### File Locations
```
.pipeline/01-concept-line/outputs/stage2/
├── enriched-config.json       # Complete configuration for ViewForge
├── entity-mappings.json       # Standalone entity relationships
└── config-metadata.json       # Build metadata and version info
```

### File Permissions
- Read/write permissions for pipeline user
- Backup existing files before overwrite
- Verify file accessibility after generation

### File Validation
- JSON syntax validation
- Schema compliance checking
- Completeness verification against inputs
- Size and format reasonableness checks

---

## Error Scenarios and Handling

### Assembly Failures
- **Cause**: Missing or invalid processed data
- **Detection**: Input validation and completeness checks
- **Handling**: Log specific missing components, generate partial config
- **Recovery**: Provide guidance for fixing Data Processor issues

### File Write Failures
- **Cause**: Permissions, disk space, or file system issues
- **Detection**: File operation error checking
- **Handling**: Rollback partial writes, clear error messages
- **Recovery**: Provide specific file system remediation guidance

### JSON Generation Errors
- **Cause**: Invalid characters, circular references, or data corruption
- **Detection**: JSON serialization error handling
- **Handling**: Identify problematic data, sanitize where possible
- **Recovery**: Provide data correction guidance and partial outputs

### ViewForge Compatibility Issues
- **Cause**: Format changes or specification mismatches
- **Detection**: Schema validation and compatibility checking
- **Handling**: Log specific compatibility failures
- **Recovery**: Provide format correction guidance and version information

---

## Risks and Mitigations

### Risk: Large Configuration Performance
**Mitigation**: Streaming output generation and memory optimization

### Risk: Output Format Evolution
**Mitigation**: Versioned output schemas and backward compatibility

### Risk: File System Reliability
**Mitigation**: Atomic operations, backups, and comprehensive error handling

### Risk: ViewForge Integration Changes
**Mitigation**: Regular compatibility testing and format validation

---

**Status**: Ready for Implementation  
**Priority**: High  
**Estimated Effort**: 2-3 days