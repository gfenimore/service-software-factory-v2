# Database Lifecycle Strategy
*From Concept Visualization to Production Database*

## The Three-Stage Database Reality

You're absolutely right - the database has a LIFECYCLE that parallels our three stages:

```
CONCEPT          →    PROTOTYPE           →    PRODUCTION
(Visualize)           (Working Tables)         (Complete Schema)
"What we need"        "Make it work"          "Make it right"
```

## Stage-by-Stage Database Evolution

### CONCEPT Stage: Visualization Only
```
What happens:
- BUSM defines entities
- Module selects what it needs
- ViewForge creates wireframes
- Database is just DOCUMENTATION

Database State: 
- Schema diagrams
- ER relationships shown
- Field lists in wireframes
- NO ACTUAL TABLES

Example:
┌─────────────────┐
│  Account Table  │  ← Just a diagram!
│  - id: uuid     │
│  - name: string │
└─────────────────┘
```

### PROTOTYPE Stage: Real Tables (Iterative)
```
What happens:
- Transform concept → actual Supabase tables
- Each iteration adds/modifies tables
- Just enough schema for current functionality
- Quick and dirty, make it work!

Database State:
- REAL tables in Supabase Dev
- Minimal constraints
- Basic relationships
- May be incomplete

Iteration 1: Just accounts table (4 fields)
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50),
  status VARCHAR(50)
);

Iteration 2: Add locations (linked)
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  address TEXT
);

Iteration 3: Add phone to accounts
ALTER TABLE accounts ADD COLUMN phone VARCHAR(20);
```

### PRODUCTION Stage: Complete Database
```
What happens:
- Merge ALL sub-modules into complete schema
- Add all constraints, indexes, RLS
- Include audit fields, soft deletes
- Performance optimization
- Full referential integrity

Database State:
- COMPLETE schema
- ALL modules integrated
- Production constraints
- Security policies
- Optimized indexes

Example: Production Account Table
CREATE TABLE accounts (
  -- Core fields
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Residential', 'Commercial', 'Industrial')),
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  
  -- All fields from all iterations
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  
  -- Relationships (all modules)
  territory_id UUID REFERENCES territories(id),
  owner_id UUID REFERENCES users(id) NOT NULL,
  parent_account_id UUID REFERENCES accounts(id),
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users(id) NOT NULL,
  updated_at TIMESTAMPTZ,
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,  -- Soft delete
  version INTEGER DEFAULT 1,  -- Optimistic locking
  
  -- Indexes for performance
  INDEX idx_account_status (status),
  INDEX idx_account_type (type),
  INDEX idx_account_owner (owner_id),
  INDEX idx_account_search (name, account_number)
);

-- Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_access ON accounts
  FOR ALL
  USING (owner_id = auth.uid() OR has_role('admin'));

-- Audit trigger
CREATE TRIGGER audit_accounts
  AFTER INSERT OR UPDATE OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION audit_changes();
```

## The Critical Insight: Database "Hardening"

### Prototype → Production Transformation

```
PROTOTYPE (Iterative, Minimal)          PRODUCTION (Complete, Hardened)
================================  →     ====================================
accounts table (4 fields)               accounts table (25+ fields)
No constraints                          Full constraints
No indexes                              Optimized indexes
No security                             RLS policies
No audit                                Audit triggers
Single module                           ALL modules integrated
Dev environment                         Production environment
```

### What "Hardening" Means

1. **Field Completion**
   - Prototype: Just fields you're using
   - Production: ALL fields from BUSM

2. **Constraint Enforcement**
   - Prototype: Minimal (foreign keys only)
   - Production: CHECK, UNIQUE, NOT NULL, etc.

3. **Security Layer**
   - Prototype: Open access
   - Production: Row Level Security, roles

4. **Performance Optimization**
   - Prototype: No indexes
   - Production: Strategic indexes

5. **Audit & Compliance**
   - Prototype: None
   - Production: Full audit trail

## The Sub-Module Integration Challenge

