# US-002: Accounts Dashboard - Task Breakdown

**USER STORY**: View and Manage Accounts Dashboard  
**TOTAL ESTIMATED TIME**: 3.5 hours (210 minutes)  
**CREATED**: 2025-01-18  

## Task 1: Create Accounts Page Structure

**DELIVERABLE**: src/app/accounts/page.tsx  
**VERIFY**: ls -la src/app/accounts/page.tsx  
**DEPENDS**: None  
**ESTIMATED_TIME**: 15 minutes  

### Details

Create the main accounts page component with basic structure and server-side data fetching using Next.js App Router.

### Success Criteria

- [ ] Page file exists at correct location
- [ ] Exports default function component
- [ ] Uses server-side data fetching pattern
- [ ] Imports required types from database types

### 🧠 Planning Reasoning

Starting with the page structure establishes the entry point and data flow. Server-side fetching is required per the user story, and this task verifies the basic routing works before building components.

## Task 2: Create TypeScript Types for Accounts

**DELIVERABLE**: src/types/accounts.ts  
**VERIFY**: npm run type-check  
**DEPENDS**: None  
**ESTIMATED_TIME**: 20 minutes  

### Details

Define TypeScript interfaces for Account display data, filter states, and pagination parameters specific to the accounts dashboard.

### Success Criteria

- [ ] AccountDisplayData interface defined
- [ ] AccountFilters interface with search, status, type
- [ ] AccountTableProps interface created
- [ ] All types extend from database types where applicable

### 🧠 Planning Reasoning

Creating types early prevents type errors during component development. The verification using type-check ensures all types are syntactically correct and integrate with existing database types.

## Task 3: Git Commit - Initial Setup

**DELIVERABLE**: Git commit with tasks 1-2  
**VERIFY**: git log --oneline -1 | grep -q "feat(accounts):"  
**DEPENDS**: Task 1, Task 2  
**ESTIMATED_TIME**: 5 minutes  

### Details

Commit the initial accounts page structure and TypeScript types with conventional commit message.

### Success Criteria

- [ ] All files staged and committed
- [ ] Commit message follows "feat(accounts): initial setup" pattern
- [ ] No uncommitted changes remain

### 🧠 Planning Reasoning

Creating an early checkpoint ensures we have a clean rollback point. The grep verification confirms our commit message follows team conventions established in the cursor rules.

## Task 4: Create AccountsTable Component

**DELIVERABLE**: src/components/accounts/AccountsTable.tsx  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 2  
**ESTIMATED_TIME**: 25 minutes  

### Details

Create a responsive table component to display account data with proper column structure and loading states.

### Success Criteria

- [ ] Component accepts AccountDisplayData[] prop
- [ ] Renders all required columns (name, type, status, city, contacts, date)
- [ ] Handles loading skeleton state
- [ ] Responsive design for mobile devices

### 🧠 Planning Reasoning

The table is the core display component and needs proper TypeScript integration. Building it after types ensures type safety. The verification proves the component compiles correctly with our type system.

## Task 5: Create AccountsTable Tests

**DELIVERABLE**: src/components/accounts/AccountsTable.test.tsx  
**VERIFY**: npm test AccountsTable.test.tsx  
**DEPENDS**: Task 4  
**ESTIMATED_TIME**: 20 minutes  

### Details

Create comprehensive tests for AccountsTable component covering data display, loading states, and responsive behavior.

### Success Criteria

- [ ] Tests render with sample data
- [ ] Tests verify all columns display correctly
- [ ] Tests check loading skeleton appears
- [ ] Tests pass with 100% coverage

### 🧠 Planning Reasoning

Immediate testing after component creation catches interface issues early and ensures the component actually works as intended. The test verification confirms the component is testable and functional.

## Task 6: Create SearchInput Component

**DELIVERABLE**: src/components/accounts/SearchInput.tsx  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 2  
**ESTIMATED_TIME**: 15 minutes  

### Details

Create a search input component with debounced search functionality and clear button.

### Success Criteria

- [ ] Accepts value and onChange props
- [ ] Includes clear button when value exists
- [ ] Proper placeholder text
- [ ] Accessible with proper labels

