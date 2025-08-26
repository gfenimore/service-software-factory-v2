# 2. Efficiency-First Design System (Updated for Accounts Module)

**Purpose**: Optimize for business productivity with specific patterns from Accounts module

## Design Philosophy: "Business Tool, Not Consumer App"

### Core Principles

1. **Information Density**: Show maximum relevant data without clutter
2. **Click Efficiency**: Minimize clicks to complete common tasks
3. **Scan-ability**: Clear hierarchies and consistent patterns
4. **Speed**: Fast loading, immediate feedback, keyboard shortcuts
5. **Reliability**: Consistent behavior, clear error states

## Design System Choice: Tailwind + Custom Components

### Why This Approach

- **Fast Development**: Pre-built utility classes
- **Consistent Spacing**: Systematic sizing scale
- **Easy Customization**: Domain-specific colors without complexity
- **Small Bundle**: Only used utilities included
- **Developer Friendly**: Easy for agents to implement

### Color Strategy: Semantic + Domain

```typescript
// Base semantic colors (all domains)
const semanticColors = {
  success: 'green-600', // Completed, active, positive
  warning: 'yellow-600', // In progress, attention needed
  danger: 'red-600', // Overdue, failed, critical
  info: 'blue-600', // Scheduled, informational
  neutral: 'gray-600', // Inactive, disabled, secondary
}

// Domain accent colors (for branding)
const domainColors = {
  pestControl: {
    primary: 'emerald-600', // Green for pest control
    accent: 'emerald-100',
  },
  marine: {
    primary: 'blue-600', // Blue for marine
    accent: 'blue-100',
  },
  hvac: {
    primary: 'orange-600', // Orange for HVAC
    accent: 'orange-100',
  },
}
```

## Layout System: Three-Column Master Pattern

### Standard Layout Dimensions

```css
/* Desktop (1024px+) */
.three-column-layout {
  display: grid;
  grid-template-columns: 300px 400px 1fr;
  height: calc(100vh - 64px); /* Account for header */
}

.left-panel {
  width: 300px;
  border-right: 1px solid theme('colors.gray.200');
  background: theme('colors.gray.50');
}

.middle-panel {
  width: 400px;
  border-right: 1px solid theme('colors.gray.200');
  background: white;
}

.right-panel {
  flex: 1;
  background: white;
}

/* Tablet (768px - 1023px) */
@media (max-width: 1023px) {
  .three-column-layout {
    grid-template-columns: 250px 1fr;
  }
  .right-panel {
    display: none;
  } /* Show in overlay */
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .three-column-layout {
    grid-template-columns: 1fr;
  }
  .middle-panel,
  .right-panel {
    display: none;
  } /* Navigation-based */
}
```

## Component Library: Accounts Module Patterns

### Account List Row Component

```typescript
// Account row with 2-3 lines of structured data
<AccountRow account={account}>
  <AccountRow.Header>
    <CompanyName>{account.name}</CompanyName>
    <StatusIndicator status={account.status} />
  </AccountRow.Header>
  <AccountRow.Contact>
    <ContactName>{account.primary_contact}</ContactName>
    <PhoneNumber href={`tel:${account.phone}`}>{account.phone}</PhoneNumber>
  </AccountRow.Contact>
  <AccountRow.Meta>
    {account.balance > 0 && (
      <BalanceAlert amount={account.balance} overdue={account.is_overdue} />
    )}
    <LastService date={account.last_service_date} />
  </AccountRow.Meta>
</AccountRow>
```

### Visual Relationship Indicators

```typescript
// Cross-reference link icon
<ContactName>
  John Smith
  {isAccountContact && <CrossReferenceIcon title="Also Account Contact" />}
</ContactName>

// Role indicators
<ContactRole>
  {contact.roles.map(role => (
    <RoleBadge key={role} variant="subtle">{role}</RoleBadge>
  ))}
</ContactRole>

// CSS for relationship indicators
.cross-reference-icon {
  @apply inline-block w-3 h-3 ml-1 text-blue-500;
  content: "🔗";
}

.role-badge {
  @apply inline-block px-2 py-0.5 text-xs rounded;
  @apply bg-gray-100 text-gray-700;
}
```

### Summary Card Component

```typescript
// Summary card with modal trigger
<SummaryCard>
  <SummaryCard.Header>
    <Icon type={recordType} />
    <Title>{record.title}</Title>
  </SummaryCard.Header>

  <SummaryCard.Content>
    <KeyDetails>
      {/* 3-4 most important fields */}
    </KeyDetails>
  </SummaryCard.Content>

  <SummaryCard.Footer>
    <ViewDetailsLink onClick={() => openModal(record)}>
      View Details...
    </ViewDetailsLink>
  </SummaryCard.Footer>
</SummaryCard>

// CSS for summary cards
.summary-card {
  @apply border border-gray-200 rounded-lg p-4 space-y-3;
  @apply hover:border-gray-300 hover:shadow-sm transition-all;
}
```

