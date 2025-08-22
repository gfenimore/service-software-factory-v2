/**
 * Pattern-Based Concept Generator
 * Uses card templates + field configuration for better layouts
 */

const fs = require('fs');
const path = require('path');
const FieldConfiguration = require('../ui-config/field-configuration');

class PatternBasedGenerator {
  constructor() {
    this.fieldConfig = new FieldConfiguration();
    this.templates = this.loadTemplates();
    this.tokens = this.loadTokens();
  }

  /**
   * Load card templates
   */
  loadTemplates() {
    const templateDir = path.join(__dirname, '../ui-templates');
    const templates = {};
    
    ['compact', 'list', 'data', 'metric'].forEach(pattern => {
      const templatePath = path.join(templateDir, `card-${pattern}.html`);
      if (fs.existsSync(templatePath)) {
        templates[pattern] = fs.readFileSync(templatePath, 'utf8');
      }
    });
    
    return templates;
  }

  /**
   * Load design tokens
   */
  loadTokens() {
    const tokenPath = path.join(__dirname, '../design-system/tokens-minimal.css');
    if (fs.existsSync(tokenPath)) {
      return fs.readFileSync(tokenPath, 'utf8');
    }
    return '';
  }

  /**
   * Generate optimized concept HTML
   */
  generateConcept(requirements, mockData) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Master View - Optimized Layout</title>
  <style>
    /* Design Tokens */
    ${this.tokens}
    
    /* Base Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: var(--text-base);
      color: var(--gray-900);
      background: var(--gray-50);
    }
    
    /* Optimized 3-Column Layout */
    .app-container {
      display: grid;
      grid-template-columns: var(--nav-width) 1fr 1fr 1fr;
      gap: 0;
      height: 100vh;
      overflow: hidden;
    }
    
    /* Navigation */
    .nav-sidebar {
      background: white;
      border-right: 1px solid var(--gray-200);
      padding: var(--space-4);
      overflow-y: auto;
    }
    
    .nav-section {
      margin-bottom: var(--space-6);
    }
    
