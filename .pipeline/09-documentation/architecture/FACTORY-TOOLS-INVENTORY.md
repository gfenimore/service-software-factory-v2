# Factory Tools Inventory
*Complete Catalog of All Tools in the Service Software Factory*

## Overview
This document inventories all tools, generators, and utilities in our factory, organizing them by category and tracking their PRD status.

## Tool Categories

### 1. Configuration Tools

#### ViewForge (v3)
- **Location:** `.pipeline/factory-tools/viewforge/`
- **Purpose:** Visual configuration for wireframe structure and navigation
- **Status:** Active, being simplified
- **Key Files:**
  - `v3/js/v3-app.js` - Main ViewForge v3 application
  - `viewforge-transformer.js` - Transforms v3 to simplified format
- **PRD Status:** ✅ Has PRD (`VIEWFORGE-PRD.md`)

#### BUSM (Business Unified Schema Model)
- **Location:** Referenced in configs, not yet built as standalone
- **Purpose:** Single source of truth for data models
- **Status:** Concept defined, needs implementation
- **PRD Status:** ❌ Needs PRD

### 2. Generators

#### Concept Line Generator (v2)
- **Location:** `.pipeline/factory-tools/generators/concept-html/`
- **Purpose:** Generate clickable HTML wireframes
- **Status:** Active, recently updated
- **Key Files:**
  - `concept-generator-v2.js` - Main generator
  - `generators/list.js` - List view generator
  - `generators/detail.js` - Detail view generator
  - `generators/table.js` - Table view generator
- **PRD Status:** ✅ Has PRD (`CONCEPT-GENERATOR-PRD.md`)

#### Prototype Line Generator
- **Location:** `.pipeline/factory-tools/generators/prototype-react/`
- **Purpose:** Generate React components with TypeScript
- **Status:** Active, needs AST rebuild
- **Key Files:**
  - `prototype-generator.js` - Main generator
  - `index.js` - Entry point
- **PRD Status:** ✅ Has PRD (`PROTOTYPE-GENERATOR-PRD.md`)

#### Production Line Generator
- **Location:** `.pipeline/factory-tools/generators/production-vue/`
- **Purpose:** Generate production Vue.js components
- **Status:** Planned, not implemented
- **PRD Status:** ❌ Needs PRD

### 3. Support Tools

#### Gap Logger
- **Location:** `.pipeline/factory-tools/gap-logger/`
- **Purpose:** Log missing information and assumptions
- **Status:** Concept defined, partially integrated
- **Key Files:**
  - Integration in transformers and generators
- **PRD Status:** ✅ Has PRD (`GAP-LOGGER-PRD.md`)

#### ViewForge Transformer
- **Location:** `.pipeline/factory-tools/viewforge/`
- **Purpose:** Transform v3 configs to simplified format
- **Status:** Active, implemented
- **Key Files:**
  - `viewforge-transformer.js`
  - `test-transformer.js`
- **PRD Status:** ❌ Needs PRD

#### Sample Data Generator
- **Location:** `.pipeline/factory-tools/generators/concept-html/sample-data.js`
- **Purpose:** Generate mock data for testing
- **Status:** Basic implementation
- **PRD Status:** ❌ Needs PRD

#### Metadata Parser
- **Location:** `.pipeline/factory-tools/generators/concept-html/`
- **Purpose:** Parse and validate metadata
- **Status:** Active
- **Key Files:**
  - `metadata.js`
  - `parser.js`
  - `validator.js`
- **PRD Status:** ❌ Needs PRD

### 4. Runtime Environments

#### Prototype Runtime
- **Location:** `.pipeline/factory-tools/prototype-runtime/`
- **Purpose:** React app to host generated components
- **Status:** PRD created, not implemented
- **PRD Status:** ✅ Has PRD (`PROTOTYPE-RUNTIME-PRD.md`)

#### Concept Runtime
- **Location:** Not needed (static HTML)
- **Purpose:** N/A - HTML runs in any browser
- **Status:** N/A

### 5. Theme System

#### Theme Engine
- **Location:** `.pipeline/factory-tools/generators/prototype-react/themes/`
- **Purpose:** Manage visual styling without conflicts
- **Status:** Active
- **Key Files:**
  - `default-theme.json`
  - `healthcare-theme.json`
  - `theme-engine.js`
- **PRD Status:** ❌ Needs PRD

### 6. Future Tools (Identified Needs)

#### Business Rules Configurator
- **Purpose:** Define validation and business logic
- **Status:** Identified need
- **PRD Status:** ❌ Needs PRD

#### UI Hints Catalog
- **Purpose:** Display formatting preferences
- **Status:** Identified need
- **PRD Status:** ❌ Needs PRD

#### Configuration Version Control
- **Purpose:** Track config changes over time
- **Status:** Identified need
- **PRD Status:** ❌ Needs PRD

#### Validation Test Harness
- **Purpose:** Ensure generators produce valid code
- **Status:** Identified need
- **PRD Status:** ❌ Needs PRD

### 7. Utility Scripts

#### Auto-commit Script
- **Location:** `.pipeline/auto-commit.sh`
- **Purpose:** Automated git commits every 15 minutes
- **Status:** Active, running in background
- **PRD Status:** ❌ Needs PRD

#### Test Scripts
- **Location:** Various `test-*.js` files
- **Purpose:** Test individual components
- **Status:** Active
- **PRD Status:** ❌ Needs PRD

## PRD Creation Priority

### High Priority (Core Tools)
1. ✅ ViewForge - DONE
2. ✅ Concept Generator - DONE
3. ✅ Prototype Generator - DONE
4. ✅ Gap Logger - DONE
5. ✅ Prototype Runtime - DONE
6. ❌ BUSM Reader - NEEDED
7. ❌ ViewForge Transformer - NEEDED

### Medium Priority (Support Tools)
8. ❌ Theme Engine - NEEDED
9. ❌ Sample Data Generator - NEEDED
10. ❌ Metadata Parser - NEEDED
11. ❌ Business Rules Configurator - NEEDED

### Low Priority (Future/Utilities)
12. ❌ Production Line Generator - NEEDED
13. ❌ UI Hints Catalog - NEEDED
14. ❌ Configuration Version Control - NEEDED
15. ❌ Validation Test Harness - NEEDED
16. ❌ Auto-commit Script - NEEDED

## Summary Statistics

- **Total Tools Identified:** 16
- **PRDs Completed:** 5 (31%)
- **PRDs Needed:** 11 (69%)
- **Active/Implemented:** 8
- **Planned/Future:** 8

## Next Steps

1. Create PRDs for all core tools without documentation
2. Prioritize BUSM Reader and ViewForge Transformer PRDs
3. Document Theme Engine as it's actively used
4. Plan Business Rules Configurator as identified critical need

---

*Last Updated: 2025-01-22*
*Status: Living Document - Update as tools are added*