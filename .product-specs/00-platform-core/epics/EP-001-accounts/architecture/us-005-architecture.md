# Technical Design: US-005 - Value Slice 1: Basic Details Panel

## Overview

This slice introduces an on-demand account details panel to the Master View, enabling users to access extended account information without compromising the three-column survey capability. The architecture focuses on a composable panel component with controlled state management that integrates seamlessly into the existing account selection workflow.

## Value Slice Context

- **Slice**: Value Slice 1 - Basic Details Panel
- **User Value**: "Click 'View Details' on any account card and see extended account information in a panel"
- **Tasks**: T-001, T-002, T-003, T-004
- **Estimated Time**: 2 hours

## Reality Check Summary

| Check                          | Status | Command                                 | Fallback            |
| ------------------------------ | ------ | --------------------------------------- | ------------------- |
| Session state exists           | ❓     | `cat ./session-state.json`              | Initialize manually |
| Database connected             | ❓     | `npm run check:db`                      | Use mock data       |
| Account data available         | ❓     | `curl localhost:3000/api/accounts`      | Static test data    |
| React renders                  | ❓     | `npm run dev`                           | Check Node version  |
| Existing AccountCard component | ❓     | `find src -name "*AccountCard*"`        | Create from scratch |
| Master view layout working     | ❓     | `npm run dev && visit /accounts/master` | Fix navigation      |

## Business Rules for This Slice

### Rules Being Implemented

| Business Rule                                      | Implementation Strategy                         | Validation Method            |
| -------------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| Selected account card shows "View Details" action  | Add button to AccountCard component             | Visual inspection in browser |
| Clicking "View Details" opens account detail panel | State management hook triggers panel visibility | Click test in browser        |
| Detail panel has clear close button (X)            | Dedicated close button in panel header          | Manual interaction test      |
| Only one detail panel can be open at a time        | Centralized state in useAccountDetails hook     | Multi-account click test     |

### Rules Deferred to Later Slices

| Business Rule                     | Target Slice | Reason for Deferral          |
| --------------------------------- | ------------ | ---------------------------- |
| ESC key closes open detail panel  | Slice 2      | Keyboard handling complexity |
| Clicking outside panel closes it  | Slice 2      | Event boundary management    |
| Panel shows complete account data | Slice 3      | Data formatting complexity   |

## Component Architecture

### Component 1: AccountDetailsPanel (T-001)

```typescript
interface AccountDetailsPanelProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
}

interface Account {
  id: string
  company_name: string
  // Minimal props for this slice only
  [key: string]: any
}
```

**Purpose**: Provides the foundational container for displaying account details with close functionality
**Proof of Life**: `<div data-testid="details-panel">Panel Works!</div>`
**Verify Command**: `npm run dev && curl localhost:3000 | grep "details-panel"`
**Quality Gates**:

- Renders without error
- Props validated with TypeScript
- Accessibility: WCAG AA (basic semantic HTML)
- Performance: < 50ms render time

### Component 2: AccountCard Enhancement (T-002)

```typescript
interface AccountCardProps extends ExistingProps {
  onViewDetails?: () => void
}
```

**Purpose**: Adds "View Details" trigger to existing account card without disrupting selection behavior
**Proof of Life**: `<button onClick={onViewDetails}>View Details</button>`
**Verify Command**: `npm run dev && inspect account cards for "View Details" button`
**Quality Gates**:

- Button appears on all account cards
- Existing card functionality preserved
- Accessibility: Button has aria-label
- Performance: No impact on card render time

### Component 3: useAccountDetails Hook (T-003)

```typescript
interface UseAccountDetailsReturn {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
  openDetailsFor: (account: Account) => void
  closeDetails: () => void
}
```

**Purpose**: Centralizes panel state management and enforces single-panel business rule
**Proof of Life**: `console.log('Hook initialized', state)`
**Verify Command**: `npm test -- --watchAll=false --testNamePattern="account details state"`
**Quality Gates**:

