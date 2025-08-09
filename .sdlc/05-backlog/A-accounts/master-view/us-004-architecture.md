# Technical Design: US-004 - Three-Column Layout Foundation

## Overview

This design establishes the foundational three-column master view layout using CSS Grid with fixed column widths and responsive scrolling behavior. The architecture prioritizes simplicity and progressive enhancement for subsequent account data display.

## Value Slice Context

- **Slice**: Value Slice 1 - Three-Column Layout Foundation
- **User Value**: "See a properly structured three-column layout ready for account cards"
- **Tasks**: T-001, T-002, T-003, T-004
- **Estimated Time**: 2 hours

## Reality Check Summary

| Check                  | Status | Command                            | Fallback            |
| ---------------------- | ------ | ---------------------------------- | ------------------- |
| Session state exists   | ✅     | `cat ./session-state.json`         | Initialize manually |
| Next.js app renders    | ❓     | `npm run dev`                      | Check Node version  |
| TypeScript compiles    | ❓     | `npm run type-check`               | Fix config issues   |
| CSS Grid support       | ✅     | Modern browsers only               | Flexbox fallback    |

## Business Rules for This Slice

### Rules Being Implemented

| Business Rule            | Implementation Strategy | Validation Method |
| ------------------------ | ----------------------- | ----------------- |
| Three-column layout with fixed widths (300px, 400px, flexible) | CSS Grid with explicit column definitions | Visual inspection in browser |
| Responsive scroll within column | CSS overflow-y: auto on column containers | Test with overflow content |

### Rules Deferred to Later Slices

| Business Rule            | Target Slice | Reason for Deferral |
| ------------------------ | ------------ | ------------------- |
| Account cards display    | Slice 2      | Need layout foundation first |
| Account selection state  | Slice 3      | Need cards first |

## Component Architecture

### Component 1: MasterViewLayout (T-001)

```typescript
interface MasterViewLayoutProps {
  children: React.ReactNode
  className?: string
}

interface LayoutGridAreas {
  columnOne: React.ReactNode
  columnTwo: React.ReactNode
  columnThree: React.ReactNode
}
```

**Purpose**: Establishes the CSS Grid foundation for the three-column master view
**Proof of Life**: `<div className="master-view-grid">Layout Works!</div>`
**Verify Command**: `npm run dev && curl localhost:3000 | grep "master-view"`
**Quality Gates**:

- Renders without error
- Props validated with TypeScript
- Accessibility: Grid structure announced to screen readers
- Performance: < 16ms render time

### Component 2: ColumnContainer (T-002)

```typescript
interface ColumnContainerProps {
  children: React.ReactNode
  width: 'fixed-300' | 'fixed-400' | 'flexible'
  header?: React.ReactNode
  className?: string
}
```

**Purpose**: Provides reusable container with scrolling behavior for column content
**Proof of Life**: `<div className="column-container">Container Works!</div>`
**Verify Command**: `npm test -- --watchAll=false ColumnContainer`
**Quality Gates**:

- Handles overflow with proper scrolling
- Consistent padding across all instances
- TypeScript type safety for width variants
- Accessibility: Proper focus management for scrollable content

### Component 3: AccountsColumnHeader (T-003)

```typescript
interface AccountsColumnHeaderProps {
  accountCount: number
  isLoading?: boolean
  className?: string
}
```

**Purpose**: Displays "Accounts (X)" header with dynamic count for column 1
**Proof of Life**: `<h2>Accounts (0)</h2>`
**Verify Command**: `npm run dev && check "Accounts (0)" displays in column 1`
**Quality Gates**:

- Count updates reactively
- Loading state handled gracefully
- Proper semantic heading structure
- Consistent with design system typography

### Component 4: Integration Point (T-004)

```typescript
// src/app/page.tsx integration
interface PageLayoutIntegration {
  masterView: MasterViewLayout
  columnOne: ColumnContainer & AccountsColumnHeader
  columnTwo: ColumnContainer // placeholder
  columnThree: ColumnContainer // placeholder
}
```

**Purpose**: Integrates all layout components into main page for complete structure
**Proof of Life**: Full three-column layout renders
**Verify Command**: `npm run dev && verify complete three-column layout renders`
**Quality Gates**:

- All components render without TypeScript errors
- Layout adapts to viewport changes
- No console errors or warnings
- Proper component composition hierarchy

## State Management

### Slice-Specific State

```typescript
interface LayoutState {
  // No state needed for this slice - pure presentation
  // Layout is static with fixed column widths
}
```

### State Not Needed Yet

- Account selection state (Slice 3)
- Account data loading state (Slice 2)
- Column 2 and 3 content state (Future stories)

## Integration Points

### What Connects in This Slice

```typescript
// Exact integration for current tasks
app/page.tsx --> MasterViewLayout --> [ColumnContainer, ColumnContainer, ColumnContainer]
                                           |
                                      AccountsColumnHeader
```

### What Stays Disconnected

- Account data fetching (Slice 2)
- Account card components (Slice 2)
- Selection state management (Slice 3)

