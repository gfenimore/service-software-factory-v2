# US-006: Service Locations Column (Column 2)

## User Story

**As a** Business Owner, Operations Manager, or Admin  
**When I** select an account in Column 1  
**I want to** see all service locations for that account displayed in Column 2  
**So I can** select a specific location and view its work orders in Column 3

## Background

The Master View's second column shows all service locations associated with the selected account. This provides the bridge between account-level context and specific work order details. Each service location is displayed as a card showing key identification information, with selection driving the work orders display in Column 3.

## Business Rules

- Column 2 only populates when an account is selected in Column 1
- Shows ALL service locations for the selected account (active and inactive)
- One service location can be selected at a time
- Selecting a location immediately updates Column 3
- No service location is pre-selected when account changes
- Column 2 clears when no account is selected

## Acceptance Criteria

### Display Requirements

- [ ] Column 2 shows "Service Locations" header with count "(X locations)"
- [ ] Each location displays as a card showing:
  - Service address (street, city, state)
  - Location type (if specified)
  - Status indicator (Active/Inactive)
  - Last service date (if available)
- [ ] Cards are vertically stacked with consistent spacing
- [ ] Column scrolls independently when content exceeds height
- [ ] Empty state shows "No service locations" when account has none

### Selection Behavior

- [ ] Only one location can be selected at a time
- [ ] Selected location has clear visual indicator
- [ ] Clicking selected location deselects it
- [ ] Selecting new account clears current location selection
- [ ] Selection updates Column 3 immediately

### Performance Requirements

- [ ] Service locations load within 200ms of account selection
- [ ] Smooth scrolling within column
- [ ] No flickering during account changes
- [ ] Handles accounts with 50+ locations efficiently

## Gherkin Scenarios

```gherkin
Feature: Service Locations Column

Scenario: Display locations when account selected
  Given I have accounts with multiple service locations
  When I select "ABC Company" in Column 1
  Then Column 2 shows "Service Locations (3 locations)"
  And I see 3 location cards with addresses
  And Column 3 shows empty state

Scenario: Select service location
  Given "ABC Company" is selected with 3 locations showing
  When I click on "123 Main St" location card
  Then the location card shows selected state
  And Column 3 updates to show work orders for that location
  And other location cards remain unselected

Scenario: Account change clears location selection
  Given "ABC Company" is selected with "123 Main St" location selected
  When I select "XYZ Corp" in Column 1
  Then Column 2 shows XYZ Corp's locations
  And no location is selected
  And Column 3 shows empty state

Scenario: Empty state handling
  Given I select an account with no service locations
  Then Column 2 shows "Service Locations (0 locations)"
  And displays "No service locations found for this account"
  And Column 3 remains empty
```

## Technical Considerations

### Data Structure

- Fetch locations when account selected
- Store in component state for quick re-selection
- Include location metadata for card display
- Handle null/empty location fields

### State Management

- Track selected account ID from Column 1
- Maintain selected location ID for Column 3
- Clear location selection on account change
- Persist selection during location detail views

### API Integration

- Query service_locations table by account_id
- Include necessary joins for display data
- Order by primary address, then created_date
- Handle API errors gracefully

## Out of Scope

- Creating new service locations
- Editing location information
- Location contact information (separate story US-010)
- Service location communication logs
- Location-specific financial data
- Column 1 or Column 3 interactions

## Dependencies

- **US-004**: Account Cards Column (must be completed)
- Supabase service_locations table structure
- Account selection state from Column 1
- Master View three-column layout implementation

## Success Metrics

- Location cards load within 200ms of account selection
- All three personas can efficiently navigate to specific locations
- Zero performance issues with large location lists (50+ locations)
- Users can identify target location within 5 seconds

## Estimated Effort

- **Planning**: 45 minutes
- **Implementation**: 4-5 hours
- **Testing**: 2 hours
- **Total**: 7-8 hours
