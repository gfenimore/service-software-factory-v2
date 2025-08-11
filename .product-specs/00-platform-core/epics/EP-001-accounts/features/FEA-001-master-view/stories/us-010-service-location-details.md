# US-010: Service Location Details

## User Story

**As a** Business Owner, Operations Manager, or Admin  
**When I** need detailed information about a specific service location  
**I want to** view extended service location details on-demand  
**So I can** access specific location information without cluttering my at-a-glance Master View

## Background

Similar to US-005 for account details, the Master View's service location cards show only essential at-a-glance information. When users need deeper location details—full address information, contacts, service history, or special instructions—they should be able to access these details on-demand without disrupting the three-column workflow or navigation to other screens.

## Business Rules

- Location details are accessed only through explicit user action
- Details panel does not auto-open on location selection
- Only one location detail panel can be open at a time
- Details are read-only (no editing functionality)
- Panel closes automatically when different location is selected
- Column 3 (Work Orders) updates immediately on location selection, regardless of detail panel state

## Acceptance Criteria

### Access and Display

- [ ] Selected location card shows "View Details" action button/icon
- [ ] Clicking "View Details" opens location detail panel
- [ ] Detail panel appears as expandable section below the selected card
- [ ] Panel shows information not visible on the card:
  - Complete service address (including unit numbers, building details)
  - Property type (Residential, Commercial, Industrial, etc.)
  - Property contact information (if different from account contact)
  - Service access instructions (gate codes, key location, etc.)
  - Equipment details at location (if applicable)
  - Location-specific notes or special instructions
  - Service history summary (last service date, frequency, issues)

### Interaction Requirements

- [ ] Selecting a location does NOT auto-open details
- [ ] Column 3 (Work Orders) updates immediately on location selection
- [ ] Detail panel opens only on explicit "View Details" click
- [ ] ESC key closes open detail panel
- [ ] Clicking outside panel closes it
- [ ] Selecting different location closes current detail panel and optionally opens new one

### Panel Behavior

- [ ] Panel integrates smoothly within Column 2's scroll area
- [ ] Panel does not affect Column 1 or Column 3 layouts
- [ ] Opening panel scrolls automatically to keep selected location visible
- [ ] Panel has clear close button (X) in top-right corner
- [ ] Only one detail panel can be open at a time

### Data Requirements

- [ ] All data loads from Supabase service_locations and related tables
- [ ] Handle null/empty fields gracefully with "Not specified" placeholders
- [ ] Contact information links appropriately (phone, email)
- [ ] Service history data comes from work_orders analysis

## Gherkin Scenarios

```gherkin
Feature: Service Location Details

Scenario: Open location details panel
  Given "ABC Company" is selected with multiple locations showing
  And "123 Main St" location is selected
  When I click "View Details" on the "123 Main St" card
  Then a detail panel opens below the location card
  And I see complete address information
  And I see property type and access instructions
  And Column 3 continues showing work orders for "123 Main St"

Scenario: Location details do not auto-open
  Given "ABC Company" is selected with locations showing
  When I click "123 Main St" location card to select it
  Then the location becomes selected
  And Column 3 updates with work orders
  But no detail panel opens automatically
  And I see "View Details" button on the selected location

Scenario: Close details when selecting different location
  Given "123 Main St" location is selected with details panel open
  When I click "456 Oak Ave" location card
  Then "456 Oak Ave" becomes selected
  And "123 Main St" detail panel closes automatically
  And Column 3 updates with work orders for "456 Oak Ave"
  And no detail panel is open for "456 Oak Ave"

Scenario: Handle empty/null location data
  Given a service location with minimal information
  When I open the location details panel
  Then empty fields show "Not specified"
  And required fields (address) always display
  And panel layout remains consistent regardless of data availability

Scenario: ESC key closes details panel
  Given "123 Main St" location details panel is open
  When I press the ESC key
  Then the detail panel closes
  And "123 Main St" remains selected
  And Column 3 continues showing work orders
```

## Technical Considerations

### Component Architecture

- Integrate detail panel as part of location card component
- Use conditional rendering based on detail panel state
- Maintain location selection state separate from detail panel state
- Reuse location data already loaded in Column 2

### State Management

- Track which location (if any) has detail panel open
- Separate detail panel state from location selection state
- Auto-close detail when location changes
- Handle rapid location switching without UI conflicts

### Data Integration

- Extend existing location data query to include detail fields
- No additional API calls needed for basic details
- Lazy load service history data when panel opens
- Cache detail data for recently viewed locations

### UI/UX Considerations

- Panel expands smoothly without layout jumps
- Maintain Column 2 scroll position when possible
- Clear visual hierarchy between card and detail information
- Consistent close button placement and behavior

## Out of Scope

- Editing service location information
- Managing location contacts (separate from account contacts)
- Service location communication logs
- Equipment/asset management at location
- Service scheduling from location details
- Location-specific financial information
- Photo gallery or location images

## Dependencies

- **US-006**: Service Locations Column (must be completed)
- **US-009**: Column State Management (for interaction patterns)
- Supabase service_locations table with extended fields
- Location selection state from Column 2
- Expandable panel UI component

## Success Metrics

- Detail panel opens within 100ms of button click
- All location information is accessible without external navigation
- Panel interactions don't disrupt Master View workflow
- Users can access needed location details in under 10 seconds
- Zero conflicts between panel state and column selection state

## Estimated Effort

- **Planning**: 45 minutes
- **Implementation**: 3-4 hours
- **Testing**: 1.5 hours
- **Total**: 5-6 hours
