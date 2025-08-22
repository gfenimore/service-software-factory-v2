# Master View Patterns v1.0: Service Industry Foundation
*The Core Patterns That Drive ALL Service Management*

## 🎯 The Fundamental Truth

**"All services happen at a location"** - This is the atomic truth that simplifies everything.

This means:
- No location = No service = No work order
- Every cascade follows this natural hierarchy
- State management becomes obvious

## 📐 Core Pattern: The Service Cascade

### Pattern Name: `service-cascade-3`
```
Account → Service Locations → Work Orders
   ↓             ↓                 ↓
(WHO pays)  (WHERE we go)    (WHAT we do)
```

**Behavioral Rules:**
1. Select Account → Locations filter, Work Orders clear
2. Select Location → Work Orders filter for that location only
3. Change Account → Everything downstream clears (natural, expected)
4. No multi-select (clarity over complexity)

## 🔄 State Transitions (Deterministic)

```
State 1: Nothing Selected
├── Account Column: Show all
├── Location Column: "Select an account"
└── Work Order Column: "Select a location"

State 2: Account Selected
├── Account Column: Show all, highlight selected
├── Location Column: Show filtered by account
└── Work Order Column: "Select a location"

State 3: Account + Location Selected
├── Account Column: Show all, highlight selected
├── Location Column: Show filtered, highlight selected
└── Work Order Column: Show filtered by location

State 4: Account Changed
├── [Instant transition to State 2]
├── Previous location selection: CLEARED
└── Previous work orders: CLEARED
```

## 📊 Layout Patterns for v1.0

### 1. Primary Pattern: `master-detail-detail` (MDD)
```json
{
  "pattern": "master-detail-detail",
  "columns": 3,
  "relationships": [
    {"from": "master", "to": "detail-1", "cardinality": "1:N"},
    {"from": "detail-1", "to": "detail-2", "cardinality": "1:N"}
  ],
  "selection": {
    "master": "single",
    "detail-1": "single",
    "detail-2": "view-only"
  },
  "cascade": {
    "direction": "left-to-right",
    "clear-downstream": true
  }
}
```

**Use Cases:**
- Account → Locations → Work Orders
- Territory → Routes → Stops
- Building → Floors → Rooms
- Customer → Contracts → Services

### 2. Secondary Pattern: `master-detail` (MD)
```json
{
  "pattern": "master-detail",
  "columns": 2,
  "relationships": [
    {"from": "master", "to": "detail", "cardinality": "1:N"}
  ],
  "selection": {
    "master": "single",
    "detail": "single-or-action"
  }
}
```

**Use Cases:**
- Technician → Today's Work Orders
- Route → Stops
- Invoice → Line Items
- Equipment → Service History

### 3. Time-Based Pattern: `temporal-cascade` (TC)
```json
{
  "pattern": "temporal-cascade",
  "columns": 3,
  "relationships": [
    {"from": "time-period", "to": "entities", "cardinality": "1:N"},
    {"from": "entities", "to": "details", "cardinality": "1:N"}
  ],
  "special": "time-aware-filtering"
}
```

**Use Cases:**
- Week → Days → Work Orders
- Month → Locations → Services Performed
- Quarter → Technicians → Completions

### 4. Hub Pattern: `hub-and-spokes` (HS)
```json
{
  "pattern": "hub-and-spokes",
  "layout": "center-with-satellites",
  "relationships": [
    {"from": "hub", "to": "spoke-1", "cardinality": "1:N"},
    {"from": "hub", "to": "spoke-2", "cardinality": "1:N"},
    {"from": "hub", "to": "spoke-3", "cardinality": "1:1"}
  ]
}
```

**Use Cases:**
- Location → [Work Orders, Equipment, Contacts]
- Technician → [Skills, Territories, Schedule]
- Account → [Locations, Invoices, Contacts]

## 🎨 Visual Representation Language

### Conceptual Notation
```
Standard Cascade:
[A] ──1:N──> [B] ──1:N──> [C]

With Selection State:
[A•] ──1:N──> [B°] ──1:N──> [C ]
 •=selected    °=available    =empty

With Counts (future):
[A (12)] ──> [B (5)] ──> [C (0)]
```

### Empty State Messages

| Pattern | Column | State | Message |
|---------|--------|-------|---------|
| MDD | Middle | No parent selected | "Select an account to view locations" |
| MDD | Middle | Parent selected, no children | "No locations found for this account" |
| MDD | Right | No parent selected | "Select a location to view work orders" |
| MDD | Right | Parent selected, no children | "No work orders found for this location" |
| MD | Right | No parent selected | "Select an item from the left" |
| MD | Right | Parent selected, no children | "No items found" |

## 🔧 Configuration Schema v1.0

### Minimal Configuration (80% of cases)
```json
{
  "layout": {
    "pattern": "master-detail-detail",
    "entities": ["account", "serviceLocation", "workOrder"]
  }
}
```

The system infers everything else from entity relationships!

### Explicit Configuration (20% special cases)
```json
{
  "layout": {
    "pattern": "master-detail-detail",
    "columns": [
      {
        "entity": "account",
        "display": "all",
        "selection": "single",
        "empty-message": "Loading accounts..."
      },
      {
        "entity": "serviceLocation",
        "filter-by": "account_id",
        "selection": "single",
        "empty-message": "No locations for this account"
      },
      {
        "entity": "workOrder",
        "filter-by": "location_id",
        "selection": "none",
        "empty-message": "No work orders scheduled"
      }
    ]
  }
}
```

## 🚀 Progressive Enhancement Path

### Concept Line (v1.0 - NOW)
- Pure HTML tables
- Click = form submit
- Page refresh on selection
- Black & white only

### Prototype Line (v1.1)
- React with useState
- Click = filter without refresh
- Loading states
- Basic highlighting

### Production Line (v1.2)
- Vue with Vuex
- Optimistic updates
- Smooth transitions
- Full design system

## 🔮 Future Patterns (v2.0 Conceptual)

### Advanced Patterns (Keep in Mind, Don't Build Yet)

1. **Comparison Pattern**: Side-by-side of same entity type
2. **Matrix Pattern**: 2D grid (Technicians × Time Slots)
3. **Network Pattern**: Many-to-many relationships
4. **Workflow Pattern**: Sequential stages with actions
5. **Dashboard Pattern**: Multiple mini-patterns in tiles

### Behavioral Extensions (Conceptual Only)

1. **Breadcrumb Memory**: Path through selections
2. **Quick Filters**: Within-column filtering
3. **Bulk Actions**: Multi-select with action bar
4. **Drag Relationships**: Drag work order to different location
5. **Split Views**: Same data, different filters

## 📋 Implementation Checklist for v1.0

### Required for Master View
- [ ] MDD pattern fully specified
- [ ] Single selection only
- [ ] Clear downstream on parent change
- [ ] Empty state messages
- [ ] Black & white for Concept Line

### Not Required (But Keep Extensible)
- ❌ Multi-select
- ❌ Aggregation counts
- ❌ Complex filtering
- ❌ Drag and drop
- ❌ Inline editing

## 🎯 The Simplification Manifesto

By accepting these constraints:
1. **Single select only** → Simpler state management
2. **Clear downstream** → Predictable behavior
3. **No aggregations** → Faster initial load
4. **Services at locations** → Natural hierarchy

We get:
- **Deterministic behavior** (no surprises)
- **Instant understanding** (no training)
- **Fast implementation** (days not months)
- **Universal applicability** (all service industries)

## 💡 The Key Innovation

We're not building a generic relationship browser. We're building a **Service Industry Control Panel** that happens to use relationship patterns.

The constraints ARE the innovation:
- Less flexibility = More usability
- Fewer options = Faster decisions
- Clear patterns = Industry standard

---

*"Simplicity is the ultimate sophistication" - Leonardo da Vinci*

*This pattern will handle 95% of service industry needs. The 5% edge cases can use custom views or wait for v2.0*