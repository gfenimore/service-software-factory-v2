#!/usr/bin/env node
/**
 * BUSM Parser - Extracts entities with parent-child relationships from Mermaid ERD
 * Implements PRD: BUSM-PARSER-PRD.md
 */

const fs = require('fs');
const path = require('path');
const config = require('../../../../pipeline-config');

class BusmParser {
    constructor() {
        this.entities = new Map();
        this.relationships = [];
        this.hierarchies = new Map();
    }

    /**
     * Parse BUSM file and extract entity definitions with relationships
     * @param {string} busmFilePath - Path to BUSM.mmd file
     * @returns {Object} - Parsed entities with hierarchies
     */
    async parseBusm(busmFilePath = null) {
        // Use default path if none provided
        busmFilePath = busmFilePath || path.join(config.PIPELINE_ROOT, '00-requirements/models/BUSM.mmd');
        
        console.log('📖 Reading BUSM file:', busmFilePath);
        
        if (!fs.existsSync(busmFilePath)) {
            throw new Error(`BUSM file not found: ${busmFilePath}`);
        }

        const content = await fs.promises.readFile(busmFilePath, 'utf8');
        
        // Parse entity definitions
        this.parseEntities(content);
        
        // Parse relationships
        this.parseRelationships(content);
        
        // Build hierarchies
        this.buildHierarchies();
        
        return this.getStructuredOutput();
    }

    /**
     * Parse entity definitions from BUSM content
     */
    parseEntities(content) {
        const lines = content.split('\n');
        let currentEntity = null;
        let inEntity = false;

        for (const line of lines) {
            const trimmed = line.trim();
            
            // Start of entity definition
            const entityMatch = trimmed.match(/^(\w+)\s*\{/);
            if (entityMatch) {
                currentEntity = entityMatch[1];
                inEntity = true;
                this.entities.set(currentEntity, {
                    name: currentEntity,
                    fields: [],
                    fieldCount: 0,
                    type: this.determineEntityType(currentEntity),
                    relationships: {
                        parents: [],
                        children: [],
                        related: []
                    }
                });
                continue;
            }

            // End of entity definition
            if (trimmed === '}' && inEntity) {
                if (currentEntity) {
                    const entity = this.entities.get(currentEntity);
                    entity.fieldCount = entity.fields.length;
                }
                inEntity = false;
                currentEntity = null;
                continue;
            }

            // Field definition within entity
            if (inEntity && currentEntity && trimmed) {
                const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(?:\s+(\w+))?\s*(?:"([^"]*)")?/);
                if (fieldMatch) {
                    const [, dataType, fieldName, constraint, description] = fieldMatch;
                    
                    this.entities.get(currentEntity).fields.push({
                        name: fieldName,
                        type: dataType,
                        constraint: constraint || null,
                        description: description || '',
                        isPK: constraint === 'PK',
                        isFK: constraint === 'FK'
                    });
                }
            }
        }

        console.log(`✅ Parsed ${this.entities.size} entities`);
    }

    /**
     * Parse relationships from BUSM content
     */
    parseRelationships(content) {
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Match relationship patterns: ENTITY1 ||--o{ ENTITY2 : "description"
            const relationMatch = trimmed.match(/^(\w+)\s+(\|\||}\||\|\}|o\||\|o|--)\s*(\|\||o\{|\{o|--)\s*(\w+)(?:\s*:\s*"([^"]*)")?/);
            if (relationMatch) {
                const [, entity1, leftCard, rightCard, entity2, description] = relationMatch;
                
                const relationship = {
                    from: entity1,
                    to: entity2,
                    type: this.determineRelationshipType(leftCard, rightCard),
                    description: description || ''
                };
                
                this.relationships.push(relationship);
                
                // Update entity relationship mappings
                if (this.entities.has(entity1) && this.entities.has(entity2)) {
                    // Determine parent-child based on foreign keys and relationship type
                    if (relationship.type.includes('one-to-many')) {
                        // entity1 is parent, entity2 is child
                        this.entities.get(entity1).relationships.children.push(entity2);
                        this.entities.get(entity2).relationships.parents.push(entity1);
                    } else {
                        // Related entities
                        this.entities.get(entity1).relationships.related.push(entity2);
                        this.entities.get(entity2).relationships.related.push(entity1);
                    }
                }
            }
        }

        console.log(`✅ Parsed ${this.relationships.length} relationships`);
    }

    /**
     * Build entity hierarchies based on relationships and foreign keys
     */
    buildHierarchies() {
        // Identify primary entities (those without parents or with minimal parents)
        const primaryEntities = [];
        const secondaryEntities = [];
        const transactionEntities = [];

        for (const [name, entity] of this.entities) {
            if (entity.relationships.parents.length === 0) {
                primaryEntities.push(name);
            } else if (entity.relationships.parents.length === 1 || entity.type === 'lookup') {
                secondaryEntities.push(name);
            } else {
                transactionEntities.push(name);
            }
        }

        this.hierarchies.set('primary', primaryEntities);
        this.hierarchies.set('secondary', secondaryEntities);
        this.hierarchies.set('transaction', transactionEntities);

        console.log(`✅ Built hierarchies: ${primaryEntities.length} primary, ${secondaryEntities.length} secondary, ${transactionEntities.length} transaction`);
    }

