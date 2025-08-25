# User Story US-111-003: Work Orders Column

**Story ID**: US-111-003  
**Sub-Module**: 1.1.1 Master View  
**Original ID**: US-008  
**Priority**: High  
**Status**: Ready for Development  

## Story Description
As a service technician/dispatcher, I want to view and interact with work orders for a selected service location so that I can quickly see work order status, schedules, and perform quick status updates without leaving the Master View.

## Acceptance Criteria

### Core Functionality
- [ ] Display work orders for the currently selected service location
- [ ] Show work order status with color coding for immediate visual recognition
- [ ] Display scheduled date/time prominently for each work order
- [ ] Enable quick status update actions directly from the column
- [ ] Support keyboard navigation (arrow keys, Tab, Enter) for accessibility

### Work Order Information Display
- [ ] Show work order ID/number clearly
- [ ] Display work order type/description (🔧 per mockup)
- [ ] Show current status with appropriate color coding:
  - Pending (default)
  - Scheduled (blue)
  - In-progress (yellow/orange)
  - Completed (green, ✓ per mockup)
  - Cancelled (red/grey)
- [ ] Display scheduled date/time in readable format
- [ ] Show priority indicators for urgent work orders

### Quick Actions
- [ ] Enable status updates without full detail view
- [ ] Support drag-and-drop for rescheduling (future integration)
- [ ] Right-click context menus for common operations
- [ ] Quick completion marking for simple tasks
- [ ] Bulk operations with multi-select

### Visual Requirements (from ASCII mockup)
- [ ] Column header clearly labeled "Work Orders"
- [ ] Work order entries with consistent visual format
- [ ] Status icons (🔧 for active, ✓ for completed)
- [ ] Color coding that's accessible and intuitive
- [ ] Clean integration with three-column layout

### Performance Requirements
- [ ] Column updates < 200ms when location selection changes
- [ ] Display 5-10 work orders per location on average
- [ ] Handle work orders with 90-day retention period
- [ ] Smooth scrolling at 60 fps
- [ ] Quick status update response < 100ms

### Validation Criteria (Concept Line)
- [ ] Users can navigate to any work order in < 3 clicks (account → location → work order)
- [ ] Work order status and scheduling information is immediately clear
- [ ] Performance is acceptable with mock data (500 work orders total)

## Technical Specifications

### Data Requirements
```yaml
WorkOrders:
  avgPerLocation: 5-10
  retentionDays: 90
  statuses: [pending, scheduled, in-progress, completed, cancelled]
  fields:
    - id
    - locationId
    - type
    - description
    - status
    - scheduledDateTime
    - priority
    - assignedTechnician
    - estimatedDuration
```

### Interface Contract
**Events Provided:**
- `workOrder:selected` - Emitted when user selects a work order
  - Payload: `WorkOrderSelectionEvent`
  - Triggers detail view or other integrations

**Events Consumed:**
- `location:selected` - Triggers work order data load and display
- `workOrder:updated` - Handled by `UpdateDisplayHandler`
- `detail-view:closed` - Handled by `RefreshDataHandler`

**State Exposed:**
```typescript
selectedWorkOrder: WorkOrder | null
visibleData.workOrders: WorkOrder[]
```

### API Dependencies
- Work Order API (GET /work-orders)
- Filter by locationId
- Support for status updates (PATCH /work-orders/{id})
- Real-time updates for status changes

### Business Logic
- Show work orders only when location is selected
- Clear selection when different location chosen
- Auto-refresh when work orders are updated externally
- Sort by priority and scheduled date

## Development Notes

### Concept Line Implementation (Current)
- Simple HTML/CSS layout
- Mock data (500 work orders across locations)
- Console.log for all interactions
- Any types everywhere
- No error handling
- Inline styles

### Progressive Enhancement
- **Prototype Line**: Real API connections, proper event handling
- **Production Line**: Optimistic updates, real-time synchronization

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Validation criteria passed with user testing
- [ ] Work order selection and status updates functional
- [ ] Performance targets achieved
- [ ] Responds correctly to location selection events
- [ ] Status color coding is accessible and intuitive
- [ ] Code review completed
- [ ] Integration with event bus functional

## Integration Points
- **With Service Locations Column (US-111-002)**: Receives location selection to filter work orders
- **With Detail View (1.1.2)**: Work order selection opens detailed view
- **With Work Order Management (1.2.1)**: Bidirectional updates flow
- **With Integrated Actions (US-111-004)**: Provides data for bulk operations

## Edge Cases and Considerations
- Location with no work orders (display appropriate message)
- Location with many work orders (implement pagination/virtualization)
- Rapid location switching (debounce/cancel previous requests)
- Real-time status updates from other users
- Work orders with past due dates (visual highlighting)
- Long work order descriptions (truncation with tooltips)

## Status Color Coding Specification
```css
pending: #6B7280 (grey)
scheduled: #3B82F6 (blue)
in-progress: #F59E0B (amber)
completed: #10B981 (green)
cancelled: #EF4444 (red)
```

## Notes
- Part of THE most critical UI component
- Primary destination for navigation workflow
- Status updates must be immediate and reliable
- Color coding must be accessible (consider colorblind users)
- Performance is non-negotiable for user experience
- Real-time updates essential for team coordination