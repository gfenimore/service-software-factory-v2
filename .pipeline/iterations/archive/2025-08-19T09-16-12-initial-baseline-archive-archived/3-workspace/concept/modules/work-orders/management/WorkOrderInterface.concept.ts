/**
 * SUB-MODULE INTERFACE CONTRACT
 * Module: Work Orders
 * Sub-Module: Work Order Management
 * Sub-Module ID: 1.2.1
 * Line: CONCEPT
 * 
 * Manages work order CRUD operations and integrates with Master View
 */

export const WorkOrderManagementInterface = {
  name: "work-orders/management",
  version: "1.0.0",
  line: "concept",
  
  // What Work Order Management PROVIDES
  provides: {
    events: {
      "workOrder:created": {
        description: "New work order created",
        payload: "{ workOrderId, locationId, accountId, title, status }",
        example: { workOrderId: 2001, locationId: 101, accountId: 1, title: "New HVAC Install", status: "pending" }
      },
      
      "workOrder:updated": {
        description: "Work order modified",
        payload: "{ workOrderId, changes: {}, previousValues: {} }",
        example: { workOrderId: 2001, changes: { status: "in-progress" }, previousValues: { status: "pending" } }
      },
      
      "workOrder:deleted": {
        description: "Work order removed",
        payload: "{ workOrderId, locationId, accountId }",
        example: { workOrderId: 2001, locationId: 101, accountId: 1 }
      },
      
      "workOrder:statusChanged": {
        description: "Work order status specifically changed",
        payload: "{ workOrderId, oldStatus, newStatus, changedBy }",
        example: { workOrderId: 2001, oldStatus: "pending", newStatus: "in-progress", changedBy: "user123" }
      }
    },
    
    state: {
      "activeWorkOrders": {
        description: "Currently active work orders",
        shape: "{ [locationId]: WorkOrder[] }",
        example: "{ 101: [{ workOrderId: 2001, title: 'HVAC Install', status: 'in-progress' }] }"
      },
      
      "workOrderCounts": {
        description: "Count of work orders by status per location",
        shape: "{ [locationId]: { pending: number, inProgress: number, completed: number } }",
        example: "{ 101: { pending: 2, inProgress: 3, completed: 10 } }"
      },
      
      "currentWorkOrder": {
        description: "Work order being edited/viewed",
        shape: "WorkOrder | null",
        example: "{ workOrderId: 2001, title: 'HVAC Install', ... }"
      }
    },
    
    methods: {
      "createWorkOrder": {
        description: "Create new work order for a location",
        signature: "(locationId: any, workOrderData: any) => Promise<any>",
        example: "workOrderMgmt.createWorkOrder(101, { title: 'Fix Leak' })"
      },
      
      "updateWorkOrderStatus": {
        description: "Change work order status",
        signature: "(workOrderId: any, newStatus: any) => void",
        example: "workOrderMgmt.updateWorkOrderStatus(2001, 'completed')"
      },
      
      "getWorkOrdersByLocation": {
        description: "Get all work orders for a location",
        signature: "(locationId: any) => any[]",
        example: "workOrderMgmt.getWorkOrdersByLocation(101)"
      },
      
      "filterWorkOrders": {
        description: "Filter work orders by criteria",
        signature: "(criteria: any) => any[]",
        example: "workOrderMgmt.filterWorkOrders({ status: 'pending' })"
      }
    }
  },
  
  // What Work Order Management CONSUMES
  consumes: {
    events: {
      // From Master View
      "location:selected": {
        source: "accounts/master-view",
        description: "Filter work orders when location selected",
        handler: "handleLocationSelection",
        reaction: "Show work orders for selected location"
      },
      
      "account:selected": {
        source: "accounts/master-view",
        description: "Load all work orders for account",
        handler: "handleAccountSelection",
        reaction: "Aggregate work orders across all account locations"
      },
      
      "workOrder:selected": {
        source: "accounts/master-view",
        description: "Open work order for editing",
        handler: "handleWorkOrderSelection",
        reaction: "Load work order details and enable editing"
      },
      
      // From Detail View
      "detail-view:closed": {
        source: "accounts/detail-view",
        description: "Refresh if work orders were affected",
        handler: "handleDetailViewClosed",
        reaction: "Reload work orders if location data changed"
      }
    },
    
    state: {
      "currentSelections": {
        source: "accounts/master-view",
        description: "Know what's selected to maintain context",
        usage: "Highlight related work orders, pre-fill location when creating"
      },
      
      "visibleData": {
        source: "accounts/master-view",
        description: "Know which locations are visible",
        usage: "Only load work orders for visible locations"
      }
    },
    
    methods: {
      "selectWorkOrder": {
        source: "accounts/master-view",
        description: "Tell Master View to select a work order",
        usage: "When navigating between work orders"
      }
    }
  },
  
  // Integration flow
  integration: {
    scenario: "Complete work order workflow",
    flow: [
      "1. User selects location in Master View",
      "2. Master View emits 'location:selected' event",
      "3. Work Order Management receives event and filters orders",
      "4. Work Order Management updates 'activeWorkOrders' state",
      "5. User creates new work order",
      "6. Work Order Management emits 'workOrder:created' event",
      "7. Master View receives event and updates count display",
      "8. User changes work order status to completed",
      "9. Work Order Management emits 'workOrder:statusChanged' event",
      "10. Master View updates visual indicators (counts, colors)"
    ]
  }
};