/**
 * Factory Control Panel - Frontend Application
 */

// Global state
let entities = [];
let selectedEntity = null;
let selectedFields = [];
let buildInProgress = false;
let pollInterval = null;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    updateClock();
    setInterval(updateClock, 1000);
    await loadEntities();
    await loadModuleCount();
});

// Update clock
function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString();
}

// Load BUSM entities
async function loadEntities() {
    try {
        const response = await fetch('/api/busm/entities');
        const data = await response.json();
        entities = data.entities;
        
        displayEntities();
        document.getElementById('entityCount').textContent = entities.length;
    } catch (error) {
        console.error('Failed to load entities:', error);
        addLog('Error loading BUSM entities', 'error');
    }
}

// Display entities in the panel
function displayEntities() {
    const entityList = document.getElementById('entityList');
    entityList.innerHTML = '';
    
    if (!entities || entities.length === 0) {
        entityList.innerHTML = '<div class="entity-item">No entities loaded. Check server connection.</div>';
        return;
    }
    
    entities.forEach(entity => {
        const div = document.createElement('div');
        div.className = 'entity-item';
        div.onclick = () => selectEntity(entity);
        
        div.innerHTML = `
            <div class="entity-name">${entity.name}</div>
            <div class="entity-info">${entity.fieldCount} fields • ${entity.description || 'No description'}</div>
        `;
        
        entityList.appendChild(div);
    });
}

// Select an entity
function selectEntity(entity) {
    selectedEntity = entity;
    selectedFields = [];
    
    // Update UI
    document.querySelectorAll('.entity-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Update field panel
    document.getElementById('selectedEntity').textContent = entity.name;
    document.getElementById('fieldCount').textContent = `${entity.fieldCount} fields available`;
    
    displayFields(entity);
    updateBuildButton();
    
    addLog(`Selected entity: ${entity.name}`, 'info');
}

// Display fields for selected entity
function displayFields(entity) {
    const fieldList = document.getElementById('fieldList');
    fieldList.innerHTML = '';
    
    // Get phase filter
    const phase = parseInt(document.getElementById('phaseSelect').value);
    
    // Filter fields based on phase
    let fieldsToShow = entity.fields;
    if (phase === 1) {
        // Phase 1: Only essential fields
        fieldsToShow = entity.fields.filter(f => 
            f.required || 
            ['id', 'name', 'status', 'type', 'email', 'phone'].some(n => f.name.toLowerCase().includes(n))
        ).slice(0, 10);
    } else if (phase === 2) {
        // Phase 2: First 15 fields
        fieldsToShow = entity.fields.slice(0, 15);
    }
    // Phase 3: All fields
    
    fieldsToShow.forEach(field => {
        const div = document.createElement('div');
        div.className = 'field-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'field-checkbox';
        checkbox.checked = field.required || phase === 1;
        checkbox.onchange = () => toggleField(field, checkbox.checked);
        
        const name = document.createElement('span');
        name.className = 'field-name';
        name.textContent = field.name;
        
        const type = document.createElement('span');
        type.className = 'field-type';
        type.textContent = field.type;
        
        div.appendChild(checkbox);
        div.appendChild(name);
        div.appendChild(type);
        
        if (field.required) {
            const required = document.createElement('span');
            required.className = 'field-required';
            required.textContent = '*';
            div.appendChild(required);
        }
        
        fieldList.appendChild(div);
        
        // Auto-select if checked
        if (checkbox.checked) {
            toggleField(field, true);
        }
    });
    
    updateFieldCount();
}

// Toggle field selection
function toggleField(field, selected) {
    if (selected) {
        if (!selectedFields.find(f => f.name === field.name)) {
            selectedFields.push(field);
        }
    } else {
        selectedFields = selectedFields.filter(f => f.name !== field.name);
    }
    
    updateFieldCount();
    updateBuildButton();
}

// Update field count
function updateFieldCount() {
    document.getElementById('selectedCount').textContent = `${selectedFields.length} fields selected`;
}

// Update build button state
function updateBuildButton() {
    const button = document.getElementById('buildButton');
    const hint = document.querySelector('.build-hint');
    
    if (selectedEntity && selectedFields.length > 0 && !buildInProgress) {
        button.disabled = false;
        hint.textContent = `Ready to build ${selectedEntity.name} module`;
    } else if (buildInProgress) {
        button.disabled = true;
        hint.textContent = 'Build in progress...';
    } else {
        button.disabled = true;
        hint.textContent = 'Select an entity and fields to enable';
    }
}

// Build button click handler
document.getElementById('buildButton').onclick = async () => {
    if (!selectedEntity || selectedFields.length === 0 || buildInProgress) return;
    
    buildInProgress = true;
    const button = document.getElementById('buildButton');
    button.classList.add('building');
    button.textContent = 'BUILDING...';
    
    // Clear logs
    document.getElementById('logOutput').innerHTML = '';
    addLog('🚀 Starting build process...', 'info');
    addLog(`Entity: ${selectedEntity.name}`, 'info');
    addLog(`Fields: ${selectedFields.length} selected`, 'info');
    
    // Reset stages
    resetStages();
    
    try {
        // Start the build
        const response = await fetch('/api/modules/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entity: selectedEntity.name,
                fields: selectedFields,
                phase: parseInt(document.getElementById('phaseSelect').value)
            })
        });
        
        const data = await response.json();
        addLog(`Build ID: ${data.buildId}`, 'info');
        
        // Start polling for status
        pollBuildStatus(data.buildId);
        
    } catch (error) {
        console.error('Build failed:', error);
        addLog('❌ Build failed: ' + error.message, 'error');
        buildComplete(false);
    }
};

