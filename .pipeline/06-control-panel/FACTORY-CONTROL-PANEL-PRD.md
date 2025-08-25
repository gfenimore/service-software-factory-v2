# Factory Control Panel - Product Requirements Document
*The Visual Command Center for the Service Software Factory*

## 1. Executive Summary

The Factory Control Panel is a web-based UI that provides a visual interface to the entire Concept Line production pipeline. It replaces command-line interactions with visual controls while maintaining complete traceability from concept to production. Users can pick up any iteration, make changes, and push to production with full audit trails.

## 2. Problem Statement

### Current State (Pain Points)
- **CLI Complexity**: Non-technical users struggle with command-line tools
- **Disconnected Tools**: Each stage has separate interfaces
- **No Visual Feedback**: Can't see what's being built until after generation
- **Lost Context**: Hard to pick up where previous work left off
- **No Traceability**: Changes aren't tracked through the pipeline
- **Manual Coordination**: User must manually run each stage

### Future State (Solution)
- **Visual Interface**: Click-based interaction, no CLI needed
- **Unified Control**: Single panel controls entire pipeline
- **Real-time Preview**: See what you're building as you build it
- **Iteration Continuity**: Pick up exactly where you left off
- **Complete Traceability**: Every change tracked from concept to production
- **One-Button Deploy**: "BUILD IT" executes entire pipeline

## 3. What It Replaces/Integrates

### Replaces These Interactions:
```
BEFORE (Current CLI-based):
- npm run module:build (command line)
- npm run ast:test (command line)  
- npm run concept:generate (command line)
- Manual YAML editing
- Terminal-based prompts
- File system navigation

AFTER (Control Panel):
- Visual entity selector
- Drag-and-drop field picker
- Click-to-generate buttons
- Visual progress tracking
- Preview panels
- One-click deployment
```

### Integrates With (NOT Replaces):
- **BUSM Reader** - Still the source of truth
- **Module System** - Still creates module configs
- **ViewForge** - Still transforms views
- **AST Generator** - Still generates code
- **Gap Logger** - Still discovers gaps
- **Concept Generator** - Still creates wireframes

The Control Panel is a **UI LAYER** on top of existing tools, not a replacement!

## 4. Core Features

### 4.1 Project Dashboard
```
┌────────────────────────────────────────────────────────────────┐
│ SERVICE SOFTWARE FACTORY - CONTROL PANEL                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Current Project: Customer Service System v2.1.3               │
│ Last Modified: 2025-08-23 14:30 by Garry                     │
│ Status: Concept Complete, Prototype In Progress               │
│                                                                │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│ │ CONCEPT     │ PROTOTYPE   │ PRODUCTION  │ DEPLOYED    │  │
│ │ ████████    │ ████░░░░    │ ░░░░░░░░    │ ░░░░░░░░    │  │
│ │ 100%        │ 40%         │ 0%          │ 0%          │  │
│ └─────────────┴─────────────┴─────────────┴─────────────┘  │
│                                                                │
│ [▶ Continue Where I Left Off]  [📊 View History]             │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Module Builder Interface
```
┌────────────────────────────────────────────────────────────────┐
│ MODULE BUILDER                                    [Iteration 7]│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────────────┐  ┌────────────────────────────────────┐ │
│ │ BUSM Entities    │  │ Selected: Account (Phase 1)        │ │
│ │                  │  │                                    │ │
│ │ ☑ Account (27)   │  │ Fields (14/27 selected):          │ │
│ │ ☐ Contact (12)   │  │ ☑ id                   [required] │ │
│ │ ☐ Service (8)    │  │ ☑ accountName          [required] │ │
│ │ ☐ User (7)       │  │ ☑ accountType          [enum]     │ │
│ │ ☐ Territory (4)  │  │ ☑ status               [enum]     │ │
│ └──────────────────┘  │ ☑ email                           │ │
│                        │ ☐ creditLimit          [Phase 2]  │ │
│ Phase: [1 Essential ▼]│ ☐ taxId                [Phase 2]  │ │
│                        └────────────────────────────────────┘ │
│                                                                │
│ Views to Generate:                                            │
│ ☑ List View  ☑ Detail View  ☑ Form  ☐ Table  ☐ Dashboard   │
│                                                                │
│ [Preview] [Save Iteration] [BUILD IT →]                       │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 Pipeline Monitor
```
┌────────────────────────────────────────────────────────────────┐
│ PIPELINE STATUS - Building Account Module                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Stage 1: Requirements    ✅ Complete (2.3s)                   │
│ Stage 2: Configuration   ✅ Complete (0.8s)                   │
│ Stage 3: ViewForge       ⚡ In Progress...                    │
│ Stage 4: AST Generation  ⏸️ Waiting                           │
│ Stage 5: Validation      ⏸️ Waiting                           │
│ Stage 6: Deployment      ⏸️ Waiting                           │
│                                                                │
│ Gaps Discovered: 2                                            │
│ ⚠️ Missing validation rule for email                          │
│ ⚠️ Enum 'AccountStatus' missing 'On Hold' value              │
│                                                                │
│ [View Details] [Fix Gaps] [Continue Anyway]                   │
└────────────────────────────────────────────────────────────────┘
```

### 4.4 Traceability View
```
┌────────────────────────────────────────────────────────────────┐
│ BUILD HISTORY & TRACEABILITY                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Build #7 (Current)                                            │
│ ├─ Date: 2025-08-23 14:45:00                                 │
│ ├─ User: Garry                                               │
│ ├─ Changes: Added phone field, removed fax field             │
│ └─ Status: In Progress                                       │
│                                                                │
│ Build #6                                                      │
│ ├─ Date: 2025-08-23 14:30:00                                 │
│ ├─ User: Garry                                               │
│ ├─ Changes: Changed AccountType enum values                  │
│ └─ Status: Deployed to Dev                                   │
│                                                                │
│ [Compare Builds] [Rollback] [View Full History]              │
└────────────────────────────────────────────────────────────────┘
```

