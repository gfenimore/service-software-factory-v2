#!/usr/bin/env node

/**
 * Navigation Generator - Crawl Stage
 * Generates simple left sidebar navigation from configuration
 * Links to ViewForge-generated views
 */

const fs = require('fs');
const path = require('path');

class NavigationGenerator {
    constructor() {
        this.viewForgeConfigDir = path.join(__dirname, '../ui-config/configurations');
        this.outputDir = path.join(__dirname, '../generated/navigation');
    }

    /**
     * Main generation method
     */
    async generate(configPath, outputPath) {
        console.log('🧭 Navigation Generator - Starting...');
        
        // Load configuration
        const config = this.loadConfig(configPath);
        
        // Validate ViewForge references
        this.validateViewReferences(config);
        
        // Generate HTML navigation
        const html = this.generateHTML(config);
        
        // Write output
        this.writeOutput(html, outputPath);
        
        console.log('✅ Navigation generated successfully!');
    }

    /**
     * Load navigation configuration
     */
    loadConfig(configPath) {
        try {
            const configContent = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configContent);
        } catch (error) {
            console.error('❌ Failed to load navigation config:', error.message);
            process.exit(1);
        }
    }

    /**
     * Validate that referenced ViewForge configs exist
     */
    validateViewReferences(config) {
        const missingConfigs = [];
        
        const checkItems = (items) => {
            items.forEach(item => {
                if (item.viewConfig) {
                    const configFile = `${item.viewConfig}.json`;
                    const configPath = path.join(this.viewForgeConfigDir, configFile);
                    if (!fs.existsSync(configPath)) {
                        missingConfigs.push(item.viewConfig);
                    }
                }
                if (item.children) {
                    checkItems(item.children);
                }
            });
        };

        config.modules.forEach(module => {
            if (module.items) {
                checkItems(module.items);
            }
        });

        if (missingConfigs.length > 0) {
            console.warn('⚠️ Warning: Missing ViewForge configs:', missingConfigs);
        }
    }

    /**
     * Generate HTML navigation
     */
    generateHTML(config) {
        const navItems = this.generateNavItems(config.modules);
        const quickActions = this.generateQuickActions(config.quickActions || []);
        const userMenu = this.generateUserMenu(config.userMenu || {});

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Navigation - ${config.appName || 'Service Software'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            height: 100vh;
            display: flex;
        }

        /* Navigation Sidebar */
        .nav-sidebar {
            width: 260px;
            background: white;
            border-right: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        /* App Header */
        .nav-header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            background: #000;
            color: white;
        }

        .app-logo {
            font-size: 20px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* Navigation Menu */
        .nav-menu {
            flex: 1;
            overflow-y: auto;
            padding: 10px 0;
        }

        .nav-module {
            margin-bottom: 20px;
        }

        .nav-module-header {
            padding: 10px 20px;
            font-size: 12px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .nav-item {
            position: relative;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            color: #333;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
        }

        .nav-link:hover {
            background: #f0f0f0;
        }

        .nav-link.active {
            background: #e8e8e8;
            border-left: 3px solid #000;
        }

        .nav-icon {
            width: 20px;
            text-align: center;
        }

        .nav-badge {
            margin-left: auto;
            background: #ff4444;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: bold;
        }

        .nav-divider {
            height: 1px;
            background: #e0e0e0;
            margin: 10px 20px;
        }

        /* Nested Navigation */
        .nav-children {
            display: none;
            background: #f8f8f8;
        }

        .nav-item.expanded .nav-children {
            display: block;
        }

        .nav-children .nav-link {
            padding-left: 50px;
            font-size: 14px;
        }

        .nav-expand {
            margin-left: auto;
            transition: transform 0.2s;
        }

        .nav-item.expanded .nav-expand {
            transform: rotate(90deg);
        }

        /* Quick Actions */
        .quick-actions {
            padding: 10px;
            border-top: 1px solid #e0e0e0;
        }

        .quick-action-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 10px;
            background: #000;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }

        .quick-action-btn:hover {
            background: #333;
        }

        /* User Menu */
        .user-menu {
            padding: 10px;
            border-top: 1px solid #e0e0e0;
            background: white;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            cursor: pointer;
            border-radius: 5px;
        }

        .user-info:hover {
            background: #f0f0f0;
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            background: #000;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .user-dropdown {
            display: none;
            position: absolute;
            bottom: 60px;
            left: 10px;
            right: 10px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .user-dropdown.open {
            display: block;
        }

        .user-dropdown-item {
            display: block;
            padding: 10px 15px;
            color: #333;
            text-decoration: none;
            transition: background 0.2s;
        }

        .user-dropdown-item:hover {
            background: #f0f0f0;
        }

        /* Main Content Area */
        .main-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .content-header {
            margin-bottom: 20px;
        }

        .breadcrumbs {
            display: flex;
            gap: 10px;
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .breadcrumb-separator {
            color: #999;
        }

        .page-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }

        .content-body {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 20px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .nav-sidebar {
                position: fixed;
                left: -260px;
                z-index: 1000;
                transition: left 0.3s;
            }

            .nav-sidebar.open {
                left: 0;
            }

            .mobile-menu-toggle {
                display: block;
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 1001;
                background: white;
                border: 1px solid #e0e0e0;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
            }
        }

        .mobile-menu-toggle {
            display: none;
        }
    </style>
</head>
<body>
    <!-- Mobile Menu Toggle -->
    <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">☰</button>

    <!-- Navigation Sidebar -->
    <nav class="nav-sidebar" id="navSidebar">
        <!-- Header -->
        <div class="nav-header">
            <div class="app-logo">
                <span>${config.logo || '🏭'}</span>
                <span>${config.appName || 'Service Software'}</span>
            </div>
        </div>

        <!-- Navigation Menu -->
        <div class="nav-menu">
            ${navItems}
        </div>

        <!-- Quick Actions -->
        ${quickActions}

        <!-- User Menu -->
        ${userMenu}
    </nav>

    <!-- Main Content Area -->
    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumbs">
                <span>Home</span>
                <span class="breadcrumb-separator">›</span>
                <span>Dashboard</span>
            </div>
            <h1 class="page-title">Dashboard</h1>
        </div>
        <div class="content-body">
            <p>Select an item from the navigation menu to load the corresponding view.</p>
            <p>This area will display ViewForge-generated content.</p>
        </div>
    </main>

    <script>
        // Track active navigation item
        let activeNavItem = null;

        // Handle navigation clicks
        function handleNavClick(event, viewConfig) {
            event.preventDefault();
            
            // Update active state
            if (activeNavItem) {
                activeNavItem.classList.remove('active');
            }
            event.currentTarget.classList.add('active');
            activeNavItem = event.currentTarget;

            // Load view (placeholder for now)
            loadView(viewConfig);
        }

        // Toggle nested navigation
        function toggleNavItem(event, hasChildren) {
            if (hasChildren) {
                event.preventDefault();
                const navItem = event.currentTarget.closest('.nav-item');
                navItem.classList.toggle('expanded');
            }
        }

        // Load ViewForge view
        function loadView(viewConfig) {
            const contentBody = document.querySelector('.content-body');
            const pageTitle = document.querySelector('.page-title');
            
            // Update page title
            pageTitle.textContent = viewConfig.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            // Load view (in real implementation, would fetch and render ViewForge output)
            contentBody.innerHTML = \`
                <div style="padding: 20px; background: #f8f8f8; border-radius: 5px;">
                    <h2>Loading View: \${viewConfig}</h2>
                    <p>This would load the ViewForge-generated view from:</p>
                    <code>configurations/\${viewConfig}.json</code>
                    <br><br>
                    <p>The view would be rendered here using the appropriate generator.</p>
                </div>
            \`;

            // Update breadcrumbs
            updateBreadcrumbs(viewConfig);
        }

        // Update breadcrumbs
        function updateBreadcrumbs(viewConfig) {
            const breadcrumbs = document.querySelector('.breadcrumbs');
            const parts = viewConfig.split('-');
            
            let html = '<span>Home</span>';
            parts.forEach((part, index) => {
                html += '<span class="breadcrumb-separator">›</span>';
                html += \`<span>\${part.charAt(0).toUpperCase() + part.slice(1)}</span>\`;
            });
            
            breadcrumbs.innerHTML = html;
        }

        // Toggle user dropdown
        function toggleUserDropdown() {
            const dropdown = document.querySelector('.user-dropdown');
            dropdown.classList.toggle('open');
        }

        // Handle user menu actions
        function handleUserAction(action) {
            console.log('User action:', action);
            // Implement user actions (profile, settings, logout)
        }

        // Toggle mobile menu
        function toggleMobileMenu() {
            const sidebar = document.getElementById('navSidebar');
            sidebar.classList.toggle('open');
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('navSidebar');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Set first item as active
            const firstNavLink = document.querySelector('.nav-link');
            if (firstNavLink) {
                firstNavLink.classList.add('active');
                activeNavItem = firstNavLink;
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Generate navigation items HTML
     */
    generateNavItems(modules) {
        return modules.map(module => {
            const items = module.items ? module.items.map(item => this.generateNavItem(item)).join('') : '';
            
            return `
            <div class="nav-module">
                ${module.label ? `<div class="nav-module-header">${module.label}</div>` : ''}
                ${items}
            </div>`;
        }).join('');
    }

    /**
     * Generate individual navigation item
     */
    generateNavItem(item) {
        if (item.type === 'divider') {
            return '<div class="nav-divider"></div>';
        }

        const hasChildren = item.children && item.children.length > 0;
        const children = hasChildren ? 
            `<div class="nav-children">
                ${item.children.map(child => this.generateNavItem(child)).join('')}
            </div>` : '';

        return `
        <div class="nav-item ${hasChildren ? 'has-children' : ''}">
            <a class="nav-link" 
               href="#" 
               onclick="handleNavClick(event, '${item.viewConfig || ''}'); ${hasChildren ? 'toggleNavItem(event, true)' : ''}"
               data-view="${item.viewConfig || ''}">
                <span class="nav-icon">${item.icon || '📄'}</span>
                <span>${item.label}</span>
                ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                ${hasChildren ? '<span class="nav-expand">›</span>' : ''}
            </a>
            ${children}
        </div>`;
    }

    /**
     * Generate quick actions
     */
    generateQuickActions(quickActions) {
        if (!quickActions || quickActions.length === 0) return '';

        const actions = quickActions.map(action => `
            <button class="quick-action-btn" onclick="loadView('${action.viewConfig}')">
                <span>${action.icon || '➕'}</span>
                <span>${action.label}</span>
            </button>
        `).join('');

        return `
        <div class="quick-actions">
            ${actions}
        </div>`;
    }

    /**
     * Generate user menu
     */
    generateUserMenu(userMenu) {
        const items = userMenu.items ? userMenu.items.map(item => `
            <a href="#" class="user-dropdown-item" onclick="handleUserAction('${item.action}')">
                ${item.label}
            </a>
        `).join('') : '';

        return `
        <div class="user-menu">
            <div class="user-info" onclick="toggleUserDropdown()">
                <div class="user-avatar">U</div>
                <div>
                    <div style="font-weight: 500;">User Name</div>
                    <div style="font-size: 12px; color: #666;">user@example.com</div>
                </div>
            </div>
            <div class="user-dropdown">
                ${items}
            </div>
        </div>`;
    }

    /**
     * Write output file
     */
    writeOutput(html, outputPath) {
        // Ensure output directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write HTML file
        fs.writeFileSync(outputPath, html);
        console.log(`📁 Navigation written to: ${outputPath}`);
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log(`
🧭 Navigation Generator
Usage: node navigation-generator.js <config-path> <output-path>

Example:
  node navigation-generator.js nav-config.json ../generated/navigation.html
        `);
        process.exit(1);
    }

    const generator = new NavigationGenerator();
    generator.generate(args[0], args[1]);
}

module.exports = NavigationGenerator;