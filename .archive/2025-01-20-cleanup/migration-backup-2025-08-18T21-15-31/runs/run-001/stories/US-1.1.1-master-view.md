# User Story: 1.1.1 Master View
**Generated From**: Existing concept implementation  
**Line**: Retroactive story generation  
**Status**: Implemented in concept

## Story
AS A pest control office manager  
I WANT a three-column browser interface  
SO THAT I can quickly navigate between accounts, locations, and work orders  

## Acceptance Criteria
- [x] Display all accounts in the first column
- [x] When I select an account, show its locations in the second column
- [x] When I select a location, show its work orders in the third column
- [x] Each column should have search functionality
- [x] My selections should persist when I refresh the page
- [x] I should see visual feedback for selected items
- [x] I should be able to navigate to any work order in 3 clicks or less

## Technical Implementation (From Concept)

### Features Implemented:
1. **Three-Column Layout**
   - Accounts column with type badges (Commercial/Residential/Industrial)
   - Locations column with next service dates
   - Work orders column with status indicators

2. **Search Functionality**
   - Real-time filtering on all columns
   - Case-insensitive search
   - Searches names and types

3. **State Management**
   - Session storage for persistence
   - Visual state inspector showing current selections
   - Event counter for debugging

4. **Event System**
   - Emits: `account:selected`, `location:selected`, `workOrder:selected`
   - Listens: `detail-view:closed`, `workOrder:updated`

5. **Mock Data**
   - 10 pest control accounts with fun names
   - 30+ locations across all accounts
   - Sample work orders with various statuses

## Prototype Requirements

### Must Convert:
- [ ] Replace `any` types with proper TypeScript interfaces
- [ ] Extract inline styles to CSS modules
- [ ] Split monolithic HTML into components
- [ ] Add error boundaries for failed data loads
- [ ] Add loading states while fetching
- [ ] Create unit tests for 60% coverage

### Must Preserve:
- [x] Three-column navigation flow
- [x] Search functionality
- [x] State persistence
- [x] Event communication pattern
- [x] Visual selection feedback

## Production Requirements

### Must Add:
- [ ] Input sanitization for search
- [ ] Virtualization for large lists (1000+ items)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Performance monitoring
- [ ] Error tracking (Sentry or similar)
- [ ] API integration (replace mocks)
- [ ] 80% test coverage

### Performance Targets:
- Initial load: < 2 seconds
- Search response: < 100ms
- Column updates: < 200ms
- Support 10,000+ accounts

## Definition of Done

### Concept ✅
- [x] Basic functionality works
- [x] User can navigate efficiently
- [x] Mock data demonstrates use cases

### Prototype (Pending)
- [ ] TypeScript strict mode passes
- [ ] 60% test coverage
- [ ] Components are reusable
- [ ] Error handling in place

### Production (Pending)
- [ ] Meets all performance targets
- [ ] Security review passed
- [ ] Accessibility audit passed
- [ ] Deployed to Vercel
- [ ] Monitoring active