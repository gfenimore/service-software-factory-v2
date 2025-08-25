# Database Generation & Migration Strategy
*When and How We Create/Update Supabase Tables*

## The Missing Piece: Database Generation!

You're absolutely right - we've been generating UI components but haven't addressed the DATABASE layer! This is a critical gap in our pipeline.

## Current State (The Problem)

```
BUSM Model → Module Config → ViewForge → AST → Components
                                                    ↓
                                                UI exists but...
                                                WHERE'S THE DATABASE?
```

## When Database Generation Should Happen

### Option 1: During Module Build (Stage 1)
```
When you define a sub-module:
1. Select entities from BUSM
2. System generates:
   - Module config (✅ we have this)
   - Database migrations (❌ we need this!)
   - Initial schema SQL
```

### Option 2: At BUILD IT Time (Recommended)
```
When you click "BUILD IT":
1. Stage 1-4: Generate components (current)
2. Stage 2.5: Generate Database (NEW!)
   - Create migrations from BUSM
   - Apply to Supabase
   - Verify schema
3. Continue with rest of pipeline
```

## The Database Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE GENERATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

Iteration 1: Initial Account Table
═══════════════════════════════════════════════════════════════════
BUSM Definition                     Supabase Migration
┌──────────────────┐               ┌──────────────────────────────┐
│ Account Entity   │               │ -- Migration: 001_account.sql│
│ - id: uuid       │  ─────────>   │ CREATE TABLE accounts (      │
│ - name: string   │               │   id UUID PRIMARY KEY,       │
│ - type: enum     │               │   name VARCHAR(100),         │
│ - status: enum   │               │   type VARCHAR(20),          │
└──────────────────┘               │   status VARCHAR(20)         │
                                   │ );                           │
                                   └──────────────────────────────┘

Iteration 2: Add Locations (Incremental)
═══════════════════════════════════════════════════════════════════
Previous + New                      Incremental Migration
┌──────────────────┐               ┌──────────────────────────────┐
│ + Location Entity│               │ -- Migration: 002_location.sql│
│ - id: uuid       │  ─────────>   │ CREATE TABLE locations (     │
│ - accountId: FK  │               │   id UUID PRIMARY KEY,       │
│ - address: string│               │   account_id UUID REFERENCES │
└──────────────────┘               │     accounts(id),            │
                                   │   address TEXT               │
                                   │ );                           │
                                   └──────────────────────────────┘

Iteration 3: Modify Account (ALTER)
═══════════════════════════════════════════════════════════════════
Field Addition                      Alter Migration
┌──────────────────┐               ┌──────────────────────────────┐
│ Account.phone    │  ─────────>   │ -- Migration: 003_add_phone.sql│
│ (new field)      │               │ ALTER TABLE accounts         │
└──────────────────┘               │ ADD COLUMN phone VARCHAR(20); │
                                   └──────────────────────────────┘
```

## Handling Database Updates Through Iterations

### The Iteration-Migration Pattern

```javascript
// Each iteration tracks its database changes
{
  iteration: 2,
  databaseChanges: {
    tables: {
      created: ["locations"],
      modified: [],
      deleted: []
    },
    columns: {
      added: [],
      modified: [],
      deleted: []
    },
    migrations: [
      {
        file: "002_add_locations.sql",
        checksum: "abc123",
        applied: "2025-08-25 10:00:00"
      }
    ]
  }
}
```

### Migration Generation Rules

```javascript
class DatabaseGenerator {
  generateMigration(iteration) {
    const changes = this.detectChanges(iteration);
    
    if (changes.isFirstIteration) {
      return this.generateCreateTable(iteration.entities);
    }
    
    if (changes.hasNewTables) {
      return this.generateNewTables(changes.newTables);
    }
    
    if (changes.hasColumnChanges) {
      return this.generateAlterTable(changes.columnChanges);
    }
    
    if (changes.hasRelationships) {
      return this.generateForeignKeys(changes.relationships);
    }
  }
}
```

## Integration with Supabase

### 1. Development Environment (Auto-Apply)
```bash
# When you click BUILD IT in dev:
1. Generate migration files
2. Auto-apply to Supabase dev project
3. Verify schema matches BUSM
4. Continue with component generation
```

### 2. Production Environment (Controlled)
```bash
# When deploying to production:
1. Generate migration files
2. Create migration PR
3. Review changes
4. Apply after approval
5. Deploy components
```

## The Complete Pipeline with Database

```
Stage 1: Requirements (Module Definition)
    ↓
Stage 2: Configuration Processing
    ↓
Stage 2.5: DATABASE GENERATION (NEW!)
    ├─ Generate migrations from BUSM
    ├─ Apply to Supabase
    └─ Verify schema
    ↓
Stage 3: ViewForge Transformation
    ↓
Stage 4: AST Component Generation
    ↓
Stage 5: Validation
    ↓
