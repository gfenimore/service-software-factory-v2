#!/usr/bin/env node

/**
 * Layout Generator
 * The context-aware container for all generated components
 * 
 * Crawl: Simple 3-column layout
 * Walk: Context-responsive layouts
 * Run: AI-adaptive layouts
 * 
 * Purpose: Orchestrate components from ViewForge, Navigation, and other generators
 * into cohesive, context-aware layouts
 */

const fs = require('fs');
const path = require('path');

class LayoutGenerator {
  constructor() {
    this.config = null;
    this.context = null;
    this.components = {};
  }

  /**
   * Main generation flow
   */
  async generate(configPath, outputPath) {
    console.log('🏗️  Layout Generator v1.0');
    console.log('━'.repeat(50));
    
    // Load configuration
    console.log('📖 Loading layout configuration...');
    this.config = this.loadConfig(configPath);
    
    // Extract context (future hook)
    this.context = this.config.context || this.getDefaultContext();
    console.log('🎯 Context:', this.context.intent);
    
    // Load component content
    console.log('📦 Loading components...');
    await this.loadComponents();
    
    // Generate layout
    console.log('🔨 Generating layout...');
    const html = this.generateHTML();
    
    // Write output
    const finalPath = outputPath || this.getDefaultOutputPath();
    console.log('💾 Writing to:', finalPath);
    fs.writeFileSync(finalPath, html, 'utf8');
    
    console.log('━'.repeat(50));
    console.log('✅ Layout generation complete!');
    console.log('🌐 Open in browser to view');
    
    return finalPath;
  }

