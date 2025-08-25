# User Story US-111-002: Service Locations Column

**Story ID**: US-111-002  
**Sub-Module**: 1.1.1 Master View  
**Original ID**: US-006  
**Priority**: High  
**Status**: Ready for Development  

## Story Description
As a service technician/dispatcher, I want to view and interact with service locations for a selected account so that I can quickly identify specific locations and access their associated work orders.

## Acceptance Criteria

### Core Functionality
- [ ] Display service locations for the currently selected account
- [ ] Show service status indicators with clear visual distinction
- [ ] Display next service date prominently for each location
- [ ] Enable click-to-select functionality that loads related work orders in adjacent column
- [ ] Support keyboard navigation (arrow keys, Tab, Enter) for accessibility

### Location Information Display
- [ ] Show location name/address clearly
- [ ] Display service status with appropriate icons (📍 per mockup)
- [ ] Show next scheduled service date in readable format
- [ ] Include visual indicators for urgent/overdue services
- [ ] Display location-specific service type information

### Interaction and Navigation
- [ ] Respond to account selection from accounts column
- [ ] Clear previous locations when new account selected
- [ ] Support multi-select with Shift/Ctrl for bulk operations
- [ ] Right-click context menus for quick actions
- [ ] Real-time filtering within displayed locations

### Visual Requirements (from ASCII mockup)
- [ ] Column header clearly labeled "Locations"
- [ ] Location entries with consistent visual format
- [ ] Location icon (📍) for visual consistency
- [ ] Clean integration with three-column layout

### Performance Requirements
- [ ] Column updates < 200ms when account selection changes
- [ ] Display 3-5 locations per account on average
- [ ] Handle maximum 100 locations per account
- [ ] Smooth scrolling at 60 fps

### Validation Criteria (Concept Line)
- [ ] Users can navigate to any work order in < 3 clicks (account → location → work order)
- [ ] Column relationships are intuitive when location is selected
- [ ] Performance is acceptable with mock data (200 locations total)

## Technical Specifications

### Data Requirements
```yaml
Locations:
  avgPerAccount: 3-5
  maxPerAccount: 100
  fields:
    - id
    - accountId
    - name
    - address
    - serviceStatus
    - nextServiceDate
    - serviceType
    - workOrderCount
```

### Interface Contract
**Events Provided:**
- `location:selected` - Emitted when user selects a location
  - Payload: `LocationSelectionEvent`
  - Triggers work orders column population

**Events Consumed:**
- `account:selected` - Triggers location data load and display
- `detail-view:closed` - Handled by `RefreshDataHandler`

**State Exposed:**
```typescript
selectedLocation: Location | null
visibleData.locations: Location[]
```

### API Dependencies
- Location API (GET /locations)
- Filter by accountId
- Include service scheduling information

### Business Logic
- Show locations only when account is selected
- Clear selection when different account chosen
- Maintain location selection state during session

## Development Notes

### Concept Line Implementation (Current)
- Simple HTML/CSS layout
- Mock data (200 locations across accounts)
- Console.log for all interactions
- Any types everywhere
- No error handling
- Inline styles

### Progressive Enhancement
- **Prototype Line**: React components with React Query for caching
- **Production Line**: Optimistic updates, offline support

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Validation criteria passed with user testing
- [ ] Location selection triggers work orders column population
- [ ] Performance targets achieved
- [ ] Responds correctly to account selection events
- [ ] Code review completed
- [ ] Integration with event bus functional

## Integration Points
- **With Accounts Column (US-111-001)**: Receives account selection to filter locations
- **With Work Orders Column (US-111-003)**: Location selection populates work orders
- **With Detail View (1.1.2)**: Location selection events flow to detail view

## Edge Cases and Considerations
- Account with no locations (display appropriate message)
- Account with 100+ locations (implement lazy loading)
- Locations with overdue service dates (highlight visually)
- Rapid account switching (debounce/cancel previous requests)

## Notes
- Part of THE most critical UI component
- Must maintain context while switching between accounts
- Service date information is crucial for planning
- Performance is non-negotiable for user experience