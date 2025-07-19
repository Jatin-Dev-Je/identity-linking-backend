import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import identityRoutes from './routes/identity.routes';

// Import documentation
import { setupSwagger } from './docs/swagger';

// Import utilities
import { createErrorResponse } from './utils/response.util';

// Load environment variables
dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: createErrorResponse('Too many requests from this IP, please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// API documentation
setupSwagger(app);

// API routes
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`${apiPrefix}/${apiVersion}`, identityRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Bitespeed Identity Reconciliation API',
    data: {
      service: 'Bitespeed Identity Service',
      version: '1.0.0',
      documentation: '/api-docs',
      endpoints: {
        identify: `${apiPrefix}/${apiVersion}/identify`,
        health: `${apiPrefix}/${apiVersion}/health`,
      },
    },
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json(
    createErrorResponse(`Route ${req.originalUrl} not found`)
  );
});

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(500).json(
    createErrorResponse(
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    )
  );
});

export default app;
