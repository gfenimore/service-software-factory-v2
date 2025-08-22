# Path References Audit Report

**Generated**: August 10, 2025  
**Time**: 05:40 hours  
**Purpose**: Identify all files requiring path updates during SDLC reorganization

## Executive Summary

- **Total files with path references**: 33
- **Critical files**: 4 (active scripts)
- **Documentation files**: 29
- **No GitHub workflows found**
- **Main README has no SDLC path references**

## 🔴 Critical Files (Must Update)

These files are actively used and MUST be updated during reorganization:

### Scripts Using Path Configuration (Already Updated) ✅

1. **run-processor-pipeline.sh**
   - Status: UPDATED to use path-config.json
   - Fallback: Yes

2. **scripts/run-slice.sh**
   - Status: UPDATED to use path-config.json
   - Fallback: Yes

3. **scripts/extract-value-slices.js**
   - Status: UPDATED to use path-config.json
   - Fallback: Yes

4. **scripts/validate-processor-output.js**
   - Status: UPDATED to use path-config.json
   - Fallback: Yes

### Scripts Still With Hardcoded Paths ⚠️

5. **scripts/run-processor-pipeline-strict.sh**
   - Path: `.sdlc/05-backlog/A-accounts/master-view/`
   - Action: Update to use path-config.json

6. **scripts/run-processor-pipeline-validated.sh**
   - Path: `.sdlc/05-backlog/A-accounts/master-view/`
   - Action: Update to use path-config.json

7. **scripts/run-pipeline-with-test-twins.sh**
   - Path: `.sdlc/05-backlog/A-accounts/master-view/`
   - Action: Update to use path-config.json

8. **scripts/pre-validate-manifest.js**
   - Path: `.sdlc/05-backlog/A-accounts/master-view/`
   - Action: Update to use path-config.json

9. **scripts/test-slice-extraction.js**
   - Path: `.sdlc/05-backlog/A-accounts/master-view/`
   - Action: Update to use path-config.json

10. **scripts/create-cc-work-structure.js**
    - Path: `.sdlc/current-work/`
    - Action: Update to use path-config.json

## 🟡 Agent/Processor Files

These contain example paths but don't actively use them:

11. `.sdlc/01-core/A-agents/architect-agent.md` - Example paths in prompts
12. `.sdlc/01-core/A-agents/developer.md` - Example paths in prompts
13. `.sdlc/01-core/A-agents/processors/processor-selector.md` - Example manifest path
14. `.sdlc/01-core/A-agents/processors/invocation-generator.md` - Example paths

**Action**: No immediate update needed (examples only)

## 🟢 Documentation Files

These files reference paths in documentation context:

### Validation Documentation

- `.sdlc/validation/processor-runs/type-processor-02.md`
- `.sdlc/validation/processor-runs/hook-processor-01.md`
- `.sdlc/validation/investigations/completed/*.md`
- `.sdlc/validation/improvements/backlog/slice-aware-pipeline-task.md`

### Reports and Plans

- `.sdlc/inventory-reports/sdlc-reorg-plan.md`
- `.sdlc/inventory-reports/cc-reorg-analysis.md`
- `.sdlc/inventory-reports/reorg-execution-prompts.md`

### Work Tracking

- `.sdlc/current-work/slice-aware-pipeline-progress.md`
- `.sdlc/documentation/create-cc-work-structure.md`
- `.sdlc/documentation/RUN-PROCESSORS-README.md`

**Action**: These are historical records - DO NOT UPDATE

## 📦 Package.json Scripts

### Scripts Reviewed

- `sdlc:inventory` - Points to correct script location
- `lint:processor` - Uses .eslintrc.processor.js (no path issue)
- No hardcoded SDLC paths found

**Action**: No updates needed

## 🌐 GitHub Workflows

**Status**: No .github directory found  
**Action**: No updates needed

## 📋 Migration Impact Analysis

### Files That Will Break Without Updates

1. `scripts/run-processor-pipeline-strict.sh`
2. `scripts/run-processor-pipeline-validated.sh`
3. `scripts/run-pipeline-with-test-twins.sh`
4. `scripts/pre-validate-manifest.js`
5. `scripts/test-slice-extraction.js`

### Files That Will Continue Working

- All scripts already updated to use path-config.json
- Package.json scripts
- Main README

### Files Safe to Ignore

- All documentation files (historical records)
- Agent/processor example paths
- Archived processor versions

## 🎯 Recommended Update Strategy

### Before Moving Files:

1. Update remaining 5-6 scripts to use path-config.json
2. Test all scripts with current paths
3. Verify path-config.json is accessible

### During File Moves:

1. Keep path-config.json with OLD paths
2. Move files according to plan
3. Update path-config.json with NEW paths
4. Test critical scripts

### After File Moves:

1. Run full test suite
2. Verify all scripts work
3. Remove any temporary symlinks

## ⚠️ Critical Notes

1. **Path Configuration Central**: Most critical scripts already updated to use `.sdlc/config/path-config.json`

2. **Remaining Risk**: 5-6 scripts still have hardcoded paths that need updating

3. **No Import Statements**: No TypeScript/JavaScript imports use these paths (only filesystem operations)

4. **Documentation Preservation**: Do NOT update historical documentation - these are records of what was done

---

**Recommendation**: Update the 5-6 remaining scripts to use path-config.json BEFORE proceeding with file moves. This will make the migration much safer.
