const fs = require('fs');
const path = require('path');

function generateViewForgeFromPRD() {
    const entities = [
        { name: 'Account', id: 'account', description: 'Main customer accounts displayed in Column 1', type: 'primary' },
        { name: 'ServiceLocation', id: 'serviceLocation', description: 'Physical locations tied to accounts (Column 2)', type: 'primary' },
        { name: 'WorkOrder', id: 'workOrder', description: 'Service work orders tied to locations (Column 3)', type: 'primary' },
        { name: 'Contact', id: 'contact', description: 'Contact information for accounts and service locations', type: 'supporting' },
        { name: 'CommunicationLog', id: 'communicationLog', description: 'Communication history tied to contacts', type: 'supporting' },
        { name: 'ServiceAgreement', id: 'serviceAgreement', description: 'Contractual agreements tied to accounts', type: 'supporting' },
        { name: 'FinancialData', id: 'financialData', description: 'Account financial information and history', type: 'supporting' }
    ];

    const viewForgeSpec = {
        layout: "three-column-master",
        columns: [
            {
                id: "accounts",
                title: "Accounts", 
                component: "AccountListView",
                entity: "Account",
                view: "list"
            },
            {
                id: "locations",
                title: "Service Locations",
                component: "ServiceLocationListView", 
                entity: "ServiceLocation",
                view: "list",
                dependsOn: "accounts"
            },
            {
                id: "workorders", 
                title: "Work Orders",
                component: "WorkOrderListView",
                entity: "WorkOrder", 
                view: "list",
                dependsOn: "locations"
            }
        ],
        configuration: {
            entities: entities.map(e => e.name),
            navigation: {
                "accounts": {
                    "onSelect": "loads locations for selected account"
                },
                "locations": {
                    "onSelect": "loads work orders for selected location"  
                }
            },
            relationships: [
                "Account → ServiceLocation (one-to-many)",
                "ServiceLocation → WorkOrder (one-to-many)", 
                "Account → Contact (one-to-many)",
                "Contact → CommunicationLog (one-to-many)",
                "Account → ServiceAgreement (one-to-many)",
                "Account → FinancialData (one-to-many)"
            ]
        }
    };

    const outputDir = path.join(__dirname, '../outputs/simple');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'entities.json'), JSON.stringify(entities, null, 2));
    fs.writeFileSync(path.join(outputDir, 'viewforge-spec.json'), JSON.stringify(viewForgeSpec, null, 2));
    
    console.log('✅ Generated ViewForge spec from PRD entities');
    console.log(`📁 Output: ${outputDir}`);
}

if (require.main === module) {
    generateViewForgeFromPRD();
}

module.exports = { generateViewForgeFromPRD };