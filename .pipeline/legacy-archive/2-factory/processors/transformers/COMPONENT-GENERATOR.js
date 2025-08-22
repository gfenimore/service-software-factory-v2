#!/usr/bin/env node

/**
 * COMPONENT-GENERATOR
 * Transformation Processor: Intermediate JSON → React Components
 * 
 * Takes the intermediate JSON format from EXTRACT-PROCESSOR and generates:
 * - React component files with TypeScript
 * - Proper imports and exports
 * - Event handlers wired up
 * - Mock data integration
 * 
 * Line-aware: Different output based on target line (concept/prototype/production)
 */

const fs = require('fs');
const path = require('path');

class ComponentGenerator {
    constructor(config = {}) {
        this.config = {
            targetLine: 'prototype',
            typescript: true,
            componentStyle: 'functional', // 'functional' or 'class'
            stateManagement: 'hooks', // 'hooks', 'context', 'redux'
            styling: 'modules', // 'inline', 'modules', 'styled-components'
            ...config
        };
        
        this.components = [];
        this.imports = new Set();
        this.exports = new Set();
    }
    
    /**
     * Main generation process
     */
    async generate(inputDir, outputDir) {
        console.log('🔨 COMPONENT-GENERATOR: JSON → React Transformation');
        console.log('📂 Input:', inputDir);
        console.log('📂 Output:', outputDir);
        console.log('🎯 Target Line:', this.config.targetLine);
        console.log('');
        
        // Load intermediate files
        const components = this.loadJSON(inputDir, 'components.json');
        const styles = this.loadJSON(inputDir, 'styles.json');
        const mockData = this.loadJSON(inputDir, 'mockData.json');
        const events = this.loadJSON(inputDir, 'events.json');
        
        // Generate components based on target line
        console.log('🏗️ Generating React components...');
        
        if (this.config.targetLine === 'concept') {
            await this.generateConceptComponents(components, styles, mockData, events, outputDir);
        } else if (this.config.targetLine === 'prototype') {
            await this.generatePrototypeComponents(components, styles, mockData, events, outputDir);
        } else if (this.config.targetLine === 'production') {
            await this.generateProductionComponents(components, styles, mockData, events, outputDir);
        }
        
        // Generate index file
        await this.generateIndexFile(outputDir);
        
        // Generate package.json if needed
        await this.generatePackageJson(outputDir);
        
        console.log('✅ Component generation complete!');
        return {
            generatedFiles: this.components.length,
            targetLine: this.config.targetLine
        };
    }
    
