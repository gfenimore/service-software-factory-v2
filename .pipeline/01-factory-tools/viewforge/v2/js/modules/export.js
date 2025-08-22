// Export Module
// Handles JSON export functionality

const ExportModule = {
    // Initialize export functionality
    init() {
        this.bindEvents();
    },
    
    // Bind UI events
    bindEvents() {
        const exportBtn = document.getElementById('export-json');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportConfiguration());
        }
        
        const copyBtn = document.getElementById('copy-json');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard());
        }
    },
    
    // Export current configuration as JSON
    exportConfiguration() {
        if (!AppState.currentEntity) {
            this.showError('Please select an entity first');
            return;
        }
        
        if (AppState.selectedFields.length === 0) {
            this.showError('Please select at least one field');
            return;
        }
        
        const config = this.buildConfiguration();
        const json = JSON.stringify(config, null, 2);
        
        // Display in textarea
        const output = document.getElementById('json-output');
        if (output) {
            output.value = json;
            output.style.height = 'auto';
            output.style.height = Math.min(output.scrollHeight, 400) + 'px';
        }
        
        // Enable copy button
        const copyBtn = document.getElementById('copy-json');
        if (copyBtn) {
            copyBtn.disabled = false;
        }
        
        this.showSuccess('Configuration exported successfully');
        return config;
    },
    
    // Build configuration object
    buildConfiguration() {
        const entity = AppState.currentEntity;
        const entityInfo = AppState.entities[entity];
        
        // Get field details
        const fields = AppState.selectedFields.map(fieldName => {
            const field = BUSM.getField(entity, fieldName);
            return {
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required || false,
                readOnly: field.readOnly || false,
                // Include additional metadata for generators
                display: {
                    showInList: true,
                    showInDetail: true,
                    width: this.getDefaultWidth(field.type)
                }
            };
        });
        
        return {
            version: '2.0.0',
            metadata: {
                createdBy: 'ViewForge 2.0',
                createdAt: new Date().toISOString(),
                iteration: 'ITER-2025-08-22-009',
                line: 'concept'
            },
            entity: {
                key: entity,
                name: entityInfo.name,
                tableName: entityInfo.tableName,
                description: entityInfo.description
            },
            view: {
                type: AppState.viewContext,
                title: `${entityInfo.name} ${this.capitalizeFirst(AppState.viewContext)} View`,
                description: `Configuration for ${entityInfo.name} ${AppState.viewContext} view`
            },
            fields: fields,
            layout: {
                type: 'table', // For list view
                columns: fields.map(f => f.name),
                features: {
                    sorting: true,
                    filtering: false, // Week 2
                    pagination: true,
                    selection: false // Week 3
                }
            },
            rules: [], // Future: conditional visibility, validation
            actions: [] // Future: buttons, links
        };
    },
    
    // Get default width based on field type
    getDefaultWidth(type) {
        const widths = {
            'uuid': '150px',
            'string': '200px',
            'text': '300px',
            'number': '100px',
            'boolean': '80px',
            'date': '120px',
            'timestamp': '180px',
            'enum': '150px',
            'email': '200px'
        };
        return widths[type] || '150px';
    },
    
    // Copy JSON to clipboard
    async copyToClipboard() {
        const output = document.getElementById('json-output');
        if (!output || !output.value) {
            this.showError('No configuration to copy');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(output.value);
            this.showSuccess('Copied to clipboard!');
            
            // Visual feedback
            const copyBtn = document.getElementById('copy-json');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }
        } catch (err) {
            // Fallback for older browsers
            output.select();
            document.execCommand('copy');
            this.showSuccess('Copied to clipboard!');
        }
    },
    
    // Download configuration as file
    downloadConfiguration() {
        const config = this.buildConfiguration();
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `viewforge-config-${config.entity.key}-${timestamp}.json`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess(`Downloaded ${filename}`);
    },
    
    // Import configuration from JSON
    importConfiguration(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            
            // Validate configuration
            if (!config.entity || !config.fields) {
                throw new Error('Invalid configuration format');
            }
            
            // Apply configuration
            AppState.currentEntity = config.entity.key;
            AppState.viewContext = config.view?.type || 'list';
            AppState.selectedFields = config.fields.map(f => f.name);
            
            // Refresh UI
            if (window.App) {
                window.App.refresh();
            }
            
            this.showSuccess('Configuration imported successfully');
            return true;
        } catch (err) {
            this.showError(`Import failed: ${err.message}`);
            return false;
        }
    },
    
    // Show success message
    showSuccess(message) {
        console.log('✓', message);
        // Future: Add UI notification
    },
    
    // Show error message
    showError(message) {
        console.error('✗', message);
        // Future: Add UI notification
    },
    
    // Utility: Capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Export for use in other modules
window.ExportModule = ExportModule;