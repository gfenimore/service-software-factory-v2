# Task Breakdown: US--001 - Accounts Column

**Story ID**: US--001  
**Sub-Module**: 1.1.1 Master View  
**Priority**: High  
**Implementation Order**: 1st (Foundation column)

## Value Slice Breakdown

### Value Slice 1: Static Structure
**Goal**: Get the visual layout working with static HTML/CSS  
**User Value**: Users can see what the accounts column will look like  
**Timeline**: 0.5 days

#### Tasks:
1. **Create HTML structure for accounts column**
   - Build basic three-column layout container
   - Add accounts column with header "Accounts"
   - Create expandable account entry template
   - Include account type indicators (C/R/I)
   - Add basic CSS classes for styling

2. **Implement visual hierarchy**
   - Style column header with consistent typography
   - Design account entry layout with expand indicator (▶)
   - Create status indicator styling (active/inactive)
   - Implement account type badges (C/R/I)
   - Add hover states for interactive elements

3. **Ensure responsive layout**
   - Test column width ratios work on different screen sizes
   - Verify text doesn't overflow in account entries
   - Check that expand indicators align properly
   - Ensure minimum column width is maintained

#### Acceptance Criteria:
- [ ] Accounts column displays with clear header
- [ ] Account entries show with expand indicators
- [ ] Account type indicators (C/R/I) are visible
- [ ] Active/inactive status is visually distinct
- [ ] Layout works on tablet+ screen sizes
- [ ] Hover states provide clear interaction feedback

---

### Value Slice 2: Mock Data Population
**Goal**: Add realistic test data to prove the layout works  
**User Value**: Users can see realistic accounts with varied data  
**Timeline**: 0.5 days

#### Tasks:
1. **Create mock account dataset**
   - Generate 50 diverse account records
   - Include mix of Commercial (C), Residential (R), Industrial (I) types
   - Vary status between active/inactive (80% active, 20% inactive)
   - Create realistic account names and IDs
   - Include location counts (3-5 average per account)

2. **Implement data rendering**
   - Populate accounts column with mock data
   - Display account name, type, and status for each entry
   - Show location count in each account entry
   - Implement proper text truncation for long names
   - Add scrollable container for 50+ accounts

3. **Add visual data indicators**
   - Color-code account types with subtle backgrounds
   - Make inactive accounts visually muted
   - Show location count with small badge/indicator
   - Ensure text contrast meets accessibility standards

#### Acceptance Criteria:
- [ ] 50 mock accounts populate the column
- [ ] All account types (C/R/I) are represented
- [ ] Active/inactive status is clearly distinguished
- [ ] Location counts are displayed for each account
- [ ] Scrolling works smoothly with 50+ accounts
- [ ] No layout breaking with various name lengths

---

### Value Slice 3: Basic Interactions
**Goal**: Add click handlers and selection functionality  
**User Value**: Users can select accounts and see visual feedback  
**Timeline**: 1 day

#### Tasks:
1. **Implement click-to-select functionality**
   - Add click handlers to account entries
   - Implement visual selection state (highlighted background)
   - Ensure only one account can be selected at a time
   - Clear previous selection when new account selected
   - Console.log selected account details

2. **Add keyboard navigation support**
   - Implement arrow key navigation (up/down)
   - Add Tab key support for accessibility
   - Enter key to select highlighted account
   - Escape key to clear selection
   - Visual focus indicators for keyboard users

3. **Implement basic search functionality**
   - Add search input above accounts list
   - Filter accounts by name as user types
   - Clear search functionality
   - Show "no results" message when appropriate
   - Maintain selection state during search

#### Acceptance Criteria:
- [ ] Clicking an account selects it with visual feedback
- [ ] Only one account selected at a time
- [ ] Arrow keys navigate through accounts
- [ ] Tab and Enter work for keyboard users
- [ ] Search filters accounts in real-time
- [ ] Console.log shows selected account data
- [ ] Clear search functionality works

---