### During Prototype (Isolated Sub-Modules)
```
master-view sub-module:
  └─ accounts (partial)
  └─ locations (partial)
  
account-management sub-module:
  └─ accounts (different fields!)
  └─ contacts
  
service-scheduler sub-module:
  └─ services
  └─ work_orders
  
Each sub-module has its OWN partial view of the database!
```

### During Production (Unified Schema)
```
Complete Production Database:
  └─ accounts (UNION of all sub-module needs)
  └─ locations (complete)
  └─ contacts (complete)
  └─ services (complete)
  └─ work_orders (complete)
  └─ All relationships connected
  └─ All constraints enforced
```

## The Database Generator's Three Modes

### Mode 1: Concept Generation
```javascript
generateConcept(module) {
  // Just create documentation
  return {
    erDiagram: createERDiagram(module.entities),
    fieldLists: documentFields(module.fields),
    relationships: documentRelationships(module.refs)
  };
  // NO SQL generated!
}
```

### Mode 2: Prototype Generation (Iterative)
```javascript
generatePrototype(iteration) {
  // Create minimal working tables
  if (iteration.number === 1) {
    return createBasicTable(iteration.entities);
  } else {
    return incrementalChanges(iteration.changes);
  }
  // Quick and dirty, just make it work!
}
```

### Mode 3: Production Generation (Complete)
```javascript
generateProduction(allSubModules) {
  // Merge all sub-modules
  const unifiedSchema = mergeSchemas(allSubModules);
  
  // Add production features
  addConstraints(unifiedSchema);
  addIndexes(unifiedSchema);
  addRLS(unifiedSchema);
  addAudit(unifiedSchema);
  
  return completeProductionSchema;
  // Everything, properly engineered!
}
```

## When Each Database Operation Happens

```
Timeline of Database Operations:

CONCEPT PHASE:
├─ Module Definition → Document schema (no tables)
├─ ViewForge → Show ER diagrams in wireframes
└─ BUILD IT → Generate schema documentation

PROTOTYPE PHASE:
├─ Iteration 1 → Create basic tables
├─ Iteration 2 → Add tables/columns
├─ Iteration 3 → Modify as needed
└─ Each BUILD IT → Apply migrations

PRODUCTION PHASE:
├─ Sub-module complete → Schema review
├─ All modules ready → Merge schemas
├─ Production prep → Add hardening
└─ DEPLOY → Complete database with all features
```

## The Missing Piece: Schema Merger

We need a tool that can:

1. **Collect** all sub-module schemas
2. **Merge** overlapping entities (accounts appears in multiple!)
3. **Resolve** conflicts (different sub-modules might define fields differently)
4. **Complete** the schema (add all BUSM fields)
5. **Harden** for production (constraints, indexes, security)

```javascript
class SchemaManager {
  mergeSubModules(subModules) {
    const entities = {};
    
    // Collect all entity definitions
    subModules.forEach(module => {
      module.entities.forEach(entity => {
        if (!entities[entity.name]) {
          entities[entity.name] = {
            fields: new Set(),
            relationships: new Set(),
            constraints: new Set()
          };
        }
        // Merge fields from this sub-module
        entity.fields.forEach(field => {
          entities[entity.name].fields.add(field);
        });
      });
    });
    
    // Resolve conflicts
    this.resolveConflicts(entities);
    
    // Add missing BUSM fields
    this.completefromBUSM(entities);
    
    // Add production features
    this.addProductionFeatures(entities);
    
    return entities;
  }
}
```

## The Complete Picture

```
CONCEPT: "Here's what we need" (diagrams only)
    ↓
PROTOTYPE: "Make it work" (iterative, minimal tables)
    ↓
PRODUCTION: "Make it right" (complete, hardened, all modules)
```

This explains why:
- Prototype can have partial schemas
- Different sub-modules can have different views
- Production needs schema merger
- Database hardening happens at production

---

*Database Lifecycle Strategy v1.0*
*From concept to production, the database evolves!*