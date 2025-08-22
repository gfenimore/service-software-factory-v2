// ViewForge v3 - PRD-Driven Implementation
// Following PRD Module 1: Configuration Management

// Application State
const AppState = {
    currentStep: 1,
    configuration: {
        // Hierarchy
        application: { id: 'fsm', name: 'Field Service Management' },
        module: null,
        subModule: null,
        userStory: null,
        
        // Scope
        scopeLevel: 'story',
        
        // Entity & Fields
        primaryEntity: null,
        selectedFields: [],
        
        // Metadata
        version: '3.0.0',
        createdAt: null
    }
};

// Module & SubModule Structure (matching BUSM)
const HierarchyData = {
    modules: {
        accounts: {
            name: 'Account Management',
            subModules: {
                accounts: 'Accounts',
                contacts: 'Contacts', 
                agreements: 'Service Agreements'
            },
            stories: {
                'US-001': 'As an Admin, I want to view a list of accounts',
                'US-002': 'As an Admin, I want to view account details',
                'US-003': 'As an Admin, I want to edit account information'
            }
        },
        service: {
            name: 'Service Delivery',
            subModules: {
                locations: 'Service Locations',
                workOrders: 'Work Orders',
                scheduling: 'Scheduling'
            },
            stories: {
                'US-004': 'As a Technician, I want to view my work orders',
                'US-005': 'As an Admin, I want to schedule work orders',
                'US-006': 'As an Admin, I want to view service locations'
            }
        },
        billing: {
            name: 'Billing & Invoicing',
            subModules: {
                invoices: 'Invoices',
                payments: 'Payments',
                reports: 'Reports'
            },
            stories: {
                'US-007': 'As an Admin, I want to generate invoices',
                'US-008': 'As an Admin, I want to record payments'
            }
        }
    }
};

