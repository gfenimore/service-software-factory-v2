# ViewForge 2.0 Project Lifecycle Management
*Formal SDLC for Critical Infrastructure Development*

## 1. Project Charter

### 1.1 Project Identity
- **Project Name**: ViewForge 2.0
- **Project Code**: VF-2.0
- **Start Date**: January 21, 2025
- **Duration**: 3 Weeks (MVP)
- **Critical Nature**: Foundation of entire factory - ZERO tolerance for lost work

### 1.2 Success Definition
- Every feature works from configuration
- No lost work due to interruptions
- Complete documentation trail
- Version control for every change

## 2. Development Lifecycle Phases

### Phase 0: Project Preparation (TODAY - 30 minutes)
```
□ Create project structure
□ Initialize Git branch
□ Set up version control hooks
□ Create initial iteration in IMS
□ Document starting state
□ Create backup strategy
```

### Phase 1: Week 1 MVP (Days 1-5)
```
□ Day 1: Core structure + Field selector
□ Day 2: Entity management + BUSM basics
□ Day 3: Export functionality
□ Day 4: Testing with real entities
□ Day 5: Documentation + Release
```

### Phase 2: Week 2 Enhancement (Days 6-10)
```
□ Day 6: Relationship support
□ Day 7: Detail view context
□ Day 8: Preview capability
□ Day 9: IMS integration
□ Day 10: Testing + Documentation
```

### Phase 3: Week 3 Full MVP (Days 11-15)
```
□ Day 11: Layout Configuration module
□ Day 12: Master-Detail-Detail pattern
□ Day 13: Inline-Expansion pattern
□ Day 14: Black & white enforcement
□ Day 15: Final testing + Release
```

## 3. Version Control Strategy

### 3.1 Git Workflow
```bash
# Branch Strategy
main
  └── feature/viewforge-2.0  ← We work here
        ├── vf-2.0-week1    ← Weekly snapshots
        ├── vf-2.0-week2
        └── vf-2.0-week3

# Commit Schedule
- Every 30 minutes during active development
- After EVERY successful feature addition
- Before ANY break (coffee, lunch, meeting)
- End of EVERY work session
```

### 3.2 Commit Message Format
```
feat(vf2): Add entity tab switching
- Implemented multiple entity support
- Added tab navigation
- Connected to BUSM registry
[Session: 2025-01-21-AM]
[Context: Building field selector module]
```

### 3.3 Automated Commit Script
```javascript
// .pipeline/01-factory-tools/viewforge/auto-commit.js
const commitVF = () => {
  const timestamp = new Date().toISOString();
  const message = `checkpoint(vf2): Auto-save at ${timestamp}`;
  
  exec('git add .pipeline/01-factory-tools/viewforge/');
  exec(`git commit -m "${message}"`);
  exec('git push');
  
  console.log(`✅ ViewForge changes committed at ${timestamp}`);
};

// Run every 30 minutes
setInterval(commitVF, 30 * 60 * 1000);
```

## 4. Documentation Strategy

### 4.1 Documentation Hierarchy
```
.pipeline/01-factory-tools/viewforge/
├── PROJECT-LIFECYCLE.md          # This document
├── DEVELOPMENT-LOG.md            # Daily progress log
├── CONTEXT-PRESERVATION.md       # Why decisions were made
├── INTERRUPTION-RECOVERY.md      # How to resume after break
├── docs/
│   ├── architecture/            # Technical decisions
│   ├── features/                # Feature specifications
│   ├── sessions/                # Session summaries
│   └── issues/                  # Problems and solutions
└── versions/                    # Version snapshots
```

### 4.2 Daily Development Log Template
```markdown
# ViewForge 2.0 Development Log

## Date: [DATE]
### Session: [AM/PM]

#### Context
- What I'm building: [Feature/Module]
- Why: [Business reason]
- Previous session ended: [Where we stopped]

#### Progress
- [ ] Task 1 - Status
- [ ] Task 2 - Status

#### Decisions Made
- Decision 1: [What] because [Why]

#### Issues Encountered
- Issue 1: [Problem] → [Solution]

#### Next Session
- Start with: [Specific task]
- Goal: [What to complete]

#### Files Modified
- file1.html - [What changed]
- file2.js - [What changed]

#### Commit Reference
- Commit: [hash] - [message]
```

## 5. Context Preservation Protocol

### 5.1 Before ANY Interruption
```bash
# 1. Save all work
Ctrl+S in all editors

# 2. Create context file
echo "Working on: [current task]" > .pipeline/01-factory-tools/viewforge/CURRENT-CONTEXT.md
echo "Next step: [what to do next]" >> .pipeline/01-factory-tools/viewforge/CURRENT-CONTEXT.md

# 3. Commit everything
git add -A
git commit -m "interrupt: Saving context - [what you were doing]"

# 4. Push to remote
git push
```

### 5.2 After Interruption (Resume)
```bash
# 1. Check context
cat .pipeline/01-factory-tools/viewforge/CURRENT-CONTEXT.md

# 2. Check last commit
git log -1 --oneline

# 3. Check development log
tail -20 .pipeline/01-factory-tools/viewforge/DEVELOPMENT-LOG.md

# 4. Resume with confidence
```

## 6. Project Structure Setup

