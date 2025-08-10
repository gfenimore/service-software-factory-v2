# Create Claude Code Work Structure

## Task for Claude Code

### Problem
We need an organized folder structure for CC's work outputs. Currently mixing investigations, improvements, and scripts without clear organization.

### Solution
Create a well-organized directory structure under `.sdlc/` for all CC work products.

### Directory Structure to Create

```
.sdlc/
├── validation/
│   ├── investigations/              # Root cause analyses
│   │   ├── completed/              # Finished investigations
│   │   │   └── README.md          # Index of completed work
│   │   ├── in-progress/            # Active investigations
│   │   │   └── README.md          # Current investigation status
│   │   └── README.md              # Investigation process guide
│   │
│   ├── improvements/               # Process improvements
│   │   ├── completed/             # Implemented improvements
│   │   │   └── README.md         # Index with impact metrics
│   │   ├── in-progress/           # Active improvements
│   │   │   └── README.md         # Current work status
│   │   ├── backlog/              # Future improvements
│   │   │   └── README.md         # Prioritized list
│   │   └── README.md             # Improvement process guide
│   │
│   ├── scripts/                   # Implemented validation scripts
│   │   └── README.md             # Script documentation
│   │
│   └── reports/                   # Generated reports/metrics
│       ├── daily/                # Daily execution reports
│       ├── weekly/               # Weekly summaries
│       └── README.md             # Report format guide
│
├── current-work/                  # Active work tracking
│   ├── README.md                 # Current sprint/focus
│   ├── current-slice.json        # Which value slice
│   ├── value-slices.json         # All slices for story
│   └── completed-slices.json     # History tracking
│
└── metrics/                       # Performance data
    ├── processor-performance/     # Processor timing data
    ├── pipeline-runs/            # Full pipeline metrics
    └── README.md                 # Metrics collection guide
```

### Implementation Script

Create `scripts/create-cc-work-structure.js` that:

1. **Creates all directories** with proper permissions
2. **Generates README templates** for each directory
3. **Moves existing files** to appropriate locations
4. **Creates an index** of all moved files
5. **Initializes tracking files** with default content

### README Templates

#### `.sdlc/validation/investigations/README.md`
```markdown
# Investigations

For deep-dive root cause analyses of issues.

## Process
1. Create issue-specific folder
2. Add investigation task document
3. Run investigation
4. Move to completed/ with findings

## Current Investigations
- See in-progress/

## Completed Investigations
- See completed/
```

#### `.sdlc/validation/improvements/README.md`
```markdown
# Process Improvements

For workflow enhancements and automation.

## Process
1. Create improvement proposal
2. Get approval
3. Implement
4. Measure impact
5. Document results

## Priority Queue
1. Slice-aware pipeline
2. Auto-test generation
3. Performance optimization
```

#### `.sdlc/current-work/README.md`
```markdown
# Current Work Status

## Active Story
- Story: US-XXX
- Current Slice: X
- Status: [Planning|In Progress|Testing|Complete]

## Quick Commands
```bash
# Run next slice
./scripts/run-slice.sh --next

# Check status
cat current-slice.json
```
```

### File Migration Plan

Move existing files to new structure:
```
FROM → TO
.sdlc/validation/investigations/*.md → .sdlc/validation/investigations/completed/
scripts/validate-*.js → .sdlc/validation/scripts/
processor-report-*.json → .sdlc/validation/reports/daily/
```

### Success Criteria

1. ✅ All directories created with READMEs
2. ✅ Existing files moved to correct locations
3. ✅ Migration report showing what moved where
4. ✅ Git-friendly (all changes tracked)
5. ✅ No broken references

### Usage

```bash
# Create structure and migrate files
node scripts/create-cc-work-structure.js

# Dry run to see what would happen
node scripts/create-cc-work-structure.js --dry-run

# Generate migration report only
node scripts/create-cc-work-structure.js --report-only
```

### Output Report

Generate `cc-structure-migration-report.md`:
```markdown
# CC Work Structure Migration Report

## Directories Created: 15
- .sdlc/validation/investigations/completed/
- .sdlc/validation/improvements/in-progress/
[etc...]

## Files Moved: X
- processor-investigation.md → investigations/completed/
- test-processor-analysis.md → improvements/completed/
[etc...]

## Tracking Files Initialized: 3
- current-slice.json
- value-slices.json  
- completed-slices.json

## Next Steps
1. Review new structure
2. Update any scripts with old paths
3. Commit changes
```

---

Please create this directory structure to organize our CC work properly before implementing the slice-aware pipeline.