### Value Slice 4: Visual Feedback Enhancement
**Goal**: Polish the interaction experience with better visual feedback  
**User Value**: Users get immediate, clear feedback for all interactions  
**Timeline**: 1 day

#### Tasks:
1. **Enhance selection and hover states**
   - Refine selected account styling (consistent with design system)
   - Improve hover effects with smooth transitions
   - Add loading states for future API integration points
   - Implement focus-visible styles for accessibility
   - Add subtle animations for state changes

2. **Implement advanced search features**
   - Add search result highlighting (highlight matching text)
   - Filter by account type with dropdown/checkboxes
   - Filter by status (active/inactive)
   - Show search result count
   - Clear all filters functionality

3. **Add performance feedback**
   - Show account count in column header
   - Add "loading..." placeholder for future API integration
   - Implement lazy loading preparation (scroll indicators)
   - Add keyboard shortcuts tooltip/help
   - Performance monitoring console logs

#### Acceptance Criteria:
- [ ] Smooth transitions for all state changes
- [ ] Search results highlight matching text
- [ ] Filter by type and status works correctly
- [ ] Search result count displays accurately
- [ ] Account count shows in header
- [ ] Loading states are visually consistent
- [ ] Keyboard shortcuts are discoverable

---

### Value Slice 5: Integration with Master View
**Goal**: Connect accounts column to the three-column layout and event system  
**User Value**: Accounts column works as part of the complete Master View  
**Timeline**: 1 day

#### Tasks:
1. **Implement event system integration**
   - Emit `account:selected` events when account is selected
   - Include proper payload structure (AccountSelectionEvent)
   - Set up event bus connection for Master View
   - Handle `account:created` events (add to list)
   - Handle `detail-view:closed` events (refresh data)

2. **Integrate with locations column**
   - Ensure account selection triggers location column population
   - Test that location column receives correct account data
   - Verify event payload contains all required account information
   - Test rapid account switching scenarios
   - Validate event cleanup when switching accounts

3. **Final performance and accessibility validation**
   - Test with full 50 account dataset
   - Verify < 1 second initial render time
   - Confirm < 100ms search response time
   - Validate WCAG 2.1 accessibility compliance
   - Test keyboard-only navigation workflow
   - Test screen reader compatibility

4. **Error handling and edge cases**
   - Handle empty account list scenario
   - Manage network error states (for future API)
   - Handle rapid clicking/selection changes
   - Validate all keyboard shortcuts work correctly
   - Test with accounts having very long names

#### Acceptance Criteria:
- [ ] `account:selected` events emit correctly
- [ ] Location column responds to account selection
- [ ] Event payload structure matches specification
- [ ] Performance targets met (< 1s render, < 100ms search)
- [ ] Full keyboard navigation works end-to-end
- [ ] Screen reader announces selections properly
- [ ] Empty state displays appropriate message
- [ ] Rapid selection changes handled gracefully
- [ ] Integration with three-column layout is seamless

## Testing Strategy

### Unit Testing (Concept Line)
- Console.log verification for all interactions
- Manual testing of all keyboard shortcuts
- Visual verification of all states and transitions
- Performance timing logs for render and search

### Integration Testing
- Test with locations column (US--002)
- Verify event bus communication
- Test rapid switching between accounts
- Validate data flow to work orders column

### User Acceptance Testing
- 3-click rule: Verify users can reach any work order in < 3 clicks
- Navigation intuitiveness without training
- Performance with 50 accounts meets user expectations

## Dependencies

### Blocking Dependencies:
- Three-column layout container must exist
- Event bus system must be implemented
- Mock data structure must be defined

### Integrates With:
- **US--002** (Service Locations): Provides account context
- **US--003** (Work Orders): Provides account filtering context
- **Future Detail View**: Account selection event consumer

## Notes

- This is the foundation column - all other columns depend on account selection
- Performance is critical as this gets 80% of user interactions
- Must be intuitive without training per requirements
- Simple implementation for Concept Line - no complex state management
- Console.log for all interactions in Concept Line implementation