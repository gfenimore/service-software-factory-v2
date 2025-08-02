# Accounts V1.0 Interaction Design

**Purpose**: Detailed interaction specification for Master View

## Layout Specifications

### Desktop Layout (1024px+)

```
┌─────────────┬─────────────────┬──────────────────────┐
│ Accounts    │ Related Records │ Record Details       │
│ 300px       │ 400px           │ Remaining            │
│ (fixed)     │ (fixed)         │ (flexible)           │
└─────────────┴─────────────────┴──────────────────────┘
```

### Tablet Layout (768px - 1023px)

```
┌─────────────┬─────────────────┐
│ Accounts    │ Active Panel    │
│ 250px       │ Remaining       │
│ (collapsible)│ (Related or     │
│             │ Details)        │
└─────────────┴─────────────────┘
```

### Mobile Layout (< 768px)

```
┌─────────────────────────────────┐
│ Single Panel with Navigation    │
│ [← Back] Current View           │
│                                 │
│ Content (Accounts, Related,     │
│ or Details based on navigation) │
└─────────────────────────────────┘
```

## Left Panel: Account List

### Header Section

```
┌─────────────────────────────────┐
│ 🔍 [Search accounts...]         │
│ Status: [All ▼] Balance: [All ▼]│
│ ─────────────────────────────── │
│ 247 accounts found              │
└─────────────────────────────────┘
```

### Account Row Layout

```
┌─────────────────────────────────┐
│ ABC Pest Control    [🟢 Active] │
│ John Smith • (555) 123-4567     │
│ $1,250 overdue • Last: 3 days   │
└─────────────────────────────────┘
```

### Row Data Elements:

- **Company Name** (primary, bold)
- **Status Indicator** (🟢 Active, 🔴 Inactive, 🟡 On Hold)
- **Primary Contact** (name only)
- **Phone Number** (clickable for dial)
- **Financial Alert** (if balance > 0)
- **Last Service** (relative time: "3 days", "2 weeks")

### Interactions:

- **Click row**: Select account, update middle panel
- **Hover**: Highlight row, show quick actions tooltip
- **Search**: Live filter as user types
- **Filters**: Immediate update of list
- **Scroll**: Virtual scrolling for 1000+ accounts

## Middle Panel: Related Records

### When No Account Selected:

```
┌─────────────────────────────────┐
│    Select an account to view    │
│         related records         │
└─────────────────────────────────┘
```

### When Account Selected:

```
┌─────────────────────────────────┐
│ ABC Pest Control                │
│ Primary: John Smith             │
│ Phone: (555) 123-4567          │
│ Balance: $1,250 (2 overdue)     │
│ ─────────────────────────────── │
│ 📍 Locations (3)               │
│ • Main Office - 123 Main St    │
│   👤 John S. (On-site) + others│
│ • Warehouse - 456 Industrial   │
│   👤 Tom W. (Manager) + 1 other │
│ • Storage - 789 Storage Way     │
│   👤 Use Main Office contacts   │
│ ─────────────────────────────── │
│ 👥 Account Contacts (4)        │
│ • John Smith (Primary) 🔗       │
│ • Jane Doe (Billing)           │
│ • Mike Jones (Manager)          │
│ • Sarah Wilson (Admin)          │
│ ─────────────────────────────── │
│ 🔧 Service Items (8)           │
│ • Office Interior               │
│ • Office Exterior               │
│ • Warehouse Floor               │
│ • Loading Dock                  │
│ ─────────────────────────────── │
│ 📋 Recent Work Orders (5)       │
│ • WO-2025-001 (Completed)      │
│ • WO-2025-002 (Scheduled)      │
│ • WO-2024-156 (Completed)      │
│ ─────────────────────────────── │
│ 💰 Invoices (6)                │
│ • INV-2025-001 ($450) Overdue  │
│ • INV-2025-002 ($800) Paid     │
│ • INV-2024-234 ($650) Paid     │
│ ─────────────────────────────── │
│ 📞 Communications (12)          │
│ • Called 2 hours ago            │
│ • Email sent yesterday          │
│ • Note added 3 days ago         │
└─────────────────────────────────┘
```

### Section Headers:

- **Icon + Label + Count**
- **Expandable/Collapsible** (user preference)
- **"View All" link** for sections with many records

### List Items:

- **2-line maximum** per item
- **Status indicators** where relevant
- **Clickable** to show details in right panel

## Right Panel: Record Details

### When No Record Selected:

```
┌─────────────────────────────────┐
│   Select a record to view       │
│        detailed information     │
└─────────────────────────────────┘
```

### Location Details Example:

```
┌─────────────────────────────────┐
│ 📍 Main Office                  │
│ ─────────────────────────────── │
│ Address:                        │
│ 123 Main Street                 │
│ Suite 100                       │
│ Miami, FL 33101                 │
│                                 │
│ Access Information:             │
│ • Key available at front desk   │
│ • Visitor parking in lot B     │
│ • Call ahead for after hours   │
│                                 │
│ Location Contacts:              │
│ • John Smith (On-site) 🔗       │
│   555-1234 • Available: 8-5 M-F│
│   "Also Primary Account Contact"│
│ • Tom Wilson (Emergency)        │
│   555-9999 • After hours only   │
│   "Security supervisor"         │
│ • Jane Doe (Notification) 🔗    │
│   555-5678 • Send completion    │
│   "Also Billing Contact"       │
│                                 │
│ Service Items at Location:      │
│ • Office Interior (Monthly)     │
│ • Office Exterior (Quarterly)  │
│                                 │
│ Recent Work Orders:             │
│ • WO-2025-001 (Completed)      │
│   Contact: John Smith 🔗        │
│   Technician: Sarah Martinez    │
│   Duration: 2 hours             │
│   [View Details...]             │
│                                 │
│ [📷 Photos (3)] [📝 Add Note]   │
└─────────────────────────────────┘
```

### Work Order Summary Card:

```
┌─────────────────────────────────┐
│ 📋 WO-2025-001                  │
│ ─────────────────────────────── │
│ Status: Completed ✅            │
│ Date: January 28, 2025          │
│ Technician: Sarah Martinez      │
│ Duration: 2 hours               │
│                                 │
│ Services Performed:             │
│ • Interior treatment            │
│ • Perimeter inspection         │
│                                 │
│ Materials Used:                 │
│ • Liquid barrier spray         │
│ • Granular bait stations       │
│                                 │
│ Customer Notes:                 │
│ "Found ant activity near        │
│ kitchen entrance. Applied       │
│ treatment and set monitoring    │
│ stations."                      │
│                                 │
│ [View Full Details...]          │
│ [Photos (4)] [Customer Sign-off]│
└─────────────────────────────────┘
```

## Modal Window: Full Record Details

### Triggered By:

- **"View Details..." link** in summary cards
- **"View Full Details..." button** at bottom of cards

### Modal Content:

- **Full-screen overlay** (dark background)
- **Large content panel** (80% of screen width/height)
- **Close button** (X in top right)
- **Navigation** (Previous/Next record if applicable)

### Work Order Full Details Modal:

```
┌─────────────────────────────────────────────────────────┐
│ Work Order WO-2025-001                            [X]   │
├─────────────────────────────────────────────────────────┤
│ Customer: ABC Pest Control                              │
│ Location: Main Office - 123 Main Street                 │
│ Technician: Sarah Martinez                              │
│ Date: January 28, 2025                                  │
│ Duration: 2 hours (10:00 AM - 12:00 PM)               │
│ Status: Completed ✅                                    │
│                                                         │
│ [Header Section with key info]                          │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ Services Performed:                                     │
│ ☑ Interior perimeter treatment                         │
│ ☑ Kitchen area inspection                              │
│ ☑ Bathroom area inspection                             │
│ ☑ Break room treatment                                 │
│ ☑ Entry point sealing                                  │
│                                                         │
│ Materials Used:                                         │
│ • Liquid barrier spray (2 oz)                          │
│ • Granular bait stations (4 units)                     │
│ • Caulk sealer (1 tube)                               │
│                                                         │
│ Findings & Observations:                                │
│ "Found moderate ant activity concentrated near the      │
│ kitchen entrance and break room. Evidence suggests     │
│ entry point through gap under door frame. Applied      │
│ liquid barrier treatment to affected areas and         │
│ placed monitoring stations. Sealed entry point with    │
│ caulk. Recommended follow-up in 2 weeks."             │
│                                                         │
│ Customer Notes:                                         │
│ "Customer reported increased activity over past week.   │
│ Very satisfied with thoroughness of treatment.         │
│ Requested we focus on break room area during next      │
│ visit."                                                 │
│                                                         │
│ Photos: [Photo 1] [Photo 2] [Photo 3] [Photo 4]       │
│                                                         │
│ Customer Signature: ✅ John Smith (Digital signature)   │
│ Time Completed: 12:15 PM                               │
│                                                         │
│ [Edit Work Order] [Print Report] [Email Customer]      │
└─────────────────────────────────────────────────────────┘
```

## Key Interactions Summary:

1. **Select Account** → Middle panel updates with related records
2. **Select Related Record** → Right panel shows summary card
3. **Click "View Details"** → Modal opens with complete information
4. **Search/Filter** → Account list updates immediately
5. **Mobile Navigation** → Breadcrumb navigation between panels

## Performance Considerations:

- **Virtual scrolling** for account list (1000+ accounts)
- **Lazy loading** for record details (load on selection)
- **Debounced search** (300ms delay before filter)
- **Cached recent selections** (faster switching between accounts)
- **Progressive image loading** (thumbnails first, full size on demand)
