# 🗄️ PostgreSQL Setup for Bitespeed Identity Backend

## Current Issue
- Prisma client generation failing due to network connectivity
- Need PostgreSQL database for the identity reconciliation service

## Quick Solution: Free Cloud PostgreSQL

### Step 1: Get Free PostgreSQL Database

#### Option A: Neon (Recommended)
1. Go to: https://neon.tech
2. Sign up for free (no credit card required)
3. Create new project: "bitespeed-identity"
4. Copy the connection string

#### Option B: Supabase
1. Go to: https://supabase.com
2. Create free account
3. New project → Settings → Database
4. Copy connection string

#### Option C: Railway
1. Go to: https://railway.app  
2. Sign up with GitHub
3. New project → Add PostgreSQL
4. Copy DATABASE_URL from variables

### Step 2: Update Environment
Once you have your PostgreSQL connection string:

```bash
# Update .env file
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"
```

### Step 3: Alternative Setup (If Prisma Issues Persist)

If Prisma continues to have issues, we can use a different approach:

1. **Use pg (node-postgres) directly** instead of Prisma
2. **Manual SQL setup** for the Contact table
3. **Keep the same API logic** but with different database layer

## PostgreSQL Schema
```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(255),
  email VARCHAR(255),
  linked_id INTEGER REFERENCES contacts(id),
  link_precedence VARCHAR(20) NOT NULL CHECK (link_precedence IN ('primary', 'secondary')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone_number);
CREATE INDEX idx_contacts_linked_id ON contacts(linked_id);
```

## Next Steps
1. Choose a PostgreSQL provider above
2. Get your DATABASE_URL
3. I'll help configure the connection
4. Test the identity reconciliation API

Which PostgreSQL option would you like to use?
