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
6. **Sort Order**: Locations displayed alphabetically by location_name, with primary location first if designated
7. **Data Freshness**: Location data refreshes when account selection changes
8. **Card Information Hierarchy**: Location name is prominent, address secondary, access info indicated by icon
9. **Location Limit**: Paginate or virtual scroll if more than 20 locations

## Data Structure

### BUSM Entity Mapping

```yaml
entity: SERVICE_LOCATION
fields_used:
  - id: string (UUID, primary key)
  - account_id: string (UUID, foreign key to ACCOUNT)
  - location_name: string (required, max 100 chars)
  - street_address: string (required)
  - address_line2: string | null (optional)
  - city: string (required)
  - state: string (required, 2 chars)
  - postal_code: string (required, 5 or 9 digits)
  - country: string (default: 'USA')
  - latitude: number | null (optional, decimal)
  - longitude: number | null (optional, decimal)
  - access_information: string | null (optional, encrypted)
  - notes: string | null (optional)
  - is_primary: boolean (default: false)
  - is_billing_address: boolean (default: false)
  - status: string (default: 'Active')
  - created_at: string (ISO timestamp)
  - updated_at: string (ISO timestamp)
```

### API Response Shape

```json
{
  "locations": [
    {
      "id": "9f3a4b5c-1234-5678-9012-abcdef123456",
      "account_id": "7d2e8f9a-5678-9012-3456-bcdef0123456",
      "location_name": "Main Office",
      "street_address": "123 Business Park Dr",
      "address_line2": "Suite 100",
      "city": "Tampa",
      "state": "FL",
      "postal_code": "33601",
      "country": "USA",
      "latitude": 27.9506,
      "longitude": -82.4572,
      "access_information": "Gate code: 1234, Building entrance: Use side door",
      "notes": "Contact security before 7am",
      "is_primary": true,
      "is_billing_address": false,
      "status": "Active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-08-10T14:22:00Z"
    },
    {
      "id": "8e2d7c6b-2345-6789-0123-bcdef1234567",
      "account_id": "7d2e8f9a-5678-9012-3456-bcdef0123456",
      "location_name": "Warehouse B",
      "street_address": "456 Industrial Way",
      "address_line2": null,
      "city": "Tampa",
      "state": "FL",
      "postal_code": "33605",
      "country": "USA",
      "latitude": null,
      "longitude": null,
      "access_information": null,
      "notes": null,
      "is_primary": false,
      "is_billing_address": false,
      "status": "Active",
      "created_at": "2024-02-20T09:15:00Z",
      "updated_at": "2024-02-20T09:15:00Z"
    }
  ],
  "total": 2,
  "account_name": "ABC Company"
}
```

## Component Interface

### Component Props

```typescript
interface ServiceLocationsListProps {
  accountId: string
  accountName: string
  onLocationSelect: (locationId: string) => void
  selectedLocationId?: string
  className?: string
}
```

### Component State

```typescript
interface ServiceLocationsListState {
  locations: ServiceLocation[]
  loading: boolean
  error: string | null
  selectedId: string | null
  total: number
}
```

### Service Location Type

```typescript
interface ServiceLocation {
  id: string
  account_id: string
  location_name: string
  street_address: string
  address_line2?: string | null
  city: string
  state: string
  postal_code: string
  country: string
  latitude?: number | null
  longitude?: number | null
  access_information?: string | null
  notes?: string | null
  is_primary: boolean
  is_billing_address: boolean
  status: 'Active' | 'Inactive' | 'On-Hold'
  created_at: string
  updated_at: string
}
```

## State Management

### Context Shape

```typescript
interface MasterViewContext {
  // Selection State
  selectedAccountId: string | null
  selectedLocationId: string | null
  selectedWorkOrderId: string | null

  // Setters
  setSelectedAccountId: (id: string | null) => void
  setSelectedLocationId: (id: string | null) => void
  setSelectedWorkOrderId: (id: string | null) => void

  // Data Cache (optional optimization)
  locationCache: Map<string, ServiceLocation[]>
}
```

### State Flow

```
1. User selects account in Column 1
   → selectedAccountId updates in context
   → Column 2 detects accountId change
   → Fetches locations for new accountId
   → Displays location cards
   → Clears selectedLocationId

2. User selects location in Column 2
   → selectedLocationId updates in context
   → Visual feedback on selected card
   → Column 3 detects locationId change
   → Fetches work orders for location

3. User changes account selection
   → Both selectedLocationId and selectedWorkOrderId clear
   → Columns 2 and 3 show appropriate empty states
```

## Acceptance Criteria

- [ ] I can see all active service locations when I select an account in Column 1
- [ ] I can view the location name prominently on each card
- [ ] I can see the full address (street, city, state, zip) on each card
- [ ] I can see an access info indicator icon if special instructions exist
- [ ] I can see a "PRIMARY" badge on the primary location if designated
- [ ] I can click on a location card to select it, which updates Column 3 with work orders
- [ ] I can see visual feedback (blue border/background) on the selected location card
- [ ] I can see a "No service locations" message if the account has no locations
- [ ] I can see the count of total locations at the column header (e.g., "3 locations")
- [ ] The system displays locations sorted alphabetically with primary first
- [ ] The system maintains my location selection when scrolling the list
- [ ] The system clears location selection when I switch accounts