Stage 6: Deployment
```

## Control Panel Integration

```
╔═══════════════════════════════════════════════════════════════════╗
║ BUILD ITERATION 2 - DATABASE CHANGES DETECTED                       ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                     ║
║ Database Changes Required:                                         ║
║                                                                     ║
║ New Tables:                                                        ║
║ ✓ locations (8 columns)                                           ║
║                                                                     ║
║ Modified Tables:                                                   ║
║ ✓ accounts (ADD COLUMN: territory_id)                             ║
║                                                                     ║
║ New Relationships:                                                 ║
║ ✓ locations.account_id → accounts.id                              ║
║                                                                     ║
║ Migration Preview:                                                 ║
║ ┌─────────────────────────────────────────────────────────┐      ║
║ │ -- Migration: 002_iteration2_locations.sql              │      ║
║ │ -- Generated: 2025-08-25 10:00:00                       │      ║
║ │ -- Iteration: 2                                         │      ║
║ │                                                          │      ║
║ │ CREATE TABLE IF NOT EXISTS locations (                  │      ║
║ │   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,        │      ║
║ │   account_id UUID NOT NULL,                             │      ║
║ │   address TEXT,                                          │      ║
║ │   city VARCHAR(100),                                     │      ║
║ │   state VARCHAR(50),                                     │      ║
║ │   created_at TIMESTAMPTZ DEFAULT NOW(),                 │      ║
║ │   FOREIGN KEY (account_id) REFERENCES accounts(id)      │      ║
║ │     ON DELETE CASCADE                                    │      ║
║ │ );                                                       │      ║
║ │                                                          │      ║
║ │ ALTER TABLE accounts                                     │      ║
║ │ ADD COLUMN IF NOT EXISTS territory_id UUID;             │      ║
║ └─────────────────────────────────────────────────────────┘      ║
║                                                                     ║
║ [Cancel] [Review Full Migration] [Apply & Continue]                ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Best Practices for Database Evolution

### 1. Never Break Previous Iterations
```sql
-- GOOD: Additive changes
ALTER TABLE accounts ADD COLUMN phone VARCHAR(20);

-- BAD: Breaking changes
ALTER TABLE accounts DROP COLUMN name;  -- Would break Iteration 1!
```

### 2. Track Migration History
```sql
CREATE TABLE migration_history (
  iteration INTEGER,
  migration_file VARCHAR(255),
  applied_at TIMESTAMPTZ,
  checksum VARCHAR(64),
  success BOOLEAN
);
```

### 3. Rollback Strategy
```javascript
// Each iteration knows how to rollback
{
  iteration: 2,
  rollback: {
    migrations: ["002_iteration2_rollback.sql"],
    procedure: [
      "DROP TABLE IF EXISTS locations",
      "ALTER TABLE accounts DROP COLUMN territory_id"
    ]
  }
}
```

## The Missing Tools We Need

### 1. BUSM to SQL Generator
```javascript
class BUSMToSQL {
  generateCreateTable(entity) {
    // Convert BUSM entity to CREATE TABLE
  }
  
  generateAlterTable(changes) {
    // Convert field changes to ALTER TABLE
  }
  
  mapDataTypes(busmType) {
    // uuid → UUID
    // string → VARCHAR
    // datetime → TIMESTAMPTZ
    // etc.
  }
}
```

### 2. Migration Manager
```javascript
class MigrationManager {
  generateMigration(iteration) {
    // Create migration file
  }
  
  applyMigration(target) {
    // Apply to Supabase
  }
  
  verifySchema() {
    // Check database matches BUSM
  }
  
  rollback(iteration) {
    // Rollback to previous iteration
  }
}
```

### 3. Supabase Integration
```javascript
class SupabaseGenerator {
  async createTables(migration) {
    // Execute migration on Supabase
  }
  
  async generateTypes() {
    // Generate TypeScript types from schema
  }
  
  async createRLS() {
    // Row Level Security policies
  }
  
  async createFunctions() {
    // Database functions/triggers
  }
}
```

## The Answer to Your Question

**Q: At what point do we generate the table structures?**

**A: At BUILD IT time, between Stage 2 and 3:**
1. After configuration is processed (we know what entities/fields)
2. Before ViewForge (so views know the schema exists)
3. As part of each iteration (incremental changes)

**Q: How do we handle updates to the data model?**

**A: Through versioned migrations per iteration:**
1. Each iteration generates its own migration
2. Migrations are incremental (only changes)
3. Never modify previous migrations
4. Always preserve backward compatibility
5. Track all changes for rollback capability

## What This Means

We need to add Database Generation to our pipeline! This would:
1. Read from BUSM
2. Generate SQL migrations
3. Apply to Supabase
4. Track in iteration history
5. Enable rollback if needed

Should we create a PRD for the Database Generator component?

---

*Database Generation Strategy v1.0*
*The missing piece of the pipeline!*