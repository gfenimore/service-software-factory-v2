# Integration Discovery Scanner PRD
## Automated Integration Point Discovery and Validation

**Document Type**: Product Requirements Document  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Draft  
**Owner**: Factory Tools Team  

---

## Executive Summary

The Integration Discovery Scanner is a critical factory tool that automatically discovers integration points in concept-phase HTML output, validates them against available enhancement manifests, and generates actionable reports with auto-generated stub manifests for missing integrations.

## Problem Statement

As concepts are generated, they may contain integration declarations (`data-integration` attributes) that need corresponding enhancement manifests for the prototype phase. Without automated discovery:

- Integration mismatches are discovered late (at prototype generation)
- Missing manifests cause build failures
- Orphaned manifests accumulate over time
- Dependencies between integrations aren't validated
- Manual manifest creation is error-prone

## Goals

### Primary Goals
1. **Discover** all integration points in concept HTML automatically
2. **Validate** integration points against existing manifests
3. **Generate** stub manifests for new integration points
4. **Report** blocking issues before prototype generation
5. **Enforce** integration integrity across factory phases

### Non-Goals
- Does not modify concept HTML
- Does not auto-complete stub manifests (requires human input)
- Does not handle runtime integration selection
- Does not manage integration credentials/secrets

## User Stories

### As a Factory Developer
- I want integration issues caught before prototype generation fails
- I want stub manifests auto-generated for new integrations
- I want clear reports showing what needs fixing

### As a Concept Designer
- I want to declare integrations without worrying about manifests
- I want to know if I'm using an integration incorrectly
- I want to see all available integrations I can use

### As a DevOps Engineer
- I want CI/CD to fail fast on integration issues
- I want orphaned manifests identified for cleanup
- I want dependency chains validated automatically

## Functional Requirements

### 1. HTML Scanning Engine

```javascript
// Scanner configuration
{
  "scan_patterns": [
    "data-integration=\"([^\"]+)\"",
    "data-depends-on=\"([^\"]+)\"",
    "data-enhance=\"([^\"]+)\"",
    "data-enhance-level=\"([^\"]+)\""
  ],
  "scan_locations": [
    "./concept-output/**/*.html",
    "./factory/concepts/**/*.html"
  ],
  "ignore_patterns": [
    "**/node_modules/**",
    "**/archive/**"
  ]
}
```

### 2. Manifest Validation

```javascript
class ManifestValidator {
  validate(discoveredIntegrations, availableManifests) {
    return {
      valid: [],      // Integrations with manifests
      missing: [],    // Integrations without manifests
      orphaned: [],   // Manifests without integrations
      invalid: []     // Manifests with errors
    };
  }
}
```

### 3. Dependency Resolution

```javascript
// Dependency graph builder
{
  "integration": "geographic-display",
  "dependencies": ["address-validation"],
  "validation": {
    "address-validation": {
      "found": false,
      "locations": [],
      "error": "Required dependency not found in concept"
    }
  }
}
```

### 4. Stub Generation

```yaml
# Generated stub structure
integration-name:
  _metadata:
    generated_by: "integration-discovery-scanner"
    generated_at: "2025-01-23T10:30:00Z"
    source_files: ["pages/example.html"]
    status: "stub"
    
  concept:
    render: "placeholder"
    label: "[TODO: Define label]"
    purpose: "[TODO: Define purpose]"
    
  prototype:
    integration: "[TODO: Select integration]"
    features: []
    
  production:
    integration: "[TODO: Configure production]"
```

### 5. Report Generation

```markdown
# Integration Discovery Report

## Statistics
- Files Scanned: 47
- Integration Points Found: 23
- Valid Integrations: 20
- Issues Found: 3

## Blocking Issues
[List of must-fix issues]

## Warnings
[List of should-fix issues]

## Recommendations
[Suggested improvements]
```

## Technical Architecture

### Component Structure

```
integration-discovery-scanner/
├── index.js                 # Main entry point
├── scanner/
│   ├── html-parser.js      # HTML parsing logic
│   ├── pattern-matcher.js  # Regex pattern matching
│   └── file-walker.js      # File system traversal
├── validator/
│   ├── manifest-validator.js
│   ├── dependency-resolver.js
│   └── rule-engine.js
├── generator/
│   ├── stub-generator.js
│   ├── report-generator.js
│   └── templates/
├── config/
│   ├── default-config.json
│   └── patterns.json
└── tests/
```

### Data Flow

```
Concept HTML → Scanner → Discovery Map → Validator → Report
                                ↓
                          Stub Generator → Manifest Stubs
```

### Integration Points

1. **Input**: Concept HTML files
2. **Configuration**: Manifest directory, patterns, rules
3. **Output**: Discovery report, stub manifests
4. **CI/CD**: Exit codes, structured output

## Implementation Phases

### Phase 1: Core Scanner (Week 1-2)
- HTML parsing and pattern matching
- Basic discovery map generation
- Simple console output

