// src/scripts/seed-data.ts
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

type Account = Database['public']['Tables']['accounts']['Insert']
type Contact = Database['public']['Tables']['contacts']['Insert']
type Employee = Database['public']['Tables']['employees']['Insert']

// Sample data generators
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa', 'James', 'Mary']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
const businessSuffixes = ['Pest Control', 'Exterminators', 'Bug Busters', 'Pest Solutions', 'Pest Management']
const streetNames = ['Main St', 'Oak Ave', 'Elm Dr', 'Park Blvd', 'First St', 'Maple Ln', 'Cedar Rd', 'Pine Way']
const cities = ['Tampa', 'St. Petersburg', 'Clearwater', 'Brandon', 'Largo', 'Palm Harbor', 'Bradenton', 'Sarasota']

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generatePhone(): string {
  const area = ['813', '727', '941'][Math.floor(Math.random() * 3)]
  const prefix = Math.floor(Math.random() * 900) + 100
  const line = Math.floor(Math.random() * 9000) + 1000
  return `${area}-${prefix}-${line}`
}

function generateEmail(firstName: string, lastName: string, company?: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com']
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`,
  ]
  
  if (company) {
    const companyDomain = company.toLowerCase().replace(/\s+/g, '') + '.com'
    domains.push(companyDomain)
  }
  
  return `${randomElement(formats)}@${randomElement(domains)}`
}

async function seedDatabase() {
  console.log('🌱 Starting database seed...')
  
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
  try {
    // 1. Update domain name from "Boat" to "Marine Svcs"
    console.log('📝 Updating domain names...')
    const { error: domainUpdateError } = await supabase
      .from('domains')
      .update({ name: 'Marine Svcs' })
      .eq('name', 'Boat')
    
    if (domainUpdateError && domainUpdateError.code !== '23505') {
      throw domainUpdateError
    }
    
    // Get Pest Control domain ID
    const { data: pestControlDomain, error: domainError } = await supabase
      .from('domains')
      .select('id')
      .eq('name', 'Pest Control')
      .single()
    
    if (domainError || !pestControlDomain) {
      throw new Error('Pest Control domain not found')
    }
    
    // 2. Create Employees
    console.log('👥 Creating employees...')
    const employees: Employee[] = [
      {
        first_name: 'Tom',
        last_name: 'Anderson',
        email: 'tom.anderson@company.com',
        phone: '813-555-0101',
        employee_type: 'Technician'
      },
      {
        first_name: 'Sarah',
        last_name: 'Mitchell',
        email: 'sarah.mitchell@company.com',
        phone: '813-555-0102',
        employee_type: 'Supervisor'
      },
      {
        first_name: 'Mike',
        last_name: 'Chen',
        email: 'mike.chen@company.com',
        phone: '813-555-0103',
        employee_type: 'Technician'
      },
      {
        first_name: 'Jessica',
        last_name: 'Rivera',
        email: 'jessica.rivera@company.com',
        phone: '813-555-0104',
        employee_type: 'Inspector'
      }
    ]
    
    const { error: employeeError } = await supabase
      .from('employees')
      .insert(employees)
    
    if (employeeError) {
      console.error('Employee error:', employeeError)
    }
    
    // 3. Create Accounts and Contacts
    console.log('🏢 Creating accounts and contacts...')
    
    for (let i = 1; i <= 20; i++) {
      // Generate account
      const accountType = i <= 15 ? 'Commercial' : 'Residential'
      const businessName = accountType === 'Commercial' 
        ? `${randomElement(['ABC', 'XYZ', 'Premier', 'First', 'Best'])} ${randomElement(businessSuffixes)}`
        : `${randomElement(lastNames)} Residence`
      
      const account: Account = {
        account_name: businessName,
        account_type: accountType,
        billing_street_address: `${Math.floor(Math.random() * 9000) + 1000} ${randomElement(streetNames)}`,
        billing_city: randomElement(cities),
        billing_state: 'FL',
        billing_zip_code: `336${Math.floor(Math.random() * 90) + 10}`,
        status: i <= 18 ? 'Active' : 'Inactive' // 90% active
      }
      
      // Insert account
      const { data: insertedAccount, error: accountError } = await supabase
        .from('accounts')
        .insert(account)
        .select()
        .single()
      
      if (accountError || !insertedAccount) {
        console.error(`Error creating account ${i}:`, accountError)
        continue
      }
      
      // Generate 1-3 contacts per account
      const contactCount = Math.floor(Math.random() * 3) + 1
      const contacts: Contact[] = []
      
      for (let j = 0; j < contactCount; j++) {
        const firstName = randomElement(firstNames)
        const lastName = randomElement(lastNames)
        
        contacts.push({
          account_id: insertedAccount.id,
          first_name: firstName,
          last_name: lastName,
          phone_number: generatePhone(),
          email_address: generateEmail(firstName, lastName, businessName),
          is_primary_contact: j === 0, // First contact is primary
          communication_preference: randomElement(['Email', 'Voice', 'Text'])
        })
      }
      
      // Insert contacts
      const { error: contactError } = await supabase
        .from('contacts')
        .insert(contacts)
      
      if (contactError) {
        console.error(`Error creating contacts for account ${i}:`, contactError)
      }
      
      console.log(`✅ Created account: ${businessName} with ${contactCount} contact(s)`)
    }
    
    // 4. Verify results
    console.log('\n📊 Verifying seed data...')
    
    const { count: accountCount } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
    
    const { count: contactCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
    
    const { count: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n✨ Seed complete!`)
    console.log(`   - Accounts: ${accountCount}`)
    console.log(`   - Contacts: ${contactCount}`)
    console.log(`   - Employees: ${employeeCount}`)
    console.log(`   - All accounts are in Pest Control domain`)
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

// Run the seed
seedDatabase()
  .then(() => {
    console.log('\n🎉 Database seeded successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })