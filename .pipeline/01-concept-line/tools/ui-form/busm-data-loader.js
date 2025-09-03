/**
 * BUSM Data Loader - Browser-side interface to BUSM Parser
 * Provides real entity data with parent-child relationships for UI
 */

class BusmDataLoader {
    constructor() {
        this.entities = [];
        this.hierarchies = {};
        this.entitiesByType = {};
        this.relationships = [];
        this.loaded = false;
    }

    /**
     * Load BUSM data (simulated - in real implementation would call Node.js parser)
     * For rough sketch, using extracted real data from BUSM parser test
     */
    async loadBusmData() {
        if (this.loaded) return this.getStructuredData();

        console.log('📖 Loading BUSM entity data...');

        // Real entities extracted from BUSM.mmd (from parser test output)
        const realEntities = [
            // Master Entities (Core business objects)
            {
                name: 'ACCOUNT',
                fieldCount: 8,
                type: 'master',
                description: 'Customer and vendor accounts',
                relationships: { parents: [], children: ['CONTACT', 'SERVICE_LOCATION', 'WORK_ORDER', 'INVOICE'], related: [] }
            },
            {
                name: 'SERVICE', 
                fieldCount: 6,
                type: 'master',
                description: 'Services offered by the business',
                relationships: { parents: [], children: ['WORK_ORDER_ITEM'], related: [] }
            },
            {
                name: 'EMPLOYEE',
                fieldCount: 6, 
                type: 'master',
                description: 'Company staff and technicians',
                relationships: { parents: [], children: ['WORK_ORDER_ASSIGNMENT', 'ROUTE'], related: [] }
            },
            {
                name: 'MATERIAL',
                fieldCount: 7,
                type: 'master', 
                description: 'Parts and materials inventory',
                relationships: { parents: [], children: ['MATERIAL_USAGE'], related: [] }
            },

            // Detail Entities (Dependent on master entities)
            {
                name: 'CONTACT',
                fieldCount: 8,
                type: 'detail',
                description: 'Customer contact persons',
                relationships: { parents: ['ACCOUNT'], children: ['CONTACT_LOCATION'], related: [] }
            },
            {
                name: 'SERVICE_LOCATION',
                fieldCount: 14,
                type: 'detail',
                description: 'Physical service addresses', 
                relationships: { parents: ['ACCOUNT'], children: ['SERVICEABLE_ITEM', 'WORK_ORDER'], related: ['GEOGRAPHIC_AREA'] }
            },
            {
                name: 'SERVICEABLE_ITEM',
                fieldCount: 10,
                type: 'detail',
                description: 'Assets being serviced (boats, pools, etc.)',
                relationships: { parents: ['ACCOUNT', 'SERVICE_LOCATION'], children: ['SERVICEABLE_ITEM_PROPERTY'], related: ['DOMAIN'] }
            },
            {
                name: 'CONTACT_LOCATION',
                fieldCount: 5,
                type: 'detail',
                description: 'Contact-to-location relationships',
                relationships: { parents: ['CONTACT', 'SERVICE_LOCATION'], children: [], related: [] }
            },
            {
                name: 'SERVICE_AGREEMENT',
                fieldCount: 7,
                type: 'detail',
                description: 'Maintenance contracts and agreements',
                relationships: { parents: ['ACCOUNT'], children: ['AGREEMENT_ITEM'], related: [] }
            },

            // Transaction Entities (Business processes)
            {
                name: 'WORK_ORDER',
                fieldCount: 12,
                type: 'transaction',
                description: 'Service requests and repair orders',
                relationships: { parents: ['ACCOUNT', 'SERVICE_LOCATION', 'SERVICEABLE_ITEM'], children: ['WORK_ORDER_ITEM', 'WORK_ORDER_ASSIGNMENT'], related: [] }
            },
            {
                name: 'INVOICE',
                fieldCount: 12,
                type: 'transaction',
                description: 'Customer billing documents',
                relationships: { parents: ['ACCOUNT', 'WORK_ORDER'], children: ['INVOICE_LINE_ITEM'], related: [] }
            },
            {
                name: 'PAYMENT',
                fieldCount: 8,
                type: 'transaction',
                description: 'Customer payment records',
                relationships: { parents: ['ACCOUNT', 'INVOICE'], children: [], related: [] }
            },
            {
                name: 'ROUTE',
                fieldCount: 5,
                type: 'transaction',
                description: 'Daily service routes',
                relationships: { parents: ['EMPLOYEE'], children: ['ROUTE_STOP'], related: [] }
            },

            // Lookup Entities (Reference data)
            {
                name: 'DOMAIN',
                fieldCount: 3,
                type: 'lookup',
                description: 'Industry types (boats, pools, lawns)',
                relationships: { parents: [], children: [], related: ['SERVICEABLE_ITEM'] }
            },
            {
                name: 'GEOGRAPHIC_AREA',
                fieldCount: 8,
                type: 'lookup',
                description: 'Service territory boundaries',
                relationships: { parents: [], children: [], related: ['SERVICE_LOCATION'] }
            },
            {
                name: 'SERVICE_ZONE',
                fieldCount: 5,
                type: 'lookup',
                description: 'Operational service groupings',
                relationships: { parents: [], children: [], related: ['SERVICE_LOCATION'] }
            },

            // Junction/Bridge Entities (Many-to-many relationships)
            {
                name: 'WORK_ORDER_ITEM',
                fieldCount: 11,
                type: 'junction',
                description: 'Individual tasks within work orders',
                relationships: { parents: ['WORK_ORDER', 'SERVICE'], children: ['MATERIAL_USAGE'], related: [] }
            },
            {
                name: 'AGREEMENT_ITEM',
                fieldCount: 7,
                type: 'junction',
                description: 'Services included in agreements',
                relationships: { parents: ['SERVICE_AGREEMENT', 'SERVICE'], children: [], related: [] }
            },
            {
                name: 'INVOICE_LINE_ITEM',
                fieldCount: 9,
                type: 'junction',
                description: 'Individual charges on invoices',
                relationships: { parents: ['INVOICE'], children: [], related: ['WORK_ORDER_ITEM', 'MATERIAL_USAGE'] }
            },
            {
                name: 'MATERIAL_USAGE',
                fieldCount: 7,
                type: 'junction',
                description: 'Materials used in specific tasks',
                relationships: { parents: ['WORK_ORDER_ITEM', 'MATERIAL'], children: [], related: [] }
            },
            {
                name: 'SERVICEABLE_ITEM_PROPERTY',
                fieldCount: 6,
                type: 'junction',
                description: 'Properties/characteristics of serviceable items',
                relationships: { parents: ['SERVICEABLE_ITEM'], children: [], related: [] }
            }
        ];

        this.entities = realEntities;

        // Group by type for hierarchical display
        this.entitiesByType = {
            master: realEntities.filter(e => e.type === 'master'),
            detail: realEntities.filter(e => e.type === 'detail'),
            transaction: realEntities.filter(e => e.type === 'transaction'),
            lookup: realEntities.filter(e => e.type === 'lookup'),
            junction: realEntities.filter(e => e.type === 'junction')
        };

        this.loaded = true;
        console.log(`✅ Loaded ${realEntities.length} real BUSM entities`);

        return this.getStructuredData();
    }