- State updates trigger re-renders
- Single panel enforcement works
- Accessibility: State changes announced
- Performance: No unnecessary re-renders

### Component 4: Master View Integration (T-004)

```typescript
// Integration point in AccountMasterView
interface MasterViewState {
  detailsState: UseAccountDetailsReturn
  // existing state...
}
```

**Purpose**: Connects panel display to account selection flow within three-column layout
**Proof of Life**: `Click "View Details" → Panel opens with account data`
**Verify Command**: `npm run dev && click "View Details" on account card to verify panel opens`
**Quality Gates**:

- Panel opens for correct account
- Three-column layout preserved
- Accessibility: Focus management on open/close
- Performance: < 100ms selection response time

## State Management

### Slice-Specific State

```typescript
interface AccountDetailsState {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
}

// Local state only - no global state needed for this slice
```

### State Not Needed Yet

- Keyboard event handling (Slice 2)
- Click-outside detection (Slice 2)
- Panel scroll position (Slice 3)
- Form validation state (not in any slice - read-only)

## Integration Points

### What Connects in This Slice

```typescript
// Exact integration for current tasks
AccountMasterView --> useAccountDetails --> AccountDetailsPanel
AccountCard --> onViewDetails() --> useAccountDetails.openDetailsFor()
AccountDetailsPanel --> onClose() --> useAccountDetails.closeDetails()
```

### What Stays Disconnected

- ESC key handlers (Slice 2)
- Document click listeners (Slice 2)
- Detailed data formatting (Slice 3)

## Progressive Enhancement Plan

### This Slice Delivers (Now)

1. Users can click "View Details" on any account card
2. Panel opens showing basic account information
3. Panel can be closed with X button
4. Only one panel opens at a time

### Next Slice Will Add (Future)

1. ESC key closes panel
2. Click outside closes panel
3. Smooth panel transitions

### Full Feature (Eventually)

1. Complete account data display with formatting
2. Responsive layout optimization
3. Scrolling for long content

## Error Prevention Strategy

### Errors This Slice Prevents

- **Multiple panels open**: Centralized state management enforces single panel
- **Panel render failures**: Null checks and safe prop passing
- **State sync issues**: Single source of truth in useAccountDetails hook
- **Layout breaks**: Panel positioned to preserve three-column view

### Errors Accepted for Now

- **Basic styling**: Will improve in Slice 3
- **Missing data handling**: Shows raw data, will format in Slice 3
- **Keyboard accessibility**: ESC handling in Slice 2

## Testing Strategy for Slice

### Proof of Life Tests (Minimum)

```typescript
test('AccountDetailsPanel renders', () => {
  render(<AccountDetailsPanel account={null} isOpen={false} onClose={jest.fn()} />)
  expect(screen.getByTestId('details-panel')).toBeInTheDocument()
})

test('useAccountDetails hook initializes', () => {
  const { result } = renderHook(() => useAccountDetails())
  expect(result.current.isDetailsOpen).toBe(false)
})
```

### Integration Tests (This Slice)

```typescript
test('clicking View Details opens panel', () => {
  render(<AccountMasterView />)
  fireEvent.click(screen.getByText('View Details'))
  expect(screen.getByTestId('details-panel')).toBeVisible()
})

test('single panel enforcement', () => {
  // Test that opening details for new account closes previous
})
```

### Deferred Tests (Future Slices)

- ESC key handling tests (Slice 2)
- Click outside behavior tests (Slice 2)
- Complete data display tests (Slice 3)

## Implementation Sequence

### Recommended Task Order

1. **T-001**: Foundation first - create panel shell with close button
2. **T-002**: Add trigger - View Details button on cards
3. **T-003**: State management - hook for open/close logic
4. **T-004**: Integration - connect all pieces in master view

### Parallel Opportunities

- T-001 and T-002 can be developed simultaneously
- T-003 can start once T-001 interface is defined

### Dependencies and Blockers

- Must verify existing AccountCard component structure
- Need access to account data from existing master view
- Require understanding of current layout CSS

