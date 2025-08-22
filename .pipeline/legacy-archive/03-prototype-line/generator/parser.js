/**
 * Configuration Parser for Prototype Generator
 * Extends Concept parser with React-specific enhancements
 */

/**
 * Parse configuration for React generation
 * @param {Object} config - Raw configuration
 * @returns {Object} Parsed configuration with React enhancements
 */
function parseConfiguration(config) {
    // Get entity name for component naming
    const entityName = config.entity.primary;
    const entityNamePascal = toPascalCase(entityName);
    const componentName = entityNamePascal + (config.layout.type === 'table' ? 'List' : toPascalCase(config.layout.type));
    
    return {
        version: config.version,
        hierarchy: {
            application: config.hierarchy.application || { name: 'Unknown App' },
            module: config.hierarchy.module || { name: 'Unknown Module' },
            subModule: config.hierarchy.subModule || null,
            userStory: config.hierarchy.userStory || null
        },
        entity: {
            primary: config.entity.primary,
            related: config.entity.related || []
        },
        entityName,
        entityNamePascal,
        componentName,
        fields: config.fields.map(field => ({
            entity: field.entity,
            field: field.field,
            fieldCamel: toCamelCase(field.field),
            label: field.label,
            type: field.type,
            tsType: mapToTypeScript(field.type),
            isRelated: field.isRelated || false,
            isSortable: ['string', 'number', 'date', 'enum'].includes(field.type),
            isFilterable: ['string', 'enum', 'boolean'].includes(field.type)
        })),
        layout: {
            type: config.layout.type || 'table',
            features: config.layout.features || {
                sorting: true,
                pagination: true,
                filtering: true
            }
        },
        metadata: {
            generatedAt: new Date().toISOString(),
            generatorVersion: '1.0.0',
            framework: 'React',
            styling: 'Tailwind CSS'
        }
    };
}

/**
 * Convert to PascalCase
 */
function toPascalCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
        .replace(/^(.)/, c => c.toUpperCase());
}

/**
 * Convert to camelCase
 */
function toCamelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
        .replace(/^(.)/, c => c.toLowerCase());
}

/**
 * Map field type to TypeScript type
 */
function mapToTypeScript(fieldType) {
    const typeMap = {
        'string': 'string',
        'uuid': 'string',
        'number': 'number',
        'boolean': 'boolean',
        'date': 'string', // ISO date string
        'datetime': 'string',
        'enum': 'string', // Could be enhanced with literal types
        'email': 'string',
        'phone': 'string',
        'currency': 'number',
        'percentage': 'number'
    };
    
    return typeMap[fieldType] || 'string';
}

module.exports = {
    parseConfiguration
};