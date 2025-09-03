# View Generator PRD

**Component**: View Generator (formerly Config Generator)  
**Version**: 2.0  
**Date**: 2025-09-02  
**Stage**: Stage 2 - Prototype Generation  
**Author**: Factory Development Team

---

## Overview

The View Generator handles the creation of working UI prototypes for Stage 2 prototype generation. It takes customized system configurations from the Base System Loader and generates functional Master View and Analysis View prototypes as HTML/CSS/JS files. Responsible for creating deployable prototype packages ready for client testing and interaction.

## Business Context

### Problem Statement
Clients need working prototypes they can test and interact with, not just configuration files. The View Generator transforms customized system configurations into functional Master View (3-column interface) and Analysis View (spreadsheet-like interface) prototypes with domain customizations applied and ready for deployment.

### Success Criteria
- Generate working Master View prototype (3-column interface)
- Create functional Analysis View prototype (spreadsheet-like interface)
- Apply domain customizations to prototype interfaces
- Package deployable HTML/CSS/JS files ready for client testing
- Validate all prototype files for functionality and completeness

---

## Functional Requirements

### FR-001: Master View Generation
**Requirement**: Generate working Master View prototype with 3-column layout
**Acceptance Criteria**:
- Create left column with account and location entities
- Create center column with work order and service entities
- Create right column with invoicing and payment entities
- Apply domain customizations to appropriate columns
- Generate HTML/CSS/JS files for functional prototype

### FR-002: Analysis View Generation
**Requirement**: Create working Analysis View prototype with spreadsheet-like interface
**Acceptance Criteria**:
- Generate tabular data view with sortable columns
- Include filterable fields for data analysis
- Apply domain-specific custom columns
- Implement basic CRUD operations interface
- Generate HTML/CSS/JS files for functional prototype

### FR-003: Domain Customization Integration
**Requirement**: Apply domain customizations to prototype interfaces
**Acceptance Criteria**:
- Integrate additional fields for specific service domains (Pest Control, HVAC, etc.)
- Apply domain-specific business rules to UI validation
- Customize field labels and layouts for service domain
- Include domain-specific functionality and workflows
- Generate customized prototypes ready for domain testing

### FR-004: Prototype Functionality Validation
**Requirement**: Validate all generated prototype files for functionality
**Acceptance Criteria**:
- Verify HTML structure and accessibility
- Validate CSS styling and responsive design
- Test JavaScript functionality and interactions
- Check prototype completeness against system configuration
- Report validation status for each prototype file

### FR-005: Client Deployment Readiness
**Requirement**: Ensure all prototypes are deployment-ready for client testing
**Acceptance Criteria**:
- Package prototypes with all required assets
- Include deployment instructions and setup guide
- Validate prototypes work in target browser environments
- Ensure prototypes are self-contained and portable
- Test client accessibility and usability requirements

### FR-006: Prototype Generation Error Handling
**Requirement**: Handle prototype generation errors gracefully
**Acceptance Criteria**:
- Continue generation after individual view failures (e.g., Master View succeeds, Analysis View fails)
- Generate partial prototypes when possible
- Provide detailed error reporting for prototype generation failures
- Suggest fixes for common prototype generation issues
- Return comprehensive prototype generation status information

---

## Technical Requirements

### TR-001: Prototype File Management
**Requirement**: Efficient generation and management of prototype files
**Specification**:
- Atomic file write operations for HTML/CSS/JS files
- Generate self-contained prototype packages
- Support configurable output directory paths for prototype deployment
- Handle complex customization sets efficiently

### TR-002: HTML/CSS/JS Generation
**Requirement**: Comprehensive web technology file generation
**Specification**:
- Semantic HTML structure generation with accessibility compliance
- Responsive CSS styling with consistent design system
- Functional JavaScript with domain-specific interactions
- Cross-browser compatibility and optimization

### TR-003: Prototype Completeness
**Requirement**: Validation of prototype functionality completeness
**Specification**:
- Check all customized entities are represented in views
- Verify all domain customizations are applied to UI
- Validate business rules are implemented in UI interactions
- Ensure prototypes include all required functionality

### TR-004: Prototype Generation Performance
**Requirement**: Efficient generation of complex prototypes
**Specification**:
- Target: Generate Master View + Analysis View prototypes in under 10 seconds
- Memory-efficient assembly of complex UI components
- Parallel generation of view prototypes where possible
- Progress reporting for prototype generation operations

