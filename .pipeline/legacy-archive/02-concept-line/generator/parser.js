/**
 * Configuration Parser
 * Extracts and normalizes configuration data
 */

/**
 * Parse configuration for generation
 * @param {Object} config - Raw configuration
 * @returns {Object} Parsed configuration
 */
function parseConfiguration(config) {
    return {
        version: config.version,
        hierarchy: {
            application: config.hierarchy.application || { name: 'Unknown App' },
            module: config.hierarchy.module || { name: 'Unknown Module' },
            subModule: config.hierarchy.subModule || null,
            userStory: config.hierarchy.userStory || null
        },
        scope: {
            level: config.scope.level,
            path: config.scope.path || buildPath(config)
        },
        entity: {
            primary: config.entity.primary,
            related: config.entity.related || []
        },
        fields: config.fields.map(field => ({
            entity: field.entity,
            field: field.field,
            label: field.label,
            type: field.type,
            isRelated: field.isRelated || false,
            displayPath: field.isRelated ? `${field.entity}.${field.field}` : field.field
        })),
        layout: {
            type: config.layout.type || 'table',
            features: config.layout.features || {
                sorting: false,
                pagination: false,
                filtering: false
            }
        },
        metadata: {
            generatedAt: new Date().toISOString(),
            generatorVersion: '1.0.0'
        }
    };
}

/**
 * Build hierarchy path string
 * @param {Object} config - Configuration
 * @returns {string} Path like "app/module/submodule/story"
 */
function buildPath(config) {
    const parts = [];
    
    if (config.hierarchy.application) {
        parts.push(config.hierarchy.application.name);
    }
    if (config.hierarchy.module) {
        parts.push(config.hierarchy.module.name);
    }
    if (config.hierarchy.subModule) {
        parts.push(config.hierarchy.subModule.name);
    }
    if (config.hierarchy.userStory) {
        parts.push(config.hierarchy.userStory.code);
    }
    
    return parts.join(' > ');
}

module.exports = {
    parseConfiguration
};