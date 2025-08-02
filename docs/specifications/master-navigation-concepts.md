# Master Navigation Concepts

**Purpose**: Fixed left navigation for task-driven workflows

## Navigation Structure

### Primary Navigation (Always Visible)

```
📊 Dashboard
👥 Accounts
⚙️  Operations
🔧 Admin
```

### Secondary Navigation (Context-Sensitive)

```
📊 Dashboard
   └─ (no sub-items, single view with drill-downs)

👥 Accounts
   ├─ Directory        (account search/list)
   ├─ Locations        (service locations across all accounts)
   ├─ Service Items    (equipment/areas being serviced)
   └─ Communications   (all customer interactions)

⚙️ Operations
   ├─ Work Orders      (create, manage, track)
   ├─ Scheduling       (calendar, routes, assignments)
   ├─ Technicians      (staff management, availability)
   └─ Field Mobile     (mobile app dashboard)

🔧 Admin
   ├─ Users            (staff accounts, permissions)
   ├─ Business Config  (services, pricing, workflows)
   ├─ System Data      (reference tables, templates)
   └─ Reports          (custom reports, exports)
```

## Layout Wireframe

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Pest Control Pro                    [User Menu] │
├──────────┬──────────────────────────────────────────────┤
│ 📊 Dashboard │ MAIN CONTENT AREA                        │
│ 👥 Accounts  │                                          │
│   Directory  │ [Page Title]                             │
│   Locations  │ [Action Buttons]                         │
│   Items      │                                          │
│   Comms      │ [Content - Tables, Forms, Details]       │
│ ⚙️ Operations │                                          │
│   Work Orders│                                          │
│   Scheduling │                                          │
│   Technicians│                                          │
│   Field      │                                          │
│ 🔧 Admin     │                                          │
│   Users      │                                          │
│   Config     │                                          │
│   Data       │                                          │
│   Reports    │                                          │
│              │                                          │
│ [200px]      │ [Remaining width]                        │
└──────────────┴──────────────────────────────────────────┘
```

## Smart Navigation Behaviors

### Active State Indication

- **Current module**: Bold + accent color background
- **Current sub-item**: Indent + accent color text
- **Breadcrumb**: Show current path in main content header

### Task-Driven Shortcuts

```typescript
// Context-aware quick actions
interface QuickAction {
  label: string
  icon: string
  shortcut: string
  action: () => void
}

// Example: When viewing an account
const accountQuickActions: QuickAction[] = [
  { label: 'New Work Order', icon: '➕', shortcut: 'Ctrl+N', action: createWorkOrder },
  { label: 'Call Customer', icon: '📞', shortcut: 'Ctrl+P', action: initiateCall },
  { label: 'View History', icon: '📋', shortcut: 'Ctrl+H', action: showHistory },
  { label: 'Send Invoice', icon: '💰', shortcut: 'Ctrl+I', action: generateInvoice },
]
```

### Responsive Behavior

```css
/* Desktop: Full sidebar */
@media (min-width: 1024px) {
  .sidebar {
    width: 200px;
    position: fixed;
  }
  .main-content {
    margin-left: 200px;
  }
}

/* Tablet: Collapsible sidebar */
@media (max-width: 1023px) {
  .sidebar {
    width: 60px; /* Icons only */
    transform: translateX(-140px); /* Hidden by default */
  }
  .sidebar.open {
    transform: translateX(0);
  }
}

/* Mobile: Bottom navigation */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 60px;
    flex-direction: row; /* Horizontal layout */
  }
}
```

## Role-Based Filtering

### Owner Role (Full Access)

```
📊 Dashboard     ✅ Full access
👥 Accounts      ✅ All accounts, financial data
⚙️ Operations    ✅ All work orders, scheduling
🔧 Admin         ✅ All settings, users, reports
```

### Manager Role (Operational Focus)

```
📊 Dashboard     ✅ Operational metrics only
👥 Accounts      ✅ Account details, limited financial
⚙️ Operations    ✅ Full access
🔧 Admin         🔒 Users only, no system config
```

### Admin Role (Customer Service Focus)

```
📊 Dashboard     🔒 Limited to customer metrics
👥 Accounts      ✅ Full customer service access
⚙️ Operations    👀 View-only work orders
🔧 Admin         ✅ Users, business config
```

## Navigation State Management

### URL Structure

```
/dashboard
/accounts
/accounts/directory
/accounts/directory?search=abc&status=active
/accounts/[id]
/accounts/[id]/locations
/accounts/[id]/work-orders
/operations/work-orders
/operations/scheduling
/admin/users
```

### Context Preservation

```typescript
// Remember where user was in each module
interface NavigationState {
  lastAccountViewed?: string
  lastWorkOrderFilter?: WorkOrderFilter
  lastScheduleDate?: string
  accountDetailTab?: 'overview' | 'locations' | 'work-orders' | 'billing'
}
```
