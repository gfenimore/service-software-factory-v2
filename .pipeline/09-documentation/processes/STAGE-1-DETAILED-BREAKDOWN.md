# Stage 1: Requirements Capture - Detailed Breakdown
*Clarifying the Entity Definition Process*

## The Question: Define Entity - What Does This Mean?

**Short Answer**: YES and NO - it's both consuming AND translating.

- **YES**: We consume the BUSM (ER Diagram/Data Model)
- **NO**: We don't just copy it - we translate and enhance it for the specific module

## What "Define Entity" Actually Means

### 1. CONSUME from BUSM (Source of Truth)
```
BUSM (Enterprise Model)           Module Definition (Specific Use Case)
┌─────────────────────┐           ┌──────────────────────────────┐
│  Account (Master)   │  ────►    │  Account (Phase 1 Module)   │
│  - 50+ attributes   │           │  - 7 essential attributes   │
│  - All relationships│           │  - Module-specific rules    │
│  - Full complexity  │           │  - Simplified for Phase 1   │
└─────────────────────┘           └──────────────────────────────┘
```

### 2. The Translation Process

```
═══════════════════════════════════════════════════════════════════════════
                        STAGE 1: ENTITY DEFINITION FLOW
═══════════════════════════════════════════════════════════════════════════

┌──────────────────┐
│      BUSM        │  (Enterprise Resource - Source of Truth)
│   ER Diagram     │
│                  │
│  Account Entity: │
│  ├─ account_id   │
│  ├─ account_name │
│  ├─ account_type │
│  ├─ tax_id       │
│  ├─ duns_number  │
│  ├─ credit_limit │
│  ├─ payment_terms│
│  └─ ... 40+ more │
└────────┬─────────┘
         │
         │ CONSUME & FILTER
         ▼
┌──────────────────┐
│  Module Scope    │  (What does THIS module need?)
│   Definition     │
│                  │
│ Phase 1 Needs:   │
│  ✓ Basic info    │
│  ✓ Contact info  │
│  ✗ Credit info   │  ← Not in Phase 1
│  ✗ Tax info      │  ← Not in Phase 1
└────────┬─────────┘
         │
         │ SELECT & SIMPLIFY
         ▼
┌──────────────────┐
│  Module Entity   │  (Simplified for specific use)
│   Definition     │
│                  │
│ account:         │
│  - id            │
│  - name          │
│  - type          │
│  - status        │
│  - email         │
│  - phone         │
│  - address       │
└────────┬─────────┘
         │
         │ ENHANCE WITH MODULE RULES
         ▼
┌──────────────────┐
│   Final YAML     │
│                  │
│ entity:          │
│   name: Account  │
│   source: BUSM   │
│   fields:        │
│     - name: id   │
│       from: BUSM.│
│       account_id │
│     - name: type │
│       enum:      │  ← Module-specific constraint
│       - Resident│
│       - Commerce │
│       - Industry │
└──────────────────┘
```

## The Complete Stage 1 Process

### Activity 1.1: CONSUME BUSM
**What happens**: Read the enterprise data model
```yaml
input:
  source: BUSM/ER-Diagram
  entity: Account (full enterprise definition)
  
action:
  - Import entity structure
  - Identify all attributes
  - Map relationships
  
output:
  - Full entity understanding
  - Relationship mappings
  - Attribute catalog
```

### Activity 1.2: FILTER FOR MODULE
**What happens**: Select only what this module needs
```yaml
input:
  - Full BUSM entity
  - Module requirements (Phase 1, 2, etc.)
  
action:
  - Select required fields
  - Exclude complex fields for later phases
  - Simplify relationships
  
output:
  - Filtered field list
  - Simplified structure
  - Phase-appropriate complexity
```

### Activity 1.3: TRANSLATE TO MODULE FORMAT
**What happens**: Convert to module YAML structure
```yaml
input:
  - Filtered fields
  - Module requirements
  
action:
  - Create YAML structure
  - Map BUSM names to module names
  - Add module-specific metadata
  
output:
  - module-entity.yaml
  - Field mappings
  - Metadata definitions
```

