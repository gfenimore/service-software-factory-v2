# Code Manager Agent v1.0 - Product Requirements Document (PRD)

**Version**: 1.0  
**Created**: August 2025  
**Type**: Claude Code Sub-Agent  
**Status**: Draft  
**Owner**: AI Infrastructure Team  

## Executive Summary

The Code Manager Agent provides instant project context through file tracking and code summarization. This Claude Code sub-agent eliminates the need to manually track changes and understand complex codebases, reducing context switching and accelerating development velocity.

## Problem Statement

### Current Pain Points
- Constantly worrying about chat context window size
- Difficulty tracking what files changed between sessions
- Time spent navigating complex documentation and models
- Manual effort to understand "what's where" in large codebases
- Lost context when returning to projects after breaks

### Business Impact
- Development velocity slowed by context gathering
- Cognitive overhead managing project state
- Reduced productivity from documentation navigation
- Context loss leading to redundant work

## Solution Overview

### Core Concept: Instant Project Intelligence

A specialized Claude Code sub-agent that provides:
- **Change Tracking**: What's different since last session
- **Code Summarization**: Explain complex code without reading full files
- **Project Navigation**: Find relevant files and understand relationships

### Design Philosophy
*"Eliminate context gathering overhead - the agent knows your project state so you can focus on building."*

## Required Commands for v1.0

### Primary Commands
1. **@code-manager status** - Recent project changes summary
2. **@code-manager summary [path]** - Explain code/folder purpose  
3. **@code-manager changes [timeframe]** - Changes since yesterday/week

### Command Specifications

#### @code-manager status
**Purpose**: Provide session startup context
**Output Format**:
```
## Recent Changes
• Modified: src/components/AccountView.tsx (authentication logic)
• Added: .pipeline/tools/simple-card-mockups.html  
• Deleted: old-config.json
• Modified: 3 test files

## Active Features
• master-view-feature (branch: conceptLine)
• Last commit: fix entity scanning logic

## Key Files Modified Today
• /path/to/file:123 (brief description)
```

#### @code-manager summary [path]
**Purpose**: Explain code without reading full files
**Output Format**:
```
## Summary: src/components/navigation/
• LeftNavigation.tsx - Main nav component with routing
• NavigationContext.tsx - State management for nav
• config.ts - Navigation configuration and routes
• types.ts - TypeScript definitions
```

#### @code-manager changes [timeframe]
**Purpose**: Track changes over specific periods
**Supported Timeframes**: yesterday, week, month, [date]
**Output Format**:
```
## Changes Since Yesterday
### New Files (3)
• file1.tsx - Component for feature X
• file2.md - Documentation for Y

### Modified Files (5) 
• file3.js:45 - Updated validation logic
• file4.tsx:12 - Added error handling
```

## Technical Requirements

### Claude Sub-Agent Configuration
- **Storage**: `.claude/agents/code-manager.json`
- **Tools**: Git, Grep, Read, LS access only
- **Context**: Project-aware, no external dependencies

### Performance Requirements
- Response time <5 seconds for status command
- Handle projects up to 10,000 files
- Git history analysis up to 6 months back

### Integration Requirements
- Works with existing git workflow
- No modification of project files
- Read-only operations only
- Compatible with current .claude/settings.local.json

## User Stories & Acceptance Criteria

### Epic 1: Session Context Recovery
**As a** developer returning to a project  
**I want to** see what changed since my last session  
**So that** I can quickly understand current state

**Acceptance Criteria:**
- Shows files modified since last activity
- Categorizes changes (new, modified, deleted)  
- Provides brief description of what changed
- Completes in <5 seconds

### Epic 2: Code Understanding
**As a** developer working with complex code  
**I want to** understand what files/folders do  
**So that** I can navigate efficiently without reading everything

**Acceptance Criteria:**
- Summarizes file/folder purpose in bullet points
- Shows relationships between components
- Identifies key functions and exports
- Works with any file type (code, docs, configs)

### Epic 3: Change Tracking
**As a** developer managing multiple features  
**I want to** see changes over specific timeframes  
**So that** I can track progress and identify issues

**Acceptance Criteria:**
- Supports flexible timeframes (yesterday, week, custom dates)
- Groups changes by type and importance
- Shows line-level context for key changes
- Handles large change sets efficiently

## Success Metrics

### Quantitative Goals
1. Context gathering time: <30 seconds (vs current 5+ minutes)
2. Documentation navigation: 80% reduction in manual searching
3. Session startup: Immediate project state awareness

### Qualitative Goals
1. Eliminates "where did I leave off?" confusion
2. Reduces context window anxiety
3. Enables confident code navigation

## Technical Considerations

### Implementation Approach
- Pure Claude Code sub-agent (no bash scripts for v1.0)
- Git-based change tracking using standard commands
- File analysis using existing Claude capabilities
- Minimal configuration required

### Constraints
- Read-only operations only
- No project file modifications
- Must work with existing git workflow
- Cannot require additional dependencies

## Dependencies

### Internal
- Git repository with history
- Claude Code platform
- Project file structure

### External
- None (self-contained)

## Version 1.0 Scope

### Included Features
- Basic change tracking (status, changes commands)
- Simple code summarization (summary command)
- Git history integration
- Bullet point output format

### Excluded from v1.0
- Complex workflow orchestration
- File modification capabilities  
- Integration with external tools
- Advanced analytics or reporting

## Future Iterations (Post v1.0)

### v1.1 Potential Features
- Voice note integration for commit messages
- Project knowledge graph maintenance
- Cross-file relationship tracking

### v2.0 Vision
- Integration with factory SDLC workflows
- Automated artifact management
- Advanced project intelligence

---

*This PRD defines a minimal, focused sub-agent that solves the core problem: instant project context without complexity.*