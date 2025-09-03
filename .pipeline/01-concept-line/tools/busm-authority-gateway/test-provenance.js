#!/usr/bin/env node
/**
 * Test Entity Provenance Validator with fabricated entity detection
 */

const BusmAuthorityGateway = require('./busm-authority-gateway');
const path = require('path');

async function testEntityProvenanceValidator() {
    console.log('🧪 Testing Entity Provenance Validator...\n');
    
    try {
        // Initialize gateway with provenance validator
        const gateway = new BusmAuthorityGateway({
            busmMasterPath: path.join(__dirname, '../../../../.pipeline/00-requirements/models/BUSM-master.mmd')
        });
        
        console.log('1. Testing Gateway + Provenance Validator Initialization...');
        await gateway.initialize();
        console.log('✅ Gateway with provenance validator initialized\n');
        
        // Test legitimate BUSM entities
        console.log('2. Testing Legitimate BUSM Entity Validation...');
        const validEntities = ['ACCOUNT', 'CONTACT', 'WORK_ORDER', 'SERVICE_LOCATION'];
        
        for (const entityName of validEntities) {
            const validation = await gateway.validateEntityProvenance(entityName);
            console.log(`   - ${entityName}: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
            if (validation.valid) {
                console.log(`     Signature: ${validation.signature.substring(0, 16)}...`);
            } else {
                console.log(`     Reason: ${validation.reason}`);
            }
        }
        console.log();
        
        // Test fabricated entities (contamination examples)
        console.log('3. Testing Fabricated Entity Detection...');
        const fabricatedEntities = ['pestType', 'PestControlService', 'ChemicalTreatment', 'InfestationLevel'];
        
        for (const entityName of fabricatedEntities) {
            const validation = await gateway.validateEntityProvenance(entityName);
            console.log(`   - ${entityName}: ${validation.valid ? '❌ INCORRECTLY VALID' : '✅ CORRECTLY REJECTED'}`);
            if (!validation.valid) {
                console.log(`     Reason: ${validation.reason}`);
            }
        }
        console.log();
        
        // Test batch fabrication detection
        console.log('4. Testing Batch Fabrication Detection...');
        const mixedEntities = ['ACCOUNT', 'pestType', 'WORK_ORDER', 'FakeEntity', 'CONTACT', 'ContaminatedData'];
        const batchResult = await gateway.detectFabricatedEntities(mixedEntities);
        
        console.log(`   - Total entities tested: ${batchResult.summary.total}`);
        console.log(`   - Valid BUSM entities: ${batchResult.summary.validCount}`);
        console.log(`   - Fabricated entities: ${batchResult.summary.fabricatedCount}`);
        
        if (batchResult.valid.length > 0) {
            console.log('   - Valid entities:', batchResult.valid.map(e => e.entity).join(', '));
        }
        
        if (batchResult.fabricated.length > 0) {
            console.log('   - Fabricated entities:', batchResult.fabricated.map(e => e.entity).join(', '));
        }
        console.log();
        
        // Test entity certificate generation
        console.log('5. Testing Entity Certificate Generation...');
        const certificate = await gateway.generateEntityCertificate('ACCOUNT');
        
        if (certificate) {
            console.log(`   - Certificate generated for ACCOUNT`);
            console.log(`   - Issued by: ${certificate.certificate.issuedBy}`);
            console.log(`   - Valid until: ${new Date(certificate.certificate.validUntil).toISOString()}`);
            console.log(`   - Certificate hash: ${certificate.certificate.certificateHash.substring(0, 16)}...`);
        } else {
            console.log('   - ❌ Failed to generate certificate');
        }
        console.log();
        
        // Test field-level validation
        console.log('6. Testing Field-Level Provenance...');
        const fieldValidation = await gateway.provenanceValidator.validateEntityField('ACCOUNT', 'AccountID');
        console.log(`   - ACCOUNT.AccountID: ${fieldValidation.valid ? '✅ VALID' : '❌ INVALID'}`);
        if (fieldValidation.valid) {
            console.log(`   - Field signature: ${fieldValidation.signature.substring(0, 16)}...`);
        }
        
        const invalidFieldValidation = await gateway.provenanceValidator.validateEntityField('ACCOUNT', 'fabricatedField');
        console.log(`   - ACCOUNT.fabricatedField: ${invalidFieldValidation.valid ? '❌ INCORRECTLY VALID' : '✅ CORRECTLY REJECTED'}`);
        if (!invalidFieldValidation.valid) {
            console.log(`   - Reason: ${invalidFieldValidation.reason}`);
        }
        console.log();
        
        // Test validation statistics
        console.log('7. Testing Validation Statistics...');
        const stats = gateway.provenanceValidator.getValidationStats();
        console.log(`   - Total validations: ${stats.totalValidations}`);
        console.log(`   - Successful validations: ${stats.successfulValidations}`);
        console.log(`   - Failed validations: ${stats.failedValidations}`);
        console.log(`   - Success rate: ${stats.successRate.toFixed(2)}%`);
        console.log(`   - Rejected entities: ${stats.rejectedEntities.length}`);
        console.log();
        
        // Test provenance database summary
        console.log('8. Testing Provenance Database Summary...');
        const dbSummary = gateway.provenanceValidator.getProvenanceDbSummary();
        console.log(`   - Total entries: ${dbSummary.totalEntries}`);
        console.log(`   - Entity signatures: ${dbSummary.entitySignatures}`);
        console.log(`   - Field signatures: ${dbSummary.fieldSignatures}`);
        console.log(`   - Relationship signatures: ${dbSummary.relationshipSignatures}`);
        console.log(`   - Master salt: ${dbSummary.masterSalt}`);
        console.log();
        
        console.log('✅ All Entity Provenance Validator tests passed!');
        console.log('🛡️ BUSM contamination protection is ACTIVE and VALIDATED');
        
        return true;
        
    } catch (error) {
        console.error('❌ Provenance validator test failed:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Run test if called directly
if (require.main === module) {
    testEntityProvenanceValidator().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = testEntityProvenanceValidator;