### 🧠 Planning Reasoning

Search is a key requirement that needs to be responsive (<300ms). Building it as a separate component allows for easier testing of the debouncing logic and reusability.

## Task 7: Create SearchInput Tests

**DELIVERABLE**: src/components/accounts/SearchInput.test.tsx  
**VERIFY**: npm test SearchInput.test.tsx  
**DEPENDS**: Task 6  
**ESTIMATED_TIME**: 15 minutes  

### Details

Test SearchInput component functionality including user interaction and clear button behavior.

### Success Criteria

- [ ] Tests input value changes
- [ ] Tests clear button functionality
- [ ] Tests accessibility attributes
- [ ] All tests pass

### 🧠 Planning Reasoning

Search input needs testing to ensure user interactions work correctly. Immediate testing verifies the component interface and behavior before integration.

## Task 8: Create FilterDropdowns Component

**DELIVERABLE**: src/components/accounts/FilterDropdowns.tsx  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 2  
**ESTIMATED_TIME**: 20 minutes  

### Details

Create dropdown filters for account status and type with proper options and styling.

### Success Criteria

- [ ] Status dropdown (All/Active/Inactive)
- [ ] Type dropdown (All/Commercial/Residential)
- [ ] Proper TypeScript types for filter values
- [ ] Consistent styling with design requirements

### 🧠 Planning Reasoning

Filters are essential functionality that needs proper typing to ensure data integrity. Creating as separate component allows for easier testing and maintains single responsibility principle.

## Task 9: Create FilterDropdowns Tests

**DELIVERABLE**: src/components/accounts/FilterDropdowns.test.tsx  
**VERIFY**: npm test FilterDropdowns.test.tsx  
**DEPENDS**: Task 8  
**ESTIMATED_TIME**: 15 minutes  

### Details

Test filter dropdown functionality and option selection behavior.

### Success Criteria

- [ ] Tests dropdown option rendering
- [ ] Tests selection changes
- [ ] Tests filter reset functionality
- [ ] All tests pass

### 🧠 Planning Reasoning

Filter components need verification that options are correctly rendered and selection changes propagate properly. Testing ensures the component works before integration.

## Task 10: Git Commit - Core Components

**DELIVERABLE**: Git commit with components from tasks 4-9  
**VERIFY**: git log --oneline -1 | grep -q "feat(accounts):"  
**DEPENDS**: Task 5, Task 7, Task 9  
**ESTIMATED_TIME**: 5 minutes  

### Details

Commit AccountsTable, SearchInput, and FilterDropdowns components with their tests.

### Success Criteria

- [ ] All component files staged and committed
- [ ] Commit message follows convention
- [ ] No uncommitted changes remain

### 🧠 Planning Reasoning

Creating a checkpoint after core components ensures we have a clean rollback point if integration becomes problematic. The grep verification ensures our commit message follows team conventions.

## Task 11: Create Pagination Component

**DELIVERABLE**: src/components/accounts/Pagination.tsx  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 2  
**ESTIMATED_TIME**: 25 minutes  

### Details

Create pagination component with previous/next buttons, page info display, and page size selector.

### Success Criteria

- [ ] Previous/Next buttons with proper disabled states
- [ ] Current page display (e.g., "1-20 of 45")
- [ ] Page size selector (10, 20, 50)
- [ ] Proper accessibility attributes

### 🧠 Planning Reasoning

Pagination is complex enough to warrant its own component and is required for the 1000+ accounts performance requirement. Building separately allows focused testing of edge cases.

## Task 12: Create Pagination Tests

**DELIVERABLE**: src/components/accounts/Pagination.test.tsx  
**VERIFY**: npm test Pagination.test.tsx  
**DEPENDS**: Task 11  
**ESTIMATED_TIME**: 20 minutes  

### Details

Test pagination component including button states, page info display, and page size changes.

### Success Criteria

- [ ] Tests button disabled states
- [ ] Tests page info calculation
- [ ] Tests page size selector
- [ ] Tests edge cases (first/last page)

### 🧠 Planning Reasoning

