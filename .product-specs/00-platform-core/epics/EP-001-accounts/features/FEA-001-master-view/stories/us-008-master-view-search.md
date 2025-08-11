# US-008: Master View Search and Filtering

## User Story

**As a** Business Owner, Operations Manager, or Admin  
**When I** need to find specific accounts, locations, or work orders quickly  
**I want to** search and filter across the Master View  
**So I can** locate information in seconds rather than scrolling through long lists

## Background

The Master View's power comes from showing relationships at-a-glance, but with hundreds of accounts and thousands of work orders, users need efficient ways to narrow their focus. This story implements search and filtering capabilities that work across all three columns while preserving the Master View's core selection-driven behavior.

## Business Rules

- Search applies to currently visible column data
- Filters persist until explicitly cleared or changed
- Search in Column 1 does not affect Columns 2 & 3 content (only Column 1 display)
- Column 2 & 3 searches filter their respective content based on current selection
- Clear search returns to unfiltered view
- Filter state is maintained during session but not persisted between sessions

## Acceptance Criteria

### Column 1 Account Search

- [ ] Search box appears above account cards with placeholder "Search accounts..."
- [ ] Real-time search as user types (debounced 300ms)
- [ ] Searches across: Company name, contact name, city, state
- [ ] Case-insensitive matching
- [ ] Partial word matching supported
- [ ] Search results maintain card selection behavior
- [ ] Header updates to show "Accounts (X of Y)" when filtered

### Quick Filter Buttons

- [ ] Row of quick filter buttons below search box:
  - "Active Only" (default)
  - "All Accounts"
  - "Recently Serviced" (work orders in last 30 days)
  - "Past Due" (scheduled work orders overdue)
- [ ] Only one quick filter active at a time
- [ ] Quick filters combine with search text
- [ ] Active filter button shows selected state

### Search State Management

- [ ] "Clear All" button appears when search or filters are active
- [ ] Clear button resets to "Active Only" + empty search
- [ ] Search state survives column selections
- [ ] Column 2 & 3 are not affected by Column 1 search/filtering

### Performance Requirements

- [ ] Search results appear within 100ms of typing stop
- [ ] Handles 1000+ accounts without performance degradation
- [ ] No API calls during typing (client-side search)
- [ ] Smooth animations for filter transitions

### Visual Indicators

- [ ] Clear visual distinction between filtered and unfiltered views
- [ ] Search result count always visible
- [ ] Active filters clearly indicated
- [ ] Loading states during filter application

## Gherkin Scenarios

```gherkin
Feature: Master View Search and Filtering

Scenario: Search accounts by company name
  Given I have 50 accounts loaded in Column 1
  When I type "ABC" in the account search box
  Then I see only accounts with "ABC" in company name
  And header shows "Accounts (3 of 50)"
  And search results are immediately selectable

Scenario: Quick filter for recently serviced
  Given I have accounts with various service dates
  When I click "Recently Serviced" quick filter
  Then I see only accounts with work orders in last 30 days
  And "Recently Serviced" button shows active state
  And header updates with filtered count

Scenario: Combine search and filter
  Given "Recently Serviced" filter is active showing 20 accounts
  When I type "Main St" in the search box
  Then I see only recently serviced accounts with "Main St" in their data
  And both search text and filter remain active
  And "Clear All" button is visible

Scenario: Clear all filters
  Given I have search text "ABC" and "Past Due" filter active
  When I click "Clear All" button
  Then search box is empty
  And "Active Only" filter is selected
  And I see all active accounts
  And "Clear All" button disappears

Scenario: Search persistence during selection
  Given I searched for "ABC" showing 3 results
  When I select one of the filtered accounts
  Then Column 2 updates with that account's locations
  And search filter remains active in Column 1
  And I can still see the other 2 search results
```

## Technical Considerations

### Client-Side Search Implementation

- Use JavaScript filter() on loaded account data
- Implement debounced search to avoid excessive filtering
- Search across multiple fields with weighted relevance
- Maintain original data array alongside filtered view

### Search Algorithm

- Fuzzy matching for typos and partial words
- Search priorities: Exact match > Starts with > Contains
- Multi-field search with OR logic between fields
- Highlight matching text in results (future enhancement)

### State Management

- Maintain search query in component state
- Track active filter selection
- Preserve search state during column interactions
- Clear search when explicitly requested only

### Performance Optimization

- Pre-index searchable fields for faster filtering
- Virtualized scrolling for filtered large result sets
- Debounce search input to prevent excessive re-renders
- Memoize filter computations

## Out of Scope

- Search within Columns 2 & 3 (future enhancement)
- Advanced search operators (AND, OR, NOT)
- Saved search queries
- Search across multiple accounts simultaneously
- Server-side search (initial implementation is client-side only)
- Search result export functionality

## Dependencies

- **US-004**: Account Cards Column (must be completed)
- **US-006**: Service Locations Column (for filter logic dependencies)
- **US-007**: Work Orders Column (for "Recently Serviced" filter)
- Loaded account data in Column 1
- Work order date information for time-based filters

## Success Metrics

- Users can find target account within 5 seconds
- Search results appear within 100ms of input stop
- 90% of searches use 3 or fewer characters
- Quick filters reduce visible accounts by 70%+ when active
- Zero performance degradation with 1000+ accounts

## Estimated Effort

- **Planning**: 1 hour
- **Implementation**: 5-6 hours
- **Testing**: 2 hours
- **Total**: 8-9 hours
