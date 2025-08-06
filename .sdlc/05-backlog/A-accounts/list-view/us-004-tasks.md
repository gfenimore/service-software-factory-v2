# US-004 Task Breakdown: Accounts List View (Reports)

**User Story**: As a service company user, I want to view a list of all accounts so I can see my customer base at a glance

**Story Reference**: `.cursor/artifacts/current/requirements/us-004-accounts-list.md`

**Current State**: Reports page shows "Coming Soon" component at `/accounts/reports`

---

## Task 1: Create Account Types and Supabase Query

**DELIVERABLE**: `src/types/account.ts` and `src/lib/supabase/queries/accounts.ts`
**ESTIMATED TIME**: 15 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: Existing Supabase connection
**VERIFY**: `npm run type-check` passes, query returns sorted data
**BUSINESS_RULE**: BR1 (alphabetical sort), BR3/BR4 (status/type validation), BR5 (no deleted)
**ACCEPTANCE_CRITERIA**: Data structure supports Name, Status, Type, City fields

### Details

Create TypeScript interfaces matching the Supabase accounts table and a query function that fetches accounts with proper sorting and filtering.

### Success Criteria

- [ ] Account interface matches Supabase schema
- [ ] Query sorts alphabetically by name (case-insensitive)
- [ ] Query excludes any deleted accounts
- [ ] Status/Type types are constrained to valid values
- [ ] Query function has proper error handling

### 🧠 Planning Reasoning

Using real data from day one ensures we work with actual constraints and avoid mock-to-real transition issues. The query encapsulates all business rules for data access.

---

## Task 2: Create AccountsList Component with Data Fetching

**DELIVERABLE**: `src/components/accounts/accounts-list.tsx`
**ESTIMATED TIME**: 25 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: Task 1
**VERIFY**: Component renders accounts from Supabase in table format
**BUSINESS_RULE**: BR2 (show all), BR6 (empty state)
**ACCEPTANCE_CRITERIA**: "I can see a list of accounts with: Name, Status, Type, City"

### Details

Create a server component that fetches accounts data and displays it in a clean table format. Include empty state handling per BR6.

### Success Criteria

- [ ] Server component fetches data using accounts query
- [ ] Table displays Name, Status, Type, City columns
- [ ] Empty state shows "No accounts found" message
- [ ] Loading state while data fetches
- [ ] Error state if query fails
- [ ] Responsive table layout

### 🧠 Planning Reasoning

Server components eliminate loading spinners for initial render and provide better SEO. This approach follows Next.js 13+ best practices and matches the navigation pattern.

---

## Task 3: Implement Status Styling Business Rule

**DELIVERABLE**: Updated `src/components/accounts/accounts-list.tsx`
**ESTIMATED TIME**: 10 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: Task 2
**VERIFY**: Active = normal text, Inactive = muted text in browser
**BUSINESS_RULE**: Visual distinction per acceptance criteria
**ACCEPTANCE_CRITERIA**: "I can see active accounts in normal text" / "inactive accounts in muted styling"

### Details

Add conditional styling logic to visually differentiate account statuses using Tailwind classes.

### Success Criteria

- [ ] Active accounts use text-gray-900
- [ ] Inactive accounts use text-gray-500
- [ ] Status badge/chip for additional clarity
- [ ] Consistent styling across all rows
- [ ] Accessible color contrast ratios

### 🧠 Planning Reasoning

Visual feedback for status is critical for quick scanning. Using Tailwind's utility classes maintains consistency with the existing design system.

---

## CHECKPOINT: Commit after Tasks 1-3

```bash
git add -A && git commit -m "feat: implement accounts list with real data and status styling"
```

---

## Task 4: Replace Coming Soon with AccountsList and Update Nav

**DELIVERABLE**: Updated `src/app/accounts/reports/page.tsx` and `src/components/navigation/left-navigation/config.ts`
**ESTIMATED TIME**: 5 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: Tasks 1-3
**VERIFY**: `/accounts/reports` shows real accounts, nav updated
**BUSINESS_RULE**: Feature activation
**ACCEPTANCE_CRITERIA**: "I can navigate to Reports from the left navigation" and see accounts