### Phase 2: Validation Engine (Week 2-3)
- Manifest validation
- Dependency resolution
- Issue categorization

### Phase 3: Generation & Reporting (Week 3-4)
- Stub manifest generation
- HTML/Markdown report generation
- CI/CD integration

### Phase 4: Advanced Features (Week 4-5)
- Caching for performance
- Watch mode for development
- IDE integration

## Success Metrics

1. **Discovery Coverage**: 100% of integration points discovered
2. **False Positive Rate**: <1% incorrect issue reports
3. **Build Time Impact**: <2 seconds added to build
4. **Stub Usefulness**: >90% of stubs require minimal editing
5. **Developer Satisfaction**: Reduced integration-related build failures

## Configuration

### Default Configuration

```json
{
  "scanner": {
    "enabled": true,
    "paths": ["./concept-output"],
    "patterns": ["data-integration", "data-enhance"],
    "ignore": ["**/archive/**"]
  },
  "validator": {
    "strict": false,
    "require_dependencies": true,
    "allow_orphans": false
  },
  "generator": {
    "create_stubs": true,
    "stub_location": "./factory/integrations/stubs",
    "report_format": ["console", "markdown", "json"]
  },
  "ci": {
    "fail_on_missing": true,
    "fail_on_orphans": false,
    "exit_codes": {
      "success": 0,
      "warnings": 0,
      "errors": 1
    }
  }
}
```

## API Design

### CLI Interface

```bash
# Run discovery
$ node factory-tools/integration-discovery-scanner

# With options
$ node factory-tools/integration-discovery-scanner \
  --config=custom-config.json \
  --output=report.md \
  --generate-stubs \
  --strict

# Watch mode
$ node factory-tools/integration-discovery-scanner --watch
```

### Programmatic API

```javascript
const scanner = require('./integration-discovery-scanner');

// Run discovery
const result = await scanner.discover({
  paths: ['./concepts'],
  generateStubs: true
});

// Check results
if (result.hasBlockingIssues()) {
  console.error(result.getBlockingIssues());
  process.exit(1);
}
```

## Error Handling

### Error Categories

1. **Blocking Errors** (Exit 1)
   - Missing required manifests
   - Circular dependencies
   - Invalid manifest syntax

2. **Warnings** (Exit 0)
   - Orphaned manifests
   - Deprecated integrations
   - Performance concerns

3. **Info** (Exit 0)
   - Suggestions for improvement
   - Statistics and metrics

## Testing Strategy

### Unit Tests
- Pattern matching accuracy
- Dependency resolution logic
- Stub generation templates

### Integration Tests
- Full pipeline execution
- Various HTML structures
- Edge cases and errors

### Test Fixtures
```
tests/fixtures/
├── concept-html/
│   ├── valid/
│   ├── missing-manifests/
│   └── circular-deps/
├── manifests/
│   ├── complete/
│   └── invalid/
└── expected-outputs/
```

## Documentation Requirements

1. **User Guide**: How to use the scanner
2. **Configuration Guide**: All options explained
3. **Integration Guide**: CI/CD setup
4. **Troubleshooting**: Common issues and solutions
5. **Pattern Reference**: Supported HTML patterns

## Dependencies

- **No external dependencies** (per factory principles)
- Pure Node.js implementation
- File system access only
- Console output capabilities

## Future Enhancements

1. **Visual Dashboard**: Web UI for discovery reports
2. **Auto-fix Capability**: Automated issue resolution
3. **Historical Tracking**: Track integration usage over time
4. **Smart Suggestions**: AI-powered manifest completion
5. **Cross-project Scanning**: Scan multiple projects

## Acceptance Criteria

- [ ] Scans all concept HTML files successfully
- [ ] Identifies 100% of integration declarations
- [ ] Validates against manifest library
- [ ] Generates accurate discovery reports
- [ ] Creates usable stub manifests
- [ ] Integrates with CI/CD pipeline
- [ ] Provides clear, actionable error messages
- [ ] Completes scan in <5 seconds for typical project
- [ ] Maintains zero external dependencies
- [ ] Includes comprehensive test coverage

## Appendix

### Sample Discovery Report

```markdown
# Integration Discovery Report
Generated: 2025-01-23 10:30:00

## Summary
✅ 20 valid integrations
❌ 2 missing manifests (BLOCKING)
⚠️  3 orphaned manifests (WARNING)

## Required Actions

### 1. Create Manifest: payment-processing
Used in: billing.html, invoice.html
Stub generated: ./integrations/stubs/payment-processing.yaml

### 2. Create Manifest: notification-service  
Used in: alerts.html
Stub generated: ./integrations/stubs/notification-service.yaml

## Cleanup Suggestions
- Remove unused manifest: legacy-geocoding
- Archive manifest: old-payment-gateway

## Next Steps
1. Complete stub manifests
2. Run scanner again to verify
3. Proceed with prototype generation
```