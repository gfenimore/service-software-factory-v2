/**
 * Table Layout Generator
 * Generates semantic HTML table from configuration
 */

const { generateSampleRows } = require('../sample-data');

/**
 * Generate table layout HTML
 * @param {Object} config - Parsed configuration
 * @returns {string} HTML content
 */
function generateTable(config) {
    const { fields, entity, hierarchy } = config;
    const rows = generateSampleRows(fields, 5);
    
    // Build table HTML
    let html = `
    <!-- Table View: ${entity.primary} -->
    <div class="view-container" data-entity="${entity.primary}" data-layout="table">
        <table>
            <caption>${entity.primary} Table View</caption>
            <thead>
                <tr>`;
    
    // Add header columns
    fields.forEach(field => {
        const dataAttrs = `data-entity="${field.entity}" data-field="${field.field}" data-type="${field.type}"`;
        html += `
                    <th ${dataAttrs}>${field.label}</th>`;
    });
    
    html += `
                </tr>
            </thead>
            <tbody>`;
    
    // Add data rows
    rows.forEach((row, index) => {
        html += `
                <tr data-row="${index + 1}">`;
        
        fields.forEach(field => {
            const value = row[field.displayPath];
            const displayValue = formatValue(value, field.type);
            html += `
                    <td>${displayValue}</td>`;
        });
        
        html += `
                </tr>`;
    });
    
    html += `
            </tbody>
        </table>
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
        return value ? '✓' : '✗';
    }
    
    return String(value);
}

module.exports = {
    generateTable
};