## Progressive Enhancement Plan

### This Slice Delivers (Now)

1. Visual three-column structure with correct proportions
2. Scrollable column containers ready for content
3. Accounts header placeholder with count display

### Next Slice Will Add (Future)

1. Account data fetching and display
2. Account card components
3. Loading and error states

### Full Feature (Eventually)

1. Complete interactive account selection with visual feedback

## Error Prevention Strategy

### Errors This Slice Prevents

- **Layout Breaking**: CSS Grid provides robust layout that won't break with content changes
- **TypeScript Errors**: Strict interfaces prevent prop mismatches
- **Accessibility Issues**: Semantic structure built from the start

### Errors Accepted for Now

- **Content Overflow**: Will address when real content is added in Slice 2
- **Mobile Responsiveness**: Fixed widths may not work on small screens (acceptable for desktop-first MVP)
- **Browser Compatibility**: CSS Grid not supported in IE11 (acceptable for modern browsers)

## Testing Strategy for Slice

### Proof of Life Tests (Minimum)

```typescript
test('MasterViewLayout renders', () => {
  render(<MasterViewLayout><div>test</div></MasterViewLayout>)
  expect(screen.getByText('test')).toBeInTheDocument()
})

test('ColumnContainer handles children', () => {
  render(<ColumnContainer width="fixed-300"><div>content</div></ColumnContainer>)
  expect(screen.getByText('content')).toBeInTheDocument()
})

test('AccountsColumnHeader displays count', () => {
  render(<AccountsColumnHeader accountCount={5} />)
  expect(screen.getByText('Accounts (5)')).toBeInTheDocument()
})
```

### Integration Tests (This Slice)

```typescript
test('Complete layout structure renders', () => {
  render(<App />)
  // Verify three-column structure is present
  // Check column widths are correct
  // Ensure no layout errors
})
```

### Deferred Tests (Future Slices)

- Account data loading tests
- Selection interaction tests
- Complex state management scenarios

## Implementation Sequence

### Recommended Task Order

1. **T-001**: MasterViewLayout - Establishes CSS Grid foundation
2. **T-002**: ColumnContainer - Provides reusable scrolling containers
3. **T-003**: AccountsColumnHeader - Adds semantic structure to column 1
4. **T-004**: Integration - Connects everything in main page

### Parallel Opportunities

- T-002 and T-003 can be developed simultaneously after T-001 is complete

### Dependencies and Blockers

- CSS Grid browser support (modern browsers only)
- Next.js app structure must be functional

## Known Limitations (Acceptable)

### This Slice Does NOT

- **Display Account Data**: Coming in Slice 2
- **Handle Selection**: Coming in Slice 3
- **Mobile Optimization**: After desktop functionality proven

### Technical Debt (Intentional)

- **Fixed Column Widths**: Hardcoded 300px/400px acceptable for MVP, make responsive later
- **CSS-in-JS vs CSS Modules**: Using whatever is already established in project
- **Component Granularity**: May need to split components further when adding functionality

## CSS Grid Implementation Details

### Grid Structure

```css
.master-view-layout {
  display: grid;
  grid-template-columns: 300px 400px 1fr;
  grid-template-rows: 100vh;
  gap: 0;
  overflow: hidden;
}

.column-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100vh;
  padding: 1rem;
}
```

### Responsive Considerations

```css
/* Future enhancement - not implemented in this slice */
@media (max-width: 1024px) {
  .master-view-layout {
    grid-template-columns: 250px 350px 1fr;
  }
}
```

## Success Criteria for Slice

### Slice is DONE When

- [ ] User can see three distinct columns with correct widths
- [ ] Column 1 shows "Accounts (0)" header
- [ ] All columns are scrollable when content overflows
- [ ] Layout adapts to viewport height changes
- [ ] No TypeScript compilation errors
- [ ] All components render without console errors

### Slice is NOT Done Until

- [ ] Visual layout matches wireframe specifications
- [ ] Component integration verified in main page
- [ ] Basic responsive behavior confirmed
- [ ] Foundation ready for account data in Slice 2

## File Structure Created

```
src/
├── components/
│   └── master-view/
│       ├── MasterViewLayout.tsx
│       └── ColumnContainer.tsx
├── components/
│   └── accounts/
│       └── AccountsColumnHeader.tsx
└── app/
    └── page.tsx (updated)
```

## Next Slice Preparation

The layout foundation enables Slice 2 to:
- Add account data fetching hooks
- Create AccountCard components
- Implement AccountsList component
- Connect real data to the header count

## Quality Gate: PASSED ✅

**Ready for DEVELOPER agent**

### Next Invocation:

```
@developer implement-task US-004 T-001

Start with MasterViewLayout because it establishes the CSS Grid foundation that all other components depend on.
```

### Slice Complexity Assessment:
- Components: 3 (Budget: 10)
- Interfaces: 4 (Budget: 20)  
- Integration points: 1
- Risk level: Low
- Confidence: 85%

The architecture focuses exclusively on layout structure without over-engineering for future features, providing a solid foundation for progressive enhancement in subsequent slices.