## 5. Key Workflows

### 5.1 Continue Where You Left Off
```
1. Open Control Panel
2. System shows: "Last worked on: Account Module, Iteration 7, 80% complete"
3. Click "Continue Where I Left Off"
4. Loads EXACT state from last session
5. Shows what's done, what's pending
6. User picks up seamlessly
```

### 5.2 The "BUILD IT" Button
```
When pressed:
1. Saves current iteration (automatic versioning)
2. Executes full pipeline:
   - Stage 1: Generate module config
   - Stage 2: Process configuration  
   - Stage 3: Transform with ViewForge
   - Stage 4: Generate AST components
   - Stage 5: Validate TypeScript
   - Stage 6: Deploy to environment
3. Shows real-time progress
4. Highlights any gaps discovered
5. Creates traceable build record
```

### 5.3 Iteration Management
```javascript
// Every change creates a new iteration
{
  iteration: 7,
  timestamp: "2025-08-23T14:45:00Z",
  user: "Garry",
  changes: [
    { type: "field_added", entity: "Account", field: "phone" },
    { type: "field_removed", entity: "Account", field: "fax" }
  ],
  parent_iteration: 6,
  build_status: "in_progress",
  artifacts: {
    module_yaml: "account-module-iter7.yaml",
    components: ["AccountList.tsx", "AccountForm.tsx"],
    gaps: ["email_validation_missing"]
  }
}
```

## 6. Technical Architecture

### 6.1 Frontend
- **Technology**: React (eating our own dog food!)
- **State Management**: Local state + IndexedDB for persistence
- **UI Framework**: Our generated components (meta!)

### 6.2 Backend
- **API Layer**: Node.js Express wrapping existing tools
- **Execution**: Spawns existing CLI tools as child processes
- **Storage**: File system (YAMLs) + SQLite for iteration tracking

### 6.3 Integration Points
```
Control Panel UI
     ↓ HTTP/REST
API Gateway
     ↓ Child Process
Existing Tools:
- BUSM Reader
- Module Builder  
- ViewForge Transformer
- AST Generator
- Gap Logger
```

## 7. Traceability Requirements

### 7.1 What Gets Tracked
- **Every Iteration**: Who, what, when, why
- **Every Build**: Full configuration snapshot
- **Every Deployment**: What was deployed, where, when
- **Every Gap**: When discovered, how resolved
- **Every Decision**: Field selections, phase choices

### 7.2 Traceability Chain
```
Business Requirement (JIRA-123)
    ↓
Iteration 1 (Initial concept)
    ↓
Iteration 2-6 (Refinements)
    ↓
Iteration 7 (Current)
    ↓
Build #7 (Generated artifacts)
    ↓
Deployment #3 (To Dev environment)
    ↓
Production Release v2.1.3
```

### 7.3 Audit Trail
Every action logged with:
- Timestamp
- User
- Action type
- Before state
- After state
- Reason/comment

## 8. User Experience Principles

### 8.1 No CLI Required
- Everything clickable
- Visual feedback
- Drag-and-drop where appropriate
- Keyboard shortcuts for power users

### 8.2 Progressive Disclosure
- Simple mode: Just pick entity and click BUILD
- Advanced mode: Full field customization
- Expert mode: Direct YAML editing

### 8.3 Continuous Saving
- Every change auto-saved
- Can always pick up where left off
- No lost work

## 9. Success Metrics

### Must Have (MVP)
- ✅ Visual entity selection from BUSM
- ✅ Phase-based field filtering  
- ✅ One-click pipeline execution
- ✅ Iteration tracking
- ✅ Basic traceability

### Should Have (v2)
- ✅ Real-time preview
- ✅ Gap fixing interface
- ✅ Deployment management
- ✅ Rollback capability

### Nice to Have (v3)
- ✅ Collaborative editing
- ✅ AI suggestions
- ✅ Performance analytics
- ✅ Custom pipeline stages

## 10. How It Fits Into What We Already Have

### Preserves Everything We Built:
- BUSM Reader still provides entity data
- Module System still generates configs
- ViewForge still transforms views
- AST Generator still creates components
- Gap Logger still finds issues

### Adds What Was Missing:
- Visual interface for non-technical users
- Iteration continuity
- Complete traceability
- One-button deployment
- Unified experience

## 11. Implementation Phases

### Phase 1: Core UI (Week 1)
- Basic web interface
- Entity selector
- Field picker
- Build button

### Phase 2: Pipeline Integration (Week 2)
- Connect to existing tools
- Real-time progress
- Gap display

### Phase 3: Traceability (Week 3)
- Iteration tracking
- Build history
- Audit trails

### Phase 4: Advanced Features (Week 4)
- Preview
- Rollback
- Deployment

## 12. The Magic

When Garry clicks "BUILD IT":
1. Current iteration saved with full context
2. Complete pipeline executes automatically
3. Every step traced and logged
4. Gaps discovered and reported
5. Components generated with perfect syntax
6. Deployed to chosen environment
7. Full audit trail created

**From business need to deployed software in ONE CLICK!**

---

*Factory Control Panel PRD v1.0*
*Status: Ready for Review*
*Priority: CRITICAL - Unlocks factory for non-technical users*

## Remember

This doesn't replace our tools - it makes them accessible! The Control Panel is the UI layer that turns our powerful CLI tools into a visual, traceable, production-ready system.