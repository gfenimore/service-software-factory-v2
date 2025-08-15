#!/bin/bash

# Script to apply service_locations table migration to Supabase
# Run this script to create the service_locations table in your Supabase database

echo "🚀 Applying service_locations migration to Supabase..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ No supabase/config.toml found."
    echo "Please run 'supabase init' first or ensure you're in the project root."
    exit 1
fi

# Apply the migration
echo "📦 Applying migration: 20250114_create_service_locations.sql"
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "The service_locations table has been created with:"
    echo "  - All necessary columns"
    echo "  - Indexes for performance"
    echo "  - Row Level Security policies"
    echo "  - Sample test data"
    echo ""
    echo "You can now reload the test page: http://localhost:3000/test/us-006-integrated"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi