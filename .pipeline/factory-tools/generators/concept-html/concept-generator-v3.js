/**
 * Concept Generator V3
 * Generates clickable HTML wireframes with Business Rule hints
 * Integrates with Business Rules Parser to show validation, states, and logic hints
 */

const BusinessRulesParser = require('../../business-rules-configurator/business-rules-parser.js');

// Enhanced Gap Logger with Visual Display
class VisualGapLogger {
  constructor(existingLogger) {
    this.gaps = existingLogger?.gaps || [];
    this.originalLogger = existingLogger;
  }
  
  log(gap) {
    if (this.originalLogger?.log) {
      this.originalLogger.log(gap);
    }
    this.gaps.push({
      ...gap,
      id: this.gaps.length + 1,
      timestamp: new Date()
    });
  }
  
  getCurrentGaps() {
    return this.originalLogger?.getCurrentGaps?.() || this.gaps;
  }
  
  generateHTMLReport() {
    const currentGaps = this.getCurrentGaps();
    if (!currentGaps || currentGaps.length === 0) return '';
    
    const criticalGaps = currentGaps.filter(g => g.impact === 'HIGH' || g.impact === 'CRITICAL');
    const mediumGaps = currentGaps.filter(g => g.impact === 'MEDIUM');
    const lowGaps = currentGaps.filter(g => g.impact === 'LOW' || !g.impact);
    
    return `
    <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #856404; margin-bottom: 15px;">
        🔍 ${currentGaps.length} Business Rules Need Definition
      </h2>
      
      ${criticalGaps.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <h3 style="color: #d32f2f;">Critical Gaps (Must Define)</h3>
        ${criticalGaps.map(gap => this.renderGap(gap, '#ffebee')).join('')}
      </div>` : ''}
      
      ${mediumGaps.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <h3 style="color: #f57c00;">Medium Priority</h3>
        ${mediumGaps.map(gap => this.renderGap(gap, '#fff3e0')).join('')}
      </div>` : ''}
      
      ${lowGaps.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <h3 style="color: #388e3c;">Low Priority</h3>
        ${lowGaps.map(gap => this.renderGap(gap, '#e8f5e9')).join('')}
      </div>` : ''}
      
