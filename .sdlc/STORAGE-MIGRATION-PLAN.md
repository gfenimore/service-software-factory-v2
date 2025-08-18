# Storage Migration Plan - From Chaos to Order

**Date**: August 18, 2025  
**Status**: READY FOR EXECUTION  
**Risk**: MEDIUM (with proper backups)

---

## 🎯 Migration Strategy: Two-Phase Approach

### Why Two Phases?

1. **Phase 1** fixes immediate chaos without introducing new complexity
2. **Phase 2** adds progressive structure once we have stability
3. Reduces risk of breaking everything at once
4. Allows testing and validation between phases

---

## 📊 Phase 1: Consolidate Current Chaos

### Step 1: Create Backup (CRITICAL)

```bash
# Full backup before any changes
cp -r .sdlc .sdlc-backup-$(date +%Y%m%d-%H%M%S)
cp -r .cursor .cursor-backup-$(date +%Y%m%d-%H%M%S)
cp -r src/app/test src-app-test-backup-$(date +%Y%m%d-%H%M%S)
```

### Step 2: Create New Structure

```bash
# Create consolidated pipeline directory
mkdir -p .pipeline/current/{features,stories,tasks,architecture,manifests}
mkdir -p .pipeline/staging/test-pages
mkdir -p .pipeline/archive
mkdir -p .pipeline/config

# Create single session state
echo '{"version": "1.0", "migration_date": "'$(date -Iseconds)'"}' > .pipeline/current/session.json
```

### Step 3: Consolidate Artifacts (Order Matters!)

#### 3.1 Feature Documents

```bash
# Collect from multiple locations
cp .sdlc/01-planning/features/* .pipeline/current/features/ 2>/dev/null || true
cp .sdlc/12-sdlc-design/sdlc-experimental/01-planning/features/* .pipeline/current/features/ 2>/dev/null || true
```

#### 3.2 User Stories

```bash
# Consolidate story outputs
cp .sdlc/01-planning/user-stories/* .pipeline/current/stories/ 2>/dev/null || true
cp .sdlc/12-sdlc-design/sdlc-experimental/01-planning/user-stories/* .pipeline/current/stories/ 2>/dev/null || true
```

#### 3.3 Task Artifacts

```bash
# Move from hidden .cursor directory
cp .cursor/artifacts/current/planning/* .pipeline/current/tasks/ 2>/dev/null || true
```

#### 3.4 Architecture Documents

```bash
# Consolidate architecture from backlog
find .sdlc/05-backlog -name "*architecture*.md" -exec cp {} .pipeline/current/architecture/ \; 2>/dev/null || true
cp .sdlc/02-design/specs/* .pipeline/current/architecture/ 2>/dev/null || true
```

#### 3.5 Processor Manifests

```bash
# Collect all manifests
find .sdlc/05-backlog -name "*manifest*.json" -exec cp {} .pipeline/current/manifests/ \; 2>/dev/null || true
```

#### 3.6 Test Pages

```bash
# Move test pages out of production code
mv src/app/test/* .pipeline/staging/test-pages/ 2>/dev/null || true
```

### Step 4: Create Path Configuration

```yaml
# .pipeline/config/paths.yaml
version: 1.0
base_path: '.pipeline'

agents:
  STORY_BUILDER:
    input: '${base_path}/current/features'
    output: '${base_path}/current/stories'

  PLANNER:
    input: '${base_path}/current/stories'
    output: '${base_path}/current/tasks'

  ARCHITECT:
    input: '${base_path}/current/stories'
    output: '${base_path}/current/architecture'

  PROCESSOR_SELECTOR:
    input: '${base_path}/current/tasks'
    output: '${base_path}/current/manifests'

processors:
  output_base: 'src'
  test_output: '${base_path}/staging/test-pages'

session:
  state_file: '${base_path}/current/session.json'

archive:
  path: '${base_path}/archive'
  retention_days: 90
```

### Step 5: Update Agent Configurations

#### 5.1 Create Migration Script

```javascript
// scripts/update-agent-paths.js
const fs = require('fs')
const path = require('path')

const AGENT_FILES = [
  '.sdlc/01-core/A-agents/story-builder-v21.md',
  '.sdlc/01-core/A-agents/planner-v52.md',
  '.sdlc/01-core/A-agents/architect-v50.md',
  // ... other agents
]

const PATH_REPLACEMENTS = [
  // Old path → New path
  ['.cursor/artifacts/current/planning/', '.pipeline/current/tasks/'],
  ['.sdlc/01-planning/user-stories/', '.pipeline/current/stories/'],
  ['.sdlc/05-backlog/${module}/${feature}/', '.pipeline/current/architecture/'],
  ['.product-specs/', '.pipeline/current/features/'],
  ['src/app/test/', '.pipeline/staging/test-pages/'],
]

function updateAgentPaths() {
  AGENT_FILES.forEach((file) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8')

      PATH_REPLACEMENTS.forEach(([oldPath, newPath]) => {
        content = content.replace(
          new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          newPath
        )
      })

      fs.writeFileSync(file, content)
      console.log(`Updated: ${file}`)
    }
  })
}

updateAgentPaths()
```

