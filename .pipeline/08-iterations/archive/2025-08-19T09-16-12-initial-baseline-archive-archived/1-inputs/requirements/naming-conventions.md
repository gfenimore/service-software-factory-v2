# Naming Conventions for Progressive Hierarchy
**Version**: 1.0  
**Created**: 2025-01-20  
**Purpose**: Establish consistent naming patterns across the progressive development hierarchy

## The Revolutionary Formula

```
Requirements Hierarchy (Business Clarity)
    +
Progressive Standards (Technical Evolution)
    +
Sub-Module Thinking (Atomic Promotion Units)
    =
RADICAL SIMPLICITY AT EACH STAGE
```

## 📁 File Naming Patterns

### Hierarchy-Based File Names
Use the hierarchy ID as a prefix to maintain clear traceability:

```
Pattern: {hierarchy-id}-{type}-{name}.md

Examples:
1.0-vision-pest-control.md
1.1-module-account-management.md  
1.1.1-submodule-master-view.md
1.1.1.1-story-US004-accounts-column.md
1.1.1.1.1-task-T001-build-account-card.md
```

### Benefits
- **Traceability**: Every artifact's position in hierarchy is immediately clear
- **Sorting**: Files naturally sort by hierarchy level
- **Discovery**: Developers can predict file locations and names

## 🏷️ Component Naming Patterns

### Progressive Line Components
Include the line name in component files to distinguish evolution stages:

```
Pattern: {Line}{SubModule}{Component}.tsx

Examples:
ConceptMasterViewAccountCard.tsx
PrototypeMasterViewAccountCard.tsx
ProductionMasterViewAccountCard.tsx

Alternative Pattern (if in separate folders):
concept/MasterViewAccountCard.tsx
prototype/MasterViewAccountCard.tsx
production/MasterViewAccountCard.tsx
```

### Shared Components (Design System)
Components used across multiple sub-modules:

```
Pattern: {Line}Shared{Component}.tsx

Examples:
ConceptSharedCard.tsx
ConceptSharedButton.tsx
ConceptSharedLayout.tsx
```

## 📊 Interface Contract Naming

### Progressive Interface Files
Interface contracts that evolve through the lines:

```
Pattern: {SubModule}Interface.{line}.ts

Examples:
MasterViewInterface.concept.ts
MasterViewInterface.prototype.ts
MasterViewInterface.production.ts

DetailViewInterface.concept.ts
WorkOrderInterface.concept.ts
```

### Contract Registry Files
Central registry tracking all interfaces:

```
Pattern: {Module}ContractRegistry.{line}.md

Examples:
AccountsContractRegistry.concept.md
OperationsContractRegistry.prototype.md
```

## 🔄 Event Naming Patterns

### Event Names
Hierarchical event naming for clear communication paths:

```
Pattern: {module}:{submodule}:{action}

Examples:
accounts:masterview:account-selected
accounts:masterview:location-selected
accounts:masterview:filter-applied
accounts:detailview:account-updated
accounts:detailview:contact-added
operations:workorder:status-changed
operations:calendar:appointment-scheduled
```

### Event Type Definitions
TypeScript type names for events (prototype/production only):

```
Pattern: {Module}{SubModule}{Action}Event

Examples:
AccountsMasterViewAccountSelectedEvent
AccountsDetailViewAccountUpdatedEvent
OperationsWorkOrderStatusChangedEvent
```

## 📂 Directory Structure

### Requirements Hierarchy
Mirror the business hierarchy in folder structure:

```
requirements/
├── 1.0-application/
│   └── pest-control-vision.md
├── 1.1-modules/
│   ├── account-management/
│   │   ├── module-definition.md
│   │   └── 1.1.1-sub-modules/
│   │       ├── master-view/
│   │       │   ├── feature-definition.md
│   │       │   └── 1.1.1.1-stories/
│   │       │       ├── US-004-accounts-column.md
│   │       │       ├── US-006-locations-column.md
│   │       │       └── US-008-work-orders-column.md
│   │       └── detail-view/
│   │           └── feature-definition.md
│   └── operations/
│       └── module-definition.md
```

### Code Organization
Separate by line, then by sub-module:

```
src/
├── concept/
│   ├── design-system/
│   │   ├── ConceptSharedCard.tsx
│   │   └── ConceptSharedLayout.tsx
│   ├── modules/
│   │   └── accounts/
│   │       ├── master-view/
│   │       │   ├── MasterViewInterface.concept.ts
│   │       │   ├── ConceptMasterViewContainer.tsx
│   │       │   └── components/
│   │       └── detail-view/
│   └── shared/
├── prototype/
│   └── (same structure with Prototype prefix)
└── production/
    └── (same structure with Production prefix)
```

## 🏗️ Pipeline Artifacts

### Story and Task Files
Pipeline-specific naming:

```
Pattern: {LINE}-{hierarchy-id}-{type}.{ext}

Examples:
concept-1.1.1.1-story-US004.md
prototype-1.1.1.1-story-US004.md
concept-1.1.1.1.1-task-manifest.json
```

### Session Files
Track pipeline execution state:

```
Pattern: {LINE}-{submodule}-session-{timestamp}.json

Examples:
concept-masterview-session-20250120.json
prototype-detailview-session-20250121.json
```

## 🎯 Benefits of These Conventions

1. **Automation Ready**: Scripts can parse hierarchy IDs for dependency tracking
2. **Promotion Clarity**: Clear which files move together during line promotion
3. **Discoverability**: Developers can predict file locations and names
4. **Scalability**: Patterns work for 10 or 1000 components
5. **Traceability**: Every artifact traces back to its business purpose

## 📋 Quick Reference Cheat Sheet

| Type | Pattern | Example |
|------|---------|---------|
| **Requirement** | `{hierarchy-id}-{type}-{name}.md` | `1.1.1-submodule-master-view.md` |
| **Component** | `{Line}{SubModule}{Component}.tsx` | `ConceptMasterViewAccountCard.tsx` |
| **Interface** | `{SubModule}Interface.{line}.ts` | `MasterViewInterface.concept.ts` |
| **Event** | `{module}:{submodule}:{action}` | `accounts:masterview:account-selected` |
| **Task** | `{hierarchy-id}-task-{id}-{name}.md` | `1.1.1.1.1-task-T001-build-card.md` |

## 🚀 Implementation Notes

1. **Start Simple**: Begin with file naming and directory structure
2. **Enforce in CI**: Add linting rules to check naming conventions
3. **Document Exceptions**: Some files may need different patterns - document why
4. **Evolve as Needed**: These patterns can evolve as the system grows
5. **Team Agreement**: Get buy-in from all developers before enforcing

---

*These conventions ensure that CC's "going the extra mile" approach results in a maintainable, scalable system where every artifact has a clear purpose and place in the hierarchy.*