// Poll build status
function pollBuildStatus(buildId) {
    pollInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/build/status');
            const build = await response.json();
            
            // Update stages
            Object.entries(build.stages).forEach(([stage, info]) => {
                updateStage(stage, info.status, info.message);
            });
            
            // Add new logs
            if (build.logs && build.logs.length > 0) {
                const logOutput = document.getElementById('logOutput');
                const existingLogs = logOutput.children.length;
                
                build.logs.slice(existingLogs).forEach(log => {
                    addLog(log.message, log.message.includes('❌') ? 'error' : 
                           log.message.includes('⚠️') ? 'warning' : 'success');
                });
            }
            
            // Check if complete
            if (build.status === 'completed' || build.status === 'failed') {
                clearInterval(pollInterval);
                buildComplete(build.status === 'completed');
            }
            
        } catch (error) {
            console.error('Status poll failed:', error);
        }
    }, 1000);
}

// Update stage status
function updateStage(stageName, status, message) {
    const stage = document.querySelector(`[data-stage="${stageName}"]`);
    if (!stage) return;
    
    // Remove all status classes
    stage.classList.remove('pending', 'running', 'completed', 'failed');
    
    // Add new status class
    if (status === 'running') {
        stage.classList.add('running');
        stage.querySelector('.stage-status').textContent = 'Running...';
    } else if (status === 'completed') {
        stage.classList.add('completed');
        stage.querySelector('.stage-status').textContent = 'Complete';
    } else if (status === 'failed') {
        stage.classList.add('failed');
        stage.querySelector('.stage-status').textContent = 'Failed';
    } else {
        stage.querySelector('.stage-status').textContent = 'Ready';
    }
}

// Reset stages
function resetStages() {
    document.querySelectorAll('.stage').forEach(stage => {
        stage.classList.remove('running', 'completed', 'failed');
        stage.querySelector('.stage-status').textContent = 'Ready';
    });
}

// Build complete
function buildComplete(success) {
    buildInProgress = false;
    const button = document.getElementById('buildButton');
    button.classList.remove('building');
    button.textContent = 'BUILD IT';
    
    if (success) {
        addLog('✅ Build completed successfully!', 'success');
        loadModuleCount();
    } else {
        addLog('❌ Build failed. Check logs for details.', 'error');
    }
    
    updateBuildButton();
}

// Add log entry
function addLog(message, type = 'info') {
    const logOutput = document.getElementById('logOutput');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logOutput.appendChild(entry);
    logOutput.scrollTop = logOutput.scrollHeight;
}

// Load module count
async function loadModuleCount() {
    try {
        const response = await fetch('/api/modules');
        const data = await response.json();
        if (data && data.modules) {
            document.getElementById('moduleCount').textContent = data.modules.length;
        } else {
            document.getElementById('moduleCount').textContent = '0';
        }
    } catch (error) {
        console.error('Failed to load modules:', error);
        document.getElementById('moduleCount').textContent = '0';
    }
}

// View history
async function viewHistory() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();
        
        const content = document.getElementById('historyContent');
        content.innerHTML = '<table style="width:100%">';
        content.innerHTML += '<tr><th>Entity</th><th>Phase</th><th>Date</th><th>Status</th></tr>';
        
        data.history.forEach(item => {
            content.innerHTML += `
                <tr>
                    <td>${item.entity}</td>
                    <td>Phase ${item.phase}</td>
                    <td>${new Date(item.timestamp).toLocaleString()}</td>
                    <td>${item.status}</td>
                </tr>
            `;
        });
        
        content.innerHTML += '</table>';
        document.getElementById('historyModal').style.display = 'block';
        
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

// Refresh data
async function refreshData() {
    addLog('Refreshing data...', 'info');
    await loadEntities();
    await loadModuleCount();
    addLog('Data refreshed', 'success');
}

// Show help
function showHelp() {
    alert(`Factory Control Panel - Quick Help
    
1. Select an entity from the left panel
2. Choose fields to include in the module
3. Select the phase (1=Essential, 2=Extended, 3=Complete)
4. Click BUILD IT to generate the module
5. Watch the pipeline progress in real-time
6. Check the logs for detailed output

The pipeline will:
- Create module configuration
- Generate database schema
- Build React components
- Validate everything

For more help, check the documentation.`);
}

// Close modal
function closeModal() {
    document.getElementById('historyModal').style.display = 'none';
}

// Phase change handler
document.getElementById('phaseSelect').onchange = () => {
    if (selectedEntity) {
        displayFields(selectedEntity);
    }
};