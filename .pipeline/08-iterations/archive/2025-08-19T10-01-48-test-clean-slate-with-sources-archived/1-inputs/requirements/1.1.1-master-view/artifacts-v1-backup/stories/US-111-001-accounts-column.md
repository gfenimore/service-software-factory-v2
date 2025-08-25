# User Story US-111-001: Accounts Column

**Story ID**: US-111-001  
**Sub-Module**: 1.1.1 Master View  
**Original ID**: US-004  
**Priority**: High  
**Status**: Ready for Development  

## Story Description
As a service technician/dispatcher, I want to view and interact with a comprehensive accounts column in the Master View so that I can quickly identify and select accounts to access their service locations and work orders.

## Acceptance Criteria

### Core Functionality
- [ ] Display all accounts in a scrollable column format
- [ ] Show account type indicators (C/R/I) for Commercial/Residential/Industrial
- [ ] Display visual status indicators (active/inactive) with clear visual distinction
- [ ] Enable click-to-select functionality that loads related locations in adjacent column
- [ ] Support keyboard navigation (arrow keys, Tab, Enter) for accessibility

### Search and Filter
- [ ] Implement real-time search functionality per the interaction model
- [ ] Support filtering by account type, status, and other relevant criteria
- [ ] Display search results with highlighted matching text
- [ ] Clear search/filter options easily accessible

### Visual Requirements (from ASCII mockup)
- [ ] Column header clearly labeled "Accounts"
- [ ] Account entries displayed with expandable indicator (▶)
- [ ] Clean, scannable layout matching the three-column design
- [ ] Consistent visual hierarchy with other columns

### Performance Requirements
- [ ] Initial render of accounts column < 1 second
- [ ] Search response time < 100ms
- [ ] Support lazy loading with threshold of 100 accounts
- [ ] Handle minimum 50 accounts, maximum 1000 accounts smoothly

### Validation Criteria (Concept Line)
- [ ] Users can navigate to any work order in < 3 clicks (starting from account selection)
- [ ] Column relationships are intuitive when account is selected
- [ ] Performance is acceptable with mock data (50 accounts minimum)

## Technical Specifications

### Data Requirements
```yaml
Accounts:
  minLoadCount: 50
  maxDisplayCount: 1000
  lazyLoadThreshold: 100
  fields:
    - id
    - name
    - type (C/R/I)
    - status (active/inactive)
    - locationCount
```

### Interface Contract
**Events Provided:**
- `account:selected` - Emitted when user selects an account
  - Payload: `AccountSelectionEvent`
  - Triggers location column population

**Events Consumed:**
- `account:created` - Handled by `AddToListHandler`
- `detail-view:closed` - Handled by `RefreshDataHandler`

**State Exposed:**
```typescript
selectedAccount: Account | null
visibleData.accounts: Account[]
```

### API Dependencies
- Account API (GET /accounts)
- Support for filtering and pagination

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile responsive (tablet+)

## Development Notes

### Concept Line Implementation (Current)
- Simple HTML/CSS layout
- Mock data (50 accounts minimum)
- Console.log for all interactions
- Any types everywhere
- No error handling
- Inline styles

### Progressive Enhancement
- **Prototype Line**: React components with TypeScript, real API connections
- **Production Line**: Full accessibility (WCAG 2.1), virtualization for large lists

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Validation criteria passed with user testing
- [ ] Account selection triggers location column population
- [ ] Performance targets achieved
- [ ] Code review completed
- [ ] Integration with event bus functional

## Integration Points
- **With Service Locations Column (US-111-002)**: Account selection populates locations
- **With Detail View (1.1.2)**: Account selection events flow to detail view
- **With Work Order Management (1.2.1)**: Provides account context for filtering

## Notes
- This is part of THE most critical UI component
- Gets majority of user interactions (80% per spec)
- Must be intuitive without training
- Performance is non-negotiable