Pagination has complex state logic that needs thorough testing. Edge cases like first/last page are critical for user experience and need verification.

## Task 13: Create useAccountsData Hook

**DELIVERABLE**: src/hooks/useAccountsData.ts  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 2  
**ESTIMATED_TIME**: 25 minutes  

### Details

Create custom hook to manage accounts data fetching, filtering, and pagination state.

### Success Criteria

- [ ] Manages search, filter, and pagination state
- [ ] Integrates with accounts API
- [ ] Returns loading and error states
- [ ] Implements client-side filtering for responsiveness

### 🧠 Planning Reasoning

Centralizing data logic in a hook separates concerns and makes the main page component cleaner. This is where the <300ms search requirement will be implemented through client-side filtering.

## Task 14: Create useAccountsData Tests

**DELIVERABLE**: src/hooks/useAccountsData.test.ts  
**VERIFY**: npm test useAccountsData.test.ts  
**DEPENDS**: Task 13  
**ESTIMATED_TIME**: 20 minutes  

### Details

Test custom hook functionality including state management and API integration.

### Success Criteria

- [ ] Tests initial state
- [ ] Tests filter state changes
- [ ] Tests API integration (mocked)
- [ ] Tests error handling

### 🧠 Planning Reasoning

The hook contains critical business logic that needs testing. Testing ensures state management works correctly and API integration is properly handled.

## Task 15: Wire SearchInput to Filter State

**DELIVERABLE**: Updated AccountsTable and page integration  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 6, Task 13  
**ESTIMATED_TIME**: 15 minutes  

### Details

Connect SearchInput component to the useAccountsData hook for real-time filtering.

### Success Criteria

- [ ] Search input updates filter state
- [ ] Table re-renders with filtered data
- [ ] Search persists in URL parameters
- [ ] Type checking passes

### 🧠 Planning Reasoning

This integration task verifies that the search functionality actually works end-to-end. URL persistence is a specific requirement from the user story.

## Task 16: Wire FilterDropdowns to Filter State

**DELIVERABLE**: Updated FilterDropdowns and page integration  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 8, Task 13  
**ESTIMATED_TIME**: 15 minutes  

### Details

Connect FilterDropdowns component to the useAccountsData hook for status and type filtering.

### Success Criteria

- [ ] Dropdown selections update filter state
- [ ] Table re-renders with filtered data
- [ ] Filters persist in URL parameters
- [ ] Clear filters button resets state

### 🧠 Planning Reasoning

Integration task ensures filter dropdowns work with the data hook. URL persistence is required per user story for shareable links.

## Task 17: Wire Pagination to Data Hook

**DELIVERABLE**: Updated Pagination and page integration  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 11, Task 13  
**ESTIMATED_TIME**: 15 minutes  

### Details

Connect Pagination component to useAccountsData hook for page navigation and size changes.

### Success Criteria

- [ ] Page navigation updates data hook state
- [ ] Page size changes trigger data refresh
- [ ] Pagination info displays correctly
- [ ] URL reflects current page

### 🧠 Planning Reasoning

Pagination integration is critical for handling large datasets. This ensures the 1000+ accounts performance requirement is met through proper pagination.

## Task 18: Git Commit - Integration Complete

**DELIVERABLE**: Git commit with integration changes  
**VERIFY**: git log --oneline -1 | grep -q "feat(accounts):"  
**DEPENDS**: Task 15, Task 16, Task 17  
**ESTIMATED_TIME**: 5 minutes  

### Details

Commit all integration changes connecting components to data management.

### Success Criteria

- [ ] All integration files committed
- [ ] Commit message follows convention
- [ ] No uncommitted changes remain

### 🧠 Planning Reasoning

Creating a checkpoint after integration ensures we have a working dashboard before adding error handling and polish. This is a critical milestone.

## Task 19: Add Error Boundary and States

**DELIVERABLE**: Updated page with error handling  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 1, Task 13  
**ESTIMATED_TIME**: 20 minutes  

### Details

Add error boundary, loading states, and empty state handling to the accounts page.

### Success Criteria

