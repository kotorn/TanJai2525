# TanJai POS - Private AI Diagnostic Tool
# This script helps verify your local AI setup (Ollama + Cloudflare)

Write-Host "--- TanJai POS: Private AI Diagnostic ---" -ForegroundColor Cyan

# 1. Check Ollama
Write-Host "[1/3] Checking Ollama..." -NoNewline
try {
    $response = curl.exe -s http://localhost:11434/api/tags | ConvertFrom-Json
    Write-Host " OK" -ForegroundColor Green
    Write-Host " Models found: " -NoNewline
    $response.models | ForEach-Object { Write-Host "$($_.name) " -NoNewline -ForegroundColor Yellow }
    Write-Host ""
} catch {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host " >> Please make sure Ollama is running on port 11434." -ForegroundColor Gray
}

# 2. Check Cloudflared
Write-Host "[2/3] Checking Cloudflared..." -NoNewline
if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
    Write-Host " OK" -ForegroundColor Green
    $version = cloudflared --version
    Write-Host " $version" -ForegroundColor Gray
} else {
    Write-Host " NOT FOUND" -ForegroundColor Yellow
    Write-Host " >> Please install cloudflared from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/" -ForegroundColor Gray
}

# 3. Check .env.local Configuration
Write-Host "[3/3] Checking TanJai POS config..." -NoNewline
$envPath = "apps/web/.env.local"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    if ($envContent -match "OLLAMA_API_URL=") {
        Write-Host " OK" -ForegroundColor Green
        $urlLine = $envContent | Select-String "OLLAMA_API_URL="
        Write-Host " Found: $urlLine" -ForegroundColor Gray
    } else {
        Write-Host " MISSING" -ForegroundColor Red
        Write-Host " >> Please add OLLAMA_API_URL to $envPath" -ForegroundColor Gray
    }
} else {
    Write-Host " .env.local NOT FOUND" -ForegroundColor Red
}

Write-Host "`n--- Diagnostic Complete ---" -ForegroundColor Cyan
Write-Host "Next Steps:"
Write-Host "1. Ensure llama3 and llama3.2-vision are pulled (ollama pull ...)"
Write-Host "2. Run 'cloudflared tunnel login' if not already done."
Write-Host "3. Update your OLLAMA_API_URL to your public tunnel address."
