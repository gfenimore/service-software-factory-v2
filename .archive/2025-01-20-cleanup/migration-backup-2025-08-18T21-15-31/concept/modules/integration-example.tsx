/**
 * COMPLETE INTEGRATION EXAMPLE
 * Shows how Master View and Detail View work together
 * Through progressive interface contracts
 */

// ============================================
// CONCEPT LINE - Just make it work!
// ============================================

// Simple event bus for concept mode
const conceptEventBus = {
  events: {} as any,
  
  emit(event: string, data: any) {
    console.log(`📤 ${event}:`, data);
    if (this.events[event]) {
      this.events[event].forEach((handler: any) => handler(data));
    }
  },
  
  on(event: string, handler: any) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
    console.log(`👂 Registered listener for ${event}`);
  }
};

// Master View Component (Concept)
export const ConceptMasterView = () => {
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  
  const handleAccountClick = (account: any) => {
    console.log("Master View: Account clicked", account);
    setSelectedAccount(account);
    
    // Emit event for other sub-modules
    conceptEventBus.emit('account:selected', {
      accountId: account.id,
      accountName: account.name,
      accountType: account.type
    });
  };
  
  const handleLocationClick = (location: any) => {
    console.log("Master View: Location clicked", location);
    setSelectedLocation(location);
    
    // Emit event
    conceptEventBus.emit('location:selected', {
      locationId: location.id,
      locationName: location.name,
      accountId: selectedAccount?.id,
      address: location.address
    });
  };
  
  // Listen for events from Detail View
  useEffect(() => {
    conceptEventBus.on('detail-view:closed', (data: any) => {
      console.log("Master View: Detail view closed", data);
      if (data.hasChanges) {
        console.log("Refreshing account data...");
        // In concept, just log it
      }
    });
    
    conceptEventBus.on('account:updated', (data: any) => {
      console.log("Master View: Account updated", data);
      // Update our mock data
    });
  }, []);
  
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Three columns implementation */}
      <div>
        <h3>Accounts</h3>
        {MOCK_ACCOUNTS.map((account: any) => (
          <div 
            key={account.id}
            onClick={() => handleAccountClick(account)}
            style={{ 
              padding: '10px',
              background: selectedAccount?.id === account.id ? '#e0e0e0' : 'white'
            }}
          >
            {account.name}
          </div>
        ))}
      </div>
      {/* ... other columns */}
    </div>
  );
};

// Detail View Component (Concept)
export const ConceptDetailView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  
  // Listen for Master View events
  useEffect(() => {
    conceptEventBus.on('account:selected', (data: any) => {
      console.log("Detail View: Received account selection", data);
      setCurrentAccount(data);
      setIsOpen(true);
      
      // Emit that we opened
      conceptEventBus.emit('detail-view:opened', {
        accountId: data.accountId,
        openMode: 'modal'
      });
    });
  }, []);
  
  const handleClose = (hasChanges: boolean) => {
    console.log("Detail View: Closing", { hasChanges });
    
    // Emit close event
    conceptEventBus.emit('detail-view:closed', {
      accountId: currentAccount?.accountId,
      hasChanges
    });
    
    setIsOpen(false);
    setCurrentAccount(null);
  };
  
  const handleSave = (updatedData: any) => {
    console.log("Detail View: Saving", updatedData);
    
    // Emit update event
    conceptEventBus.emit('account:updated', {
      accountId: currentAccount?.accountId,
      changes: updatedData,
      oldValues: currentAccount
    });
    
    handleClose(true);
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '500px'
      }}>
        <h2>Account Details</h2>
        <p>Editing: {currentAccount?.accountName}</p>
        {/* Form fields here */}
        <button onClick={() => handleSave({ name: 'Updated Name' })}>
          Save
        </button>
        <button onClick={() => handleClose(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// The App combining both sub-modules
export const ConceptApp = () => {
  return (
    <div>
      <ConceptMasterView />
      <ConceptDetailView />
      {/* They communicate through events! */}
    </div>
  );
};

// ============================================
// INTEGRATION TEST (Concept Mode)
// ============================================

export const testIntegration = () => {
  console.log("🧪 Testing Sub-Module Integration:");
  
  // Simulate user flow
  console.log("1. User clicks account in Master View");
  conceptEventBus.emit('account:selected', {
    accountId: 1,
    accountName: 'ABC Corp',
    accountType: 'Commercial'
  });
  
  console.log("2. Detail View should open automatically");
  // Detail View's listener fires
  
  console.log("3. User saves changes in Detail View");
  conceptEventBus.emit('account:updated', {
    accountId: 1,
    changes: { name: 'ABC Corporation' }
  });
  
  console.log("4. Master View should refresh");
  // Master View's listener fires
  
  console.log("5. Detail View closes");
  conceptEventBus.emit('detail-view:closed', {
    accountId: 1,
    hasChanges: true
  });
  
  console.log("✅ Integration test complete!");
};