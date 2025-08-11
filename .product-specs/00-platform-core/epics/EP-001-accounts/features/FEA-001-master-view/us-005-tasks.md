# Task Breakdown: US-005 - View Account Details On-Demand in Master View

## Value Slice Summary

### Value Slice 1: Account Selection with Details Modal

**Tasks**: T-001 through T-004
**User Can Now**: "Select an account card to reveal detail options, then click contacts icon to view contact information in a modal"
**Architecture Needed**: Yes (first slice needs design for selection state enhancement and modal pattern)
**Estimated Time**: 2 hours

### Value Slice 2: Enhanced Modal Interactions

**Tasks**: T-005 through T-007
**User Can Now**: "Navigate modals naturally with keyboard, click outside to close, and access additional detail types (service agreements)"
**Architecture Needed**: No (uses existing patterns from Slice 1)
**Estimated Time**: 1.5 hours

### Value Slice 3: Complete Details Access

**Tasks**: T-008 through T-011
**User Can Now**: "Access all account details (financial data, account notes) through dedicated icons with proper data formatting and responsive design"
**Architecture Needed**: No (extends existing patterns)
**Estimated Time**: 1.5 hours

## Detailed Task Breakdown

## Task 1: Enhance Account Card Selection State with Detail Options

**VALUE_SLICE**: 1 - Account Selection with Details Modal
**DELIVERABLE**: src/components/accounts/AccountCard.tsx (modified)
**ESTIMATED TIME**: 30 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: None
**VERIFY**: npm run dev && select account card to see contact details icon appear
**BUSINESS_RULE**: Selected account card shows additional action icons
**ACCEPTANCE_CRITERIA**: When account card is selected, detail option icons (contacts, etc.) become visible

### Details

Modify the existing AccountCard component to show additional action icons (starting with contacts) when the card is in selected state. These icons only appear on the selected card, not on all cards.

### Success Criteria

- [ ] Selected card shows contacts icon (and space for future icons)
- [ ] Icons only visible when card is selected
- [ ] Icons positioned appropriately within card layout
- [ ] Visual feedback on icon hover/click
- [ ] Selection state properly triggers icon visibility

### 🧠 Planning Reasoning

This establishes the pattern where selection reveals options, keeping cards clean when not selected. This follows the Master View philosophy of "see what you want, when you want."

## Task 2: Create Contact Details Modal Component

**VALUE_SLICE**: 1 - Account Selection with Details Modal
**DELIVERABLE**: src/components/accounts/ContactDetailsModal.tsx
**ESTIMATED TIME**: 25 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: None
**VERIFY**: npm run dev && curl http://localhost:3000 | grep "ContactDetailsModal"
**BUSINESS_RULE**: Contact details display in a modal overlay
**ACCEPTANCE_CRITERIA**: Modal shows contact information with clear close mechanism

### Details

Create a modal component specifically for displaying account contacts and their communication logs. Modal should overlay the three-column view without disrupting it.

### Success Criteria

- [ ] Modal renders as overlay (not panel)
- [ ] Modal has clear close button (X)
- [ ] Modal has proper backdrop/overlay
- [ ] Modal structure ready for contact data
- [ ] Follows existing modal patterns if any

### 🧠 Planning Reasoning

A modal is the right choice here as it temporarily focuses user attention on contact details without losing the three-column context. The modal preserves the master view structure.

## Task 3: Implement Contact Modal State Management

**VALUE_SLICE**: 1 - Account Selection with Details Modal
**DELIVERABLE**: src/components/accounts/useContactModal.ts
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: T-002
**VERIFY**: npm test -- --watchAll=false --testNamePattern="contact modal state"
**BUSINESS_RULE**: Only one modal can be open at a time
**ACCEPTANCE_CRITERIA**: Contact icon click opens modal with correct account context

### Details

Create custom hook for managing modal visibility and tracking which account's contacts are being viewed. Ensures modal state is properly managed.

### Success Criteria

- [ ] Hook tracks modal open/closed state
- [ ] Hook maintains current account context
- [ ] Opening modal for new account works correctly
- [ ] Close function properly resets state
- [ ] State updates trigger proper re-renders

### 🧠 Planning Reasoning

Separating modal state management makes it reusable and testable. This pattern can be extended for other detail modals (service agreements, financial data) in future slices.

## Task 4: Connect Contact Icon to Modal Display

**VALUE_SLICE**: 1 - Account Selection with Details Modal
**DELIVERABLE**: src/components/accounts/AccountMasterView.tsx (modified)
**ESTIMATED TIME**: 25 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: T-001, T-002, T-003
**VERIFY**: npm run dev && select account, click contacts icon to verify modal opens with contact list
**BUSINESS_RULE**: View account contacts, along with communication log for each
**ACCEPTANCE_CRITERIA**: Contact details modal displays all contacts for selected account

### Details

Wire up the complete flow: selecting an account card reveals the contacts icon, clicking the icon opens the modal with that account's contact information and communication logs.

### Success Criteria

