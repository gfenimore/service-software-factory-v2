#!/usr/bin/env node

/**
 * Simple HTML Generator
 * First consumer of ViewForge (Field Configurator) output
 * 
 * Purpose: Generate clean, semantic HTML from field configurations
 * Input: JSON configuration from ViewForge
 * Output: Static HTML file with embedded CSS and sample data
 * 
 * Usage: node simple-html-generator.js <config-file> [output-file]
 */

const fs = require('fs');
const path = require('path');

// Sample data for different entity types
const SAMPLE_DATA = {
  account: [
    {
      account: {
        accountNumber: 'ACC-2024-001',
        accountName: 'Acme Corporation',
        status: 'Active',
        accountType: 'Commercial',
        balance: '$12,450.00',
        creditLimit: '$50,000.00',
        lastPaymentDate: '2024-01-15',
        createdDate: '2023-06-01'
      },
      primaryContact: {
        name: 'John Smith',
        title: 'Facility Manager',
        email: 'john.smith@acme.com',
        phone: '(555) 123-4567',
        mobile: '(555) 987-6543'
      },
      billingAddress: {
        street: '123 Business Park Dr',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      serviceContract: {
        contractNumber: 'SVC-2024-001',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    },
    {
      account: {
        accountNumber: 'ACC-2024-002',
        accountName: 'TechStart Inc',
        status: 'Active',
        accountType: 'Startup',
        balance: '$8,230.00',
        creditLimit: '$25,000.00',
        lastPaymentDate: '2024-01-10',
        createdDate: '2023-08-15'
      },
      primaryContact: {
        name: 'Sarah Johnson',
        title: 'Operations Director',
        email: 'sarah@techstart.com',
        phone: '(555) 234-5678',
        mobile: '(555) 876-5432'
      },
      billingAddress: {
        street: '456 Innovation Way',
        city: 'San Jose',
        state: 'CA',
        zip: '95110'
      },
      serviceContract: {
        contractNumber: 'SVC-2024-002',
        startDate: '2024-02-01',
        endDate: '2025-01-31'
      }
    },
    {
      account: {
        accountNumber: 'ACC-2024-003',
        accountName: 'Global Manufacturing',
        status: 'Active',
        accountType: 'Enterprise',
        balance: '$45,890.00',
        creditLimit: '$100,000.00',
        lastPaymentDate: '2024-01-20',
        createdDate: '2022-03-10'
      },
      primaryContact: {
        name: 'Michael Chen',
        title: 'VP of Facilities',
        email: 'm.chen@globalmanuf.com',
        phone: '(555) 345-6789',
        mobile: '(555) 765-4321'
      },
      billingAddress: {
        street: '789 Industrial Blvd',
        city: 'Oakland',
        state: 'CA',
        zip: '94612'
      },
      serviceContract: {
        contractNumber: 'SVC-2024-003',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    }
  ],
  location: [
    {
      location: {
        locationId: 'LOC-001',
        locationName: 'Main Office',
        locationType: 'Office Building',
        status: 'Active',
        squareFootage: '25,000',
        occupancy: '85%',
        lastServiceDate: '2024-01-10',
        nextServiceDate: '2024-02-10'
      },
      siteContact: {
        name: 'Jane Doe',
        phone: '(555) 234-5678',
        email: 'jane.doe@site.com'
      },
      serviceAddress: {
        street: '456 Industrial Ave',
        city: 'Oakland',
        state: 'CA'
      }
    }
  ],
  workorder: [
    {
      workorder: {
        workOrderNumber: 'WO-2024-001',
        description: 'Quarterly HVAC Maintenance',
        status: 'Scheduled',
        priority: 'Medium',
        scheduledDate: '2024-02-15',
        completedDate: '',
        estimatedHours: '4.5',
        actualHours: ''
      },
      assignedTech: {
        name: 'Mike Johnson',
        phone: '(555) 345-6789',
        certLevel: 'Senior'
      }
    }
  ]
};

class SimpleHTMLGenerator {
  constructor() {
    this.config = null;
    this.outputPath = null;
  }

  /**
   * Main generation flow
   */
  async generate(configPath, outputPath) {
    console.log('🎨 Simple HTML Generator v1.0');
    console.log('━'.repeat(50));
    
    // Load configuration
    console.log('📖 Loading configuration:', configPath);
    this.config = this.loadConfig(configPath);
    
    // Set output path
    this.outputPath = outputPath || this.getDefaultOutputPath();
    
    // Generate HTML
    console.log('🔨 Generating HTML...');
    const html = this.generateHTML();
    
    // Write output
    console.log('💾 Writing to:', this.outputPath);
    this.writeOutput(html);
    
    console.log('━'.repeat(50));
    console.log('✅ Generation complete!');
    console.log('📂 Output:', this.outputPath);
    console.log('🌐 Open in browser to view');
    
    return this.outputPath;
  }

  /**
   * Load and validate configuration
   */
  loadConfig(configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Validate required fields
    if (!config.entityType || !config.contextType) {
      throw new Error('Invalid configuration: missing entityType or contextType');
    }
    
    console.log(`  Entity: ${config.entityType}`);
    console.log(`  Context: ${config.contextType}`);
    console.log(`  Fields: ${config.metadata?.totalFields || 0}`);
    console.log(`  Joins: ${config.metadata?.joinCount || 0}`);
    
    return config;
  }

  /**
   * Generate complete HTML document
   */
  generateHTML() {
    const title = this.getTitle();
    const styles = this.generateStyles();
    const body = this.generateBody();
    const script = this.generateScript();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${styles}</style>
</head>
<body>
    ${body}
    <script>${script}</script>
</body>
</html>`;
  }

  /**
   * Generate CSS styles
   */
  generateStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: #f5f5f5;
        color: #1a1a1a;
        line-height: 1.6;
      }

      /* Header */
      .header {
        background: #fff;
        border-bottom: 1px solid #e0e0e0;
        padding: 20px 0;
        margin-bottom: 30px;
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header h1 {
        font-size: 24px;
        font-weight: 600;
      }

      .header-meta {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: #666;
      }

      /* Container */
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px 40px;
      }

      /* View Controls */
      .view-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .view-toggle {
        display: flex;
        gap: 10px;
      }

      .view-btn {
        padding: 8px 16px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .view-btn:hover {
        background: #f8f8f8;
      }

      .view-btn.active {
        background: #000;
        color: #fff;
        border-color: #000;
      }

      .result-count {
        font-size: 14px;
        color: #666;
      }

      /* Cards Container */
      .cards-container {
        display: grid;
        gap: 20px;
      }

      .cards-container.grid-view {
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      }

      /* Table View Styles */
      .table-container {
        display: none;
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
      }

      .table-container.active {
        display: block;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
      }

      .data-table thead {
        background: #f8f8f8;
        border-bottom: 2px solid #e0e0e0;
      }

      .data-table th {
        padding: 12px 16px;
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
        white-space: nowrap;
      }

      .data-table tbody tr {
        border-bottom: 1px solid #f0f0f0;
        transition: background 0.1s;
      }

      .data-table tbody tr:hover {
        background: #f8f8f8;
      }

      .data-table td {
        padding: 12px 16px;
        font-size: 14px;
        color: #1a1a1a;
      }

      .data-table .status-active {
        color: #10b981;
        font-weight: 500;
      }

      .data-table .currency {
        font-family: 'SF Mono', Monaco, 'Courier New', monospace;
        text-align: right;
      }

      /* Card Styles */
      .card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s;
      }

      .card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }

      .card-header {
        background: #000;
        color: #fff;
        padding: 12px 16px;
        font-weight: 600;
        font-size: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-header-title {
        flex: 1;
      }

      .card-header-badge {
        font-size: 11px;
        padding: 2px 8px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
      }

      .card-body {
        padding: 16px;
      }

      .card-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid #f0f0f0;
      }

      .card-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .field {
        min-width: 0;
      }

      .field-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: #666;
        margin-bottom: 4px;
      }

      .field-value {
        font-size: 14px;
        color: #1a1a1a;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Field type styles */
      .field-value.status-active {
        color: #10b981;
      }

      .field-value.status-inactive {
        color: #ef4444;
      }

      .field-value.priority-high {
        color: #ef4444;
        font-weight: 600;
      }

      .field-value.priority-medium {
        color: #f59e0b;
      }

      .field-value.priority-low {
        color: #6b7280;
      }

      .field-value.currency {
        font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      }

      /* Empty state */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }

      .empty-state-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      /* Footer */
      .footer {
        margin-top: 60px;
        padding: 20px;
        background: #fff;
        border-top: 1px solid #e0e0e0;
        text-align: center;
        font-size: 12px;
        color: #666;
      }

      .footer-meta {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 10px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .cards-container.grid-view {
          grid-template-columns: 1fr;
        }

        .card-row {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .header-content {
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
        }
      }
    `;
  }

  /**
   * Generate HTML body
   */
  generateBody() {
    const entityLabel = this.getEntityLabel();
    const cards = this.generateCards();
    const tableHTML = this.generateTable();
    
    return `
      <div class="header">
        <div class="header-content">
          <h1>${entityLabel} - ${this.getContextLabel()}</h1>
          <div class="header-meta">
            <span>Generated: ${new Date().toLocaleDateString()}</span>
            <span>Version: ${this.config.metadata?.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="view-controls">
          <div class="view-toggle">
            <button class="view-btn active" data-view="grid">Grid View</button>
            <button class="view-btn" data-view="list">List View</button>
          </div>
          <div class="result-count">${cards.length} ${entityLabel.toLowerCase()}</div>
        </div>

        <div class="cards-container grid-view" id="cardsContainer">
          ${cards.join('')}
        </div>

        <div class="table-container" id="tableContainer">
          ${tableHTML}
        </div>
      </div>

      <div class="footer">
        <div>Generated by ViewForge + Simple HTML Generator</div>
        <div class="footer-meta">
          <span>Entity: ${this.config.entityType}</span>
          <span>Context: ${this.config.contextType}</span>
          <span>Fields: ${this.config.metadata?.totalFields || 0}</span>
          <span>Performance: ${this.config.metadata?.performanceImpact || 'unknown'}</span>
        </div>
      </div>
    `;
  }

  /**
   * Generate cards HTML
   */
  generateCards() {
    const sampleData = this.getSampleData();
    
    if (sampleData.length === 0) {
      return [`
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div>No sample data available for ${this.config.entityType}</div>
        </div>
      `];
    }
    
    return sampleData.map(data => this.generateCard(data));
  }

  /**
   * Generate single card HTML
   */
  generateCard(data) {
    // Generate header
    const headerField = this.config.header.fields[0];
    const headerValue = headerField ? this.getFieldValue(data, headerField.path) : 'No Header';
    
    // Generate body rows
    const bodyRows = this.config.body
      .filter(row => row.fields.length > 0)
      .map(row => this.generateCardRow(data, row))
      .join('');
    
    return `
      <div class="card">
        <div class="card-header">
          <span class="card-header-title">${headerValue}</span>
          ${this.generateHeaderBadge(data)}
        </div>
        <div class="card-body">
          ${bodyRows}
        </div>
      </div>
    `;
  }

  /**
   * Generate card row HTML
   */
  generateCardRow(data, row) {
    const fields = row.fields.map(field => {
      const value = this.getFieldValue(data, field.path);
      const valueClass = this.getFieldValueClass(field.type, value);
      
      return `
        <div class="field">
          <div class="field-label">${field.label}</div>
          <div class="field-value ${valueClass}">${value}</div>
        </div>
      `;
    }).join('');
    
    return `<div class="card-row">${fields}</div>`;
  }

  /**
   * Generate header badge if status field exists
   */
  generateHeaderBadge(data) {
    // Look for status field in any row
    for (const row of [...this.config.body, this.config.header]) {
      const statusField = row.fields.find(f => f.type === 'status');
      if (statusField) {
        const status = this.getFieldValue(data, statusField.path);
        return `<span class="card-header-badge">${status}</span>`;
      }
    }
    return '';
  }

  /**
   * Generate table HTML for list view
   */
  generateTable() {
    const sampleData = this.getSampleData();
    
    if (sampleData.length === 0) {
      return '<div class="empty-state">No data available</div>';
    }
    
    // Collect all fields from configuration
    const allFields = [];
    
    // Add header fields
    this.config.header.fields.forEach(field => {
      allFields.push(field);
    });
    
    // Add body fields
    this.config.body.forEach(row => {
      row.fields.forEach(field => {
        // Avoid duplicates
        if (!allFields.find(f => f.path === field.path)) {
          allFields.push(field);
        }
      });
    });
    
    // Generate table header
    const headerHTML = allFields.map(field => 
      `<th>${field.label}</th>`
    ).join('');
    
    // Generate table rows
    const rowsHTML = sampleData.map(data => {
      const cells = allFields.map(field => {
        const value = this.getFieldValue(data, field.path);
        const valueClass = this.getFieldValueClass(field.type, value);
        return `<td class="${valueClass}">${value}</td>`;
      }).join('');
      
      return `<tr>${cells}</tr>`;
    }).join('');
    
    return `
      <table class="data-table">
        <thead>
          <tr>${headerHTML}</tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    `;
  }

  /**
   * Get sample data for table/cards
   */
  getSampleData() {
    const sampleData = SAMPLE_DATA[this.config.entityType] || [];
    
    // Generate more sample data by duplicating with variations
    const expandedData = [];
    for (let i = 0; i < 8; i++) {
      const baseData = sampleData[i % sampleData.length];
      if (!baseData) break;
      
      const data = JSON.parse(JSON.stringify(baseData));
      
      // Modify account number or ID for uniqueness
      if (data.account?.accountNumber) {
        data.account.accountNumber = `ACC-2024-${String(i + 1).padStart(3, '0')}`;
      }
      if (data.location?.locationId) {
        data.location.locationId = `LOC-${String(i + 1).padStart(3, '0')}`;
      }
      if (data.workorder?.workOrderNumber) {
        data.workorder.workOrderNumber = `WO-2024-${String(i + 1).padStart(3, '0')}`;
      }
      
      expandedData.push(data);
    }
    
    return expandedData;
  }

  /**
   * Get field value from data using path
   */
  getFieldValue(data, path) {
    const parts = path.split('.');
    let value = data;
    
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined || value === null) {
        return 'N/A';
      }
    }
    
    return value || 'N/A';
  }

  /**
   * Get CSS class for field value based on type
   */
  getFieldValueClass(type, value) {
    switch (type) {
      case 'status':
        return value === 'Active' ? 'status-active' : 'status-inactive';
      case 'priority':
        return `priority-${value.toLowerCase()}`;
      case 'currency':
        return 'currency';
      default:
        return '';
    }
  }

  /**
   * Generate JavaScript for interactivity
   */
  generateScript() {
    return `
      // View toggle functionality
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const view = this.dataset.view;
          const cardsContainer = document.getElementById('cardsContainer');
          const tableContainer = document.getElementById('tableContainer');
          
          // Update button states
          document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          // Toggle between grid and table
          if (view === 'grid') {
            cardsContainer.style.display = 'grid';
            tableContainer.classList.remove('active');
          } else {
            cardsContainer.style.display = 'none';
            tableContainer.classList.add('active');
          }
        });
      });

      // Card click handler
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
          console.log('Card clicked:', this.querySelector('.card-header-title').textContent);
        });
      });

      // Log generation info
      console.log('ViewForge HTML Generated');
      console.log('Entity: ${this.config.entityType}');
      console.log('Context: ${this.config.contextType}');
      console.log('Total Fields: ${this.config.metadata?.totalFields || 0}');
      console.log('Performance Impact: ${this.config.metadata?.performanceImpact || 'unknown'}');
    `;
  }

  /**
   * Get display title
   */
  getTitle() {
    return `${this.getEntityLabel()} - ${this.getContextLabel()}`;
  }

  /**
   * Get entity display label
   */
  getEntityLabel() {
    const labels = {
      account: 'Accounts',
      location: 'Service Locations',
      workorder: 'Work Orders'
    };
    return labels[this.config.entityType] || this.config.entityType;
  }

  /**
   * Get context display label
   */
  getContextLabel() {
    const labels = {
      'list-view': 'List View',
      'detail-header': 'Detail Header',
      'compact': 'Compact View',
      'mobile': 'Mobile View'
    };
    return labels[this.config.contextType] || this.config.contextType;
  }

  /**
   * Get default output path
   */
  getDefaultOutputPath() {
    const timestamp = new Date().getTime();
    const entityType = this.config.entityType;
    const contextType = this.config.contextType;
    const filename = `${entityType}-${contextType}-${timestamp}.html`;
    
    const outputDir = path.join(
      process.cwd(),
      '.pipeline',
      '3-workspace',
      'concept'
    );
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    return path.join(outputDir, filename);
  }

  /**
   * Write output file
   */
  writeOutput(html) {
    fs.writeFileSync(this.outputPath, html, 'utf8');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node simple-html-generator.js <config-file> [output-file]');
    console.log('');
    console.log('Example:');
    console.log('  node simple-html-generator.js config.json');
    console.log('  node simple-html-generator.js config.json output.html');
    process.exit(1);
  }
  
  const generator = new SimpleHTMLGenerator();
  generator.generate(args[0], args[1]).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = SimpleHTMLGenerator;