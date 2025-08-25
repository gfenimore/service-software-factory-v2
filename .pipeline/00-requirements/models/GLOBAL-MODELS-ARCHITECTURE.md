# Global Models Architecture

## Purpose
This directory contains system-wide models that span across all three production lines.

## Model Categories

### 1. Business Models (Global)
- **Location**: `/00-requirements/models/`
- **Contents**:
  - `BUSM.mmd` - Business Universal Schema Model (core business entities)
  - Business process diagrams
  - Domain models
  - Entity relationship diagrams

### 2. System Architecture Models (Global)
- **Location**: `/09-documentation/architecture/models/`
- **Contents**:
  - System architecture diagrams
  - Integration flow models
  - Infrastructure diagrams
  - Deployment models

### 3. Line-Specific Models
Each production line maintains its own models:

#### Concept Line (`/01-concept-line/models/`)
- Conceptual flow diagrams
- UI/UX wireframe models
- Navigation flow models
- ViewForge transformation models

#### Prototype Line (`/02-prototype-line/models/`)
- Component architecture diagrams
- State management models
- React component hierarchy
- Theme system models

#### Production Line (`/03-production-line/models/`)
- Production deployment models
- Performance optimization models
- Security architecture
- Scaling models

## Model Formats

### Mermaid Diagrams (.mmd)
Primary format for:
- Flow diagrams
- Sequence diagrams
- Entity relationships
- State machines

### Markdown with ASCII Art (.md)
Used for:
- Simple flow visualizations
- Quick conceptual diagrams
- Documentation-embedded diagrams

## Naming Conventions

### Global Models
- `GLOBAL-{TYPE}-{NAME}.mmd`
- Example: `GLOBAL-ARCHITECTURE-SYSTEM.mmd`

### Business Models
- `BUSM-{ENTITY}-{TYPE}.mmd`
- Example: `BUSM-ACCOUNT-RELATIONSHIPS.mmd`

### Line-Specific Models
- `{LINE}-{TYPE}-{NAME}.mmd`
- Example: `CONCEPT-FLOW-NAVIGATION.mmd`

## Model Lifecycle

1. **Creation**: Models start in their respective line or global location
2. **Evolution**: Updated as requirements change
3. **Versioning**: Major changes create new versions with timestamps
4. **Archive**: Obsolete models move to `/legacy-archive/models/`

## Best Practices

1. Keep models close to their implementation
2. Global models should be technology-agnostic
3. Line-specific models can include implementation details
4. Always include a description comment in Mermaid files
5. Update models when code structure changes significantly

## Quick Reference

| Model Type | Location | Purpose |
|------------|----------|---------|
| Business Entities | `/00-requirements/models/` | Define core business concepts |
| System Architecture | `/09-documentation/architecture/models/` | Overall system design |
| Concept Flows | `/01-concept-line/models/` | UI/UX and navigation |
| Prototype Architecture | `/02-prototype-line/models/` | React component design |
| Production Architecture | `/03-production-line/models/` | Production deployment |