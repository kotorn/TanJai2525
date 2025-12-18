# Production Deployment Script
# Run this to deploy TanJai POS to production

Write-Host "🚀 TanJai POS - Production Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
} else {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
}

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
} else {
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
}

Write-Host ""

# Step 2: Supabase Setup
Write-Host "Step 2: Setting up Supabase..." -ForegroundColor Yellow

$supabaseReady = Read-Host "Have you created a Supabase project? (y/n)"

if ($supabaseReady -eq "y") {
    $projectRef = Read-Host "Enter your Supabase project reference ID"
    
    Write-Host "Linking to Supabase project..." -ForegroundColor Cyan
    npx supabase link --project-ref $projectRef
    
    Write-Host "Applying database migrations..." -ForegroundColor Cyan
    npx supabase db push
    
    Write-Host "Seeding demo data..." -ForegroundColor Cyan
    $seedData = Read-Host "Seed demo data? (y/n)"
    if ($seedData -eq "y") {
        npx supabase db execute --file .\supabase\seed\demo_data.sql
    }
    
    Write-Host "✅ Supabase configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Please create a Supabase project at https://supabase.com" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit
}

Write-Host ""

# Step 3: Environment Variables
Write-Host "Step 3: Configuring environment variables..." -ForegroundColor Yellow

$supabaseUrl = Read-Host "Enter NEXT_PUBLIC_SUPABASE_URL (from Supabase dashboard)"
$supabaseAnonKey = Read-Host "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase dashboard)"

# Save to .env.production
$envContent = @"
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey

# LINE OAuth (optional - configure later if needed)
# NEXT_PUBLIC_LINE_OA_ID=@yourlineoa
# LINE_CHANNEL_ID=123456789
# LINE_CHANNEL_SECRET=xxx

# PromptPay (optional - configure merchant ID)
# NEXT_PUBLIC_PROMPTPAY_MERCHANT_ID=0000000000000

# App Config
NEXT_PUBLIC_APP_URL=https://tanjai-pos.vercel.app
"@

Set-Content -Path "apps\web\.env.production" -Value $envContent
Write-Host "✅ Environment variables saved to apps\web\.env.production" -ForegroundColor Green

Write-Host ""

# Step 4: Build Test
Write-Host "Step 4: Testing build..." -ForegroundColor Yellow
Set-Location apps\web
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
    exit
}

Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "Step 5: Deploying to Vercel..." -ForegroundColor Yellow

vercel login

Write-Host "Deploying to production..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit your production URL" -ForegroundColor White
Write-Host "2. Configure LINE OAuth in Supabase dashboard (if using)" -ForegroundColor White
Write-Host "3. Test all features with demo data" -ForegroundColor White
Write-Host "4. Run test suite: npm run test" -ForegroundColor White
Write-Host "5. Monitor Vercel and Supabase dashboards" -ForegroundColor White
Write-Host ""
Write-Host "Admin Dashboard: https://your-domain.vercel.app/admin" -ForegroundColor Cyan
Write-Host "Demo Pages: https://your-domain.vercel.app/demo/cart" -ForegroundColor Cyan
Write-Host ""
