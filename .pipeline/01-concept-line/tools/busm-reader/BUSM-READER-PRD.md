# BUSM Reader - Product Requirements Document
*The Single Source of Truth Interface*

## 1. Purpose

The BUSM Reader provides a unified interface to access Business Unified Schema Model (BUSM) data. It serves as the authoritative source for entity definitions, relationships, constraints, and business metadata across all factory lines.

## 2. Problem Statement

**Current State:**
- Entity definitions scattered across configs
- Relationships defined in multiple places
- No single source of truth
- Generators make assumptions about data types

**Future State:**
- One BUSM, one reader
- All generators query BUSM for truth
- Consistent data definitions across lines
- No assumptions about entities

## 3. Core Functionality

### 3.1 Entity Operations
```javascript
class BUSMReader {
  // Get complete entity definition
  getEntity(entityName: string): EntityDefinition
  
  // Get all entities
  getAllEntities(): EntityDefinition[]
  
  // Check if entity exists
  hasEntity(entityName: string): boolean
  
  // Get entity primary key
  getPrimaryKey(entityName: string): string
}
```

### 3.2 Field Operations
```javascript
  // Get field definition
  getField(entityName: string, fieldPath: string): FieldDefinition
  
  // Get all fields for entity
  getFields(entityName: string): FieldDefinition[]
  
  // Get field type
  getFieldType(entityName: string, fieldPath: string): DataType
  
  // Get field constraints
  getFieldConstraints(entityName: string, fieldPath: string): Constraints
```

### 3.3 Relationship Operations
```javascript
  // Get relationship definition
  getRelationship(fromEntity: string, relationName: string): Relationship
  
  // Get all relationships for entity
  getRelationships(entityName: string): Relationship[]
  
  // Get inverse relationship
  getInverseRelationship(relationship: Relationship): Relationship
  
  // Check if fields are related
  areRelated(entity1: string, entity2: string): boolean
```

### 3.4 Validation Operations
```javascript
  // Get validation rules for field
  getValidationRules(entityName: string, fieldPath: string): ValidationRule[]
  
  // Get required fields
  getRequiredFields(entityName: string): string[]
  
  // Validate data against BUSM
  validateData(entityName: string, data: any): ValidationResult
```

## 4. Data Structures

### 4.1 BUSM Schema
```typescript
interface BUSMSchema {
  version: string;
  entities: Record<string, EntityDefinition>;
  relationships: Record<string, Relationship>;
  enums: Record<string, EnumDefinition>;
  metadata: Metadata;
}

interface EntityDefinition {
  name: string;
  tableName?: string;
  primaryKey: string;
  fields: Record<string, FieldDefinition>;
  indexes?: Index[];
  triggers?: Trigger[];
}

interface FieldDefinition {
  name: string;
  type: DataType;
  required?: boolean;
  unique?: boolean;
  default?: any;
  constraints?: Constraints;
  validation?: ValidationRule[];
  metadata?: FieldMetadata;
}

interface Relationship {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  from: string;
  to: string;
  foreignKey?: string;
  throughTable?: string;
  cascade?: CascadeOptions;
}
```

## 5. Integration Points

### 5.1 ViewForge Transformer
```javascript
const busm = new BUSMReader();
const entity = busm.getEntity('Account');
const relationships = busm.getRelationships('Account');
```

### 5.2 Generators
```javascript
// Concept Generator
const fieldType = busm.getFieldType('Account', 'balance');
const displayHint = fieldType === 'decimal' ? 'currency' : 'text';

// Prototype Generator
const constraints = busm.getFieldConstraints('Account', 'accountName');
const maxLength = constraints.maxLength || 255;
```

### 5.3 Gap Logger
```javascript
if (!busm.hasEntity(entityName)) {
  gapLogger.log({
    category: 'MISSING_ENTITY',
    entity: entityName,
    severity: 'CRITICAL'
  });
}
```

## 6. Implementation Requirements

### 6.1 Must Have
- Load BUSM from JSON file
- Cache loaded data for performance
- Provide synchronous access (pre-loaded)
- Handle nested field paths (e.g., 'contact.email')

### 6.2 Should Have
- Validate BUSM schema on load
- Support multiple BUSM versions
- Provide field path resolution
- Include metadata access

### 6.3 Nice to Have
- Hot reload on BUSM changes
- Query language support
- Schema migration tools
- Visual BUSM editor

## 7. Success Metrics

- All generators use BUSM Reader
- Zero hardcoded entity definitions
- 100% field types from BUSM
- All relationships defined once

## 8. Technical Specifications

### 8.1 File Format
```json
{
  "version": "1.0.0",
  "entities": {
    "Account": {
      "primaryKey": "accountId",
      "fields": {
        "accountId": {
          "type": "uuid",
          "required": true,
          "primaryKey": true
        },
        "accountName": {
          "type": "string",
          "required": true,
          "constraints": {
            "minLength": 3,
            "maxLength": 100
          }
        }
      }
    }
  }
}
```

### 8.2 Usage Example
```javascript
const busm = new BUSMReader('./busm-model.json');

// Get entity
const account = busm.getEntity('Account');
console.log(account.primaryKey); // 'accountId'

// Get field type
const fieldType = busm.getFieldType('Account', 'balance');
console.log(fieldType); // 'decimal'

// Get relationships
const relationships = busm.getRelationships('Account');
console.log(relationships); // [{ type: 'one-to-many', to: 'Contact', ... }]
```

## 9. Dependencies

- File system access for JSON loading
- JSON schema validator
- Path resolver for nested fields

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| BUSM file corruption | High | Validate on load, keep backups |
| Performance with large schemas | Medium | Implement caching |
| Version conflicts | Medium | Support versioning |

---

*PRD Version: 1.0.0*
*Status: Critical - Needed for all generators*
*Priority: HIGH*