/**
 * Concept Generator V2
 * Generates clickable HTML wireframes from simplified ViewForge format
 * Purpose: Workflow validation through interactive wireframes
 */

class ConceptGeneratorV2 {
  constructor(viewForgeConfig, busm, gapLogger) {
    this.config = viewForgeConfig;
    this.busm = busm;
    this.gapLogger = gapLogger;
    this.generatedFiles = [];
  }

  /**
   * Generate complete HTML wireframe
   */
  generate() {
    console.log(`Generating concept view: ${this.config.id}`);
    
    // Validate configuration
    const validation = this.validateConfig();
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    
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
    
    // Report gaps found
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
   * Validate configuration has required fields
   */
  validateConfig() {
    const errors = [];
    
    if (!this.config.id) errors.push('Missing view ID');
    if (!this.config.entity) errors.push('Missing entity');
    if (!this.config.type) errors.push('Missing view type');
    if (!this.config.display?.fields || this.config.display.fields.length === 0) {
      errors.push('No fields to display');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate list/table view
   */
  generateListView() {
    const { display, navigation } = this.config;
    
    // Generate sample data
    const sampleData = this.generateSampleData(5);
    
    let html = this.generateHTMLWrapper();
    
    html += `
    <div class="container">
      <div class="header">
        <h1>${this.config.title || this.config.entity + ' List'}</h1>
        <div class="actions">`;
    
    // Add create button if in actions
    if (display.actions.includes('create')) {
      html += `
          <button onclick="handleAction('create')" class="btn btn-primary">
            + New ${this.config.entity}
          </button>`;
    }
    
    html += `
        </div>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>`;
    
    // Generate headers
    display.fields.forEach(field => {
      const sortable = field.sortable ? 'sortable' : '';
      html += `
            <th class="${sortable}" ${field.sortable ? `onclick="sort('${field.path}')"` : ''}>
              ${field.label}
              ${field.sortable ? '<span class="sort-icon">↕</span>' : ''}
            </th>`;
    });
    
    // Add actions column if needed
    if (display.actions.some(a => a !== 'create')) {
      html += `
            <th>Actions</th>`;
    }
    
    html += `
          </tr>
        </thead>
        <tbody>`;
    
    // Generate rows
    sampleData.forEach((item, index) => {
      const rowClickHandler = navigation.onRowClick?.target 
        ? `onclick="navigateToView('${navigation.onRowClick.target}', '${item.id}')"` 
        : '';
      
      html += `
          <tr ${rowClickHandler} class="${navigation.onRowClick?.target ? 'clickable-row' : ''}">`;
      
      // Generate cells
      display.fields.forEach(field => {
        const value = this.getFieldValue(item, field.path);
        const isClickable = field.clickable && navigation.onFieldClick?.[field.path];
        
        if (isClickable) {
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
      
      // Add action buttons
      if (display.actions.some(a => a !== 'create')) {
        html += `
            <td class="actions-cell">`;
        
        display.actions.forEach(action => {
          if (action !== 'create') {
            const actionNav = navigation.onActionClick?.[action];
            html += `
              <button onclick="handleAction('${action}', '${item.id}'); event.stopPropagation();" class="btn btn-sm">
                ${this.getActionLabel(action)}
              </button>`;
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
   * Generate detail view
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
    
    // Add action buttons
    display.actions.forEach(action => {
      html += `
          <button onclick="handleAction('${action}', '${sampleData.id}')" class="btn">
            ${this.getActionLabel(action)}
          </button>`;
    });
    
    html += `
        </div>
      </div>
      
      <div class="detail-view">`;
    
    // Generate field displays
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
   * Generate form view
   */
  generateFormView() {
    const { display } = this.config;
    
    let html = this.generateHTMLWrapper();
    
    html += `
    <div class="container">
      <div class="header">
        <h1>${this.config.title || 'Edit ' + this.config.entity}</h1>
      </div>
      
      <form class="form-view" onsubmit="handleSubmit(event)">`;
    
    // Generate form fields
    display.fields.forEach(field => {
      const fieldDef = this.busm?.getField?.(this.config.entity, field.path);
      const inputType = this.getInputType(fieldDef?.type || 'string');
      
      html += `
        <div class="form-group">
          <label for="${field.path}">${field.label}:</label>`;
      
      if (fieldDef?.type === 'enum' && fieldDef.options) {
        html += `
          <select id="${field.path}" name="${field.path}" class="form-control">`;
        fieldDef.options.forEach(option => {
          html += `
            <option value="${option}">${option}</option>`;
        });
        html += `
          </select>`;
      } else {
        html += `
          <input type="${inputType}" id="${field.path}" name="${field.path}" class="form-control" />`;
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
   * Generate HTML wrapper with styles
   */
  generateHTMLWrapper() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.config.title || this.config.id} - Concept</title>
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
    
    .btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }
    
    .btn:hover {
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
    
    .data-table th.sortable {
      cursor: pointer;
    }
    
    .data-table th.sortable:hover {
      background: #e9ecef;
    }
    
    .sort-icon {
      margin-left: 5px;
      color: #6c757d;
    }
    
    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    
    .data-table tr:last-child td {
      border-bottom: none;
    }
    
    .clickable-row {
      cursor: pointer;
    }
    
    .clickable-row:hover {
      background: #f8f9fa;
    }
    
    .field-link {
      color: #007bff;
      text-decoration: none;
    }
    
    .field-link:hover {
      text-decoration: underline;
    }
    
    .actions-cell {
      white-space: nowrap;
    }
    
    .actions-cell button {
      margin-right: 5px;
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
    
    .pagination-controls {
      display: flex;
      gap: 10px;
      align-items: center;
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
    
    .form-view {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
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
  </style>
</head>
<body>`;
  }

  /**
   * Generate navigation scripts
   */
  generateScripts() {
    const { navigation } = this.config;
    
    return `
  <script>
    // Navigation functions
    function navigateToView(target, id) {
      console.log('Navigate to:', target, 'with ID:', id);
      alert('Navigate to: ' + target + '\\nID: ' + id + '\\n\\n(In real app, this would navigate to the ' + target + ' view)');
    }
    
    function handleAction(action, id) {
      console.log('Action:', action, 'ID:', id);
      
      ${Object.entries(navigation.onActionClick || {}).map(([action, nav]) => `
      if (action === '${action}') {
        ${nav.confirm ? `if (!confirm('Are you sure you want to ${action} this ${this.config.entity}?')) return;` : ''}
        ${nav.target ? `navigateToView('${nav.target}', id);` : `alert('Perform action: ${action}');`}
      }`).join('')}
    }
    
    function sort(field) {
      console.log('Sort by:', field);
      alert('Sort by: ' + field + '\\n\\n(In real app, this would sort the table)');
    }
    
    function previousPage() {
      alert('Previous page (disabled for first page)');
    }
    
    function nextPage() {
      alert('Next page\\n\\n(In real app, this would load the next page of results)');
    }
    
    function handleSubmit(event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData);
      console.log('Form data:', data);
      alert('Form submitted!\\n\\n' + JSON.stringify(data, null, 2));
    }
    
    function handleCancel() {
      if (confirm('Cancel without saving?')) {
        history.back();
      }
    }
  </script>`;
  }

  /**
   * Generate sample data for testing
   */
  generateSampleData(count) {
    const data = [];
    for (let i = 1; i <= count; i++) {
      const item = {
        id: `${this.config.entity.toLowerCase()}-${i}`
      };
      
      // Generate sample values for each field
      this.config.display.fields.forEach(field => {
        if (field.path.includes('.')) {
          // Handle nested fields
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

  /**
   * Generate sample value for a field
   */
  generateFieldValue(field, index) {
    const fieldName = field.path.split('.').pop();
    
    // Check BUSM for field type
    const fieldDef = this.busm?.getField?.(this.config.entity, field.path);
    
    if (fieldDef?.type === 'enum' && fieldDef.options) {
      return fieldDef.options[index % fieldDef.options.length];
    }
    
    // Generate based on field name patterns
    if (fieldName.toLowerCase().includes('name')) {
      return `Sample ${field.label} ${index}`;
    }
    if (fieldName.toLowerCase().includes('email')) {
      return `email${index}@example.com`;
    }
    if (fieldName.toLowerCase().includes('phone')) {
      return `555-000${index}`;
    }
    if (fieldName.toLowerCase().includes('date')) {
      return new Date(2025, 0, index).toLocaleDateString();
    }
    if (fieldName.toLowerCase().includes('amount') || fieldName.toLowerCase().includes('revenue')) {
      return `$${(index * 10000).toLocaleString()}`;
    }
    if (fieldName.toLowerCase().includes('status')) {
      return ['Active', 'Inactive', 'Pending'][index % 3];
    }
    
    return `${field.label} ${index}`;
  }

  /**
   * Get nested field value from object
   */
  getFieldValue(obj, path) {
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    return value || `[${path}]`;
  }

  /**
   * Get input type for form field
   */
  getInputType(fieldType) {
    const typeMap = {
      'email': 'email',
      'date': 'date',
      'datetime': 'datetime-local',
      'number': 'number',
      'decimal': 'number',
      'integer': 'number',
      'boolean': 'checkbox',
      'text': 'text',
      'string': 'text'
    };
    return typeMap[fieldType] || 'text';
  }

  /**
   * Get action label
   */
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
  module.exports = ConceptGeneratorV2;
}