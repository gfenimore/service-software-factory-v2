# US-005: View Account Details On-Demand in Master View

## User Story

**As a** Business Owner, Operations Manager, or Admin  
**I want to** view extended account details on-demand when I need them  
**So that I can** access specific information without cluttering my at-a-glance view

## Background

The Master View's power is showing relationships at-a-glance across three columns. Users can survey "what have we done for them recently" without information overload. This story adds the OPTION to view details when specifically needed.

## Acceptance Criteria

### Display Requirements

- [ ] Selected account card shows "View Details" action button/icon
- [ ] Clicking "View Details" opens account detail panel
- [ ] Detail panel shows information not on the card:
  - Full billing address (street, city, state, zip)
  - Account type (Commercial/Residential)
  - Service location count
  - Created date
  - Last updated date
  - Account notes/special instructions
- [ ] Detail panel has clear close button (X)
- [ ] Only one detail panel can be open at a time

### Interaction Requirements

- [ ] Selecting an account does NOT auto-open details
- [ ] Column 2 updates immediately on account selection
- [ ] Detail panel opens only on explicit "View Details" click
- [ ] ESC key closes open detail panel
- [ ] Clicking outside panel closes it
- [ ] Selecting different account closes current detail panel

### At-a-Glance Preservation

- [ ] Three columns remain fully visible when account selected
- [ ] No automatic panels that block the survey view
- [ ] User controls when they want more information
- [ ] Quick account switching without detail panel interference

### Data Requirements

- [ ] All data loads from existing Supabase accounts table
- [ ] No additional API calls needed (data in initial load)
- [ ] Handle null/empty fields gracefully

## Out of Scope

- Editing account details (read-only for now)
- Contact information (separate story)
- Service agreements (separate story)
- Financial data (separate story)
- Column 2/3 interactions

## Test Scenarios

### Happy Path

1. User clicks account card → details expand below
2. User clicks different account → details switch
3. User clicks selected account → details collapse

### Edge Cases

1. Account with minimal data → shows "Not specified" for empty fields
2. Account with very long notes → scrollable within detail area
3. Rapid clicking between accounts → smooth transitions, no flashing

## Technical Notes

- Reuse existing account data from Column 1
- Client-side state management only
- No new API endpoints required
- Follow existing card selection patterns

## Success Metrics

- Selection response time < 100ms
- All three personas can access needed information
- Zero navigation to other screens

## Estimated Effort

- Planning: 30 minutes
- Implementation: 2-3 hours
- Testing: 1 hour
- **Total: 4-5 hours**
