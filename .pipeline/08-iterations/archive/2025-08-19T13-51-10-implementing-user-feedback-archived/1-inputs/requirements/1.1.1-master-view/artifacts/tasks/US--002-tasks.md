# Task Breakdown: US--002 - Service Locations Column

**Story ID**: US--002  
**Sub-Module**: 1.1.1 Master View  
**Priority**: High  
**Implementation Order**: 2nd (Depends on accounts column)

## Value Slice Breakdown

### Value Slice 1: Static Structure
**Goal**: Get the visual layout working for service locations display  
**User Value**: Users can see what the locations column will look like  
**Timeline**: 0.5 days

#### Tasks:
1. **Create HTML structure for locations column**
   - Build locations column container within three-column layout
   - Add column header "Locations" with consistent styling
   - Create location entry template with location icon (📍)
   - Design layout for location name, address, and service info
   - Add proper spacing and alignment with other columns

2. **Implement location entry visual hierarchy**
   - Style location name as primary information
   - Design address display with appropriate font size
   - Create service status indicator layout
   - Add next service date display format
   - Include service type visual indicators

3. **Create empty state design**
   - Design "Select an account to view locations" placeholder
   - Style empty state to match overall design system
   - Ensure message is centered and informative
   - Add subtle visual cues for user guidance

#### Acceptance Criteria:
- [ ] Locations column displays with clear header
- [ ] Location entry template shows all required fields
- [ ] Location icon (📍) displays consistently
- [ ] Empty state message is clear and helpful
- [ ] Visual hierarchy matches design system
- [ ] Column aligns properly with accounts column

---

### Value Slice 2: Mock Data Population
**Goal**: Add realistic test data that responds to account selection  
**User Value**: Users can see realistic locations for different account types  
**Timeline**: 0.5 days

#### Tasks:
1. **Create comprehensive mock location dataset**
   - Generate 200 location records across all account types
   - Create 3-5 locations per account (matching account data)
   - Include diverse location names and addresses
   - Vary service statuses (active, scheduled, overdue, completed)
   - Generate realistic next service dates (past, current, future)

2. **Implement service status visualization**
   - Color-code service statuses with clear visual distinction
   - Create overdue service highlighting (red/urgent styling)
   - Display next service dates in readable format
   - Show service type indicators with appropriate icons
   - Add work order count badges for each location

3. **Link location data to account selection**
   - Filter location data by selected account ID
   - Show appropriate locations when account is selected
   - Display empty state when no account selected
   - Handle accounts with no locations gracefully
   - Clear locations when account selection changes

#### Acceptance Criteria:
- [ ] 200 mock locations created across all accounts
- [ ] 3-5 locations display per account on average
- [ ] Service statuses have clear visual distinction
- [ ] Overdue services are prominently highlighted
- [ ] Next service dates display in readable format
- [ ] Locations filter correctly by selected account
- [ ] Empty state shows when no account selected

---

### Value Slice 3: Basic Interactions
**Goal**: Add selection functionality and keyboard navigation  
**User Value**: Users can select locations and navigate easily  
**Timeline**: 1 day

#### Tasks:
1. **Implement location selection functionality**
   - Add click handlers to location entries
   - Implement visual selection state with highlighted background
   - Ensure only one location selected at a time
   - Clear previous selection when new location selected
   - Console.log selected location details

2. **Add keyboard navigation support**
   - Implement arrow key navigation (up/down) within locations
   - Add Tab key support for moving between columns
   - Enter key to select highlighted location
   - Escape key to clear location selection
   - Visual focus indicators for keyboard navigation

3. **Implement location filtering within account**
   - Add search input for filtering locations within selected account
   - Filter by location name and address
   - Show filtered results in real-time
   - Display "no matching locations" when appropriate
   - Maintain selection state during filtering

4. **Handle account selection changes**
   - Listen for account selection events from accounts column
   - Update displayed locations when account changes
   - Clear location selection when account changes
   - Show loading transition between account changes
   - Handle rapid account switching gracefully

#### Acceptance Criteria:
- [ ] Clicking a location selects it with visual feedback
- [ ] Only one location selected at a time
- [ ] Arrow keys navigate through visible locations
- [ ] Tab moves focus between columns correctly
- [ ] Location search filters results in real-time
- [ ] Location selection clears when account changes
- [ ] Console.log shows selected location data
- [ ] Keyboard navigation works smoothly

---

### Value Slice 4: Visual Feedback Enhancement
**Goal**: Polish the interaction experience and service status display  
**User Value**: Users get clear feedback about service status and timing  
**Timeline**: 1 day

#### Tasks:
1. **Enhance service status visualization**
   - Implement color-coded status indicators:
     - Active service: green indicator
     - Scheduled service: blue indicator
     - Overdue service: red indicator with urgency styling
     - No service scheduled: grey indicator
   - Add status icons alongside color coding
   - Create accessible status indicators (not color-only)

