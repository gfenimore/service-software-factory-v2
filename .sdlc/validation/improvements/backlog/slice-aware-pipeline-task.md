# Slice-Aware Pipeline Implementation

## Task for Claude Code

### Problem
Currently we must manually copy `processor-manifest-vs2.json` to `processor-manifest.json` before running the pipeline. This is error-prone and annoying.

### Solution
Create a slice-aware wrapper that automatically uses the correct manifest file based on the slice number.

### Deliverables

#### 1. Create `scripts/run-slice.sh`
A wrapper script that:
- Accepts slice number as parameter
- Automatically finds the correct manifest
- Runs the validated pipeline with test twins
- Tracks which slice was last run

```bash
# Usage examples:
./scripts/run-slice.sh 3              # Run value slice 3
./scripts/run-slice.sh --next         # Run next slice automatically
./scripts/run-slice.sh --current      # Re-run current slice
```

#### 2. Create `scripts/extract-value-slices.js`
A script that:
- Reads us-XXX-tasks.md files
- Finds all "VALUE SLICE CHECKPOINT" sections
- Extracts slice metadata
- Creates `.sdlc/current-work/value-slices.json`

#### 3. Create `.sdlc/current-work/` directory
For tracking current work state:
- `current-slice.json` - Which slice we're on
- `value-slices.json` - All slices for current story
- `completed-slices.json` - History of completed slices

### Implementation Details

#### run-slice.sh Features:
```bash
#!/bin/bash

# Core features:
1. Find manifest: processor-manifest-vs${SLICE}.json
2. Validate manifest exists
3. Copy to processor-manifest.json (for compatibility)
4. Run validated pipeline with test twins
5. Update current-slice.json
6. Generate completion report

# Smart features:
- Detect current story from existing files
- Warn if running slices out of order
- Show slice description from value-slices.json
- Estimate time based on processor count
```

#### extract-value-slices.js Output:
```json
{
  "story": "US-004",
  "slices": [
    {
      "number": 1,
      "name": "Three-Column Layout Foundation",
      "tasks": ["T-001", "T-002", "T-003", "T-004"],
      "userValue": "See a properly structured three-column layout",
      "requiresArchitect": true,
      "estimatedMinutes": 120,
      "status": "completed"
    },
    {
      "number": 2,
      "name": "Account Cards Display",
      "tasks": ["T-005", "T-006", "T-007", "T-008"],
      "userValue": "View all accounts as cards with details",
      "requiresArchitect": false,
      "estimatedMinutes": 90,
      "status": "completed"
    },
    {
      "number": 3,
      "name": "Interactive Selection",
      "tasks": ["T-009", "T-010", "T-011"],
      "userValue": "Click on account cards to select them",
      "requiresArchitect": false,
      "estimatedMinutes": 60,
      "status": "pending"
    }
  ],
  "currentSlice": 3,
  "totalSlices": 3
}
```

### Performance Metrics to Capture

While implementing, also add timing capture:

```javascript
// In pipeline, capture for each processor:
{
  "processor": "SCAFFOLD-PROCESSOR",
  "task": "T-009",
  "startTime": "2025-01-09T10:30:00Z",
  "endTime": "2025-01-09T10:30:45Z",
  "duration": 45,
  "status": "success",
  "filesCreated": ["src/components/..."]
}
```

### After-Run Report

Generate `.sdlc/current-work/slice-X-report.md`:
```markdown
# Value Slice X Execution Report

## Summary
- Slice: X - [Name]
- Duration: X minutes Y seconds
- Processors: X/Y successful
- Tests Generated: Z files

## Performance Metrics
| Processor | Task | Duration | Status |
|-----------|------|----------|--------|
| TYPE | T-009 | 12s | ✅ |
| SCAFFOLD | T-009 | 45s | ✅ |

## Files Created
- src/components/...
- src/hooks/...

## Next Steps
- Run: ./scripts/run-slice.sh --next
- Or manually test: npm run dev
```

### Success Criteria

1. ✅ No more manual manifest copying
2. ✅ Always know which slice we're on
3. ✅ Can run next slice with single command
4. ✅ Performance data captured automatically
5. ✅ Clear reports after each run

### Testing

```bash
# Test extraction
node scripts/extract-value-slices.js .sdlc/05-backlog/A-accounts/master-view/us-004-tasks.md

# Test slice runner
./scripts/run-slice.sh 3 --dry-run

# Verify state tracking
cat .sdlc/current-work/current-slice.json
```

---

Please implement this slice-aware pipeline system to eliminate manual manifest management and add automatic progress tracking.