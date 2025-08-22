// Mock Data Service
import { Account, Location, WorkOrder } from './types';

const mockAccounts: Account[] = [
    { id: 1, name: "BugBusters Inc", type: "Commercial", status: "Active", locations: 3 },
    { id: 2, name: "Ant-Man Solutions", type: "Residential", status: "Active", locations: 5 },
    { id: 3, name: "Pest Pro Services", type: "Commercial", status: "Active", locations: 2 },
    { id: 4, name: "Green Shield Pest", type: "Residential", status: "Active", locations: 4 },
    { id: 5, name: "Industrial Pest Co", type: "Industrial", status: "Active", locations: 1 }
];

const mockLocations: Location[] = [
    { id: 1, accountId: 1, name: "Main Office", address: "123 Main St, City, ST 12345", workOrders: 5 },
    { id: 2, accountId: 1, name: "Warehouse", address: "456 Industrial Rd, City, ST 12345", workOrders: 3 },
    { id: 3, accountId: 1, name: "Branch Office", address: "789 Branch Ave, City, ST 12345", workOrders: 2 },
    { id: 4, accountId: 2, name: "Home 1", address: "111 Oak St, Town, ST 12345", workOrders: 2 },
    { id: 5, accountId: 2, name: "Home 2", address: "222 Pine St, Town, ST 12345", workOrders: 1 }
];

const mockWorkOrders: WorkOrder[] = [
    { id: 1, locationId: 1, title: "Monthly Service", status: "Scheduled", date: "2024-01-15", description: "Regular monthly pest control service" },
    { id: 2, locationId: 1, title: "Ant Treatment", status: "Completed", date: "2024-01-10", description: "Ant colony treatment completed" },
    { id: 3, locationId: 1, title: "Inspection", status: "Scheduled", date: "2024-01-20", description: "Quarterly inspection" },
    { id: 4, locationId: 2, title: "Rodent Control", status: "In Progress", date: "2024-01-12", description: "Setting up rodent traps" },
    { id: 5, locationId: 2, title: "Termite Treatment", status: "Scheduled", date: "2024-01-25", description: "Annual termite prevention" }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAccounts = async (): Promise<Account[]> => {
    await delay(300);
    return mockAccounts;
};

export const fetchLocations = async (accountId: number): Promise<Location[]> => {
    await delay(200);
    return mockLocations.filter(l => l.accountId === accountId);
};

export const fetchWorkOrders = async (locationId: number): Promise<WorkOrder[]> => {
    await delay(200);
    return mockWorkOrders.filter(w => w.locationId === locationId);
};
