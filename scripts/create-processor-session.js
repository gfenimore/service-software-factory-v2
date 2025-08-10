#!/usr/bin/env node

/**
 * Script to create a new processor session record in Supabase
 * This creates a record with the specified details for US-001, T-001
 */

// For Node.js environment, we'll use the createClient from ssr
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Try to load environment variables from .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    for (const line of lines) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
} catch (error) {
  console.warn('Could not load .env.local file:', error.message)
}

async function createProcessorSession() {
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    console.log('Creating new processor session...')

    // Insert the new processor session
    const { data, error } = await supabase
      .from('processor_sessions')
      .insert({
        user_story: 'US-001',
        task_id: 'T-001',
        current_processor: 'TYPE-PROCESSOR',
        session_type: 'manual',
        status: 'started',
        processors_completed: 0,
        processors_total: 8,
        created_by: 'system',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating processor session:', error)
      process.exit(1)
    }

    console.log('✅ Successfully created processor session!')
    console.log('Session details:')
    console.log(`  ID: ${data.id}`)
    console.log(`  User Story: ${data.user_story}`)
    console.log(`  Task ID: ${data.task_id}`)
    console.log(`  Current Processor: ${data.current_processor}`)
    console.log(`  Session Type: ${data.session_type}`)
    console.log(`  Status: ${data.status}`)
    console.log(`  Processors Completed: ${data.processors_completed}`)
    console.log(`  Processors Total: ${data.processors_total}`)
    console.log(`  Created By: ${data.created_by}`)
    console.log(`  Started At: ${data.started_at}`)
    console.log(`  Created At: ${data.created_at}`)

    return data.id
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

// Run the script if called directly
if (require.main === module) {
  createProcessorSession()
    .then(sessionId => {
      console.log(`\n🎉 New processor session created with ID: ${sessionId}`)
      process.exit(0)
    })
    .catch(err => {
      console.error('Script failed:', err)
      process.exit(1)
    })
}

module.exports = { createProcessorSession }