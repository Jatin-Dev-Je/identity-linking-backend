#!/bin/bash

# Production Setup Script
echo "🚀 Setting up Bitespeed Identity Backend for Production..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Update imports to use Prisma types
echo "🔄 Updating to use Prisma generated types..."
sed -i 's|// import { Contact } from '\''@prisma/client'\'';|import { Contact } from '\''@prisma/client'\'';|' src/providers/identity.provider.ts
sed -i '/\/\/ Temporary Contact type until Prisma client is generated/,/^}$/d' src/providers/identity.provider.ts

# Step 4: Build the project
echo "🏗️ Building project..."
npm run build

# Step 5: Setup database
echo "🗄️ Setting up database..."
npx prisma db push

echo "✅ Production setup complete!"
echo "🎯 You can now run: npm start"
