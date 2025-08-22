/**
 * Detail Layout Generator
 * Generates semantic HTML detail view from configuration
 */

const { generateFieldData } = require('../sample-data');

/**
 * Generate detail layout HTML
 * @param {Object} config - Parsed configuration
 * @returns {string} HTML content
 */
function generateDetail(config) {
    const { fields, entity } = config;
    
    // Group fields by entity
    const fieldGroups = {};
    fields.forEach(field => {
        if (!fieldGroups[field.entity]) {
            fieldGroups[field.entity] = [];
        }
        fieldGroups[field.entity].push(field);
    });
    
    // Build detail HTML
    let html = `
    <!-- Detail View: ${entity.primary} -->
    <div class="view-container" data-entity="${entity.primary}" data-layout="detail">
        <h2>${entity.primary} Detail View</h2>`;
    
    // Add field groups
    Object.keys(fieldGroups).forEach(entityName => {
        const isRelated = entityName !== entity.primary;
        const groupTitle = isRelated ? `Related: ${entityName}` : entityName;
        
        html += `
        <fieldset ${isRelated ? 'class="related-entity"' : ''}>
            <legend>${groupTitle}</legend>
            <dl>`;
        
        fieldGroups[entityName].forEach(field => {
            const value = generateFieldData(field, 0); // Single record for detail view
            const displayValue = formatValue(value, field.type);
            
            html += `
                <dt>${field.label}</dt>
                <dd data-entity="${field.entity}" data-field="${field.field}" data-type="${field.type}">${displayValue}</dd>`;
        });
        
        html += `
            </dl>
        </fieldset>`;
    });
    
    html += `
    </div>`;
    
    return html;
}

/**
 * Format value based on field type
 * @param {any} value - Raw value
 * @param {string} type - Field type
 * @returns {string} Formatted value
 */
function formatValue(value, type) {
    if (value === null || value === undefined) {
        return '—';
    }
    
    if (type === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    
    return String(value);
}

module.exports = {
    generateDetail
};