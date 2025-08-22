# US-007: Work Orders for Selected Service Location

**Story ID**: US-007  
**Feature**: Master View - Column 3  
**Version**: 2.1 (STORY-BUILDER Format)  
**Created**: January 16, 2025  
**Status**: Ready for Planning

---

## 1. Story Overview

### 1.1 User Story Statement

**AS A** Service Manager  
**I WANT TO** see all work orders for a selected service location  
**SO THAT I CAN** track service delivery status and manage technician assignments efficiently

### 1.2 Business Context

This story completes the Master View's progressive disclosure pattern by implementing Column 3, which displays work orders associated with the service location selected in Column 2. This eliminates the need to navigate to separate modules to check work order status.

### 1.3 Success Metrics

- Display work orders within 500ms of location selection
- Zero navigation required to view work order details
- 50% reduction in time to find work order status
- Support 50+ work orders per location without performance degradation

---

## 2. Detailed Requirements

### 2.1 Functional Requirements

**Work Order Display**

- Display all work orders for the selected service location
- Show key attributes: Type, Status, Schedule, Priority, Technician
- Support status lifecycle: Scheduled → Assigned → In-Progress → Completed → Invoiced
- Color-code by status for visual scanning
- Sort by priority and schedule by default

**Interactive Features**

- Click work order to view expanded details
- Quick status updates from the list view
- Filter by status, date range, or technician
- Search work orders by ID or description

### 2.2 Data Requirements

**Work Order Attributes**

```typescript
interface WorkOrder {
  id: string
  service_location_id: string
  work_order_number: string
  type: 'Maintenance' | 'Repair' | 'Installation' | 'Inspection'
  status: 'Scheduled' | 'Assigned' | 'In-Progress' | 'Completed' | 'Invoiced'
  priority: 'Low' | 'Medium' | 'High' | 'Emergency'
  scheduled_date: string
  scheduled_time_slot?: string
  technician_id?: string
  technician_name?: string
  description?: string
  completion_notes?: string
  created_at: string
  updated_at: string
}
```

### 2.3 Business Rules

1. Only display work orders for the currently selected service location
2. Emergency priority work orders display with red indicator
3. Overdue work orders (scheduled_date < today && status != 'Completed') show warning
4. Completed work orders remain visible for 30 days
5. Invoiced work orders are read-only

---

## 3. User Experience

### 3.1 Visual Design

- Column header: "Work Orders for [Location Name]"
- Card-based layout matching Columns 1 & 2 design
- Status badges with semantic colors:
  - Scheduled: Gray
  - Assigned: Blue
  - In-Progress: Yellow
  - Completed: Green
  - Invoiced: Purple

### 3.2 Interaction Flow

1. User selects account in Column 1
2. Service locations load in Column 2
3. User selects service location in Column 2
4. Work orders immediately display in Column 3
5. User can click any work order for details

### 3.3 Empty States

- No location selected: "Select a service location to view work orders"
- No work orders: "No work orders for this location"
- Loading: Skeleton cards matching expected layout

---

## 4. Technical Specifications

### 4.1 Component Architecture

```
Column3: WorkOrdersList/
├── WorkOrdersList.tsx         # Main container
├── WorkOrderCard.tsx          # Individual work order display
├── WorkOrderFilters.tsx       # Filter controls
├── WorkOrderDetailModal.tsx   # Expanded view modal
└── useWorkOrders.ts          # Data fetching hook
```

### 4.2 State Management

- Local state for filters and search
- Context for selected work order
- Real-time updates via Supabase subscriptions

### 4.3 API Integration

```typescript
// Fetch work orders for location
GET /api/service-locations/{locationId}/work-orders

// Response includes technician details via join
{
  work_orders: WorkOrder[]
  total_count: number
}
```

### 4.4 Performance Requirements

- Initial load: < 500ms
- Pagination: 20 items per page
- Virtual scrolling for 50+ items
- Optimistic UI updates for status changes

---

## 5. Acceptance Criteria

### 5.1 Display Criteria

- [ ] Work orders display when service location is selected
- [ ] All required fields are shown on cards
- [ ] Status color coding is applied correctly
- [ ] Priority indicators are visible
- [ ] Overdue work orders show warning

### 5.2 Interaction Criteria

- [ ] Click work order opens detail modal
- [ ] Filters reduce displayed work orders
- [ ] Search finds work orders by ID/description
- [ ] Column clears when location deselected
- [ ] Loading states display during data fetch

### 5.3 Data Criteria

- [ ] Only work orders for selected location shown
- [ ] Technician names display when assigned
- [ ] Dates format consistently (MM/DD/YYYY)
- [ ] All statuses from lifecycle are supported
- [ ] Real-time updates when status changes

### 5.4 Performance Criteria

- [ ] Load time under 500ms with 20 work orders
- [ ] Smooth scrolling with 50+ work orders
- [ ] No UI blocking during data operations
- [ ] Memory usage stable with extended use

---

## 6. Dependencies

### 6.1 Prerequisites

- US-005: Account selection (Column 1) - ✅ Complete
- US-006: Service locations (Column 2) - ✅ Complete
- Database: work_orders table created and populated
- API: Work orders endpoint implemented

### 6.2 Integration Points

- MasterViewContext for location selection state
- Supabase client for data fetching
- Existing card component patterns from Columns 1 & 2

---

## 7. Testing Requirements

### 7.1 Unit Tests

- WorkOrderCard renders all fields correctly
- Status color logic works for all statuses
- Priority sorting algorithm
- Date formatting functions

### 7.2 Integration Tests

- Work orders load when location selected
- Filters reduce result set correctly
- Detail modal opens and closes
- Context updates trigger re-fetch

### 7.3 E2E Tests

- Complete flow: Account → Location → Work Orders
- Filter and search combinations
- Performance with 100+ work orders
- Real-time status update reception

---

## 8. Value Delivery

### 8.1 Immediate Value (MVP)

- Display work orders for selected location
- Show all critical fields
- Enable basic filtering by status

### 8.2 Enhanced Value (Post-MVP)

- Real-time status updates
- Quick actions (reassign, reschedule)
- Work order creation from Column 3
- Bulk operations support

### 8.3 Business Impact

- **Efficiency**: 70% reduction in time to find work order
- **Visibility**: Complete service picture in one view
- **Accuracy**: Real-time status prevents miscommunication
- **Scale**: Handle 10x more work orders without additional staff

---

## 9. Notes & Considerations

### 9.1 Technical Debt

- Consider pagination strategy early
- Plan for offline capability
- Design for mobile responsiveness

### 9.2 Future Enhancements

- Drag-and-drop technician assignment
- Calendar view toggle
- Work order templates
- Automated scheduling suggestions

### 9.3 Risks & Mitigations

- **Risk**: Performance with large datasets
  - **Mitigation**: Implement virtual scrolling and pagination
- **Risk**: Complex filtering requirements
  - **Mitigation**: Start simple, iterate based on usage

---

**Story Ready for Planning Phase**
