# Concept Line Generator - Product Requirements Document

## 1. The Core Context

### Problem Statement

**Current Conditions:**
For **ViewForge operators** who have configured UI requirements, the following conditions exist:
1. **No way to verify configuration completeness** - The JSON is abstract and hard to visualize
2. **No rapid feedback loop** - Can't tell if configuration is correct until fully generated
3. **Framework coupling too early** - Jumping straight to React/Vue hides configuration errors
4. **Missing field discovery too late** - Don't know what's missing until production
5. **Ambiguous requirements** - Stakeholders can't validate JSON configurations

**Impacts of These Conditions:**
These conditions result in:
- **Wasted development cycles** - Building React/Vue components with incomplete configurations
- **Late error discovery** - Finding missing fields only after prototype development
- **Stakeholder confusion** - "That's not what I meant" after seeing styled versions
- **Configuration drift** - Each line interprets the configuration differently
- **Blocked progress** - Can't proceed confidently without validation
- **Rework cascades** - Fixing configuration errors requires regenerating all downstream lines

**Our Solution:**
The Concept Line Generator provides **immediate, visual validation** of configurations through **pure HTML output** that proves the configuration is complete and correct before any framework or styling investment. This generator produces **black and white, semantic HTML** that makes configuration problems obvious and enables rapid iteration.

### Product Philosophy
The Concept Line Generator embodies the principle: **"If it doesn't work in black and white, colors won't save it."**

### High-Level Goals & Metrics

1. **100% Configuration Coverage**
   - **Metric:** Every field in configuration appears in output
   - **Measurement:** Field count in JSON vs elements in HTML

2. **Zero Dependencies**
   - **Metric:** Output runs in any browser with no build step
   - **Measurement:** HTML file opens directly, no 404s

3. **Semantic HTML Only**
   - **Metric:** HTML validates with zero errors
   - **Measurement:** W3C validator pass rate

4. **Generation Speed**
   - **Metric:** < 100ms for typical configuration
   - **Measurement:** Time from JSON input to HTML output

5. **Black & White Enforcement**
   - **Metric:** Zero color CSS properties in output
   - **Measurement:** Automated scan for color/background properties

## 2. User Personas

### Primary: ViewForge Operator
- **Job:** Generate proof-of-concept HTML from configuration
- **Success:** HTML accurately represents configured view
- **Pain Points:** Manual HTML creation, missing fields, broken layouts

### Secondary: Quality Validator
- **Job:** Verify configuration produces expected output
- **Success:** Can validate all fields present and correct
- **Pain Points:** Can't tell if configuration is complete

### Tertiary: Next Line Consumer
- **Job:** Use concept output as reference for prototype
- **Success:** Clear understanding of required structure
- **Pain Points:** Concept output has hidden assumptions

## 3. Technical Specifications

### Input Contract
```typescript
interface ConceptGeneratorInput {
  version: string;  // ViewForge version
  hierarchy: {
    application: { id: string; name: string; };
    module: { id: string; name: string; };
    subModule: { id: string; name: string; };
    userStory: { id: string; code: string; title: string; };
  };
  scope: {
    level: 'app' | 'module' | 'submodule' | 'story';
    path: string;
  };
  entity: {
    primary: string;
    related: string[];
  };
  fields: Array<{
    entity: string;
    field: string;
    label: string;
    type: string;
    isRelated: boolean;
  }>;
  layout: {
    type: 'table' | 'list' | 'detail';
    features: {
      sorting: boolean;
      pagination: boolean;
      filtering: boolean;
    };
  };
}
```

### Output Contract
```html
<!-- Generated HTML Structure -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>[Story Code]: [Entity] [View Type]</title>
    <style>
        /* Minimal B&W styles only */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>
    <!-- Hierarchy breadcrumb -->
    <!-- View title -->
    <!-- Generated content based on layout type -->
    <!-- Metadata footer -->
</body>
</html>
```

## 4. Functional Requirements

### Feature 1: Parse ViewForge Configuration
**Job:** When receiving JSON configuration, parse and validate it so generation can proceed safely.

**Acceptance Criteria:**
- Validates JSON structure matches expected schema
- Identifies missing required fields
- Extracts all configuration elements
- Returns clear errors for invalid input

### Feature 2: Generate Table Layout
**Job:** When layout type is 'table', generate semantic HTML table with configured fields as columns.

**Acceptance Criteria:**
- Creates `<table>` with `<thead>` and `<tbody>`
- One `<th>` per configured field with label
- Includes data-* attributes for field metadata
- Handles related fields with dot notation

### Feature 3: Generate List Layout
**Job:** When layout type is 'list', generate semantic HTML unordered list.

**Acceptance Criteria:**
- Creates `<ul>` with `<li>` per record
- Shows configured fields within each item
- Uses semantic HTML (`<dl>`, `<dt>`, `<dd>` for field/value pairs)

