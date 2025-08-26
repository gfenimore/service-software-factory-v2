# Product Requirements Document (PRD)
## BUSM Mermaid Parser

### Document Information
- **Version**: 1.0.0
- **Date**: 2025-08-25
- **Author**: Pipeline Team
- **Status**: Implemented

## 1. Executive Summary

### Product Overview
The BUSM Mermaid Parser is a specialized parsing engine that reads Business Understanding Semantic Model (BUSM) diagrams in Mermaid format (.mmd) and converts them into structured JSON representations for pipeline consumption.

### Problem Statement
BUSM diagrams are authored in Mermaid format for human readability and version control benefits, but pipeline tools require structured JSON for processing. Manual conversion is error-prone and defeats automation goals.

### Solution
A bidirectional parser that reads Mermaid diagram syntax, extracts entities and relationships, and produces BUSM JSON while supporting subset extraction based on feature requirements.

## 2. Objectives & Goals

### Primary Objectives
1. Parse Mermaid BUSM diagrams accurately
2. Extract entity subsets for specific features
3. Maintain relationship integrity
4. Support bidirectional conversion

### Success Metrics
- 100% syntax compatibility with Mermaid
- < 1 second parsing time
- Zero data loss in conversion
- Subset extraction accuracy 100%

## 3. Functional Requirements

### Core Features

#### F1: Mermaid Parsing
- **F1.1**: Parse graph declarations (TD, LR)
- **F1.2**: Extract entity definitions
- **F1.3**: Parse relationships and cardinalities
- **F1.4**: Handle attributes and methods