    /**
     * Determine entity type based on name and structure
     */
    determineEntityType(entityName) {
        const masterEntities = ['ACCOUNT', 'EMPLOYEE', 'SERVICE', 'MATERIAL'];
        const lookupEntities = ['DOMAIN', 'GEOGRAPHIC_AREA', 'SERVICE_ZONE'];
        const transactionEntities = ['WORK_ORDER', 'INVOICE', 'PAYMENT', 'ROUTE'];
        
        if (masterEntities.includes(entityName)) return 'master';
        if (lookupEntities.includes(entityName)) return 'lookup';
        if (transactionEntities.includes(entityName)) return 'transaction';
        
        // Junction tables (many-to-many connectors)
        if (entityName.includes('_') && entityName.split('_').length > 2) return 'junction';
        
        return 'detail';
    }

    /**
     * Determine relationship type from cardinality markers
     */
    determineRelationshipType(leftCard, rightCard) {
        const cardinalityMap = {
            '||--o{': 'one-to-many',
            '||--||': 'one-to-one',
            '}|--||': 'many-to-one',
            '||--o|': 'one-to-zero-or-one',
            'o|--||': 'zero-or-one-to-one'
        };
        
        const pattern = leftCard + '--' + rightCard;
        return cardinalityMap[pattern] || 'related';
    }

    /**
     * Get structured output with hierarchies
     */
    getStructuredOutput() {
        const entitiesArray = Array.from(this.entities.values());
        
        return {
            metadata: {
                totalEntities: this.entities.size,
                totalRelationships: this.relationships.length,
                parsedAt: new Date().toISOString()
            },
            entities: entitiesArray,
            relationships: this.relationships,
            hierarchies: {
                primary: this.hierarchies.get('primary') || [],
                secondary: this.hierarchies.get('secondary') || [],
                transaction: this.hierarchies.get('transaction') || []
            },
            // Grouped for UI display
            entitiesByType: {
                master: entitiesArray.filter(e => e.type === 'master'),
                detail: entitiesArray.filter(e => e.type === 'detail'),
                transaction: entitiesArray.filter(e => e.type === 'transaction'),
                lookup: entitiesArray.filter(e => e.type === 'lookup'),
                junction: entitiesArray.filter(e => e.type === 'junction')
            }
        };
    }

    /**
     * Filter entities based on selection criteria
     * @param {Array} selectedEntityNames - Names of selected entities
     * @param {Object} options - Filtering options
     */
    filterEntities(selectedEntityNames, options = {}) {
        const { includeChildren = true, includeParents = true, includeRelated = false } = options;
        
        const result = new Set(selectedEntityNames);
        
        for (const entityName of selectedEntityNames) {
            const entity = this.entities.get(entityName);
            if (!entity) continue;

            // Include parent entities if requested
            if (includeParents) {
                entity.relationships.parents.forEach(parent => result.add(parent));
            }

            // Include child entities if requested
            if (includeChildren) {
                entity.relationships.children.forEach(child => result.add(child));
            }

            // Include related entities if requested
            if (includeRelated) {
                entity.relationships.related.forEach(related => result.add(related));
            }
        }

        // Return filtered entities with full details
        return {
            selectedEntities: Array.from(result).map(name => this.entities.get(name)).filter(Boolean),
            metadata: {
                originalSelection: selectedEntityNames,
                expandedCount: result.size,
                expansionRules: { includeChildren, includeParents, includeRelated }
            }
        };
    }
}

// CLI interface for testing
if (require.main === module) {
    async function testParser() {
        const parser = new BusmParser();
        
        try {
            console.log('🧪 Testing BUSM Parser...');
            
            // Parse the BUSM file
            const result = await parser.parseBusm();
            
            console.log('\n📊 Parse Results:');
            console.log(`Total entities: ${result.metadata.totalEntities}`);
            console.log(`Total relationships: ${result.metadata.totalRelationships}`);
            
            console.log('\n🏗️ Entity Types:');
            Object.entries(result.entitiesByType).forEach(([type, entities]) => {
                console.log(`  ${type}: ${entities.length} entities`);
                entities.slice(0, 3).forEach(e => console.log(`    - ${e.name} (${e.fieldCount} fields)`));
                if (entities.length > 3) console.log(`    ... and ${entities.length - 3} more`);
            });

            console.log('\n🔗 Hierarchies:');
            Object.entries(result.hierarchies).forEach(([level, entities]) => {
                console.log(`  ${level}: ${entities.join(', ')}`);
            });

            // Test entity filtering
            console.log('\n🎯 Testing Entity Filtering:');
            const filtered = parser.filterEntities(['ACCOUNT', 'WORK_ORDER'], { includeChildren: true });
            console.log(`Selected: ${filtered.metadata.originalSelection.join(', ')}`);
            console.log(`Expanded to: ${filtered.selectedEntities.map(e => e.name).join(', ')}`);

            console.log('\n✅ BUSM Parser test completed successfully!');
            
        } catch (error) {
            console.error('❌ BUSM Parser test failed:', error);
            process.exit(1);
        }
    }

    testParser();
}

module.exports = BusmParser;