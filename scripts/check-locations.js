const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://gketbzzsevhgxhnlcjzu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZXRienpzZXZoZ3hobmxjanp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTY0MDQsImV4cCI6MjA2ODE5MjQwNH0.Z5xUBHWouvUBj_DO2IBvCqFooi961x9L-DZudNYa0Ss'
)

async function checkLocations() {
  console.log('Checking service locations...\n')

  // Get some service locations
  const { data: locations, error } = await supabase
    .from('service_locations')
    .select('id, account_id, location_name')
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Sample Service Locations:')
  console.log('========================')
  locations.forEach((loc) => {
    console.log(`ID: ${loc.id}`)
    console.log(`Account ID: ${loc.account_id}`)
    console.log(`Name: ${loc.location_name}`)
    console.log('---')
  })

  console.log('\nSince work_orders table does not exist, the app uses MOCK DATA.')
  console.log('Mock data will appear for ANY selected service location.')
  console.log('\nTo see work orders:')
  console.log('1. Go to http://localhost:3000/accounts/master')
  console.log('2. Select any account (e.g., "Acme Corporation")')
  console.log('3. Select any service location')
  console.log('4. Mock work orders will appear in Column 3!')
}

checkLocations()
