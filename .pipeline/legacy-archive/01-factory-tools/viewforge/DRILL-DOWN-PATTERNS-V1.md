# Drill-Down Patterns v1.0: The Other Essential View Pattern
*Beyond Master-Detail: When You Need to Go Deep*

## 🎯 The Complementary Pattern

While Master View shows **breadth** (Account → ALL Locations → ALL Work Orders), 
Drill-Down shows **depth** (Account → Details → Contacts → Communications Log)

**Key Difference:**
- Master View = See everything at once (horizontal scan)
- Drill-Down = Progressive disclosure (vertical dive)

## 📐 Core Pattern: The Detail Drill-Down

### Pattern Name: `detail-drill-down` (DDD)
```
Primary Entity → Sub-View Tabs → Sub-Sub-View Panels
      ↓              ↓                    ↓
  (The Thing)   (Its Aspects)     (Deep Details)
```

**Example:**
```
Account #123 
    ├── [Details] [Contacts] [Locations] [Billing] [History]
    │                ↓
    │          Contact: John Smith
    │              ├── [Info] [Communications] [Documents]
    │              │            ↓
    │              │      Communication Log
    │              │      - 1/15: Called about service
    │              │      - 1/10: Emailed invoice
    │              │      - 1/05: Scheduled appointment
```

## 🔄 Navigation Patterns

### 1. Tab-Based Drill-Down (Most Common)
```
┌─────────────────────────────────────────┐
│ Account: Johnson Residence               │
├─────────────────────────────────────────┤
│ [Details] [*Contacts*] [Locations] [...] │ ← Sub-views
├─────────────────────────────────────────┤
│ Primary Contact: Bob Johnson             │
│ ┌───────────────────────────────────┐   │
│ │ [Info] [*Comm Log*] [Documents]   │   │ ← Sub-sub-views
│ ├───────────────────────────────────┤   │
│ │ • 1/20: Called - Confirmed appt   │   │
│ │ • 1/15: Email - Quote sent        │   │
│ │ • 1/10: Text - Reminder sent      │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 2. Accordion Drill-Down
```
Account: Johnson Residence
▼ Details
  Name: Johnson Residence
  Status: Active
  Balance: $0.00
  
▶ Contacts (3)
  ▼ Bob Johnson (Primary)
    Phone: 555-1234
    Email: bob@example.com
    ▶ Communication Log (12)
      • Recent: Called yesterday
      • Click to expand full log...
      
  ▶ Jane Johnson
  ▶ Emergency Contact

▶ Service Locations (2)
▶ Billing History
```

### 3. Modal/Overlay Drill-Down
```
Main View: Account List
    ↓ Click account
Modal: Account Details
    ↓ Click "View Contacts"
Nested Modal: Contacts
    ↓ Click contact
Nested Modal: Communication Log
```

### 4. Breadcrumb Navigation
```
Accounts > Johnson Residence > Contacts > Bob Johnson > Communications

[Back] [Up]                                    [Edit] [Delete]

Communication Log for Bob Johnson
┌────────────────────────────────┐
│ Date    Type    Subject        │
│ 1/20    Call    Confirmed      │
│ 1/15    Email   Quote          │
└────────────────────────────────┘
```

## 📊 Common Drill-Down Hierarchies

### Customer Service Domain
```
Account
├── Details (1:1)
├── Contacts (1:N)
│   └── Communications (1:N)
│       └── Attachments (1:N)
├── Service Locations (1:N)
│   └── Service History (1:N)
│       └── Service Notes (1:N)
├── Billing (1:1)
│   └── Invoices (1:N)
│       └── Line Items (1:N)
└── Documents (1:N)
    └── Versions (1:N)
```

### Work Order Domain
```
Work Order
├── Details (1:1)
├── Tasks (1:N)
│   └── Task Notes (1:N)
├── Materials (1:N)
│   └── Inventory Items (N:N)
├── Labor (1:N)
│   └── Time Entries (1:N)
├── Photos (1:N)
│   └── Annotations (1:N)
└── Customer Sign-off (1:1)
    └── Signature History (1:N)
