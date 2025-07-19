@echo off
echo 🗄️ Setting up database for Bitespeed Identity Backend...

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker found - Setting up PostgreSQL container...
    
    REM Start PostgreSQL with Docker Compose
    docker-compose up -d
    
    REM Wait for database to be ready
    echo ⏳ Waiting for database to be ready...
    timeout /t 10 /nobreak >nul
    
    echo ✅ PostgreSQL container started!
    echo 📝 Database URL: postgresql://postgres:password@localhost:5432/bitespeed_identity
    
) else (
    echo ❌ Docker not found. Please choose another database option:
    echo 1. Install Docker and run this script again
    echo 2. Use a free cloud database (Neon, Supabase, Railway)
    echo 3. Install PostgreSQL locally
    echo.
    echo See DATABASE-SETUP.md for detailed instructions
    pause
    exit /b 1
)

REM Generate Prisma client and setup database
echo 🔧 Setting up Prisma and database schema...
call npm run db:generate
call npm run db:push

REM Seed with sample data
echo 🌱 Adding sample data...
call npm run db:seed

echo ✅ Database setup complete!
echo 🚀 You can now run: npm run dev
pause
