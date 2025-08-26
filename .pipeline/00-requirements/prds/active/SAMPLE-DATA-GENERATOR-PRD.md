# Sample Data Generator - Product Requirements Document
*Realistic Mock Data for Every Stage*

## 1. Purpose

The Sample Data Generator creates realistic, contextually appropriate mock data based on BUSM definitions, enabling proper testing and demonstration of generated components across all factory lines.

## 2. Problem Statement

**Current State:**
- Hardcoded sample data in generators
- Unrealistic "Sample 1, Sample 2" data
- No respect for data types or constraints
- No relationship consistency

**Future State:**
- Intelligent data generation from BUSM
- Realistic, context-aware values
- Constraint-respecting data
- Consistent relationships

## 3. Core Functionality

### 3.1 Data Generation
```javascript
class SampleDataGenerator {
  // Generate single record
  generateRecord(entity: string): Record
  
  // Generate multiple records
  generateRecords(entity: string, count: number): Record[]
  
  // Generate with relationships
  generateWithRelations(entity: string, depth: number): Record
  
  // Generate specific field value
  generateFieldValue(fieldDef: FieldDefinition): any
  
  // Generate dataset
  generateDataset(schema: DatasetSchema): Dataset
}
```

### 3.2 Smart Generation
```javascript
  // Infer from field name
  inferDataType(fieldName: string): DataPattern
  
  // Apply constraints
  applyConstraints(value: any, constraints: Constraints): any
  
  // Ensure uniqueness
  ensureUnique(field: string, existingValues: any[]): any
  
  // Generate related data
  generateRelatedData(relationship: Relationship): any
```

### 3.3 Data Patterns
```javascript
  // Common patterns
  generateEmail(firstName?: string, lastName?: string): string
  generatePhone(format?: string): string
  generateAddress(): Address
  generateCompanyName(): string
  generatePersonName(): { first: string, last: string }
  generateCurrency(min?: number, max?: number): number
  generateDate(start?: Date, end?: Date): Date
  generateStatus(options: string[]): string
```

## 4. Generation Rules

### 4.1 Field Name Intelligence
```javascript
const patterns = {
  // Emails
  'email': () => faker.internet.email(),
  '*Email': () => faker.internet.email(),
  
  // Names
  'firstName': () => faker.person.firstName(),
  'lastName': () => faker.person.lastName(),
  'companyName': () => faker.company.name(),
  '*Name': () => faker.person.fullName(),
  
  // Addresses
  'address': () => faker.location.streetAddress(),
  'city': () => faker.location.city(),
  'state': () => faker.location.state(),
  'zip': () => faker.location.zipCode(),
  
  // Money
  'price': () => faker.commerce.price(),
  'amount': () => faker.finance.amount(),
  '*Revenue': () => faker.finance.amount(10000, 1000000),
  
  // Dates
  'createdAt': () => faker.date.past(),
  'updatedAt': () => faker.date.recent(),
  '*Date': () => faker.date.anytime(),
  
  // Status
  'status': (options) => faker.helpers.arrayElement(options || ['Active', 'Inactive']),
  
  // IDs
  'id': () => faker.string.uuid(),
  '*Id': () => faker.string.uuid()
};
```

### 4.2 Type-Based Generation
```javascript
function generateByType(fieldDef: FieldDefinition) {
  switch(fieldDef.type) {
    case 'string':
      return generateString(fieldDef.constraints);
    case 'number':
      return generateNumber(fieldDef.min, fieldDef.max);
    case 'boolean':
      return faker.datatype.boolean();
    case 'date':
      return generateDate(fieldDef.constraints);
    case 'enum':
      return faker.helpers.arrayElement(fieldDef.options);
    case 'uuid':
      return faker.string.uuid();
    case 'email':
      return faker.internet.email();
    case 'url':
      return faker.internet.url();
    case 'json':
      return generateJSON(fieldDef.schema);
  }
}
```

### 4.3 Constraint Respect
```javascript
function applyConstraints(value: any, constraints: Constraints) {
  // String constraints
  if (constraints.minLength) {
    value = value.padEnd(constraints.minLength, 'x');
  }
  if (constraints.maxLength) {
    value = value.substring(0, constraints.maxLength);
  }
  
  // Number constraints
  if (constraints.min && value < constraints.min) {
    value = constraints.min;
  }
  if (constraints.max && value > constraints.max) {
    value = constraints.max;
  }
  
  // Pattern constraints
  if (constraints.pattern) {
    value = generateFromPattern(constraints.pattern);
  }
  
  return value;
}
```

