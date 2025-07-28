# US-002: View and Manage Accounts Dashboard

## User Story

**As a** service company user  
**I want to** view and search my customer accounts  
**So that I can** quickly find customer information and manage my business

## Background

The company manages pest control services for commercial and residential customers across Florida. Users need a central dashboard to view all accounts, search for specific customers, and see key information at a glance.

## Acceptance Criteria

### Display Requirements

- [ ] Display accounts in a table format with the following columns:
  - Account Name
  - Type (Commercial/Residential)
  - Status (Active/Inactive)
  - City
  - Number of Contacts
  - Created Date
- [ ] Show 20 accounts per page by default
- [ ] Display total number of accounts
- [ ] Responsive design that works on mobile devices

### Search & Filter Capabilities

- [ ] Search box to filter accounts by name (searches as you type)
- [ ] Dropdown filter for Status (All/Active/Inactive)
- [ ] Dropdown filter for Type (All/Commercial/Residential)
- [ ] Clear filters button to reset all filters
- [ ] Filters persist in URL for shareable links

### Pagination

- [ ] Previous/Next navigation buttons
- [ ] Display current page information (e.g., "1-20 of 45")
- [ ] Disable Previous on first page, Next on last page
- [ ] Page size selector (10, 20, 50 per page)

### User Experience

- [ ] Loading skeleton while fetching data
- [ ] Empty state when no accounts match filters
- [ ] Error message if data fetch fails
- [ ] Smooth transitions between states
- [ ] No layout shift when data loads

### Technical Requirements

- [ ] Use Next.js App Router
- [ ] Server-side data fetching for initial load
- [ ] Client-side filtering for responsive UX
- [ ] Proper TypeScript types throughout
- [ ] Accessible (WCAG 2.1 AA compliant)

## Out of Scope

- Creating new accounts (separate story)
- Editing accounts inline (separate story)
- Account detail view (separate story)
- Bulk operations (future enhancement)
- Export functionality (future enhancement)

## Test Scenarios

### Happy Path

1. User loads dashboard → sees all accounts
2. User searches "ABC" → sees filtered results instantly
3. User selects "Active" filter → sees only active accounts
4. User clicks Next → sees page 2 of results

### Edge Cases

1. No accounts match search → friendly empty state
2. API fails → error message with retry option
3. Very long account names → proper truncation
4. 1000+ accounts → pagination performs well

## Success Metrics

- Page loads in < 2 seconds
- Search responds in < 300ms
- Zero console errors
- Lighthouse score > 90
- Works on latest Chrome, Firefox, Safari, Edge

## Design Notes

- Use existing Tailwind classes
- Consistent with Next.js starter styling
- Professional but clean appearance
- Focus on readability and usability

## Dependencies

- Accounts API endpoints (complete)
- TypeScript types (complete)
- Seed data in database (complete)

## Estimated Effort

- Planning: 30 minutes
- Implementation: 2 hours
- Testing: 30 minutes
- Review & Deploy: 30 minutes
- **Total: 3.5 hours**
