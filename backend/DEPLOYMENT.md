# Production Deployment Guide

## Render Deployment

### 1. Setup Database
1. Create a PostgreSQL database on Render
2. Copy the DATABASE_URL from your Render PostgreSQL service

### 2. Deploy Application
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use these settings:
   - **Build Command**: `npm install && npm run build && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

### 3. Environment Variables
Set these in Render dashboard:
```
DATABASE_URL=<your-render-postgresql-url>
NODE_ENV=production
PORT=10000
```

## Railway Deployment

### 1. Setup
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway new`

### 2. Database
1. Add PostgreSQL service: `railway add postgresql`
2. Get DATABASE_URL: `railway variables`

### 3. Deploy
```bash
railway up
```

## Local Production Testing

### 1. Setup PostgreSQL
```bash
# Install PostgreSQL locally or use Docker
docker run --name bitespeed-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bitespeed_identity -p 5432:5432 -d postgres:15
```

### 2. Environment Setup
```bash
# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bitespeed_identity"
NODE_ENV=production
```

### 3. Database Setup
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start Production Server
```bash
npm run build
npm start
```

## API Testing

### Test Identity Endpoint
```bash
curl -X POST http://localhost:3000/api/v1/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "123456"}'
```

### Expected Response
```json
{
  "success": true,
  "message": "Contact identified successfully",
  "data": {
    "contact": {
      "primaryContactId": 1,
      "emails": ["test@example.com"],
      "phoneNumbers": ["123456"],
      "secondaryContactIds": []
    }
  }
}
```