      <div style="margin-top: 20px; padding: 10px; background: white; border-radius: 4px;">
        <strong>What This Means:</strong>
        <ul style="margin: 10px 0 0 20px;">
          <li>These rules were not found in the configuration</li>
          <li>The system made assumptions to continue</li>
          <li>You should define these with stakeholders</li>
          <li>Update the YAML with real business rules</li>
        </ul>
      </div>
    </div>`;
  }
  
  renderGap(gap, bgColor) {
    return `
    <div style="background: ${bgColor}; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid currentColor;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <strong>${gap.category}</strong>
          ${gap.entity ? `<span style="color: #666;"> (${gap.entity}${gap.field ? '.' + gap.field : ''})</span>` : ''}
          <div style="margin-top: 5px; color: #666;">
            ${gap.expected ? `<div>❓ Expected: ${gap.expected}</div>` : ''}
            ${gap.assumption ? `<div>💭 Assumed: ${gap.assumption}</div>` : ''}
            ${gap.suggestedFix ? `<div>💡 Fix: ${gap.suggestedFix}</div>` : ''}
          </div>
        </div>
        <button onclick="alert('In real app: Add ${gap.category} to requirements doc')" 
                style="padding: 4px 12px; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">
          Flag for Discussion
        </button>
      </div>
    </div>`;
  }
}

class ConceptGeneratorV3 {
  constructor(viewForgeConfig, busm, gapLogger, rulesPath) {
    this.config = viewForgeConfig;
    this.busm = busm;
    this.gapLogger = gapLogger;
    this.visualGapLogger = new VisualGapLogger(gapLogger);
    
    // Initialize Business Rules Parser
    this.rulesParser = new BusinessRulesParser(gapLogger);
    if (rulesPath) {
      try {
        this.rulesParser.loadRules(rulesPath);
        console.log('✅ Business rules loaded for Concept generation');
      } catch (error) {
        console.warn('⚠️ Could not load business rules:', error.message);
      }
    }
  }

  /**
   * Generate complete HTML wireframe with rule hints
   */
  generate() {
    console.log(`Generating concept view with rules: ${this.config.id}`);
    
    // Get display hints from business rules
    this.ruleHints = this.rulesParser?.getConceptDisplayHints(this.config.entity) || {};
    
    // Generate based on view type
    let html;
    switch(this.config.type) {
      case 'list':
        html = this.generateListView();
        break;
      case 'detail':
        html = this.generateDetailView();
        break;
      case 'form':
        html = this.generateFormView();
        break;
      default:
        throw new Error(`Unknown view type: ${this.config.type}`);
    }
    
    const gaps = this.gapLogger.getCurrentGaps();
    
    return {
      html,
      viewId: this.config.id,
      entity: this.config.entity,
      gaps: gaps,
      success: gaps.filter(g => g.severity === 'CRITICAL').length === 0
    };
  }

  /**
   * Generate list/table view with rule hints
   */
  generateListView() {
    const { display, navigation } = this.config;
    const sampleData = this.generateSampleData(5);
    
    let html = this.generateHTMLWrapper();
    
    html += `
    <div class="container">
      <div class="header">
        <h1>${this.config.title || this.config.entity + ' List'}</h1>
        <div class="actions">`;
    
    if (display.actions.includes('create')) {
      html += `
          <button onclick="handleAction('create')" class="btn btn-primary">
            + New ${this.config.entity}
          </button>`;
    }
    
    html += `
        </div>
      </div>`;
    
    // Show business rules legend if rules are loaded
    if (this.ruleHints.showRequired || this.ruleHints.showStates) {
      html += this.generateRuleLegend();
    }
    
    // Show gap report if there are any gaps
    html += this.visualGapLogger.generateHTMLReport();
    
    html += `
      <table class="data-table">
        <thead>
          <tr>`;
    
    // Generate headers with rule indicators
    display.fields.forEach(field => {
      const isRequired = this.rulesParser?.isFieldRequired(this.config.entity, field.path);
      const isUnique = this.rulesParser?.isFieldUnique(this.config.entity, field.path);
      
      html += `
            <th class="${field.sortable ? 'sortable' : ''}" ${field.sortable ? `onclick="sort('${field.path}')"` : ''}>
              ${field.label}`;
      
      if (isRequired) html += ' <span class="required">*</span>';
      if (isUnique) html += ' <span class="unique-indicator" title="Must be unique">🔒</span>';
      if (field.sortable) html += '<span class="sort-icon">↕</span>';
      
      html += `
            </th>`;
    });
    
    if (display.actions.some(a => a !== 'create')) {
      html += `
            <th>Actions</th>`;
    }
    
    html += `
          </tr>
        </thead>
        <tbody>`;
    
    // Generate rows with state indicators
    sampleData.forEach((item, index) => {
      const rowClickHandler = navigation.onRowClick?.target 
        ? `onclick="navigateToView('${navigation.onRowClick.target}', '${item.id}')"` 
        : '';
      
      html += `
          <tr ${rowClickHandler} class="${navigation.onRowClick?.target ? 'clickable-row' : ''}">`;
      
      display.fields.forEach(field => {
        const value = this.getFieldValue(item, field.path);
        
        // Check if this is a status field to show state transitions
        if (field.path === 'status' && this.ruleHints.showStates) {
          const transitions = this.rulesParser?.getAllowedTransitions(this.config.entity, value) || [];
          const stateDisplay = this.rulesParser?.getStateDisplay(this.config.entity, value) || {};
          
          html += `
            <td>
              <span class="state-badge" style="background: ${this.getStateColor(stateDisplay.color)}; color: white;">
                ${value}
              </span>`;
          
          if (transitions.length > 0) {
            html += `
              <span class="state-transition-hint" title="Can transition to: ${transitions.join(', ')}">
                → ${transitions.length} option${transitions.length > 1 ? 's' : ''}
              </span>`;
          } else {
            html += `
              <span class="state-terminal" title="Terminal state - no transitions">
                🔒
              </span>`;
          }
          
          html += `
            </td>`;
        } else if (field.clickable && navigation.onFieldClick?.[field.path]) {
          const nav = navigation.onFieldClick[field.path];
          html += `
            <td>
              <a href="#" onclick="navigateToView('${nav.target}', '${item.id}'); event.stopPropagation(); return false;" class="field-link">
                ${value}
              </a>
            </td>`;
        } else {
          html += `
            <td>${value}</td>`;
        }
      });
      
      // Add action buttons with business rule hints
      if (display.actions.some(a => a !== 'create')) {
        html += `
            <td class="actions-cell">`;
        
        display.actions.forEach(action => {
          if (action !== 'create') {
            // Check if action is blocked by business rules
            const isBlocked = this.checkActionBlocked(action, item);
            
            if (isBlocked) {
              html += `
              <button onclick="event.stopPropagation();" class="btn btn-sm blocked-action" disabled title="${isBlocked.reason}">
                ${this.getActionLabel(action)} 🚫
              </button>`;
            } else {
              html += `
              <button onclick="handleAction('${action}', '${item.id}'); event.stopPropagation();" class="btn btn-sm">
                ${this.getActionLabel(action)}
              </button>`;
            }
          }
        });
        
        html += `
            </td>`;
      }
      
      html += `
          </tr>`;
    });
    
    html += `
        </tbody>
      </table>
      