### 6.1 Directory Structure
```bash
# Create ViewForge 2.0 structure
.pipeline/01-factory-tools/viewforge/
├── v2/                          # New version (clean start)
│   ├── index.html              # Main application
│   ├── css/
│   │   ├── base.css           # Base styles
│   │   ├── concept-line.css   # B&W enforcement
│   │   └── components.css     # UI components
│   ├── js/
│   │   ├── core/
│   │   │   ├── app.js         # Main application
│   │   │   ├── state.js       # State management
│   │   │   └── events.js      # Event handling
│   │   ├── modules/
│   │   │   ├── field-config.js
│   │   │   ├── layout-config.js
│   │   │   └── export.js
│   │   └── integrations/
│   │       ├── busm.js        # BUSM integration
│   │       ├── ims.js         # IMS integration
│   │       └── git.js         # Git operations
│   ├── data/
│   │   ├── busm-registry.json # Field definitions
│   │   └── templates/          # Config templates
│   └── tests/
│       └── test-configs/       # Test configurations
├── v1/                         # Previous version (preserved)
│   └── configurator.html      # Old version backed up
└── versions/                   # All historical versions
```

## 7. Testing & Validation Strategy

### 7.1 Test Checkpoints
- After each feature: Manual test
- End of day: Full regression test
- End of week: User acceptance test
- Before merge: Complete validation

### 7.2 Test Scenarios
```javascript
// Must-pass scenarios for each phase
const week1Tests = [
  'Configure Account entity',
  'Export valid JSON',
  'Load in generator',
  'Generate HTML successfully'
];

const week2Tests = [
  ...week1Tests,
  'Configure relationship field',
  'Preview shows correctly',
  'IMS integration works'
];
```

## 8. Risk Mitigation

### 8.1 Backup Strategy
```bash
# Automated backup every 2 hours
*/120 * * * * cp -r .pipeline/01-factory-tools/viewforge/ ~/backups/vf-$(date +%Y%m%d-%H%M%S)/

# Before any major change
./scripts/backup-viewforge.sh
```

### 8.2 Recovery Procedures
```bash
# If something breaks
git stash                    # Save current work
git checkout last-known-good # Go to working version
git stash pop                # Try to reapply changes

# If completely broken
cp -r ~/backups/vf-latest/ .pipeline/01-factory-tools/viewforge/
```

## 9. Communication Protocol

### 9.1 Status Updates
```markdown
# Daily status format
## ViewForge 2.0 - Day [N] Status
- **Completed**: [What's done]
- **In Progress**: [What's being worked on]
- **Blocked**: [Any blockers]
- **Tomorrow**: [Next priorities]
- **Confidence**: [Green/Yellow/Red]
```

### 9.2 Issue Escalation
```
Level 1: Note in DEVELOPMENT-LOG.md → Continue working
Level 2: Create issue file → Attempt resolution
Level 3: Stop work → Document completely → Seek help
```

## 10. Pre-Development Checklist

### Before Starting ViewForge 2.0 Development

#### Environment Setup
- [ ] Git repository is clean
- [ ] On correct branch (feature/viewforge-2.0)
- [ ] Backup of current ViewForge v1 created
- [ ] Auto-commit script ready
- [ ] Development log file created

#### Documentation Ready
- [ ] PROJECT-LIFECYCLE.md created (this file)
- [ ] DEVELOPMENT-LOG.md initialized
- [ ] CONTEXT-PRESERVATION.md created
- [ ] Requirements document finalized

#### Tools Ready
- [ ] Text editor configured for auto-save
- [ ] Browser dev tools ready
- [ ] Git GUI or terminal ready
- [ ] Test data prepared

#### Mental Preparation
- [ ] Clear goal for first session
- [ ] Time blocked (minimum 2 hours)
- [ ] Interruption protocol understood
- [ ] Success criteria defined

## 11. Launch Sequence

### Executing Project Start
```bash
# 1. Create feature branch
git checkout -b feature/viewforge-2.0

# 2. Create iteration in IMS
cd .pipeline/01-factory-tools/ims
node iteration-manager.js create --type feature --line development --description "ViewForge 2.0 Development"

# 3. Initialize project structure
mkdir -p .pipeline/01-factory-tools/viewforge/v2/{css,js,data,tests}
mkdir -p .pipeline/01-factory-tools/viewforge/v2/js/{core,modules,integrations}

# 4. Backup v1
cp .pipeline/01-factory-tools/viewforge/configurator.html .pipeline/01-factory-tools/viewforge/v1/

# 5. Create initial files
touch .pipeline/01-factory-tools/viewforge/DEVELOPMENT-LOG.md
touch .pipeline/01-factory-tools/viewforge/CONTEXT-PRESERVATION.md

# 6. First commit
git add -A
git commit -m "init(vf2): Initialize ViewForge 2.0 project structure"

# 7. Start development log
echo "# ViewForge 2.0 Development Log" > .pipeline/01-factory-tools/viewforge/DEVELOPMENT-LOG.md
echo "## Project Started: $(date)" >> .pipeline/01-factory-tools/viewforge/DEVELOPMENT-LOG.md

# 8. Ready to build!
echo "✅ ViewForge 2.0 project initialized and ready for development"
```

## 12. Success Metrics

### How We Know We're Succeeding
1. **No Lost Work**: Every change is in Git
2. **Context Preserved**: Can resume after any interruption
3. **Progress Visible**: Daily commits show advancement
4. **Quality Maintained**: Tests pass at each checkpoint
5. **Documentation Complete**: Every decision recorded

---

## The Commitment

**We commit to:**
1. Save and commit every 30 minutes
2. Document every significant decision
3. Test after every feature
4. Never leave work uncommitted
5. Preserve context for resumption

**This is critical infrastructure. Treat it as such.**

---

*"A interrupted session with good documentation is just a pause. An interrupted session without documentation is lost work."*

Ready to execute the launch sequence?