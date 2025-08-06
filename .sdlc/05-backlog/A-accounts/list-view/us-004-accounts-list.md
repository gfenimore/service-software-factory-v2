# US-004: Accounts List View (Reports)

## User Story

As a service company user
I want to view a list of all accounts
So I can see my customer base at a glance

## Acceptance Criteria

- I can navigate to Reports from the left navigation
- I can see a list of accounts with: Name, Status, Type, City
- I can see active accounts in normal text
- I can see inactive accounts in muted styling
- I can see a message when no accounts exist

## Business Rules

- BR1: Sort accounts alphabetically by name (case-insensitive)
- BR2: Show all accounts (no pagination in v1)
- BR3: Status must be "Active" or "Inactive" only
- BR4: Type must be "Commercial" or "Residential" only
- BR5: Deleted accounts (if any) should never display
- BR6: Empty state shows "No accounts found" message

## Gherkin Scenarios

### Scenario: Viewing accounts with different statuses

```gherkin
Given I have 5 active accounts and 3 inactive accounts
When I navigate to the Reports page
Then I should see 8 accounts total
And active accounts should display in normal text (text-gray-900)
And inactive accounts should display in muted text (text-gray-500)
```

### Scenario: Alphabetical sorting

```gherkin
Given I have accounts named "Zebra Inc", "Alpha Corp", "Beta LLC"
When I view the Reports page
Then "Alpha Corp" should appear first
And "Beta LLC" should appear second
And "Zebra Inc" should appear last
```

### Scenario: Empty state

```gherkin
Given there are no accounts in the system
When I navigate to the Reports page
Then I should see "No accounts found" message
And I should not see a table header
```

### Scenario: Navigation highlight

```gherkin
Given I am on any page
When I click "Reports" in the left navigation
Then I should be taken to /accounts/reports
And "Reports" should be highlighted in the navigation
```

## Technical Notes

- Use existing Supabase connection (no mock data needed)
- Leverage existing table components/patterns from navigation
- Follow established TypeScript patterns

## Out of Scope (v1)

- Search functionality
- Filters (status, type, etc.)
- Add/Edit/Delete operations
- Pagination
- Detail view
- Export functionality