---

## Interface Specifications

### Primary Interface
```javascript
class ViewGenerator {
  /**
   * Generate Master View prototype with 3-column layout
   * @param {Object} customizedSystem - System configuration from Base System Loader
   * @returns {Object} Master View prototype files (HTML/CSS/JS)
   */
  generateMasterViewPrototype(customizedSystem) {
    // Generate 3-column Master View prototype
  }

  /**
   * Generate Analysis View prototype with spreadsheet interface
   * @param {Object} customizedSystem - System configuration from Base System Loader
   * @returns {Object} Analysis View prototype files (HTML/CSS/JS)
   */
  generateAnalysisViewPrototype(customizedSystem) {
    // Generate spreadsheet-like Analysis View prototype
  }

  /**
   * Package all prototypes into deployable format
   * @param {Object} masterView - Master View prototype files
   * @param {Object} analysisView - Analysis View prototype files
   * @param {Object} customizationMetadata - Domain customization metadata
   * @param {String} outputDir - Target directory for prototype package
   * @returns {Object} Prototype packaging results
   */
  async packagePrototypes(masterView, analysisView, customizationMetadata, outputDir) {
    // Package prototypes for client deployment
  }
}
```

### Input Formats
```javascript
// customizedSystem parameter
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
  viewConfigurations: {
    masterViewConfig: {
      leftColumn: ['ACCOUNT', 'SERVICE_LOCATION'],
      centerColumn: ['WORK_ORDER', 'SERVICE_ITEM'],
      rightColumn: ['INVOICE', 'PAYMENT']
    },
    analysisViewConfig: {
      visibleEntities: ['ACCOUNT', 'SERVICE_LOCATION', 'WORK_ORDER'],
      sortableFields: ['id', 'name', 'date', 'status'],
      filterableFields: ['pestType', 'serviceFrequency']
    }
  },
  domainCustomizations: {
    serviceDomain: 'pestControl',
    additionalFields: {...},
    businessRules: [...]
  }
}
```

### Output File Formats

#### master-view-prototype.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ABC Pest Control - Master View</title>
    <link rel="stylesheet" href="master-view-styles.css">
</head>
<body>
    <div class="master-view-container">
        <div class="left-column">
            <!-- Account and Service Location entities -->
            <div class="entity-panel account-panel">
                <h3>Account Management</h3>
                <input type="text" placeholder="Preferred Technician" class="pest-control-field">
                <select class="service-frequency pest-control-field">
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Annual</option>
                </select>
            </div>
        </div>
        <div class="center-column">
            <!-- Work Order and Service Item entities -->
        </div>
        <div class="right-column">
            <!-- Invoice and Payment entities -->
        </div>
    </div>
    <script src="master-view-logic.js"></script>
</body>
</html>
```

#### analysis-view-prototype.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ABC Pest Control - Analysis View</title>
    <link rel="stylesheet" href="analysis-view-styles.css">
</head>
<body>
    <div class="analysis-view-container">
        <div class="toolbar">
            <input type="text" placeholder="Filter by pest type" class="filter-input">
            <select class="service-frequency-filter">
                <option value="">All Frequencies</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
            </select>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th sortable>Account Name</th>
                    <th sortable>Service Location</th>
                    <th sortable>Pest Type</th>
                    <th sortable>Treatment History</th>
                    <th sortable>Service Frequency</th>
                </tr>
            </thead>
            <tbody>
                <!-- Dynamic data populated by JavaScript -->
            </tbody>
        </table>
    </div>
    <script src="analysis-view-logic.js"></script>
</body>
</html>
```

#### prototype-manifest.json
```javascript
{
  "build": {
    "timestamp": "2025-09-02T10:00:00Z",
    "version": "2.0.0",
    "stage": "prototypes-generated"
  },
  "prototypes": {
    "masterView": {
      "htmlFile": "master-view-prototype.html",
      "cssFile": "master-view-styles.css",
      "jsFile": "master-view-logic.js",
      "status": "SUCCESS",
      "size": "45.2KB"
    },
    "analysisView": {
      "htmlFile": "analysis-view-prototype.html",
      "cssFile": "analysis-view-styles.css",
      "jsFile": "analysis-view-logic.js",
      "status": "SUCCESS",
      "size": "38.1KB"
    }
  },
  "customization": {
    "domain": "pestControl",
    "client": "ABC Pest Control",
    "customizationsApplied": 8,
    "deploymentReady": true
  },
  "validation": {
    "errors": [...],
    "warnings": [...],
    "summary": "2/2 prototypes generated successfully"
  }
}
```

