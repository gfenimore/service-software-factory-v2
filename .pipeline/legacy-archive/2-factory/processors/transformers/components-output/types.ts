// Generated Types from Mock Data

export interface Account {
    id: number;
    name: string;
    type: 'Commercial' | 'Residential' | 'Industrial';
    status: 'Active' | 'Inactive' | 'Pending';
    locations?: number;
}

export interface Location {
    id: number;
    accountId: number;
    name: string;
    address: string;
    workOrders?: number;
}

export interface WorkOrder {
    id: number;
    locationId: number;
    title: string;
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
    date: string;
    description?: string;
}

export type EntityType = Account | Location | WorkOrder;
