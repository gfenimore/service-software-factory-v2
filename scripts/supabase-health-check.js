#!/usr/bin/env node

/**
 * Supabase Health Check Script
 * Tests connection and verifies tables exist
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Load environment variables
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

// Helper functions
const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.blue}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

async function checkSupabaseHealth() {
  log.header('🏥 Supabase Health Check');

  // Step 1: Load environment variables
  loadEnv();
  
  // Step 2: Check environment variables
  log.info('Checking environment variables...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log.error('Missing Supabase credentials in .env.local');
    log.info('Required variables:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return false;
  }
  
  log.success(`Supabase URL: ${supabaseUrl}`);
  log.success(`Anon Key: ${supabaseKey.substring(0, 20)}...`);

  // Step 3: Create Supabase client
  log.info('\nCreating Supabase client...');
  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    log.success('Supabase client created successfully');
  } catch (error) {
    log.error(`Failed to create client: ${error.message}`);
    return false;
  }

  // Step 4: Test connection and check tables
  log.info('\nChecking database tables...');
  
  const tables = ['contacts', 'service_locations', 'work_orders'];
  const results = {
    connection: false,
    tables: {},
    data: {}
  };

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(1);
      
      if (error) {
        if (error.message.includes('does not exist')) {
          log.error(`Table '${table}' does not exist`);
          results.tables[table] = false;
        } else {
          log.warning(`Table '${table}' exists but has access error: ${error.message}`);
          results.tables[table] = 'error';
        }
      } else {
        results.connection = true;
        results.tables[table] = true;
        
        // Count records
        const { count: totalCount } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        results.data[table] = totalCount || 0;
        log.success(`Table '${table}' exists with ${totalCount || 0} records`);
      }
    } catch (err) {
      log.error(`Error checking table '${table}': ${err.message}`);
      results.tables[table] = false;
    }
  }

  // Step 5: Test specific queries
  if (results.tables.contacts) {
    log.info('\nTesting contact queries...');
    try {
      // Test fetching contacts for a specific account
      const { data: testContacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('account_id', 'ACC-001234')
        .limit(5);
      
      if (!error && testContacts) {
        log.success(`Found ${testContacts.length} contacts for account ACC-001234`);
        if (testContacts.length > 0) {
          console.log('Sample contact:', {
            name: `${testContacts[0].first_name} ${testContacts[0].last_name}`,
            email: testContacts[0].email,
            is_primary: testContacts[0].is_primary
          });
        }
      }
    } catch (err) {
      log.warning(`Could not fetch test contacts: ${err.message}`);
    }
  }

  // Step 6: Summary
  log.header('📊 Health Check Summary');
  
  if (results.connection) {
    log.success('Database connection: OK');
  } else {
    log.error('Database connection: FAILED');
  }

  const tablesOk = Object.values(results.tables).filter(v => v === true).length;
  const tablesFailed = Object.values(results.tables).filter(v => v === false).length;
  const tablesError = Object.values(results.tables).filter(v => v === 'error').length;
  
  console.log(`\nTables Status:`);
  console.log(`  ✅ Working: ${tablesOk}/${tables.length}`);
  if (tablesFailed > 0) console.log(`  ❌ Missing: ${tablesFailed}`);
  if (tablesError > 0) console.log(`  ⚠️  Access errors: ${tablesError}`);

  // Step 7: Recommendations
  if (tablesFailed > 0) {
    log.header('🔧 Recommended Actions');
    log.info('Tables are missing. You need to create them:');
    console.log('1. Go to your Supabase Dashboard SQL Editor');
    console.log('2. Run the migration files in order:');
    console.log('   - 001_create_contacts_table.sql');
    console.log('   - 002_create_service_locations_table.sql');
    console.log('   - 003_create_work_orders_table.sql');
    console.log('   - 004_sample_contact_data.sql (optional)');
    console.log('\nOr use the Supabase CLI with your database password:');
    console.log('   supabase db push --password YOUR_DB_PASSWORD');
  } else if (tablesOk === tables.length) {
    log.header('🎉 All Systems Operational!');
    log.success('Your Supabase integration is fully configured and working.');
    log.info('You can now test the ContactDetailsModal at:');
    console.log('   http://localhost:3000/test/us-005-slice-1');
  }

  return results.connection && tablesOk > 0;
}

// Run the health check
checkSupabaseHealth()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    log.error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });