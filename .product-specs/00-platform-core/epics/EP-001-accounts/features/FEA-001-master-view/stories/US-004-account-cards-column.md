# US-004: Display Account Cards in Three-Column Master View

## User Story

**As a** Business Owner, Operations Manager, or Admin  
**I want to** see my accounts in the first column of the master view  
**So that I can** select accounts and see related information in columns 2 and 3

## Background

The three-column master view is our primary interface. Column 1 shows account cards, Column 2 shows service locations for the selected account, Column 3 shows work orders. This story implements Column 1 only.

## Acceptance Criteria

- [ ] Three-column layout with fixed widths (300px, 400px, flexible)
- [ ] Column 1 displays account cards in a scrollable list
- [ ] Each card shows: Company name, Contact name, City/State
- [ ] Cards are clickable (selection state)
- [ ] Only one account can be selected at a time
- [ ] Selected account has visual indicator
- [ ] Column 1 header shows "Accounts (X)" count

## Business Rules

- Initial load shows all active accounts
- No account selected on initial load
- Clicking a card selects it
- Clicking selected card deselects it

## Technical Requirements

- Fetch accounts from Supabase on mount
- Client-side state for selection
- Responsive scroll within column
- TypeScript interfaces for all data

## Out of Scope

- Column 2 and 3 implementation
- Account filtering/search
- Account details modal (US-005)
- Create/edit/delete operations