      <div class="pagination">
        <span>Showing 1-${sampleData.length} of ${sampleData.length * 4} results</span>
        <div class="pagination-controls">
          <button onclick="previousPage()" disabled>Previous</button>
          <span>Page 1 of 4</span>
          <button onclick="nextPage()">Next</button>
        </div>
      </div>
    </div>`;
    
    html += this.generateScripts();
    html += `
  </body>
</html>`;
    
    return html;
  }

  /**
   * Generate form view with validation hints
   */
  generateFormView() {
    const { display } = this.config;
    
    let html = this.generateHTMLWrapper();
    
    html += `
    <div class="container">
      <div class="header">
        <h1>${this.config.title || 'Edit ' + this.config.entity}</h1>
      </div>`;
    
    // Show gap report if there are any gaps
    html += this.visualGapLogger.generateHTMLReport();
    
    // Show what will happen on save
    const onCreateLogic = this.rulesParser?.getBusinessLogic(this.config.entity, 'onCreate') || [];
    if (onCreateLogic.length > 0) {
      html += `
      <div class="business-logic-hint">
        <strong>On Save:</strong>
        <ul>`;
      
      onCreateLogic.forEach(action => {
        if (action.action === 'setState') {
          html += `<li>Status will be set to "${action.value}"</li>`;
        } else if (action.action === 'generateField') {
          html += `<li>${action.field} will be auto-generated</li>`;
        } else if (action.action === 'log') {
          html += `<li>Action will be logged</li>`;
        }
      });
      
      html += `
        </ul>
      </div>`;
    }
    
    html += `
      <form class="form-view" onsubmit="handleSubmit(event)">`;
    
    // Generate form fields with validation hints
    display.fields.forEach(field => {
      const fieldDef = this.busm?.getField?.(this.config.entity, field.path);
      const isRequired = this.rulesParser?.isFieldRequired(this.config.entity, field.path);
      const isUnique = this.rulesParser?.isFieldUnique(this.config.entity, field.path);
      const pattern = this.rulesParser?.getFieldPatterns(this.config.entity)[field.path];
      
      html += `
        <div class="form-group">
          <label for="${field.path}">
            ${field.label}`;
      
      if (isRequired) html += ' <span class="required">*</span>';
      if (isUnique) html += ' <span class="unique-indicator" title="Must be unique">🔒</span>';
      
      html += `
          </label>`;
      
      // Add validation hints
      const hints = [];
      if (isRequired) hints.push('Required');
      if (isUnique) hints.push('Must be unique');
      if (pattern) hints.push('Special format required');
      if (fieldDef?.maxLength) hints.push(`Max ${fieldDef.maxLength} characters`);
      
      if (fieldDef?.type === 'enum' && fieldDef.options) {
        html += `
          <select id="${field.path}" name="${field.path}" class="form-control" ${isRequired ? 'required' : ''}>
            <option value="">Select ${field.label}</option>`;
        
        fieldDef.options.forEach(option => {
          html += `
            <option value="${option}">${option}</option>`;
        });
        
        html += `
          </select>`;
      } else {
        const inputType = this.getInputType(fieldDef?.type || 'string');
        html += `
          <input 
            type="${inputType}" 
            id="${field.path}" 
            name="${field.path}" 
            class="form-control"
            ${isRequired ? 'required' : ''}
            ${fieldDef?.maxLength ? `maxlength="${fieldDef.maxLength}"` : ''}
            placeholder="${hints.join(', ') || `Enter ${field.label.toLowerCase()}`}"
          />`;
      }
      
      if (hints.length > 0) {
        html += `
          <div class="validation-hint">${hints.join(' • ')}</div>`;
      }
      
      // Show validation message if defined
      if (isRequired) {
        const message = this.rulesParser?.getValidationMessage(this.config.entity, field.path, 'required');
        if (message) {
          html += `
          <div class="validation-message" style="display: none; color: red;">
            ${message}
          </div>`;
        }
      }
      
      html += `
        </div>`;
    });
    
    html += `
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" onclick="handleCancel()" class="btn">Cancel</button>
        </div>
      </form>
    </div>`;
    
    html += this.generateScripts();
    html += `
  </body>
</html>`;
    
    return html;
  }

  /**
   * Generate rule legend
   */
  generateRuleLegend() {
    return `
    <div class="rule-legend">
      <h3>Business Rules:</h3>
      <span class="legend-item"><span class="required">*</span> Required field</span>
      <span class="legend-item">🔒 Unique constraint</span>
      <span class="legend-item">→ State transitions available</span>
      <span class="legend-item">🚫 Action may be blocked</span>
    </div>`;
  }

  /**
   * Check if an action is blocked by business rules
   */
  checkActionBlocked(action, item) {
    // Check delete rules
    if (action === 'delete') {
      const onDeleteLogic = this.rulesParser?.getBusinessLogic(this.config.entity, 'onDelete') || [];
      
      // Simulate some blocking conditions for demo
      if (item.status === 'Active') {
        return { blocked: true, reason: 'Cannot delete active accounts' };
      }
      
      // Check for related data (simulated)
      if (Math.random() > 0.7) {
        return { blocked: true, reason: 'Has related opportunities' };
      }
    }
    
    return null;
  }

  /**
   * Get state color for display
   */
  getStateColor(colorName) {
    const colors = {
      blue: '#2196F3',
      green: '#4CAF50',
      orange: '#FF9800',
      red: '#F44336',
      gray: '#9E9E9E'
    };
    return colors[colorName] || colors.gray;
  }

  /**
   * Generate detail view (keeping existing with minor rule hints)
   */
  generateDetailView() {
    const { display, navigation } = this.config;
    const sampleData = this.generateSampleData(1)[0];
    
    let html = this.generateHTMLWrapper();
    
    html += `
    <div class="container">
      <div class="header">
        <h1>${this.config.title || this.config.entity + ' Details'}</h1>
        <div class="actions">`;
    
    // Add state transition buttons if status field exists
    const statusField = sampleData.status;
    if (statusField && this.ruleHints.showStates) {
      const transitions = this.rulesParser?.getAllowedTransitions(this.config.entity, statusField) || [];
      
      if (transitions.length > 0) {
        html += `
          <div class="state-transitions">
            <span>Change Status to: </span>`;
        
        transitions.forEach(nextState => {
          html += `
            <button onclick="changeState('${nextState}')" class="btn btn-sm">
              ${nextState}
            </button>`;
        });
        
        html += `
          </div>`;
      }
    }
    
    display.actions.forEach(action => {
      html += `
          <button onclick="handleAction('${action}', '${sampleData.id}')" class="btn">
            ${this.getActionLabel(action)}
          </button>`;
    });
    
    html += `
        </div>
      </div>
      
