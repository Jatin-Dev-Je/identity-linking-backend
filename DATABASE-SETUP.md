# 🗄️ Database Setup Guide

## Quick Start: Choose Your Database Option

### Option 1: Docker PostgreSQL (Local Development) ⚡
```bash
# Start PostgreSQL container
docker-compose up -d

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://postgres:password@localhost:5432/bitespeed_identity"
```

### Option 2: Free Cloud PostgreSQL Databases ☁️

#### A) Neon (Recommended - Free PostgreSQL)
1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string
5. Use it as your DATABASE_URL

#### B) Supabase (Free PostgreSQL)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Use it as your DATABASE_URL

#### C) Railway PostgreSQL
1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy DATABASE_URL from variables

### Option 3: Local PostgreSQL Installation

#### Windows:
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql

# Create database
psql -U postgres
CREATE DATABASE bitespeed_identity;
```

#### macOS:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb bitespeed_identity
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb bitespeed_identity
```

## 🚀 Setup Steps

### 1. Choose and Setup Database
Pick one option above and get your DATABASE_URL

### 2. Update Environment Variables
```bash
# Update your .env file
DATABASE_URL="your-database-url-here"
NODE_ENV=development
PORT=3000
```

### 3. Run Database Setup
```bash
# Generate Prisma client and setup database
npm run db:generate
npm run db:push

# Optional: Add sample data
npm run db:seed
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm run build && npm start
```

## ✅ Verify Database Connection

The server will show this on startup if database connection is successful:
```
✅ Database connected successfully
🚀 Server is running on port 3000
```

## 🧪 Test the API

```bash
curl -X POST http://localhost:3000/api/v1/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "123456"}'
```

## 🆘 Troubleshooting

### Common Issues:
1. **"Database connection failed"** - Check your DATABASE_URL
2. **"Port 5432 already in use"** - Another PostgreSQL is running
3. **"Permission denied"** - Check database credentials
4. **"Database doesn't exist"** - Create the database first

### Quick Fix Commands:
```bash
# Reset database
npm run db:push --force-reset

# Check database status
npm run db:studio
```
