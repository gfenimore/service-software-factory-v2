# CC's Analysis of SDLC Reorganization Plan

**Date**: August 10, 2025  
**Time**: 05:30 hours

## 1. 🚨 Safety Concerns & Dependencies

### Critical Dependencies Found:

1. **Processor Manifests** (`processor-manifest.json`)
   - Currently referenced by: `run-processor-pipeline.sh`, `run-slice.sh`
   - **Risk**: Scripts expect manifests in `.sdlc/05-backlog/A-accounts/master-view/`
   - **Solution**: Update script paths OR create symlinks during transition

2. **Agent File References**
   - Agents don't hardcode paths (they receive tasks as context)
   - **Low Risk**: Agents are prompt-based, not file-dependent

3. **Scripts in /scripts/**
   - `extract-value-slices.js` looks for tasks in `05-backlog`
   - `validate-processor-output.js` expects certain structures
   - **Solution**: Update these BEFORE moving files

### Recommended Symlinks (Temporary):

```bash
# Create backward compatibility for 7 days
ln -s ../../.product-specs/00-platform-core/epics/EP-001-accounts .sdlc/05-backlog/A-accounts
```

## 2. 🔄 Migration Approach Analysis

### Phased vs All-at-Once:

**Recommendation: Modified Phased Approach**

```
Phase 0: Pre-flight (NEW)
- Update all scripts to use configurable paths
- Create path-config.json with old paths
- Test scripts still work

Phase 1-6: As planned (good sequence)

Phase 7: Post-migration (NEW)
- Update path-config.json with new paths
- Remove symlinks after verification
```

### Optimal Order Adjustment:

1. **Do Phase 4 (Archive) FIRST** - Less to update later
2. **Then Phase 3 (Move Product)** - Main reorganization
3. **Finally Phase 5 (Consolidate)** - Cleanup

## 3. 📦 Archive Strategy Review

### Files to PRESERVE (not archive):

```
KEEP ACTIVE:
- processor-manifest.json (current, not vs1/vs2/vs3)
- Recent investigations (< 30 days)
- Test twin processors (actively used)

ACTUALLY ARCHIVE:
✓ Old processor versions in G-agent-archive
✓ Completed investigations > 30 days
✓ processor-manifest-vs*.json (old value slices)
```

### Investigation Retention:

- **Keep 60 days** (not 30) - Often referenced for patterns
- Create `investigations-2025-Q3/` folders (quarterly)

## 4. 🧪 Testing Strategy

### Verification Script Needed:

```javascript
// scripts/verify-reorg.js
const criticalPaths = [
  {
    file: 'processor-manifest.json',
    oldPath: '.sdlc/05-backlog/A-accounts/master-view/',
    newPath: '.product-specs/00-platform-core/epics/EP-001-accounts/current/',
  },
  // ... more paths
]

criticalPaths.forEach(validatePath)
```

### Canary Testing Order:

1. **TYPE-PROCESSOR** - Simplest, fewest dependencies
2. **DevOps Agent** - Good integration test
3. **run-slice.sh** - Critical path validation

### Test Commands:

```bash
# After each phase
npm run type-check
npm run test:ci
./scripts/run-slice.sh 1  # Test slice execution
```

## 5. 🎯 Additional Recommendations

### Files That Don't Fit Either Category:

```
CREATE NEW CATEGORY:
.sdlc/11-reference/
├── patterns/          (from 06-patterns)
├── templates/         (from 06-patterns/A-templates)
└── examples/          (code examples)
```

### 10-project-tracking Structure:

```
.sdlc/10-project-tracking/
├── config/
│   ├── path-config.json      # Centralized paths
│   └── session-state.json
├── iterations/
│   ├── 2025-08-sprint-1/
│   └── current -> 2025-08-sprint-1/
├── metrics/
│   └── velocity.json
└── reports/
    └── session-summaries/     # From current-work
```

### Other Improvements:

1. **Add .gitkeep files** to empty directories
2. **Create INDEX.md** in each major folder
3. **Add migration-log.md** to track what moved where
4. **Generate redirect map** for documentation updates

## 6. ⚠️ Unconsidered Risks

### Risks Not in Your Plan:

1. **Package.json Scripts**
   - Some npm scripts may reference old paths
   - Solution: Audit all scripts in package.json

2. **CI/CD Pipelines**
   - GitHub Actions might reference old structures
   - Solution: Check .github/workflows/

3. **Documentation Links**
   - READMEs have relative links that will break
   - Solution: Find/replace pass needed

4. **Hidden Config Files**
   - `.eslintrc`, `tsconfig.json` paths
   - Solution: Check for path mappings

5. **Session State Corruption**
   - Moving active session files might break state
   - Solution: Complete current work first

## 7. 📝 Implementation Script

### Automated Path Update Script:

```javascript
// scripts/update-reorg-paths.js
const updates = [
  {
    pattern: /\.sdlc\/05-backlog\/A-accounts/g,
    replacement: '.product-specs/00-platform-core/epics/EP-001-accounts',
  },
  // ... more patterns
]

// Update all .js, .sh, .md files
updateFiles('**/*.{js,sh,md}', updates)
```

## 8. ✅ Modified Execution Plan

### Pre-Migration Checklist:

- [ ] Complete any in-progress work
- [ ] Run full test suite
- [ ] Create path configuration file
- [ ] Update critical scripts
- [ ] Document current working directory

### Execution Order:

1. **Archive first** (reduce scope)
2. **Update scripts** (prepare infrastructure)
3. **Move product specs** (main change)
4. **Consolidate tracking** (cleanup)
5. **Verify everything** (test suite)
6. **Update references** (fix breaks)
7. **Remove symlinks** (after verification)

### Post-Migration:

- [ ] Update main README
- [ ] Create migration guide
- [ ] Tag new structure `post-reorg-v1`
- [ ] Announce to team
- [ ] Monitor for issues (24 hours)

## 🎯 Final Recommendation

**GO AHEAD WITH MODIFICATIONS:**

1. Add Phase 0 for script updates
2. Keep processor-manifest.json active (not archive)
3. Create temporary symlinks for safety
4. Use 60-day retention for investigations
5. Add path configuration system

**Critical Success Factor**: Update scripts BEFORE moving files!

---

_Ready to execute with these safety improvements_
