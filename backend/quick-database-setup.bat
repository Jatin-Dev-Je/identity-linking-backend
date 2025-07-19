@echo off
echo Simple PostgreSQL Setup for Bitespeed
echo ====================================
echo.

REM Add PostgreSQL to PATH
set "PATH=C:\Program Files\PostgreSQL\16\bin;%PATH%"

echo This script will help you set up PostgreSQL for the Bitespeed project.
echo.
echo Option 1: If you know your postgres password, enter it when prompted
echo Option 2: If you don't know it, follow the password reset instructions
echo.

echo Attempting to create database...
echo.
echo Enter your postgres password when prompted:

REM Try to create database
createdb -U postgres -h localhost bitespeed_identity

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✓ Database 'bitespeed_identity' created successfully!
    echo.
    echo Now updating your .env file...
    echo.
    
    REM Update .env file
    echo DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/bitespeed_identity" > .env.local
    
    echo ✓ Created .env.local file with database connection string
    echo.
    echo IMPORTANT: Edit .env.local and replace 'YOUR_POSTGRES_PASSWORD' with your actual password
    echo Then copy the DATABASE_URL to your main .env file
    echo.
    echo Next steps:
    echo 1. Update .env file with correct DATABASE_URL
    echo 2. Run: npm run db:generate
    echo 3. Run: npm run db:push
    echo 4. Run: npm run dev
    
) else (
    echo.
    echo ❌ Failed to create database. This usually means:
    echo 1. Wrong password
    echo 2. PostgreSQL service not running
    echo 3. Permission issues
    echo.
    echo Please check the password or run reset-postgres-password.bat for help
)

echo.
pause