## 5. Relationship Handling

### 5.1 One-to-One
```javascript
function generateOneToOne(relationship: Relationship) {
  const relatedEntity = generateRecord(relationship.targetEntity);
  return {
    [relationship.foreignKey]: relatedEntity.id,
    [relationship.name]: relatedEntity
  };
}
```

### 5.2 One-to-Many
```javascript
function generateOneToMany(relationship: Relationship, count: number = 3) {
  const relatedRecords = generateRecords(relationship.targetEntity, count);
  return {
    [relationship.name]: relatedRecords,
    [`${relationship.name}Count`]: count
  };
}
```

### 5.3 Many-to-Many
```javascript
function generateManyToMany(relationship: Relationship, count: number = 2) {
  const relatedRecords = generateRecords(relationship.targetEntity, count);
  const junctionRecords = relatedRecords.map(record => ({
    [relationship.sourceForeignKey]: sourceId,
    [relationship.targetForeignKey]: record.id
  }));
  
  return {
    [relationship.name]: relatedRecords,
    [relationship.throughTable]: junctionRecords
  };
}
```

## 6. Usage Examples

### 6.1 Simple Generation
```javascript
const generator = new SampleDataGenerator(busmReader);

// Generate single account
const account = generator.generateRecord('Account');
console.log(account);
// {
//   accountId: 'a4f7b2c1-...',
//   accountName: 'Acme Corporation',
//   status: 'Active',
//   annualRevenue: 2500000,
//   createdAt: '2024-03-15T10:30:00Z'
// }
```

### 6.2 With Relationships
```javascript
// Generate account with contacts
const accountWithContacts = generator.generateWithRelations('Account', 1);
console.log(accountWithContacts);
// {
//   accountId: 'a4f7b2c1-...',
//   accountName: 'Acme Corporation',
//   primaryContact: {
//     contactId: 'c8d9e3f2-...',
//     firstName: 'John',
//     lastName: 'Smith',
//     email: 'john.smith@acme.com'
//   },
//   contacts: [...]
// }
```

### 6.3 Dataset Generation
```javascript
// Generate complete dataset
const dataset = generator.generateDataset({
  accounts: { count: 10, withRelations: true },
  contacts: { count: 30 },
  opportunities: { count: 25 }
});
```

## 7. Integration Points

### 7.1 Concept Generator
```javascript
// Generate sample data for wireframes
const sampleData = dataGenerator.generateRecords('Account', 5);
const html = generateTable(sampleData);
```

### 7.2 Prototype Generator
```javascript
// Generate mock data for React component
const mockData = dataGenerator.generateWithRelations('Account', 2);
const component = generateReactComponent(mockData);
```

### 7.3 Testing
```javascript
// Generate test data
const testData = dataGenerator.generateDataset({
  validAccounts: { count: 5, valid: true },
  invalidAccounts: { count: 3, invalid: true },
  edgeCases: { count: 2, edge: true }
});
```

## 8. Configuration

### 8.1 Generator Config
```json
{
  "locale": "en_US",
  "seed": 12345,
  "defaults": {
    "recordCount": 10,
    "relationshipDepth": 1,
    "nullableChance": 0.1
  },
  "overrides": {
    "Account.accountName": {
      "generator": "company",
      "format": "{{company.name}} {{company.suffix}}"
    }
  }
}
```

### 8.2 Custom Generators
```javascript
// Register custom generator
generator.registerCustom('ssn', () => {
  return `${faker.number.int({min: 100, max: 999})}-` +
         `${faker.number.int({min: 10, max: 99})}-` +
         `${faker.number.int({min: 1000, max: 9999})}`;
});
```

## 9. Success Metrics

- Realistic data that passes validation
- Consistent relationships across entities
- Respects all BUSM constraints
- Deterministic with seed
- Fast generation (< 100ms for 100 records)

## 10. Dependencies

- Faker.js or similar library
- BUSM Reader for schema
- Validation engine

## 11. Future Enhancements

### Phase 2
- Temporal consistency (dates make sense)
- Business rule awareness
- Localization support
- Custom data providers

### Phase 3
- AI-powered realistic data
- Industry-specific datasets
- Data scenarios (happy path, edge cases)
- Export to SQL/JSON/CSV

---

*PRD Version: 1.0.0*
*Status: Basic implementation exists*
*Priority: MEDIUM*