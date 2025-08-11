# Task Breakdown: US-004 - Display Account Cards in Three-Column Master View

## Null Safety Strategy

**CRITICAL**: All tasks must implement comprehensive null/undefined handling:

- **Type Safety**: Use TypeScript unions (T | null | undefined) for all nullable fields
- **Safe Access**: Always use optional chaining (?.) and nullish coalescing (??)
- **Default Values**: Define meaningful fallbacks for all null/undefined scenarios
- **Validation**: Add runtime type guards before data processing
- **UI Resilience**: Implement loading states, error boundaries, and fallback UI
- **State Management**: Handle null initial states and null transitions gracefully

## Value Slice Summary

### Value Slice 1: Three-Column Layout Foundation

**Tasks**: T-001 through T-004
**User Can Now**: "See a properly structured three-column layout ready for account cards"
**Architecture Needed**: Yes (establishing new layout patterns and structure)
**Estimated Time**: 2 hours

### Value Slice 2: Account Cards Display

**Tasks**: T-005 through T-008
**User Can Now**: "View all my accounts as cards with company name, contact, and location"
**Architecture Needed**: No (uses existing patterns)
**Estimated Time**: 1.5 hours

### Value Slice 3: Interactive Selection

**Tasks**: T-009 through T-011
**User Can Now**: "Click on account cards to select them with clear visual feedback"
**Architecture Needed**: No (standard interaction patterns)
**Estimated Time**: 1 hour

## Detailed Task Breakdown

## Task 1: Create Master View Layout Component

**VALUE_SLICE**: 1 - Three-Column Layout Foundation
**DELIVERABLE**: src/components/master-view/MasterViewLayout.tsx
**ESTIMATED TIME**: 25 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: None
**VERIFY**: npm run dev && curl http://localhost:3000 | grep "master-view"
**BUSINESS_RULE**: "Three-column layout with fixed widths (300px, 400px, flexible)"
**ACCEPTANCE_CRITERIA**: "Three-column layout with fixed widths"

### Details

Create the main layout component that establishes the three-column structure with proper CSS Grid or Flexbox implementation.

### Success Criteria

- [ ] Component renders with three distinct columns
- [ ] Column 1 is exactly 300px wide
- [ ] Column 2 is exactly 400px wide
- [ ] Column 3 takes remaining space
- [ ] Layout is responsive to viewport height

### 🧠 Planning Reasoning

Starting with the layout foundation ensures all subsequent components have the proper structure to work within. This establishes the visual framework that makes the entire user story possible.

## Task 2: Create Column Container Components

**VALUE_SLICE**: 1 - Three-Column Layout Foundation
**DELIVERABLE**: src/components/master-view/ColumnContainer.tsx
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-001
**VERIFY**: npm test -- --watchAll=false ColumnContainer
**BUSINESS_RULE**: "Responsive scroll within column"
**ACCEPTANCE_CRITERIA**: "Column 1 displays account cards in a scrollable list"

### Details

Create reusable column container component with proper scrolling behavior and padding for content areas.

### Success Criteria

- [ ] Column container handles overflow with scroll
- [ ] Proper padding and spacing for content
- [ ] Accepts children and renders them correctly
- [ ] Works across all three column positions

### 🧠 Planning Reasoning

Reusable column containers prevent code duplication and ensure consistent behavior across all three columns. This supports the scrollable requirement for the account cards.

## Task 3: Create Accounts Column Header

**VALUE_SLICE**: 1 - Three-Column Layout Foundation
**DELIVERABLE**: src/components/accounts/AccountsColumnHeader.tsx
**ESTIMATED TIME**: 15 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-002
**VERIFY**: npm run dev && check "Accounts (0)" displays in column 1
**BUSINESS_RULE**: "Column 1 header shows 'Accounts (X)' count"
**ACCEPTANCE_CRITERIA**: "Column 1 header shows 'Accounts (X)' count"

### Details

Create the header component for column 1 that displays the accounts count and will update dynamically as accounts are loaded.

### Success Criteria

