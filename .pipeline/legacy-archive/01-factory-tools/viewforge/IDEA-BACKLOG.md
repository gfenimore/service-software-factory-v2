# ViewForge Idea Backlog
*Ideas captured from retrospectives and development sessions*

## Quick Wins 🏃
*< 2 hours implementation time, low risk*

| ID | Idea | Source | Priority | Status | Notes |
|----|------|--------|----------|--------|-------|
| QW-001 | Add keyboard shortcuts for common actions | Initial planning | 3 | Open | Ctrl+S to save config, Ctrl+E to export |
| QW-002 | Auto-save configuration every 5 minutes | Initial planning | 4 | Open | Prevent data loss |
| QW-003 | Copy field configuration between entities | Initial planning | 3 | Open | Speed up configuration |

## Enhancements 🔧
*2-8 hours implementation time, improve existing features*

| ID | Idea | Source | Priority | Status | Notes |
|----|------|--------|----------|--------|-------|
| EN-001 | Field search/filter in selector | ITER-2025-08-21-008 | 4 | Open | Too many fields to scroll through |
| EN-002 | Bulk field operations (select all, deselect all) | Initial planning | 3 | Open | Speed up configuration |
| EN-003 | Field preview on hover | Initial planning | 2 | Open | See field details without selecting |
| EN-004 | Import/export configuration templates | Initial planning | 3 | Open | Reuse common configs |
| EN-005 | Undo/redo for configuration changes | Initial planning | 4 | Open | Recover from mistakes |

## New Features 🚀
*> 8 hours implementation time, expand capabilities*

| ID | Idea | Source | Priority | Status | Notes |
|----|------|--------|----------|--------|-------|
| NF-001 | Relationship field support | ITER-2025-08-21-008 | 5 | Critical | serviceLocation.account.accountName |
| NF-002 | Layout Configuration module | Requirements | 5 | Planned | Week 3 MVP |
| NF-003 | Preview capability | Requirements | 4 | Planned | Week 2 |
| NF-004 | IMS integration | Requirements | 4 | Planned | Week 2 |
| NF-005 | Rules integration | Claude review | 3 | Future | Conditional visibility/editability |
| NF-006 | Multi-entity configuration | Initial planning | 3 | Future | Configure multiple entities at once |
| NF-007 | Configuration versioning | Initial planning | 3 | Future | Track config changes over time |

## Technical Debt 💳
*Refactoring and cleanup needed*

| ID | Debt | Source | Priority | Status | Impact |
|----|------|--------|----------|--------|--------|
| TD-001 | Separate field config from layout config | Architecture review | 4 | Open | Better modularity |
| TD-002 | Extract BUSM integration to module | Initial planning | 3 | Open | Cleaner architecture |
| TD-003 | Add unit tests for config validation | Initial planning | 3 | Open | Prevent bugs |
| TD-004 | Refactor state management | Initial planning | 2 | Open | Easier to maintain |

## Process Improvements 📋
*Workflow and methodology enhancements*

| ID | Improvement | Source | Priority | Status | Notes |
|----|-------------|--------|----------|--------|-------|
| PI-001 | Automated testing after config changes | Initial planning | 3 | Open | Catch issues early |
| PI-002 | Config validation before export | Initial planning | 4 | Open | Prevent invalid configs |
| PI-003 | Documentation generation from configs | Initial planning | 2 | Open | Keep docs in sync |
| PI-004 | Performance metrics tracking | Initial planning | 2 | Open | Monitor config generation speed |

## Bug Fixes 🐛
*Known issues to resolve*

| ID | Bug | Source | Priority | Status | Notes |
|----|-----|--------|----------|--------|-------|
| BG-001 | Field names don't match BUSM schema | ITER-2025-08-21-008 | 5 | Critical | Breaking config compatibility |
| BG-002 | No related record field selection | ITER-2025-08-21-008 | 5 | Critical | Can't configure relationships |
| BG-003 | Configured fields not showing in output | ITER-2025-08-21-008 | 5 | Critical | Config not being applied |

## Ideas Under Consideration 🤔
*Need more analysis before committing*

| Idea | Questions to Answer | Next Step |
|------|-------------------|-----------|
| GraphQL schema integration | How to handle schema changes? | Research Apollo tooling |
| AI-assisted field selection | What patterns to recognize? | Analyze common configs |
| Mobile-responsive configurator | Is this needed for internal tool? | Survey team needs |
| Collaborative configuration | Multiple users editing same config? | Define use cases |
| Configuration marketplace | Share configs between projects? | Assess security implications |

## Completed Ideas ✅
*Implemented and validated*

| ID | Idea | Implemented In | Notes |
|----|------|----------------|-------|
| - | Initial ViewForge concept | ITER-2025-08-21-007 | Basic configurator working |

---

## Backlog Management Rules

### Priority Levels
- **5 - Critical**: Blocking work, implement immediately
- **4 - High**: Important for MVP, implement soon
- **3 - Medium**: Nice to have, implement when possible
- **2 - Low**: Future enhancement
- **1 - Someday**: Interesting but not planned

### Status Values
- **Critical**: Must fix immediately
- **Planned**: Scheduled for specific iteration
- **Open**: Available to work on
- **In Progress**: Currently being implemented
- **Completed**: Done and validated
- **Deferred**: Postponed indefinitely
- **Rejected**: Decided not to implement

### Review Schedule
- **Weekly**: During iteration planning (Mondays)
- **Post-Retrospective**: After each iteration (Fridays)
- **Monthly**: Full backlog grooming

### Adding New Ideas
1. Capture during retrospectives or development
2. Assign category and initial priority
3. Add source reference (iteration, retrospective, review)
4. Review in next planning session
5. Update status based on decision

---

*Last Updated: 2025-01-22*
*Total Items: 29*
*Critical Items: 3*