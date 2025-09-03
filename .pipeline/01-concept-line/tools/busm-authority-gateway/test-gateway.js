#!/usr/bin/env node
/**
 * Test script for BUSM Authority Gateway
 */

const BusmAuthorityGateway = require('./busm-authority-gateway');
const path = require('path');

async function testGateway() {
    console.log('🧪 Testing BUSM Authority Gateway...\n');
    
    try {
        // Initialize gateway
        const gateway = new BusmAuthorityGateway({
            busmMasterPath: path.join(__dirname, '../../../../.pipeline/00-requirements/models/BUSM-master.mmd')
        });
        
        console.log('1. Testing Gateway Initialization...');
        await gateway.initialize();
        console.log('✅ Gateway initialized successfully\n');
        
        // Test health status
        console.log('2. Testing Health Status...');
        const health = await gateway.getHealthStatus();
        console.log(`   - Initialized: ${health.initialized}`);
        console.log(`   - Entity Count: ${health.entityCount}`);
        console.log(`   - Relationship Count: ${health.relationshipCount}`);
        console.log(`   - BUSM Checksum: ${health.busmChecksum}\n`);
        
        // Test entity access
        console.log('3. Testing Entity Access...');
        const entityNames = await gateway.getAllEntityNames();
        console.log(`   - Found ${entityNames.length} entities`);
        console.log(`   - Sample entities: ${entityNames.slice(0, 5).join(', ')}\n`);
        
        // Test specific entity retrieval
        console.log('4. Testing Specific Entity Retrieval...');
        const account = await gateway.getEntity('ACCOUNT');
        if (account) {
            console.log(`   - ACCOUNT entity loaded with ${Object.keys(account.fields).length} fields`);
            console.log(`   - Primary Key: ${account.primaryKey}`);
            console.log(`   - Signature: ${account.signature.substring(0, 16)}...`);
            console.log(`   - Provenance verified: ${account.provenance.verified}\n`);
        } else {
            console.log('   - ❌ Failed to load ACCOUNT entity\n');
        }
        
        // Test field access
        console.log('5. Testing Field Access...');
        const accountIdField = await gateway.getEntityField('ACCOUNT', 'AccountID');
        if (accountIdField) {
            console.log(`   - AccountID field: ${accountIdField.type} ${accountIdField.constraint || 'no constraint'}`);
            console.log(`   - Field signature: ${accountIdField.provenance ? 'verified' : 'missing'}\n`);
        }
        
        // Test relationships
        console.log('6. Testing Relationship Access...');
        const accountRels = await gateway.getEntityRelationships('ACCOUNT');
        console.log(`   - ACCOUNT has ${accountRels.length} relationships`);
        accountRels.slice(0, 3).forEach(rel => {
            console.log(`     - ${rel.from} ${rel.type} ${rel.to} (${rel.name})`);
        });
        console.log();
        
        // Test entity provenance validation
        console.log('7. Testing Entity Provenance Validation...');
        const provenanceValid = await gateway.validateEntityProvenance('WORK_ORDER');
        console.log(`   - WORK_ORDER provenance: ${provenanceValid.valid ? 'VALID' : 'INVALID'}`);
        if (provenanceValid.valid) {
            console.log(`   - Signature: ${provenanceValid.signature.substring(0, 16)}...`);
        }
        
        const provenanceInvalid = await gateway.validateEntityProvenance('FAKE_ENTITY');
        console.log(`   - FAKE_ENTITY provenance: ${provenanceInvalid.valid ? 'VALID' : 'INVALID'}`);
        if (!provenanceInvalid.valid) {
            console.log(`   - Reason: ${provenanceInvalid.reason}\n`);
        }
        
        console.log('✅ All BUSM Authority Gateway tests passed!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Gateway test failed:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Run test if called directly
if (require.main === module) {
    testGateway().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = testGateway;