- [ ] Header displays "Accounts (X)" format
- [ ] Accepts count prop and displays correctly
- [ ] Proper styling consistent with design system
- [ ] Component is type-safe with TypeScript
- [ ] **NULL LOGIC**: Display "Accounts (0)" when count is null/undefined
- [ ] **NULL LOGIC**: Use default value for missing count prop
- [ ] **NULL LOGIC**: Handle negative or invalid count values gracefully

### 🧠 Planning Reasoning

The header component establishes the visual hierarchy and provides immediate feedback about the number of accounts. Creating it early allows us to verify the layout structure before adding complex data.

## Task 4: Integrate Layout Components

**VALUE_SLICE**: 1 - Three-Column Layout Foundation
**DELIVERABLE**: src/app/page.tsx (updated)
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-001, T-002, T-003
**VERIFY**: npm run dev && verify complete three-column layout renders
**BUSINESS_RULE**: "Three-column layout with fixed widths"
**ACCEPTANCE_CRITERIA**: "Three-column layout with fixed widths"

### Details

Integrate all layout components into the main page to create the complete three-column structure ready for account data.

### Success Criteria

- [ ] All three columns render properly
- [ ] Column widths are correct (300px, 400px, flexible)
- [ ] Accounts header shows in column 1
- [ ] No TypeScript errors
- [ ] Layout adapts to viewport changes

### 🧠 Planning Reasoning

Integration completes Value Slice 1 by ensuring all components work together. This gives users their first complete view of the new layout structure.

## Task 5: Create Account Data Types

**VALUE_SLICE**: 2 - Account Cards Display
**DELIVERABLE**: src/types/account.types.ts
**ESTIMATED TIME**: 15 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: None
**VERIFY**: npm run type-check && grep -r "Account" src/types/
**BUSINESS_RULE**: "Each card shows: Company name, Contact name, City/State"
**ACCEPTANCE_CRITERIA**: "TypeScript interfaces for all data"

### Details

Define TypeScript interfaces for account data structure matching the Supabase schema and component requirements.

### Success Criteria

- [ ] Account interface includes all required fields
- [ ] Interfaces are exported for reuse
- [ ] Type definitions match Supabase schema
- [ ] No TypeScript compilation errors
- [ ] **NULL LOGIC**: Handle nullable fields with proper TypeScript unions (string | null)
- [ ] **NULL LOGIC**: Define fallback display values for null/undefined data
- [ ] **NULL LOGIC**: Add optional chaining (?.) for all nested object access
- [ ] **NULL LOGIC**: Use nullish coalescing (??) for default values
- [ ] **NULL LOGIC**: Validate all incoming data with type guards

### 🧠 Planning Reasoning

Type safety is critical for data handling. Defining types first ensures all subsequent components and API calls are properly typed and prevents runtime errors.

## Task 6: Create Account Card Component

**VALUE_SLICE**: 2 - Account Cards Display
**DELIVERABLE**: src/components/accounts/AccountCard.tsx
**ESTIMATED TIME**: 25 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: T-005
**VERIFY**: npm test -- --watchAll=false AccountCard
**BUSINESS_RULE**: "Each card shows: Company name, Contact name, City/State"
**ACCEPTANCE_CRITERIA**: "Each card shows: Company name, Contact name, City/State"

### Details

Create the individual account card component that displays account information in the required format with proper styling.

### Success Criteria

- [ ] Card displays company name prominently
- [ ] Contact name is clearly visible
- [ ] City/State location is shown
- [ ] Card has proper hover states
- [ ] Component accepts Account type props
- [ ] **NULL LOGIC**: Display "N/A" for null company names
- [ ] **NULL LOGIC**: Display "No Contact" for null contact names
- [ ] **NULL LOGIC**: Display "Location TBD" for null city/state values
- [ ] **NULL LOGIC**: Handle undefined props gracefully without crashes
- [ ] **NULL LOGIC**: Use safe rendering patterns (account?.field ?? 'default')
- [ ] **NULL LOGIC**: Add prop validation to prevent null object drilling
- [ ] **NULL LOGIC**: Implement loading skeleton when data is null

### 🧠 Planning Reasoning

The account card is the core visual element users will interact with. Creating it as a standalone component allows for isolated testing and reusability.

## Task 7: Implement Account Data Fetching

