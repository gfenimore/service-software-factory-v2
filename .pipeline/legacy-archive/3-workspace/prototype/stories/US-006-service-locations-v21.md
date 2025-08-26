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
3. **Empty State Handling**: If an account has no locations, display "No service locations for this account" message only
4. **Location Status**: Only display active locations by default (status = 'Active')
5. **Access Information**: Visible to all authenticated users (no complex authorization for Phase 1)
6. **Sort Order**: Locations displayed alphabetically by location_name, with primary location first if designated
7. **Data Freshness**: Location data refreshes when account selection changes
8. **Card Information Hierarchy**: Location name is prominent, address secondary, access info indicated by icon
9. **Pagination**: Display 20 locations per page with simple pagination controls
10. **Account Status**: If account is suspended, show informational banner (no blocking)

## Data Structure

### BUSM Entity Mapping

```yaml
entity: SERVICE_LOCATION
fields_used:
  - id: string (UUID, primary key)
  - account_id: string (UUID, foreign key to ACCOUNT)
  - location_name: string (required, max 100 chars)
  - street_address: string (required)
  - city: string (required)
  - state: string (required, 2 chars)
  - postal_code: string (required, 5 or 9 digits)
  - access_information: string | null (optional, plain text)
  - is_primary: boolean (default: false)
  - status: string (enum in DB: 'Active' | 'Inactive' | 'On-Hold')
  - created_at: string (ISO timestamp)
  - updated_at: string (ISO timestamp)

  # Simplified for Phase 1 - not using:
  # - address_line2 (TODO: Phase 2)
  # - country (defaulting to 'USA')
  # - latitude/longitude (TODO: Phase 3 - mapping)
  # - notes (TODO: Phase 2)
  # - is_billing_address (TODO: Phase 2)
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
      "city": "Tampa",
      "state": "FL",
      "postal_code": "33601",
      "access_information": "Gate code: 1234",
      "is_primary": true,
      "status": "Active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-08-10T14:22:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "per_page": 20,
    "total_pages": 3
  }
}
```

## Component Interface

### Component Props

```typescript
interface ServiceLocationsListProps {
  accountId: string
  accountName: string
  onLocationSelect: (locationId: string) => void
  className?: string

  // TODO: Phase 2 - Add when account status checking implemented
  // accountStatus?: 'Active' | 'Suspended' | 'Inactive';
}
```

### Component State

```typescript
interface ServiceLocationsListState {
  locations: ServiceLocation[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number

  // NO selectedId - comes from context
  // NO cache - add when metrics show need
}
```

### Service Location Type

```typescript
interface ServiceLocation {
  id: string
  account_id: string
  location_name: string
  street_address: string
  city: string
  state: string
  postal_code: string
  access_information?: string | null
  is_primary: boolean
  status: 'Active' | 'Inactive' | 'On-Hold'
  created_at: string
  updated_at: string
}
```

## State Management

### State Location Rules

```markdown
SELECTION STATE: Context only

- selectedLocationId → Read from MasterViewContext
- Never duplicate in component state

LOCAL UI STATE: Component only

- loading → Component state
- error → Component state
- currentPage → Component state

FETCHED DATA: Component state

- locations[] → Component state (not shared with other components)

NO CACHING in Phase 1 - fetch fresh on each account change
```

### Context Shape

```typescript
interface MasterViewContext {
  // Selection State (managed by context)
  selectedAccountId: string | null
  selectedLocationId: string | null
  selectedWorkOrderId: string | null

  // Setters
  setSelectedLocationId: (id: string | null) => void

  // TODO: Phase 2 - Add caching when performance metrics justify
  // locationCache?: Map<string, ServiceLocation[]>;
}
```

### State Flow

```
1. Account selection changes → Clear selectedLocationId
2. Fetch locations for new account (page 1)
3. User clicks location → Update selectedLocationId in context
4. Column 3 reacts to selectedLocationId change
5. Page change → Fetch new page, maintain selection if visible
```

## Acceptance Criteria

