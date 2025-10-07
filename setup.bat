@echo off
echo ==================================
echo D^&D Initiative Tracker Setup
echo ==================================
echo.

echo Installing dependencies...
echo This may take a few minutes...
echo.

call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Dependencies installed successfully!
    echo.
    echo ==================================
    echo Next Steps:
    echo ==================================
    echo.
    echo 1. Set up MongoDB Atlas ^(free^):
    echo    - Go to https://www.mongodb.com/cloud/atlas/register
    echo    - Create a free account and M0 cluster
    echo    - Get your connection string
    echo.
    echo 2. Create .env.local file with:
    echo    MONGODB_URI=your-connection-string
    echo    JWT_SECRET=your-secret-key
    echo    NEXTAUTH_URL=http://localhost:3000
    echo.
    echo 3. Run the development server:
    echo    npm run dev
    echo.
    echo See SETUP.md for detailed instructions!
    echo.
) else (
    echo.
    echo ✗ Installation failed!
    echo Try running: npm install
    echo.
)

pause
