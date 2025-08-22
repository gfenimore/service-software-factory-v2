# US-010: Complete Master View (Concept Line)

## Story Type
**Line**: Concept  
**Focus**: Three-column workflow validation  
**Integration**: All three columns work together from the start

## User Story
As a **Service Coordinator**, I want to **navigate through Accounts → Service Locations → Work Orders** in a three-column layout so that I can **see the full context while managing service delivery**.

## The Interconnected Flow

```
[Accounts List]          [Locations for Account]     [Work Orders for Location]
┌─────────────┐         ┌──────────────────┐        ┌─────────────────────┐
│ ▶ ABC Corp  │  -----> │ ▶ Downtown HQ    │ -----> │ WO-1234 Fix HVAC   │
│   XYZ Inc   │         │   North Branch   │        │ WO-1235 Inspection │
│   City Govt │         │   Warehouse      │        │ WO-1236 Repair     │
└─────────────┘         └──────────────────┘        └─────────────────────┘
     ↓                           ↓                            ↓
  Select one                Shows locations            Shows work orders
                          for ABC Corp only           for Downtown HQ only
```

## Mock Data Structure (Interconnected!)

```javascript
// Everything is related - can't build in isolation!
const MOCK_DATA = {
  accounts: [
    {
      id: 1,
      name: "ABC Corporation",
      type: "Commercial",
      status: "active",
      locationCount: 3,
      totalWorkOrders: 12
    },
    {
      id: 2,
      name: "XYZ Industries",
      type: "Industrial",
      status: "active", 
      locationCount: 5,
      totalWorkOrders: 23
    }
  ],
  
  locations: [
    {
      id: 101,
      accountId: 1,  // ← Belongs to ABC Corp
      name: "Downtown Headquarters",
      address: "123 Main St",
      workOrderCount: 5
    },
    {
      id: 102,
      accountId: 1,  // ← Also ABC Corp
      name: "North Branch",
      address: "456 Oak Ave",
      workOrderCount: 4
    },
    {
      id: 201,
      accountId: 2,  // ← Belongs to XYZ Industries
      name: "Manufacturing Plant",
      address: "789 Industrial Blvd",
      workOrderCount: 8
    }
  ],
  
  workOrders: [
    {
      id: 1001,
      locationId: 101,  // ← At Downtown HQ
      accountId: 1,      // ← For ABC Corp
      title: "HVAC System Repair",
      status: "in-progress",
      priority: "high",
      technician: "John Smith",
      scheduled: "Today 2:00 PM"
    },
    {
      id: 1002,
      locationId: 101,  // ← Also Downtown HQ
      accountId: 1,
      title: "Quarterly Pest Inspection",
      status: "scheduled",
      priority: "medium",
      technician: "Jane Doe",
      scheduled: "Tomorrow 9:00 AM"
    }
  ]
};
```

## Acceptance Criteria (The Complete Flow)

### Column 1: Accounts
- **I can** see all accounts in a list
- **I can** click an account to select it
- **I can** see account is highlighted when selected
- **I can** see location count and work order count

### Column 2: Service Locations (Filtered!)
- **I can** see ONLY locations for the selected account
- **I can** see "Select an account" message if none selected
- **I can** click a location to select it
- **I can** see work order count for each location

### Column 3: Work Orders (Double Filtered!)
- **I can** see ONLY work orders for the selected location
- **I can** see "Select a location" message if none selected
- **I can** see work order details (status, priority, technician)
- **I can** see color coding for priority/status

## The Single Integrated Component

```typescript
// MasterView.tsx - All three columns in one component!
export const MasterView = () => {
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  
  // Filter locations based on selected account
  const filteredLocations = selectedAccountId 
    ? locations.filter(loc => loc.accountId === selectedAccountId)
    : [];
    
  // Filter work orders based on selected location
  const filteredWorkOrders = selectedLocationId
    ? workOrders.filter(wo => wo.locationId === selectedLocationId)
    : [];
    
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Column 1: Accounts */}
      <AccountsList 
        accounts={accounts}
        selectedId={selectedAccountId}
        onSelect={(id) => {
          setSelectedAccountId(id);
          setSelectedLocationId(null); // Reset location when account changes
        }}
      />
      
      {/* Column 2: Locations (filtered by account) */}
      <LocationsList
        locations={filteredLocations}
        selectedId={selectedLocationId}
        onSelect={setSelectedLocationId}
        emptyMessage="← Select an account"
      />
      
      {/* Column 3: Work Orders (filtered by location) */}
      <WorkOrdersList
        workOrders={filteredWorkOrders}
        emptyMessage="← Select a location"
      />
    </div>
  );
};
```

## Why This Approach is Right

1. **Natural Data Flow**: Account → Locations → Work Orders
2. **Context Preservation**: Always see the full hierarchy
3. **Realistic Validation**: Stakeholders see actual workflow
4. **Integrated from Start**: No retrofit needed later

## Concept Mode Benefits

- Build all three columns in ~3-4 hours
- Test the complete workflow immediately
- Validate the interaction patterns
- Get feedback on the whole feature, not parts

## Success Criteria

✅ User can navigate Account → Location → Work Orders  
✅ Each selection filters the next column  
✅ Visual feedback shows selections  
✅ Empty states guide the user  
✅ Complete workflow is demonstrable  

## This is NOT Three Stories

This is ONE story that delivers the complete Master View experience!