- [ ] I can see all active service locations when I select an account in Column 1
- [ ] I can view the location name prominently on each card
- [ ] I can see the address (street, city, state, zip) on each card
- [ ] I can see an icon indicator if access information exists
- [ ] I can see a "PRIMARY" badge on the primary location if designated
- [ ] I can click on a location card to select it
- [ ] I can see visual feedback (blue highlight) on the selected card
- [ ] I can see "No service locations for this account" message for empty state
- [ ] I can see pagination info: "Page 1 of 3 • 45 locations"
- [ ] I can navigate pages using Previous/Next buttons
- [ ] The system maintains alphabetical sort with primary first
- [ ] The system clears selection when switching accounts

## Gherkin Scenarios

### Scenario 1: View Locations (Happy Path)

```gherkin
Given I am viewing the Master View
And I have selected "ABC Company" with 45 active locations
When Column 2 loads
Then I see 20 location cards on page 1
And each card shows location_name, full address
And the primary location appears first
And I see "Page 1 of 3 • 45 locations" in the header
```

### Scenario 2: Select Location

```gherkin
Given I am viewing locations for "ABC Company"
When I click on the "Main Office" location card
Then the card shows blue highlight
And selectedLocationId in context updates
And Column 3 shows work orders for "Main Office"
```

### Scenario 3: Empty State

```gherkin
Given I select "New Customer" with no locations
When Column 2 loads
Then I see "No service locations for this account"
And no pagination controls appear
```

### Scenario 4: Pagination

```gherkin
Given I am viewing page 1 of 3 for "ABC Company"
When I click "Next"
Then I see locations 21-40
And the page indicator shows "Page 2 of 3"
```

### Scenario 5: Account Switch

```gherkin
Given I have "Main Office" selected for "ABC Company"
When I select "XYZ Company" in Column 1
Then Column 2 shows XYZ's locations from page 1
And no location is selected
And Column 3 shows empty state
```

## API Contract

### Endpoint

```
GET /api/accounts/:accountId/service-locations
```

### Query Parameters

```
?page=1 (defaults to 1)
?per_page=20 (defaults to 20, max 50)
?status=Active (defaults to Active only)
```

### Response Codes

- **200**: Success with locations
- **401**: Unauthorized
- **404**: Account not found
- **408**: Request timeout
- **500**: Server error
- **503**: Service unavailable

### Response Time Targets

- **<500ms** for 1-20 locations (realistic with network)
- **<750ms** for pagination requests
- **<1000ms** for initial load after account switch

### Error Response

```json
{
  "error": {
    "message": "Unable to load locations. Please try again.",
    "code": "FETCH_ERROR"
  }
}
```

## Technical Considerations

- **Component**: ServiceLocationsList in Column 2 of MasterView
- **Data Source**: Supabase SERVICE_LOCATION table
- **State**: Read selectedLocationId from context, don't duplicate
- **Pagination**: Simple Previous/Next, no page jumping initially
- **Performance**:
  - Debounce account switches (100ms)
  - No caching in Phase 1
  - TODO: Phase 2 - Add caching if metrics show >3 switches/minute
- **Error Handling**: User-friendly messages, retry button
- **Accessibility**: Keyboard navigation, screen reader support

## Test Data

### Minimal Test

```typescript
const emptyTest = {
  accountId: 'test-1',
  locations: [],
  pagination: { total: 0, page: 0, per_page: 20, total_pages: 0 },
}
```

### Typical Test

```typescript
const typicalTest = {
  accountId: 'test-2',
  locations: [
    {
      id: 'loc-1',
      account_id: 'test-2',
      location_name: 'Main Office',
      street_address: '123 Main St',
      city: 'Tampa',
      state: 'FL',
      postal_code: '33601',
      access_information: 'Gate: 1234',
      is_primary: true,
      status: 'Active',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-08-10T14:22:00Z',
    },
    {
      id: 'loc-2',
      account_id: 'test-2',
      location_name: 'Warehouse',
      street_address: '456 Industrial',
      city: 'Tampa',
      state: 'FL',
      postal_code: '33605',
      access_information: null,
      is_primary: false,
      status: 'Active',
      created_at: '2024-02-20T09:15:00Z',
      updated_at: '2024-02-20T09:15:00Z',
    },
  ],
  pagination: { total: 2, page: 1, per_page: 20, total_pages: 1 },
}
```

