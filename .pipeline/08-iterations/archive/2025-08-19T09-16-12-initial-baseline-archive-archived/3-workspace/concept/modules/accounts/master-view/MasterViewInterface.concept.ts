/**
 * SUB-MODULE INTERFACE CONTRACT
 * Module: Accounts
 * Sub-Module: Master View
 * Sub-Module ID: 1.1.1
 * Line: CONCEPT
 * 
 * This defines what this sub-module PROVIDES and CONSUMES
 * In concept line: Everything is 'any' type
 * In prototype: These become TypeScript interfaces
 * In production: These become Zod schemas with runtime validation
 */

// ============================================
// CONCEPT LINE - Just shape documentation
// ============================================

export const MasterViewInterface = {
  name: "accounts/master-view",
  version: "1.0.0",
  line: "concept",
  
  // What this sub-module PROVIDES to others
  provides: {
    events: {
      // These are fired when user makes selections
      "account:selected": {
        description: "Fired when user selects an account",
        payload: "{ accountId, accountName, accountType }",
        example: { accountId: 1, accountName: "ABC Corp", accountType: "Commercial" }
      },
      
      "location:selected": {
        description: "Fired when user selects a location",
        payload: "{ locationId, locationName, accountId, address }",
        example: { locationId: 101, locationName: "Downtown HQ", accountId: 1, address: "123 Main St" }
      },
      
      "workOrder:selected": {
        description: "Fired when user selects a work order",
        payload: "{ workOrderId, locationId, accountId, title, status }",
        example: { workOrderId: 1001, locationId: 101, accountId: 1, title: "HVAC Repair", status: "in-progress" }
      },
      
      "filter:changed": {
        description: "Fired when user changes any filter",
        payload: "{ column, filterType, filterValue }",
        example: { column: "accounts", filterType: "search", filterValue: "ABC" }
      }
    },
    
    state: {
      // Other sub-modules can read this state
      "currentSelections": {
        description: "Currently selected items in all three columns",
        shape: "{ accountId?, locationId?, workOrderId? }",
        example: { accountId: 1, locationId: 101, workOrderId: null }
      },
      
      "visibleData": {
        description: "Currently filtered/visible data in each column",
        shape: "{ accounts[], locations[], workOrders[] }",
        example: "Arrays of currently visible items"
      }
    },
    
    methods: {
      // Other sub-modules can call these
      "selectAccount": {
        description: "Programmatically select an account",
        signature: "(accountId: any) => void",
        example: "masterView.selectAccount(123)"
      },
      
      "selectLocation": {
        description: "Programmatically select a location",
        signature: "(locationId: any) => void",
        example: "masterView.selectLocation(456)"
      },
      
      "clearSelections": {
        description: "Clear all selections",
        signature: "() => void",
        example: "masterView.clearSelections()"
      }
    }
  },
  
  // What this sub-module CONSUMES from others
  consumes: {
    events: {
      // Listen for these from other sub-modules
      "detail-view:closed": {
        source: "accounts/detail-view",
        description: "When detail view closes, refresh our data",
        handler: "handleDetailClose"
      },
      
      "work-order:updated": {
        source: "work-orders/*",
        description: "When work order changes elsewhere, update our display",
        handler: "handleWorkOrderUpdate"
      }
    },
    
    state: {
      // Read state from other sub-modules
      "user:preferences": {
        source: "settings/preferences",
        description: "User's display preferences",
        usage: "Apply user's preferred sort order"
      }
    }
  },
  
  // Contract testing in concept mode
  mockContract: {
    // Simple contract test - just console.log in concept!
    test: () => {
      console.log("🤝 Master View Interface Test:");
      console.log("✅ Emitting account:selected", { accountId: 1 });
      console.log("✅ Emitting location:selected", { locationId: 101 });
      console.log("✅ State available:", { accountId: 1, locationId: 101 });
      return true;
    }
  }
};