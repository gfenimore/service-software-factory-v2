# Remove Version Numbers from Agent/Processor Files

## Task for Claude Code

### Problem
Agent and processor files have version numbers in their filenames (e.g., `planner-v2.0.md`), causing invocation mismatches. We need to remove version numbers from filenames and track versions inside the files instead.

### Solution
1. Remove version numbers from all agent/processor filenames
2. Add version information inside each file
3. Update any references to use the new names

### Files to Process

#### Agent Files Location: `.sdlc/01-core/A-agents/`
- `planner-v2.0.md` → `planner.md`
- `architect-v2.0.md` → `architect.md`
- Any other files with version patterns

#### Processor Files Location: `.sdlc/01-core/A-agents/processors/`
- `processor-selector-v2.0.md` → `processor-selector.md`
- `type-processor-v1.0.md` → `type-processor.md`
- `scaffold-processor-v1.0.md` → `scaffold-processor.md`
- Any other processor files with versions

### Script Requirements

Create `scripts/remove-version-numbers.js` that:

1. **Scans directories** for files matching pattern `*-v[0-9].[0-9].md`
2. **Extracts version** from filename
3. **Adds version header** to file content:
   ```markdown
   # [AGENT/PROCESSOR NAME]
   **Version: X.X**
   **Last Updated: YYYY-MM-DD**
   
   [Original content...]
   ```
4. **Renames file** to remove version suffix
5. **Updates references** in other files (if found)
6. **Creates backup** before changes
7. **Generates report** of all changes made

### Example Transformation

#### Before: `planner-v2.0.md`
```markdown
# PLANNER Agent Prompt v2.0 - Trust But Verify Edition

You are the PLANNER agent in a multi-agent development system...
```

#### After: `planner.md`
```markdown
# PLANNER Agent
**Version: 2.0**
**Last Updated: 2025-01-09**

You are the PLANNER agent in a multi-agent development system...
```

### Safety Features

1. **Dry run mode** - Show what would change without doing it
2. **Backup creation** - Save originals to `.backup/` directory
3. **Rollback capability** - Undo all changes if needed
4. **Conflict detection** - Warn if target filename already exists

### Usage

```bash
# Dry run (see what would change)
node scripts/remove-version-numbers.js --dry-run

# Execute with backups
node scripts/remove-version-numbers.js

# Rollback if needed
node scripts/remove-version-numbers.js --rollback
```

### Success Criteria

1. ✅ All versioned files renamed to clean names
2. ✅ Version info preserved inside files
3. ✅ No broken references
4. ✅ Backups created
5. ✅ Clear report of changes

### Additional Tasks

1. **Update invocation templates** to use new filenames
2. **Test an agent invocation** to verify it works
3. **Update any documentation** that references old names

### Report Format

Generate `version-removal-report.md`:
```markdown
# Version Number Removal Report

## Summary
- Files processed: X
- Files renamed: Y
- References updated: Z
- Backups created: .backup/TIMESTAMP/

## Changes Made

### Agent Files
- planner-v2.0.md → planner.md (Version: 2.0)
- architect-v2.0.md → architect.md (Version: 2.0)

### Processor Files
- type-processor-v1.0.md → type-processor.md (Version: 1.0)
[etc...]

## References Updated
- None found / X references in Y files

## Next Steps
1. Test agent invocations
2. Commit changes
3. Delete backups after verification
```

---

Please create this script and execute it to clean up our agent/processor filenames. This will eliminate the version mismatch friction in our workflow.