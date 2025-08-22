# 🏭 Three-Line Factory Pipeline

## Overview
This is a Configuration-Driven UI Factory that generates user interfaces from JSON configurations through three progressive production lines. Sprint 1 successfully delivered all three lines operational.

## 📂 Directory Structure

```
.pipeline/
├── factory-tools/              # All generators and tools
│   ├── viewforge/             # Visual configuration tool
│   │   ├── v3/               # Current version (Sprint 1 success)
│   │   │   └── index.html    # Main ViewForge UI
│   │   └── archive/          # Previous versions (v1, v2)
│   │
│   ├── generators/            # Code generators by production line
│   │   ├── concept-html/     # B&W HTML generator
│   │   ├── prototype-react/  # React + Tailwind generator
│   │   └── production-vue/   # Vue generator (future)
│   │
│   └── iteration-manager/     # Iteration management tools
│
├── configurations/            # All input configurations
│   ├── entities/             # Entity field configurations
│   ├── navigation/           # Navigation menus
│   ├── layouts/              # Page layouts
│   └── test-fixtures/        # Test configurations
│
├── generated/                 # All generated outputs
│   ├── concept-line/         # HTML outputs
│   ├── prototype-line/       # React outputs
│   └── production-line/      # Vue outputs (future)
│
├── iterations/               # Iteration tracking system
│   ├── current/             # Active iteration pointer
│   ├── archive/             # All 9 historical iterations
│   └── manifest.json        # Iteration registry
│
├── documentation/            # Consolidated documentation
│   ├── prds/               # Product Requirement Documents
│   ├── learnings/          # Sprint learnings
│   ├── handoffs/           # Handoff documents
│   └── jobs-to-be-done/    # JTBD format docs
│
└── legacy-archive/          # Historical structures preserved
    ├── 1-inputs/           # Old input system
    ├── 2-factory/          # Old factory structure
    └── 3-workspace/        # Old workspace
```

## 🚀 Quick Start

### 1. Configure a View (ViewForge)
```bash
# Open ViewForge in browser
open .pipeline/factory-tools/viewforge/v3/index.html

# Configure your view visually
# Export JSON configuration
```

### 2. Generate B&W HTML (Concept Line)
```bash
cd .pipeline/factory-tools/generators/concept-html
node index.js <config-file> <output-file>

# Example:
node index.js test-fixtures/account-list-config.json ../../generated/concept-line/account-list.html
```

### 3. Generate React Components (Prototype Line)
```bash
cd .pipeline/factory-tools/generators/prototype-react
node index.js <config-file> <output-dir>

# Example:
node index.js ../concept-html/test-fixtures/account-list-config.json ../../generated/prototype-line/account-list/
```

## 📋 Sprint 1 Accomplishments

### ✅ Working Tools
1. **ViewForge v3** - Visual field configuration tool
2. **Concept Generator** - B&W HTML with semantic markup
3. **Prototype Generator** - React + Tailwind components

### 📚 Key Learnings
- Jobs-to-be-Done format > User Stories
- Throw away bad code (v2 → v3 was right decision)
- Preview is mandatory for configuration tools
- Test with real data immediately

### 🎯 Proven Pipeline
```
ViewForge → JSON Config → Concept Line (HTML) → Prototype Line (React)
```

Successfully tested with Account List + Service Location fields

## 🔄 Iteration System

The pipeline maintains a sophisticated iteration tracking system with 9 iterations:
- Current iteration: `ITER-2025-08-22-009`
- Access via: `.pipeline/iterations/current/iteration-pointer.json`
- Full history preserved in: `.pipeline/iterations/archive/`

## 📖 Key Documents

| Document | Location | Purpose |
|----------|----------|---------|
| ViewForge PRD | `documentation/prds/VIEWFORGE-PRD.md` | ViewForge requirements |
| Concept PRD | `documentation/prds/CONCEPT-GENERATOR-PRD.md` | HTML generator spec |
| Prototype PRD | `documentation/prds/PROTOTYPE-GENERATOR-PRD.md` | React generator spec |
| Sprint 1 Summary | `documentation/learnings/SPRINT-1-LEARNINGS-SUMMARY.md` | Key learnings |
| Latest Handoff | `documentation/handoffs/HANDOFF-SPRINT-1-COMPLETE.md` | Sprint 1 completion |

## 🎨 Design Principles

1. **Configuration First** - All UI driven by JSON configs
2. **Single Source of Truth** - ViewForge configs drive everything
3. **Progressive Enhancement** - HTML → React → Vue
4. **Context-Aware** - Built for future context adaptation
5. **Domain-Focused** - Pest control operations focus

## 🧪 Testing

### Test Concept Generator
```bash
cd .pipeline/factory-tools/generators/concept-html
node test-generator.js
```

### Test Prototype Generator
```bash
cd .pipeline/factory-tools/generators/prototype-react
node index.js ../concept-html/test-fixtures/account-list-config.json ./output/
```

## 🚧 Next Sprint Possibilities

- [ ] Add more view types (detail, form)
- [ ] Build Production Line (Vue) generator
- [ ] Add more entities (Work Orders, Service Locations)
- [ ] Create automated pipeline runner
- [ ] Implement context rules engine

## 📝 Configuration Format

```json
{
  "hierarchy": {
    "userStory": {
      "code": "US-001",
      "title": "View Account List"
    }
  },
  "entity": {
    "primary": "account"
  },
  "fields": [
    {
      "id": "field-1",
      "label": "Account Name",
      "path": "account.name",
      "type": "text"
    }
  ],
  "layout": {
    "type": "table"
  }
}
```

## 🔧 Maintenance

### Backup Created
A full backup was created before reorganization:
`.pipeline-backup-2025-08-22-165751/`

### Legacy Archive
All historical structures preserved in:
`.pipeline/legacy-archive/`

---

*Three-Line Factory v1.0 - Sprint 1 Complete*