#### F2: Entity Processing
- **F2.1**: Extract entity ID and name
- **F2.2**: Parse entity attributes
- **F2.3**: Identify visibility modifiers (+, -, #)
- **F2.4**: Capture data types

#### F3: Relationship Processing
- **F3.1**: Parse association arrows (-->)
- **F3.2**: Handle inheritance (--|>)
- **F3.3**: Process composition (==>)
- **F3.4**: Extract relationship labels

#### F4: Subset Extraction
- **F4.1**: Filter entities by name list
- **F4.2**: Include related relationships
- **F4.3**: Maintain referential integrity
- **F4.4**: Preserve metadata

#### F5: Format Conversion
- **F5.1**: Mermaid to BUSM JSON
- **F5.2**: BUSM JSON to Mermaid
- **F5.3**: Preserve all information
- **F5.4**: Handle edge cases

### Supported Syntax

#### Entity Definition
```mermaid
Account["Account|+id: string|+name: string|-balance: number"]
```

#### Relationship Types
```mermaid
Account --> User          %% Association
Account --|> BaseEntity   %% Inheritance  
Account ==> Transaction   %% Composition
Account -.-> Service      %% Dependency
```

## 4. Technical Requirements

### Input Formats
1. `.mmd` files (Mermaid diagrams)
2. `.mermaid` files
3. Raw Mermaid string content
4. BUSM JSON for reverse conversion

### Output Format
```javascript
{
  metadata: {
    version: "1.0.0",
    created: "ISO-8601",
    source: "mermaid-parser"
  },
  entities: [
    {
      id: "Account",
      name: "Account",
      type: "Entity",
      attributes: [
        {
          name: "id",
          type: "string",
          visibility: "public"
        }
      ]
    }
  ],
  relationships: [
    {
      source: "Account",
      target: "User",
      type: "association",
      label: "belongs to",
      sourceEntity: "Account",
      targetEntity: "User"
    }
  ]
}
```

## 5. Non-Functional Requirements

### Performance
- **NFR1**: Parse 1000-line diagram < 1 second
- **NFR2**: Memory usage < 50MB
- **NFR3**: Support streaming for large files

### Reliability
- **NFR4**: Handle malformed syntax gracefully
- **NFR5**: Preserve unparseable content
- **NFR6**: Detailed error reporting

### Compatibility
- **NFR7**: Support Mermaid v8.0+
- **NFR8**: Node.js 14+ compatibility
- **NFR9**: Browser-compatible core

## 6. Parser Architecture

### Class Structure
```javascript
class MermaidBUSMParser {
  entities: Map<string, Entity>
  relationships: Relationship[]
  
  parseMermaidFile(path)
  parseMermaidContent(content)
  extractSubset(entities)
  toBUSMFormat()
  toMermaid(busm)
}
```

### Parsing Pipeline
```
Mermaid Text
    ↓
Line Tokenizer
    ↓
Entity Parser ←→ Relationship Parser
    ↓
BUSM Builder
    ↓
JSON Output
```

## 7. Error Handling

### Parse Errors
| Error Type | Handling | Example |
|------------|----------|---------|
| Unknown syntax | Skip line, log warning | `Account <>-- User` |
| Missing ID | Generate from label | `["Account Entity"]` |
| Invalid attribute | Ignore attribute | `+name: unknown_type` |
| Circular reference | Allow, flag in output | `A --> B --> A` |

### Recovery Strategies
1. Continue parsing on error
2. Collect all errors for reporting
3. Provide line numbers
4. Suggest corrections

## 8. Integration

### With BUSM Reader
```javascript
const BUSMReader = require('./busm-reader');
const reader = new BUSMReader();

// Handles both .mmd and .json
const busm = reader.read('BUSM.mmd');
const subset = reader.extractSubset('BUSM.mmd', ['Account']);
```

### With Pipeline
```javascript
// Stage 1: Requirements
const parser = new MermaidBUSMParser();
const busm = parser.parseMermaidFile(busmPath);
const subset = parser.extractSubset(requiredEntities);
```

## 9. Testing Strategy

### Unit Tests
- Entity parsing variations
- Relationship type detection
- Attribute extraction
- Subset filtering

### Integration Tests
- File reading
- Format conversion
- Error handling
- Large file performance

### Test Cases
```javascript
// Valid entity with attributes
"Account[Account|+id: string|+name: string]"

// Inheritance relationship
"Account --|> BaseEntity"

// Entity without attributes
"User[User]"

// Complex relationship with label
"Account -->|owns| Transaction"
```

## 10. Documentation

### API Documentation
```javascript
/**
 * Parse a Mermaid file into BUSM format
 * @param {string} filePath - Path to .mmd file
 * @returns {BUSM} Parsed BUSM object
 */
parseMermaidFile(filePath)

/**
 * Extract subset of entities and their relationships
 * @param {string[]} entities - Entity names to extract
 * @returns {BUSM} Filtered BUSM object
 */
extractSubset(entities)
```

## 11. Future Enhancements

### Phase 2
- [ ] Validation rules
- [ ] Custom attributes
- [ ] Namespace support
- [ ] Multiple diagram merge

### Phase 3
- [ ] Visual diagram generation
- [ ] Diff comparison
- [ ] Schema validation
- [ ] Import from other formats

## 12. Success Criteria

### Acceptance Criteria
- [x] Parses BUSM.mmd successfully
- [x] Extracts Account entity subset
- [x] Preserves all relationships
- [x] Generates valid JSON

### Quality Metrics
- Zero data loss in conversion
- 100% backward compatible
- < 100ms typical parse time

## 13. Dependencies

### Runtime Dependencies
- Node.js fs module
- Path module

### Development Dependencies
- Jest for testing
- ESLint for code quality

## 14. Appendix

### A. Mermaid Syntax Reference
```mermaid
graph TD
  %% Entity with attributes
  Entity[Name|+public|-private|#protected]
  
  %% Relationships
  A --> B         %% Association
  A --|> B        %% Inheritance
  A --o B         %% Aggregation
  A --* B         %% Composition
  A -.-> B        %% Dependency
  A -- text --> B %% Labeled
```

### B. BUSM JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "metadata": { "type": "object" },
    "entities": { 
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name"]
      }
    },
    "relationships": {
      "type": "array"
    }
  }
}
```

---
*End of PRD - BUSM Mermaid Parser v1.0.0*