### Step 6: Verification Script

```bash
#!/bin/bash
# scripts/verify-migration.sh

echo "🔍 Verifying Migration..."

# Check new structure exists
for dir in features stories tasks architecture manifests; do
  if [ -d ".pipeline/current/$dir" ]; then
    echo "✅ .pipeline/current/$dir exists"
  else
    echo "❌ Missing .pipeline/current/$dir"
  fi
done

# Check for orphaned artifacts
echo ""
echo "📊 Artifact Count Comparison:"
echo "Old .cursor/artifacts: $(find .cursor/artifacts -type f 2>/dev/null | wc -l)"
echo "Old .sdlc scattered: $(find .sdlc -name "US-*" -type f 2>/dev/null | wc -l)"
echo "New .pipeline: $(find .pipeline/current -type f | wc -l)"

# Check agent configurations
echo ""
echo "🤖 Checking Agent Paths:"
grep -h "\.pipeline" .sdlc/01-core/A-agents/*.md | head -5
```

### Step 7: Clean Up Old Locations (AFTER VERIFICATION)

```bash
# Only run after confirming migration success!
# scripts/cleanup-old-locations.sh

echo "⚠️  This will remove old artifact locations. Are you sure? (y/n)"
read -r response
if [[ "$response" == "y" ]]; then
  rm -rf .cursor/artifacts
  rm -rf .sdlc/12-sdlc-design/sdlc-experimental
  rm -rf src/app/test
  rm -rf .sdlc/09-retrospectives  # Duplicate
  echo "✅ Old locations cleaned up"
else
  echo "❌ Cleanup cancelled"
fi
```

---

## 📊 Phase 2: Progressive Structure (After Phase 1 Stable)

### When to Execute Phase 2

- [ ] Phase 1 has been running for at least 1 week
- [ ] All agents successfully using new paths
- [ ] No missing artifacts reported
- [ ] Team comfortable with new structure

### Phase 2 Migration Steps

```bash
# Evolve the structure for progressive factory
mkdir -p .pipeline/{concept,prototype,production,graduated}

# Move current work to appropriate lines
mv .pipeline/current/* .pipeline/prototype/  # Most current work is prototype level

# Install progressive configurations
cp .pipeline/config/factory-standards.yaml .pipeline/config/
cp .pipeline/config/agent-line-config.yaml .pipeline/config/
cp .pipeline/config/processor-line-config.yaml .pipeline/config/
cp .pipeline/config/.eslintrc.progressive.js .pipeline/config/
```

---

## ⚠️ Risk Mitigation

### Before Migration

1. **Full backup** of all directories
2. **Document current state** with screenshots/file lists
3. **Test on a branch** first if possible
4. **Notify team** of migration window

### During Migration

1. **Run verification** after each step
2. **Keep detailed log** of actions taken
3. **Test one agent** before updating all
4. **Monitor for errors** in pipeline runs

### After Migration

1. **Keep backups for 30 days**
2. **Monitor agent execution** closely
3. **Document any issues** immediately
4. **Have rollback plan** ready

---

## 🎯 Success Criteria

### Phase 1 Success

- [ ] Single `.pipeline/` directory contains all artifacts
- [ ] No duplicate session states
- [ ] All agents use consistent paths
- [ ] Test pages separated from production code
- [ ] Archive strategy implemented

### Phase 2 Success

- [ ] Progressive structure in place
- [ ] Concept/Prototype/Production lines operational
- [ ] Standards enforcement working per directory
- [ ] Smooth artifact flow between lines

---

## 📅 Estimated Timeline

### Phase 1

- **Preparation**: 1 hour (backups, scripts)
- **Migration**: 2-3 hours (running scripts, verification)
- **Validation**: 1 hour (test pipeline runs)
- **Total**: ~5 hours

### Phase 2

- **Wait Period**: 1 week (stabilization)
- **Migration**: 2 hours
- **Configuration**: 1 hour
- **Total**: ~3 hours (plus wait time)

---

## 🚀 Next Steps

1. **Review this plan** with the team
2. **Schedule migration window** (low-activity period)
3. **Prepare migration scripts** (provided above)
4. **Execute Phase 1**
5. **Monitor and stabilize**
6. **Execute Phase 2** when ready

---

_This plan prioritizes safety and gradual migration over speed. Better to take time and preserve all artifacts than rush and lose work._
