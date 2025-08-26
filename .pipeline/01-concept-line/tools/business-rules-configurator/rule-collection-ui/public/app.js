let currentRules = [];
let editingRuleId = null;

const ruleModal = document.getElementById('ruleModal');
const exportModal = document.getElementById('exportModal');
const ruleForm = document.getElementById('ruleForm');
const rulesList = document.getElementById('rulesList');

document.getElementById('addRuleBtn').addEventListener('click', () => {
    editingRuleId = null;
    ruleForm.reset();
    ruleModal.style.display = 'block';
});

document.getElementById('exportBtn').addEventListener('click', exportRules);
document.getElementById('refreshBtn').addEventListener('click', loadRules);

document.querySelector('#ruleModal .close').addEventListener('click', () => {
    ruleModal.style.display = 'none';
});

document.querySelector('#exportModal .close').addEventListener('click', () => {
    exportModal.style.display = 'none';
});

document.getElementById('closeExportBtn').addEventListener('click', () => {
    exportModal.style.display = 'none';
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    ruleModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === ruleModal) {
        ruleModal.style.display = 'none';
    }
    if (event.target === exportModal) {
        exportModal.style.display = 'none';
    }
});

ruleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(ruleForm);
    const rule = Object.fromEntries(formData.entries());
    
    try {
        let response;
        if (editingRuleId) {
            response = await fetch(`/api/rules/${editingRuleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            });
        } else {
            response = await fetch('/api/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            });
        }
        
        const result = await response.json();
        if (result.success) {
            ruleModal.style.display = 'none';
            loadRules();
        }
    } catch (error) {
        console.error('Error saving rule:', error);
        alert('Failed to save rule');
    }
});

async function loadRules() {
    try {
        const response = await fetch('/api/rules');
        const data = await response.json();
        currentRules = data.rules || [];
        renderRules();
    } catch (error) {
        console.error('Error loading rules:', error);
    }
}

function renderRules() {
    if (currentRules.length === 0) {
        rulesList.innerHTML = `
            <div class="empty-state">
                <h3>No business rules defined yet</h3>
                <p>Click "Add New Rule" to get started</p>
            </div>
        `;
        return;
    }
    
    rulesList.innerHTML = currentRules.map(rule => `
        <div class="rule-card">
            <div class="rule-header">
                <div>
                    <span class="rule-title">${rule.name}</span>
                    <span class="rule-id">${rule.id}</span>
                </div>
                <span>${rule.indicator || '📌'}</span>
            </div>
            <div class="rule-meta">
                <span class="rule-tag type">${rule.type}</span>
                <span class="rule-tag priority-${rule.priority}">${rule.priority} priority</span>
                <span class="rule-tag">📍 ${rule.appliesTo}</span>
            </div>
            <div class="rule-description">${rule.description}</div>
            ${rule.conditions ? `<div class="rule-conditions"><strong>When:</strong> ${rule.conditions}</div>` : ''}
            ${rule.actions ? `<div class="rule-actions-text"><strong>Then:</strong> ${rule.actions}</div>` : ''}
            <div class="rule-actions">
                <button class="btn btn-primary" onclick="editRule('${rule.id}')">Edit</button>
                <button class="btn btn-secondary" onclick="deleteRule('${rule.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function editRule(ruleId) {
    const rule = currentRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    editingRuleId = ruleId;
    
    document.getElementById('ruleName').value = rule.name || '';
    document.getElementById('ruleDescription').value = rule.description || '';
    document.getElementById('ruleType').value = rule.type || '';
    document.getElementById('ruleAppliesTo').value = rule.appliesTo || '';
    document.getElementById('rulePriority').value = rule.priority || 'medium';
    document.getElementById('ruleConditions').value = rule.conditions || '';
    document.getElementById('ruleActions').value = rule.actions || '';
    document.getElementById('ruleIndicator').value = rule.indicator || '📌';
    
    ruleModal.style.display = 'block';
}

async function deleteRule(ruleId) {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
        const response = await fetch(`/api/rules/${ruleId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            loadRules();
        }
    } catch (error) {
        console.error('Error deleting rule:', error);
        alert('Failed to delete rule');
    }
}

async function exportRules() {
    try {
        const response = await fetch('/api/export', {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            document.getElementById('exportStatus').innerHTML = `
                <div class="success-message">
                    <h3>Export Successful!</h3>
                    <p>${result.message}</p>
                    <p><strong>Path:</strong> ${result.path}</p>
                    <p>The business rules have been exported to the pipeline and are ready for use in Stage 1.</p>
                </div>
            `;
        } else {
            document.getElementById('exportStatus').innerHTML = `
                <div class="error-message">
                    <h3>Export Failed</h3>
                    <p>Failed to export rules to pipeline</p>
                </div>
            `;
        }
        exportModal.style.display = 'block';
    } catch (error) {
        console.error('Error exporting rules:', error);
        alert('Failed to export rules');
    }
}

loadRules();