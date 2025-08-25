# Pipeline Three-Line Reorganization Migration Plan V2
*Complete reorganization with versioning, naming conventions, and all tools accounted for*

## Executive Summary
This revised migration plan addresses:
- Complete accounting of all processing tools
- Output versioning strategy for each line
- Naming conventions for traceability
- Organization of root-level documentation and scripts
- Handoff documentation management

## Proposed Structure - REVISED

```
.pipeline/
├── 00-requirements/              # ALL input requirements & specifications
│   ├── prds/                     # Product Requirement Documents
│   │   ├── active/               # Currently active PRDs
│   │   └── archive/              # Historical PRDs
│   ├── specs/                    # Technical specifications
│   │   ├── entities/             # Entity specifications
│   │   ├── workflows/            # Workflow specifications
│   │   └── integrations/         # Integration specs
│   ├── business-rules/           # Business rule definitions
│   └── feedback/                 # User feedback & requirements
│       ├── sessions/             # Feedback sessions
│       └── requirements/         # Derived requirements from feedback
│
├── 01-concept-line/              # Concept Line (HTML mockups, wireframes)
│   ├── tools/                    # Concept-specific tools
│   │   ├── viewforge/           # ViewForge tool
│   │   ├── concept-generator/   # HTML generator
│   │   └── busm-reader/         # BUSM reader for concept phase
│   ├── configs/                  # Concept configurations
│   │   ├── entities/            # Entity configs for concept
│   │   ├── layouts/             # Layout definitions
│   │   └── navigation/          # Navigation structure
│   ├── outputs/                  # VERSIONED concept artifacts
│   │   ├── v1.0.0-2025-01-25-account-list/
│   │   │   ├── mockups/         # HTML mockups
│   │   │   ├── wireframes/      # Visual wireframes
│   │   │   ├── manifest.json    # Build manifest
│   │   │   └── README.md        # Build notes
│   │   └── latest/              # Symlink to latest version
│   └── validations/              # Concept validation results
│
├── 02-prototype-line/            # Prototype Line (React components)
│   ├── tools/                    # Prototype-specific tools
│   │   ├── react-generator/     # React component generator
│   │   ├── prototype-runtime/   # Runtime environment
│   │   └── theme-engine/        # Theme processing
│   ├── configs/                  # Prototype configurations
│   │   ├── themes/              # Theme configurations
│   │   ├── components/          # Component configs
│   │   └── data-fixtures/       # Test data fixtures
│   ├── outputs/                  # VERSIONED prototype artifacts
│   │   ├── v2.1.0-2025-01-25-1430-account-module/
│   │   │   ├── components/      # React components
│   │   │   ├── views/           # Complete views
│   │   │   ├── data/            # Data models
│   │   │   ├── types/           # TypeScript definitions
│   │   │   ├── build.log        # Build log
│   │   │   └── manifest.json    # Build manifest
│   │   └── latest/              # Symlink to latest version
│   └── validations/              # Prototype validation results
│
├── 03-production-line/           # Production Line (Vue components)
│   ├── tools/                    # Production-specific tools
│   │   ├── vue-generator/       # Vue component generator
│   │   └── deployment-tools/    # Deployment utilities
│   ├── configs/                  # Production configurations
│   │   ├── deployment/          # Deployment configs
│   │   ├── optimization/        # Performance configs
│   │   └── security/            # Security configurations
│   ├── outputs/                  # VERSIONED production artifacts
│   │   ├── v3.0.1-2025-01-25-1615-prod-release/
│   │   │   ├── components/      # Vue components
│   │   │   ├── modules/         # Complete modules
│   │   │   ├── builds/          # Production builds
│   │   │   ├── deployment.yaml  # Deployment config
│   │   │   └── manifest.json    # Build manifest
│   │   └── latest/              # Symlink to latest version
│   └── validations/              # Production validation results
│
├── 04-processing-tools/          # Cross-line processing tools
│   ├── ast-generator/            # AST generation (all lines)
│   ├── module-system/            # Module management (all lines)
│   ├── manifest-manager/         # Manifest handling (all lines)
│   ├── gap-logger/              # Gap discovery (all lines)
│   └── iteration-manager/        # Iteration control (all lines)
│
├── 05-data-tools/                # Data and integration tools
│   ├── database-generator/       # Database utilities
│   ├── sample-data-generator/    # Test data generation
│   ├── business-rules-engine/    # Rule processing
│   │   ├── configurator/        # Rule configuration UI
│   │   └── engine/              # Rule execution engine
│   ├── integration-discovery/    # Integration scanner
│   └── integration-resolver/     # Version resolver
│
├── 06-control-center/            # Factory control and monitoring
│   ├── factory-control-panel/    # Main control panel
│   ├── dashboards/               # Monitoring dashboards
│   ├── metrics/                  # Performance metrics
│   └── reports/                  # Generated reports
│
├── 07-database/                  # Database artifacts
│   ├── migrations/               # VERSIONED migrations
│   │   ├── concept/             
│   │   │   └── v1.0.0-2025-01-25-initial/
│   │   ├── prototype/           
│   │   │   └── v2.0.0-2025-01-26-add-contacts/
│   │   └── production/          
│   │       └── v3.0.0-2025-01-27-optimize-indexes/
│   ├── schemas/                  # Schema definitions
│   └── seeds/                    # Seed data
│
├── 08-iterations/                # Iteration management
│   ├── current/                  # Current active iteration
│   │   └── ITER-2025-01-25-sprint-3/
│   ├── archive/                  # Archived iterations
│   └── templates/                # Iteration templates
│
├── 09-documentation/             # All documentation
│   ├── architecture/             # Architecture docs
│   ├── guides/                   # User guides
│   ├── processes/                # Process documentation
│   └── lessons-learned/          # Historical lessons
│
├── 10-handoffs/                  # DEDICATED handoff management
│   ├── active/                   # Current handoffs in progress
│   │   └── HANDOFF-2025-01-25-feature-x.md
│   ├── completed/                # Completed handoffs
│   │   └── 2025-01/             # Organized by month
│   ├── templates/                # Handoff templates
│   └── index.md                  # Handoff registry
│
├── 11-quality/                   # Quality assurance
│   ├── tests/                    # Test suites
│   │   ├── concept/             # Concept line tests
│   │   ├── prototype/           # Prototype tests
│   │   └── production/          # Production tests
│   ├── validations/              # Validation reports
│   └── reviews/                  # Code reviews
│
├── 12-operations/                # Operational support
│   ├── scripts/                  # Utility scripts
│   │   ├── auto-commit.sh      # Auto-commit script
│   │   ├── migration/          # Migration scripts
│   │   ├── backup/              # Backup scripts
│   │   └── utils/               # General utilities
│   ├── logs/                     # System logs
│   │   └── 2025-01-25/          # Daily log files
│   └── backups/                  # System backups
│
└── README.md                     # Root documentation
```