## Known Limitations (Acceptable)

### This Slice Does NOT

- **Handle ESC key**: Coming in Slice 2
- **Handle click outside**: Coming in Slice 2
- **Format all data fields**: Coming in Slice 3
- **Responsive optimization**: Coming in Slice 3

### Technical Debt (Intentional)

- **Basic styling**: Functional but not polished, acceptable for MVP
- **Minimal data display**: Shows raw account data, will enhance formatting later
- **No keyboard navigation**: Click-only interaction acceptable for first slice

## Success Criteria for Slice

### Slice is DONE When

- [ ] User can click "View Details" on any account card
- [ ] Panel opens showing the selected account's basic information
- [ ] Panel can be closed using the X button
- [ ] Only one panel can be open at a time
- [ ] Three-column master view layout remains intact
- [ ] All tasks T-001 through T-004 complete and verified
- [ ] No runtime errors during panel operations
- [ ] Basic tests pass for all components
- [ ] Deployable to preview environment

### Slice is NOT Done Until

- [ ] Integration verified with real account data
- [ ] User value demonstrated with working flow
- [ ] Next slice (enhanced interactions) unblocked
- [ ] Code quality gates passed

## Reality Check for Slice 1

### What WILL Happen:

- ❌ Panel positioning will be wrong initially (CSS tweaking needed - budget 30 min)
- ❌ State management will have edge cases (discover through manual testing)
- ❌ TypeScript will complain about account data structure (budget 15 min)
- ❌ First attempt at integration will have prop drilling issues

### Success Looks Like:

- ✅ Panel opens when "View Details" button clicked
- ✅ Panel shows account company name and basic info
- ✅ Panel closes with X button
- ✅ No runtime crashes during open/close operations
- ✅ Three columns still visible and functional

### Observable Architecture Implementation

```typescript
// Build in debugging from the start
interface DebugProps {
  debug?: boolean
}

// Component breadcrumbs
const AccountDetailsPanel = ({ account, isOpen, onClose, debug }: Props) => {
  useEffect(() => {
    if (debug) {
      console.log(`[AccountDetailsPanel] Mounted with:`, { account, isOpen })
      window.__DEBUG_PANEL__ = { account, isOpen, props: arguments[0] }
    }
  }, [account, isOpen, debug])

  // Error boundary integration
  const handleError = (error: Error) => {
    console.error(`[AccountDetailsPanel] Error:`, error)
    // Graceful degradation
  }
}
```

## File Structure for This Slice

```
src/components/accounts/
├── AccountDetailsPanel.tsx           # T-001: Panel shell component
├── AccountDetailsPanel.test.tsx      # T-001: Basic render tests
├── useAccountDetails.ts              # T-003: State management hook
├── useAccountDetails.test.ts         # T-003: Hook behavior tests
└── AccountCard.tsx                   # T-002: Enhanced with View Details button

src/app/accounts/master/
└── page.tsx                          # T-004: Integration point

# Files that will be modified:
src/components/accounts/AccountMasterView.tsx  # T-004: Add panel integration
```

## Component Quality Patterns

### Error Boundaries

```typescript
// Wrap panel in error boundary
<ErrorBoundary fallback={<div>Details panel failed to load</div>}>
  <AccountDetailsPanel account={account} isOpen={isOpen} onClose={onClose} />
</ErrorBoundary>
```

### Loading States

```typescript
// Handle loading account data
const AccountDetailsPanel = ({ account, isOpen, onClose }: Props) => {
  if (isOpen && !account) {
    return <div>Loading account details...</div>
  }
  // ... rest of component
}
```

### Accessibility Foundation

```typescript
// ARIA labels and roles
<div
  role="dialog"
  aria-labelledby="details-title"
  aria-describedby="details-content"
  data-testid="details-panel"
>
  <h2 id="details-title">Account Details</h2>
  <button
    aria-label="Close account details"
    onClick={onClose}
  >
    ×
  </button>
</div>
```