### Details

Replace ComingSoon component with AccountsList and update navigation config to remove placeholder status.

### Success Criteria

- [ ] ComingSoon component removed
- [ ] AccountsList component renders at /accounts/reports
- [ ] Page title updated appropriately
- [ ] Navigation config placeholder removed/updated
- [ ] Navigation highlights Reports when active

### 🧠 Planning Reasoning

This activation step makes the feature live. Combining the nav update eliminates Task 6 as discussed.

---

## Task 5: Add Comprehensive Tests

**DELIVERABLE**: `src/components/accounts/accounts-list.test.tsx`
**ESTIMATED TIME**: 20 minutes
**COMPLEXITY**: Medium
**DEPENDENCIES**: Tasks 1-4
**VERIFY**: `npm test -- accounts-list.test.tsx` all scenarios pass
**BUSINESS_RULE**: All BRs have test coverage
**ACCEPTANCE_CRITERIA**: All ACs verified through tests

### Details

Create tests covering all business rules, acceptance criteria, and Gherkin scenarios including empty state and sorting.

### Success Criteria

- [ ] Test data fetching with mock Supabase client
- [ ] Test alphabetical sorting (BR1)
- [ ] Test status styling (active/inactive)
- [ ] Test empty state message (BR6)
- [ ] Test all columns display correctly
- [ ] Test error handling scenarios

### 🧠 Planning Reasoning

Comprehensive tests ensure business rules are enforced and provide regression protection. Tests should cover all Gherkin scenarios from requirements.

---

## Task 6: Integration Test for Navigation to Reports

**DELIVERABLE**: `src/app/accounts/reports/page.test.tsx`
**ESTIMATED TIME**: 10 minutes
**COMPLEXITY**: Low
**DEPENDENCIES**: Tasks 1-5
**VERIFY**: Full user journey test passes
**BUSINESS_RULE**: Navigation integration
**ACCEPTANCE_CRITERIA**: Navigation highlight scenario

### Details

Create an integration test that verifies the complete user journey from clicking Reports to seeing accounts data.

### Success Criteria

- [ ] Test navigation click leads to /accounts/reports
- [ ] Test Reports is highlighted when active
- [ ] Test page renders accounts data
- [ ] Test full Gherkin scenario for navigation

### 🧠 Planning Reasoning

Integration tests verify the feature works end-to-end, not just in isolation. This ensures all parts work together correctly.

---

## CHECKPOINT: Final commit and verification

```bash
git add -A && git commit -m "test: add comprehensive test coverage for accounts list feature"
npm run type-check && npm test -- --testPathPattern="accounts" && npm run build
```

---

## Verification Commands

### Full Feature Verification

```bash
# Verify the feature works end-to-end
npm run dev
# Navigate to http://localhost:3000/accounts/reports
# Verify accounts display with proper sorting and styling

# Verify Gherkin scenarios
# 1. Check active accounts show in normal text
# 2. Check inactive accounts show in muted text
# 3. Check alphabetical order
# 4. Check Reports is highlighted in nav
```

### Business Rules Verification

```bash
# BR1: Alphabetical sort
curl -s http://localhost:3000/accounts/reports | grep -A1 "tbody" | head -20

# BR3/BR4: Status and Type constraints
npm run type-check

# All BRs: Run tests
npm test -- --testPathPattern="accounts" --watchAll=false
```

## Risk Assessment

**LOW RISK** with minor considerations:

- Supabase connection already tested in health endpoint
- Using established patterns from navigation
- Simple read-only operations
- Main risk: Empty database (handled by empty state)

## Dependencies

- Working Supabase connection (from health endpoint)
- Navigation system (US-003 complete)
- `/accounts/reports` route exists
- Existing TypeScript and test setup

## Total Estimated Time: 85 minutes

**Note**: Removed mock data task and merged navigation update, using real Supabase data throughout.