- [ ] Account selection reveals contact icon
- [ ] Clicking contact icon opens modal
- [ ] Modal displays correct account's contacts
- [ ] Modal shows communication log per contact
- [ ] Close button/backdrop click closes modal
- [ ] ESC key closes modal (basic implementation)

### 🧠 Planning Reasoning

This completes Value Slice 1 by delivering the full user flow. Users can now access detailed contact information on-demand without cluttering the main interface.

## VALUE SLICE CHECKPOINT 1: After Tasks 1-4

**Slice Name**: Account Selection with Details Modal
**Commit message**: "feat: add contact details modal accessible from selected account cards"
**User Value Delivered**: Users can now view detailed contact information on-demand by selecting an account and clicking the contacts icon
**Deployment Ready**: Yes - creates preview URL
**Verification**:

- npm run dev
- Click to select an account card
- Verify contacts icon appears on selected card
- Click contacts icon
- Verify modal opens with contact information
- Verify modal can be closed
  **Next Slice Decision Point**: Continue to enhance modal interactions or add other detail types

## Task 5: Add ESC Key Support for Modal Closure

**VALUE_SLICE**: 2 - Enhanced Modal Interactions
**DELIVERABLE**: src/components/accounts/ContactDetailsModal.tsx (modified)
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-004
**VERIFY**: npm run dev && open contact modal, press ESC to verify it closes
**BUSINESS_RULE**: ESC key closes open modal
**ACCEPTANCE_CRITERIA**: ESC key closes any open detail modal

### Details

Enhance the modal component with proper keyboard event handling for ESC key closure, improving accessibility and user experience.

### Success Criteria

- [ ] ESC key closes open modal from anywhere
- [ ] Event listener is properly attached/removed
- [ ] No memory leaks from event handlers
- [ ] Works regardless of focus location
- [ ] No conflicts with other keyboard handlers

### 🧠 Planning Reasoning

Keyboard accessibility is essential for professional applications. ESC to close modals is a universal UX pattern that users expect.

## Task 6: Implement Click-Outside-to-Close for Modals

**VALUE_SLICE**: 2 - Enhanced Modal Interactions
**DELIVERABLE**: src/hooks/useClickOutside.ts
**ESTIMATED TIME**: 25 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: T-004
**VERIFY**: npm run dev && open contact modal, click backdrop to verify it closes
**BUSINESS_RULE**: Clicking outside modal (on backdrop) closes it
**ACCEPTANCE_CRITERIA**: Clicking modal backdrop closes the modal

### Details

Create reusable hook for detecting clicks on the modal backdrop and closing the modal. This should work for all detail modals we'll create.

### Success Criteria

- [ ] Clicking backdrop closes modal
- [ ] Clicking inside modal keeps it open
- [ ] Hook is reusable for all modals
- [ ] Event handling is performant
- [ ] Properly cleanup on unmount

### 🧠 Planning Reasoning

Click-outside-to-close via backdrop is standard modal behavior. Making this a reusable hook ensures consistency across all detail modals.

## Task 7: Add Service Agreement Details Modal

**VALUE_SLICE**: 2 - Enhanced Modal Interactions
**DELIVERABLE**: src/components/accounts/ServiceAgreementModal.tsx
**ESTIMATED TIME**: 30 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: T-001, T-003
**VERIFY**: npm run dev && select account, click service agreement icon to verify modal opens
**BUSINESS_RULE**: Service agreement(s) for that account viewable on demand
**ACCEPTANCE_CRITERIA**: Service agreement icon appears on selected card and opens detail modal

### Details

Create service agreement modal following the same pattern as contacts. Add service agreement icon to selected account cards that opens a modal showing agreement details.

### Success Criteria

- [ ] Service agreement icon appears on selected cards
- [ ] Icon opens service agreement modal
- [ ] Modal displays agreement details properly
- [ ] Modal reuses click-outside and ESC patterns
- [ ] Multiple agreements handled gracefully

### 🧠 Planning Reasoning

This proves the pattern is extensible. By adding a second detail type, we validate that our modal approach scales to all the detail types mentioned in the Master View Feature Definition.

## VALUE SLICE CHECKPOINT 2: After Tasks 5-7

**Slice Name**: Enhanced Modal Interactions
**Commit message**: "feat: add keyboard/click-outside support and service agreement modal"
**User Value Delivered**: Users can now interact naturally with modals using standard patterns and access service agreement details
**Deployment Ready**: Yes - enhances existing functionality
**Verification**:

- npm run dev
- Test ESC key closing modals
- Test backdrop click to close
- Test service agreement icon and modal
- Verify all interactions feel natural
  **Next Slice Decision Point**: Continue to complete all detail types

## Task 8: Add Financial Data Modal

**VALUE_SLICE**: 3 - Complete Details Access
**DELIVERABLE**: src/components/accounts/FinancialDataModal.tsx
**ESTIMATED TIME**: 30 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: T-001, T-003
**VERIFY**: npm run dev && select account, click financial icon to see balance, payment history
**BUSINESS_RULE**: Account financial data accessible on demand
**ACCEPTANCE_CRITERIA**: Financial data icon opens modal with account balance and payment information