      ${this.visualGapLogger.generateHTMLReport()}
      
      <div class="detail-view">`;
    
    display.fields.forEach(field => {
      const value = this.getFieldValue(sampleData, field.path);
      const isClickable = field.clickable && navigation.onFieldClick?.[field.path];
      
      html += `
        <div class="field-group">
          <label>${field.label}:</label>
          <div class="field-value">`;
      
      if (isClickable) {
        const nav = navigation.onFieldClick[field.path];
        html += `
            <a href="#" onclick="navigateToView('${nav.target}', '${sampleData.id}'); return false;" class="field-link">
              ${value}
            </a>`;
      } else {
        html += value;
      }
      
      html += `
          </div>
        </div>`;
    });
    
    html += `
      </div>
    </div>`;
    
    html += this.generateScripts();
    html += `
  </body>
</html>`;
    
    return html;
  }

  /**
   * Generate HTML wrapper with enhanced styles for rules
   */
  generateHTMLWrapper() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.config.title || this.config.id} - Concept with Rules</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    h1 {
      font-size: 28px;
      color: #2c3e50;
    }
    
    /* Business Rules Indicators */
    .required {
      color: #e74c3c;
      font-weight: bold;
      margin-left: 4px;
    }
    
    .unique-indicator {
      margin-left: 4px;
      cursor: help;
    }
    
    .state-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .state-transition-hint {
      color: #666;
      font-size: 12px;
      margin-left: 8px;
      cursor: help;
    }
    
    .state-terminal {
      margin-left: 8px;
      cursor: help;
    }
    
    .blocked-action {
      opacity: 0.6;
      cursor: not-allowed !important;
    }
    
    .validation-hint {
      color: #666;
      font-size: 12px;
      margin-top: 4px;
      font-style: italic;
    }
    
    .validation-message {
      font-size: 12px;
      margin-top: 4px;
    }
    
    .business-logic-hint {
      background: #e8f5e9;
      border: 1px solid #4caf50;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 20px;
    }
    
    .business-logic-hint ul {
      margin: 8px 0 0 20px;
      font-size: 14px;
    }
    
    .rule-legend {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 20px;
    }
    
    .rule-legend h3 {
      font-size: 14px;
      margin-bottom: 8px;
      color: #495057;
    }
    
    .legend-item {
      display: inline-block;
      margin-right: 20px;
      font-size: 13px;
      color: #6c757d;
    }
    
    .state-transitions {
      display: inline-block;
      margin-right: 15px;
      padding: 5px 10px;
      background: #fff3cd;
      border-radius: 4px;
    }
    
    .state-transitions span {
      font-size: 14px;
      margin-right: 8px;
    }
    
    /* Base styles */
    .btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }
    
    .btn:hover:not(:disabled) {
      background: #f0f0f0;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
    
    .btn-primary:hover {
      background: #0056b3;
    }
    
    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }
    
    .data-table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .data-table th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    
    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    
    .clickable-row {
      cursor: pointer;
    }
    
    .clickable-row:hover {
      background: #f8f9fa;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #495057;
    }
    
    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
    }
    
    .form-actions {
      margin-top: 30px;
      display: flex;
      gap: 10px;
    }
    
    .detail-view {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .field-group {
      display: flex;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .field-group:last-child {
      border-bottom: none;
    }
    
    .field-group label {
      flex: 0 0 200px;
      font-weight: 600;
      color: #495057;
    }
    
    .field-value {
      flex: 1;
      color: #212529;
    }
    
    .field-link {
      color: #007bff;
      text-decoration: none;
    }
    
    .field-link:hover {
      text-decoration: underline;
    }
    
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding: 15px;
      background: white;
      border-radius: 8px;
    }
    
    /* Gap detection styles */
    .needs-definition {
      display: inline-block;
      background: #fff3cd;
      color: #856404;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-left: 8px;
      cursor: help;
      border: 1px dashed #ffc107;
    }
    
    .undefined-field {
      border: 2px dashed #ffc107 !important;
      background: #fffbf0 !important;
    }
    
    .needs-rule {
      color: #ff6b6b;
      font-size: 12px;
      margin-left: 8px;
    }
  </style>
</head>
<body>`;
  }

  /**
   * Generate navigation scripts
   */
  generateScripts() {
    return `
  <script>
    // Navigation functions
    function navigateToView(target, id) {
      console.log('Navigate to:', target, 'with ID:', id);
      alert('Navigate to: ' + target + '\\nID: ' + id + '\\n\\n(In real app, this would navigate to the ' + target + ' view)');
    }
    
    function handleAction(action, id) {
      console.log('Action:', action, 'ID:', id);
      alert('Action: ' + action + (id ? '\\nID: ' + id : '') + '\\n\\n(In real app, this would perform the action)');
    }
    
    function changeState(newState) {
      console.log('Change state to:', newState);
      alert('Change state to: ' + newState + '\\n\\n(In real app, this would trigger state transition with validation)');
    }
    
    function sort(field) {
      console.log('Sort by:', field);
      alert('Sort by: ' + field);
    }
    
    function handleSubmit(event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData);
      console.log('Form data:', data);
      
      // Show what business rules would be applied
      let message = 'Form submitted!\\n\\n';
      message += 'Data:\\n' + JSON.stringify(data, null, 2);
      message += '\\n\\nBusiness rules would:\\n';
      message += '- Validate required fields\\n';
      message += '- Check unique constraints\\n';
      message += '- Apply onCreate logic\\n';
      message += '- Set initial state\\n';
      message += '- Generate auto fields';
      
      alert(message);
    }
    
    function handleCancel() {
      if (confirm('Cancel without saving?')) {
        history.back();
      }
    }
    
    function previousPage() {
      alert('Previous page');
    }
    
    function nextPage() {
      alert('Next page');
    }
  </script>`;
  }

  /**
   * Generate sample data (existing methods)
   */
  generateSampleData(count) {
    const data = [];
    const statuses = ['Prospect', 'Active', 'Suspended'];
    
    for (let i = 1; i <= count; i++) {
      const item = {
        id: `${this.config.entity.toLowerCase()}-${i}`,
        status: statuses[i % statuses.length]
      };
      
      this.config.display.fields.forEach(field => {
        if (field.path === 'status') {
          // Already set above
        } else if (field.path.includes('.')) {
          const parts = field.path.split('.');
          let current = item;
          for (let j = 0; j < parts.length - 1; j++) {
            if (!current[parts[j]]) {
              current[parts[j]] = {};
            }
            current = current[parts[j]];
          }
          current[parts[parts.length - 1]] = this.generateFieldValue(field, i);
        } else {
          item[field.path] = this.generateFieldValue(field, i);
        }
      });
      
      data.push(item);
    }
    return data;
  }

  generateFieldValue(field, index) {
    const fieldName = field.path.split('.').pop();
    
    if (fieldName.toLowerCase().includes('name')) {
      return `Sample ${field.label} ${index}`;
    }
    if (fieldName.toLowerCase().includes('number')) {
      return `ACC-2025-000${index}`;
    }
    if (fieldName.toLowerCase().includes('type')) {
      return ['Standard', 'Premium', 'Enterprise'][index % 3];
    }
    
    return `${field.label} ${index}`;
  }

  getFieldValue(obj, path) {
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    return value || `[${path}]`;
  }

  getInputType(fieldType) {
    const typeMap = {
      'email': 'email',
      'url': 'url',
      'date': 'date',
      'number': 'number',
      'boolean': 'checkbox',
      'text': 'text',
      'string': 'text'
    };
    return typeMap[fieldType] || 'text';
  }

  getActionLabel(action) {
    const labels = {
      'view': '👁 View',
      'edit': '✏️ Edit',
      'delete': '🗑 Delete',
      'create': '➕ Create'
    };
    return labels[action] || action;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConceptGeneratorV3;
}