# Setup script for D&D Initiative Tracker
# Run this in PowerShell

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "D&D Initiative Tracker Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

# Install dependencies using cmd to bypass execution policy
cmd /c "npm install"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Set up MongoDB Atlas (free):" -ForegroundColor Yellow
    Write-Host "   - Go to https://www.mongodb.com/cloud/atlas/register" -ForegroundColor Gray
    Write-Host "   - Create a free account and M0 cluster" -ForegroundColor Gray
    Write-Host "   - Get your connection string" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Create .env.local file with:" -ForegroundColor Yellow
    Write-Host "   MONGODB_URI=your-connection-string" -ForegroundColor Gray
    Write-Host "   JWT_SECRET=your-secret-key" -ForegroundColor Gray
    Write-Host "   NEXTAUTH_URL=http://localhost:3000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Run the development server:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "See SETUP.md for detailed instructions!" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Installation failed!" -ForegroundColor Red
    Write-Host "Try running: npm install" -ForegroundColor Yellow
    Write-Host ""
}
