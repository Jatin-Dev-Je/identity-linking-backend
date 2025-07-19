<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project: Bitespeed Identity Reconciliation Backend

This is a Node.js TypeScript backend service that implements identity reconciliation for customer contact information. The service helps link different contact details (email, phone) to the same customer across multiple purchases.

### Architecture
- **Pattern**: MCP (Model-Controller-Provider) architecture
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Documentation**: OpenAPI/Swagger

### Key Components
- **Models** (`src/models/`): TypeScript interfaces and data types
- **Controllers** (`src/controllers/`): HTTP request/response handling
- **Providers** (`src/providers/`): Business logic and data operations
- **Routes** (`src/routes/`): Express route definitions
- **Config** (`src/config/`): Database and application configuration

### Business Logic
The core identity reconciliation logic follows these rules:
1. Link contacts that share email OR phone number
2. Maintain primary/secondary hierarchy (oldest contact becomes primary)
3. Handle complex merging when separate primary contacts need to be linked
4. Create secondary contacts when new information is provided for existing customers

### Code Style Guidelines
- Use strict TypeScript with proper type safety
- Follow async/await pattern for database operations
- Include comprehensive error handling
- Use Prisma for all database operations
- Maintain consistent API response format using utility functions
- Include JSDoc comments for complex business logic

### Database Schema
The Contact model has these key fields:
- `id`: Primary key
- `email`: Optional customer email
- `phoneNumber`: Optional customer phone
- `linkedId`: Reference to primary contact (null for primary contacts)
- `linkPrecedence`: Either "primary" or "secondary"
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps

### API Endpoints
- `POST /api/v1/identify`: Main identity reconciliation endpoint
- `GET /api/v1/health`: Health check endpoint
- `GET /api-docs`: Swagger documentation

When working with this codebase:
- Always ensure type safety with proper null checks
- Use the existing utility functions for consistent responses
- Follow the established error handling patterns
- Maintain the MCP architecture separation
- Include proper Swagger documentation for new endpoints
