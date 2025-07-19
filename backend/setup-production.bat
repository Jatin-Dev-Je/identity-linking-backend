@echo off
echo 🚀 Setting up Bitespeed Identity Backend for Production...

REM Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Step 2: Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

REM Step 3: Build the project
echo 🏗️ Building project...
call npm run build

REM Step 4: Setup database
echo 🗄️ Setting up database...
call npx prisma db push

echo ✅ Production setup complete!
echo 🎯 You can now run: npm start
pause
