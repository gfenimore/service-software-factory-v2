# SDLC Reorganization Execution Prompts
**Date**: August 10, 2025  
**Purpose**: Step-by-step prompts for safe reorganization

## ⚠️ EXECUTION INSTRUCTIONS
1. **Execute prompts in STRICT order**
2. **STOP at each checkpoint for review**
3. **Do NOT proceed past a checkpoint without approval**
4. **Report issues immediately**

## 🛑 CHECKPOINT SYSTEM
- **GREEN CHECKPOINT** ✅ = Safe to proceed after CC reports
- **YELLOW CHECKPOINT** 🟡 = Need human review before proceeding  
- **RED CHECKPOINT** 🔴 = STOP - Critical review required

---

## 🚦 Phase 0: Pre-Flight (NEW - Based on CC's Analysis)

### Prompt 1: Create Path Configuration System
```
@cc Please create the following path configuration system:

1. Create file: `.sdlc/config/path-config.json` with:
```json
{
  "version": "1.0",
  "lastUpdated": "2025-08-10",
  "paths": {
    "manifestPath": ".sdlc/05-backlog/A-accounts/master-view/",
    "userStoriesPath": ".sdlc/05-backlog/A-accounts/",
    "sessionStatePath": ".sdlc/07-operations/A-session-tracking/",
    "currentWorkPath": ".sdlc/current-work/",
    "validationPath": ".sdlc/validation/",
    "processorsPath": ".sdlc/01-core/A-agents/processors/"
  },
  "migration": {
    "status": "pre-migration",
    "symlinksActive": false
  }
}
```

2. Update these scripts to use path-config.json:
   - scripts/run-slice.sh
   - scripts/extract-value-slices.js
   - scripts/validate-processor-output.js
   - scripts/run-processor-pipeline.sh

3. Test that all scripts still work with current paths

Report which scripts were updated and any that couldn't be found.
```

### ✅ CHECKPOINT 1: Path Configuration Review
**Type**: GREEN - Safe to proceed after CC confirms:
- [ ] path-config.json created successfully
- [ ] All scripts updated to use config
- [ ] Scripts tested and working
- [ ] No hardcoded paths remain

---

### Prompt 2: Audit All Path References
```
@cc Please audit all path references in the project:

1. Check package.json for any scripts with paths
2. Review all .github/workflows/*.yml files for path references
3. Find all README files with relative links that might break
4. Search for hardcoded paths in:
   - *.js, *.ts, *.jsx, *.tsx files
   - *.sh files
   - *.md files

Output a report: `path-references-audit.md` listing all files that need updates.
```

### 🟡 CHECKPOINT 2: Path Audit Review  
**Type**: YELLOW - Need human review:
- [ ] Review path-references-audit.md
- [ ] Identify any critical paths CC found
- [ ] Decide if any need manual handling
- [ ] APPROVAL REQUIRED: "Proceed with Phase 1"

---

## 🏃 Phase 1: Safety First

### Prompt 3: Create Safety Checkpoint
```
@cc Please execute safety preparations:

1. Verify git status is clean:
   ```bash
   git status
   ```

2. Create safety commit:
   ```bash
   git add -A
   git commit -m "Pre-reorganization checkpoint - 149 files per audit"
   ```

3. Create and switch to reorganization branch:
   ```bash
   git checkout -b feature/sdlc-product-separation-2025-08
   ```

4. Tag current state:
   ```bash
   git tag -a pre-reorg-v1.0 -m "State before product/SDLC separation"
   ```

5. Verify current work is complete:
   - Check if any active stories in progress
   - Confirm session-state.json is not mid-task

Report status of each step.
```

### ✅ CHECKPOINT 3: Safety Verified
**Type**: GREEN - Safe to proceed after:
- [ ] Git status clean
- [ ] Branch created
- [ ] Current state tagged
- [ ] No active work in progress

---

## 📁 Phase 2: Create New Structure

### Prompt 4: Build Target Directories
```
@cc Please create the new directory structure:

```bash
# Product specifications structure
mkdir -p .product-specs/00-platform-core/{vision,busm-model}
mkdir -p .product-specs/00-platform-core/epics/EP-001-accounts/{features,architecture}
mkdir -p .product-specs/00-platform-core/epics/EP-001-accounts/features/{FEA-001-master-view,FEA-002-reports}/stories
mkdir -p .product-specs/01-pest-control/{domain-model,features}
mkdir -p .product-specs/02-marine-services/{domain-model,features}

