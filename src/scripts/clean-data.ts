// src/scripts/clean-data.ts
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Load .env.local file
config({ path: '.env.local' })

// Initialize Supabase client for scripts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...')
  
  const supabase = createClient<Database>(supabaseUrl!, supabaseKey!)
  
  try {
    // Delete in order to respect foreign key constraints
    console.log('🗑️  Deleting contacts...')
    const { error: contactError } = await supabase
      .from('contacts')
      .delete()
      .gt('created_at', '1970-01-01') // Delete all
    
    if (contactError) {
      console.error('Error deleting contacts:', contactError)
    }
    
    console.log('🗑️  Deleting accounts...')
    const { error: accountError } = await supabase
      .from('accounts')
      .delete()
      .gt('created_at', '1970-01-01') // Delete all
    
    if (accountError) {
      console.error('Error deleting accounts:', accountError)
    }
    
    console.log('🗑️  Deleting employees...')
    const { error: employeeError } = await supabase
      .from('employees')
      .delete()
      .gt('created_at', '1970-01-01') // Delete all
    
    if (employeeError) {
      console.error('Error deleting employees:', employeeError)
    }
    
    console.log('✨ Database cleaned!')
    
  } catch (error) {
    console.error('❌ Clean failed:', error)
    process.exit(1)
  }
}

// Run the cleanup
cleanDatabase()
  .then(() => {
    console.log('🎉 Database cleaned successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })