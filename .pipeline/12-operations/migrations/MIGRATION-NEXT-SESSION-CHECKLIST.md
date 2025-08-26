# Migration Next Session Checklist
*Continue Three-Line Reorganization - Phases 3-7*

## 🎯 Quick Start for Next Session

```bash
# Verify backup exists
ls -la .pipeline-backup-2025-01-25-092719/

# Check current progress
ls -la .pipeline/00-requirements/
ls -la .pipeline/09-documentation/
ls -la .pipeline/10-handoffs/
ls -la .pipeline/12-operations/
```

## 📋 Phase 3: Processing and Data Tools (~30 min)

### Move to `04-processing-tools/`:
```bash
mv .pipeline/factory-tools/ast-generator .pipeline/04-processing-tools/
mv .pipeline/factory-tools/module-system .pipeline/04-processing-tools/
mv .pipeline/factory-tools/manifest-manager .pipeline/04-processing-tools/
mv .pipeline/factory-tools/gap-logger .pipeline/04-processing-tools/
mv .pipeline/factory-tools/iteration-manager .pipeline/04-processing-tools/
```

### Move to `05-data-tools/`:
```bash
mv .pipeline/factory-tools/database-generator .pipeline/05-data-tools/
mv .pipeline/factory-tools/sample-data-generator .pipeline/05-data-tools/
mv .pipeline/factory-tools/business-rules-configurator .pipeline/05-data-tools/business-rules-engine/
mv .pipeline/factory-tools/integration-discovery-scanner .pipeline/05-data-tools/integration-discovery/
mv .pipeline/factory-tools/integration-version-resolver .pipeline/05-data-tools/integration-resolver/
```

### Move to `06-control-center/`:
```bash
mv .pipeline/factory-tools/factory-control-panel/* .pipeline/06-control-center/
```

## 📋 Phase 4: Line-Specific Content (~45 min)

### Concept Line:
```bash
# Tools
mv .pipeline/factory-tools/viewforge .pipeline/01-concept-line/tools/
mv .pipeline/factory-tools/generators/concept-html .pipeline/01-concept-line/tools/concept-generator/
mv .pipeline/factory-tools/busm-reader .pipeline/01-concept-line/tools/

# Outputs (with versioning)
mkdir .pipeline/01-concept-line/outputs/v1.0.0-$(date +%Y-%m-%d-%H%M)-initial
mv .pipeline/generated/concept-line/* .pipeline/01-concept-line/outputs/v1.0.0-$(date +%Y-%m-%d-%H%M)-initial/
ln -s v1.0.0-* .pipeline/01-concept-line/outputs/latest
```

### Prototype Line:
```bash
# Tools
mv .pipeline/factory-tools/generators/prototype-react .pipeline/02-prototype-line/tools/react-generator/
mv .pipeline/factory-tools/prototype-runtime .pipeline/02-prototype-line/tools/
mv .pipeline/factory-tools/theme-engine .pipeline/02-prototype-line/tools/

# Configs (copy from concept)
cp -r .pipeline/01-concept-line/configs/entities/* .pipeline/02-prototype-line/configs/components/

# Outputs (with versioning)
mkdir .pipeline/02-prototype-line/outputs/v2.0.0-$(date +%Y-%m-%d-%H%M)-initial
mv .pipeline/generated/prototype-line/* .pipeline/02-prototype-line/outputs/v2.0.0-$(date +%Y-%m-%d-%H%M)-initial/
ln -s v2.0.0-* .pipeline/02-prototype-line/outputs/latest
```

### Production Line:
```bash
# Tools (if exist)
mv .pipeline/factory-tools/generators/production-vue .pipeline/03-production-line/tools/vue-generator/ 2>/dev/null

# Outputs (with versioning)
mkdir .pipeline/03-production-line/outputs/v3.0.0-$(date +%Y-%m-%d-%H%M)-initial
mv .pipeline/generated/production-line/* .pipeline/03-production-line/outputs/v3.0.0-$(date +%Y-%m-%d-%H%M)-initial/ 2>/dev/null
ln -s v3.0.0-* .pipeline/03-production-line/outputs/latest 2>/dev/null
```

## 📋 Phase 5: Database and Iterations (~20 min)

```bash
# Database
mv .pipeline/database/migrations/concept/* .pipeline/07-database/migrations/concept/
mv .pipeline/database/migrations/prototype/* .pipeline/07-database/migrations/prototype/
mv .pipeline/database/migrations/production/* .pipeline/07-database/migrations/production/ 2>/dev/null
mv .pipeline/database/types/* .pipeline/07-database/schemas/
mv .pipeline/database/state/* .pipeline/07-database/seeds/

# Iterations
mv .pipeline/iterations/current/* .pipeline/08-iterations/current/
mv .pipeline/iterations/archive/* .pipeline/08-iterations/archive/
```

## 📋 Phase 6: Path Updates (~30 min)

### Priority Files to Update:
1. `.pipeline/04-processing-tools/database-generator/index.js`
2. `.pipeline/02-prototype-line/tools/react-generator/test-theme.js`
3. Any active tool configurations

### Path Update Pattern:
```javascript
// OLD
const path = '.pipeline/factory-tools/ast-generator'

// NEW  
const path = '.pipeline/04-processing-tools/ast-generator'
```

## 📋 Phase 7: Validation & Cleanup (~15 min)

### Test Key Tools:
```bash
# Test concept line
node .pipeline/01-concept-line/tools/viewforge/index.js --test

# Test prototype line
node .pipeline/02-prototype-line/tools/react-generator/index.js --test

# Test processing tools
node .pipeline/04-processing-tools/ast-generator/index.js --test
```

### Create Manifest Files:
Create `manifest.json` in each output version folder:
```json
{
  "version": "v1.0.0",
  "line": "concept",
  "timestamp": "2025-01-25T10:00:00Z",
  "description": "Initial migration",
  "migration_from": "legacy-structure"
}
```

### Final Cleanup:
```bash
# After validation, remove old empty directories
rm -rf .pipeline/factory-tools
rm -rf .pipeline/generated
rm -rf .pipeline/configurations
rm -rf .pipeline/documentation
rm -rf .pipeline/docs

# Update root README
# Create symlinks for backward compatibility if needed
```

## ⚠️ Critical Path Dependencies to Check

1. **Auto-commit script** paths in:
   - `.pipeline/12-operations/scripts/auto-commit.sh`

2. **Any hardcoded paths** in:
   - React generator
   - ViewForge
   - AST generator
   - Database generator

3. **Configuration file references** in:
   - Module system
   - Manifest manager

## 🔄 Rollback Plan (Emergency Only)

```bash
# Full rollback
rm -rf .pipeline
mv .pipeline-backup-2025-01-25-092719 .pipeline

# Partial rollback (specific folder)
rm -rf .pipeline/04-processing-tools
cp -r .pipeline-backup-2025-01-25-092719/factory-tools/* .pipeline/factory-tools/
```

## ✅ Success Criteria

- [ ] All tools run without path errors
- [ ] Version folders created with manifests
- [ ] Latest symlinks work
- [ ] No files lost (compare file count)
- [ ] Auto-commit script still functions
- [ ] Documentation reflects new structure

## 📝 Notes for Next Session

- Backup available at: `.pipeline-backup-2025-01-25-092719/`
- Phase 1-2 complete (scripts, docs, requirements)
- ~500 files remaining to migrate
- Estimated time: 2 hours for phases 3-7
- Consider creating migration script for repeatability

---
*Use this checklist to continue migration in next session*