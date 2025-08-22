// ViewForge 2.0 - Hierarchy Management
// Manages Application → Module → SubModule → UserStory structure

const Hierarchy = {
    // Sprint 1 Spike: Minimal hierarchy for Account List View
    currentHierarchy: {
        application: {
            id: 'app-001',
            name: 'Field Service Management',
            code: 'FSM',
            description: 'Field service management system'
        },
        module: {
            id: 'mod-001', 
            name: 'Customer Management',
            code: 'CUST',
            description: 'Manage customers and accounts'
        },
        subModule: {
            id: 'sub-001',
            name: 'Accounts',
            code: 'ACCT',
            description: 'Account management'
        },
        userStory: {
            id: 'story-001',
            code: 'US-001',
            title: 'View Account List',
            description: 'As an Admin, I want to view a list of accounts',
            acceptanceCriteria: [
                'Display account name, number, type, and status',
                'Sort by account name by default',
                'Show 25 records per page'
            ]
        }
    },
    
    // Get current scope level
    getScopeLevel() {
        // For Sprint 1, we're always at story level
        return 'story';
    },
    
    // Get hierarchy context for configuration
    getHierarchyContext() {
        return {
            applicationId: this.currentHierarchy.application.id,
            applicationName: this.currentHierarchy.application.name,
            moduleId: this.currentHierarchy.module.id,
            moduleName: this.currentHierarchy.module.name,
            subModuleId: this.currentHierarchy.subModule.id,
            subModuleName: this.currentHierarchy.subModule.name,
            userStoryId: this.currentHierarchy.userStory.id,
            userStoryCode: this.currentHierarchy.userStory.code,
            userStoryTitle: this.currentHierarchy.userStory.title
        };
    },
    
    // Get breadcrumb for UI display
    getBreadcrumb() {
        return `${this.currentHierarchy.application.name} > ${this.currentHierarchy.module.name} > ${this.currentHierarchy.subModule.name} > ${this.currentHierarchy.userStory.code}`;
    },
    
    // Get configuration scope details
    getConfigurationScope() {
        return {
            scope: 'story',
            scopeId: this.currentHierarchy.userStory.id,
            scopePath: {
                app: this.currentHierarchy.application.code,
                module: this.currentHierarchy.module.code,
                subModule: this.currentHierarchy.subModule.code,
                story: this.currentHierarchy.userStory.code
            },
            scopeNames: {
                app: this.currentHierarchy.application.name,
                module: this.currentHierarchy.module.name,
                subModule: this.currentHierarchy.subModule.name,
                story: this.currentHierarchy.userStory.title
            }
        };
    },
    
    // Validate hierarchy is complete
    isValid() {
        return !!(
            this.currentHierarchy.application &&
            this.currentHierarchy.module &&
            this.currentHierarchy.subModule &&
            this.currentHierarchy.userStory
        );
    },
    
    // Initialize hierarchy display in UI
    initializeUI() {
        // Update breadcrumb
        const breadcrumbEl = document.getElementById('hierarchy-breadcrumb');
        if (breadcrumbEl) {
            breadcrumbEl.textContent = this.getBreadcrumb();
        }
        
        // Update scope indicator
        const scopeEl = document.getElementById('config-scope');
        if (scopeEl) {
            scopeEl.textContent = `Story: ${this.currentHierarchy.userStory.code}`;
        }
        
        // Update header with context
        const headerContext = document.getElementById('hierarchy-context');
        if (headerContext) {
            headerContext.innerHTML = `
                <span class="hierarchy-app">${this.currentHierarchy.application.code}</span>
                <span class="hierarchy-separator">→</span>
                <span class="hierarchy-module">${this.currentHierarchy.module.code}</span>
                <span class="hierarchy-separator">→</span>
                <span class="hierarchy-submodule">${this.currentHierarchy.subModule.code}</span>
                <span class="hierarchy-separator">→</span>
                <span class="hierarchy-story">${this.currentHierarchy.userStory.code}</span>
            `;
        }
    }
};

// Export for use in other modules
window.Hierarchy = Hierarchy;