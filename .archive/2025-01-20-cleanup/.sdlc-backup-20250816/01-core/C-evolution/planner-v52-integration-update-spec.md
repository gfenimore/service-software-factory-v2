# Planner v5.2 Integration Update Specification

**Version**: 5.2  
**Date**: August 2025  
**Priority**: MISSION CRITICAL  
**Purpose**: Ensure all UI features reach production, not just test pages

## Executive Summary

This specification updates the PLANNER agent to make integration tasks MANDATORY for all UI stories. This prevents the critical gap where features are "done" but not accessible to users.

## The Problem We're Solving

Current State:

- Features built in isolation (test pages)
- No automatic path to production
- Users can't access "completed" features
- Example: US-005 modal works but isn't in main app

Required State:

- Every UI story includes integration tasks
- Features automatically reach production routes
- Test pages are stepping stones, not destinations
- Clear verification that users can access features

## Required Changes to Planner Agent

### 1. Story Type Detection Logic

Add to Planner's analysis phase:

```markdown
## STORY TYPE DETECTION

Analyze the user story to determine integration needs:

1. **UI Component Story** (requires_integration: MANDATORY)
   - Creates new components
   - Modifies existing UI
   - Adds user-facing features
   - Examples: modals, forms, views, cards

2. **Backend Story** (requires_integration: OPTIONAL)
   - API endpoints
   - Database changes
   - Background processes
   - Integration via API testing

3. **Configuration Story** (requires_integration: MINIMAL)
   - Settings changes
   - Environment setup
   - Documentation updates
```

### 2. Mandatory Integration Slice

For UI stories, ALWAYS add as final slice:

```markdown
### Value Slice [N]: Production Integration

**Tasks**: T-[X] through T-[Y]
**User Can Now**: "Access [feature] through the main application"
**Architecture Needed**: No (uses existing routing)
**Estimated Time**: 1-2 hours

#### Standard Integration Tasks:

**T-[X]: Integrate Component into Main Application**

- Replace/enhance existing component in production route
- Update imports in main app pages
- Ensure props and state management connected
- Verify: Feature accessible via normal navigation

**T-[X+1]: Verify No Regression**

- Test existing functionality still works
- Ensure performance not degraded
- Check accessibility preserved
- Verify: All original features operational

**T-[X+2]: Update Navigation/Routing**

- Add to navigation menus if needed
- Update route configurations
- Ensure deep linking works
- Verify: Users can discover and access feature

**T-[X+3]: Clean Up Test Artifacts**

- Archive or document test pages
- Remove temporary code
- Update documentation
- Verify: No confusion between test and production
```

### 3. Integration Task Templates

Provide specific templates based on component type:

```markdown
## INTEGRATION TEMPLATES

### For Modal/Dialog Components:

T-[X]: Wire Modal into Parent Component

- Import [ModalComponent] in [ParentComponent]
- Add modal state management
- Connect trigger elements
- Integrate with existing data flow
  VERIFY: Modal opens from production UI

### For New Views/Pages:

T-[X]: Add Route to Application

- Create route in app router
- Add to navigation menu
- Set up route guards if needed
- Configure deep linking
  VERIFY: Page accessible via URL and navigation

### For Enhanced Components:

T-[X]: Replace Legacy Component

- Locate uses of [OldComponent]
- Replace with [NewComponent]
- Update prop mappings
- Maintain backward compatibility
  VERIFY: New component visible in all locations

### For Data Display Components:

T-[X]: Connect to Production Data

- Replace mock data with real queries
- Connect to production state management
- Handle loading and error states
- Implement data refresh logic
  VERIFY: Real data displays correctly
```

### 4. Validation Warnings

Add these warnings to Planner output:

```markdown
⚠️ INTEGRATION WARNINGS:

❌ FATAL: No integration tasks detected for UI story

- This story will not reach users
- Features will be stranded in test pages
- Add integration slice immediately

⚠️ WARNING: Test page is final deliverable

- Test pages are for development only
- Users cannot access /test/\* routes
- Must integrate into main application

✅ GOOD: Integration tasks present

- T-[X]: Integrates into [specific route]
- Users will access via [navigation path]
- Feature will be in production
```

### 5. Updated Validation Checklist

Add to Planner's output validation:

```markdown
## INTEGRATION VALIDATION CHECKLIST

For UI Stories:

- [x] Integration slice is present
- [x] Integration is FINAL slice (happens last)
- [x] Specifies exact files/routes to modify
- [x] Includes regression testing task
- [x] Has clear VERIFY statements
- [x] No test pages as final deliverable

Red Flags to Catch:

- [ ] Story ends with test page creation
- [ ] No mention of main app integration
- [ ] Missing production route specification
- [ ] No regression testing tasks
```

### 6. Example Integration Slice for US-006

Show how US-006 (Service Locations Column) should look:

```markdown
### Value Slice 4: Production Integration

**Tasks**: T-015 through T-017
**User Can Now**: "See service locations in the main accounts view"
**Architecture Needed**: No
**Estimated Time**: 1.5 hours

## Task 15: Integrate Service Locations into Main Accounts Page

**DELIVERABLE**: src/app/accounts/page.tsx (modified)
**VERIFY**: npm run dev && navigate to /accounts, select account, see locations
**BUSINESS_RULE**: Locations visible in production accounts view
**ACCEPTANCE_CRITERIA**: Service locations appear in Column 2 when account selected

### Details

Replace the placeholder Column 2 with ServiceLocationsColumn component. Connect to account selection state from Column 1.

### Success Criteria

- [ ] Column 2 shows locations in /accounts route
- [ ] Not just in test page
- [ ] Integrates with existing account selection
- [ ] Production data source connected

## Task 16: Verify Three-Column Integration

**DELIVERABLE**: Full Master View working in production
**VERIFY**: All three columns interact correctly in /accounts
**ACCEPTANCE_CRITERIA**: Complete account → location → work order flow

## Task 17: Archive Test Implementation

**DELIVERABLE**: Test page moved to archive or documented
**VERIFY**: No confusion about which is production version
**ACCEPTANCE_CRITERIA**: Clear separation of test vs production
```

## Implementation Priority

1. **IMMEDIATE**: Update Planner agent with these requirements
2. **TEST**: Run on US-006 to verify integration tasks created
3. **RETROACTIVE**: Create integration tasks for US-005
4. **ONGOING**: Monitor all future stories for compliance

## Success Metrics

- 100% of UI stories include integration tasks
- 0 features stranded in test pages
- All features accessible via production routes
- Clear path from development to production

## Critical Rule

**A STORY IS NOT DONE UNTIL USERS CAN ACCESS THE FEATURE IN PRODUCTION**

Test pages prove it works. Production integration delivers value.

---

_This specification ensures we ship features, not demos._
