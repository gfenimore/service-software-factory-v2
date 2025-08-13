#!/bin/bash
# Deploy Supabase Tables Script
# This script deploys the migration files to your Supabase database

echo "======================================"
echo "Supabase Table Deployment Script"
echo "======================================"

# Check if migrations directory exists
if [ ! -d "supabase/migrations" ]; then
    echo "❌ Error: supabase/migrations directory not found"
    exit 1
fi

echo "Found migration files:"
ls -la supabase/migrations/*.sql

echo -e "\n📋 This will create the following tables:"
echo "  1. contacts - Contact information for accounts"
echo "  2. service_locations - Service location addresses"  
echo "  3. work_orders - Work order tracking"

echo -e "\n⚠️  Prerequisites:"
echo "  1. Supabase CLI must be installed"
echo "  2. You must be logged in (supabase login)"
echo "  3. Project must be linked (supabase link --project-ref YOUR_PROJECT_ID)"

read -p "Continue with deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Deploy migrations
echo -e "\n🚀 Deploying migrations..."

for migration in supabase/migrations/*.sql; do
    filename=$(basename "$migration")
    echo -e "\nDeploying: $filename"
    
    # Option 1: Using supabase db push (if linked)
    # First, we need to copy the migration to the proper location
    cat "$migration" | supabase db push --linked
    
    # Option 2: Direct execution (requires connection string)
    # psql "$DATABASE_URL" -f "$migration"
done

echo -e "\n✅ Deployment complete!"
echo "You can verify the tables in your Supabase dashboard"