    /**
     * Get structured data for UI consumption
     */
    getStructuredData() {
        return {
            entities: this.entities,
            entitiesByType: this.entitiesByType,
            metadata: {
                totalEntities: this.entities.length,
                loadedAt: new Date().toISOString(),
                typeDistribution: Object.entries(this.entitiesByType).map(([type, entities]) => ({
                    type,
                    count: entities.length
                }))
            }
        };
    }

    /**
     * Get entities for a specific selection, including related entities
     */
    getExpandedSelection(selectedNames, options = {}) {
        const { includeChildren = true, includeParents = false, includeRelated = false } = options;
        
        const result = new Set(selectedNames);
        const entityMap = new Map(this.entities.map(e => [e.name, e]));

        for (const entityName of selectedNames) {
            const entity = entityMap.get(entityName);
            if (!entity) continue;

            if (includeParents) {
                entity.relationships.parents.forEach(parent => result.add(parent));
            }

            if (includeChildren) {
                entity.relationships.children.forEach(child => result.add(child));
            }

            if (includeRelated) {
                entity.relationships.related.forEach(related => result.add(related));
            }
        }

        return {
            selectedEntities: Array.from(result).map(name => entityMap.get(name)).filter(Boolean),
            metadata: {
                originalSelection: selectedNames,
                expandedCount: result.size,
                expansionRules: options
            }
        };
    }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
    window.BusmDataLoader = BusmDataLoader;
} else {
    module.exports = BusmDataLoader;
}