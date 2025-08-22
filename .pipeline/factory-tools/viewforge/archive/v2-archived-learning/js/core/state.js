// ViewForge 2.0 - State Management
// Central state store for the application

const AppState = {
    // Current configuration
    currentEntity: null,
    viewContext: 'list',
    selectedFields: [],
    
    // Available entities
    entities: {
        account: {
            name: 'Account',
            tableName: 'accounts',
            description: 'Customer accounts and organizations'
        },
        serviceLocation: {
            name: 'Service Location',
            tableName: 'service_locations',
            description: 'Physical locations where services are performed'
        },
        workOrder: {
            name: 'Work Order',
            tableName: 'work_orders',
            description: 'Service requests and work assignments'
        },
        technician: {
            name: 'Technician',
            tableName: 'technicians',
            description: 'Service technicians and field workers'
        },
        customer: {
            name: 'Customer',
            tableName: 'customers',
            description: 'Individual customer contacts'
        }
    },
    
    // Field data from BUSM
    availableFields: {},
    
    // UI State
    isLoading: false,
    lastSaved: null,
    isDirty: false,
    
    // Methods
    setEntity(entityKey) {
        this.currentEntity = entityKey;
        this.selectedFields = [];
        this.isDirty = true;
        this.notifyChange('entity');
    },
    
    setViewContext(context) {
        this.viewContext = context;
        this.isDirty = true;
        this.notifyChange('viewContext');
    },
    
    toggleField(fieldName) {
        const index = this.selectedFields.indexOf(fieldName);
        if (index > -1) {
            this.selectedFields.splice(index, 1);
        } else {
            this.selectedFields.push(fieldName);
        }
        this.isDirty = true;
        this.notifyChange('fields');
    },
    
    selectAllFields() {
        if (this.currentEntity && this.availableFields[this.currentEntity]) {
            this.selectedFields = Object.keys(this.availableFields[this.currentEntity]);
            this.isDirty = true;
            this.notifyChange('fields');
        }
    },
    
    deselectAllFields() {
        this.selectedFields = [];
        this.isDirty = true;
        this.notifyChange('fields');
    },
    
    clearConfiguration() {
        this.currentEntity = null;
        this.selectedFields = [];
        this.viewContext = 'list';
        this.isDirty = false;
        this.notifyChange('clear');
    },
    
    saveConfiguration() {
        const config = this.getCurrentConfiguration();
        localStorage.setItem('viewforge_config', JSON.stringify(config));
        localStorage.setItem('viewforge_config_timestamp', new Date().toISOString());
        this.lastSaved = new Date();
        this.isDirty = false;
        this.notifyChange('save');
        return config;
    },
    
    loadConfiguration() {
        const saved = localStorage.getItem('viewforge_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                this.currentEntity = config.entity;
                this.viewContext = config.viewContext;
                this.selectedFields = config.fields || [];
                this.lastSaved = new Date(localStorage.getItem('viewforge_config_timestamp'));
                this.isDirty = false;
                this.notifyChange('load');
                return true;
            } catch (e) {
                console.error('Failed to load configuration:', e);
                return false;
            }
        }
        return false;
    },
    
    getCurrentConfiguration() {
        return {
            entity: this.currentEntity,
            viewContext: this.viewContext,
            fields: this.selectedFields,
            metadata: {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                iteration: 'ITER-2025-08-22-009'
            }
        };
    },
    
    // Observable pattern for UI updates
    listeners: [],
    
    subscribe(callback) {
        this.listeners.push(callback);
    },
    
    notifyChange(changeType) {
        this.listeners.forEach(callback => callback(changeType, this));
    }
};

// Auto-save functionality
let autoSaveInterval = null;

function enableAutoSave(intervalMinutes = 5) {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    autoSaveInterval = setInterval(() => {
        if (AppState.isDirty) {
            AppState.saveConfiguration();
            console.log('Auto-saved configuration at', new Date().toLocaleTimeString());
        }
    }, intervalMinutes * 60 * 1000);
}

function disableAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Export for use in other modules
window.AppState = AppState;
window.enableAutoSave = enableAutoSave;
window.disableAutoSave = disableAutoSave;