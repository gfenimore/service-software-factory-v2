import React, { useState, useEffect } from 'react';
import { AccountsColumn } from './AccountsColumn';
import { LocationsColumn } from './LocationsColumn';
import { WorkOrdersColumn } from './WorkOrdersColumn';
import { Account, Location, WorkOrder } from '../types/types';
import { useMasterViewState } from '../hooks/hooks';
import styles from '../styles/MasterView.module.css';

interface MasterViewProps {
    initialAccount?: Account;
}

export const MasterView: React.FC<MasterViewProps> = ({ initialAccount }) => {
    const {
        selectedAccount,
        selectedLocation,
        selectedWorkOrder,
        handleAccountSelect,
        handleLocationSelect,
        handleWorkOrderSelect
    } = useMasterViewState(initialAccount);
    
    return (
        <div className={styles.masterView}>
            <AccountsColumn
                selectedAccount={selectedAccount}
                onAccountSelect={handleAccountSelect}
            />
            
            <LocationsColumn
                accountId={selectedAccount?.id}
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
            />
            
            <WorkOrdersColumn
                locationId={selectedLocation?.id}
                selectedWorkOrder={selectedWorkOrder}
                onWorkOrderSelect={handleWorkOrderSelect}
            />
        </div>
    );
};

export default MasterView;
