# Stage 1: Filtering Criteria & Completeness Definition

## 🎯 How Filtering Criteria is Established

### Input Analysis Process

1. **Feature Spec Analysis** (`analyzeFeatureSpec()`)
   ```markdown
   Example Feature Spec:
   "As a user, I want to view a list of accounts with their names, emails, 
   and associated users so I can manage customer relationships."
   ```
   
   **Extraction Logic:**
   - **Primary Entity**: "accounts" → `Account`
   - **Mentioned Entities**: "users" → `User`
   - **Implied Relationships**: "accounts with...users" → `Account-User relationship`
   - **Required Fields**: "names, emails" → `Account.name, Account.email`

2. **Entity Relationship Traversal** (`findRelatedEntities()`)
   ```
   Starting from Account (primary):
   ├── Direct relationships in BUSM:
   │   ├── Account → User (Account.userId)
   │   ├── Account → Organization (Account.organizationId)
   │   └── Account → Address (Account.addressId)
   └── Filter decision:
       ├── User: ✓ INCLUDE (mentioned in feature spec)
       ├── Organization: ✓ INCLUDE (direct relationship, likely needed)
       └── Address: ? EVALUATE (not mentioned, decide based on rules)
   ```

3. **Filtering Rules Applied**
   ```javascript
   const filteringCriteria = {
     // Always include
     primary: 'Account',           // From feature spec analysis
     required: ['User'],           // Explicitly mentioned
     
     // Evaluate for inclusion
     related: ['Organization', 'Address'],  // Direct relationships
     
     // Exclude (not relevant)
     excluded: ['Invoice', 'Payment', 'Audit']  // No relationship or mention
   };
   ```

### Decision Matrix

| Entity | Mentioned in Spec | Direct Relationship | Decision | Reason |
|--------|------------------|-------------------|----------|---------|
| Account | ✓ (Primary) | N/A | **INCLUDE** | Primary entity |
| User | ✓ (Explicit) | Account → User | **INCLUDE** | Required for feature |
| Organization | ✗ | Account → Organization | **INCLUDE** | Direct relationship, likely context |
| Address | ✗ | Account → Address | **EVALUATE** | May be needed for display |
| Invoice | ✗ | ✗ | **EXCLUDE** | Not relevant to account list |
| Payment | ✗ | ✗ | **EXCLUDE** | Not relevant to account list |

---

## 📊 How Completeness is Defined

### 1. Field Completeness

**Definition**: All fields mentioned or implied in the feature spec must exist in the BUSM model.

```javascript
// From feature spec: "view accounts with names, emails, and status"
const requiredFields = {
  Account: [
    'name',     // Explicitly mentioned: "names"
    'email',    // Explicitly mentioned: "emails"  
    'status',   // Implied: needed for business logic
    'id'        // Always required: primary key
  ],
  User: [
    'name',     // For "associated users" display
    'role',     // Implied: user management context
    'id'        // Always required: primary key
  ]
};
```

**Completeness Check Logic:**
```
For each required field:
  1. Does the entity exist in BUSM? 
     - If NO → Log gap: "Missing entity {entityName}"
  2. Does the field exist on the entity?
     - If NO → Log gap: "Missing field {entity}.{field}"
  3. Is the field type appropriate?
     - If NO → Log gap: "Invalid field type {entity}.{field}"
```

### 2. Operation Completeness

**Definition**: All operations implied by the feature spec must have corresponding business rules.

```javascript
// From feature spec: "manage customer relationships"
const requiredOperations = [
  'READ',    // "view a list" → need read operations
  'CREATE',  // "manage" implies ability to create
  'UPDATE',  // "manage" implies ability to update  
  'DELETE'   // "manage" implies ability to delete
];
```

**Completeness Check:**
```
For each required operation:
  1. Do business rules exist for this operation?
     - If NO → Generate default rules
  2. Are validation rules defined?
     - If NO → Log gap: "Missing validation for {operation}"
  3. Are authorization rules defined?
     - If NO → Log gap: "Missing authorization for {operation}"
```

### 3. Relationship Completeness

**Definition**: All relationships mentioned or needed for the feature must be properly defined.

```javascript
// From feature spec: "accounts with their associated users"
const requiredRelationships = [
  {
    from: 'Account',
    to: 'User', 
    type: 'one-to-many',
    field: 'userId' or 'users[]'
  },
  {
    from: 'Account',
    to: 'Organization',
    type: 'many-to-one', 
    field: 'organizationId'
  }
];
```

**Completeness Check:**
```
For each required relationship:
  1. Is the relationship defined in BUSM?
     - If NO → Log gap: "Missing relationship {from}-{to}"
  2. Is the foreign key field present?
     - If NO → Log gap: "Missing foreign key {from}.{field}"
  3. Is the relationship type correct?
     - If NO → Log gap: "Incorrect relationship type {from}-{to}"
```

---

## 🔍 Gap Analysis Examples

### Example 1: Missing Field Gap
```json
{
  "type": "MISSING_FIELD",
  "entity": "Account", 
  "field": "email",
  "severity": "HIGH",
  "message": "Feature spec requires Account.email for display, but field not defined in BUSM",
  "suggestedFix": "Add email: string field to Account entity in BUSM.mmd",
  "impactedFeatures": ["account-list-view"]
}
```

### Example 2: Missing Operation Rules Gap
```json
{
  "type": "MISSING_OPERATION_RULES",
  "operation": "CREATE",
  "entity": "Account",
  "severity": "MEDIUM", 
  "message": "Feature implies account creation capability, but no CREATE rules defined",
  "suggestedFix": "Define validation rules for Account creation in business-rules.json",
  "defaultGenerated": true
}
```

### Example 3: Unclear Relationship Gap
```json
{
  "type": "UNCLEAR_RELATIONSHIP",
  "from": "Account",
  "to": "User", 
  "severity": "MEDIUM",
  "message": "Feature spec mentions 'accounts with users' but relationship cardinality unclear",
  "suggestedFix": "Clarify if Account has one User or multiple Users in BUSM model",
  "assumedDefault": "one-to-many"
}
```

---

## 🎯 Completeness Scoring

```javascript
const completenessScore = {
  fieldCompleteness: (foundFields / requiredFields) * 100,
  operationCompleteness: (definedOperations / requiredOperations) * 100, 
  relationshipCompleteness: (definedRelationships / requiredRelationships) * 100,
  
  overallScore: (fieldCompleteness + operationCompleteness + relationshipCompleteness) / 3
};

// Example result:
// {
//   fieldCompleteness: 75%,     // 3/4 required fields found
//   operationCompleteness: 50%, // 2/4 operations have rules  
//   relationshipCompleteness: 100%, // 2/2 relationships defined
//   overallScore: 75%
// }
```

This gives you **specific, actionable gaps** that can be addressed before moving to Stage 2, ensuring higher quality downstream processing.