**VALUE_SLICE**: 2 - Account Cards Display
**DELIVERABLE**: src/hooks/useAccounts.ts
**ESTIMATED TIME**: 30 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: T-005
**VERIFY**: npm test -- --watchAll=false useAccounts
**BUSINESS_RULE**: "Initial load shows all active accounts"
**ACCEPTANCE_CRITERIA**: "Fetch accounts from Supabase on mount"

### Details

Create custom hook to fetch account data from Supabase with proper error handling and loading states.

### Success Criteria

- [ ] Hook fetches accounts from Supabase
- [ ] Returns loading, error, and data states
- [ ] Filters for active accounts only
- [ ] Proper TypeScript typing
- [ ] Error handling implemented
- [ ] **NULL LOGIC**: Handle null/undefined responses from Supabase
- [ ] **NULL LOGIC**: Return empty array [] when no data available
- [ ] **NULL LOGIC**: Validate data structure before returning to components
- [ ] **NULL LOGIC**: Implement try-catch for API failures returning null
- [ ] **NULL LOGIC**: Add data transformation to handle DB nulls before component use
- [ ] **NULL LOGIC**: Set loading state to true while handling null responses

### 🧠 Planning Reasoning

Separating data fetching into a custom hook promotes reusability and testability. This pattern will be useful when we need account data in other components.

## Task 8: Display Account Cards in Column 1

**VALUE_SLICE**: 2 - Account Cards Display
**DELIVERABLE**: src/components/accounts/AccountsList.tsx
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-006, T-007
**VERIFY**: npm run dev && verify account cards display with real data
**BUSINESS_RULE**: "Column 1 displays account cards in a scrollable list"
**ACCEPTANCE_CRITERIA**: "Column 1 displays account cards in a scrollable list"

### Details

Create the accounts list component that renders all account cards and integrates with the data fetching hook.

### Success Criteria

- [ ] All account cards render in column 1
- [ ] List is scrollable when content overflows
- [ ] Loading state displays during fetch
- [ ] Error state handles API failures
- [ ] Header count updates with actual account count
- [ ] **NULL LOGIC**: Display "No accounts found" when accounts array is empty
- [ ] **NULL LOGIC**: Handle null accounts array without breaking render
- [ ] **NULL LOGIC**: Show count as "0" when accounts data is null/undefined
- [ ] **NULL LOGIC**: Implement fallback UI for null/error states
- [ ] **NULL LOGIC**: Use conditional rendering to prevent null array mapping
- [ ] **NULL LOGIC**: Add loading skeleton for null data during fetch

### 🧠 Planning Reasoning

This completes Value Slice 2 by connecting the card component with real data. Users can now see their actual accounts displayed properly.

## Task 9: Add Selection State Management

**VALUE_SLICE**: 3 - Interactive Selection
**DELIVERABLE**: src/hooks/useAccountSelection.ts
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-005
**VERIFY**: npm test -- --watchAll=false useAccountSelection
**BUSINESS_RULE**: "Only one account can be selected at a time"
**ACCEPTANCE_CRITERIA**: "Client-side state for selection"

### Details

Create state management hook for handling account selection with proper business rules enforcement.

### Success Criteria

- [ ] Hook manages selected account ID
- [ ] Only one account can be selected
- [ ] Provides select/deselect functions
- [ ] Handles toggle behavior (click selected to deselect)
- [ ] TypeScript types for all functions
- [ ] **NULL LOGIC**: Handle null selectedAccountId (no selection state)
- [ ] **NULL LOGIC**: Validate account ID exists before setting selection
- [ ] **NULL LOGIC**: Clear selection when selected account is removed from data
- [ ] **NULL LOGIC**: Use null as initial state for selectedAccountId
- [ ] **NULL LOGIC**: Add null checks before state updates
- [ ] **NULL LOGIC**: Handle edge case of selecting null/undefined IDs

### 🧠 Planning Reasoning

Centralizing selection logic in a custom hook ensures consistent behavior and makes the state easy to share with other components that need selection data.

## Task 10: Implement Card Click Interactions

**VALUE_SLICE**: 3 - Interactive Selection
**DELIVERABLE**: src/components/accounts/AccountCard.tsx (updated)
**ESTIMATED TIME**: 15 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-009
**VERIFY**: npm run dev && click cards to verify selection works
**BUSINESS_RULE**: "Clicking a card selects it, clicking selected card deselects it"
**ACCEPTANCE_CRITERIA**: "Cards are clickable (selection state)"