  /**
   * Load and validate configuration
   */
  loadConfig(configPath) {
    if (!fs.existsSync(configPath)) {
      // Use default config for testing
      return this.getDefaultConfig();
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    console.log(`  Pattern: ${config.pattern}`);
    console.log(`  Regions: ${Object.keys(config.regions).join(', ')}`);
    console.log(`  Context: ${config.context?.intent || 'default'}`);
    
    return config;
  }

  /**
   * Default configuration for testing
   */
  getDefaultConfig() {
    return {
      pattern: "three-column",
      context: {
        intent: "browse",
        user: "dispatcher",
        time: "morning",
        device: "desktop"
      },
      regions: {
        left: {
          type: "navigation",
          width: "240px",
          collapsible: true,
          source: "static", // or path to nav config
          content: this.getDefaultNavigation()
        },
        center: {
          type: "main",
          flexible: true,
          source: "viewforge",
          config: "account-list-view"
        },
        right: {
          type: "details",
          width: "320px",
          hidden: true,
          source: "dynamic"
        }
      },
      theme: {
        style: "clean", // clean, compact, spacious
        colorScheme: "light" // light, dark, auto
      }
    };
  }

  /**
   * Get default context (future hook for context engine)
   */
  getDefaultContext() {
    return {
      intent: "browse",      // browse, edit, analyze, monitor
      user: "dispatcher",    // role-based layouts later
      time: "morning",       // time-based layouts later
      device: "desktop",     // responsive layouts
      state: {
        hasSelection: false,
        hasUnsavedChanges: false,
        isLoading: false
      }
    };
  }

  /**
   * Load component content
   */
  async loadComponents() {
    for (const [regionName, region] of Object.entries(this.config.regions)) {
      console.log(`  Loading ${regionName}...`);
      
      // Determine component type from region config
      if (region.component === 'navigation') {
        this.components[regionName] = this.loadNavigationContent(region.config);
      } else if (region.component === 'viewforge-view') {
        this.components[regionName] = this.loadViewForgeContent(region.config);
      } else if (region.component === 'details-panel') {
        this.components[regionName] = this.getDynamicPlaceholder(regionName);
      } else if (region.source === 'static' && region.content) {
        // Static content provided in config
        this.components[regionName] = region.content;
      } else {
        // Default content based on region name
        if (regionName === 'left') {
          this.components[regionName] = this.getDefaultNavigation();
        } else if (regionName === 'center') {
          this.components[regionName] = this.loadViewForgeContent('default');
        } else if (regionName === 'right') {
          this.components[regionName] = this.getDynamicPlaceholder(regionName);
        } else {
          this.components[regionName] = '';
        }
      }
    }
  }

  /**
   * Load ViewForge generated content (simplified for now)
   */
  loadViewForgeContent(configName) {
    // In real implementation, would load from generated files
    // For now, return sample content
    return `
      <div class="viewforge-content">
        <div class="view-header">
          <h2>Accounts</h2>
          <div class="view-actions">
            <button class="btn btn-primary">+ New Account</button>
          </div>
        </div>
        <div class="view-controls">
          <div class="search-box">
            <input type="text" placeholder="Search accounts..." />
          </div>
          <div class="view-toggle">
            <button class="btn-icon active" title="Grid View">⊞</button>
            <button class="btn-icon" title="List View">☰</button>
          </div>
        </div>
        <div class="view-content">
          <!-- ViewForge generated cards/list would go here -->
          <div class="card">
            <div class="card-header">Acme Corporation</div>
            <div class="card-body">
              <div class="field">Status: Active</div>
              <div class="field">Balance: $12,450</div>
              <div class="field">Contact: John Smith</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">TechStart Inc</div>
            <div class="card-body">
              <div class="field">Status: Active</div>
              <div class="field">Balance: $8,230</div>
              <div class="field">Contact: Sarah Johnson</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Load navigation content
   */
  loadNavigationContent(configName) {
    // Would load from navigation generator
    // For now, return default navigation
    return this.getDefaultNavigation();
  }

  /**
   * Get default navigation HTML
   */
  getDefaultNavigation() {
    return `
      <nav class="main-nav">
        <div class="nav-header">
          <div class="logo">🎯 PestControl Pro</div>
        </div>
        <div class="nav-section">
          <div class="nav-section-title">Operations</div>
          <a href="#" class="nav-item active">
            <span class="nav-icon">👤</span>
            <span class="nav-label">Accounts</span>
            <span class="nav-badge">12</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">📍</span>
            <span class="nav-label">Locations</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">📋</span>
            <span class="nav-label">Work Orders</span>
            <span class="nav-badge">3</span>
          </a>
        </div>
        <div class="nav-section">
          <div class="nav-section-title">Management</div>
          <a href="#" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-label">Technicians</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Reports</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Settings</span>
          </a>
        </div>
      </nav>
    `;
  }

  /**
   * Get placeholder for dynamic content
   */
  getDynamicPlaceholder(regionName) {
    if (regionName === 'right') {
      return `
        <div class="details-panel">
          <div class="details-empty">
            <div class="empty-icon">👈</div>
            <div class="empty-text">Select an item to view details</div>
          </div>
        </div>
      `;
    }
    return '<div class="placeholder">Dynamic content will appear here</div>';
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f5f5f5;
        color: #1a1a1a;
        height: 100vh;
        overflow: hidden;
      }

      /* Layout Structure */
      .layout-container {
        display: grid;
        grid-template-columns: ${this.getGridTemplate()};
        height: 100vh;
        background: #fff;
      }

      /* Left Region - Navigation */
      .layout-left {
        background: #1a1a1a;
        color: #fff;
        overflow-y: auto;
        border-right: 1px solid #e0e0e0;
      }

      .layout-left.collapsed {
        width: 60px;
      }

      /* Center Region - Main Content */
      .layout-center {
        background: #fff;
        overflow-y: auto;
        padding: 20px;
      }

      /* Right Region - Details */
      .layout-right {
        background: #f8f8f8;
        border-left: 1px solid #e0e0e0;
        overflow-y: auto;
        padding: 20px;
        transition: transform 0.3s ease;
      }

      .layout-right.hidden {
        transform: translateX(100%);
        position: absolute;
        right: 0;
        height: 100vh;
      }

      /* Navigation Styles */
      .main-nav {
        padding: 20px 0;
      }

      .nav-header {
        padding: 0 20px 20px;
        border-bottom: 1px solid #333;
      }

      .logo {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
      }

      .nav-section {
        padding: 20px 0;
      }

      .nav-section-title {
        padding: 0 20px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #666;
        margin-bottom: 10px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        color: #ccc;
        text-decoration: none;
        transition: all 0.2s;
        position: relative;
      }

      .nav-item:hover {
        background: #2a2a2a;
        color: #fff;
      }

      .nav-item.active {
        background: #333;
        color: #fff;
      }

      .nav-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: #4CAF50;
      }

      .nav-icon {
        margin-right: 12px;
        font-size: 18px;
      }

      .nav-label {
        flex: 1;
        font-size: 14px;
      }

      .nav-badge {
        background: #4CAF50;
        color: #fff;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
      }

      /* Main Content Styles */
      .viewforge-content {
        max-width: 1200px;
      }

      .view-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .view-header h2 {
        font-size: 24px;
        font-weight: 600;
      }

      .view-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e0e0e0;
      }

      .search-box input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 300px;
        font-size: 14px;
      }

      .view-toggle {
        display: flex;
        gap: 5px;
      }

      .btn {
        padding: 8px 16px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn:hover {
        background: #f8f8f8;
      }

      .btn-primary {
        background: #4CAF50;
        color: #fff;
        border-color: #4CAF50;
      }

      .btn-primary:hover {
        background: #45a049;
      }

      .btn-icon {
        padding: 8px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-icon:hover {
        background: #f8f8f8;
      }

      .btn-icon.active {
        background: #1a1a1a;
        color: #fff;
        border-color: #1a1a1a;
      }

      /* Card Styles */
      .card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin-bottom: 16px;
        overflow: hidden;
        transition: all 0.2s;
        cursor: pointer;
      }

      .card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }

      .card.selected {
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
      }

      .card-header {
        background: #1a1a1a;
        color: #fff;
        padding: 12px 16px;
        font-weight: 600;
      }

      .card-body {
        padding: 16px;
      }

      .field {
        margin-bottom: 8px;
        font-size: 14px;
      }

      /* Details Panel Styles */
      .details-panel {
        height: 100%;
      }

      .details-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #999;
      }

      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 14px;
      }

      .details-content {
        padding: 20px;
      }

      .details-header {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;
      }

      .details-section {
        margin-bottom: 24px;
      }

      .details-section-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
        margin-bottom: 12px;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .detail-label {
        color: #666;
      }

      .detail-value {
        font-weight: 500;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .layout-container {
          grid-template-columns: 1fr;
        }

        .layout-left {
          display: none;
        }

        .layout-right {
          position: fixed;
          width: 100%;
          z-index: 100;
        }
      }

      /* Context Indicators (Future) */
      .context-badge {
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4CAF50;
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        z-index: 1000;
      }
    `;
  }

  /**
   * Get grid template based on configuration
   */
  getGridTemplate() {
    const regions = this.config.regions;
    const templates = [];
    
    if (regions.left) {
      templates.push(regions.left.width || '240px');
    }
    if (regions.center) {
      templates.push(regions.center.flexible ? '1fr' : (regions.center.width || 'auto'));
    }
    if (regions.right && !regions.right.hidden) {
      templates.push(regions.right.width || '320px');
    }
    
    return templates.join(' ');
  }

  /**
   * Generate HTML body
   */
  generateBody() {
    // Ensure we have components
    if (!this.components.left && !this.components.center && !this.components.right) {
      console.warn('⚠️  No components loaded, using defaults');
      this.components.left = this.getDefaultNavigation();
      this.components.center = this.loadViewForgeContent('default');
      this.components.right = this.getDynamicPlaceholder('right');
    }
    
    const leftContent = this.components.left || '';
    const centerContent = this.components.center || '';
    const rightContent = this.components.right || '';
    const rightClass = this.config.regions?.right?.initialState === 'empty' ? 'hidden' : '';
    
    return `
      <div class="layout-container" data-context="${this.context?.intent || 'default'}">
        <div class="layout-left">${leftContent}</div>
        <div class="layout-center">${centerContent}</div>
        <div class="layout-right ${rightClass}">${rightContent}</div>
      </div>
      <div class="context-badge">Context: ${this.context?.intent || 'default'} | ${this.context?.time || 'now'}</div>
    `;
  }

  /**
   * Generate JavaScript for interactivity
   */
  generateScript() {
    return `
      // Context object (future hook for context engine)
      const layoutContext = ${JSON.stringify(this.context, null, 2)};
      
      // Card selection handler
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
          // Remove previous selection
          document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
          
          // Add selection
          this.classList.add('selected');
          
          // Show details panel
          const detailsPanel = document.querySelector('.layout-right');
          if (detailsPanel) {
            detailsPanel.classList.remove('hidden');
            
            // Load details (mock for now)
            const accountName = this.querySelector('.card-header').textContent;
            detailsPanel.innerHTML = \`
              <div class="details-content">
                <div class="details-header">\${accountName}</div>
                <div class="details-section">
                  <div class="details-section-title">Account Information</div>
                  <div class="detail-item">
                    <span class="detail-label">Account Number:</span>
                    <span class="detail-value">ACC-2024-001</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">Active</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">Commercial</span>
                  </div>
                </div>
                <div class="details-section">
                  <div class="details-section-title">Contact Information</div>
                  <div class="detail-item">
                    <span class="detail-label">Primary Contact:</span>
                    <span class="detail-value">John Smith</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">(555) 123-4567</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">john@acme.com</span>
                  </div>
                </div>
                <div class="details-section">
                  <div class="details-section-title">Quick Actions</div>
                  <button class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">Create Work Order</button>
                  <button class="btn" style="width: 100%; margin-bottom: 8px;">View Locations</button>
                  <button class="btn" style="width: 100%;">Send Invoice</button>
                </div>
              </div>
            \`;
          }
          
          // Update context (future hook)
          layoutContext.state.hasSelection = true;
          console.log('Context updated:', layoutContext);
        });
      });
      
      // Navigation handler
      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Update active state
          document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
          this.classList.add('active');
          
          // Update context (future hook)
          layoutContext.activeView = this.querySelector('.nav-label').textContent;
          console.log('Navigation context:', layoutContext);
        });
      });
      
      // Log initial context
      console.log('Layout Context:', layoutContext);
      console.log('Ready for context-aware enhancements!');
    `;
  }

  /**
   * Get title for the page
   */
  getTitle() {
    return `${this.context.intent} View - Layout Generator`;
  }

  /**
   * Get default output path
   */
  getDefaultOutputPath() {
    const timestamp = new Date().getTime();
    const pattern = this.config.pattern;
    const filename = `layout-${pattern}-${timestamp}.html`;
    
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
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node layout-generator.js [config-file] [output-file]');
    console.log('');
    console.log('Example:');
    console.log('  node layout-generator.js');
    console.log('  node layout-generator.js layout-config.json');
    console.log('  node layout-generator.js layout-config.json output.html');
    console.log('');
    console.log('If no config provided, uses default 3-column layout');
    process.exit(0);
  }
  
  const generator = new LayoutGenerator();
  generator.generate(args[0], args[1]).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = LayoutGenerator;