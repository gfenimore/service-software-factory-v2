# US-007: Work Orders Column (Column 3)

## User Story

**As a** Business Owner, Operations Manager, or Admin  
**When I** select a service location in Column 2  
**I want to** see all work orders for that location displayed in Column 3  
**So I can** quickly access recent activity and work order details for customer support and operational oversight

## Background

The Master View's third column completes the account → location → work orders hierarchy. This column shows all work orders associated with the selected service location, providing immediate access to service history, current status, and recent activity. This is the key to answering "What's happening at this location?" in seconds rather than minutes.

## Business Rules

- Column 3 only populates when a service location is selected in Column 2
- Shows ALL work orders for the selected location (all statuses)
- Most recent work orders appear first
- One work order can be selected at a time for detail access
- No work order is pre-selected when location changes
- Column 3 clears when no location is selected

## Acceptance Criteria

### Display Requirements

- [ ] Column 3 shows "Work Orders" header with count "(X work orders)"
- [ ] Each work order displays as a card showing:
  - Work order number (clickable)
  - Service type/description
  - Status with color coding (Scheduled, In Progress, Completed, Cancelled)
  - Scheduled/completed date
  - Technician assigned (if applicable)
- [ ] Cards are vertically stacked with consistent spacing
- [ ] Column scrolls independently when content exceeds height
- [ ] Empty state shows "No work orders" when location has none

### Status Indicators

- [ ] **Scheduled**: Blue indicator, shows scheduled date
- [ ] **In Progress**: Orange indicator, shows start time
- [ ] **Completed**: Green indicator, shows completion date
- [ ] **Cancelled**: Gray indicator, shows cancellation date
- [ ] **Overdue**: Red indicator for scheduled orders past due date

### Selection and Interaction

- [ ] Work order cards are clickable for selection
- [ ] Selected work order shows expanded details
- [ ] Only one work order can be selected at a time
- [ ] Clicking selected work order collapses details
- [ ] ESC key closes expanded details

### Performance Requirements

- [ ] Work orders load within 200ms of location selection
- [ ] Handles locations with 100+ work orders efficiently
- [ ] Smooth scrolling within column
- [ ] Recent orders (last 30 days) load first, older orders lazy-load

## Gherkin Scenarios

```gherkin
Feature: Work Orders Column

Scenario: Display work orders when location selected
  Given "ABC Company" is selected with "123 Main St" location selected
  When the location selection completes
  Then Column 3 shows "Work Orders (8 work orders)"
  And I see work order cards sorted by most recent first
  And each card shows work order number, type, status, and date

Scenario: Select work order for details
  Given Column 3 shows 8 work orders for "123 Main St"
  When I click on work order "WO-2025-001"
  Then the work order card expands to show:
    - Full service description
    - Technician notes
    - Customer contact info
    - Parts used (if completed)
  And other work order cards remain collapsed

Scenario: Status color coding
  Given work orders with different statuses are displayed
  Then I see:
    - Blue indicators for "Scheduled" orders
    - Orange indicators for "In Progress" orders
    - Green indicators for "Completed" orders
    - Red indicators for "Overdue" orders
    - Gray indicators for "Cancelled" orders

Scenario: Location change clears work order selection
  Given work order "WO-2025-001" is selected and expanded
  When I select a different location in Column 2
  Then Column 3 updates with the new location's work orders
  And no work order is selected or expanded
  And loading state appears briefly during transition

Scenario: Empty state handling
  Given I select a location with no work orders
  Then Column 3 shows "Work Orders (0 work orders)"
  And displays "No work orders found for this location"
```

## Technical Considerations

### Data Structure

- Query work_orders table by service_location_id
- Include joins for technician names and service types
- Order by created_date DESC for recent-first display
- Include status and date fields for indicators

### State Management

- Track selected location ID from Column 2
- Maintain selected work order ID for detail expansion
- Clear work order selection on location change
- Handle loading states during data fetch

### API Integration

- Paginated loading for locations with many work orders
- Initial load: last 30 days or 50 records, whichever is more
- Lazy load older work orders on scroll
- Include necessary relationships in single query

### Performance Optimization

- Implement virtual scrolling for 100+ work orders
- Cache work order data for recently viewed locations
- Optimize query with proper indexes
- Debounce rapid location changes

## Out of Scope

- Creating new work orders
- Editing work order information
- Work order scheduling and assignment
- Technician communication features
- Parts inventory integration
- Financial aspects (pricing, billing)
- Column 1 or Column 2 interactions

## Dependencies

- **US-006**: Service Locations Column (must be completed)
- Supabase work_orders table structure
- Service location selection state from Column 2
- Work order status definitions and color schemes

## Success Metrics

- Work orders load within 200ms of location selection
- Users can identify target work order within 10 seconds
- All status indicators are immediately recognizable
- Zero performance issues with high-volume locations
- Support tickets resolve 50% faster with instant access

## Estimated Effort

- **Planning**: 1 hour
- **Implementation**: 6-8 hours
- **Testing**: 2-3 hours
- **Total**: 9-12 hours