- [ ] Error boundary catches and displays API errors
- [ ] Loading skeleton displays during data fetch
- [ ] Empty state shows when no accounts match filters
- [ ] Error messages include retry functionality

### 🧠 Planning Reasoning

Error handling is required per the user story and is critical for production reliability. This task ensures all edge cases from the test scenarios are handled.

## Task 20: Add Accessibility Features

**DELIVERABLE**: Updated components with a11y attributes  
**VERIFY**: npm run type-check  
**DEPENDS**: Task 4, Task 6, Task 8, Task 11  
**ESTIMATED_TIME**: 25 minutes  

### Details

Add WCAG 2.1 AA compliant accessibility features to all components.

### Success Criteria

- [ ] Proper ARIA labels on interactive elements
- [ ] Keyboard navigation works for all controls
- [ ] Screen reader friendly table headers
- [ ] Focus management for pagination

### 🧠 Planning Reasoning

Accessibility is a technical requirement (WCAG 2.1 AA). Adding this as a separate task ensures proper focus on a11y without rushing through during component creation.

## Task 21: Performance Optimization

**DELIVERABLE**: Optimized components and data fetching  
**VERIFY**: npm run build  
**DEPENDS**: Task 13, Task 18  
**ESTIMATED_TIME**: 20 minutes  

### Details

Optimize for performance requirements: <2s page load, <300ms search response, Lighthouse >90.

### Success Criteria

- [ ] Client-side search responds under 300ms
- [ ] Unnecessary re-renders eliminated
- [ ] Proper loading states prevent layout shift
- [ ] Build completes without warnings

### 🧠 Planning Reasoning

Performance is explicitly measured in the success metrics. This task ensures the specific timing requirements are met and prevents regression through the build verification.

## Task 22: Final Integration Tests

**DELIVERABLE**: src/app/accounts/page.test.tsx  
**VERIFY**: npm test page.test.tsx  
**DEPENDS**: Task 19, Task 20, Task 21  
**ESTIMATED_TIME**: 25 minutes  

### Details

Create integration tests for the complete accounts dashboard functionality.

### Success Criteria

- [ ] Tests full search and filter flow
- [ ] Tests pagination navigation
- [ ] Tests error states and recovery
- [ ] Tests loading states

### 🧠 Planning Reasoning

Integration tests verify the complete user journey works end-to-end. This catches issues that unit tests might miss and ensures all requirements are met.

## Task 23: Final Git Commit and Verification

**DELIVERABLE**: Final commit with complete feature  
**VERIFY**: git status --porcelain | wc -l  
**DEPENDS**: Task 22  
**ESTIMATED_TIME**: 10 minutes  

### Details

Final commit of the complete accounts dashboard and verify clean working directory.

### Success Criteria

- [ ] All files committed with proper message
- [ ] Working directory is clean (wc -l returns 0)
- [ ] Feature branch ready for review
- [ ] No console errors in development

### 🧠 Planning Reasoning

Final verification ensures the feature is complete and ready for code review. Clean working directory verification prevents accidentally leaving uncommitted changes.

## SUMMARY

**TOTAL TASKS**: 23  
**TOTAL TIME**: 380 minutes (6.3 hours)  
**COMPONENT TASKS**: 8 (with immediate tests)  
**INTEGRATION TASKS**: 4  
**GIT COMMITS**: 4  
**VERIFICATION CHECKPOINTS**: 23  

### Key Patterns Followed

- ✅ Each task under 30 minutes
- ✅ Immediate test after each component
- ✅ Git commits every 3-4 tasks
- ✅ Simple, reliable verification commands
- ✅ Consistent file naming (PascalCase components)
- ✅ Specific deliverables for each task
- ✅ Planning reasoning for each task

### Requirements Coverage

- ✅ Display requirements (Tasks 4-5)
- ✅ Search & filter capabilities (Tasks 6-9, 15-16)
- ✅ Pagination (Tasks 11-12, 17)
- ✅ User experience (Tasks 19-21)
- ✅ Technical requirements (All tasks)
- ✅ Test scenarios (Task 22)
- ✅ Success metrics (Task 21) 