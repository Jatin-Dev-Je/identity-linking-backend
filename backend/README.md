# Bitespeed Identity Reconciliation Backend

A robust Node.js backend service that implements identity reconciliation for customer contact information. This service helps link different contact details (email, phone) to the same customer across multiple purchases.

## 🚀 Live Demo

- **API Endpoint**: `https://your-app.onrender.com/api/v1/identify`
- **API Documentation**: `https://your-app.onrender.com/api-docs`
- **Health Check**: `https://your-app.onrender.com/api/v1/health`

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Examples](#examples)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

- **Identity Reconciliation**: Automatically links contacts with shared email or phone number
- **Primary/Secondary Hierarchy**: Maintains contact relationships with the oldest contact as primary
- **Smart Merging**: Handles complex scenarios where separate contact groups need to be merged
- **Comprehensive API**: RESTful API with detailed Swagger documentation
- **Type Safety**: Full TypeScript implementation
- **Database Integration**: PostgreSQL with Prisma ORM
- **Production Ready**: Security, rate limiting, logging, and error handling
- **MCP Architecture**: Clean separation with Model-Controller-Provider pattern

## 🛠 Tech Stack

- **Backend**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Documentation**: Swagger (OpenAPI) with swagger-ui-express
- **Architecture**: MCP (Model-Controller-Provider)
- **Deployment**: Render/Railway (free hosting)

## 🏗 Architecture

The project follows the MCP (Model-Controller-Provider) architecture:

```
src/
├── models/          # Data models and TypeScript interfaces
├── controllers/     # Request/response handling
├── providers/       # Business logic and data operations
├── routes/          # Express route definitions
├── config/          # Database and app configuration
├── docs/            # API documentation setup
└── utils/           # Helper functions and utilities
```

## � Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Production Setup (Automated)
```bash
# Clone and setup
git clone <your-repo-url>
cd bitespeed-identity-backend

# Set your database URL
export DATABASE_URL="postgresql://username:password@localhost:5432/bitespeed_identity"

# Run automated production setup
npm run setup:production
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bitespeed-identity-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bitespeed_identity"
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## 🎯 Usage

### Quick Start

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Test the API**
   ```bash
   curl -X POST http://localhost:3000/api/v1/identify \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "phoneNumber": "123456"}'
   ```

3. **View API Documentation**
   
   Open `http://localhost:3000/api-docs` in your browser

## 📚 API Reference

### POST /api/v1/identify

Identifies and reconciles customer contact information.

**Request Body:**
```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact identified successfully",
  "data": {
    "contact": {
      "primaryContactId": 1,
      "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
      "phoneNumbers": ["123456"],
      "secondaryContactIds": [23]
    }
  }
}
```

### GET /api/v1/health

Health check endpoint to verify service status.

**Response:**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "timestamp": "2023-12-07T10:30:00.000Z",
    "service": "Bitespeed Identity Service",
    "version": "1.0.0"
  }
}
```

## 🗄 Database Schema

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phoneNumber VARCHAR(255),
  email VARCHAR(255),
  linkedId INTEGER REFERENCES contacts(id),
  linkPrecedence VARCHAR(20) NOT NULL, -- 'primary' or 'secondary'
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL
);
```

## 💡 Examples

### Scenario 1: New Customer
**Request:**
```json
{
  "email": "new@customer.com",
  "phoneNumber": "987654"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["new@customer.com"],
    "phoneNumbers": ["987654"],
    "secondaryContactIds": []
  }
}
```

### Scenario 2: Linking Contacts
**Existing Contact:**
```json
{
  "id": 1,
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456",
  "linkPrecedence": "primary"
}
```

**New Request:**
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

### Scenario 3: Merging Primary Contacts
When two separate primary contacts need to be linked, the older one remains primary.

## 🚀 Deployment

### Deploy to Render

1. **Create a new Web Service** on [Render](https://render.com)

2. **Connect your GitHub repository**

3. **Configure environment variables:**
   ```
   DATABASE_URL=<your-postgresql-url>
   NODE_ENV=production
   ```

4. **Build and Deploy:**
   - Build Command: `npm install && npm run build && npm run db:generate`
   - Start Command: `npm start`

### Deploy to Railway

1. **Connect to [Railway](https://railway.app)**

2. **Add PostgreSQL service**

3. **Configure environment variables:**
   ```
   DATABASE_URL=$DATABASE_URL
   NODE_ENV=production
   ```

4. **Deploy from GitHub repository**

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📊 Monitoring

- **Health Check**: `/api/v1/health`
- **API Documentation**: `/api-docs`
- **Database Studio**: `npm run db:studio` (development)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Code Structure

```
bitespeed-identity-backend/
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Sample data seeding
│
├── src/
│   ├── config/
│   │   └── db.config.ts        # Database connection
│   ├── models/
│   │   └── contact.model.ts    # TypeScript interfaces
│   ├── providers/
│   │   └── identity.provider.ts # Business logic
│   ├── controllers/
│   │   └── identity.controller.ts # Request handlers
│   ├── routes/
│   │   └── identity.routes.ts  # API routes
│   ├── docs/
│   │   └── swagger.ts          # API documentation
│   ├── utils/
│   │   └── response.util.ts    # Helper functions
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
│
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bitespeed for the interesting technical challenge
- The Node.js and TypeScript communities
- Prisma team for the excellent ORM

---

**Made with ❤️ for Bitespeed Backend Task**
# identity-linking-backend
