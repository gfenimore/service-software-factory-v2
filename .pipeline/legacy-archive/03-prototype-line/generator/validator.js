/**
 * Configuration Validator for Prototype Generator
 * Reuses Concept Line validation logic
 */

/**
 * Validate configuration structure
 * @param {Object} config - Configuration to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateConfiguration(config) {
    const errors = [];
    
    // Check required top-level fields
    if (!config.version) {
        errors.push('Missing version field');
    }
    
    if (!config.hierarchy) {
        errors.push('Missing hierarchy field');
    } else {
        if (!config.hierarchy.application) {
            errors.push('Missing hierarchy.application');
        }
        if (!config.hierarchy.module) {
            errors.push('Missing hierarchy.module');
        }
    }
    
    if (!config.entity) {
        errors.push('Missing entity field');
    } else {
        if (!config.entity.primary) {
            errors.push('Missing entity.primary');
        }
    }
    
    if (!config.fields || !Array.isArray(config.fields)) {
        errors.push('Missing or invalid fields array');
    } else if (config.fields.length === 0) {
        errors.push('No fields specified');
    }
    
    if (!config.layout) {
        errors.push('Missing layout field');
    } else {
        if (!config.layout.type) {
            errors.push('Missing layout.type');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    validateConfiguration
};