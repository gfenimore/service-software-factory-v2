# US-009: Column State Management

## User Story

**As a** Business Owner, Operations Manager, or Admin  
**When I** interact with the Master View's three-column interface  
**I want to** have clear, predictable relationships between column selections  
**So I can** navigate efficiently and always understand the current context

## Background

The Master View's core value proposition is the cascading relationship: Account → Service Locations → Work Orders. This story ensures that these relationships work seamlessly, with clear visual indicators, smooth transitions, and intelligent state management that preserves user context while enabling efficient navigation.

## Business Rules

### Column Relationship Rules

- Column 1 selection drives Column 2 content
- Column 2 selection drives Column 3 content
- Deselecting Column 1 clears Columns 2 & 3
- Deselecting Column 2 clears Column 3 only
- Only one item can be selected per column at any time

### State Persistence Rules

- Selection state persists during same-session navigation
- Column content reloads only when necessary (parent selection changes)
- Loading states appear for data-dependent columns
- Error states don't affect other columns

### Navigation Flow Rules

- Users can change selections without losing overall context
- Rapid clicking between items doesn't create race conditions
- Invalid states (orphaned selections) are handled gracefully

## Acceptance Criteria

### Selection Indicators

- [ ] Selected items in all columns have clear visual distinction
- [ ] Selection styling is consistent across all three columns
- [ ] Only one item per column can show selected state
- [ ] Selection persists until user makes different choice

### Column Dependencies

- [ ] Selecting account in Column 1 immediately triggers Column 2 data load
- [ ] Column 2 shows loading state while service locations fetch
- [ ] Selecting location in Column 2 immediately triggers Column 3 data load
- [ ] Column 3 shows loading state while work orders fetch
- [ ] Failed loads show error state without affecting other columns

### State Clearing Logic

- [ ] Deselecting account (click selected card) clears Columns 2 & 3
- [ ] Deselecting location (click selected card) clears Column 3 only
- [ ] Selecting different account clears Column 2 selection and Column 3
- [ ] Selecting different location clears Column 3 selection only

### Loading State Management

- [ ] Column headers update during loading ("Loading locations...")
- [ ] Skeleton cards appear during data fetch
- [ ] Loading states don't block user interaction with other columns
- [ ] Error states provide retry options

### Context Preservation

- [ ] Column 1 maintains scroll position during Column 2/3 operations
- [ ] Column 2 maintains scroll position during Column 3 operations
- [ ] Search/filter states persist during selections
- [ ] Rapid selection changes don't cause UI flashing

## Gherkin Scenarios

```gherkin
Feature: Column State Management

Scenario: Basic cascade selection
  Given I am on the Master View with no selections
  When I click "ABC Company" in Column 1
  Then "ABC Company" shows selected state
  And Column 2 shows loading state
  And Column 2 loads "Service Locations (3 locations)"
  And Column 3 shows empty state "Select a location to view work orders"

Scenario: Full cascade to work orders
  Given "ABC Company" is selected with 3 locations showing
  When I click "123 Main St" location
  Then "123 Main St" shows selected state in Column 2
  And Column 3 shows loading state
  And Column 3 loads "Work Orders (8 work orders)"
  And "ABC Company" remains selected in Column 1

Scenario: Account change clears downstream
  Given "ABC Company" → "123 Main St" → "WO-2025-001" are all selected
  When I click "XYZ Corp" in Column 1
  Then "XYZ Corp" becomes selected in Column 1
  And "ABC Company" becomes unselected
  And Column 2 shows XYZ Corp's locations with no selection
  And Column 3 shows empty state
  And "123 Main St" and "WO-2025-001" are no longer selected

Scenario: Location change clears work orders only
  Given "ABC Company" → "123 Main St" → "WO-2025-001" are selected
  When I click "456 Oak Ave" location
  Then "456 Oak Ave" becomes selected in Column 2
  And "123 Main St" becomes unselected
  And Column 3 loads work orders for "456 Oak Ave"
  And "ABC Company" remains selected in Column 1

Scenario: Deselection cascades appropriately
  Given "ABC Company" → "123 Main St" → "WO-2025-001" are selected
  When I click "ABC Company" again to deselect
  Then all three columns show no selections
  And Column 2 shows empty state "Select an account to view locations"
  And Column 3 shows empty state "Select a location to view work orders"

Scenario: Error handling doesn't affect other columns
  Given "ABC Company" is selected
  When Column 2 fails to load locations due to network error
  Then Column 2 shows error state with retry button
  And "ABC Company" remains selected in Column 1
  And Column 3 shows appropriate empty state
  And I can still interact with Column 1 (select different accounts)
```

## Technical Considerations

### State Architecture

- Centralized state management for all three column selections
- Clear separation between UI state and data state
- Immutable state updates to prevent race conditions
- State validation to prevent impossible combinations

### Data Loading Strategy

- Lazy loading: only fetch data when parent is selected
- Concurrent loading where possible (don't block UI)
- Caching strategy for recently accessed data
- Request cancellation for superseded selections

### Error Handling

- Column-specific error boundaries
- Graceful degradation (partial functionality remains)
- Clear error messages with actionable next steps
- Automatic retry for transient failures

### Performance Optimization

- Debounce rapid selection changes
- Virtual scrolling for large datasets
- Memoized component rendering
- Efficient re-rendering strategies

## Out of Scope

- Cross-session state persistence (browser refresh resets state)
- Keyboard navigation between columns
- Drag-and-drop reordering within columns
- Multi-selection within columns
- Undo/redo functionality for selections
- Deep-linking to specific selection states

## Dependencies

- **US-004**: Account Cards Column (foundational)
- **US-006**: Service Locations Column (Column 1 → 2 relationship)
- **US-007**: Work Orders Column (Column 2 → 3 relationship)
- Supabase data relationships (accounts → locations → work_orders)
- Loading state UI components
- Error boundary components

## Success Metrics

- Column state changes complete within 200ms
- Zero race conditions during rapid selection changes
- Error recovery works 100% of the time
- Users understand current context at all times
- Selection relationships are intuitive to all personas

## Estimated Effort

- **Planning**: 1.5 hours
- **Implementation**: 4-6 hours
- **Testing**: 3 hours
- **Total**: 8.5-10.5 hours