2. **Improve selection and interaction feedback**
   - Refine selected location styling consistency
   - Add smooth hover transitions
   - Implement loading states for account switching
   - Add subtle animations for status changes
   - Create focus-visible styles for accessibility

3. **Enhanced service date display**
   - Format next service dates clearly (e.g., "Next: Jan 15, 2024")
   - Highlight overdue dates with urgent styling
   - Show relative time for upcoming services (e.g., "Tomorrow", "In 3 days")
   - Add tooltips for detailed service information
   - Display service type information clearly

4. **Multi-select preparation (for future bulk operations)**
   - Add visual infrastructure for future multi-select
   - Implement Ctrl+click preparation (console.log for now)
   - Create selection count display placeholder
   - Add right-click context menu placeholder

#### Acceptance Criteria:
- [ ] Service status colors are visually distinct and accessible
- [ ] Overdue services are prominently highlighted
- [ ] Next service dates are clearly formatted
- [ ] Relative time displays work correctly
- [ ] Hover effects are smooth and consistent
- [ ] Focus indicators work for keyboard navigation
- [ ] Multi-select infrastructure is prepared
- [ ] Loading states display during account changes

---

### Value Slice 5: Integration with Master View
**Goal**: Connect locations column to complete three-column workflow  
**User Value**: Locations column works seamlessly in Master View navigation  
**Timeline**: 1 day

#### Tasks:
1. **Implement event system integration**
   - Listen for `account:selected` events from accounts column
   - Emit `location:selected` events when location is selected
   - Include proper payload structure (LocationSelectionEvent)
   - Handle `detail-view:closed` events for data refresh
   - Ensure event cleanup prevents memory leaks

2. **Integrate with work orders column**
   - Ensure location selection triggers work orders column population
   - Test that work orders column receives correct location data
   - Verify event payload contains all required location information
   - Test rapid location switching scenarios
   - Validate event timing and sequencing

3. **Performance optimization and validation**
   - Test with full 200 location dataset
   - Verify < 200ms column update when account changes
   - Confirm smooth scrolling at 60fps
   - Test with accounts having 100+ locations
   - Implement lazy loading preparation for large location sets

4. **Accessibility and usability validation**
   - Test complete keyboard workflow (account → location → work order)
   - Verify screen reader compatibility
   - Test with various service status combinations
   - Validate color accessibility for status indicators
   - Test responsive behavior on different screen sizes

5. **Edge case handling**
   - Handle accounts with no locations (empty state)
   - Manage rapid account switching (debounce/cancel)
   - Handle accounts with 100+ locations gracefully
   - Test location selection persistence during session
   - Validate service date edge cases (past dates, far future)

#### Acceptance Criteria:
- [ ] Responds correctly to `account:selected` events
- [ ] Emits `location:selected` events with proper payload
- [ ] Work orders column populates when location selected
- [ ] Performance targets met (< 200ms updates, 60fps scrolling)
- [ ] Keyboard workflow works end-to-end
- [ ] Screen reader announces location information
- [ ] Empty states display appropriate messages
- [ ] Large location lists (100+) handle gracefully
- [ ] Service status accessibility passes standards
- [ ] Integration with three-column layout is seamless

## Testing Strategy

### Unit Testing (Concept Line)
- Console.log verification for all location interactions
- Manual testing of service status display
- Visual verification of all location states
- Performance timing logs for account switching

### Integration Testing
- Test with accounts column (US--001) selection events
- Test with work orders column (US--003) event emission
- Verify event bus communication timing
- Test rapid account/location switching scenarios

### User Acceptance Testing
- 3-click rule: Verify users can reach work orders in < 3 clicks
- Service status clarity without training
- Performance with 200 locations across accounts

## Dependencies

### Blocking Dependencies:
- **US--001** (Accounts Column): Must be complete for account selection
- Event bus system must handle location events
- Mock location data must link to account data

### Integrates With:
- **US--001** (Accounts): Receives account selection events
- **US--003** (Work Orders): Provides location context
- **Future Detail View**: Location selection event consumer

## Mock Data Specifications

### Location Data Structure:
```javascript
{
  id: "loc_001",
  accountId: "acc_001",
  name: "Main Office Building",
  address: "123 Business Ave, City, ST 12345",
  serviceStatus: "scheduled", // active, scheduled, overdue, completed, none
  nextServiceDate: "2024-01-15",
  serviceType: "HVAC Maintenance",
  workOrderCount: 3,
  priority: "normal" // low, normal, high, urgent
}
```

### Service Status Distribution:
- Active: 40% (currently being serviced)
- Scheduled: 35% (future service planned)
- Overdue: 15% (past due service)
- Completed: 10% (recently completed)

## Notes

- Second column in navigation hierarchy - depends on account selection
- Must handle service timing information clearly for planning
- Performance critical for smooth navigation experience
- Service status visualization must be accessible (not color-only)
- Preparation for future bulk operations without over-engineering
- Console.log for all interactions in Concept Line implementation