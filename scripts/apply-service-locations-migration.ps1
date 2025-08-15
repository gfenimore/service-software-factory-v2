# PowerShell script to apply service_locations migration to Supabase
# Run this script to create the service_locations table in your Supabase database

Write-Host "🚀 Applying service_locations migration to Supabase..." -ForegroundColor Green
Write-Host ""

# Check if supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it first: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a Supabase project
if (-not (Test-Path "supabase\config.toml")) {
    Write-Host "❌ No supabase\config.toml found." -ForegroundColor Red
    Write-Host "Please run 'supabase init' first or ensure you're in the project root." -ForegroundColor Yellow
    exit 1
}

# Apply the migration
Write-Host "📦 Applying migration: 20250114_create_service_locations.sql" -ForegroundColor Cyan
$result = supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The service_locations table has been created with:" -ForegroundColor Cyan
    Write-Host "  - All necessary columns"
    Write-Host "  - Indexes for performance"
    Write-Host "  - Row Level Security policies"
    Write-Host "  - Sample test data"
    Write-Host ""
    Write-Host "You can now reload the test page: " -NoNewline
    Write-Host "http://localhost:3000/test/us-006-integrated" -ForegroundColor Blue
} else {
    Write-Host "❌ Migration failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}