## Naming Conventions

### Output Versioning Format
```
[version]-[date]-[time]-[description]/
```

Examples:
- `v1.0.0-2025-01-25-account-list/` - Concept line output
- `v2.1.0-2025-01-25-1430-account-module/` - Prototype with timestamp
- `v3.0.1-2025-01-25-1615-prod-release/` - Production release

### Version Numbering
- **Major.Minor.Patch** format
- **Concept Line**: v1.x.x
- **Prototype Line**: v2.x.x  
- **Production Line**: v3.x.x

### File Naming Within Outputs
```
[line]-[component]-[date]-[sequence].[ext]
```

Examples:
- `concept-account-list-2025-01-25-001.html`
- `prototype-account-view-2025-01-25-002.tsx`
- `production-account-module-2025-01-25-003.vue`

### Build Manifest Structure
Each output version includes `manifest.json`:
```json
{
  "version": "v2.1.0",
  "line": "prototype",
  "timestamp": "2025-01-25T14:30:00Z",
  "description": "Account module with contact info",
  "source_iteration": "ITER-2025-01-25-sprint-3",
  "tools_used": [
    "react-generator@1.2.0",
    "ast-generator@2.1.0",
    "theme-engine@1.0.5"
  ],
  "input_configs": [
    "configs/entities/account.yaml",
    "configs/themes/default.json"
  ],
  "output_files": [
    "components/AccountList.tsx",
    "views/AccountDetailView.tsx"
  ],
  "validation_status": "passed",
  "build_duration_ms": 4523,
  "gaps_discovered": []
}
```

## Complete Tool Mapping

### Processing Tools (04-processing-tools/)
- `ast-generator` - Cross-line AST generation
- `module-system` - Module configuration management
- `manifest-manager` - Build manifest generation
- `gap-logger` - Gap discovery and logging
- `iteration-manager` - Iteration lifecycle management

### Data Tools (05-data-tools/)
- `database-generator` - Schema and migration generation
- `sample-data-generator` - Test data creation
- `business-rules-configurator` - Rule definition UI
- `business-rules-engine` - Rule execution
- `integration-discovery-scanner` - Find integration points
- `integration-version-resolver` - Resolve dependencies

### Line-Specific Tools
**Concept Line (01-concept-line/tools/)**
- `viewforge` - View transformation engine
- `concept-generator` - HTML mockup generator
- `busm-reader` - Business model reader

**Prototype Line (02-prototype-line/tools/)**
- `react-generator` - React component generator
- `prototype-runtime` - Development runtime
- `theme-engine` - Theme processing

