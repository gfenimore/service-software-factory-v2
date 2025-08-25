
# Iteration Manager Quick Guide

## 🚀 Quick Start

The Iteration Manager solves the artifact versioning problem by providing isolated workspaces for each Concept Line run.

## 📝 Core Commands

### Start Fresh
```bash
npm run concept:new-iteration "testing 3-click navigation"
```
- Archives current workspace automatically
- Creates clean slate for new concept run
- Timestamps everything for full traceability

### View History
```bash
npm run concept:list-iterations
```
Shows all iterations with:
- Requirements/stories/tasks counts
- Validation results
- Golden tags for demo-ready versions

### Switch Workspaces
```bash
npm run concept:switch-iteration 2025-08-19T09-16-12-initial-baseline
```
- Restores complete workspace from archive
- Auto-backs up current workspace first

### Mark Demo-Ready
```bash
npm run concept:tag-golden 2025-08-19T09-16-12-client-demo
```
Tags iterations that are ready for client demos

### Compare Iterations
```bash
npm run concept:compare iteration-1 iteration-2
```
Shows what changed between iterations (requirements, stories, validations)

## 📁 What Gets Managed

The system versions these directories:
- `.pipeline/1-inputs/requirements/` - Specs, stories, tasks
- `.pipeline/2-factory/validation/` - Requirements.json, validation rules
- `.pipeline/3-workspace/concept/` - Generated HTML concepts

## 🎯 Workflow Example

```bash
# 1. Start new experiment
npm run concept:new-iteration "experiment-nav-improvements"

# 2. Run your Concept Line pipeline
node .pipeline/2-factory/processors/requirements-parser/REQUIREMENTS-PARSER.js ...
1 ...
node .pipeline/2-factory/processors/concept-generator/CONCEPT-GENERATOR.js ...

# 3. If it's good, tag it
npm run concept:tag-golden 2025-08-19T10-30-00-experiment-nav-improvements

# 4. Start next iteration
npm run concept:new-iteration "add-performance-metrics"

# 5. Compare results
npm run concept:compare previous-iteration current-iteration
```

## 💾 Archive Structure

```
.pipeline/iterations/
├── archive/
│   ├── 2025-08-19T09-16-12-initial-baseline/
│   │   ├── 1-inputs/requirements/
│   │   ├── 2-factory/validation/
│   │   ├── 3-workspace/concept/
│   │   └── iteration-metadata.json
│   └── 2025-08-19T10-30-00-nav-improvements/
└── manifest.json
```

## 🔑 Key Benefits

1. **Zero Friction** - One command to start fresh
2. **Complete Isolation** - Each iteration is self-contained
3. **Full Traceability** - Know exactly what was generated when
4. **Demo Ready** - Easily preserve client-ready iterations
5. **Learning Enabled** - Compare iterations to track improvements

## 🚨 Important Notes

- Archives are created automatically when starting new iterations
- Switching iterations creates a backup of current workspace
- Golden tags persist across sessions
- All timestamps are in ISO format for easy sorting

## 🔧 Troubleshooting

If workspace seems corrupted:
1. List iterations to find a good baseline
2. Switch to that iteration
3. Start fresh from there

If iteration not found:
- Check exact ID with `npm run concept:list-iterations`
- IDs are case-sensitive and include timestamps

## 🎓 Pro Tips

1. Tag golden iterations immediately after successful demos
2. Use descriptive names for iterations (they become part of the ID)
3. Compare iterations after major changes to verify improvements
4. Archive important iterations outside the project for long-term storage