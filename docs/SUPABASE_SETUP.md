# Supabase Integration Setup Guide

## Overview
This guide will help you set up the Supabase integration for the Service Software Factory application. Once configured, the ContactDetailsModal and other features will use real database data instead of mock data.

## Prerequisites
- Supabase account and project
- Node.js 18+ installed
- Access to your Supabase project dashboard

## Step 1: Deploy Database Tables

### Option A: Using Supabase CLI
```bash
# 1. Install Supabase CLI (if not already installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link your project (get project ID from dashboard)
supabase link --project-ref YOUR_PROJECT_ID

# 4. Deploy migrations
supabase db push
```

### Option B: Using SQL Editor in Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `001_create_contacts_table.sql`
   - `002_create_service_locations_table.sql`
   - `003_create_work_orders_table.sql`
   - `004_sample_contact_data.sql` (optional test data)

### Option C: Using the Deployment Script
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run the deployment script
./scripts/deploy-supabase-tables.sh
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Get your credentials from Supabase:
   - Go to [Project Settings > API](https://supabase.com/dashboard/project/_/settings/api)
   - Copy the `Project URL` and `anon public` key

3. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Test the Integration

### 1. Start the development server:
```bash
npm run dev
```

### 2. Test the ContactDetailsModal:
Navigate to: http://localhost:3000/test/us-005-slice-1

Click on any account card to open the contact details modal. If everything is configured correctly:
- The modal will show "Loading contacts..." briefly
- Real contact data from the database will appear
- If no contacts exist, it will fall back to account data

### 3. Verify Database Connection:
Check the browser console and terminal for any error messages. Common issues:
- Invalid Supabase URL or key
- RLS (Row Level Security) policies blocking access
- Tables not created properly

## Step 4: Add Real Data

### Using the API:
```javascript
// POST to /api/accounts/[accountId]/contacts
const newContact = {
  first_name: "John",
  last_name: "Doe",
  title: "Manager",
  email: "john.doe@example.com",
  phone: "(555) 123-4567",
  is_primary: true,
  notes: "Primary contact for all matters"
}

fetch('/api/accounts/ACC-001234/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newContact)
})
```

### Using Supabase Dashboard:
1. Go to Table Editor in your Supabase dashboard
2. Select the `contacts` table
3. Click "Insert row" and add contact information

## Features Implemented

### ✅ ContactDetailsModal Integration
- Fetches real contacts from Supabase
- Shows loading state while fetching
- Falls back to account data if no contacts exist
- Displays error messages with fallback to cached data

### ✅ Database Schema
- **contacts** - Store contact information with RLS policies
- **service_locations** - Store service addresses
- **work_orders** - Track work orders and service requests

### ✅ API Routes
- `GET /api/accounts/[accountId]/contacts` - Fetch contacts
- `POST /api/accounts/[accountId]/contacts` - Create new contact

### ✅ React Hook
- `useContacts(accountId)` - Fetches contacts with loading and error states

## Troubleshooting

### "Failed to fetch contacts" error
1. Check that tables are created in Supabase
2. Verify environment variables are set correctly
3. Check RLS policies allow authenticated access

### No data showing
1. Ensure sample data was inserted (run migration 004)
2. Check that account_id matches between your app and database
3. Verify Supabase connection is working

### MCP Server Issues (Claude Code)
If you're using Claude Code and want MCP integration:
1. Update the access token in `mcp.json`
2. Restart Claude Code with:
   ```bash
   set SUPABASE_ACCESS_TOKEN=your_token && claude
   ```

## Next Steps

1. **Production Setup**:
   - Set up proper authentication
   - Configure RLS policies for your auth provider
   - Use service role key for admin operations

2. **Additional Features**:
   - Add contact editing functionality
   - Implement service location management
   - Create work order tracking UI

3. **Performance**:
   - Add caching with SWR or React Query
   - Implement optimistic updates
   - Set up database indexes for common queries

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the migration files in `/supabase/migrations/`
- Check API routes in `/src/app/api/accounts/`