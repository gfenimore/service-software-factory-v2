/**
 * Entity Provenance Validator - Cryptographic Verification System
 * 
 * Provides cryptographic signatures and validation for all BUSM entities
 * Detects and rejects non-BUSM entities (fabricated entities like "pestType")
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class EntityProvenanceValidator extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            algorithm: 'sha256',
            encoding: 'hex',
            enableTimestamps: options.enableTimestamps !== false,
            saltLength: options.saltLength || 32,
            ...options
        };
        
        // Provenance database
        this.provenanceDatabase = new Map();
        this.entitySignatures = new Map();
        this.fieldSignatures = new Map();
        this.relationshipSignatures = new Map();
        
        // Runtime state
        this.masterSalt = null;
        this.isInitialized = false;
        this.validationStats = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            rejectedEntities: []
        };
        
        console.log('🔐 Entity Provenance Validator initialized');
    }

    /**
     * Initialize the provenance validator with BUSM data
     */
    async initialize(busmData) {
        console.log('🚀 Initializing Entity Provenance Validator...');
        
        if (!busmData || !busmData.entities || !busmData.relationships) {
            throw new Error('Invalid BUSM data provided to provenance validator');
        }
        
        try {
            // Generate master salt for this BUSM instance
            this.masterSalt = this.generateMasterSalt(busmData.checksum);
            
            // Build provenance database
            await this.buildProvenanceDatabase(busmData);
            
            // Generate and store all entity signatures
            await this.generateEntitySignatures(busmData.entities);
            
            // Generate and store all relationship signatures
            await this.generateRelationshipSignatures(busmData.relationships);
            
            this.isInitialized = true;
            
            console.log('✅ Entity Provenance Validator initialized successfully');
            console.log(`   - ${this.entitySignatures.size} entity signatures generated`);
            console.log(`   - ${this.relationshipSignatures.size} relationship signatures generated`);
            console.log(`   - Master salt: ${this.masterSalt.substring(0, 16)}...`);
            
            this.emit('initialized', {
                entitySignatures: this.entitySignatures.size,
                relationshipSignatures: this.relationshipSignatures.size,
                masterSalt: this.masterSalt
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Provenance validator initialization failed:', error.message);
            this.emit('initializationFailed', error);
            throw error;
        }
    }

    /**
     * Generate master salt based on BUSM checksum
     */
    generateMasterSalt(busmChecksum) {
        const saltData = {
            source: 'BUSM-master.mmd',
            checksum: busmChecksum,
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        const hash = crypto.createHash(this.config.algorithm);
        hash.update(JSON.stringify(saltData));
        hash.update(crypto.randomBytes(this.config.saltLength));
        
        return hash.digest(this.config.encoding);
    }

    /**
     * Build comprehensive provenance database
     */
    async buildProvenanceDatabase(busmData) {
        console.log('🏗️ Building provenance database...');
        
        // Store BUSM metadata
        const entityCount = busmData.entities instanceof Map ? busmData.entities.size : Object.keys(busmData.entities || {}).length;
        const relationshipCount = busmData.relationships instanceof Map ? busmData.relationships.size : Object.keys(busmData.relationships || {}).length;
        
        this.provenanceDatabase.set('__BUSM_METADATA__', {
            checksum: busmData.checksum,
            loadedAt: busmData.loadedAt,
            source: 'BUSM-master.mmd',
            entityCount: entityCount,
            relationshipCount: relationshipCount,
            masterSalt: this.masterSalt
        });
        
        // Store each entity's provenance
        const entityMap = busmData.entities instanceof Map ? busmData.entities : new Map(Object.entries(busmData.entities || {}));
        
        for (const [entityName, entity] of entityMap) {
            const provenance = {
                name: entityName,
                source: 'BUSM-master.mmd',
                fieldCount: entity.fields ? (entity.fields instanceof Map ? entity.fields.size : Object.keys(entity.fields).length) : 0,
                primaryKey: entity.primaryKey,
                foreignKeys: entity.foreignKeys || [],
                signature: null, // Will be generated later
                verified: true,
                createdAt: Date.now()
            };
            
            this.provenanceDatabase.set(entityName, provenance);
        }
        
        console.log(`✅ Provenance database built with ${this.provenanceDatabase.size} entries`);
    }

    /**
     * Generate cryptographic signatures for all entities
     */
    async generateEntitySignatures(entities) {
        console.log('🔏 Generating entity signatures...');
        
        const entityMap = entities instanceof Map ? entities : new Map(Object.entries(entities || {}));
        
        for (const [entityName, entity] of entityMap) {
            const signature = this.generateEntitySignature(entityName, entity);
            this.entitySignatures.set(entityName, signature);
            
            // Update provenance database with signature
            const provenance = this.provenanceDatabase.get(entityName);
            if (provenance) {
                provenance.signature = signature.hash;
            }
            
            // Generate field signatures
            const fieldMap = entity.fields instanceof Map ? entity.fields : new Map(Object.entries(entity.fields || {}));
            for (const [fieldName, field] of fieldMap) {
                const fieldSig = this.generateFieldSignature(entityName, fieldName, field);
                const fieldKey = `${entityName}.${fieldName}`;
                this.fieldSignatures.set(fieldKey, fieldSig);
            }
        }
        
        console.log(`✅ Generated ${this.entitySignatures.size} entity signatures`);
    }

    /**
     * Generate cryptographic signatures for all relationships
     */
    async generateRelationshipSignatures(relationships) {
        console.log('🔗 Generating relationship signatures...');
        
        const relationshipMap = relationships instanceof Map ? relationships : new Map(Object.entries(relationships || {}));
        
        for (const [relId, relationship] of relationshipMap) {
            const signature = this.generateRelationshipSignature(relationship);
            this.relationshipSignatures.set(relId, signature);
        }
        
        console.log(`✅ Generated ${this.relationshipSignatures.size} relationship signatures`);
    }

    /**
     * Generate cryptographic signature for a specific entity
     */
    generateEntitySignature(entityName, entity) {
        const signatureData = {
            name: entityName,
            source: 'BUSM-master.mmd',
            primaryKey: entity.primaryKey,
            foreignKeys: entity.foreignKeys.sort(),
            fieldNames: entity.fields instanceof Map ? Array.from(entity.fields.keys()).sort() : Object.keys(entity.fields || {}).sort(),
            fieldCount: entity.fields instanceof Map ? entity.fields.size : Object.keys(entity.fields || {}).length,
            salt: this.masterSalt
        };
        
        const hash = crypto.createHash(this.config.algorithm);
        hash.update(JSON.stringify(signatureData, null, 0));
        
        const signature = {
            hash: hash.digest(this.config.encoding),
            algorithm: this.config.algorithm,
            data: signatureData,
            createdAt: Date.now()
        };
        
        return signature;
    }

    /**
     * Generate cryptographic signature for a specific field
     */
    generateFieldSignature(entityName, fieldName, field) {
        const signatureData = {
            entity: entityName,
            field: fieldName,
            type: field.type,
            constraint: field.constraint,
            isPrimaryKey: field.isPrimaryKey,
            isForeignKey: field.isForeignKey,
            source: 'BUSM-master.mmd',
            salt: this.masterSalt
        };
        
        const hash = crypto.createHash(this.config.algorithm);
        hash.update(JSON.stringify(signatureData, null, 0));
        
        return {
            hash: hash.digest(this.config.encoding),
            algorithm: this.config.algorithm,
            data: signatureData,
            createdAt: Date.now()
        };
    }

    /**
     * Generate cryptographic signature for a relationship
     */
    generateRelationshipSignature(relationship) {
        const signatureData = {
            from: relationship.from,
            to: relationship.to,
            name: relationship.name,
            type: relationship.type,
            source: 'BUSM-master.mmd',
            salt: this.masterSalt
        };
        
        const hash = crypto.createHash(this.config.algorithm);
        hash.update(JSON.stringify(signatureData, null, 0));
        
        return {
            hash: hash.digest(this.config.encoding),
            algorithm: this.config.algorithm,
            data: signatureData,
            createdAt: Date.now()
        };
    }

    // ============================================
    // VALIDATION API
    // ============================================

    /**
     * Validate entity authenticity and provenance
     */
    async validateEntity(entityName) {
        this.requireInitialized();
        this.validationStats.totalValidations++;
        
        const result = {
            entity: entityName,
            valid: false,
            reason: null,
            signature: null,
            provenance: null,
            validatedAt: Date.now()
        };
        
        try {
            // Check if entity exists in provenance database
            if (!this.provenanceDatabase.has(entityName)) {
                result.reason = `Entity '${entityName}' not found in BUSM-master.mmd`;
                result.valid = false;
                this.validationStats.failedValidations++;
                this.validationStats.rejectedEntities.push({
                    entity: entityName,
                    reason: result.reason,
                    timestamp: Date.now()
                });
                return result;
            }
            
            // Get entity signature
            const signature = this.entitySignatures.get(entityName);
            if (!signature) {
                result.reason = `No signature found for entity '${entityName}'`;
                result.valid = false;
                this.validationStats.failedValidations++;
                return result;
            }
            
            // Get provenance data
            const provenance = this.provenanceDatabase.get(entityName);
            
            // Validate signature integrity
            if (signature.hash !== provenance.signature) {
                result.reason = `Signature mismatch for entity '${entityName}'`;
                result.valid = false;
                this.validationStats.failedValidations++;
                return result;
            }
            
            // Entity is valid
            result.valid = true;
            result.signature = signature.hash;
            result.provenance = {
                source: provenance.source,
                verified: true,
                fieldCount: provenance.fieldCount,
                primaryKey: provenance.primaryKey,
                createdAt: provenance.createdAt
            };
            
            this.validationStats.successfulValidations++;
            
            this.emit('entityValidated', result);
            
            return result;
            
        } catch (error) {
            result.reason = `Validation error: ${error.message}`;
            result.valid = false;
            this.validationStats.failedValidations++;
            
            console.error(`❌ Entity validation failed for '${entityName}':`, error.message);
            return result;
        }
    }

    /**
     * Validate field authenticity and provenance
     */
    async validateEntityField(entityName, fieldName) {
        this.requireInitialized();
        
        const result = {
            entity: entityName,
            field: fieldName,
            valid: false,
            reason: null,
            signature: null,
            validatedAt: Date.now()
        };
        
        // First validate the entity
        const entityValidation = await this.validateEntity(entityName);
        if (!entityValidation.valid) {
            result.reason = `Parent entity invalid: ${entityValidation.reason}`;
            return result;
        }
        
        // Check field signature
        const fieldKey = `${entityName}.${fieldName}`;
        const fieldSignature = this.fieldSignatures.get(fieldKey);
        
        if (!fieldSignature) {
            result.reason = `Field '${fieldName}' not found in entity '${entityName}'`;
            result.valid = false;
            return result;
        }
        
        // Field is valid
        result.valid = true;
        result.signature = fieldSignature.hash;
        
        return result;
    }

    /**
     * Generate entity authenticity certificate
     */
    async generateEntityCertificate(entityName) {
        const validation = await this.validateEntity(entityName);
        
        if (!validation.valid) {
            return null;
        }
        
        const certificate = {
            entity: entityName,
            certificate: {
                issuedBy: 'BUSM Authority Gateway',
                issuedAt: Date.now(),
                validUntil: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                signature: validation.signature,
                provenance: validation.provenance,
                certificateHash: null
            }
        };
        
        // Generate certificate hash
        const certHash = crypto.createHash(this.config.algorithm);
        certHash.update(JSON.stringify(certificate.certificate, null, 0));
        certificate.certificate.certificateHash = certHash.digest(this.config.encoding);
        
        return certificate;
    }

    /**
     * Detect fabricated entities (not in BUSM-master)
     */
    async detectFabricatedEntities(entityList) {
        this.requireInitialized();
        
        const results = {
            valid: [],
            fabricated: [],
            summary: {
                total: entityList.length,
                validCount: 0,
                fabricatedCount: 0
            }
        };
        
        for (const entityName of entityList) {
            const validation = await this.validateEntity(entityName);
            
            if (validation.valid) {
                results.valid.push({
                    entity: entityName,
                    signature: validation.signature
                });
                results.summary.validCount++;
            } else {
                results.fabricated.push({
                    entity: entityName,
                    reason: validation.reason
                });
                results.summary.fabricatedCount++;
            }
        }
        
        if (results.summary.fabricatedCount > 0) {
            console.warn(`⚠️ Detected ${results.summary.fabricatedCount} fabricated entities:`, 
                        results.fabricated.map(f => f.entity));
        }
        
        return results;
    }

    /**
     * Get validation statistics
     */
    getValidationStats() {
        return {
            ...this.validationStats,
            successRate: this.validationStats.totalValidations > 0 
                ? (this.validationStats.successfulValidations / this.validationStats.totalValidations) * 100 
                : 0
        };
    }

    /**
     * Get provenance database summary
     */
    getProvenanceDbSummary() {
        const metadata = this.provenanceDatabase.get('__BUSM_METADATA__');
        
        return {
            isInitialized: this.isInitialized,
            totalEntries: this.provenanceDatabase.size - 1, // Exclude metadata entry
            entitySignatures: this.entitySignatures.size,
            fieldSignatures: this.fieldSignatures.size,
            relationshipSignatures: this.relationshipSignatures.size,
            masterSalt: this.masterSalt ? this.masterSalt.substring(0, 16) + '...' : null,
            busmMetadata: metadata
        };
    }

    // ============================================
    // PRIVATE UTILITY METHODS
    // ============================================

    /**
     * Ensure validator is initialized before use
     */
    requireInitialized() {
        if (!this.isInitialized) {
            throw new Error('Entity Provenance Validator not initialized. Call initialize() first.');
        }
    }
}

module.exports = EntityProvenanceValidator;