    /**
     * Load JSON file
     */
    loadJSON(dir, filename) {
        const filepath = path.join(dir, filename);
        if (!fs.existsSync(filepath)) {
            console.warn(`  ⚠️  ${filename} not found, using empty object`);
            return {};
        }
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
    
    /**
     * Generate concept-level components (simple, all-in-one)
     */
    async generateConceptComponents(components, styles, mockData, events, outputDir) {
        console.log('  📦 Generating concept components (simple, mock data)...');
        
        // Single file with everything
        const componentCode = this.generateConceptMasterView(components, styles, mockData, events);
        
        const filepath = path.join(outputDir, 'MasterView.jsx');
        this.writeFile(filepath, componentCode);
        this.components.push('MasterView.jsx');
    }
    
    /**
     * Generate prototype-level components (TypeScript, separated)
     */
    async generatePrototypeComponents(components, styles, mockData, events, outputDir) {
        console.log('  📦 Generating prototype components (TypeScript, modular)...');
        
        // Generate main component
        const masterViewCode = this.generatePrototypeMasterView(components.root);
        this.writeFile(path.join(outputDir, 'MasterView.tsx'), masterViewCode);
        this.components.push('MasterView.tsx');
        
        // Generate column components
        if (components.root && components.root.children) {
            for (const column of components.root.children) {
                const columnCode = this.generatePrototypeColumn(column);
                const filename = `${this.toPascalCase(column.name)}.tsx`;
                this.writeFile(path.join(outputDir, filename), columnCode);
                this.components.push(filename);
            }
        }
        
        // Generate shared components
        const searchBoxCode = this.generatePrototypeSearchBox();
        this.writeFile(path.join(outputDir, 'SearchBox.tsx'), searchBoxCode);
        this.components.push('SearchBox.tsx');
        
        const cardCode = this.generatePrototypeCard();
        this.writeFile(path.join(outputDir, 'Card.tsx'), cardCode);
        this.components.push('Card.tsx');
        
        // Generate types
        const typesCode = this.generateTypes(mockData);
        this.writeFile(path.join(outputDir, 'types.ts'), typesCode);
        
        // Generate hooks
        const hooksCode = this.generateHooks(events);
        this.writeFile(path.join(outputDir, 'hooks.ts'), hooksCode);
        
        // Generate mock data service
        const mockServiceCode = this.generateMockDataService(mockData);
        this.writeFile(path.join(outputDir, 'mockData.ts'), mockServiceCode);
    }
    
    /**
     * Generate production-level components (hardened, optimized)
     */
    async generateProductionComponents(components, styles, mockData, events, outputDir) {
        console.log('  📦 Generating production components (hardened, optimized)...');
        
        // Similar to prototype but with:
        // - Error boundaries
        // - Performance optimizations
        // - Accessibility
        // - Monitoring
        
        // For now, reuse prototype generation with enhancements
        await this.generatePrototypeComponents(components, styles, mockData, events, outputDir);
        
        // Add error boundary
        const errorBoundaryCode = this.generateErrorBoundary();
        this.writeFile(path.join(outputDir, 'ErrorBoundary.tsx'), errorBoundaryCode);
        this.components.push('ErrorBoundary.tsx');
    }
    
    /**
     * Generate concept-level Master View (simple)
     */
    generateConceptMasterView(components, styles, mockData, events) {
        return `import React, { useState, useEffect } from 'react';

// Mock Data
const mockAccounts = [
    { id: 1, name: "BugBusters Inc", type: "Commercial", status: "Active", locations: 3 },
    { id: 2, name: "Ant-Man Solutions", type: "Residential", status: "Active", locations: 5 },
    { id: 3, name: "Pest Pro Services", type: "Commercial", status: "Active", locations: 2 }
];

const mockLocations = [
    { id: 1, accountId: 1, name: "Main Office", address: "123 Main St", workOrders: 5 },
    { id: 2, accountId: 1, name: "Warehouse", address: "456 Industrial Rd", workOrders: 3 },
    { id: 3, accountId: 2, name: "Home 1", address: "789 Oak Ave", workOrders: 2 }
];

const mockWorkOrders = [
    { id: 1, locationId: 1, title: "Monthly Service", status: "Scheduled", date: "2024-01-15" },
    { id: 2, locationId: 1, title: "Ant Treatment", status: "Completed", date: "2024-01-10" },
    { id: 3, locationId: 2, title: "Inspection", status: "Pending", date: "2024-01-20" }
];

export const MasterView = () => {
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [accounts] = useState(mockAccounts);
    const [locations, setLocations] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    
    // Filter locations when account selected
    useEffect(() => {
        if (selectedAccount) {
            setLocations(mockLocations.filter(l => l.accountId === selectedAccount.id));
        } else {
            setLocations([]);
        }
        setSelectedLocation(null);
    }, [selectedAccount]);
    
    // Filter work orders when location selected
    useEffect(() => {
        if (selectedLocation) {
            setWorkOrders(mockWorkOrders.filter(w => w.locationId === selectedLocation.id));
        } else {
            setWorkOrders([]);
        }
    }, [selectedLocation]);
    
    return (
        <div style={{ display: 'flex', height: '100vh', gap: '1px', backgroundColor: '#f0f0f0' }}>
            {/* Accounts Column */}
            <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
                    <h2>Accounts ({accounts.length})</h2>
                    <input type="text" placeholder="Search accounts..." style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                    {accounts.map(account => (
                        <div
                            key={account.id}
                            onClick={() => setSelectedAccount(account)}
                            style={{
                                padding: '12px',
                                margin: '4px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                backgroundColor: selectedAccount?.id === account.id ? '#e3f2fd' : 'white'
                            }}
                        >
                            <div style={{ fontWeight: 'bold' }}>{account.name}</div>
                            <div style={{ fontSize: '0.9em', color: '#666' }}>{account.type}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Locations Column */}
            <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
                    <h2>Locations ({locations.length})</h2>
                    <input type="text" placeholder="Search locations..." style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                    {locations.map(location => (
                        <div
                            key={location.id}
                            onClick={() => setSelectedLocation(location)}
                            style={{
                                padding: '12px',
                                margin: '4px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                backgroundColor: selectedLocation?.id === location.id ? '#e3f2fd' : 'white'
                            }}
                        >
                            <div style={{ fontWeight: 'bold' }}>{location.name}</div>
                            <div style={{ fontSize: '0.9em', color: '#666' }}>{location.address}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Work Orders Column */}
            <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
                    <h2>Work Orders ({workOrders.length})</h2>
                    <input type="text" placeholder="Search work orders..." style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                    {workOrders.map(workOrder => (
                        <div
                            key={workOrder.id}
                            style={{
                                padding: '12px',
                                margin: '4px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ fontWeight: 'bold' }}>{workOrder.title}</div>
                            <div style={{ fontSize: '0.9em', color: '#666' }}>{workOrder.status}</div>
                            <div style={{ fontSize: '0.8em', color: '#999' }}>{workOrder.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MasterView;
`;
    }
    
    /**
     * Generate prototype-level Master View (TypeScript)
     */
    generatePrototypeMasterView(root) {
        return `import React, { useState, useEffect } from 'react';
import { AccountsColumn } from './AccountsColumn';
import { LocationsColumn } from './LocationsColumn';
import { WorkOrdersColumn } from './WorkOrdersColumn';
import { Account, Location, WorkOrder } from './types';
import { useMasterViewState } from './hooks';
import styles from './MasterView.module.css';

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
`;
    }
    
    /**
     * Generate prototype column component
     */
    generatePrototypeColumn(column) {
        const name = this.toPascalCase(column.name);
        const entityType = this.getEntityType(column.name);
        
        return `import React, { useState, useEffect } from 'react';
import { SearchBox } from './SearchBox';
import { Card } from './Card';
import { ${entityType} } from './types';
import { fetch${entityType}s } from './mockData';
import styles from './${name}.module.css';

interface ${name}Props {
    ${this.getColumnProps(column.name)}
}

export const ${name}: React.FC<${name}Props> = ({
    ${this.getColumnPropsDestructured(column.name)}
}) => {
    const [items, setItems] = useState<${entityType}[]>([]);
    const [filteredItems, setFilteredItems] = useState<${entityType}[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        ${this.getDataFetchLogic(column.name, entityType)}
    }, [${this.getDependencies(column.name)}]);
    
    useEffect(() => {
        const filtered = items.filter(item =>
            ${this.getSearchFilter(entityType)}
        );
        setFilteredItems(filtered);
    }, [items, searchTerm]);
    
    return (
        <div className={styles.column}>
            <div className={styles.header}>
                <h2>${column.title || name}</h2>
                <span className={styles.count}>{filteredItems.length}</span>
            </div>
            
            <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search ${column.title?.toLowerCase() || 'items'}..."
            />
            
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (
                    filteredItems.map(item => (
                        <Card
                            key={item.id}
                            selected={${this.getSelectedCheck(column.name)}}
                            onClick={() => ${this.getClickHandler(column.name)}}
                        >
                            ${this.getCardContent(entityType)}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
`;
    }
    
    /**
     * Generate SearchBox component
     */
    generatePrototypeSearchBox() {
        return `import React from 'react';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
    value,
    onChange,
    placeholder = "Search..."
}) => {
    return (
        <div className={styles.searchBox}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={styles.input}
            />
        </div>
    );
};
`;
    }
    
    /**
     * Generate Card component
     */
    generatePrototypeCard() {
        return `import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    selected?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    selected = false,
    onClick,
    children
}) => {
    return (
        <div
            className={\`\${styles.card} \${selected ? styles.selected : ''}\`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.();
                }
            }}
        >
            {children}
        </div>
    );
};
`;
    }
    
    /**
     * Generate TypeScript types
     */
    generateTypes(mockData) {
        return `// Generated Types from Mock Data

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
`;
    }
    
    /**
     * Generate custom hooks
     */
    generateHooks(events) {
        return `import { useState, useCallback } from 'react';
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
`;
    }
    
    /**
     * Generate mock data service
     */
    generateMockDataService(mockData) {
        return `// Mock Data Service
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
`;
    }
    
    /**
     * Generate Error Boundary for production
     */
    generateErrorBoundary() {
        return `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };
    
    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }
    
    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // In production, send to error tracking service
    }
    
    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })}>
                        Try again
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}
`;
    }
    
    /**
     * Generate index file
     */
    async generateIndexFile(outputDir) {
        const indexCode = `// Generated Index File
export { MasterView } from './MasterView';
export { SearchBox } from './SearchBox';
export { Card } from './Card';
export * from './types';
export * from './hooks';
`;
        
        this.writeFile(path.join(outputDir, 'index.ts'), indexCode);
    }
    
    /**
     * Generate package.json
     */
    async generatePackageJson(outputDir) {
        const packageJson = {
            name: "master-view-components",
            version: "1.0.0",
            description: "Generated React components for Master View",
            main: "index.ts",
            scripts: {
                "build": "tsc",
                "test": "jest",
                "lint": "eslint ."
            },
            dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
            },
            devDependencies: {
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                "typescript": "^5.0.0",
                "jest": "^29.0.0",
                "@testing-library/react": "^14.0.0"
            }
        };
        
        this.writeFile(
            path.join(outputDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
    }
    
    /**
     * Helper methods
     */
    toPascalCase(str) {
        return str
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
    
    getEntityType(columnName) {
        if (columnName.includes('account')) return 'Account';
        if (columnName.includes('location')) return 'Location';
        if (columnName.includes('workorder') || columnName.includes('work-order')) return 'WorkOrder';
        return 'Entity';
    }
    
    getColumnProps(columnName) {
        if (columnName.includes('account')) {
            return `selectedAccount: Account | null;
    onAccountSelect: (account: Account) => void;`;
        }
        if (columnName.includes('location')) {
            return `accountId?: number;
    selectedLocation: Location | null;
    onLocationSelect: (location: Location) => void;`;
        }
        if (columnName.includes('workorder')) {
            return `locationId?: number;
    selectedWorkOrder: WorkOrder | null;
    onWorkOrderSelect: (workOrder: WorkOrder) => void;`;
        }
        return '';
    }
    
    getColumnPropsDestructured(columnName) {
        if (columnName.includes('account')) {
            return 'selectedAccount, onAccountSelect';
        }
        if (columnName.includes('location')) {
            return 'accountId, selectedLocation, onLocationSelect';
        }
        if (columnName.includes('workorder')) {
            return 'locationId, selectedWorkOrder, onWorkOrderSelect';
        }
        return '';
    }
    
    getDataFetchLogic(columnName, entityType) {
        if (columnName.includes('account')) {
            return `setLoading(true);
        fetch${entityType}s()
            .then(setItems)
            .finally(() => setLoading(false));`;
        }
        if (columnName.includes('location')) {
            return `if (accountId) {
            setLoading(true);
            fetch${entityType}s(accountId)
                .then(setItems)
                .finally(() => setLoading(false));
        } else {
            setItems([]);
        }`;
        }
        if (columnName.includes('workorder')) {
            return `if (locationId) {
            setLoading(true);
            fetch${entityType}s(locationId)
                .then(setItems)
                .finally(() => setLoading(false));
        } else {
            setItems([]);
        }`;
        }
        return '';
    }
    
    getDependencies(columnName) {
        if (columnName.includes('location')) return 'accountId';
        if (columnName.includes('workorder')) return 'locationId';
        return '';
    }
    
    getSearchFilter(entityType) {
        return `item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.title?.toLowerCase().includes(searchTerm.toLowerCase())`;
    }
    
    getSelectedCheck(columnName) {
        if (columnName.includes('account')) return 'selectedAccount?.id === item.id';
        if (columnName.includes('location')) return 'selectedLocation?.id === item.id';
        if (columnName.includes('workorder')) return 'selectedWorkOrder?.id === item.id';
        return 'false';
    }
    
    getClickHandler(columnName) {
        if (columnName.includes('account')) return 'onAccountSelect(item)';
        if (columnName.includes('location')) return 'onLocationSelect(item)';
        if (columnName.includes('workorder')) return 'onWorkOrderSelect(item)';
        return 'console.log(item)';
    }
    
    getCardContent(entityType) {
        if (entityType === 'Account') {
            return `<>
                            <div className={styles.cardTitle}>{item.name}</div>
                            <div className={styles.cardSubtitle}>{item.type}</div>
                            <div className={styles.cardMeta}>{item.locations} locations</div>
                        </>`;
        }
        if (entityType === 'Location') {
            return `<>
                            <div className={styles.cardTitle}>{item.name}</div>
                            <div className={styles.cardSubtitle}>{item.address}</div>
                            <div className={styles.cardMeta}>{item.workOrders} work orders</div>
                        </>`;
        }
        if (entityType === 'WorkOrder') {
            return `<>
                            <div className={styles.cardTitle}>{item.title}</div>
                            <div className={styles.cardSubtitle}>{item.status}</div>
                            <div className={styles.cardMeta}>{item.date}</div>
                        </>`;
        }
        return '<div>{JSON.stringify(item)}</div>';
    }
    
    writeFile(filepath, content) {
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filepath, content);
        console.log(`   ✅ ${path.basename(filepath)}`);
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: COMPONENT-GENERATOR <input-dir> <output-dir> [target-line]');
        console.log('Example: COMPONENT-GENERATOR ./intermediate ./components prototype');
        process.exit(1);
    }
    
    const [inputDir, outputDir, targetLine = 'prototype'] = args;
    
    const generator = new ComponentGenerator({ targetLine });
    
    generator.generate(inputDir, outputDir)
        .then(result => {
            console.log('\n🎉 Component generation successful!');
            console.log(`Generated ${result.generatedFiles} files for ${result.targetLine} line`);
            console.log('Next step: Run ASSEMBLY-PROCESSOR to create runnable application');
        })
        .catch(err => {
            console.error('❌ Generation failed:', err.message);
            process.exit(1);
        });
}

module.exports = ComponentGenerator;