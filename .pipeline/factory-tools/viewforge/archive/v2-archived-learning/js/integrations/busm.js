// BUSM Integration - Business Model Field Registry
// Provides field definitions for entities

const BUSM = {
    // Field definitions matching BUSM schema
    fields: {
        account: {
            accountId: {
                name: 'accountId',
                label: 'Account ID',
                type: 'uuid',
                required: true,
                primaryKey: true
            },
            accountName: {
                name: 'accountName',
                label: 'Account Name',
                type: 'string',
                required: true,
                maxLength: 255
            },
            accountNumber: {
                name: 'accountNumber',
                label: 'Account Number',
                type: 'string',
                required: false,
                maxLength: 50
            },
            accountType: {
                name: 'accountType',
                label: 'Account Type',
                type: 'enum',
                options: ['residential', 'commercial', 'industrial'],
                required: true
            },
            status: {
                name: 'status',
                label: 'Status',
                type: 'enum',
                options: ['active', 'inactive', 'suspended'],
                required: true
            },
            primaryContact: {
                name: 'primaryContact',
                label: 'Primary Contact',
                type: 'string',
                required: false
            },
            phoneNumber: {
                name: 'phoneNumber',
                label: 'Phone Number',
                type: 'string',
                required: false
            },
            email: {
                name: 'email',
                label: 'Email',
                type: 'email',
                required: false
            },
            billingAddress: {
                name: 'billingAddress',
                label: 'Billing Address',
                type: 'string',
                required: false
            },
            createdAt: {
                name: 'createdAt',
                label: 'Created Date',
                type: 'timestamp',
                required: true,
                readOnly: true
            },
            updatedAt: {
                name: 'updatedAt',
                label: 'Last Updated',
                type: 'timestamp',
                required: true,
                readOnly: true
            }
        },
        
        serviceLocation: {
            locationId: {
                name: 'locationId',
                label: 'Location ID',
                type: 'uuid',
                required: true,
                primaryKey: true
            },
            accountId: {
                name: 'accountId',
                label: 'Account ID',
                type: 'uuid',
                required: true,
                foreignKey: 'account.accountId'
            },
            locationName: {
                name: 'locationName',
                label: 'Location Name',
                type: 'string',
                required: true,
                maxLength: 255
            },
            locationCode: {
                name: 'locationCode',
                label: 'Location Code',
                type: 'string',
                required: false,
                maxLength: 50
            },
            address: {
                name: 'address',
                label: 'Street Address',
                type: 'string',
                required: true
            },
            city: {
                name: 'city',
                label: 'City',
                type: 'string',
                required: true
            },
            state: {
                name: 'state',
                label: 'State',
                type: 'string',
                required: true,
                maxLength: 2
            },
            zipCode: {
                name: 'zipCode',
                label: 'ZIP Code',
                type: 'string',
                required: true,
                maxLength: 10
            },
            locationType: {
                name: 'locationType',
                label: 'Location Type',
                type: 'enum',
                options: ['office', 'warehouse', 'retail', 'manufacturing', 'residential'],
                required: true
            },
            squareFootage: {
                name: 'squareFootage',
                label: 'Square Footage',
                type: 'number',
                required: false
            },
            accessInstructions: {
                name: 'accessInstructions',
                label: 'Access Instructions',
                type: 'text',
                required: false
            },
            isActive: {
                name: 'isActive',
                label: 'Active',
                type: 'boolean',
                required: true,
                default: true
            },
            serviceStartDate: {
                name: 'serviceStartDate',
                label: 'Service Start Date',
                type: 'date',
                required: false
            },
            createdAt: {
                name: 'createdAt',
                label: 'Created Date',
                type: 'timestamp',
                required: true,
                readOnly: true
            }
        },
        
        workOrder: {
            workOrderId: {
                name: 'workOrderId',
                label: 'Work Order ID',
                type: 'uuid',
                required: true,
                primaryKey: true
            },
            workOrderNumber: {
                name: 'workOrderNumber',
                label: 'Work Order #',
                type: 'string',
                required: true,
                maxLength: 50
            },
            locationId: {
                name: 'locationId',
                label: 'Location ID',
                type: 'uuid',
                required: true,
                foreignKey: 'serviceLocation.locationId'
            },
            accountId: {
                name: 'accountId',
                label: 'Account ID',
                type: 'uuid',
                required: true,
                foreignKey: 'account.accountId'
            },
            title: {
                name: 'title',
                label: 'Title',
                type: 'string',
                required: true,
                maxLength: 255
            },
            description: {
                name: 'description',
                label: 'Description',
                type: 'text',
                required: false
            },
            status: {
                name: 'status',
                label: 'Status',
                type: 'enum',
                options: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'],
                required: true
            },
            priority: {
                name: 'priority',
                label: 'Priority',
                type: 'enum',
                options: ['low', 'normal', 'high', 'urgent'],
                required: true,
                default: 'normal'
            },
            scheduledDate: {
                name: 'scheduledDate',
                label: 'Scheduled Date',
                type: 'date',
                required: false
            },
            completedDate: {
                name: 'completedDate',
                label: 'Completed Date',
                type: 'date',
                required: false
            },
            assignedTo: {
                name: 'assignedTo',
                label: 'Assigned To',
                type: 'uuid',
                required: false,
                foreignKey: 'technician.technicianId'
            },
            estimatedHours: {
                name: 'estimatedHours',
                label: 'Estimated Hours',
                type: 'number',
                required: false
            },
            actualHours: {
                name: 'actualHours',
                label: 'Actual Hours',
                type: 'number',
                required: false
            },
            createdAt: {
                name: 'createdAt',
                label: 'Created Date',
                type: 'timestamp',
                required: true,
                readOnly: true
            }
        },
        
        technician: {
            technicianId: {
                name: 'technicianId',
                label: 'Technician ID',
                type: 'uuid',
                required: true,
                primaryKey: true
            },
            employeeId: {
                name: 'employeeId',
                label: 'Employee ID',
                type: 'string',
                required: true,
                maxLength: 50
            },
            firstName: {
                name: 'firstName',
                label: 'First Name',
                type: 'string',
                required: true
            },
            lastName: {
                name: 'lastName',
                label: 'Last Name',
                type: 'string',
                required: true
            },
            email: {
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true
            },
            phoneNumber: {
                name: 'phoneNumber',
                label: 'Phone',
                type: 'string',
                required: true
            },
            skillLevel: {
                name: 'skillLevel',
                label: 'Skill Level',
                type: 'enum',
                options: ['apprentice', 'journeyman', 'master'],
                required: true
            },
            isActive: {
                name: 'isActive',
                label: 'Active',
                type: 'boolean',
                required: true,
                default: true
            },
            hireDate: {
                name: 'hireDate',
                label: 'Hire Date',
                type: 'date',
                required: true
            }
        },
        
        customer: {
            customerId: {
                name: 'customerId',
                label: 'Customer ID',
                type: 'uuid',
                required: true,
                primaryKey: true
            },
            accountId: {
                name: 'accountId',
                label: 'Account ID',
                type: 'uuid',
                required: false,
                foreignKey: 'account.accountId'
            },
            firstName: {
                name: 'firstName',
                label: 'First Name',
                type: 'string',
                required: true
            },
            lastName: {
                name: 'lastName',
                label: 'Last Name',
                type: 'string',
                required: true
            },
            email: {
                name: 'email',
                label: 'Email',
                type: 'email',
                required: false
            },
            phoneNumber: {
                name: 'phoneNumber',
                label: 'Phone',
                type: 'string',
                required: false
            },
            isPrimaryContact: {
                name: 'isPrimaryContact',
                label: 'Primary Contact',
                type: 'boolean',
                required: true,
                default: false
            },
            createdAt: {
                name: 'createdAt',
                label: 'Created Date',
                type: 'timestamp',
                required: true,
                readOnly: true
            }
        }
    },
    
    // Get fields for an entity
    getFieldsForEntity(entityKey) {
        return this.fields[entityKey] || {};
    },
    
    // Get field definition
    getField(entityKey, fieldName) {
        return this.fields[entityKey]?.[fieldName];
    },
    
    // Get display-friendly field list
    getFieldList(entityKey) {
        const fields = this.getFieldsForEntity(entityKey);
        return Object.values(fields).map(field => ({
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required,
            readOnly: field.readOnly || false
        }));
    },
    
    // Check if field exists
    hasField(entityKey, fieldName) {
        return !!this.fields[entityKey]?.[fieldName];
    },
    
    // Get relationship fields for an entity
    getRelationshipFields(entityKey) {
        const fields = this.getFieldsForEntity(entityKey);
        return Object.values(fields).filter(field => field.foreignKey);
    }
};

// Export for use in other modules
window.BUSM = BUSM;