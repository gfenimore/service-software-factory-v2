# Planner Agent v5.2 Update Specification - Integration Requirements
**Version**: 1.0  
**Purpose**: Add mandatory integration slices to prevent features being orphaned in test pages

## Update Instructions for Planner Agent

**Target File**: `.sdlc/01-core/A-agents/planner-agent.md`

## Section 1: Add Integration Detection Logic

**Location**: After the "Enhanced Planning Structure" section

**Add this new section**:

```markdown
## MANDATORY INTEGRATION DETECTION

For EVERY story, determine integration needs:

```python
if story.creates_new_ui_components:
    integration_required = "MANDATORY"
    integration_type = "ui_production"
elif story.modifies_existing_ui:
    integration_required = "IMPLICIT"
    integration_type = "ui_enhancement"  
elif story.backend_only:
    integration_required = "API_INTEGRATION"
    integration_type = "backend"
else:
    integration_required = "NONE"
```

Stories with `integration_required = "MANDATORY"` MUST have a final integration slice.
```

## Section 2: Update Value Slice Structure

**Location**: In the "ENHANCED PLANNING STRUCTURE" section, add after the example value slices

**Add this template**:

```markdown
### Final Value Slice: Production Integration (MANDATORY for UI stories)

**Required When**: Story creates new UI components
**Tasks**: [Integration tasks]
**User Can Now**: "Access this feature in the main application"
**Verification**: "Feature accessible via normal app navigation (NOT /test/)"
**Architecture Needed**: No (uses existing routing)

#### Standard Integration Tasks Template:
- T-XXX: Integrate component into main application route
- T-XXX: Verify feature accessible in production location  
- T-XXX: Ensure no regression in existing functionality
- T-XXX: Archive or document test page
```

## Section 3: Add Integration Task Patterns

**Location**: Create new section after "REQUIRED TASK PATTERNS"

**Add this new section**:

```markdown
## INTEGRATION TASK PATTERNS

### For New Page/Route Stories
```markdown
## Task X: Add Route to Main Navigation

**VALUE_SLICE**: [N] - Production Integration
**DELIVERABLE**: src/app/[route]/page.tsx integration
**VERIFY**: npm run dev && navigate via main app navigation
**ACCEPTANCE_CRITERIA**: Users can reach feature through normal app flow
```

### For Component Enhancement Stories
```markdown
## Task X: Replace Existing Component with Enhanced Version

**VALUE_SLICE**: [N] - Production Integration  
**DELIVERABLE**: src/app/[existing-route]/page.tsx (modified)
**VERIFY**: npm run dev && verify enhanced functionality in production location
**ACCEPTANCE_CRITERIA**: Feature available where users expect it
```

### For Modal/Overlay Stories
```markdown
## Task X: Integrate Modal Triggers into Main Application

**VALUE_SLICE**: [N] - Production Integration
**DELIVERABLE**: Integration of modal components into production pages
**VERIFY**: npm run dev && access modal from main app, not test page
**ACCEPTANCE_CRITERIA**: Modal accessible from production UI
```
```

## Section 4: Update OUTPUT VALIDATION CHECKLIST

**Location**: In the existing "OUTPUT VALIDATION CHECKLIST" section

**Add these items to the checklist**:

```markdown
- [ ] If story creates UI components, integration slice is MANDATORY
- [ ] Integration tasks specify exact production files to modify
- [ ] Verification confirms feature in main app (not /test/)
- [ ] Final slice delivers feature to actual users
```

## Section 5: Add WARNING Section

**Location**: Before "Next Agent Invocation" section

**Add this new warning section**:

```markdown
## ⚠️ CRITICAL INTEGRATION WARNING

**A feature that only works in /test/ has ZERO value to users!**

Every UI story MUST end with the feature integrated into production routes. Test pages are development artifacts, not deliverables.

If you're unsure about integration needs, err on the side of INCLUDING integration tasks. It's better to explicitly plan integration than to orphan features in test pages.
```

## Section 6: Update Example Value Slice

**Location**: In the "EXAMPLE VALUE SLICE (US-003 Navigation)" section

**Add after Value Slice 3**:

```markdown
### Value Slice 4: Production Integration

**Tasks**: T-013 through T-015
**User Can Now**: "Access navigation in the main application layout"
**Architecture Needed**: No
**Estimated Time**: 1 hour

## Task 13: Integrate Navigation into Main App Layout

**VALUE_SLICE**: 4 - Production Integration
**DELIVERABLE**: src/app/layout.tsx (modified)
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: T-001 through T-012
**VERIFY**: npm run dev && verify navigation appears in main app
**BUSINESS_RULE**: "Navigation available on all pages"
**ACCEPTANCE_CRITERIA**: "I can use navigation throughout the application"

### Details

Replace any existing navigation with the new NavigationShell component in the main application layout.

### Success Criteria

- [ ] Navigation appears in main app layout
- [ ] Accessible from all routes
- [ ] No test page needed for access
- [ ] Existing layout preserved

### 🧠 Planning Reasoning

Without this integration task, the navigation would only exist in test pages. This task ensures users can actually use the navigation feature.
```

## Verification After Update

The updated Planner should:
1. Detect when stories need integration (UI components = MANDATORY)
2. Always add integration slice for UI stories
3. Specify exact files/routes for integration
4. Include warnings about test-only features
5. Make integration tasks explicit and required

## Test the Update

After updating, test with:
```bash
@planner create-tasks US-006

# Verify it creates integration slice for service locations UI
```

The output should include a final integration slice that specifies how to integrate service locations into the main accounts view.