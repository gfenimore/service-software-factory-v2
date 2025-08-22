import { useState, useCallback } from 'react';
import { Account, Location, WorkOrder } from './types';

export const useMasterViewState = (initialAccount?: Account) => {
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(initialAccount || null);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
    
    const handleAccountSelect = useCallback((account: Account) => {
        setSelectedAccount(account);
        setSelectedLocation(null);
        setSelectedWorkOrder(null);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('account:selected', { detail: account }));
    }, []);
    
    const handleLocationSelect = useCallback((location: Location) => {
        setSelectedLocation(location);
        setSelectedWorkOrder(null);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('location:selected', { detail: location }));
    }, []);
    
    const handleWorkOrderSelect = useCallback((workOrder: WorkOrder) => {
        setSelectedWorkOrder(workOrder);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('workOrder:selected', { detail: workOrder }));
    }, []);
    
    return {
        selectedAccount,
        selectedLocation,
        selectedWorkOrder,
        handleAccountSelect,
        handleLocationSelect,
        handleWorkOrderSelect
    };
};
