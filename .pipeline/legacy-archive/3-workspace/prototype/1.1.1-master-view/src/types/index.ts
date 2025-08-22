/**
 * TYPE DEFINITIONS - PROTOTYPE LINE
 * No any types allowed in prototype!
 */

export interface Account {
  id: number;
  name: string;
  type: 'Commercial' | 'Residential' | 'Industrial';
  status: 'Active' | 'Pending' | 'Suspended';
  locations: number;
}

export interface ServiceLocation {
  id: number;
  accountId: number;
  name: string;
  address: string;
  nextService: string;
}

export interface WorkOrder {
  id: number;
  locationId: number;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  date: string;
}

export interface MasterViewState {
  selectedAccount: Account | null;
  selectedLocation: ServiceLocation | null;
  selectedWorkOrder: WorkOrder | null;
  
  accounts: Account[];
  locations: ServiceLocation[];
  workOrders: WorkOrder[];
  
  loading: {
    accounts: boolean;
    locations: boolean;
    workOrders: boolean;
  };
  
  errors: {
    accounts: Error | null;
    locations: Error | null;
    workOrders: Error | null;
  };
}

export interface ColumnProps<T> {
  items: T[];
  selectedItem: T | null;
  onItemSelect: (item: T) => void;
  loading: boolean;
  error: Error | null;
  searchPlaceholder: string;
}

export type EventType = 
  | 'account:selected'
  | 'location:selected'
  | 'workOrder:selected'
  | 'detail-view:closed'
  | 'workOrder:updated';

export interface EventPayload {
  'account:selected': {
    accountId: number;
    accountName: string;
    accountType: Account['type'];
  };
  'location:selected': {
    locationId: number;
    locationName: string;
    accountId: number;
    address: string;
  };
  'workOrder:selected': {
    workOrderId: number;
    locationId: number;
    title: string;
    status: WorkOrder['status'];
  };
  'detail-view:closed': {
    hasChanges: boolean;
    accountId?: number;
  };
  'workOrder:updated': {
    workOrderId: number;
    changes: Partial<WorkOrder>;
  };
}