// BUSM Field Registry (simplified)
const BUSM = {
    account: {
        fields: {
            accountId: { label: 'Account ID', type: 'uuid', required: true },
            accountName: { label: 'Account Name', type: 'string', required: true },
            accountNumber: { label: 'Account Number', type: 'string', required: false },
            accountType: { label: 'Account Type', type: 'enum', required: true },
            status: { label: 'Status', type: 'enum', required: true },
            phoneNumber: { label: 'Phone Number', type: 'string', required: false },
            email: { label: 'Email', type: 'email', required: false },
            createdAt: { label: 'Created Date', type: 'timestamp', required: true }
        },
        relations: {
            serviceLocations: 'serviceLocation'
        }
    },
    serviceLocation: {
        fields: {
            locationId: { label: 'Location ID', type: 'uuid', required: true },
            locationName: { label: 'Location Name', type: 'string', required: true },
            locationCode: { label: 'Location Code', type: 'string', required: false },
            address: { label: 'Address', type: 'string', required: true },
            city: { label: 'City', type: 'string', required: true },
            state: { label: 'State', type: 'string', required: true },
            locationType: { label: 'Location Type', type: 'enum', required: true }
        },
        relations: {
            account: 'account',
            workOrders: 'workOrder'
        }
    },
    workOrder: {
        fields: {
            workOrderId: { label: 'Work Order ID', type: 'uuid', required: true },
            workOrderNumber: { label: 'Work Order #', type: 'string', required: true },
            title: { label: 'Title', type: 'string', required: true },
            status: { label: 'Status', type: 'enum', required: true },
            priority: { label: 'Priority', type: 'enum', required: true },
            scheduledDate: { label: 'Scheduled Date', type: 'date', required: false }
        },
        relations: {
            serviceLocation: 'serviceLocation',
            account: 'account'
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateStepDisplay();
});

function setupEventListeners() {
    // Module selection
    document.getElementById('module-select').addEventListener('change', (e) => {
        const moduleKey = e.target.value;
        updateSubModules(moduleKey);
        updateSummary();
    });
    
    // SubModule selection
    document.getElementById('submodule-select').addEventListener('change', (e) => {
        const moduleKey = document.getElementById('module-select').value;
        if (moduleKey) {
            updateStories(moduleKey);
        }
        updateSummary();
    });
    
    // Primary entity selection
    document.getElementById('primary-entity').addEventListener('change', (e) => {
        const entity = e.target.value;
        if (entity) {
            loadEntityFields(entity);
            updateRelatedEntities(entity);
        }
        updateSummary();
    });
    
    // Related entity selection
    document.getElementById('related-entity').addEventListener('change', (e) => {
        const entity = e.target.value;
        if (entity) {
            loadRelatedFields(entity);
        }
    });
}

function updateSubModules(moduleKey) {
    const subModuleSelect = document.getElementById('submodule-select');
    const storySelect = document.getElementById('story-select');
    
    if (!moduleKey) {
        subModuleSelect.disabled = true;
        storySelect.disabled = true;
        return;
    }
    
    const module = HierarchyData.modules[moduleKey];
    AppState.configuration.module = { id: moduleKey, name: module.name };
    
    // Populate submodules
    subModuleSelect.disabled = false;
    subModuleSelect.innerHTML = '<option value="">-- Select SubModule --</option>';
    
    for (const [key, name] of Object.entries(module.subModules)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = name;
        subModuleSelect.appendChild(option);
    }
}

function updateStories(moduleKey) {
    const storySelect = document.getElementById('story-select');
    const subModuleSelect = document.getElementById('submodule-select');
    
    const subModuleKey = subModuleSelect.value;
    if (!subModuleKey) {
        storySelect.disabled = true;
        return;
    }
    
    const module = HierarchyData.modules[moduleKey];
    AppState.configuration.subModule = { 
        id: subModuleKey, 
        name: module.subModules[subModuleKey] 
    };
    
    // Populate stories
    storySelect.disabled = false;
    storySelect.innerHTML = '<option value="">-- Select User Story --</option>';
    
    for (const [key, description] of Object.entries(module.stories)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${key}: ${description}`;
        storySelect.appendChild(option);
    }
}

function updateRelatedEntities(primaryEntity) {
    const relatedSelect = document.getElementById('related-entity');
    relatedSelect.innerHTML = '<option value="">-- None --</option>';
    
    const entity = BUSM[primaryEntity];
    if (entity && entity.relations) {
        for (const [key, value] of Object.entries(entity.relations)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
            relatedSelect.appendChild(option);
        }
    }
}

function loadEntityFields(entityKey) {
    const entity = BUSM[entityKey];
    if (!entity) return;
    
    AppState.configuration.primaryEntity = entityKey;
    
    const availableList = document.getElementById('available-fields-list');
    availableList.innerHTML = '';
    
    for (const [fieldKey, field] of Object.entries(entity.fields)) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field-item';
        fieldDiv.dataset.field = fieldKey;
        fieldDiv.dataset.entity = entityKey;
        fieldDiv.innerHTML = `
            <strong>${field.label}</strong>
            <span style="float: right; color: #666;">${field.type}</span>
        `;
        fieldDiv.onclick = () => selectField(entityKey, fieldKey, field);
        availableList.appendChild(fieldDiv);
    }
}

function loadRelatedFields(entityKey) {
    const entity = BUSM[entityKey];
    if (!entity) return;
    
    const availableList = document.getElementById('available-fields-list');
    
    // Add separator
    const separator = document.createElement('div');
    separator.style.borderTop = '2px solid #000';
    separator.style.margin = '10px 0';
    separator.innerHTML = `<strong>Related: ${entityKey}</strong>`;
    availableList.appendChild(separator);
    
    // Add related fields
    for (const [fieldKey, field] of Object.entries(entity.fields)) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field-item';
        fieldDiv.dataset.field = fieldKey;
        fieldDiv.dataset.entity = entityKey;
        fieldDiv.style.marginLeft = '10px';
        fieldDiv.innerHTML = `
            <strong>${entityKey}.${field.label}</strong>
            <span style="float: right; color: #666;">${field.type}</span>
        `;
        fieldDiv.onclick = () => selectField(entityKey, fieldKey, field, true);
        availableList.appendChild(fieldDiv);
    }
}

function selectField(entityKey, fieldKey, field, isRelated = false) {
    const fieldObj = {
        entity: entityKey,
        field: fieldKey,
        label: isRelated ? `${entityKey}.${field.label}` : field.label,
        type: field.type,
        isRelated: isRelated
    };
    
    // Check if already selected
    const exists = AppState.configuration.selectedFields.find(
        f => f.entity === entityKey && f.field === fieldKey
    );
    
    if (!exists) {
        AppState.configuration.selectedFields.push(fieldObj);
        updateSelectedFieldsDisplay();
        updateSummary();
    }
}

function updateSelectedFieldsDisplay() {
    const selectedList = document.getElementById('selected-fields-list');
    selectedList.innerHTML = '';
    
    AppState.configuration.selectedFields.forEach((field, index) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field-item selected';
        fieldDiv.innerHTML = `
            <strong>${field.label}</strong>
            <button style="float: right;" onclick="removeField(${index})">Remove</button>
        `;
        selectedList.appendChild(fieldDiv);
    });
}

function removeField(index) {
    AppState.configuration.selectedFields.splice(index, 1);
    updateSelectedFieldsDisplay();
    updateSummary();
}

function nextStep() {
    if (AppState.currentStep < 3) {
        // Validate current step
        if (validateStep(AppState.currentStep)) {
            AppState.currentStep++;
            updateStepDisplay();
            
            // If moving to preview, generate it
            if (AppState.currentStep === 3) {
                generatePreview();
            }
        }
    }
}

function previousStep() {
    if (AppState.currentStep > 1) {
        AppState.currentStep--;
        updateStepDisplay();
    }
}

function validateStep(step) {
    if (step === 1) {
        const module = document.getElementById('module-select').value;
        if (!module) {
            alert('Please select a module');
            return false;
        }
    } else if (step === 2) {
        if (AppState.configuration.selectedFields.length === 0) {
            alert('Please select at least one field');
            return false;
        }
    }
    return true;
}

function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.toggle('active', stepNum === AppState.currentStep);
        step.classList.toggle('completed', stepNum < AppState.currentStep);
    });
    
    // Update content panels
    document.querySelectorAll('[data-content]').forEach(content => {
        const contentNum = parseInt(content.dataset.content);
        content.classList.toggle('active', contentNum === AppState.currentStep);
    });
    
    // Update navigation buttons
    document.getElementById('prev-btn').disabled = AppState.currentStep === 1;
    document.getElementById('next-btn').textContent = 
        AppState.currentStep === 3 ? 'Complete' : 'Next';
}

function updateSummary() {
    const scopeEl = document.getElementById('summary-scope');
    const moduleEl = document.getElementById('summary-module');
    const entityEl = document.getElementById('summary-entity');
    const fieldsEl = document.getElementById('summary-fields');
    
    scopeEl.textContent = AppState.configuration.scopeLevel || 'Not Set';
    moduleEl.textContent = AppState.configuration.module?.name || 'Not Set';
    entityEl.textContent = AppState.configuration.primaryEntity || 'Not Set';
    fieldsEl.textContent = `${AppState.configuration.selectedFields.length} selected`;
}

function generatePreview() {
    const table = document.getElementById('preview-table');
    
    // Generate header
    let headerHtml = '<thead><tr>';
    AppState.configuration.selectedFields.forEach(field => {
        headerHtml += `<th>${field.label}</th>`;
    });
    headerHtml += '</tr></thead>';
    
    // Generate sample data rows
    let bodyHtml = '<tbody>';
    for (let i = 1; i <= 5; i++) {
        bodyHtml += '<tr>';
        AppState.configuration.selectedFields.forEach(field => {
            bodyHtml += `<td>${getSampleData(field.type, i)}</td>`;
        });
        bodyHtml += '</tr>';
    }
    bodyHtml += '</tbody>';
    
    table.innerHTML = headerHtml + bodyHtml;
}

function getSampleData(type, index) {
    const samples = {
        string: ['Acme Corp', 'Global Industries', 'Tech Solutions', 'Service Pro', 'Quick Fix Inc'],
        uuid: ['UUID-001', 'UUID-002', 'UUID-003', 'UUID-004', 'UUID-005'],
        enum: ['Active', 'Active', 'Inactive', 'Active', 'Suspended'],
        email: ['contact@acme.com', 'info@global.com', 'sales@tech.com', 'support@service.com', 'hello@quick.com'],
        timestamp: ['2024-01-15', '2024-02-20', '2024-03-10', '2024-04-05', '2024-05-12'],
        date: ['2024-06-01', '2024-06-15', '2024-07-01', '2024-07-15', '2024-08-01']
    };
    
    return samples[type]?.[index - 1] || `Sample ${index}`;
}

function exportConfiguration() {
    const config = {
        version: AppState.configuration.version,
        hierarchy: {
            application: AppState.configuration.application,
            module: AppState.configuration.module,
            subModule: AppState.configuration.subModule,
            userStory: AppState.configuration.userStory
        },
        scope: {
            level: AppState.configuration.scopeLevel,
            path: getHierarchyPath()
        },
        entity: {
            primary: AppState.configuration.primaryEntity,
            related: getRelatedEntities()
        },
        fields: AppState.configuration.selectedFields,
        layout: {
            type: 'table',
            features: {
                sorting: true,
                pagination: true,
                filtering: false
            }
        },
        metadata: {
            createdAt: new Date().toISOString(),
            createdBy: 'ViewForge v3',
            iteration: 'Sprint-1-Spike'
        }
    };
    
    const jsonOutput = document.getElementById('json-output');
    jsonOutput.style.display = 'block';
    jsonOutput.value = JSON.stringify(config, null, 2);
    
    // Also log to console for easy copying
    console.log('Exported Configuration:', config);
}

function getHierarchyPath() {
    const path = [];
    if (AppState.configuration.application) path.push(AppState.configuration.application.id);
    if (AppState.configuration.module) path.push(AppState.configuration.module.id);
    if (AppState.configuration.subModule) path.push(AppState.configuration.subModule.id);
    if (AppState.configuration.userStory) path.push(AppState.configuration.userStory);
    return path.join('/');
}

function getRelatedEntities() {
    const related = new Set();
    AppState.configuration.selectedFields.forEach(field => {
        if (field.isRelated) {
            related.add(field.entity);
        }
    });
    return Array.from(related);
}