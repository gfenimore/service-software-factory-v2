# Project Tracking Index

## Overview
Consolidated tracking system for Service Software Factory project.
All project tracking, iteration management, and progress monitoring files are centralized here.

## Directory Structure

### `/config/`
Configuration and state files for tracking systems.

- **session-state.json** - Current session state and active work tracking
  - Current story, task, phase, and progress
  - Quality metrics and error budgets
  - Active branch and workflow information

### `/iterations/current/`
Active iteration and current work tracking.

- **current-slice.json** - Currently active value slice information
- **completed-slices.json** - History of completed value slices
- **value-slices.json** - All value slices for current story
- **session-summaries/** - Daily session summaries and wins
  - `2025-08-09-session-wins.md` - Session accomplishments

### `/reports/`
Progress reports and analytics.

- **slice-aware-pipeline-progress.md** - Pipeline execution progress
- **slice-3-report.md** - Specific slice completion report
- **value-slices-report.md** - Overall value slice status report

### `/metrics/`
Performance and quality metrics (future use).

## Key Files Reference

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `config/session-state.json` | Active work tracking | Per task/session |
| `iterations/current/current-slice.json` | Current slice focus | Per slice change |
| `iterations/current/value-slices.json` | Slice definitions | Per story |
| `reports/*.md` | Progress documentation | Per milestone |

## Path Updates Required

Scripts that need path updates to use this consolidated location:
- Session tracking scripts: Update from `.sdlc/07-operations/A-session-tracking/`
- Current work scripts: Update from `.sdlc/current-work/`
- Path config: Already configured to point here

## Integration Points

1. **Azure DevOps**: Maps to Iterations and Work Items
2. **Git Workflow**: Branch and commit tracking via session-state
3. **Quality Gates**: Metrics folder for build/test results
4. **Reporting**: Automated report generation to `/reports/`

## Migration Notes
- Consolidated from multiple locations on 2025-08-10
- Previous paths preserved in Git history
- All tracking now centralized under `.sdlc/10-project-tracking/`