### Status Indicator System

```typescript
// Standardized status indicators
const statusConfig = {
  active: { icon: '🟢', color: 'green', label: 'Active' },
  inactive: { icon: '🔴', color: 'red', label: 'Inactive' },
  on_hold: { icon: '🟡', color: 'yellow', label: 'On Hold' },
  completed: { icon: '✅', color: 'green', label: 'Completed' },
  overdue: { icon: '⚠️', color: 'red', label: 'Overdue' },
  scheduled: { icon: '📅', color: 'blue', label: 'Scheduled' }
}

<StatusIndicator status="active" />
// Renders: 🟢 Active

<StatusBadge status="overdue" />
// Renders: <span class="bg-red-100 text-red-800">⚠️ Overdue</span>
```

### Modal Window System

```typescript
// Full-screen modal for detailed views
<Modal size="large" onClose={handleClose}>
  <Modal.Header>
    <Modal.Title>Work Order WO-2025-001</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>

  <Modal.Content>
    {/* Full record details */}
  </Modal.Content>

  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>Close</Button>
    <Button variant="primary" onClick={handleEdit}>Edit</Button>
  </Modal.Footer>
</Modal>

// Modal sizing
.modal-large {
  @apply fixed inset-0 z-50;
  @apply flex items-center justify-center;
  @apply bg-black bg-opacity-50;
}

.modal-content-large {
  @apply bg-white rounded-lg shadow-xl;
  @apply w-full max-w-4xl h-full max-h-[90vh];
  @apply overflow-hidden;
}
```

## Typography: Readable and Efficient

```css
/* Optimized for business use */
.text-company-name {
  @apply text-base font-semibold text-gray-900;
}

.text-contact-name {
  @apply text-sm font-medium text-gray-700;
}

.text-phone-number {
  @apply text-sm text-blue-600 hover:text-blue-800;
  @apply cursor-pointer; /* Clickable for dialing */
}

.text-meta-info {
  @apply text-xs text-gray-500;
}

.text-section-header {
  @apply text-sm font-semibold text-gray-900 uppercase tracking-wide;
}

.text-record-title {
  @apply text-base font-medium text-gray-900;
}

.text-field-label {
  @apply text-xs font-medium text-gray-600 uppercase;
}
```

## Spacing: Optimized for Three-Column Layout

```css
/* Panel spacing */
.panel-padding {
  @apply p-4;
}
.panel-section-spacing {
  @apply space-y-4;
}
.section-header-spacing {
  @apply mb-2;
}

/* List item spacing */
.list-item-spacing {
  @apply py-3 px-4 border-b border-gray-100;
}
.list-item-hover {
  @apply hover:bg-gray-50;
}

/* Card spacing */
.summary-card-spacing {
  @apply p-4 space-y-3;
}
.summary-card-margin {
  @apply mb-3;
}

/* Dense information display */
.info-grid {
  @apply grid grid-cols-1 gap-1; /* Tight spacing for contact info */
}

.info-row {
  @apply flex justify-between items-center;
}
```

## Interactive States

### Search and Filter Components

```typescript
// Live search with immediate feedback
<SearchInput
  placeholder="Search accounts..."
  onChange={handleSearch}
  debounceMs={300}
/>

// Filter dropdowns
<FilterSelect
  options={statusOptions}
  value={selectedStatus}
  onChange={handleStatusFilter}
  placeholder="All Status"
/>

// CSS for search/filter
.search-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md bg-white;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}
```

### Hover and Selection States

```css
/* List item interactions */
.list-item {
  @apply cursor-pointer transition-colors duration-150;
}

.list-item:hover {
  @apply bg-gray-50;
}

.list-item.selected {
  @apply bg-blue-50 border-l-4 border-l-blue-500;
}

/* Button interactions */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md;
  @apply hover:bg-blue-700 active:bg-blue-800;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
  @apply transition-colors duration-150;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 px-4 py-2 rounded-md;
  @apply hover:bg-gray-300 active:bg-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-gray-500;
}
```

## Accessibility: Compliant but Efficient

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader**: Proper labels for all relationship indicators
- **Color Independence**: Never rely only on color for status
- **Focus Indicators**: Clear but not distracting (ring-2 pattern)
- **High Contrast Mode**: Support for vision impairments

## Performance Optimizations

- **Virtual Scrolling**: For 1000+ account lists
- **Image Lazy Loading**: For work order photos
- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Cached Selections**: Remember last selected account/record

## Error Handling: Clear and Actionable

```typescript
// Business-context error messages
<ErrorMessage variant="warning">
  Unable to load account details. The account may have been deleted
  or you may not have permission to view it.
  <ErrorActions>
    <Button variant="secondary" onClick={handleRefresh}>Refresh</Button>
    <Button variant="primary" onClick={handleContactSupport}>Contact Support</Button>
  </ErrorActions>
</ErrorMessage>
```
