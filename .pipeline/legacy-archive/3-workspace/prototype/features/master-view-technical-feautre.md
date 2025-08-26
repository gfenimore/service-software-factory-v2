# Master View Feature Definition v2

**Version**: 2.0  
**Created**: August 2025  
**Updated**: August 13, 2025  
**Module**: Accounts  
**Status**: Enhanced with SDLC learnings

---

## 1. Vision

Provide a **'single pane of glass'** to enable users to access ALL account data from one location. The Master View allows users to see all current information without navigating to several different modules or screens, which is the 'traditional' approach.

## 2. User Value

This will save **hundreds of navigational clicks per day**, and make it easy for users to find the information they are looking for quickly, whether answering customer queries or providing support to technicians on their routes.

**Quantifiable Benefits:**

- Time to find information: 2-3 minutes → <15 seconds (90% reduction)
- Clicks per task: 8-12 → 1-3 (75% reduction)
- Support call resolution time: 5-10 minutes → 1-2 minutes (80% reduction)

## 3. BUSM Entity Mapping

### Primary Entities (Core Three Columns)

```yaml
Column 1 - Accounts:
  entity: ACCOUNT
  fields_displayed:
    - AccountName
    - AccountType
    - Status
    - BillingCity, BillingState (combined)
  relationships:
    - has_many: CONTACT
    - has_many: SERVICE_LOCATION
    - has_many: SERVICE_AGREEMENT

Column 2 - Service Locations:
  entity: SERVICE_LOCATION
  fields_displayed:
    - LocationName
    - StreetAddress
    - City, State, PostalCode
    - AccessInformation (if exists)
  relationships:
    - belongs_to: ACCOUNT
    - has_many: WORK_ORDER
    - has_many: CONTACT_LOCATION

Column 3 - Work Orders:
  entity: WORK_ORDER
  fields_displayed:
    - WorkOrderType
    - WorkOrderStatus
    - ScheduledDateTime
    - Priority
    - Summary
  relationships:
    - belongs_to: SERVICE_LOCATION
    - has_many: WORK_ORDER_ITEM
    - has_many: WORK_ORDER_ASSIGNMENT
```

### Supporting Entities (Modal/Expanded Views)

```yaml
Contact Information:
  entity: CONTACT
  fields: FirstName, LastName, PhoneNumber, EmailAddress, IsPrimaryContact

Service Agreements:
  entity: SERVICE_AGREEMENT
  fields: Description, StartDate, EndDate, Frequency, AgreementStatus

Work Order Details:
  entity: WORK_ORDER_ITEM
  fields: Description, Notes, Resolution, Status

Employee Assignments:
  entity: WORK_ORDER_ASSIGNMENT
  fields: EmployeeID, AssignedTime, AssignmentStatus
```

## 4. Three-Column Architecture

### Column Interaction Pattern

```
[Column 1: Accounts] → selection drives → [Column 2: Service Locations]
                                              ↓
                                          selection drives
                                              ↓
                                    [Column 3: Work Orders]
```

### How It Works:

- **Column 1**: List of accounts with super-efficient card view
  - Search and filtering capabilities
  - Quick limit/find accounts
  - Selection drives Columns 2 & 3
  - Shows 10-20 accounts initially, virtual scroll for more

- **Column 2**: Service Locations for selected account
  - All locations related to the account
  - Card format for quick scanning
  - Selection drives Column 3
  - Typical: 1-5 locations, Max: 100+ locations

- **Column 3**: Work Orders for selected service location
  - All work orders for the location
  - Card format for consistency
  - Full detail access on selection
  - Shows recent 10, load more on scroll

### The Card Experience Philosophy:

**"Everything happens based on the record the user selects. They see what they want, when they want, and nothing else."**

## 5. Success Criteria & User Story Mapping

### Feature-Level Success Criteria

**SC-1**: Users can find any information in <15 seconds

- → **US-007**: As a user, I can find any account information in <15 seconds
- → **US-008**: As a user, I can navigate from account to work order in 3 clicks

**SC-2**: Zero navigation to other screens for common tasks

- → **US-009**: As a user, I can view all account data without leaving Master View
- → **US-010**: As a user, I can complete common tasks within the three-column view

**SC-3**: Tech support calls reduce by 50%

- → **US-011**: As a support manager, I can quickly answer customer queries
- → **US-012**: As a user, I can self-serve information that previously required support

**SC-4**: Users say "I can't work without this"

- → **US-013**: As a user, I have all critical information visible at once
- → **US-014**: As a user, I can customize my Master View for my workflow

### Column-Specific Success Criteria

**Column 1 (Accounts) - SC-5**: Account selection and display

- → **US-005**: As a user, I can view and select from all accounts
- → **US-015**: As a user, I can search and filter accounts efficiently

**Column 2 (Service Locations) - SC-6**: Location information access

- → **US-006**: As a user, I can view all service locations for an account
- → **US-016**: As a user, I can see location details without additional clicks

**Column 3 (Work Orders) - SC-7**: Work order visibility

