#!/usr/bin/env node

/**
 * Example of how processors can use the BUSM Registry
 * This shows how to integrate data model awareness into any processor
 */

const busm = require('./busm-registry');

console.log('='.repeat(60));
console.log('BUSM Integration Example for Processors');
console.log('='.repeat(60));

// Example 1: Generate valid mock data for concept
console.log('\n1. Generating Mock Data for Concept:\n');

const mockAccount = busm.generateMock('Account', {
    AccountName: 'Acme Corporation'
});
console.log('Account:', JSON.stringify(mockAccount, null, 2));

// Example 2: Generate related entities
console.log('\n2. Generating Related Entities:\n');

const accountWithRelated = busm.generateWithRelationships('Account', 1, {
    includeRelated: ['serviceLocations', 'contacts'],
    relatedCounts: {
        serviceLocations: 2,
        contacts: 1
    },
    context: {
        Account: mockAccount.AccountID
    }
});

console.log('Generated:', Object.keys(accountWithRelated).map(k => `${k}: ${accountWithRelated[k].length}`).join(', '));

// Example 3: Validate data against BUSM
console.log('\n3. Validating Data:\n');

const invalidWorkOrder = {
    WorkOrderID: 123,
    WorkOrderType: 'InvalidType',  // This will fail validation
    AccountID: 456
};

const validation = busm.validate('WorkOrder', invalidWorkOrder);
console.log('Validation result:', validation);

// Example 4: Check relationships
console.log('\n4. Checking Relationships:\n');

const relationship = busm.getRelationship('Account', 'ServiceLocation');
console.log('Account -> ServiceLocation relationship:', relationship);

// Example 5: Use in story generation
console.log('\n5. Story Generation with BUSM:\n');

function generateStoryWithBUSM(entityType, action) {
    const entity = busm.getEntity(entityType);
    if (!entity) {
        throw new Error(`Unknown entity: ${entityType}`);
    }
    
    const story = {
        title: `User can ${action} ${entityType}`,
        acceptanceCriteria: []
    };
    
    // Add criteria for required fields
    for (const field of entity.required) {
        if (field !== entity.primaryKey) {
            story.acceptanceCriteria.push(
                `System validates that ${field} is provided`
            );
        }
    }
    
    // Add criteria for relationships
    if (entity.relationships) {
        for (const [relName, relDef] of Object.entries(entity.relationships)) {
            if (relDef.type === 'many:1') {
                story.acceptanceCriteria.push(
                    `System validates that ${relDef.foreignKey} references valid ${relDef.target}`
                );
            }
        }
    }
    
    return story;
}

const story = generateStoryWithBUSM('WorkOrder', 'create');
console.log('Generated Story:', JSON.stringify(story, null, 2));

// Example 6: Generate test data for validation
console.log('\n6. Generate Test Data for 3-Click Navigation:\n');

function generateNavigationTestData() {
    // Generate account with locations and work orders
    const account = busm.generateMock('Account');
    const locations = [];
    const workOrders = [];
    
    // Create 3 locations for the account
    for (let i = 0; i < 3; i++) {
        const location = busm.generateMock('ServiceLocation', {
            AccountID: account.AccountID,
            LocationName: `Location ${i + 1}`
        });
        locations.push(location);
        
        // Create 2 work orders per location
        for (let j = 0; j < 2; j++) {
            const workOrder = busm.generateMock('WorkOrder', {
                AccountID: account.AccountID,
                ServiceLocationID: location.ServiceLocationID,
                Summary: `Work Order ${i}-${j}`
            });
            workOrders.push(workOrder);
        }
    }
    
    return {
        account,
        locations,
        workOrders,
        navigationPath: [
            'Dashboard',
            `Account: ${account.AccountName}`,
            `Location: ${locations[0].LocationName}`,
            `Work Order: ${workOrders[0].Summary}`
        ]
    };
}

const testData = generateNavigationTestData();
console.log('Navigation Test Data:');
console.log('  Account:', testData.account.AccountName);
console.log('  Locations:', testData.locations.length);
console.log('  Work Orders:', testData.workOrders.length);
console.log('  3-Click Path:', testData.navigationPath.slice(0, 3).join(' -> '));

console.log('\n' + '='.repeat(60));
console.log('This example shows how processors can use BUSM for:');
console.log('  ✓ Mock data generation');
console.log('  ✓ Data validation');
console.log('  ✓ Relationship management');
console.log('  ✓ Story generation');
console.log('  ✓ Test data creation');
console.log('='.repeat(60));