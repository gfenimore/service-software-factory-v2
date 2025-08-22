// ViewForge 2.0 - Main Application
// Orchestrates all modules and initializes the app

const App = {
    // Initialize application
    init() {
        console.log('ViewForge 2.0 initializing...');
        
        // Load saved configuration if exists
        const hasConfig = AppState.loadConfiguration();
        
        // Initialize modules
        FieldConfig.init();
        ExportModule.init();
        
        // Bind main UI events
        this.bindEvents();
        
        // Subscribe to state changes
        AppState.subscribe((changeType) => this.handleStateChange(changeType));
        
        // Enable auto-save
        enableAutoSave(5);
        
        // Set initial UI state
        if (hasConfig && AppState.currentEntity) {
            this.selectEntity(AppState.currentEntity);
        } else {
            this.updateUI();
        }
        
        console.log('ViewForge 2.0 ready');
    },
    
    // Bind main UI events
    bindEvents() {
        // Entity tab selection
        document.querySelectorAll('.entity-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const entity = e.target.dataset.entity;
                this.selectEntity(entity);
            });
        });
        
        // View context change
        const viewContext = document.getElementById('view-context');
        if (viewContext) {
            viewContext.addEventListener('change', (e) => {
                AppState.setViewContext(e.target.value);
            });
        }
        
        // Save configuration
        const saveBtn = document.getElementById('save-config');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveConfiguration());
        }
        
        // Clear configuration
        const clearBtn = document.getElementById('clear-config');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearConfiguration());
        }
    },
    
    // Select entity
    selectEntity(entityKey) {
        // Update state
        AppState.setEntity(entityKey);
        
        // Update UI
        document.querySelectorAll('.entity-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.entity === entityKey);
        });
        
        // Update entity details
        const entityInfo = AppState.entities[entityKey];
        const detailsEl = document.getElementById('entity-details');
        if (detailsEl && entityInfo) {
            detailsEl.innerHTML = `
                <dl>
                    <dt>Table:</dt>
                    <dd>${entityInfo.tableName}</dd>
                    <dt>Description:</dt>
                    <dd>${entityInfo.description}</dd>
                </dl>
            `;
        }
        
        // Load fields for entity
        FieldConfig.loadFields();
        
        // Update header
        const currentEntityEl = document.getElementById('current-entity');
        if (currentEntityEl) {
            currentEntityEl.textContent = entityInfo ? entityInfo.name : 'No Entity Selected';
        }
        
        this.updateUI();
    },
    
    // Save configuration
    saveConfiguration() {
        if (!AppState.currentEntity) {
            alert('Please select an entity first');
            return;
        }
        
        if (AppState.selectedFields.length === 0) {
            alert('Please select at least one field');
            return;
        }
        
        const config = AppState.saveConfiguration();
        
        // Update save status
        const saveStatus = document.getElementById('save-status');
        if (saveStatus) {
            saveStatus.textContent = 'Saved';
            saveStatus.style.fontWeight = 'bold';
            setTimeout(() => {
                saveStatus.textContent = 'Ready';
                saveStatus.style.fontWeight = 'normal';
            }, 2000);
        }
        
        console.log('Configuration saved:', config);
    },
    
    // Clear configuration
    clearConfiguration() {
        if (AppState.isDirty) {
            if (!confirm('Are you sure you want to clear the current configuration? Unsaved changes will be lost.')) {
                return;
            }
        }
        
        AppState.clearConfiguration();
        
        // Reset UI
        document.querySelectorAll('.entity-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        FieldConfig.showEmptyState();
        
        // Clear JSON output
        const jsonOutput = document.getElementById('json-output');
        if (jsonOutput) {
            jsonOutput.value = '';
        }
        
        // Disable copy button
        const copyBtn = document.getElementById('copy-json');
        if (copyBtn) {
            copyBtn.disabled = true;
        }
        
        this.updateUI();
        console.log('Configuration cleared');
    },
    
    // Handle state changes
    handleStateChange(changeType) {
        switch (changeType) {
            case 'entity':
                console.log('Entity changed:', AppState.currentEntity);
                break;
            case 'fields':
                console.log('Fields changed:', AppState.selectedFields.length, 'selected');
                this.updateUI();
                break;
            case 'save':
                console.log('Configuration saved at', AppState.lastSaved);
                break;
            case 'load':
                console.log('Configuration loaded');
                this.refresh();
                break;
        }
        
        // Update dirty indicator
        if (AppState.isDirty) {
            const saveStatus = document.getElementById('save-status');
            if (saveStatus) {
                saveStatus.textContent = 'Unsaved Changes';
            }
        }
    },
    
    // Update UI elements
    updateUI() {
        // Update configuration summary
        const configEntity = document.getElementById('config-entity');
        if (configEntity) {
            const entity = AppState.entities[AppState.currentEntity];
            configEntity.textContent = entity ? entity.name : 'None';
        }
        
        const configView = document.getElementById('config-view');
        if (configView) {
            configView.textContent = this.capitalizeFirst(AppState.viewContext) + ' View';
        }
        
        const configFields = document.getElementById('config-fields');
        if (configFields) {
            configFields.textContent = AppState.selectedFields.length;
        }
        
        // Update field count
        const fieldCount = document.getElementById('field-count');
        if (fieldCount) {
            fieldCount.textContent = AppState.selectedFields.length;
        }
    },
    
    // Refresh entire UI
    refresh() {
        if (AppState.currentEntity) {
            this.selectEntity(AppState.currentEntity);
        }
        
        const viewContext = document.getElementById('view-context');
        if (viewContext) {
            viewContext.value = AppState.viewContext;
        }
        
        this.updateUI();
    },
    
    // Utility: Capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for debugging and external access
window.App = App;