## Gherkin Scenarios

### Scenario 1: View Locations for Account with Multiple Sites

```gherkin
Given I am viewing the Master View
And I have selected "ABC Company" which has 3 active service locations
When Column 2 loads
Then I see 3 location cards displayed
And each card shows location_name, street_address, city, state, and postal_code
And the primary location appears first if one exists
And remaining locations are sorted alphabetically by location_name
And I see "3 locations" in the column header
```

### Scenario 2: Select Location to View Work Orders

```gherkin
Given I am viewing locations for "ABC Company"
And no location is currently selected
When I click on the "Main Office" location card
Then the "Main Office" card shows a blue border and light blue background
And Column 3 updates to show work orders for "Main Office"
And the selected state persists if I scroll the location list
And the selectedLocationId in context equals the Main Office ID
```

### Scenario 3: Account with No Service Locations

```gherkin
Given I am viewing the Master View
When I select "XYZ New Customer" which has no locations yet
Then Column 2 displays "No service locations for this account"
And I see an "Add Location" button below the message
And Column 3 shows "Select a location to view work orders"
And the column header shows "0 locations"
```

### Scenario 4: Location with Access Instructions

```gherkin
Given I am viewing locations for an account
And "Warehouse B" has access_information: "Gate code: 1234"
When I view the location cards
Then I see a key icon on the "Warehouse B" card
And hovering over the icon shows tooltip "Access instructions available"
And clicking the icon opens a popover with the full access instructions
```

### Scenario 5: Switching Between Accounts

```gherkin
Given I have selected "ABC Company" and then "Main Office" location
When I select "DEF Company" in Column 1
Then Column 2 updates to show DEF Company's locations
And no location is pre-selected (selectedLocationId is null)
And Column 3 shows "Select a location to view work orders"
And the previous selection of "Main Office" is cleared
```

### Scenario 6: Performance with Many Locations

```gherkin
Given I select "MegaCorp" which has 50 service locations
When Column 2 loads
Then the first 20 locations appear within 300ms
And I can scroll to see additional locations
And virtual scrolling maintains smooth 60fps performance
And the column header shows "50 locations"
```

## API Contract

### Endpoint

```
GET /api/accounts/:accountId/service-locations
```

### Request Headers

```
Authorization: Bearer [token]
Content-Type: application/json
Accept: application/json
```

### Query Parameters

```
?status=Active (optional, defaults to all statuses)
?include_inactive=false (optional, defaults to false)
?sort=name (optional, defaults to name with primary first)
?limit=20 (optional, for pagination)
?offset=0 (optional, for pagination)
```

### Response Codes

- **200**: Success with locations array (may be empty)
- **401**: Unauthorized (invalid or missing token)
- **403**: Forbidden (user lacks permission for this account)
- **404**: Account not found
- **500**: Server error

### Response Headers

```
X-Total-Count: 25
X-Page-Limit: 20
X-Page-Offset: 0
```

### Response Time Targets

- **<200ms** for 1-10 locations
- **<300ms** for 11-20 locations
- **<500ms** for 20+ locations (with pagination)

### Error Response Shape

```json
{
  "error": {
    "code": "ACCOUNT_NOT_FOUND",
    "message": "Account with ID 7d2e8f9a-5678-9012-3456-bcdef0123456 not found",
    "details": null
  }
}
```

## Technical Considerations

- **Component Scope**: ServiceLocationsList component in Column 2 of MasterViewLayout
- **Data Dependencies**:
  - Requires valid accountId from Column 1 selection
  - Requires authentication token for API calls
  - SERVICE_LOCATION entity from BUSM
- **Performance**:
  - Implement virtual scrolling for >20 locations using react-window
  - Debounce rapid account selection changes (100ms)
  - Cache location data for 5 minutes per account
- **Error Handling**:
  - Show inline error message on fetch failure
  - Provide "Retry" button for network errors
  - Log errors to monitoring service
- **Caching Strategy**:
  - Cache successful responses for 5 minutes
  - Invalidate cache on account switch
  - Invalidate cache on location CRUD operations
- **Accessibility**:
  - Cards must be keyboard navigable
  - Screen reader announces selection changes
  - Focus management on selection

## Test Data

### Minimal Test Case (Empty State)

```typescript
const emptyAccountTest = {
  accountId: 'test-account-empty',
  accountName: 'New Customer Inc',
  locations: [],
  total: 0,
}
```

### Typical Test Case (2-3 Locations)

