/**
 * SUB-MODULE INTERFACE CONTRACT
 * Module: Accounts
 * Sub-Module: Detail View
 * Sub-Module ID: 1.1.2
 * Line: CONCEPT
 * 
 * This sub-module CONSUMES from Master View
 */

export const DetailViewInterface = {
  name: "accounts/detail-view",
  version: "1.0.0",
  line: "concept",
  
  // What Detail View PROVIDES
  provides: {
    events: {
      "detail-view:opened": {
        description: "Detail view modal/page opened",
        payload: "{ accountId, openMode: 'modal' | 'page' | 'panel' }"
      },
      
      "detail-view:closed": {
        description: "Detail view closed, might have changes",
        payload: "{ accountId, hasChanges: boolean }"
      },
      
      "account:updated": {
        description: "Account data was modified",
        payload: "{ accountId, changes: {}, oldValues: {} }"
      }
    },
    
    state: {
      "isOpen": {
        description: "Whether detail view is currently open",
        shape: "boolean"
      },
      
      "currentAccount": {
        description: "Account being viewed/edited",
        shape: "{ accountId, ...accountData } | null"
      },
      
      "hasUnsavedChanges": {
        description: "Whether there are unsaved changes",
        shape: "boolean"
      }
    }
  },
  
  // What Detail View CONSUMES (from Master View!)
  consumes: {
    events: {
      // LISTEN to Master View selections!
      "account:selected": {
        source: "accounts/master-view",  // ← From Master View!
        description: "Open detail when account selected",
        handler: "handleAccountSelection",
        reaction: "Open detail view with selected account"
      },
      
      "location:selected": {
        source: "accounts/master-view",
        description: "Update detail view to show location context",
        handler: "handleLocationSelection",
        reaction: "Highlight selected location in account's location list"
      }
    },
    
    state: {
      "currentSelections": {
        source: "accounts/master-view",  // ← Read Master View state!
        description: "Know what's selected in Master View",
        usage: "Highlight related items, maintain context"
      }
    },
    
    methods: {
      // Can call Master View methods!
      "selectAccount": {
        source: "accounts/master-view",
        description: "Tell Master View to select different account",
        usage: "When navigating between accounts in detail view"
      }
    }
  },
  
  // How they work together
  integration: {
    scenario: "User clicks account in Master View",
    flow: [
      "1. Master View emits 'account:selected' event",
      "2. Detail View receives event (consuming)",
      "3. Detail View opens with that account",
      "4. Detail View emits 'detail-view:opened'",
      "5. If user saves changes, Detail View emits 'account:updated'",
      "6. Master View receives 'account:updated' and refreshes display",
      "7. Detail View emits 'detail-view:closed'",
      "8. Master View receives event and knows to refresh"
    ]
  }
};