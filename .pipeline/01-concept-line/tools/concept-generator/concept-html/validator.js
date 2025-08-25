/**
 * Configuration Validator
 * Ensures ViewForge configuration is complete and valid
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
        // Validate hierarchy structure
        if (!config.hierarchy.application) {
            errors.push('Missing hierarchy.application');
        }
        if (!config.hierarchy.module) {
            errors.push('Missing hierarchy.module');
        }
        // SubModule and UserStory are optional
    }
    
    if (!config.scope) {
        errors.push('Missing scope field');
    } else {
        if (!config.scope.level) {
            errors.push('Missing scope.level');
        } else if (!['app', 'module', 'submodule', 'story'].includes(config.scope.level)) {
            errors.push(`Invalid scope level: ${config.scope.level}`);
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
    } else {
        // Validate each field
        config.fields.forEach((field, index) => {
            if (!field.entity) {
                errors.push(`Field ${index}: missing entity`);
            }
            if (!field.field) {
                errors.push(`Field ${index}: missing field name`);
            }
            if (!field.label) {
                errors.push(`Field ${index}: missing label`);
            }
            if (!field.type) {
                errors.push(`Field ${index}: missing type`);
            }
        });
    }
    
    if (!config.layout) {
        errors.push('Missing layout field');
    } else {
        if (!config.layout.type) {
            errors.push('Missing layout.type');
        } else if (!['table', 'list', 'detail'].includes(config.layout.type)) {
            errors.push(`Invalid layout type: ${config.layout.type}`);
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