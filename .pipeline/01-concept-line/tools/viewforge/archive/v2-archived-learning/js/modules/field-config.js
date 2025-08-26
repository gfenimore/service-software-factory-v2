// Field Configuration Module
// Handles field selection and configuration UI

const FieldConfig = {
    // Initialize field configuration
    init() {
        this.bindEvents();
        this.loadFields();
    },
    
    // Bind UI events
    bindEvents() {
        // Field search
        const searchInput = document.getElementById('field-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterFields(e.target.value));
        }
        
        // Select/Deselect all
        const selectAllBtn = document.getElementById('select-all');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAll());
        }
        
        const deselectAllBtn = document.getElementById('deselect-all');
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => this.deselectAll());
        }
    },
    
    // Load fields for current entity
    loadFields() {
        const entity = AppState.currentEntity;
        if (!entity) {
            this.showEmptyState();
            return;
        }
        
        const fields = BUSM.getFieldList(entity);
        AppState.availableFields[entity] = fields.reduce((acc, field) => {
            acc[field.name] = field;
            return acc;
        }, {});
        
        this.renderFields(fields);
        this.updateSelectedFields();
    },
    
    // Render field list
    renderFields(fields) {
        const container = document.getElementById('field-list');
        if (!container) return;
        
        if (fields.length === 0) {
            container.innerHTML = '<div class="empty-state">No fields available for this entity</div>';
            return;
        }
        
        container.innerHTML = fields.map(field => `
            <div class="field-item" data-field="${field.name}">
                <input type="checkbox" 
                       id="field-${field.name}" 
                       value="${field.name}"
                       ${AppState.selectedFields.includes(field.name) ? 'checked' : ''}
                       ${field.readOnly ? 'disabled' : ''}>
                <label for="field-${field.name}" class="field-name">
                    ${field.label}
                    ${field.required ? '<span title="Required">*</span>' : ''}
                </label>
                <span class="field-type">${field.type}</span>
            </div>
        `).join('');
        
        // Add change listeners to checkboxes
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleField(e.target.value, e.target.checked);
            });
        });
    },
    
    // Show empty state
    showEmptyState() {
        const container = document.getElementById('field-list');
        if (container) {
            container.innerHTML = '<div class="empty-state">Select an entity to configure fields</div>';
        }
        
        const selectedContainer = document.getElementById('selected-list');
        if (selectedContainer) {
            selectedContainer.innerHTML = '<p class="empty-state">No fields selected</p>';
        }
    },
    
    // Toggle field selection
    toggleField(fieldName, isChecked) {
        if (isChecked && !AppState.selectedFields.includes(fieldName)) {
            AppState.selectedFields.push(fieldName);
        } else if (!isChecked) {
            const index = AppState.selectedFields.indexOf(fieldName);
            if (index > -1) {
                AppState.selectedFields.splice(index, 1);
            }
        }
        
        AppState.isDirty = true;
        this.updateSelectedFields();
        this.updateFieldCount();
    },
    
    // Select all fields
    selectAll() {
        const entity = AppState.currentEntity;
        if (!entity) return;
        
        const fields = BUSM.getFieldList(entity);
        AppState.selectedFields = fields
            .filter(f => !f.readOnly)
            .map(f => f.name);
        
        AppState.isDirty = true;
        this.loadFields(); // Refresh UI
        this.updateSelectedFields();
        this.updateFieldCount();
    },
    
    // Deselect all fields
    deselectAll() {
        AppState.selectedFields = [];
        AppState.isDirty = true;
        this.loadFields(); // Refresh UI
        this.updateSelectedFields();
        this.updateFieldCount();
    },
    
    // Filter fields based on search
    filterFields(searchTerm) {
        const items = document.querySelectorAll('.field-item');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const fieldName = item.querySelector('.field-name').textContent.toLowerCase();
            if (fieldName.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    // Update selected fields display
    updateSelectedFields() {
        const container = document.getElementById('selected-list');
        if (!container) return;
        
        if (AppState.selectedFields.length === 0) {
            container.innerHTML = '<p class="empty-state">No fields selected</p>';
            return;
        }
        
        const entity = AppState.currentEntity;
        const fields = AppState.selectedFields.map(fieldName => {
            const field = AppState.availableFields[entity]?.[fieldName];
            return field || { name: fieldName, label: fieldName, type: 'unknown' };
        });
        
        container.innerHTML = fields.map(field => `
            <div class="selected-item">
                <span>${field.label} (${field.type})</span>
                <button onclick="FieldConfig.removeField('${field.name}')">Remove</button>
            </div>
        `).join('');
    },
    
    // Remove field from selection
    removeField(fieldName) {
        const index = AppState.selectedFields.indexOf(fieldName);
        if (index > -1) {
            AppState.selectedFields.splice(index, 1);
            AppState.isDirty = true;
            
            // Uncheck the checkbox
            const checkbox = document.querySelector(`#field-${fieldName}`);
            if (checkbox) {
                checkbox.checked = false;
            }
            
            this.updateSelectedFields();
            this.updateFieldCount();
        }
    },
    
    // Update field count display
    updateFieldCount() {
        const countElement = document.getElementById('field-count');
        if (countElement) {
            countElement.textContent = AppState.selectedFields.length;
        }
        
        const configFieldsElement = document.getElementById('config-fields');
        if (configFieldsElement) {
            configFieldsElement.textContent = AppState.selectedFields.length;
        }
    }
};

// Export for use in other modules
window.FieldConfig = FieldConfig;