### Details

Add click handlers to account cards that integrate with the selection state management.

### Success Criteria

- [ ] Cards respond to click events
- [ ] Clicking unselected card selects it
- [ ] Clicking selected card deselects it
- [ ] Click events are properly typed
- [ ] No console errors on interaction
- [ ] **NULL LOGIC**: Prevent clicks when account data is null/undefined
- [ ] **NULL LOGIC**: Handle null account IDs in click handlers
- [ ] **NULL LOGIC**: Add defensive checks before state updates

### 🧠 Planning Reasoning

Adding click interactions transforms the static display into an interactive interface. This enables the core user behavior needed for the master view workflow.

## Task 11: Add Visual Selection Indicators

**VALUE_SLICE**: 3 - Interactive Selection
**DELIVERABLE**: src/components/accounts/AccountCard.tsx (updated with styles)
**ESTIMATED TIME**: 15 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-010
**VERIFY**: npm run dev && verify selected cards have visual indicator
**BUSINESS_RULE**: "Selected account has visual indicator"
**ACCEPTANCE_CRITERIA**: "Selected account has visual indicator"

### Details

Add visual styling to indicate selected state with proper contrast and accessibility considerations.

### Success Criteria

- [ ] Selected cards have distinct visual appearance
- [ ] Visual indicator meets accessibility contrast requirements
- [ ] Hover states work properly with selection
- [ ] Visual feedback is immediate on selection
- [ ] Design is consistent with system patterns
- [ ] **NULL LOGIC**: Handle null selection state in visual styling
- [ ] **NULL LOGIC**: Prevent visual glitches when account data is null
- [ ] **NULL LOGIC**: Use conditional classes for null-safe styling

### 🧠 Planning Reasoning

Visual feedback completes the interaction loop and gives users clear confirmation of their selections. This finishes the complete user story functionality.

## VALUE SLICE CHECKPOINTS

### VALUE SLICE CHECKPOINT 1: After Tasks 1-4

**Slice Name**: Three-Column Layout Foundation
**Commit message**: "feat(layout): implement three-column master view structure"
**User Value Delivered**: Users can see properly structured three-column layout
**Deployment Ready**: Yes - establishes visual foundation
**Verification**:

- npm run dev
- Verify three columns render with correct widths
- Verify accounts header displays in column 1
- Verify layout is responsive to viewport

**Next Slice Decision Point**: Continue to Slice 2 (account data display)

### VALUE SLICE CHECKPOINT 2: After Tasks 5-8

**Slice Name**: Account Cards Display  
**Commit message**: "feat(accounts): display account cards with data from Supabase"
**User Value Delivered**: Users can view all their accounts as informative cards
**Deployment Ready**: Yes - provides useful account viewing capability
**Verification**:

- npm run dev
- Verify account cards display with real data
- Verify scrolling works in column 1
- Verify header count reflects actual account count

**Next Slice Decision Point**: Continue to Slice 3 (selection interactions)

### VALUE SLICE CHECKPOINT 3: After Tasks 9-11

**Slice Name**: Interactive Selection
**Commit message**: "feat(accounts): add account selection with visual feedback"
**User Value Delivered**: Users can select accounts and see clear selection state
**Deployment Ready**: Yes - completes US-004 functionality
**Verification**:

- npm run dev
- Click different account cards
- Verify only one can be selected at a time
- Verify visual selection indicators work
- Verify clicking selected card deselects it

**Next Slice Decision Point**: US-004 complete, ready for US-005 or Column 2/3 implementation

## Architecture Requirements

### Value Slice 1: REQUIRES ARCHITECT

- New master view layout patterns needed
- Component composition approach for columns
- CSS Grid vs Flexbox decision for responsive layout
- Scrolling behavior patterns within constrained heights

### Value Slice 2: NO ARCHITECT NEEDED

- Uses existing data fetching patterns from project
- Standard component creation follows established patterns
- Supabase integration uses existing client setup

### Value Slice 3: NO ARCHITECT NEEDED

- Standard React state management patterns
- Event handling follows existing project conventions
- CSS styling uses established design system patterns
