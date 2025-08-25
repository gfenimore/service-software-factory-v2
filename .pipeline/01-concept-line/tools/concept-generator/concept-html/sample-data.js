/**
 * Sample Data Generator
 * Creates realistic sample data based on field types
 */

// Sample data pools
const sampleData = {
    // Account-related
    'account.name': ['Acme Corporation', 'Global Industries Inc', 'TechStart Solutions', 'Regional Services LLC', 'Metro Enterprises'],
    'account.accountName': ['Acme Corporation', 'Global Industries Inc', 'TechStart Solutions', 'Regional Services LLC', 'Metro Enterprises'],
    'account.accountNumber': ['ACC-001', 'ACC-002', 'ACC-003', 'ACC-004', 'ACC-005'],
    'account.status': ['Active', 'Active', 'Pending', 'Active', 'On Hold'],
    'account.type': ['Commercial', 'Residential', 'Commercial', 'Industrial', 'Residential'],
    'account.accountType': ['Commercial', 'Residential', 'Commercial', 'Industrial', 'Residential'],
    
    // Service Location-related
    'serviceLocation.name': ['Main Office', 'Warehouse A', 'Branch Office', 'Production Facility', 'Regional HQ'],
    'serviceLocation.locationName': ['Main Office', 'Warehouse A', 'Branch Office', 'Production Facility', 'Regional HQ'],
    'serviceLocation.address': ['123 Main St', '456 Industrial Blvd', '789 Commerce Way', '321 Factory Rd', '654 Business Park'],
    'serviceLocation.city': ['Springfield', 'Riverside', 'Lakewood', 'Mountain View', 'Centerville'],
    'serviceLocation.state': ['CA', 'TX', 'NY', 'FL', 'IL'],
    'serviceLocation.postalCode': ['90210', '75001', '10001', '33101', '60601'],
    'serviceLocation.locationType': ['Office', 'Warehouse', 'Retail', 'Manufacturing', 'Distribution'],
    
    // Work Order-related
    'workOrder.workOrderNumber': ['WO-2024-001', 'WO-2024-002', 'WO-2024-003', 'WO-2024-004', 'WO-2024-005'],
    'workOrder.description': ['HVAC Maintenance', 'Electrical Repair', 'Plumbing Service', 'Equipment Installation', 'Safety Inspection'],
    'workOrder.status': ['Scheduled', 'In Progress', 'Completed', 'Scheduled', 'On Hold'],
    'workOrder.priority': ['High', 'Medium', 'Low', 'High', 'Medium'],
    'workOrder.scheduledDate': ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'],
    
    // Generic types
    'string': ['Sample Text A', 'Sample Text B', 'Sample Text C', 'Sample Text D', 'Sample Text E'],
    'uuid': ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'],
    'email': ['contact@example.com', 'admin@company.org', 'support@service.net', 'info@business.com', 'hello@enterprise.io'],
    'phone': ['(555) 123-4567', '(555) 234-5678', '(555) 345-6789', '(555) 456-7890', '(555) 567-8901'],
    'date': ['2024-01-15', '2024-01-20', '2024-02-01', '2024-02-15', '2024-03-01'],
    'datetime': ['2024-01-15T09:00:00', '2024-01-15T14:30:00', '2024-01-16T10:15:00', '2024-01-16T16:45:00', '2024-01-17T11:00:00'],
    'boolean': [true, false, true, true, false],
    'number': [100, 250, 175, 500, 325],
    'currency': ['$1,234.56', '$2,345.67', '$3,456.78', '$4,567.89', '$5,678.90'],
    'percentage': ['75%', '80%', '92%', '65%', '88%']
};

/**
 * Generate sample data for a field
 * @param {Object} field - Field configuration
 * @param {number} rowIndex - Row index for data selection
 * @returns {string} Sample data value
 */
function generateFieldData(field, rowIndex) {
    // Try specific field mapping first
    const specificKey = `${field.entity}.${field.field}`;
    if (sampleData[specificKey]) {
        return sampleData[specificKey][rowIndex % sampleData[specificKey].length];
    }
    
    // Check for common field names
    if (field.field.toLowerCase().includes('email')) {
        return sampleData.email[rowIndex % sampleData.email.length];
    }
    if (field.field.toLowerCase().includes('phone')) {
        return sampleData.phone[rowIndex % sampleData.phone.length];
    }
    if (field.field.toLowerCase().includes('date')) {
        return sampleData.date[rowIndex % sampleData.date.length];
    }
    
    // Fall back to type-based generation
    const typeData = sampleData[field.type];
    if (typeData) {
        return typeData[rowIndex % typeData.length];
    }
    
    // Default fallback
    return `${field.label} ${rowIndex + 1}`;
}

/**
 * Generate multiple rows of sample data
 * @param {Array} fields - Field configurations
 * @param {number} rowCount - Number of rows to generate
 * @returns {Array} Array of row objects
 */
function generateSampleRows(fields, rowCount = 5) {
    const rows = [];
    
    for (let i = 0; i < rowCount; i++) {
        const row = {};
        fields.forEach(field => {
            row[field.displayPath] = generateFieldData(field, i);
        });
        rows.push(row);
    }
    
    return rows;
}

module.exports = {
    generateFieldData,
    generateSampleRows
};