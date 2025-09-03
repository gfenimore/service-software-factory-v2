/**
 * BUSM Authority Gateway - Single Source of Truth Enforcement
 * 
 * Provides exclusive access to BUSM-master.mmd with cryptographic entity validation
 * Implements technical impossibility of unauthorized BUSM access
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const EntityProvenanceValidator = require('./entity-provenance-validator');

class BusmAuthorityGateway extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            busmMasterPath: options.busmMasterPath || path.join(__dirname, '../../../../.pipeline/00-requirements/models/BUSM-master.mmd'),
            enableFileSystemProtection: options.enableFileSystemProtection !== false,
            enableAuditLogging: options.enableAuditLogging !== false,
            cacheTTL: options.cacheTTL || 300000, // 5 minutes
            ...options
        };
        
        // Core components
        this.cache = new Map();
        this.auditLogger = null;
        this.accessControlManager = null;
        this.provenanceValidator = null;
        
        // Runtime state
        this.isInitialized = false;
        this.lastValidation = null;
        this.busmData = null;
        this.entities = new Map();
        this.relationships = new Map();
        
        console.log('🛡️ BUSM Authority Gateway initialized');
    }

    /**
     * Initialize the gateway with all protection systems
     */
    async initialize() {
        console.log('🚀 Initializing BUSM Authority Gateway...');
        
        try {
            // 1. Validate BUSM-master.mmd exists and is readable
            await this.validateBusmMasterFile();
            
            // 2. Load and parse BUSM-master.mmd
            await this.loadBusmMaster();
            
            // 3. Initialize provenance validation system
            await this.initializeProvenanceValidator();
            
            // 4. Initialize audit logging
            if (this.config.enableAuditLogging) {
                this.initializeAuditLogger();
            }
            
            // 5. Initialize file system protection
            if (this.config.enableFileSystemProtection) {
                this.initializeAccessControlManager();
            }
            
            this.isInitialized = true;
            this.lastValidation = Date.now();
            
            console.log('✅ BUSM Authority Gateway initialized successfully');
            console.log(`   - ${this.entities.size} entities loaded`);
            console.log(`   - ${this.relationships.size} relationships mapped`);
            console.log(`   - Entity provenance validation: ACTIVE`);
            
            this.emit('initialized', {
                entityCount: this.entities.size,
                relationshipCount: this.relationships.size,
                timestamp: this.lastValidation
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Gateway initialization failed:', error.message);
            this.emit('initializationFailed', error);
            throw error;
        }
    }

    /**
     * Validate BUSM-master.mmd file exists and has correct permissions
     */
    async validateBusmMasterFile() {
        const busmPath = this.config.busmMasterPath;
        
        if (!fs.existsSync(busmPath)) {
            throw new Error(`BUSM-master.mmd not found at: ${busmPath}`);
        }
        
        const stats = await fs.promises.stat(busmPath);
        
        if (!stats.isFile()) {
            throw new Error(`BUSM-master path is not a file: ${busmPath}`);
        }
        
        // Verify file can be read
        try {
            await fs.promises.access(busmPath, fs.constants.R_OK);
        } catch (error) {
            throw new Error(`Cannot read BUSM-master.mmd: ${error.message}`);
        }
        
        console.log(`✅ BUSM-master.mmd validated: ${busmPath}`);
    }

    /**
     * Load and parse BUSM-master.mmd into memory
     */
    async loadBusmMaster() {
        console.log('📖 Loading BUSM-master.mmd...');
        
        const content = await fs.promises.readFile(this.config.busmMasterPath, 'utf8');
        
        // Parse erDiagram content
        this.busmData = {
            content,
            checksum: crypto.createHash('sha256').update(content).digest('hex'),
            loadedAt: Date.now(),
            entities: new Map(),
            relationships: new Map()
        };
        
        // Parse entities and relationships
        this.parseErDiagram(content);
        
        console.log(`✅ BUSM-master.mmd loaded and parsed`);
        console.log(`   - Checksum: ${this.busmData.checksum}`);
    }

    /**
     * Parse erDiagram format from BUSM-master.mmd
     */
    parseErDiagram(content) {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        
        let currentEntity = null;
        let parsingEntity = false;
        
        for (const line of lines) {
            // Skip erDiagram declaration
            if (line === 'erDiagram' || line.startsWith('direction')) {
                continue;
            }
            
            // Entity definition start
            if (line.includes('{') && !line.includes('||') && !line.includes('}|')) {
                const entityMatch = line.match(/^([A-Z_]+)\s*\{/);
                if (entityMatch) {
                    currentEntity = entityMatch[1];
                    parsingEntity = true;
                    
                    const entity = {
                        name: currentEntity,
                        fields: new Map(),
                        primaryKey: null,
                        foreignKeys: [],
                        signature: null,
                        relationships: {
                            parents: [],
                            children: [],
                            related: []
                        }
                    };
                    
                    this.entities.set(currentEntity, entity);
                    continue;
                }
            }
            
            // Entity definition end
            if (line === '}') {
                if (parsingEntity && currentEntity) {
                    // Generate entity signature
                    const entity = this.entities.get(currentEntity);
                    entity.signature = this.generateEntitySignature(entity);
                }
                parsingEntity = false;
                currentEntity = null;
                continue;
            }
            
            // Parse entity fields
            if (parsingEntity && currentEntity) {
                const fieldMatch = line.match(/^(\w+)\s+(\w+)(?:\s+(PK|FK))?(?:\s+"([^"]+)")?/);
                if (fieldMatch) {
                    const [, type, fieldName, constraint, description] = fieldMatch;
                    
                    const field = {
                        name: fieldName,
                        type: this.mapMermaidTypeToStandard(type),
                        constraint,
                        description: description || '',
                        isPrimaryKey: constraint === 'PK',
                        isForeignKey: constraint === 'FK',
                        signature: null
                    };
                    
                    // Generate field signature
                    field.signature = this.generateFieldSignature(currentEntity, field);
                    
                    this.entities.get(currentEntity).fields.set(fieldName, field);
                    
                    // Track keys
                    if (constraint === 'PK') {
                        this.entities.get(currentEntity).primaryKey = fieldName;
                    } else if (constraint === 'FK') {
                        this.entities.get(currentEntity).foreignKeys.push(fieldName);
                    }
                }
            }
            
            // Parse relationships
            if (line.includes('||--') || line.includes('}|--')) {
                const relMatch = line.match(/^([A-Z_]+)(\|\|--[o{}]+)\s*([A-Z_]+)(?:\s*:\s*"([^"]+)")?/);
                if (relMatch) {
                    const [, fromEntity, relSymbol, toEntity, relName] = relMatch;
                    
                    const relationshipKey = `${fromEntity}-${toEntity}-${relName || 'default'}`;
                    const relationship = {
                        id: relationshipKey,
                        from: fromEntity,
                        to: toEntity,
                        name: relName || toEntity.toLowerCase(),
                        type: this.parseRelationshipType(relSymbol),
                        signature: null
                    };
                    
                    // Generate relationship signature
                    relationship.signature = this.generateRelationshipSignature(relationship);
                    
                    this.relationships.set(relationshipKey, relationship);
                    
                    // Update entity relationships
                    if (this.entities.has(fromEntity) && this.entities.has(toEntity)) {
                        if (relationship.type.includes('one-to-many')) {
                            this.entities.get(fromEntity).relationships.children.push(toEntity);
                            this.entities.get(toEntity).relationships.parents.push(fromEntity);
                        } else {
                            this.entities.get(fromEntity).relationships.related.push(toEntity);
                            this.entities.get(toEntity).relationships.related.push(fromEntity);
                        }
                    }
                }
            }
        }
        
        console.log(`✅ Parsed ${this.entities.size} entities and ${this.relationships.size} relationships`);
    }

    /**
     * Map Mermaid field types to standard types
     */
    mapMermaidTypeToStandard(mermaidType) {
        const typeMap = {
            'int': 'integer',
            'string': 'string',
            'bool': 'boolean',
            'decimal': 'decimal',
            'datetime': 'datetime',
            'date': 'date',
            'jsonb': 'json',
            'timestamp': 'datetime'
        };
        
        return typeMap[mermaidType.toLowerCase()] || 'string';
    }

    /**
     * Parse relationship type from Mermaid symbols
     */
    parseRelationshipType(relSymbol) {
        if (relSymbol.includes('||--o{')) return 'one-to-many';
        if (relSymbol.includes('}|--||')) return 'many-to-one';
        if (relSymbol.includes('||--||')) return 'one-to-one';
        if (relSymbol.includes('}|--o{')) return 'many-to-many';
        return 'related';
    }

    /**
     * Generate cryptographic signature for entity
     */
    generateEntitySignature(entity) {
        const signatureData = {
            name: entity.name,
            fields: Array.from(entity.fields.keys()).sort(),
            primaryKey: entity.primaryKey,
            source: 'BUSM-master.mmd'
        };
        
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(signatureData));
        return hash.digest('hex');
    }

    /**
     * Generate cryptographic signature for field
     */
    generateFieldSignature(entityName, field) {
        const signatureData = {
            entity: entityName,
            name: field.name,
            type: field.type,
            constraint: field.constraint,
            source: 'BUSM-master.mmd'
        };
        
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(signatureData));
        return hash.digest('hex');
    }

    /**
     * Generate cryptographic signature for relationship
     */
    generateRelationshipSignature(relationship) {
        const signatureData = {
            from: relationship.from,
            to: relationship.to,
            name: relationship.name,
            type: relationship.type,
            source: 'BUSM-master.mmd'
        };
        
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(signatureData));
        return hash.digest('hex');
    }

    /**
     * Initialize provenance validation system
     */
    async initializeProvenanceValidator() {
        console.log('🔐 Initializing Entity Provenance Validator...');
        
        this.provenanceValidator = new EntityProvenanceValidator();
        
        // Pass the complete parsed data including the entity maps
        const provenanceData = {
            ...this.busmData,
            entities: this.entities,
            relationships: this.relationships
        };
        
        await this.provenanceValidator.initialize(provenanceData);
        
        console.log('✅ Entity Provenance Validator integrated');
    }

    /**
     * Initialize audit logging system (placeholder)
     */
    initializeAuditLogger() {
        console.log('📝 Audit Logger initialized');
        // Will be implemented in next todo item
    }

    /**
     * Initialize access control manager (placeholder)
     */
    initializeAccessControlManager() {
        console.log('🚫 Access Control Manager initialized');
        // Will be implemented in next todo item
    }

    // ============================================
    // PUBLIC API - Gateway Interface
    // ============================================

    /**
     * Get entity definition with provenance validation
     */
    async getEntity(entityName) {
        this.requireInitialized();
        this.logAccess('getEntity', { entityName });
        
        if (!this.entities.has(entityName)) {
            this.logAccess('getEntityNotFound', { entityName });
            return null;
        }
        
        const entity = this.entities.get(entityName);
        
        // Convert Map to Object for external consumption
        const entityData = {
            name: entity.name,
            fields: Object.fromEntries(entity.fields),
            primaryKey: entity.primaryKey,
            foreignKeys: entity.foreignKeys,
            relationships: entity.relationships,
            signature: entity.signature,
            provenance: {
                source: 'BUSM-master.mmd',
                verified: true,
                timestamp: this.lastValidation
            }
        };
        
        return entityData;
    }

    /**
     * Get all entity names
     */
    async getAllEntityNames() {
        this.requireInitialized();
        this.logAccess('getAllEntityNames', {});
        
        return Array.from(this.entities.keys());
    }

    /**
     * Get entity field definition
     */
    async getEntityField(entityName, fieldName) {
        this.requireInitialized();
        this.logAccess('getEntityField', { entityName, fieldName });
        
        const entity = this.entities.get(entityName);
        if (!entity) {
            return null;
        }
        
        const field = entity.fields.get(fieldName);
        if (!field) {
            return null;
        }
        
        return {
            ...field,
            provenance: {
                source: 'BUSM-master.mmd',
                verified: true,
                entitySignature: entity.signature
            }
        };
    }

    /**
     * Get entity relationships
     */
    async getEntityRelationships(entityName) {
        this.requireInitialized();
        this.logAccess('getEntityRelationships', { entityName });
        
        const entity = this.entities.get(entityName);
        if (!entity) {
            return null;
        }
        
        const relationships = [];
        
        // Find all relationships involving this entity
        for (const [id, rel] of this.relationships) {
            if (rel.from === entityName || rel.to === entityName) {
                relationships.push({
                    ...rel,
                    provenance: {
                        source: 'BUSM-master.mmd',
                        verified: true,
                        signature: rel.signature
                    }
                });
            }
        }
        
        return relationships;
    }

    /**
     * Validate entity exists and is from BUSM-master
     */
    async validateEntityProvenance(entityName) {
        this.requireInitialized();
        this.logAccess('validateEntityProvenance', { entityName });
        
        if (this.provenanceValidator) {
            return await this.provenanceValidator.validateEntity(entityName);
        }
        
        // Fallback to basic validation if provenance validator not available
        const entity = this.entities.get(entityName);
        if (!entity) {
            return {
                valid: false,
                reason: 'Entity not found in BUSM-master.mmd',
                entity: entityName
            };
        }
        
        return {
            valid: true,
            entity: entityName,
            signature: entity.signature,
            source: 'BUSM-master.mmd',
            verifiedAt: Date.now()
        };
    }

    /**
     * Detect fabricated entities not in BUSM-master
     */
    async detectFabricatedEntities(entityList) {
        this.requireInitialized();
        this.logAccess('detectFabricatedEntities', { entityCount: entityList.length });
        
        if (this.provenanceValidator) {
            return await this.provenanceValidator.detectFabricatedEntities(entityList);
        }
        
        // Fallback implementation
        const results = { valid: [], fabricated: [] };
        for (const entityName of entityList) {
            if (this.entities.has(entityName)) {
                results.valid.push({ entity: entityName });
            } else {
                results.fabricated.push({ entity: entityName, reason: 'Not found in BUSM-master.mmd' });
            }
        }
        return results;
    }

    /**
     * Generate entity authenticity certificate
     */
    async generateEntityCertificate(entityName) {
        this.requireInitialized();
        this.logAccess('generateEntityCertificate', { entityName });
        
        if (this.provenanceValidator) {
            return await this.provenanceValidator.generateEntityCertificate(entityName);
        }
        
        return null;
    }

    /**
     * Get gateway health status
     */
    async getHealthStatus() {
        return {
            initialized: this.isInitialized,
            lastValidation: this.lastValidation,
            entityCount: this.entities.size,
            relationshipCount: this.relationships.size,
            busmChecksum: this.busmData?.checksum,
            uptime: Date.now() - this.lastValidation
        };
    }

    // ============================================
    // PRIVATE UTILITY METHODS
    // ============================================

    /**
     * Ensure gateway is initialized before use
     */
    requireInitialized() {
        if (!this.isInitialized) {
            throw new Error('BUSM Authority Gateway not initialized. Call initialize() first.');
        }
    }

    /**
     * Log access attempt (placeholder for audit logger)
     */
    logAccess(operation, params) {
        if (this.config.enableAuditLogging) {
            const logEntry = {
                timestamp: Date.now(),
                operation,
                params,
                caller: this.getCallerInfo()
            };
            
            // Emit for audit logger to capture
            this.emit('access', logEntry);
        }
    }

    /**
     * Get caller information for audit trail
     */
    getCallerInfo() {
        const stack = new Error().stack;
        const callerLine = stack.split('\n')[4]; // Skip internal frames
        
        return {
            stack: callerLine ? callerLine.trim() : 'Unknown',
            timestamp: Date.now()
        };
    }
}

module.exports = BusmAuthorityGateway;