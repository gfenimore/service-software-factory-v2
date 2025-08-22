# ViewForge 2.0 Context Preservation Document
*Never Lose Your Place Again*

## Current Context (UPDATE THIS SECTION CONTINUOUSLY)

### What I'm Working On RIGHT NOW
```
Module: [Field Configuration / Layout Configuration]
Feature: [Specific feature being built]
File: [Current file being edited]
Function: [Current function/section]
Line: [Approximate line number]
```

### Last Successful Test
```
What worked: [Description]
Test case: [What was tested]
Time: [When it worked]
```

### Next Step
```
Immediate next action: [Specific task]
Why: [Reason for this step]
Expected outcome: [What should happen]
```

---

## Session History

### Session: 2025-01-21 Morning
**Goal**: Set up ViewForge 2.0 project structure
**Started**: [Time]
**Ended**: [Time]
**Completed**: 
- Created PROJECT-LIFECYCLE.md
- Defined SDLC process
- Set up documentation structure

**Decisions Made**:
- Separate v2 from v1 completely (clean slate)
- Use 30-minute commit intervals
- Implement three-week MVP approach

**Next Session Should Start With**:
- Execute launch sequence
- Create initial HTML structure
- Set up basic field configuration

---

## Key Decisions & Rationale

### Why Separate v2 Directory?
**Decision**: Create fresh v2/ instead of modifying existing
**Reason**: 
- Preserve working v1 as fallback
- Clean architecture without legacy code
- Easier to compare versions
**Date**: 2025-01-21

### Why No Framework?
**Decision**: Pure HTML/CSS/JavaScript
**Reason**:
- No dependencies to manage
- Works everywhere immediately
- Faster development for tool
- Focus on functionality not framework
**Date**: 2025-01-21

### Why Black & White First?
**Decision**: Enforce B&W in CSS from start
**Reason**:
- Prevents scope creep
- Forces function over form
- Aligns with Concept Line philosophy
- Easy to add color later, hard to remove
**Date**: 2025-01-21

---

## Technical Context

### File Organization Logic
```
v2/
├── index.html          # Single entry point
├── css/               
│   ├── base.css       # Reset + base styles
│   ├── concept-line.css # B&W enforcement (loaded conditionally)
│   └── components.css # Reusable UI components
├── js/
│   ├── core/          # Essential functionality
│   ├── modules/       # Feature modules (field, layout)
│   └── integrations/  # External connections (BUSM, IMS)
```

### State Management Approach
- Single global state object
- Event-driven updates
- LocalStorage for persistence
- Export state as configuration

### Module Communication
- Event bus pattern
- No direct module dependencies
- Core mediates all communication
- Clean separation of concerns

---

## Problem Solutions Log

### Problem: Lost relationship configuration code
**When**: Previous ViewForge version
**Solution**: Found in archive folder
**Learning**: Always commit working features immediately
**Prevention**: 30-minute auto-commit schedule

---

## Recovery Instructions

### If You're Lost After Interruption:

1. **Check This File First**
   - Read "Current Context" section
   - Note the "Next Step"

2. **Check Last Commit**
   ```bash
   git log -1 --stat
   ```
   Shows what files were last modified

3. **Check Development Log**
   ```bash
   tail -30 DEVELOPMENT-LOG.md
   ```
   Shows recent progress

4. **Check Browser State**
   - Open index.html
   - Look at console for errors
   - Check LocalStorage for saved state

5. **Resume Confidence Checklist**
   - [ ] Know what feature I was building
   - [ ] Know why I was building it
   - [ ] Know what should happen next
   - [ ] Have test case to verify it works

---

## Communication Context

### Terms We're Using
- **Field Configuration**: Selecting which fields to display
- **Layout Configuration**: How fields relate to each other
- **Concept Line**: B&W only, no styling
- **BUSM**: Business model (source of field definitions)
- **IMS**: Iteration management (version control)

### Patterns We're Implementing
- **MDD**: Master-Detail-Detail (3-column cascade)
- **Inline-Expansion**: Zero-click visibility
- **Single Select**: One selection per column only

### Constraints We're Enforcing
- No multi-select in v1
- Single-level relationships only
- Black & white for Concept Line
- Export to JSON only

---

## Quick Resume Checklist

When returning to work:

```bash
# 1. Check context
cat CURRENT-CONTEXT.md

# 2. Check git status
git status

# 3. Check last commit
git log -1

# 4. Read this section
grep "Next Step" CONTEXT-PRESERVATION.md

# 5. Continue where you left off
```

---

## Emergency Recovery

If everything seems broken:

```bash
# 1. Don't panic
# 2. Save any uncommitted work
git stash

# 3. Go to last known good state
git checkout HEAD~1

# 4. Check if it works
open v2/index.html

# 5. If yes, carefully reapply changes
git stash pop

# 6. If no, go back further
git checkout HEAD~2
```

---

## Remember

**Every interruption is just a pause, not a restart.**

With proper context preservation, you can stop mid-thought and resume exactly where you left off.

---

*Last Updated: [UPDATE THIS TIMESTAMP WHEN YOU MODIFY THIS FILE]*