# 🗄️ Complete Database Setup Guide

## Step 1: Get a Free PostgreSQL Database (Neon)

### Why Neon?
- ✅ 100% Free forever plan
- ✅ No credit card required
- ✅ Instant setup (2 minutes)
- ✅ PostgreSQL compatible
- ✅ Perfect for development and testing

### Setup Steps:

1. **Go to Neon Website**
   - Open: https://neon.tech
   - Click "Sign Up" (top right)

2. **Create Account**
   - Sign up with GitHub/Google/Email
   - No credit card needed!

3. **Create Database Project**
   - Click "Create a project"
   - Choose region (closest to you)
   - Database name: `bitespeed_identity`
   - Click "Create project"

4. **Get Connection String**
   - After project creation, you'll see a connection string
   - It looks like: `postgresql://username:password@hostname/database`
   - Copy this entire string!

5. **Update Your .env File**
   - Open your `.env` file in VS Code
   - Replace the DATABASE_URL with your Neon connection string

## Step 2: Configure Your Project

### Update .env File
```env
# Replace this line in your .env file:
DATABASE_URL="your-neon-connection-string-here"

# Example:
DATABASE_URL="postgresql://neondb_owner:abc123@ep-cool-lab-a1b2c3d4.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Alternative Options (if Neon doesn't work):

#### Option B: Supabase (Also Free)
1. Go to https://supabase.com
2. Sign up for free
3. Create new project
4. Go to Settings > Database
5. Copy "Connection string" (URI)
6. Use this as your DATABASE_URL

#### Option C: Railway (Free with GitHub)
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Add PostgreSQL service
5. Copy DATABASE_URL from Variables tab

## Step 3: Setup Database Schema

Run these commands in VS Code terminal:

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Create database tables
npm run db:push

# 3. Add sample data (optional)
npm run db:seed
```

## Step 4: Test Everything

```bash
# Test database connection
npm run db:test

# Start the server
npm run dev
```

## Step 5: Verify It's Working

Your terminal should show:
```
✅ Database connected successfully
🚀 Server is running on port 3000
📚 API Documentation: http://localhost:3000/api-docs
```

## 🧪 Test Your API

Open a new terminal and test:
```bash
curl -X POST http://localhost:3000/api/v1/identify \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"phoneNumber\": \"123456\"}"
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Database connection failed"**
   - Double-check your DATABASE_URL in .env
   - Make sure there are no extra spaces
   - Verify the database exists

2. **"Prisma client not generated"**
   ```bash
   npm run db:generate
   ```

3. **"Table doesn't exist"**
   ```bash
   npm run db:push
   ```

4. **"Port already in use"**
   - Change PORT in .env to 3001 or 4000

### Quick Reset:
```bash
# If something goes wrong, reset everything:
npm run db:push --force-reset
npm run db:seed
```

## ✅ Success Checklist

- [ ] Database created (Neon/Supabase/Railway)
- [ ] DATABASE_URL updated in .env
- [ ] Prisma client generated
- [ ] Database schema created
- [ ] Server starts without errors
- [ ] API responds to test requests

You're ready to go! 🚀