# SDLC improvements
mkdir -p .sdlc/09-archive/{investigations-2025-Q3,old-processors,old-manifests}
mkdir -p .sdlc/10-project-tracking/{config,iterations/current,metrics,reports}
mkdir -p .sdlc/11-reference/{patterns,templates,examples}

# Add .gitkeep to empty directories
find .product-specs .sdlc -type d -empty -exec touch {}/.gitkeep \;
```

List all created directories.
```

### ✅ CHECKPOINT 4: Structure Ready
**Type**: GREEN - Verify:
- [ ] All directories created
- [ ] .gitkeep files added
- [ ] No errors reported

---

## 🗄️ Phase 3: Archive First (CC's Recommendation)

### Prompt 5: Archive Obsolete Files
```
@cc Please archive obsolete files (CC's recommended order):

1. Archive old investigations (60-day retention per CC):
   ```bash
   # Move investigations older than 60 days
   git mv .sdlc/validation/investigations/completed/* .sdlc/09-archive/investigations-2025-Q3/
   ```

2. Archive old processor versions:
   ```bash
   git mv .sdlc/01-core/G-agent-archive/* .sdlc/09-archive/old-processors/
   ```

3. Archive OLD manifest versions (keep current processor-manifest.json):
   ```bash
   git mv .sdlc/05-backlog/A-accounts/master-view/processor-manifest-vs1.json .sdlc/09-archive/old-manifests/
   git mv .sdlc/05-backlog/A-accounts/master-view/processor-manifest-vs2.json .sdlc/09-archive/old-manifests/
   git mv .sdlc/05-backlog/A-accounts/master-view/processor-manifest-vs3.json .sdlc/09-archive/old-manifests/
   ```

Report: files moved and confirm processor-manifest.json remains in place.
```

### 🟡 CHECKPOINT 5: Archive Complete
**Type**: YELLOW - Verify critical files:
- [ ] processor-manifest.json NOT moved (still active)
- [ ] Only old versions archived
- [ ] Investigation count matches expectation
- [ ] APPROVAL REQUIRED: "Archive correct, proceed"

---

## 📦 Phase 4: Move Product Specifications

### Prompt 6: Migrate User Stories and Features
```
@cc Please move product-related files to new structure:

1. Move master view stories:
   ```bash
   git mv .sdlc/05-backlog/A-accounts/master-view/US-*.md .product-specs/00-platform-core/epics/EP-001-accounts/features/FEA-001-master-view/stories/
   git mv .sdlc/05-backlog/A-accounts/master-view/us-*.md .product-specs/00-platform-core/epics/EP-001-accounts/features/FEA-001-master-view/stories/
   ```

2. Move reports view stories:
   ```bash
   git mv .sdlc/05-backlog/A-accounts/list-view/*.md .product-specs/00-platform-core/epics/EP-001-accounts/features/FEA-002-reports/stories/
   ```

3. Move vision document:
   ```bash
   git mv .sdlc/05-backlog/master-view-feature.md .product-specs/00-platform-core/vision/
   ```

4. Move architecture docs:
   ```bash
   git mv .sdlc/08-architecture/C-ui-ux/accounts-v1-interaction-design.md .product-specs/00-platform-core/epics/EP-001-accounts/architecture/
   ```

5. Keep processor-manifest.json in current location (per CC's advice)

Report all moves completed and any errors.
```

### 🔴 CHECKPOINT 6: Product Files Moved
**Type**: RED - CRITICAL REVIEW:
- [ ] All user stories moved correctly
- [ ] Vision document in right place
- [ ] Architecture docs moved
- [ ] Git history preserved (spot check)
- [ ] APPROVAL REQUIRED: "Product separation complete"
- [ ] DECISION POINT: Continue or rollback?

---

## 🔄 Phase 5: Consolidate Tracking

### Prompt 7: Centralize Project Tracking
```
@cc Please consolidate tracking files:

1. Move session state:
   ```bash
   git mv .sdlc/07-operations/A-session-tracking/session-state.json .sdlc/10-project-tracking/config/
   ```

2. Move current work tracking:
   ```bash
   git mv .sdlc/current-work/session-summaries .sdlc/10-project-tracking/reports/
   git mv .sdlc/current-work/*.json .sdlc/10-project-tracking/iterations/current/
   ```

3. Create symlink for active iteration:
   ```bash
   ln -s iterations/current .sdlc/10-project-tracking/active
   ```

4. Update path-config.json with new locations

Report moves and verify session-state.json is accessible.
```

### 🟡 CHECKPOINT 7: Tracking Consolidated
**Type**: YELLOW - Verify:
- [ ] Session state accessible
- [ ] Current work preserved
- [ ] Symlinks working
- [ ] APPROVAL REQUIRED: "Tracking structure good"

---

## 🔧 Phase 6: Update References

### Prompt 8: Update Path References
```
@cc Please update all path references using the audit from Phase 0:

1. Update path-config.json with new paths:
   ```json
   {
     "paths": {
       "manifestPath": ".sdlc/05-backlog/A-accounts/master-view/",
       "userStoriesPath": ".product-specs/00-platform-core/epics/EP-001-accounts/",
       "sessionStatePath": ".sdlc/10-project-tracking/config/",
       "currentWorkPath": ".sdlc/10-project-tracking/iterations/current/"
     }
   }
   ```

2. Run the path update script (if created) or manually update:
   - Scripts that reference old paths
   - Any hardcoded paths in source files
   - README files with broken links

3. Special attention to:
   - run-slice.sh (critical path)
   - Agent prompt files (if any have paths)

Report all updates made.
```

### 🔴 CHECKPOINT 8: References Updated
**Type**: RED - CRITICAL TEST POINT:
- [ ] Run sample script to test paths
- [ ] Verify at least one agent works
- [ ] Check critical scripts (run-slice.sh)
- [ ] APPROVAL REQUIRED: "System functional"
- [ ] DECISION POINT: Commit or rollback?

---

## ✅ Phase 7: Validation

### Prompt 9: Run Verification Suite
```
@cc Please verify the reorganization:

1. Run verification script:
   ```bash
   node scripts/verify-reorg.js
   ```

2. Test critical paths:
   ```bash
   # Test type checking still works
   npm run type-check
   
   # Test processor pipeline
   ./scripts/run-processor-pipeline.sh test
   
   # Test slice execution
   ./scripts/run-slice.sh 1
   ```

3. Verify git history preserved:
   ```bash
   # Check a moved file maintains history
   git log --follow .product-specs/00-platform-core/epics/EP-001-accounts/features/FEA-001-master-view/stories/us-005-account-details.md
   ```

4. Check for broken imports:
   ```bash
   npm run build
   ```

Report all test results and any failures.
```

### 🔴 CHECKPOINT 9: All Systems Go
**Type**: RED - FINAL VERIFICATION:
- [ ] All tests passing
- [ ] Git history verified
- [ ] Build successful
- [ ] Manual test of one workflow
- [ ] FINAL APPROVAL: "Commit changes"

---

## 🎯 Phase 8: Finalization

### Prompt 10: Complete Migration
```
@cc Please finalize the reorganization:

1. Clean up empty directories:
   ```bash
   find .sdlc -type d -empty -delete
   ```

2. Update main README with new structure

3. Create migration log:
   ```bash
   echo "# SDLC Reorganization Log - $(date)" > .sdlc/10-project-tracking/migration-log.md
   echo "## Files Moved:" >> .sdlc/10-project-tracking/migration-log.md
   git log --name-status --oneline -20 >> .sdlc/10-project-tracking/migration-log.md
   ```

4. Commit all changes:
   ```bash
   git add -A
   git commit -m "feat: separate product specs from SDLC process

   - Moved user stories to .product-specs/
   - Consolidated tracking to .sdlc/10-project-tracking/
   - Archived obsolete files to .sdlc/09-archive/
   - Updated all path references
   - Maintained git history for all moves"
   ```

5. Tag new structure:
   ```bash
   git tag -a post-reorg-v1.0 -m "Structure after product/SDLC separation"
   ```

Report completion status and any remaining tasks.
```

### ✅ CHECKPOINT 10: Migration Complete
**Type**: GREEN - Celebrate!
- [ ] All changes committed
- [ ] New structure tagged
- [ ] README updated
- [ ] Team notified

---

## 🚨 Emergency Rollback (If Needed)

### Prompt 11: Rollback Procedure
```
@cc If anything goes wrong, execute rollback:

1. Stash any uncommitted changes:
   ```bash
   git stash
   ```

2. Return to pre-reorg state:
   ```bash
   git checkout main
   git branch -D feature/sdlc-product-separation-2025-08
   ```

3. Restore from tag if needed:
   ```bash
   git checkout pre-reorg-v1.0
   ```

Only use if critical failures occur.
```

---

*Execute prompts in order. Stop if any phase fails.*