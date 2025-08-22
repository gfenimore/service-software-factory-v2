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
3. **Empty State Handling**: If an account has no locations, display "No service locations for this account" message
4. **Location Status**: Only display active locations by default (status != 'Inactive')
5. **Access Information**: Visible to all authenticated users
6. **Sort Order**: Locations displayed alphabetically by location_name, with primary location first if designated
7. **Data Freshness**: Location data refreshes when account selection changes
8. **Card Information Hierarchy**: Location name is prominent, address secondary, access info indicated by icon
9. **Location Limit**: Display 20 locations per page with pagination controls
10. **Account Status**: If account is suspended, show warning banner above location list

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
  - access_information: string | null (optional)
  - notes: string | null (optional)
  - is_primary: boolean (default: false)
  - is_billing_address: boolean (default: false)
  - status: string (enum: 'Active' | 'Inactive' | 'On-Hold')
    # Note: Implemented as enum in database
  - created_at: string (ISO timestamp)
  - updated_at: string (ISO timestamp)

additional_fields_needed:
  - account_status: string (from ACCOUNT entity)
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
  "total": 45,
  "page": 1,
  "per_page": 20,
  "total_pages": 3,
  "account_name": "ABC Company",
  "account_status": "Active"
}
```

## Component Interface

### Component Props

```typescript
interface ServiceLocationsListProps {
  accountId: string
  accountName: string
  accountStatus: 'Active' | 'Suspended' | 'Inactive'
  onLocationSelect: (locationId: string) => void
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
}
```

### Component State

```typescript
interface ServiceLocationsListState {
  locations: ServiceLocation[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  totalPages: number
  perPage: number
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

  // TODO: Add caching in optimization phase
}
```

### State Flow

```
1. User selects account in Column 1
   → selectedAccountId updates in context
   → Column 2 detects accountId change
   → Fetches locations for new accountId (page 1)
   → Displays location cards
   → Clears selectedLocationId

2. User selects location in Column 2
   → selectedLocationId updates in context
   → Visual feedback on selected card
   → Column 3 detects locationId change
   → Fetches work orders for location

3. User changes page in Column 2
   → currentPage updates in local state
   → Fetches next page of locations
   → Maintains selectedLocationId if on current page

4. User changes account selection
   → Both selectedLocationId and selectedWorkOrderId clear
   → Columns 2 and 3 show appropriate empty states
   → Page resets to 1
```

## Acceptance Criteria

- [ ] I can see all active service locations when I select an account in Column 1
- [ ] I can view the location name prominently on each card
- [ ] I can see the full address (street, city, state, zip) on each card
- [ ] I can see an access info indicator icon if special instructions exist
- [ ] I can see a "PRIMARY" badge on the primary location if designated
- [ ] I can click on a location card to select it, which updates Column 3 with work orders
- [ ] I can see visual feedback (blue border/background) on the selected location card
- [ ] I can see a "No service locations for this account" message if the account has no locations
- [ ] I can see pagination info at the column header (e.g., "Page 1 of 3 • 45 locations")
- [ ] I can navigate between pages using pagination controls at the bottom
- [ ] The system displays locations sorted alphabetically with primary first
- [ ] The system maintains my location selection when changing pages (if still visible)
- [ ] The system clears location selection when I switch accounts
- [ ] The system shows a warning banner if the account is suspended

## Gherkin Scenarios

### Scenario 1: View Locations for Account with Multiple Sites

```gherkin
Given I am viewing the Master View
And I have selected "ABC Company" which has 45 active service locations
When Column 2 loads
Then I see the first 20 location cards displayed
And each card shows location_name, street_address, city, state, and postal_code
And the primary location appears first if one exists
And remaining locations are sorted alphabetically by location_name
And I see "Page 1 of 3 • 45 locations" in the column header
And I see pagination controls showing pages 1, 2, 3 at the bottom
```

### Scenario 2: Select Location to View Work Orders

```gherkin
Given I am viewing locations for "ABC Company"
And no location is currently selected
When I click on the "Main Office" location card
Then the "Main Office" card shows a blue border and light blue background
And Column 3 updates to show work orders for "Main Office"
And the selected state persists if I navigate to page 2 and back to page 1
And the selectedLocationId in context equals the Main Office ID
```

### Scenario 3: Account with No Service Locations

```gherkin
Given I am viewing the Master View
When I select "XYZ New Customer" which has no locations yet
Then Column 2 displays "No service locations for this account"
And Column 3 shows "Select a location to view work orders"
And the column header shows "Page 0 of 0 • 0 locations"
And no pagination controls are displayed
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
And I am on page 2 of locations
When I select "DEF Company" in Column 1
Then Column 2 updates to show DEF Company's locations starting at page 1
And no location is pre-selected (selectedLocationId is null)
And Column 3 shows "Select a location to view work orders"
And the previous selection of "Main Office" is cleared
```

### Scenario 6: Pagination with Many Locations

```gherkin
Given I select "MegaCorp" which has 50 service locations
When Column 2 loads
Then the first 20 locations appear within 500ms
And I see "Page 1 of 3 • 50 locations" in the header
When I click page 2
Then locations 21-40 are displayed
And the URL updates to reflect current page
When I click page 3
Then locations 41-50 are displayed
```

### Scenario 7: Suspended Account Warning

```gherkin
Given I am viewing the Master View
When I select "Problem Customer" which has account_status: "Suspended"
Then I see a yellow warning banner stating "This account is suspended"
And the locations are still displayed below the warning
And all normal functionality continues to work
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
?status=Active (optional, defaults to Active only)
?include_inactive=false (optional, defaults to false)
?sort=name (optional, defaults to name with primary first)
?page=1 (optional, defaults to 1)
?per_page=20 (optional, defaults to 20, max 50)
```

### Response Codes

- **200**: Success with locations array (may be empty)
- **401**: Unauthorized (invalid or missing token)
- **403**: Account suspended or inactive
- **404**: Account not found
- **408**: Request timeout (network issues)
- **500**: Server error
- **503**: Service temporarily unavailable

### Response Headers

```
X-Total-Count: 45
X-Current-Page: 1
X-Per-Page: 20
X-Total-Pages: 3
```

### Response Time Targets

- **<500ms** for 1-10 locations (including network)
- **<750ms** for 11-20 locations
- **<1000ms** for 20+ locations with pagination

### Error Response Shape

```json
{
  "error": {
    "code": "ACCOUNT_NOT_FOUND",
    "message": "The requested account could not be found. Please verify the account ID and try again.",
    "details": {
      "account_id": "7d2e8f9a-5678-9012-3456-bcdef0123456",
      "timestamp": "2024-08-14T10:30:00Z"
    }
  }
}
```

### Additional Error Codes

```json
{
  "ACCOUNT_SUSPENDED": "This account has been suspended. Contact support for assistance.",
  "REQUEST_TIMEOUT": "The request took too long to complete. Please try again.",
  "SERVICE_UNAVAILABLE": "The service is temporarily unavailable. Please try again later.",
  "INVALID_PAGE": "The requested page number is invalid."
}
```

## Technical Considerations

- **Component Scope**: ServiceLocationsList component in Column 2 of MasterViewLayout
- **Data Dependencies**:
  - Requires valid accountId from Column 1 selection
  - Requires authentication token for API calls
  - SERVICE_LOCATION entity from BUSM
  - Account status from ACCOUNT entity
- **Performance**:
  - Implement pagination with 20 items per page
  - Debounce rapid account selection changes (100ms)
  - Preload next page on hover over pagination control
- **Error Handling**:
  - Show inline error message on fetch failure
  - Provide "Retry" button for network errors
  - Log errors to monitoring service
  - Use user-friendly error messages (not technical codes)
- **Accessibility**:
  - Cards must be keyboard navigable
  - Screen reader announces selection changes
  - Focus management on selection
  - Pagination controls support keyboard navigation

## Test Data

### Minimal Test Case (Empty State)

```typescript
const emptyAccountTest = {
  accountId: 'test-account-empty',
  accountName: 'New Customer Inc',
  accountStatus: 'Active',
  locations: [],
  total: 0,
  page: 1,
  per_page: 20,
  total_pages: 0,
}
```

### Typical Test Case (2-3 Locations)

```typescript
const typicalAccountTest = {
  accountId: 'test-account-typical',
  accountName: 'ABC Company',
  accountStatus: 'Active',
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
  page: 1,
  per_page: 20,
  total_pages: 1,
}
```

### Edge Test Case (Many Locations - Tests Pagination)

```typescript
const edgeAccountTest = {
  accountId: 'test-account-edge',
  accountName: 'MegaCorp',
  accountStatus: 'Active',
  locations: Array(20)
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
  page: 1,
  per_page: 20,
  total_pages: 3,
}
```

### Suspended Account Test Case

```typescript
const suspendedAccountTest = {
  accountId: 'test-account-suspended',
  accountName: 'Problem Customer',
  accountStatus: 'Suspended',
  locations: [
    {
      id: 'loc-sus-1',
      account_id: 'test-account-suspended',
      location_name: 'Office',
      street_address: '789 Problem St',
      address_line2: null,
      city: 'Tampa',
      state: 'FL',
      postal_code: '33602',
      country: 'USA',
      latitude: null,
      longitude: null,
      access_information: null,
      notes: 'Account suspended for non-payment',
      is_primary: true,
      is_billing_address: true,
      status: 'On-Hold',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-08-14T09:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  per_page: 20,
  total_pages: 1,
}
```

### Error Test Case

```typescript
const errorTest = {
  accountId: 'test-account-error',
  error: {
    code: 'NETWORK_ERROR',
    message: "We're having trouble loading locations. Please check your connection and try again.",
    details: {
      timestamp: '2024-08-14T10:30:00Z',
    },
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
- Sorting by columns other than name (future enhancement)

## Dependencies

- **Depends On**:
  - US-005: Account selection in Column 1 (must be complete and working)
    - Note: US-005 implements Column 1 account selection functionality
    - (Contact Details Modal was part of Column 1 implementation)
  - Authentication system (must identify user and provide token)
  - BUSM SERVICE_LOCATION entity (must be defined in database)
- **Blocks**:
  - US-007: Work Orders display in Column 3
  - US-008: Location details modal/expanded view
  - US-018: Location search and filtering
- **External Dependencies**:
  - Supabase for data persistence
  - React Context API for state management

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
  // Note: status field is enum type
}

// Generate API response type
export interface ServiceLocationsResponse {
  locations: ServiceLocation[]
  total: number
  page: number
  per_page: number
  total_pages: number
  account_name: string
  account_status: 'Active' | 'Suspended' | 'Inactive'
}
```

### For Manual API Implementation by CC

Use the API Contract section to implement:

```typescript
// Route: app/api/accounts/[accountId]/service-locations/route.ts
// - Implement GET handler
// - Validate accountId parameter
// - Check authentication (all authenticated users can view)
// - Query SERVICE_LOCATION where account_id = accountId AND status = 'Active'
// - Implement pagination logic
// - Return response matching API Response Shape
// - Handle all error cases with user-friendly messages
```

### For SCAFFOLD-PROCESSOR then Manual Completion

Use the Component Interface section to generate scaffold:

```tsx
// Component: components/master-view/ServiceLocationsList.tsx
// - Generate component shell with props interface
// - CC will manually implement:
//   - Fetch data on accountId change
//   - Read selectedLocationId from context (not local state)
//   - Render cards for each location
//   - Handle selection with onLocationSelect callback
//   - Show loading, error, and empty states
//   - Implement pagination controls
//   - Show suspended account warning if needed
```

### For TEST-PROCESSOR

Use the Test Data section to generate:

```typescript
// Tests: __tests__/ServiceLocationsList.test.tsx
// - Test empty state with emptyAccountTest
// - Test typical case with typicalAccountTest
// - Test pagination with edgeAccountTest (50 locations)
// - Test suspended account with suspendedAccountTest
// - Test error handling with errorTest
// - Test selection behavior (reads from context)
// - Test account switching clears selection
// - Test pagination controls
```

## Answers to Questions

1. **Should we add account_status field to BUSM?**
   - Yes, added to additional_fields_needed section
   - Will need to be fetched from ACCOUNT entity

2. **Page numbers or "Load More" button?**
   - Using page numbers for better navigation (users can jump to specific pages)
   - Shows "Page 1 of 3" format with numbered pagination controls

3. **User-friendly or technical error messages?**
   - User-friendly messages in UI (see Error Response Shape)
   - Technical details logged to monitoring but not shown to users

---

_Generated using story-builder-agent v2.0 template - Fixed in v3 for simpler implementation and realistic targets_