    .nav-section h3 {
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--gray-500);
      margin-bottom: var(--space-2);
    }
    
    .nav-item {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--card-radius);
      cursor: pointer;
      transition: background 0.15s;
      font-size: var(--text-sm);
      color: var(--gray-700);
    }
    
    .nav-item:hover {
      background: var(--gray-100);
    }
    
    .nav-item.active {
      background: var(--color-primary);
      color: white;
      font-weight: var(--font-medium);
    }
    
    /* Column Container */
    .column {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: white;
      border-right: 1px solid var(--gray-200);
    }
    
    .column:last-child {
      border-right: none;
    }
    
    /* Column Header */
    .column-header {
      padding: var(--space-3) var(--space-4);
      border-bottom: 2px solid var(--gray-200);
      background: white;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .column-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin-bottom: var(--space-1);
    }
    
    .column-subtitle {
      font-size: var(--text-sm);
      color: var(--gray-500);
    }
    
    /* Column Content */
    .column-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-3);
    }
    
    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: var(--space-6);
      text-align: center;
    }
    
    .empty-icon {
      font-size: 48px;
      color: var(--gray-300);
      margin-bottom: var(--space-4);
    }
    
    .empty-text {
      font-size: var(--text-base);
      color: var(--gray-500);
      margin-bottom: var(--space-2);
    }
    
    .empty-subtext {
      font-size: var(--text-sm);
      color: var(--gray-400);
    }
    
    /* Card Template Styles */
    ${this.extractTemplateStyles()}
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Navigation Sidebar -->
    <nav class="nav-sidebar">
      <div class="nav-section">
        <h3>ACCOUNTS</h3>
        <div class="nav-item active">Master View</div>
        <div class="nav-item">Reports</div>
      </div>
      <div class="nav-section">
        <h3>OPERATIONS</h3>
        <div class="nav-item">Work Orders</div>
        <div class="nav-item">Scheduling</div>
      </div>
      <div class="nav-section">
        <h3>ADMINISTRATION</h3>
        <div class="nav-item">User Management</div>
        <div class="nav-item">System Settings</div>
      </div>
    </nav>
    
    <!-- Accounts Column -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">Accounts</div>
        <div class="column-subtitle">${mockData.accounts.length} accounts</div>
      </div>
      <div class="column-content" id="accounts-list">
        ${this.generateAccountCards(mockData.accounts)}
      </div>
    </div>
    
    <!-- Service Locations Column -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">Service Locations</div>
        <div class="column-subtitle" id="location-count">No account selected</div>
      </div>
      <div class="column-content" id="locations-list">
        ${this.generateEmptyState('location')}
      </div>
    </div>
    
    <!-- Work Orders Column -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">Work Orders</div>
        <div class="column-subtitle" id="workorder-count">No location selected</div>
      </div>
      <div class="column-content" id="workorders-list">
        ${this.generateEmptyState('workorder')}
      </div>
    </div>
  </div>
  
  <script>
    // Selection handling
    let selectedAccount = null;
    let selectedLocation = null;
    
    function selectAccount(accountId) {
      // Update selection
      document.querySelectorAll('.card-compact, .card-list').forEach(card => {
        card.classList.remove('selected');
      });
      event.currentTarget.classList.add('selected');
      
      selectedAccount = accountId;
      
      // Load locations for this account
      const account = mockData.accounts.find(a => a.AccountId === accountId);
      if (account) {
        const locationsHtml = generateLocationCards(account.ServiceLocations || []);
        document.getElementById('locations-list').innerHTML = locationsHtml;
        document.getElementById('location-count').textContent = 
          \`\${account.ServiceLocations?.length || 0} locations\`;
      }
      
      // Clear work orders
      document.getElementById('workorders-list').innerHTML = getEmptyState('workorder');
      document.getElementById('workorder-count').textContent = 'No location selected';
    }
    
    function selectLocation(locationId) {
      // Update selection
      document.querySelectorAll('#locations-list .card-list').forEach(card => {
        card.classList.remove('selected');
      });
      event.currentTarget.classList.add('selected');
      
      selectedLocation = locationId;
      
      // Load work orders for this location
      const location = mockData.locations.find(l => l.LocationId === locationId);
      if (location) {
        const workOrdersHtml = generateWorkOrderCards(location.WorkOrders || []);
        document.getElementById('workorders-list').innerHTML = workOrdersHtml;
        document.getElementById('workorder-count').textContent = 
          \`\${location.WorkOrders?.length || 0} work orders\`;
      }
    }
    
    // Mock data for demo
    const mockData = ${JSON.stringify(mockData, null, 2)};
    
    // Card generation functions
    function generateLocationCards(locations) {
      if (!locations || locations.length === 0) {
        return getEmptyState('location');
      }
      return locations.map(loc => \`
        <div class="card-list" onclick="selectLocation('\${loc.LocationId}')">
          <div class="card-avatar">📍</div>
          <div class="card-content">
            <div class="card-primary">\${loc.LocationName}</div>
            <div class="card-secondary">\${loc.ServiceAddress || 'No address'}</div>
          </div>
          <div class="card-action">
            <span class="badge \${loc.LocationStatus?.toLowerCase()}">\${loc.LocationStatus}</span>
          </div>
        </div>
      \`).join('');
    }
    
    function generateWorkOrderCards(workOrders) {
      if (!workOrders || workOrders.length === 0) {
        return getEmptyState('workorder');
      }
      return workOrders.map(wo => \`
        <div class="card-data">
          <div class="card-data-header">
            <h3 class="card-data-title">#\${wo.WorkOrderNumber} - \${wo.Title}</h3>
            <span class="card-data-badge \${wo.Status?.toLowerCase()}">\${wo.Status}</span>
          </div>
          <div class="card-data-grid">
            <div class="card-data-field">
              <div class="field-label">Priority</div>
              <div class="field-value">\${wo.Priority}</div>
            </div>
            <div class="card-data-field">
              <div class="field-label">Due Date</div>
              <div class="field-value">\${wo.DueDate || 'Not set'}</div>
            </div>
            <div class="card-data-field">
              <div class="field-label">Assigned To</div>
              <div class="field-value">\${wo.AssignedTo || 'Unassigned'}</div>
            </div>
            <div class="card-data-field">
              <div class="field-label">Type</div>
              <div class="field-value">\${wo.WorkOrderType || 'General'}</div>
            </div>
          </div>
        </div>
      \`).join('');
    }
    
    function getEmptyState(type) {
      const states = {
        location: {
          icon: '🏢',
          text: 'No service locations found',
          subtext: 'Select an account to view its locations'
        },
        workorder: {
          icon: '📋',
          text: 'No work orders found',
          subtext: 'Select a service location to view work orders'
        }
      };
      
      const state = states[type];
      return \`
        <div class="empty-state">
          <div class="empty-icon">\${state.icon}</div>
          <div class="empty-text">\${state.text}</div>
          <div class="empty-subtext">\${state.subtext}</div>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
    
    return html;
  }

  /**
   * Generate account cards using configuration
   */
  generateAccountCards(accounts) {
    const pattern = this.fieldConfig.recommendPattern('account', 1400, accounts.length);
    const config = this.fieldConfig.getAccountCardConfig(pattern);
    const template = this.templates[pattern];
    
    return accounts.map(account => {
      let cardHtml = this.fieldConfig.applyConfiguration(template, config, account);
      // Add click handler
      cardHtml = cardHtml.replace('<div class="card-', 
        `<div onclick="selectAccount('${account.AccountId}')" class="card-`);
      return cardHtml;
    }).join('');
  }

  /**
   * Generate empty state
   */
  generateEmptyState(type) {
    const states = {
      location: {
        icon: '🏢',
        text: 'No service locations found',
        subtext: 'Select an account to view its locations'
      },
      workorder: {
        icon: '📋',
        text: 'No work orders found',
        subtext: 'Select a service location to view work orders'
      }
    };
    
    const state = states[type] || states.location;
    return `
      <div class="empty-state">
        <div class="empty-icon">${state.icon}</div>
        <div class="empty-text">${state.text}</div>
        <div class="empty-subtext">${state.subtext}</div>
      </div>
    `;
  }

  /**
   * Extract styles from templates
   */
  extractTemplateStyles() {
    let styles = '';
    for (const template of Object.values(this.templates)) {
      const styleMatch = template.match(/<style>([\s\S]*?)<\/style>/);
      if (styleMatch) {
        styles += styleMatch[1] + '\n';
      }
    }
    return styles;
  }

  /**
   * Generate mock data for testing
   */
  generateMockData() {
    return {
      accounts: [
        {
          AccountId: 'ACC001',
          AccountName: 'Martinez Residence',
          AccountStatus: 'Active',
          AccountType: 'Residential',
          BillingCity: 'Brandon',
          BillingAddress: '123 Main St',
          BillingState: 'FL',
          BillingZip: '33510',
          PrimaryContact: {
            FullName: 'John Martinez',
            Phone: '8135551234',
            Email: 'john@example.com',
            PreferredContact: 'Phone'
          },
          ServiceLocations: [
            {
              LocationId: 'LOC001',
              LocationName: 'Main House',
              LocationStatus: 'Active',
              ServiceAddress: '123 Main St, Brandon',
              LocationType: 'Residential',
              WorkOrders: [
                {
                  WorkOrderNumber: 'WO001',
                  Title: 'AC Maintenance',
                  Status: 'Scheduled',
                  Priority: 'Medium',
                  DueDate: '2025-08-25',
                  AssignedTo: 'Tech Team A',
                  WorkOrderType: 'Maintenance'
                }
              ]
            }
          ]
        },
        {
          AccountId: 'ACC002',
          AccountName: 'Johnson Residence',
          AccountStatus: 'Active',
          AccountType: 'Residential',
          BillingCity: 'Brandon',
          PrimaryContact: {
            FullName: 'Sarah Johnson',
            Phone: '8135555678',
            Email: 'sarah@example.com',
            PreferredContact: 'Email'
          },
          ServiceLocations: []
        },
        {
          AccountId: 'ACC003',
          AccountName: 'Smith Residence',
          AccountStatus: 'Pending',
          AccountType: 'Residential',
          BillingCity: 'Sarasota',
          PrimaryContact: {
            FullName: 'Bob Smith',
            Phone: '9415551234',
            Email: 'bob@example.com',
            PreferredContact: 'Phone'
          },
          ServiceLocations: []
        }
      ],
      locations: [],
      workOrders: []
    };
  }
}

// Test the generator
if (require.main === module) {
  const generator = new PatternBasedGenerator();
  const mockData = generator.generateMockData();
  const html = generator.generateConcept({}, mockData);
  
  // Save to file
  const outputPath = path.join(__dirname, '../../3-workspace/concept/iteration-3-optimized.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Generated optimized concept at: ${outputPath}`);
}

module.exports = PatternBasedGenerator;