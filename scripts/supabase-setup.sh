#!/bin/bash
# Supabase Direct CLI Setup Script
# This bypasses MCP and uses Supabase CLI directly

# Configuration
SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-sb_secret_uhdqxf2WbtxgzqHOYkFWAw_LwBYWRlp}"
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID:-}"

echo "==================================="
echo "Supabase Direct CLI Configuration"
echo "==================================="

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Supabase CLI found at: $(which supabase)"

# Login to Supabase
echo "Logging in to Supabase..."
supabase login --token "$SUPABASE_ACCESS_TOKEN"

# List projects
echo -e "\nAvailable Projects:"
supabase projects list

# If project ID provided, link to it
if [ -n "$SUPABASE_PROJECT_ID" ]; then
    echo -e "\nLinking to project: $SUPABASE_PROJECT_ID"
    supabase link --project-ref "$SUPABASE_PROJECT_ID"
fi

echo -e "\n✅ Setup complete!"
echo "You can now use 'supabase db' commands directly"