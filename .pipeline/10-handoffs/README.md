# Handoffs Directory

## Purpose
This directory manages knowledge transfer between development sessions, ensuring continuity and preventing loss of context.

## Directory Structure

```
10-handoffs/
├── active/          # Current/ongoing handoffs
├── completed/       # Archived handoffs from past sessions
└── templates/       # Handoff document templates
    ├── HANDOFF-TEMPLATE.md       # Full detailed template
    └── HANDOFF-QUICK-TEMPLATE.md # Quick template for short sessions
```

## When to Create a Handoff

### Always Create a Handoff When:
- Switching between major tasks or features
- Ending a work session with incomplete work
- Making significant architectural decisions
- Encountering blockers that need documentation
- Completing a sprint or milestone

### Use Quick Template When:
- Session was less than 2 hours
- Only minor changes were made
- Work is straightforward to resume
- No complex decisions were made

### Use Full Template When:
- Major feature work or refactoring
- Multiple systems were modified
- Important decisions were made
- Complex issues were encountered
- Handing off to another developer

## Handoff Workflow

1. **Start of Session**:
   - Check `/active/` for any pending handoffs
   - Review the most recent `/completed/` handoff
   - Move active handoff to completed if work is done

2. **During Session**:
   - Keep notes of important decisions
   - Document any blockers or issues
   - Track what's being modified

3. **End of Session**:
   - Copy appropriate template from `/templates/`
   - Fill out all relevant sections
   - Save to `/active/` with naming convention: `HANDOFF-YYYY-MM-DD-[description].md`
   - Commit the handoff document

4. **When Work Completes**:
   - Move handoff from `/active/` to `/completed/`
   - Add a final status note if needed

## Naming Convention

```
HANDOFF-YYYY-MM-DD-[brief-description].md
```

Examples:
- `HANDOFF-2025-08-25-migration-complete.md`
- `HANDOFF-2025-08-25-viewforge-refactor.md`
- `HANDOFF-2025-08-25-database-setup.md`

## Best Practices

1. **Be Specific**: Include file paths, command examples, and specific line numbers
2. **Highlight Blockers**: Clearly mark what's preventing progress
3. **Document Decisions**: Explain why choices were made
4. **Include Commands**: Add exact commands needed to resume work
5. **Test Instructions**: Provide commands to verify the current state
6. **Time Estimates**: Give realistic estimates for remaining work

## Quick Reference

### Creating a New Handoff
```bash
# Copy template
cp .pipeline/10-handoffs/templates/HANDOFF-TEMPLATE.md \
   .pipeline/10-handoffs/active/HANDOFF-$(date +%Y-%m-%d)-[description].md

# Edit the handoff
code .pipeline/10-handoffs/active/HANDOFF-$(date +%Y-%m-%d)-[description].md
```

### Completing a Handoff
```bash
# Move to completed
mv .pipeline/10-handoffs/active/HANDOFF-*.md \
   .pipeline/10-handoffs/completed/

# Commit
git add .pipeline/10-handoffs/
git commit -m "Complete handoff: [description]"
```

## Handoff Quality Checklist

Before finalizing a handoff, ensure:
- [ ] Current git status is documented
- [ ] All changed files are listed
- [ ] Next steps are clear and actionable
- [ ] Any temporary fixes are highlighted
- [ ] Testing status is noted
- [ ] Required commands are included
- [ ] Time estimates are realistic

---
*Effective handoffs ensure smooth continuity and prevent knowledge loss*