**Production Line (03-production-line/tools/)**
- `vue-generator` - Vue component generator
- `deployment-tools` - Production deployment

## Root File Organization

### Files Moving to Documentation
```
.pipeline/CONCEPT-LINE-*.md → 09-documentation/architecture/
.pipeline/STAGE-*.md → 09-documentation/processes/
.pipeline/SPRINT-*.md → 09-documentation/lessons-learned/
.pipeline/PRD-*.md → 09-documentation/reports/
.pipeline/THREAD-*.md → 09-documentation/architecture/
.pipeline/AST-*.md → 09-documentation/architecture/
```

### Files Moving to Handoffs
```
.pipeline/HANDOFF-*.md → 10-handoffs/completed/2025-01/
```

### Files Moving to Operations
```
.pipeline/auto-commit.sh → 12-operations/scripts/
.pipeline/start-auto-commit.sh → 12-operations/scripts/
.pipeline/auto-commit.log → 12-operations/logs/2025-01-25/
```

### Files Staying at Root
```
.pipeline/README.md → Updated with new structure guide
.pipeline/package.json → If needed for pipeline tools
```

## Handoff Management Strategy

### Active Handoffs (10-handoffs/active/)
- One file per active handoff
- Template-based structure
- Auto-move to completed on closure

### Handoff Naming Convention
```
HANDOFF-[date]-[feature/sprint]-[recipient-initials].md
```

Examples:
- `HANDOFF-2025-01-25-account-module-JD.md`
- `HANDOFF-2025-01-26-sprint-3-complete-TM.md`

### Handoff Template
```markdown
# Handoff: [Feature/Sprint Name]
Date: [YYYY-MM-DD]
From: [Your Name]
To: [Recipient Name]

## Summary
[Brief description]

## Completed Items
- [ ] Item 1 (link to output: ../01-concept-line/outputs/latest/)
- [ ] Item 2 (link to code)

## Pending Items
- [ ] Todo 1
- [ ] Todo 2

## Key Decisions
- Decision 1: [Rationale]

## Known Issues
- Issue 1: [Description]

## Resources
- PRD: ../00-requirements/prds/active/[prd-name].md
- Latest Concept: ../01-concept-line/outputs/latest/
- Latest Prototype: ../02-prototype-line/outputs/latest/
```

## Benefits of Revised Structure

### 1. Complete Tool Coverage
- All 16+ tools properly categorized
- Clear distinction between processing, data, and line-specific tools
- Control center for monitoring

### 2. Version Traceability
- Every output is versioned with timestamp
- Manifest files track entire build lineage
- Easy to trace from requirement → concept → prototype → production

### 3. Clear Naming = Easy Discovery
- Version prefix tells you the line (v1=concept, v2=prototype, v3=production)
- Timestamps show chronological order
- Descriptive suffixes indicate content

### 4. Organized Documentation
- Dedicated handoff management system
- Root files properly categorized
- Scripts in operations folder with clear purpose

### 5. Operational Excellence
- Daily log organization
- Backup strategy built-in
- Script management centralized

## Migration Order (Revised)

### Day 1: Structure & Scripts
1. Create new folder structure
2. Move scripts to `12-operations/scripts/`
3. Set up logging in `12-operations/logs/`

### Day 2: Requirements & Documentation
1. Consolidate requirements to `00-requirements/`
2. Move documentation to `09-documentation/`
3. Set up handoff system in `10-handoffs/`

### Day 3: Processing & Data Tools
1. Move cross-line tools to `04-processing-tools/`
2. Move data tools to `05-data-tools/`
3. Set up control center in `06-control-center/`

### Day 4-6: Line Migration with Versioning
1. Migrate each line with new versioning structure
2. Create initial versioned outputs
3. Set up latest symlinks

### Day 7: Validation
1. Test all tool paths
2. Verify version tracking
3. Update all documentation

## Quick Reference Card

### Where to Find Things
```
Requirements? → 00-requirements/
Concept mockups? → 01-concept-line/outputs/latest/
React components? → 02-prototype-line/outputs/latest/
Production builds? → 03-production-line/outputs/latest/
Processing tools? → 04-processing-tools/
Data tools? → 05-data-tools/
Control panel? → 06-control-center/
Database stuff? → 07-database/
Current iteration? → 08-iterations/current/
Documentation? → 09-documentation/
Handoffs? → 10-handoffs/active/
Tests? → 11-quality/tests/
Scripts? → 12-operations/scripts/
```

### Version at a Glance
- v1.x.x = Concept Line
- v2.x.x = Prototype Line  
- v3.x.x = Production Line

### Output History
- Check manifest.json for build details
- Follow symlink from latest/ for current version
- Browse version folders for history