```

## 🎨 State Management for Drill-Down

### State Complexity Levels

**Level 1: Stateless (Concept Line)**
- Each click = new page load
- Browser back button works naturally
- No JavaScript needed

**Level 2: Tab State (Prototype Line)**
```javascript
{
  primaryEntity: "account",
  primaryId: 123,
  activeTab: "contacts",
  selectedContact: 45,
  activeSubTab: "communications"
}
```

**Level 3: Full State Tree (Production Line)**
```javascript
{
  navigation: {
    path: ["accounts", "123", "contacts", "45", "communications"],
    breadcrumbs: ["Accounts", "Johnson", "Contacts", "Bob", "Log"]
  },
  expanded: {
    contacts: true,
    contact_45: true,
    communications: true
  },
  loaded: {
    account_123: true,
    contacts_123: true,
    contact_45: true,
    communications_45: false // Currently loading
  }
}
```

## 🔧 Configuration Schema for Drill-Down

### Simple Configuration (Tab-based)
```json
{
  "pattern": "detail-drill-down",
  "primary": "account",
  "tabs": [
    {
      "id": "details",
      "label": "Details",
      "component": "account-details",
      "type": "single"
    },
    {
      "id": "contacts",
      "label": "Contacts",
      "component": "contact-list",
      "type": "list",
      "drill-down": {
        "tabs": [
          {"id": "info", "label": "Contact Info"},
          {"id": "communications", "label": "Comm Log"},
          {"id": "documents", "label": "Documents"}
        ]
      }
    },
    {
      "id": "locations",
      "label": "Service Locations",
      "component": "location-list",
      "type": "list"
    }
  ]
}
```

### Accordion Configuration
```json
{
  "pattern": "accordion-drill-down",
  "sections": [
    {
      "id": "details",
      "label": "Account Details",
      "expanded": true,
      "data": "inline"
    },
    {
      "id": "contacts",
      "label": "Contacts",
      "expanded": false,
      "data": "lazy-load",
      "children": [
        {
          "id": "contact-{{id}}",
          "label": "{{name}}",
          "template": "contact-accordion-item",
          "children": ["communications", "documents"]
        }
      ]
    }
  ]
}
```

## 🎯 When to Use Which Pattern

### Use Master-Detail-Detail When:
- Need to see multiple entities at once
- Comparing across entities
- Task is "find and select"
- Workflow moves across entities
- Users need the "big picture"

### Use Drill-Down When:
- Focus is on ONE primary entity
- Need deep details about that entity
- Task is "review and edit"
- Information is hierarchical
- Users need comprehensive view

### Combine Both Patterns:
```
Master View: Account → Location → Work Order
                           ↓ Click work order
                    Drill-Down View:
                    Work Order Details
                    ├── Tasks
                    ├── Materials
                    └── Photos
```

## 📋 Implementation Priority

### v1.0 - Essential Drill-Down (NOW)
- Tab-based navigation only
- 2 levels deep maximum (tabs → sub-tabs)
- Static tab configuration
- Page refresh on tab change (Concept Line)

### v1.1 - Enhanced Drill-Down
- 3 levels deep
- Lazy loading of tab content
- Remember active tab in session
- No page refresh (React state)

### v2.0 - Advanced Drill-Down
- Unlimited depth
- Accordion option
- Modal option
- Breadcrumb navigation
- State persistence

## 💡 The Unifying Principle

Both patterns serve different mental models:

**Master View** = "Show me everything about my business"
- Mental model: Control panel
- User goal: Monitor and manage
- Navigation: Horizontal scanning

**Drill-Down** = "Tell me everything about this one thing"
- Mental model: File folder
- User goal: Understand and edit
- Navigation: Vertical diving

## 🚀 Configuration Simplicity for v1.0

### For ViewForge Layout Configurator:
```
Pattern: [Detail Drill-Down ▼]

Primary Entity: [Account ▼]

Configure Tabs:
┌─────────────────────────┐
│ + Add Tab               │
├─────────────────────────┤
│ ✓ Details (single)      │
│ ✓ Contacts (list) ▼     │
│   └─ ✓ Info            │
│   └─ ✓ Comm Log        │
│ ✓ Locations (list)      │
│ ✓ Billing (single)      │
└─────────────────────────┘

[Generate Configuration]
```

## 🎬 The Key Insight

**Master View and Drill-Down are complementary, not competing patterns.**

Together they provide:
- **Master View**: The forest (operational awareness)
- **Drill-Down**: The trees (detailed understanding)

Most applications need both. A complete sub-module might have:
- List View (find entities)
- Master View (see relationships)
- Detail View with Drill-Down (deep dive)
- Form View (create/edit)

---

*"Master View is for managers who need to see everything. Drill-Down is for workers who need to do something."*

*Both patterns are essential for a complete service management system.*