---

## Dependencies

### Internal Dependencies
- **Base System Loader**: Provides customized system configuration
- **Prototype Line Orchestrator**: Coordinates this component's execution
- **Prototype Assembler**: Receives generated prototype files for packaging

### External Dependencies
- Node.js filesystem APIs for prototype file operations
- HTML templating engines for dynamic content generation
- CSS framework libraries for responsive design
- JavaScript bundling and minification utilities
- Browser compatibility testing tools

---

## Implementation Notes

### Architecture
- Clear separation of Master View and Analysis View generation
- Template-based prototype generation for consistency
- Comprehensive validation pipeline for all prototypes
- Component-based architecture for reusable UI elements

### Prototype Generation Strategy
- Generate all prototype files before writing to filesystem
- Validate all prototypes for functionality before deployment
- Create self-contained prototype packages
- Version control integration for prototype tracking

### Prototype Error Recovery
- Continue generation even if individual view prototypes fail
- Provide detailed error context for prototype debugging
- Support partial prototype generation (e.g., Master View only)
- Clear guidance for fixing common prototype generation issues

---

## Quality Attributes

### Reliability
- Atomic prototype file operations prevent corruption
- Comprehensive validation ensures prototype functionality
- Version tracking and rollback capabilities for prototype deployment
- Complete error reporting and recovery for prototype issues

### Performance
- Target: Generate Master View + Analysis View prototypes in under 10 seconds
- Memory-efficient assembly of complex UI prototypes
- Optimized HTML/CSS/JS generation and bundling
- Real-time progress reporting for prototype generation

### Maintainability
- Template-based prototype generation for consistency
- Clear separation of view generation and file operations
- Well-documented prototype structures and component patterns
- Comprehensive error handling patterns for prototype generation

---

## Testing Strategy

### Unit Tests
- Test prototype generation with various customization combinations
- Test HTML/CSS/JS file generation and validation
- Test error handling for all prototype generation failure scenarios
- Test cross-browser compatibility and responsive design

### Integration Tests
- End-to-end generation with real Base System Loader outputs
- Client deployment testing with generated prototypes
- Performance testing with complex customization sets
- Browser compatibility testing and prototype functionality validation

### Acceptance Tests
- Generate prototypes for real Concept Line configurations
- Verify clients can deploy and interact with generated prototypes
- Test integration with Prototype Line Orchestrator
- Validate prototype functionality and user experience

---

## Acceptance Criteria

### Phase 1 (MVP)
- [ ] Generate Master View prototype (3-column layout)
- [ ] Create Analysis View prototype (spreadsheet interface)
- [ ] Apply domain customizations to prototype interfaces
- [ ] Package deployable HTML/CSS/JS files
- [ ] Handle prototype generation errors gracefully

### Phase 2 (Enhanced)
- [ ] Performance optimization for complex prototype generation
- [ ] Advanced prototype validation and accessibility checks
- [ ] Enhanced error recovery mechanisms for partial prototype failures
- [ ] Prototype versioning and deployment tracking support

### Phase 3 (Production)
- [ ] Production prototype deployment monitoring
- [ ] Automated testing with client environments
- [ ] Performance metrics collection for prototype generation
- [ ] Operational documentation for prototype deployment and maintenance

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

### Risk: Complex Prototype Generation Performance
**Mitigation**: Parallel prototype generation and component caching

### Risk: Prototype Technology Evolution
**Mitigation**: Modular component architecture and framework abstraction

### Risk: Prototype Deployment Complexity
**Mitigation**: Self-contained packages, deployment automation, and comprehensive testing

### Risk: Client Environment Compatibility
**Mitigation**: Cross-browser testing, progressive enhancement, and deployment validation

---

**Status**: Requires Redesign Implementation  
**Priority**: High  
**Estimated Effort**: 4-5 days (includes UI/UX prototype development)