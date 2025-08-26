/**
 * List Layout Generator
 * Generates semantic HTML list from configuration
 */

const { generateSampleRows } = require('../sample-data');

/**
 * Generate list layout HTML
 * @param {Object} config - Parsed configuration
 * @returns {string} HTML content
 */
function generateList(config) {
    const { fields, entity } = config;
    const rows = generateSampleRows(fields, 5);
    
    // Build list HTML
    let html = `
    <!-- List View: ${entity.primary} -->
    <div class="view-container" data-entity="${entity.primary}" data-layout="list">
        <h2>${entity.primary} List View</h2>
        <ul class="entity-list">`;
    
    // Add list items
    rows.forEach((row, index) => {
        html += `
            <li class="entity-item" data-row="${index + 1}">
                <dl>`;
        
        fields.forEach(field => {
            const value = row[field.displayPath];
            const displayValue = formatValue(value, field.type);
            html += `
                    <dt>${field.label}</dt>
                    <dd data-entity="${field.entity}" data-field="${field.field}" data-type="${field.type}">${displayValue}</dd>`;
        });
        
        html += `
                </dl>
            </li>`;
    });
    
    html += `
        </ul>
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
    generateList
};