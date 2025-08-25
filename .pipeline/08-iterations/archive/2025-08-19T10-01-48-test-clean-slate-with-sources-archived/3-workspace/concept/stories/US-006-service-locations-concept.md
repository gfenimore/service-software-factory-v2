# US-006: Service Locations Management (Concept Line)

## Story Type
**Line**: Concept  
**Focus**: Business workflow validation with mocks  
**Skip**: All technical implementation details

## User Story
As a **Service Coordinator**, I want to **view and manage service locations** so that I can **track where services are being delivered and coordinate technician assignments**.

## Business Context
The Master View Enhancement requires a dedicated component for managing service locations. This is the concept validation phase focusing on UX and business logic only.

## Acceptance Criteria (Concept Mode)

### Mock Data Display
- **I can** see a list of all service locations with mock data
- **I can** view location details including name, address, and status
- **I can** see which accounts are associated with each location
- **I can** identify active vs inactive locations visually

### Basic Interactions
- **I can** click on a location to see more details
- **I can** toggle between list and card views
- **I can** use a search box to filter locations (client-side only)
- **I can** open a form to add/edit locations (no save needed)

### Visual Validation
- **I can** see the component styled consistently with the app
- **I can** understand the information hierarchy at a glance
- **I can** access all features with keyboard navigation
- **I can** see loading and empty states

## Mock Data Requirements

```javascript
// Simple mock structure - no types needed!
const MOCK_LOCATIONS = [
  {
    id: 1,
    name: "Downtown Service Center",
    address: "123 Main St, Springfield, IL 62701",
    status: "active",
    accountName: "Springfield Municipal",
    contactCount: 3,
    lastService: "2 days ago",
    upcomingJobs: 5
  },
  {
    id: 2,
    name: "North Side Facility",
    address: "456 Oak Ave, Springfield, IL 62702",
    status: "active",
    accountName: "Regional Hospital",
    contactCount: 7,
    lastService: "Today",
    upcomingJobs: 12
  },
  {
    id: 3,
    name: "Old Warehouse",
    address: "789 Industrial Blvd, Springfield, IL 62703",
    status: "inactive",
    accountName: "ABC Manufacturing",
    contactCount: 1,
    lastService: "6 months ago",
    upcomingJobs: 0
  }
  // Add 5-10 more for realistic scrolling
];
```

## UI Components (Concept Only)

### ServiceLocationsList
- Display all locations using mock data
- Allow console.log for debugging
- Use any types - no restrictions
- Inline styles or basic CSS fine

### ServiceLocationCard  
- Show individual location details
- Status badge (active = green, inactive = gray)
- Click handler for selection
- No error handling needed

### ServiceLocationForm
- Basic form fields
- No validation required
- Just update local state
- Cancel/Save buttons (no-op for save)

## Concept Line Constraints

### ALLOWED ✅
- `any` types everywhere
- `console.log` for debugging
- Hardcoded mock data
- Inline styles
- Direct DOM manipulation if needed
- Copy-paste code
- Quick and dirty solutions

### SKIP ❌
- TypeScript strict mode
- API connections
- Database schemas
- Error handling
- Loading states from real data
- Authentication/Authorization
- Performance optimization
- Unit tests
- Accessibility beyond basics

## Success Criteria (Concept)

1. **Visual Validation**: Can show to stakeholders within 2 hours
2. **Interaction Demo**: All user flows work with mock data
3. **Feedback Ready**: Clear enough to gather requirements
4. **No Technical Debt**: This is throwaway validation code

## Output Locations

- Story: `.pipeline/concept/stories/US-006-service-locations-concept.md`
- Tasks: `.pipeline/concept/tasks/US-006-tasks.md`
- Components: `src/concept/components/ServiceLocations.tsx`
- Mock Data: `src/concept/data/mockLocations.js`

## Next Phase Hint

When this concept is validated, we'll promote to prototype line where we'll add:
- TypeScript types
- Real API connections  
- Proper state management
- Error handling
- Test coverage

But for now - **just make it work with mocks!**