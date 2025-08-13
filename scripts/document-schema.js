#!/usr/bin/env node

/**
 * Document current Supabase schema
 * This helps us understand what we're working with
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function documentSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('📊 Fetching current database schema...\n');

  // Query to get all table schemas
  const { data: tables, error } = await supabase.rpc('get_schema_info', {});
  
  // Alternative: Get table info using information_schema
  const { data: tableInfo, error: tableError } = await supabase
    .from('information_schema.columns')
    .select('table_name, column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .order('table_name', { ascending: true })
    .order('ordinal_position', { ascending: true });

  if (tableError) {
    // Fallback to basic queries
    console.log('Using fallback method to document schema...\n');
    
    const schema = {
      generated_at: new Date().toISOString(),
      tables: {}
    };

    // Known tables
    const knownTables = ['accounts', 'contacts', 'service_locations', 'work_orders'];
    
    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error && data && data.length > 0) {
          schema.tables[tableName] = {
            exists: true,
            columns: Object.keys(data[0]),
            sample: data[0]
          };
          console.log(`✅ Table: ${tableName}`);
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}\n`);
        } else {
          schema.tables[tableName] = {
            exists: false,
            error: error?.message
          };
          console.log(`❌ Table: ${tableName} - ${error?.message || 'Not found'}\n`);
        }
      } catch (err) {
        console.log(`❌ Table: ${tableName} - Error checking\n`);
      }
    }

    // Write to file
    const outputPath = path.join(process.cwd(), '.sdlc', '08-architecture', 'D-data-strategy', 'current-schema.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    
    console.log(`\n📄 Schema documented at: ${outputPath}`);
    
    // Also create a markdown version
    const mdPath = path.join(process.cwd(), '.sdlc', '08-architecture', 'D-data-strategy', 'CURRENT-SCHEMA.md');
    let markdown = `# Current Database Schema\n\nGenerated: ${new Date().toISOString()}\n\n`;
    
    for (const [tableName, info] of Object.entries(schema.tables)) {
      markdown += `## Table: ${tableName}\n\n`;
      if (info.exists) {
        markdown += `**Status**: ✅ Exists\n\n`;
        markdown += `**Columns**:\n`;
        info.columns.forEach(col => {
          markdown += `- ${col}\n`;
        });
      } else {
        markdown += `**Status**: ❌ Missing or inaccessible\n`;
        if (info.error) markdown += `**Error**: ${info.error}\n`;
      }
      markdown += '\n---\n\n';
    }
    
    fs.writeFileSync(mdPath, markdown);
    console.log(`📄 Markdown schema at: ${mdPath}`);
  }
}

documentSchema().catch(console.error);