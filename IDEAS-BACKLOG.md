# Ideas Backlog - Future Needs & Enhancements

*Last Updated: August 27, 2025*

## Format
- **ID**: Unique identifier
- **Title**: Short descriptive name
- **Description**: What needs to be built/solved
- **Benefit Expected**: Why this matters
- **Priority**: Critical | High | Medium | Low
- **Complexity**: Simple | Moderate | Complex
- **Dependencies**: What needs to exist first
- **Target Stage**: Which factory stage this affects
- **Status**: Idea | Scoped | In Progress | Done

---

## IDEAS

### ID-001: BUSM Model Evolution Process
- **Title**: Automatic Model Change Cascading System
- **Description**: Build a process for changing the BUSM.mmd data model that automatically cascades updates through all 3 factory lines (Concept → Stage 2 → Stage 3) to production. Include change impact analysis, backward compatibility checks, and coordinated updates.
- **Benefit Expected**: Eliminates manual sync errors, ensures consistency across all factory lines, enables confident model evolution
- **Priority**: Critical
- **Complexity**: Complex
- **Dependencies**: Stable BUSM Reader, Stage 2/3 integration points
- **Target Stage**: All stages (cross-cutting)
- **Status**: Idea

### ID-002: Project File Structure Reorganization  
- **Title**: Streamline Pipeline Directory Structure
- **Description**: Reorganize the current .pipeline structure to be more intuitive and maintainable. Consolidate redundant directories, clarify naming conventions, and improve navigation.
- **Benefit Expected**: Easier development, clearer project organization, faster onboarding for new developers
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: Document current structure first
- **Target Stage**: Infrastructure
- **Status**: Idea

### ID-003: BUSM Field Extensions
- **Title**: Add Missing Business Fields to BUSM
- **Description**: Properly add legitimate business fields that were previously "contaminating" the model: dbaName, website, annualRevenue, creditLimit, paymentTerms, industry, etc. Do this through proper BUSM.mmd updates rather than ad-hoc JSON modifications.
- **Benefit Expected**: Complete business model coverage, eliminates "missing field" issues in real applications
- **Priority**: High
- **Complexity**: Simple
- **Dependencies**: ID-001 (model evolution process)
- **Target Stage**: Stage 1 (BUSM)
- **Status**: Idea

### ID-004: Enhanced Process Visibility Dashboard
- **Title**: Real-time Pipeline Monitoring Interface  
- **Description**: Build a comprehensive dashboard showing real-time status of all pipeline stages, data flow health, and process execution metrics. Expand on the current "back-door" viewing capability.
- **Benefit Expected**: Better operational visibility, faster problem detection, improved debugging
- **Priority**: Medium
- **Complexity**: Moderate
- **Dependencies**: Standardized logging across all stages
- **Target Stage**: Cross-cutting (monitoring)
- **Status**: Idea

### ID-005: BUSM Validation Engine
- **Title**: Comprehensive BUSM Model Validation
- **Description**: Build validation rules that check BUSM.mmd for completeness, consistency, relationship integrity, and business rule compliance before allowing Stage 1 generation.
- **Benefit Expected**: Prevent downstream errors, ensure model quality, catch issues early
- **Priority**: Medium
- **Complexity**: Moderate
- **Dependencies**: Complete BUSM Reader functionality
- **Target Stage**: Stage 1
- **Status**: Idea

### ID-006: Test Data Management System
- **Title**: Automated Test Data Cleanup & Management
- **Description**: Create a system for managing test data across pipeline runs - automatic cleanup, data versioning, baseline comparisons, and test isolation.
- **Benefit Expected**: Cleaner development environment, reliable testing, easier troubleshooting
- **Priority**: Medium
- **Complexity**: Simple
- **Dependencies**: Standardized output locations
- **Target Stage**: Cross-cutting (testing)
- **Status**: Idea

### ID-007: Automated Sequence Viewer Generation
- **Title**: Smart Sequence Diagram to HTML Viewer Generator
- **Description**: Build an automated system that reads sequence diagram .md files and generates enhanced HTML viewers. Uses template-driven approach with smart markdown parsing, auto-extracts metrics/artifacts/tools from structured markdown, and includes file watching for real-time updates. Eliminates manual HTML editing when sequence diagrams change.
- **Benefit Expected**: Sequence viewers always stay in sync with workflow changes, eliminates manual HTML editing (15+ manual steps currently), enables rapid iteration on sequence diagrams
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: Node.js, file watching capability, standardized sequence diagram markdown format
- **Target Stage**: Documentation/Tooling (supports all stages)
- **Status**: Prototype Built

---

## COMPLETED IDEAS
*When items are completed, move them here with completion date*

---

## NOTES

### Change Management
- Always update the **Status** field when work begins
- Add **Target Completion** dates when items move to "In Progress"
- Reference IDEAS in commit messages: `feat: implement ID-003 BUSM field extensions`

### Priority Guidelines
- **Critical**: Blocks other work or causes production issues
- **High**: Significantly improves workflow or capabilities  
- **Medium**: Nice to have, improves quality of life
- **Low**: Future enhancements, not urgent

### Next Review
Schedule regular backlog grooming sessions to:
- Reprioritize based on current needs
- Break down complex items into smaller tasks
- Archive or combine redundant ideas
- Add new items as they emerge