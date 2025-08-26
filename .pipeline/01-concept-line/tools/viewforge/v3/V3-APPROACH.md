# ViewForge v3 - PRD-Driven Approach

## Starting Point: PRD Module 1, Feature 1
**"Create new Configuration at any scope level"**

## Key Learnings from v2 Failure:
1. **Must support scope from the start** - Can't bolt it on later
2. **Must support related fields** - Real views need data from multiple entities
3. **Must have preview** - Can't configure what you can't see
4. **Must match BUSM terminology** - "Account Management" not "Customer Management"
5. **Must preserve selections** - When switching entities to add related fields

## v3 Core Architecture (PRD-Driven):

### 1. Configuration First
- Every configuration has a scope (app/module/submodule/story)
- Every configuration belongs to a hierarchy
- Configurations can have parent-child relationships

### 2. Three Modes of Operation
```
Mode 1: Scope Selection
- Choose where in hierarchy this config belongs
- Select scope level (app/module/submodule/story)

Mode 2: Field Configuration  
- Select primary entity
- Add fields from primary entity
- Add related fields (maintaining selections)
- Configure display properties

Mode 3: Layout Configuration
- Choose layout pattern (table, master-detail, 3-column)
- Configure pattern-specific settings
- PREVIEW the result
```

### 3. Data Flow
```
Hierarchy Context
    ↓
Configuration Scope
    ↓
Field Selection (with relationships)
    ↓
Layout Pattern
    ↓
Preview
    ↓
Export (with full context)
```

## Sprint 1 Goal (Revised):
Build just enough to configure and preview "US-001: View Account List" with:
- Proper scope (story-level)
- Account fields
- Related fields (e.g., from service locations)
- Table layout
- Live preview
- Export with hierarchy context

## Implementation Order:
1. **Scope & Hierarchy UI** - Where does this config belong?
2. **Multi-Entity Field Selection** - Pick fields from multiple related entities
3. **Preview Engine** - See what you're building
4. **Export with Context** - Full hierarchy and scope in JSON

## What We're NOT Building Yet:
- Parent-child composition (that's Week 2)
- Multiple layout patterns (just table for now)
- Versioning (Week 2)
- Complex rules (Future)

## Success Criteria:
✅ Can set configuration scope
✅ Can select Account fields
✅ Can add ServiceLocation.locationName to same view
✅ Can see preview of table
✅ Export includes hierarchy context
✅ Same config works in all three factory lines