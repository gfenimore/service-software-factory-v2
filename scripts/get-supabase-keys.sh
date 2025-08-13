#!/bin/bash
# Script to display Supabase project keys
# Run this to see what keys are available

echo "======================================"
echo "Supabase Project Keys"
echo "======================================"

# Check if we're linked to a project
if [ -f "supabase/.temp/project-ref" ]; then
    PROJECT_REF=$(cat supabase/.temp/project-ref)
    echo "Project Reference: $PROJECT_REF"
else
    echo "⚠️  No project linked. Run: supabase link --project-ref YOUR_PROJECT_ID"
fi

echo ""
echo "To get your actual service role key:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo "2. Look for 'service_role' under 'Project API keys'"
echo "3. This will be a JWT starting with 'eyJ...'"
echo ""
echo "Current keys in .env.local:"
echo "----------------------------"
grep "SUPABASE" .env.local | sed 's/=.*$/=.../' 

echo ""
echo "⚠️  IMPORTANT:"
echo "The service_role key is a JWT (starts with 'eyJ')"
echo "The sb_secret_ format is for Management API, not database access"