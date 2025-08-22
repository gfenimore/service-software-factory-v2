# US-006: View Service Locations for Selected Account

## User Story

**As an** Operations Manager  
**When I am** reviewing a customer account in the Master View  
**I want to** see all service locations for that account in column 2  
**So I can** quickly identify which location needs attention or select it to view its work orders

## Background

In service businesses, accounts often have multiple service locations - different properties, buildings, or sites where services are performed. Users need immediate visibility into all locations associated with an account to coordinate service delivery, answer customer questions, and manage work orders efficiently.

Column 2 of the Master View displays these service locations in a card-based format that shows essential information at a glance while allowing drill-down into specific location details. This eliminates the traditional navigation pattern of leaving the account screen to view locations separately.

## Business Rules

1. **Location Ownership**: Only service locations belonging to the selected account (via account_id foreign key) are displayed
2. **Selection State**: Only one location can be selected at a time, triggering work order display in Column 3
3. **Empty State Handling**: If an account has no locations, display "No service locations" message with option to add
4. **Location Status**: Only display active locations by default (status != 'Inactive')
5. **Access Information**: Sensitive access codes/instructions only visible to authorized users
6. **Sort Order**: Locations displayed alphabetically by location name, with primary location first if designated
7. **Data Freshness**: Location data refreshes when account selection changes
8. **Card Information Hierarchy**: Location name is prominent, address secondary, access info indicated by icon

## Acceptance Criteria

- [ ] I can see all active service locations when I select an account in Column 1
- [ ] I can view the location name, street address, and city/state on each card
- [ ] I can see an access info indicator icon if special instructions exist
- [ ] I can click on a location card to select it, which updates Column 3 with work orders
- [ ] I can see visual feedback (highlight/border) on the selected location card
- [ ] I can see a "No service locations" message if the account has no locations
- [ ] I can see the count of total locations for the account at the top of Column 2
- [ ] The system prevents selection of inactive locations (if displayed)
- [ ] The system maintains my location selection when switching between accounts and back

## Gherkin Scenarios

### Scenario 1: View Locations for Account with Multiple Sites

```gherkin
Given I am viewing the Master View
And I have selected "ABC Company" which has 3 service locations
When Column 2 loads
Then I see 3 location cards displayed
And each card shows location name, address, and city/state
And the cards are sorted alphabetically by location name
And I see "3 locations" count at the top of the column
```

### Scenario 2: Select Location to View Work Orders

```gherkin
Given I am viewing locations for "ABC Company"
When I click on the "Main Office" location card
Then the "Main Office" card is visually highlighted
And Column 3 updates to show work orders for "Main Office"
And the selected state persists if I scroll the location list
```

### Scenario 3: Account with No Service Locations

```gherkin
Given I am viewing the Master View
When I select "XYZ New Customer" which has no locations yet
Then Column 2 displays "No service locations for this account"
And I see an "Add Location" button
And Column 3 shows an empty state
```

### Scenario 4: Location with Access Instructions

```gherkin
Given I am viewing locations for an account
And "Warehouse B" has gate code "1234" in access instructions
When I view the location cards
Then I see a key/lock icon on the "Warehouse B" card
And hovering over the icon shows "Access instructions available"
```

### Scenario 5: Switching Between Accounts

```gherkin
Given I have selected "ABC Company" and then "Main Office" location
When I select "DEF Company" in Column 1
Then Column 2 updates to show DEF Company's locations
And no location is pre-selected
And Column 3 shows empty state until I select a location
```

## Technical Considerations

- **Component Scope**: ServiceLocationsList component in Column 2 of MasterViewLayout
- **Data Dependencies**:
  - SERVICE_LOCATION entity from BUSM
  - Requires account_id from selected account in Column 1
  - Fields needed: id, location_name, street_address, city, state, postal_code, access_information
- **State Management**:
  - Selected location ID in React Context
  - Location selection triggers work order fetch for Column 3
- **Performance**:
  - Virtual scrolling if account has >20 locations
  - Debounce selection changes to prevent rapid API calls
- **API Endpoint**: GET /api/accounts/:accountId/service-locations
- **Error Handling**: Show error message if location fetch fails, with retry option

## Out of Scope

- Editing location information (separate story)
- Adding new locations (separate story)
- Deleting locations (separate story)
- Showing inactive/archived locations (future enhancement)
- Location mapping/GPS visualization (future enhancement)
- Bulk operations on multiple locations (future story)
- Detailed location information modal (could be US-007)

## Dependencies

- **Depends On**:
  - US-005: Account selection in Column 1 (must be working)
  - Authentication/authorization system (must identify user)
- **Blocks**:
  - US-007: Work Orders display in Column 3
  - US-008: Location details modal/expanded view

## Feature Reference

- **Feature**: FEA-001 Master View
- **Epic**: EP-001 Accounts Module
- **Module**: Accounts
- **Success Criterion**: SC-6 "Location information access"

## Story Points & Priority

- **Estimated Size**: 5 points (Medium complexity)
- **Priority**: High (Core feature for Master View)
- **Sprint Target**: Sprint 2 of Master View development

## Testing Notes

- Test with accounts having 0, 1, 5, and 50+ locations
- Verify performance with large location lists
- Test selection state persistence during scrolling
- Verify access instruction visibility based on user role
- Test error states when API fails

---

_Generated using story-builder pattern from Master View Business Feature document_
