# SDLC Reorganization Plan - August 2025
**Date**: August 10, 2025  
**Status**: Ready for Review  
**Purpose**: Separate product specifications from SDLC process artifacts

## 📊 Current State Analysis

### By the Numbers
- **Total Files**: 149
- **Agent/Processor Files**: 58 (39%)
- **User Stories**: 10 (7%)
- **Potential Archives**: 33 (22%)
- **Mixed Concerns**: 16 files in wrong locations

### Key Problems Identified
1. **Mixed Concerns**: Product specs mixed with SDLC process files
2. **Duplicate Files**: Multiple versions of processors in archives
3. **Scattered State**: Session tracking in multiple locations
4. **Path Confusion**: Agents looking for files in wrong directories

## 🎯 Reorganization Strategy

### Core Principle: Separation of Concerns
- **`.product-specs/`** = WHAT we build (features, requirements, user stories)
- **`.sdlc/`** = HOW we build (agents, workflows, patterns, tools)

### New Structure Overview

```
.product-specs/                         # Product requirements
├── 00-platform-core/                   # Shared across all domains
│   ├── vision/
│   │   └── master-view-feature.md      # From 05-backlog/
│   ├── epics/
│   │   └── EP-001-accounts/
│   │       ├── features/
│   │       │   ├── FEA-001-master-view/
│   │       │   │   └── stories/        # From 05-backlog/A-accounts/
│   │       │   └── FEA-002-reports/
│   │       └── architecture/           # Technical designs
│   └── busm-model/                     # Universal data model
│
├── 01-pest-control/                    # Domain-specific
└── 02-marine-services/                 # Domain-specific

.sdlc/                                  # Process & tools (cleaned up)
├── 01-core/                            # Keep as-is
├── 05-active-work/                     # Renamed from 05-backlog
│   └── current-iteration/              # Symlinks to active story
├── 09-archive/                         # Expanded
│   ├── investigations-2025-08/         # From validation/completed
│   └── old-processors/                 # From G-agent-archive
└── 10-project-tracking/                # NEW - Consolidated tracking
    ├── session-state.json              # From 07-operations
    └── iteration-logs/                 # From current-work
```

## 📋 Migration Plan

### Phase 1: Safety First (10 minutes)
```bash
# 1. Document current state
git status
git add -A
git commit -m "Pre-reorganization snapshot - 149 files documented per audit"

# 2. Create safety branch
git checkout -b reorganization-2025-08-10

# 3. Tag current state
git tag -a pre-reorg-v1 -m "State before product/SDLC separation"
```

### Phase 2: Create New Structure (15 minutes)
```bash
# Product specifications
mkdir -p .product-specs/00-platform-core/{vision,epics,busm-model}
mkdir -p .product-specs/00-platform-core/epics/EP-001-accounts/{features,architecture}
mkdir -p .product-specs/01-pest-control/features
mkdir -p .product-specs/02-marine-services/features

# SDLC improvements
mkdir -p .sdlc/10-project-tracking/{iteration-logs,metrics}
mkdir -p .sdlc/09-archive/{investigations-2025-08,old-processors,old-manifests}
```

### Phase 3: Move Product Files (20 minutes)
```bash
# Move user stories and requirements
git mv .sdlc/05-backlog/A-accounts/master-view/*.md .product-specs/00-platform-core/epics/EP-001-accounts/features/FEA-001-master-view/stories/
git mv .sdlc/05-backlog/A-accounts/list-view/*.md .product-specs/00-platform-core/epics/EP-001-accounts/features/FEA-002-reports/stories/

# Move vision document
git mv .sdlc/05-backlog/master-view-feature.md .product-specs/00-platform-core/vision/

# Move architecture docs
git mv .sdlc/08-architecture/C-ui-ux/*interaction*.md .product-specs/00-platform-core/epics/EP-001-accounts/architecture/
```

### Phase 4: Archive Obsolete Files (15 minutes)
```bash
# Archive completed investigations
git mv .sdlc/validation/investigations/completed/* .sdlc/09-archive/investigations-2025-08/

# Archive old processor versions (already in G-agent-archive)
git mv .sdlc/01-core/G-agent-archive/* .sdlc/09-archive/old-processors/

# Archive old manifests
git mv .sdlc/05-backlog/A-accounts/master-view/processor-manifest-vs*.json .sdlc/09-archive/old-manifests/
```

### Phase 5: Consolidate Tracking (10 minutes)
```bash
# Move session tracking
git mv .sdlc/current-work/* .sdlc/10-project-tracking/iteration-logs/
git mv .sdlc/07-operations/A-session-tracking/session-state.json .sdlc/10-project-tracking/

# Clean up empty directories
git rm -r .sdlc/current-work
git rm -r .sdlc/05-backlog/A-accounts
```

### Phase 6: Update References (30 minutes)
This requires manual updates to:
1. Agent prompts - Update file paths
2. Import statements in code
3. Documentation references
4. Scripts that reference old paths

## 🔍 Validation Checklist

### Before Migration
- [ ] All files committed to Git
- [ ] Safety branch created
- [ ] Current state tagged
- [ ] Team notified of changes

### After Migration
- [ ] No files lost (Git history preserved)
- [ ] All user stories in product-specs
- [ ] All SDLC tools remain in .sdlc
- [ ] Archive is organized by date/type
- [ ] Empty directories removed

### Testing
- [ ] One agent updated with new paths
- [ ] Test agent can find required files
- [ ] Git history accessible for moved files
- [ ] No broken imports in codebase

## 📊 Success Metrics

### Immediate
- Clean separation of concerns
- Reduced file search time
- Clear product backlog location
- Organized archive structure

### Long-term
- Easier onboarding for new domains
- Simplified Azure DevOps integration
- Clearer product roadmap visibility
- Improved SDLC maintenance

## ⚠️ Risk Mitigation

### Potential Issues
1. **Broken References**: Agent prompts with hardcoded paths
   - **Mitigation**: Update incrementally, test each agent

2. **Lost History**: Git might lose track of moved files
   - **Mitigation**: Use `git mv` exclusively, never manual move

3. **Import Errors**: Code imports using old paths
   - **Mitigation**: Global search/replace with verification

4. **Team Confusion**: Others don't know new structure
   - **Mitigation**: Update README, communicate changes

## 🚀 Next Steps After Reorganization

1. **Update DevOps Agent** - First agent to use new paths
2. **Test US-005 Flow** - Verify end-to-end process works
3. **Document New Structure** - Update main README
4. **Create Path Constants** - Central config for all paths
5. **Azure DevOps Prep** - Map product-specs to work items

## 📝 Notes for CC

### Questions for Implementation
1. Should we create symlinks for backward compatibility temporarily?
2. Any files in the audit that shouldn't be moved?
3. Preferred order for updating agent references?
4. Should we automate the path updates with a script?

### Expected Outcomes
- Product owners can find all requirements in one place
- SDLC team can evolve process without touching product specs
- Clear handoff points between product definition and development
- Foundation for multi-domain scaling

---

*This plan separates concerns while preserving all Git history and maintaining system functionality.*