### Details

Create financial data modal showing account balance, payment history, and other financial information. Add financial icon to selected account cards.

### Success Criteria

- [ ] Financial data icon appears on selected cards
- [ ] Modal displays account balance clearly
- [ ] Payment history shown in readable format
- [ ] Handles missing financial data gracefully
- [ ] Follows established modal patterns

### 🧠 Planning Reasoning

Financial data is sensitive and detail-heavy, making a modal the perfect choice. Users can quickly check financial status without leaving their workflow.

## Task 9: Add Account Notes Modal

**VALUE_SLICE**: 3 - Complete Details Access
**DELIVERABLE**: src/components/accounts/AccountNotesModal.tsx
**ESTIMATED TIME**: 25 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-001, T-003
**VERIFY**: npm run dev && select account with notes, click notes icon to view
**BUSINESS_RULE**: Account notes/special instructions viewable on demand
**ACCEPTANCE_CRITERIA**: Notes icon opens modal showing account notes and special instructions

### Details

Create account notes modal for viewing special instructions and notes. This completes the full set of detail types from the Master View specification.

### Success Criteria

- [ ] Notes icon appears on selected cards
- [ ] Modal displays notes with proper formatting
- [ ] Long notes are scrollable within modal
- [ ] Empty notes handled gracefully
- [ ] Consistent with other modals

### 🧠 Planning Reasoning

Notes often contain critical service information. Having them easily accessible but not cluttering the main view supports efficient operations.

## Task 10: Handle Empty States Across All Modals

**VALUE_SLICE**: 3 - Complete Details Access
**DELIVERABLE**: src/components/shared/EmptyModalState.tsx
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-007, T-008, T-009
**VERIFY**: npm test -- --watchAll=false --testNamePattern="empty state handling"
**BUSINESS_RULE**: Handle null/empty fields gracefully
**ACCEPTANCE_CRITERIA**: All modals show appropriate messages for missing data

### Details

Create consistent empty state handling across all detail modals, showing user-friendly messages when data is not available.

### Success Criteria

- [ ] Consistent empty state component created
- [ ] All modals use same empty patterns
- [ ] Messages are helpful and actionable
- [ ] Visual design matches modal styles
- [ ] Different messages for different data types

### 🧠 Planning Reasoning

Professional applications handle missing data gracefully. Consistent empty states across all modals provides a polished user experience.

## Task 11: Add Loading States for Modal Data

**VALUE_SLICE**: 3 - Complete Details Access
**DELIVERABLE**: src/components/shared/ModalLoadingState.tsx
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: T-007, T-008, T-009
**VERIFY**: npm run dev && verify modals show loading state before data appears
**BUSINESS_RULE**: Professional loading experience while fetching data
**ACCEPTANCE_CRITERIA**: All modals show loading indicator while fetching data

### Details

Implement loading states for all modals to handle the time between opening and data display, ensuring smooth user experience.

### Success Criteria

- [ ] Loading component shows immediately
- [ ] Smooth transition to loaded content
- [ ] No layout shift when data loads
- [ ] Loading state is visually clear
- [ ] Consistent across all modal types

### 🧠 Planning Reasoning

Even with fast data loading, showing loading states prevents the UI from feeling broken or frozen. This completes the professional polish of our modal system.

## VALUE SLICE CHECKPOINT 3: After Tasks 8-11

**Slice Name**: Complete Details Access
**Commit message**: "feat: complete account details system with all data types and polish"
**User Value Delivered**: Users can now access all account details (contacts, agreements, financial, notes) through a consistent, polished modal interface
**Deployment Ready**: Yes - full feature implementation complete
**Verification**:

- npm run dev
- Test all four detail types (contacts, agreements, financial, notes)
- Verify empty states display correctly
- Verify loading states work smoothly
- Confirm all modals follow same interaction patterns
  **Next Slice Decision Point**: Feature complete - ready for QA

## Architecture Requirements

### Value Slice 1: REQUIRES ARCHITECT

- Modal pattern establishment
- Selection state enhancement approach
- Icon positioning within selected cards
- Modal state management pattern

### Value Slice 2: NO ARCHITECT NEEDED

- Uses modal patterns from Slice 1
- Standard event handling patterns
- Reuses established state management

### Value Slice 3: NO ARCHITECT NEEDED

- Uses all patterns from Slice 1
- Standard loading/empty states
- Consistent modal implementations

## OUTPUT VALIDATION CHECKLIST

- [x] Tasks grouped into 3 value slices
- [x] Each slice delivers complete user value
- [x] First slice marked "REQUIRES ARCHITECT"
- [x] Subsequent slices evaluated for architecture needs
- [x] Value slice checkpoints defined
- [x] Total of 11 tasks across all slices
- [x] Each task belongs to exactly one slice
- [x] Tasks follow required format with VALUE_SLICE, DELIVERABLE, VERIFY, DEPENDS fields
- [x] All tasks aligned with modal approach (not panel)
- [x] Tasks match Master View Feature Definition intent
