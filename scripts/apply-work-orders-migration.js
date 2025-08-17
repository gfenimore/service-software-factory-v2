const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Load from environment variables - security audit fix (CWE-798)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error(
    'Please ensure .env.local contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function applyMigration() {
  console.log('🚀 Applying work_orders table migration...\n')

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-work-orders-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📋 Migration script loaded')
    console.log('⚠️  WARNING: This will create the work_orders table and add sample data.')
    console.log('\nTo apply this migration:')
    console.log(
      '1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gketbzzsevhgxhnlcjzu'
    )
    console.log('2. Click on "SQL Editor" in the left sidebar')
    console.log('3. Click "New query"')
    console.log('4. Copy and paste the contents of scripts/create-work-orders-table.sql')
    console.log('5. Click "Run" to execute the migration')
    console.log('\n📄 SQL file location: scripts/create-work-orders-table.sql')

    // Test if table already exists
    const { data, error } = await supabase.from('work_orders').select('count').limit(1)

    if (!error) {
      console.log('\n✅ Table "work_orders" already exists!')
      const { count } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true })
      console.log(`📊 Current record count: ${count || 0}`)
    } else {
      console.log('\n❌ Table "work_orders" does not exist yet.')
      console.log('Please run the migration in Supabase Dashboard to create it.')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

applyMigration()
