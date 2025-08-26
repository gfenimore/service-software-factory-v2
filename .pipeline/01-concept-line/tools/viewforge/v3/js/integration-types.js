// ViewForge Integration Types Registry
// Defines all available integration types that can be declared in concepts

const INTEGRATION_TYPES = {
    // Validation integrations
    'address-validation': {
        category: 'validation',
        description: 'Validates and standardizes addresses',
        capabilities: ['autocomplete', 'validation', 'geocoding'],
        commonFields: ['address', 'serviceAddress', 'billingAddress', 'location'],
        suggestFor: (fieldName, fieldType) => {
            const name = fieldName.toLowerCase();
            return name.includes('address') || name.includes('location');
        }
    },
    
    'phone-validation': {
        category: 'validation',
        description: 'Validates and formats phone numbers',
        capabilities: ['format', 'validation', 'carrier-lookup'],
        commonFields: ['phone', 'phoneNumber', 'mobile', 'fax', 'contactPhone'],
        suggestFor: (fieldName, fieldType) => {
            const name = fieldName.toLowerCase();
            return name.includes('phone') || name.includes('mobile') || name.includes('fax');
        }
    },
    
    'email-validation': {
        category: 'validation',
        description: 'Validates email addresses',
        capabilities: ['syntax-check', 'domain-verification', 'deliverability'],
        commonFields: ['email', 'contactEmail', 'notificationEmail'],
        suggestFor: (fieldName, fieldType) => {
            const name = fieldName.toLowerCase();
            return name.includes('email') || fieldType === 'email';
        }
    },
    
    // Display integrations
    'geographic-display': {
        category: 'display',
        description: 'Shows locations on a map',
        capabilities: ['markers', 'clustering', 'routing', 'territories', 'heatmap'],
        dependencies: ['address-validation'],
        commonFields: ['map', 'territory', 'serviceArea'],
        suggestFor: (fieldName, fieldType) => {
            const name = fieldName.toLowerCase();
            return name.includes('map') || name.includes('territory') || name.includes('area');
        }
    },
    
    // Processing integrations
    'payment-processing': {
        category: 'transaction',
        description: 'Processes payments and transactions',
        capabilities: ['credit-card', 'ach', 'invoicing', 'refunds'],
        commonFields: ['payment', 'billing', 'invoice'],
        suggestFor: (fieldName, fieldType) => {
            const name = fieldName.toLowerCase();
            return name.includes('payment') || name.includes('billing') || name.includes('invoice');
        }
    },
    
    // Communication integrations
    'notification-service': {
        category: 'communication',
        description: 'Sends notifications to users',
        capabilities: ['sms', 'email', 'push', 'in-app'],
        commonFields: ['notifications', 'alerts', 'messages'],
        suggestFor: (fieldName, fieldType) => {
            const name = fieldName.toLowerCase();
            return name.includes('notification') || name.includes('alert');
        }
    },
    
    // Storage integrations
    'document-storage': {
        category: 'storage',
        description: 'Stores and retrieves documents',
        capabilities: ['upload', 'download', 'preview', 'versioning'],
        commonFields: ['document', 'attachment', 'file'],
        suggestFor: (fieldName, fieldType) => {
            const name = fieldName.toLowerCase();
            return name.includes('document') || name.includes('attachment') || name.includes('file');
        }
    },
    
    // Search integrations
    'search-service': {
        category: 'search',
        description: 'Provides advanced search capabilities',
        capabilities: ['full-text', 'fuzzy', 'faceted', 'autocomplete'],
        commonFields: ['search', 'query'],
        suggestFor: (fieldName, fieldType) => {
            const name = fieldName.toLowerCase();
            return name.includes('search') || name.includes('query');
        }
    }
};

// Helper functions for integration management
const IntegrationHelpers = {
    // Get all integration types
    getAllTypes() {
        return Object.keys(INTEGRATION_TYPES);
    },
    
    // Get integration by type
    getIntegration(type) {
        return INTEGRATION_TYPES[type] || null;
    },
    
    // Get integrations by category
    getByCategory(category) {
        return Object.entries(INTEGRATION_TYPES)
            .filter(([_, config]) => config.category === category)
            .map(([type, config]) => ({ type, ...config }));
    },
    
    // Suggest integrations for a field
    suggestIntegrations(fieldName, fieldType) {
        const suggestions = [];
        
        for (const [type, config] of Object.entries(INTEGRATION_TYPES)) {
            if (config.suggestFor && config.suggestFor(fieldName, fieldType)) {
                suggestions.push({
                    type,
                    confidence: 'high',
                    reason: `Field name matches pattern for ${type}`
                });
            } else if (config.commonFields.some(f => fieldName.toLowerCase().includes(f))) {
                suggestions.push({
                    type,
                    confidence: 'medium',
                    reason: `Field name similar to common ${type} fields`
                });
            }
        }
        
        return suggestions;
    },
    
    // Validate integration configuration
    validateIntegration(integration) {
        const errors = [];
        
        if (!integration.type) {
            errors.push('Integration type is required');
        } else if (!INTEGRATION_TYPES[integration.type]) {
            errors.push(`Unknown integration type: ${integration.type}`);
        }
        
        // Check dependencies
        if (integration.type && INTEGRATION_TYPES[integration.type]) {
            const config = INTEGRATION_TYPES[integration.type];
            if (config.dependencies) {
                for (const dep of config.dependencies) {
                    if (!integration.dependsOn || !integration.dependsOn.includes(dep)) {
                        errors.push(`Integration ${integration.type} requires dependency: ${dep}`);
                    }
                }
            }
        }
        
        return errors;
    },
    
    // Generate HTML attributes for integration
    generateAttributes(integration) {
        const attrs = [];
        
        if (integration.type) {
            attrs.push(`data-integration="${integration.type}"`);
        }
        
        if (integration.required !== undefined) {
            attrs.push(`data-integration-required="${integration.required}"`);
        }
        
        if (integration.capabilities && integration.capabilities.length > 0) {
            attrs.push(`data-integration-capabilities="${integration.capabilities.join(',')}"`);
        }
        
        if (integration.dependsOn && integration.dependsOn.length > 0) {
            attrs.push(`data-depends-on="${integration.dependsOn.join(',')}"`);
        }
        
        return attrs.join(' ');
    }
};

// Export for use in ViewForge
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { INTEGRATION_TYPES, IntegrationHelpers };
}