- → **US-017**: As a user, I can view all work orders for a location
- → **US-018**: As a user, I can see work order status at a glance

## 6. Information Architecture

### Account Card (Column 1)

**Visible on Card:**

- Account name (prominent)
- Account type badge
- Status indicator (color-coded)
- City, State
- Primary contact name (if available)

**Selected State Shows (Modal/Expanded):**

- Full billing address
- All contacts with communication preferences
- Service agreements summary
- Account financial data
- Account notes
- Total locations count
- Active work orders count

### Service Location Card (Column 2)

**Visible on Card:**

- Location name (prominent)
- Street address
- City, State ZIP
- Access info icon (if exists)
- Primary contact (if assigned)

**Selected State Shows (Modal/Expanded):**

- Full address details
- Access instructions
- GPS coordinates (if available)
- All location contacts
- Site-specific notes
- Active service agreements
- Work order history summary

### Work Order Card (Column 3)

**Visible on Card:**

- Work order type & number
- Status badge (color-coded)
- Priority indicator
- Scheduled date/time
- Assigned technician
- Summary (truncated)

**Selected State Shows (Modal/Expanded):**

- Complete work order details
- All work order items
- Materials used
- Internal and customer notes
- Assignment history
- Completion details
- Signatures (if collected)

## 7. User Workflows

### Primary Use Cases:

**Workflow 1: Customer Call**

```
As an Admin
When I receive a call asking "What's the status of my service?"
I want to search account → select location → view recent work orders
So that I can answer in <10 seconds (vs 2-3 minutes traditional)
```

**Workflow 2: Tech Support**

```
As an Operations Manager
When a technician calls asking "What am I supposed to do at this location?"
I want to find account → select location → see work order details
So that all context is visible immediately
```

**Workflow 3: Account Review**

```
As a Business Owner
When I need to review "Show me everything for ABC Company"
I want to select account → see all locations → review all activity
So that I have a complete picture without screen switching
```

## 8. Technical Specifications

### Performance Requirements

- Initial page load: <500ms
- Column data load: <300ms
- Card render: <50ms per card
- Selection response: <100ms
- Search response: <200ms
- Virtual scroll: 60fps smooth

### Data Volume Expectations

```yaml
Typical Scenario:
  accounts: 100-500 total, 20 visible
  locations_per_account: 1-5
  work_orders_per_location: 5-20 recent

High Volume Scenario:
  accounts: 5000+ total, paginated
  locations_per_account: 100+
  work_orders_per_location: 100+ historical

Edge Cases:
  no_locations: Show "No locations" message
  no_work_orders: Show "No work orders" message
  single_location: Auto-select it
```

### State Management Approach

```typescript
// React Context for Master View state
interface MasterViewState {
  selectedAccountId: string | null
  selectedLocationId: string | null
  selectedWorkOrderId: string | null
  filters: FilterState
  searchTerm: string
}

// Each column manages its own data fetching
useAccounts() // Column 1
useServiceLocations(accountId) // Column 2
useWorkOrders(locationId) // Column 3
```

### API Endpoints Required

```
GET /api/accounts?limit=20&offset=0&search=term
GET /api/accounts/:id/service-locations
GET /api/service-locations/:id/work-orders
GET /api/accounts/:id/contacts
GET /api/accounts/:id/service-agreements
GET /api/work-orders/:id/details
```

## 9. Acceptance Criteria

### Column 1 (Accounts) - US-005

```gherkin
GIVEN I am on the Master View
WHEN the page loads
THEN I see a list of account cards in column 1

GIVEN I see the account list
WHEN I click on an account card
THEN it becomes visually selected
AND column 2 updates with that account's locations
```

### Column 2 (Service Locations) - US-006

```gherkin
GIVEN I have selected an account
WHEN column 2 loads
THEN I see all service locations for that account

GIVEN I see service locations
WHEN I click on a location card
THEN it becomes visually selected
AND column 3 updates with that location's work orders

GIVEN an account has no locations
WHEN column 2 loads
THEN I see a "No service locations" message
AND column 3 shows empty state
```

### Column 3 (Work Orders) - US-017

```gherkin
GIVEN I have selected a service location
WHEN column 3 loads
THEN I see work orders sorted by scheduled date (recent first)

GIVEN I see work orders
WHEN I click on a work order card
THEN a modal opens with full work order details
```

## 10. Visual Design Specifications

### Layout Grid

```
|------ Column 1 ------|------ Column 2 ------|------ Column 3 ------|
|     30% width        |      35% width        |      35% width       |
| [Search/Filter Bar]  |  Selected Account:    | Selected Location:   |
|                      |  "ABC Company"        | "Main Office"        |
|  [Account Card 1]    |  [Location Card 1]    |  [Work Order 1]      |
|  [Account Card 2]    |  [Location Card 2]    |  [Work Order 2]      |
|  [Account Card 3]    |  [Location Card 3]    |  [Work Order 3]      |
|  [Account Card 4]    |  (selected)           |  [Work Order 4]      |
|  (selected)          |  [Location Card 4]    |  [Work Order 5]      |
|  [Account Card 5]    |                       |  [Load More...]      |
|  [Account Card 6]    |                       |                      |
```