```typescript
const typicalAccountTest = {
  accountId: 'test-account-typical',
  accountName: 'ABC Company',
  locations: [
    {
      id: 'loc-1',
      account_id: 'test-account-typical',
      location_name: 'Main Office',
      street_address: '123 Business Park Dr',
      address_line2: 'Suite 100',
      city: 'Tampa',
      state: 'FL',
      postal_code: '33601',
      country: 'USA',
      latitude: 27.9506,
      longitude: -82.4572,
      access_information: 'Gate code: 1234',
      notes: 'Contact security before 7am',
      is_primary: true,
      is_billing_address: false,
      status: 'Active',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-08-10T14:22:00Z',
    },
    {
      id: 'loc-2',
      account_id: 'test-account-typical',
      location_name: 'Warehouse',
      street_address: '456 Industrial Way',
      address_line2: null,
      city: 'Tampa',
      state: 'FL',
      postal_code: '33605',
      country: 'USA',
      latitude: null,
      longitude: null,
      access_information: null,
      notes: null,
      is_primary: false,
      is_billing_address: false,
      status: 'Active',
      created_at: '2024-02-20T09:15:00Z',
      updated_at: '2024-02-20T09:15:00Z',
    },
  ],
  total: 2,
}
```

### Edge Test Case (Many Locations)

```typescript
const edgeAccountTest = {
  accountId: 'test-account-edge',
  accountName: 'MegaCorp',
  locations: Array(50)
    .fill(null)
    .map((_, i) => ({
      id: `loc-${i}`,
      account_id: 'test-account-edge',
      location_name: `Location ${String(i).padStart(2, '0')}`,
      street_address: `${100 + i} Commerce St`,
      address_line2: i % 3 === 0 ? `Unit ${i}` : null,
      city: 'Tampa',
      state: 'FL',
      postal_code: `3360${i % 10}`,
      country: 'USA',
      latitude: 27.9506 + i * 0.001,
      longitude: -82.4572 - i * 0.001,
      access_information: i % 5 === 0 ? `Special instructions for location ${i}` : null,
      notes: i % 7 === 0 ? `Important note for location ${i}` : null,
      is_primary: i === 0,
      is_billing_address: i === 0,
      status: i % 10 === 9 ? 'Inactive' : 'Active',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-08-10T14:22:00Z',
    })),
  total: 50,
}
```

### Error Test Case

```typescript
const errorTest = {
  accountId: 'test-account-error',
  error: {
    code: 'NETWORK_ERROR',
    message: 'Failed to fetch locations: Network timeout',
    details: null,
  },
}
```

## Out of Scope

- Editing location information inline (separate story: US-015)
- Adding new locations (separate story: US-016)
- Deleting/archiving locations (separate story: US-017)
- Showing inactive/archived locations by default (enhancement)
- Map visualization of locations (future story: US-025)
- Bulk operations on multiple locations (future story)
- Detailed location information modal (story: US-007)
- Exporting location list (future enhancement)
- Location search/filtering within column (story: US-018)

## Dependencies

- **Depends On**:
  - US-005: Account selection in Column 1 (must be complete and working)
  - Authentication system (must identify user and provide token)
  - BUSM SERVICE_LOCATION entity (must be defined in database)
- **Blocks**:
  - US-007: Work Orders display in Column 3
  - US-008: Location details modal/expanded view
  - US-018: Location search and filtering
- **External Dependencies**:
  - Supabase for data persistence
  - React Context API for state management
  - react-window for virtual scrolling (if needed)

## Feature Reference

- **Feature**: FEA-001 Master View
- **Epic**: EP-001 Accounts Module
- **Module**: Accounts
- **Success Criterion**: SC-6 "Location information access - Users can view all service locations for an account and see location details without additional clicks"

## Processor Instructions

### For TYPE-PROCESSOR

Use the Data Structure section to generate:

```typescript
// Generate from BUSM Entity Mapping
export interface ServiceLocation {
  // All fields from fields_used with proper types
}

// Generate API response type
export interface ServiceLocationsResponse {
  locations: ServiceLocation[]
  total: number
  account_name: string
}
```

### For API-PROCESSOR

Use the API Contract section to generate:

```typescript
// Route: app/api/accounts/[accountId]/service-locations/route.ts
// - Implement GET handler
// - Validate accountId parameter
// - Check authorization
// - Query SERVICE_LOCATION where account_id = accountId
// - Return response matching API Response Shape
// - Handle all error cases with proper status codes
```

### For COMPONENT-PROCESSOR

Use the Component Interface section to generate:

```tsx
// Component: components/master-view/ServiceLocationsList.tsx
// - Implement using ServiceLocationsListProps interface
// - Manage state using ServiceLocationsListState
// - Fetch data on accountId change
// - Render cards for each location
// - Handle selection with onLocationSelect callback
// - Show loading, error, and empty states
```

### For TEST-PROCESSOR

Use the Test Data section to generate:

```typescript
// Tests: __tests__/ServiceLocationsList.test.tsx
// - Test empty state with emptyAccountTest
// - Test typical case with typicalAccountTest
// - Test pagination with edgeAccountTest
// - Test error handling with errorTest
// - Test selection behavior
// - Test account switching clears selection
```

---

_Generated using story-builder-agent v2.0 template with complete technical specifications for downstream processing_