### Feature 4: Generate Detail Layout
**Job:** When layout type is 'detail', generate semantic HTML for single record view.

**Acceptance Criteria:**
- Creates definition list (`<dl>`) structure
- One `<dt>`/`<dd>` pair per field
- Groups related fields in `<fieldset>` elements

### Feature 5: Add Metadata
**Job:** When generating any layout, include configuration metadata for traceability.

**Acceptance Criteria:**
- Adds HTML comments with generation timestamp
- Includes configuration version in meta tag
- Adds data attributes for hierarchy context
- Footer with generation info

### Feature 6: Generate Sample Data
**Job:** When generating views, create realistic sample data based on field types.

**Sample Data Rules:**
```javascript
{
  'string': ['Acme Corp', 'Global Inc', ...],
  'uuid': ['550e8400-e29b-...', ...],
  'enum': [rotate through provided options],
  'email': ['contact@example.com', ...],
  'date': ['2024-01-15', '2024-02-20', ...],
  'boolean': [true, false, true, ...],
  'number': [100, 250, 175, ...]
}
```

## 5. Non-Functional Requirements

### Performance
- Generation time < 100ms for configs with < 50 fields
- Memory usage < 50MB
- Support for 1000+ record sample data

### Reliability
- Zero runtime errors for valid input
- Graceful degradation for missing fields
- Deterministic output (same input = same output)

### Maintainability
- Single responsibility (only generates HTML)
- No external dependencies
- Clear separation of parsing, generation, output

### Compatibility
- Output works in all modern browsers
- Valid HTML5
- No JavaScript required to view
- Print-friendly

## 6. Technical Architecture

### Module Structure
```
concept-generator/
├── index.js           # Main entry point
├── parser.js          # Configuration parser
├── generators/
│   ├── table.js      # Table layout generator
│   ├── list.js       # List layout generator
│   └── detail.js     # Detail layout generator
├── sample-data.js     # Sample data generator
├── validator.js       # Input validation
└── tests/
    └── fixtures/      # Test configurations
```

### Core Algorithm
```javascript
function generateConcept(config) {
  // 1. Validate input
  const validation = validator.validate(config);
  if (!validation.valid) throw validation.errors;
  
  // 2. Parse configuration
  const parsed = parser.parse(config);
  
  // 3. Select generator based on layout type
  const generator = generators[parsed.layout.type];
  
  // 4. Generate HTML
  const html = generator.generate(parsed);
  
  // 5. Add metadata
  const final = metadata.wrap(html, parsed);
  
  return final;
}
```

## 7. Success Criteria

### Sprint 1 (MVP)
- [ ] Parse ViewForge v3 configuration
- [ ] Generate table layout with all fields
- [ ] Include sample data (5 rows)
- [ ] Output valid HTML file

### Sprint 2 (Complete)
- [ ] Support list and detail layouts
- [ ] Add metadata and traceability
- [ ] Validate against schema
- [ ] Generate appropriate sample data per type

### Sprint 3 (Production-Ready)
- [ ] Performance optimizations
- [ ] Comprehensive error messages
- [ ] Test coverage > 90%
- [ ] Documentation complete

## 8. Constraints & Principles

### Must Have
- Pure HTML output (no JavaScript)
- Black and white only (no colors)
- Semantic HTML elements
- Valid W3C HTML5

### Must Not Have
- CSS frameworks
- JavaScript functionality
- External dependencies
- Build steps

### Principles
1. **Clarity over beauty** - Clear labels, obvious structure
2. **Completeness over features** - Every field visible
3. **Simplicity over cleverness** - Straightforward HTML
4. **Proof over production** - Validate the concept

## 9. Test Strategy

### Unit Tests
- Parser correctly extracts all fields
- Each generator produces valid HTML
- Sample data matches field types

### Integration Tests
- End-to-end: JSON in → HTML out
- Various configuration combinations
- Related field handling

### Validation Tests
- W3C HTML validation
- No color properties
- All fields present in output

## 10. Future Enhancements (Post-MVP)

1. **Multiple layouts in one output** - Show table + detail views
2. **Accessibility annotations** - ARIA labels, semantic roles
3. **Responsive indicators** - Show breakpoint markers
4. **Field validation rules** - Display in comments
5. **Relationship diagrams** - ASCII art for related entities

---

## Appendices

### A. Sample Input/Output

**Input:** [Account List Configuration from ViewForge v3]

**Output:** [HTML table with Account fields and sample data]

### B. Error Messages

- `INVALID_SCHEMA`: Configuration doesn't match expected structure
- `MISSING_FIELDS`: No fields specified in configuration
- `UNKNOWN_LAYOUT`: Layout type not supported
- `INVALID_FIELD_TYPE`: Field type not recognized

---

*PRD Version: 1.0.0*
*Created: 2025-01-22*
*Status: Draft - Awaiting Implementation*