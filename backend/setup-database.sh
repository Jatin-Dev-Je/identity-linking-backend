#!/bin/bash

echo "🗄️ Setting up database for Bitespeed Identity Backend..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found - Setting up PostgreSQL container..."
    
    # Start PostgreSQL with Docker Compose
    docker-compose up -d
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    echo "✅ PostgreSQL container started!"
    echo "📝 Database URL: postgresql://postgres:password@localhost:5432/bitespeed_identity"
    
else
    echo "❌ Docker not found. Please choose another database option:"
    echo "1. Install Docker and run this script again"
    echo "2. Use a free cloud database (Neon, Supabase, Railway)"
    echo "3. Install PostgreSQL locally"
    echo ""
    echo "See DATABASE-SETUP.md for detailed instructions"
    exit 1
fi

# Generate Prisma client and setup database
echo "🔧 Setting up Prisma and database schema..."
npm run db:generate
npm run db:push

# Seed with sample data
echo "🌱 Adding sample data..."
npm run db:seed

echo "✅ Database setup complete!"
echo "🚀 You can now run: npm run dev"