### Pagination Test

```typescript
const paginationTest = {
  accountId: 'test-3',
  locations: Array(20)
    .fill(null)
    .map((_, i) => ({
      id: `loc-${i}`,
      account_id: 'test-3',
      location_name: `Location ${String(i).padStart(2, '0')}`,
      street_address: `${100 + i} Commerce St`,
      city: 'Tampa',
      state: 'FL',
      postal_code: '33601',
      access_information: i % 5 === 0 ? 'Has access info' : null,
      is_primary: i === 0,
      status: 'Active',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-08-10T14:22:00Z',
    })),
  pagination: { total: 50, page: 1, per_page: 20, total_pages: 3 },
}
```

## Out of Scope

- Adding new locations (US-016)
- Editing locations (US-015)
- Deleting locations (US-017)
- Filtering/searching locations (US-018)
- Map visualization (US-025)
- Inactive location display (Phase 2)
- Complex authorization (Phase 2)
- Caching optimization (Phase 2)
- Bulk operations (Phase 3)

## Dependencies

- **Depends On**:
  - US-005: Account selection in Column 1 (complete)
  - Authentication system (provides token)
  - BUSM SERVICE_LOCATION entity in database
- **Blocks**:
  - US-007: Work Orders in Column 3
  - US-018: Location filtering

## Feature Reference

- **Feature**: FEA-001 Master View
- **Epic**: EP-001 Accounts Module
- **Module**: Accounts
- **Success Criterion**: SC-6 "Location information access"

## Processor Instructions

### For TYPE-PROCESSOR

```bash
# Generate from Data Structure section:
- ServiceLocation interface
- ServiceLocationsResponse interface
- Pagination interface
```

### For SCAFFOLD-PROCESSOR

```bash
# Generate component shell:
- ServiceLocationsList.tsx with props interface
- Basic component structure
- Empty state/loading/error placeholders
```

### For Manual Implementation by CC

```typescript
// Complete the component:
// 1. Fetch logic on accountId change
// 2. Read selectedLocationId from context
// 3. Render location cards
// 4. Handle pagination
// 5. Call onLocationSelect for selection

// Implement API route:
// 1. Query SERVICE_LOCATION table
// 2. Filter by account_id and status
// 3. Implement pagination
// 4. Return formatted response
```

### For REACT-TEST-PROCESSOR

```bash
# Generate tests from Test Data section:
- Empty state test
- Location display test
- Selection test
- Pagination test
```

---

## Story Validation Report

### Quality Gates Passed:

✅ **Simplicity**: No caching, basic auth only, simple pagination  
✅ **Scope**: No phantom "Add Location" button, empty state is message only  
✅ **Consistency**: Pagination only (no virtual scroll), selection in context only  
✅ **Processors**: Using TYPE-PROCESSOR and SCAFFOLD-PROCESSOR (available)  
✅ **Business**: All core rules captured, clear success criterion

### Complexity Deferred:

- **Caching**: TODO Phase 2 (after usage metrics)
- **Advanced fields**: address_line2, notes, lat/long deferred
- **Complex auth**: TODO Phase 2 (when roles defined)
- **Bulk operations**: TODO Phase 3

### Processors to Use:

- **Will use**: TYPE-PROCESSOR, SCAFFOLD-PROCESSOR, REACT-TEST-PROCESSOR
- **Manual work**: API implementation, component completion, integration
- **Future opportunity**: API-PROCESSOR would help

### Risk Areas:

- **Pagination performance** with 50+ locations (monitor response times)
- **State sync** between columns (test selection changes thoroughly)
- **Account switching** frequency (may need caching if >3/minute)

### Simplifications Made:

1. Removed unused BUSM fields (address_line2, country, lat/long)
2. Single pagination approach (no virtual scroll complexity)
3. No caching initially (measure first)
4. No authorization complexity (all authenticated users equal)
5. Simple error messages (not technical)

---

_Generated using story-builder-agent v2.1 with simplicity principles and quality gates_