### Card States

- **Default**: White background, gray border
- **Hover**: Light blue background, blue border
- **Selected**: Blue background, white text
- **Loading**: Skeleton placeholder animation
- **Error**: Red border with error message

## 11. Error Handling

### Network Errors

```typescript
// Each column handles its own errors independently
Column 1: "Unable to load accounts. [Retry]"
Column 2: "Unable to load locations. [Retry]"
Column 3: "Unable to load work orders. [Retry]"
```

### Empty States

```typescript
Column 1: "No accounts found. [Create Account]"
Column 2: "No locations for this account. [Add Location]"
Column 3: "No work orders for this location. [Create Work Order]"
```

### Permission Errors

```typescript
"You don't have permission to view this information. [Request Access]"
```

## 12. Technical Constraints & Considerations

### Performance Optimizations

- Virtual scrolling for lists >50 items
- Debounced search (300ms delay)
- Lazy load expanded details
- Cache selected account/location data
- Prefetch on hover (after 500ms)

### Browser Support

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Minimum resolution: 1280x720
- Not optimized for mobile (desktop-only as specified)

### Responsive Behavior

- **Full Desktop (>1400px)**: Three columns as designed
- **Small Desktop (1200-1400px)**: Columns compress, cards stack tighter
- **Tablet (768-1200px)**: Two columns visible, third slides over
- **Mobile (<768px)**: Not supported, show "Please use desktop" message

## 13. Dependencies

### Must Exist Before Building

1. BUSM entities implemented in database
2. Authentication/authorization system
3. Base UI component library
4. API infrastructure
5. State management setup

### Integration Points

- Supabase for data persistence
- NextAuth for authentication
- React Context for state
- SWR for data fetching
- Tailwind for styling

## 14. Risks & Mitigations

| Risk                                  | Impact | Mitigation                                 |
| ------------------------------------- | ------ | ------------------------------------------ |
| Large data volumes slow performance   | High   | Implement virtual scrolling and pagination |
| Users confused by three-column layout | Medium | Provide onboarding tour and help tooltips  |
| State synchronization issues          | Medium | Use single source of truth in Context      |
| Mobile users can't access             | Low    | Clear messaging about desktop requirement  |

## 15. Target Personas

### Primary Users

**Business Owners**

- Need high-level oversight of all operations
- Focus on account health and financial data
- Make strategic decisions from the Master View
- Typical session: 15-30 minutes reviewing multiple accounts

**Operations Managers**

- Coordinate service delivery across accounts
- Monitor work order completion and issues
- Support field technicians with information
- Typical session: Used continuously throughout the day

**Admins**

- Manage account data and relationships
- Handle customer service inquiries
- Maintain system data integrity
- Typical session: Quick 2-5 minute lookups frequently

### Excluded Users

**Field Technicians**: Will NOT have access to this desktop system. All technician access via mobile application. They are NOT part of our design criteria for the Accounts, Operations, or Administration modules.

## 16. Success Metrics

### Quantitative Metrics

- Time to find information: Track average, target <15 seconds
- Click depth: Track clicks per task, target <3
- Page performance: Track load times, target <500ms
- User adoption: Track daily active users, target 80% in month 1

### Qualitative Metrics

- User satisfaction: Survey score >4.5/5
- Support tickets: Reduce by 50% for account queries
- Feature requests: <10% request old navigation back
- User feedback: "Can't work without it" testimonials

## 17. Future Enhancements (Post-MVP)

1. **Customizable column widths** - User can drag to resize
2. **Saved filters** - Remember user's preferred views
3. **Bulk actions** - Select multiple cards for operations
4. **Export functionality** - Export visible data to CSV/PDF
5. **Keyboard navigation** - Arrow keys to navigate cards
6. **Recent items** - Quick access to recently viewed
7. **Favorites** - Pin frequently accessed accounts
8. **Column configurations** - Choose which columns to show

---

## Summary of v2 Improvements

**Added in v2:**

1. ✅ BUSM entity mapping with specific fields
2. ✅ Success criteria mapped to user stories
3. ✅ Technical specifications with performance requirements
4. ✅ Acceptance criteria in GIVEN/WHEN/THEN format
5. ✅ Data volume expectations and edge cases
6. ✅ Error handling specifications
7. ✅ Visual design layout grid
8. ✅ API endpoint definitions
9. ✅ State management approach
10. ✅ Dependencies and integration points
11. ✅ Risk assessment with mitigations
12. ✅ Quantifiable metrics

**What This Enables:**

- Clear traceability from vision to implementation
- Developers know exactly what to build
- Testers know exactly what to verify
- Product owners can measure success
- Factory processors can generate code from specifications

---

_This document now serves as a complete blueprint for implementing the Master View feature with full SDLC traceability._