### Activity 1.4: ENHANCE WITH BUSINESS RULES
**What happens**: Add module-specific business logic
```yaml
input:
  - Base entity definition
  - Business requirements
  
action:
  - Add validation rules
  - Define enums/constraints
  - Specify required fields
  - Add computed fields
  
output:
  - Complete entity with rules
  - Validation specifications
  - Business logic definitions
```

### Activity 1.5: DISCOVER GAPS
**What happens**: Identify what's missing or undefined
```yaml
input:
  - Entity definition
  - Business requirements
  
action:
  - Check for undefined types
  - Verify enum completeness
  - Validate rule coverage
  
output:
  - Gap report
  - Missing definitions list
  - Recommendations
```

## Real Example: Account Phase 1

### From BUSM (Enterprise):
```sql
-- BUSM Definition (simplified)
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE,
    legal_name VARCHAR(200),
    dba_name VARCHAR(200),
    tax_id VARCHAR(20),
    duns_number VARCHAR(9),
    account_type VARCHAR(50),
    account_status VARCHAR(50),
    credit_limit DECIMAL(15,2),
    payment_terms INTEGER,
    -- ... 40+ more fields
);
```

### To Module Definition (Phase 1):
```yaml
# phase1-account-basic.yaml
entity:
  name: Account
  source: BUSM.accounts  # Reference to source
  phase: 1
  
  fields:
    - name: id
      type: text
      source: BUSM.accounts.account_id
      required: true
      
    - name: name
      type: text
      source: BUSM.accounts.legal_name
      required: true
      
    - name: type
      type: select
      source: BUSM.accounts.account_type
      required: true
      enum:  # Module-specific constraint
        - Residential
        - Commercial
        - Industrial
        - Other
        
    - name: status
      type: select
      required: true
      enum:
        - Active
        - Inactive
        - Pending
      
    # Phase 1 excludes: tax_id, credit_limit, payment_terms
    # These will be added in Phase 2/3
```

## Gap Discovery in Stage 1

### What Gaps Get Discovered:
1. **BUSM Gaps**: "Field referenced in requirements not in BUSM"
2. **Translation Gaps**: "BUSM field type incompatible with module type"
3. **Business Rule Gaps**: "Status transition rules not defined"
4. **Enum Gaps**: "Account type 'Government' mentioned but not in enum"

### Gap Report Example:
```json
{
  "stage": 1,
  "activity": "Define Entity",
  "gaps": [
    {
      "type": "MISSING_IN_BUSM",
      "message": "Field 'preferredContactMethod' required but not in BUSM",
      "severity": "HIGH",
      "resolution": "Add to BUSM or create module-specific field"
    },
    {
      "type": "UNDEFINED_ENUM",
      "message": "Account type 'Municipal' referenced but not in enum definition",
      "severity": "MEDIUM",
      "resolution": "Add to enum or map to existing type"
    }
  ]
}
```

## So, To Answer Your Question Directly:

**"When we say define entity, are we consuming the ER Diagram/BUSM?"**

**YES**, but it's more than just consuming:

1. **CONSUME** - Read from BUSM (source of truth)
2. **FILTER** - Select only what this module needs
3. **TRANSLATE** - Convert to module format
4. **ENHANCE** - Add module-specific rules
5. **VALIDATE** - Check completeness and discover gaps

The BUSM is the **authoritative source** for enterprise data structure, but each module creates a **simplified, enhanced subset** appropriate for its specific use case and phase.

## The Power of This Approach:

1. **BUSM remains the single source of truth** for enterprise data
2. **Modules can evolve independently** through phases
3. **Gaps are discovered automatically** when module needs don't match BUSM
4. **Progressive complexity** - Phase 1 simple, Phase 2 adds more, etc.
5. **Traceability** - Every field maps back to BUSM source

---

*Stage 1 Detailed Breakdown v1.0*
*The Entity Definition Process Explained*