import { Request, Response } from 'express';
import { IdentityProvider } from '../providers/identity.provider';
import { IdentifyRequest } from '../models/contact.model';
import { createSuccessResponse, createErrorResponse } from '../utils/response.util';
import { InputValidator } from '../utils/validation.util';

export class IdentityController {
  private identityProvider: IdentityProvider;

  constructor() {
    this.identityProvider = new IdentityProvider();
  }

  /**
   * Handle POST /identify requests
   */
  public identify = async (req: Request, res: Response): Promise<void> => {
    try {
      // Comprehensive validation and sanitization
      const validation = InputValidator.validateIdentifyRequest(req.body);
      
      if (!validation.isValid) {
        res.status(400).json(
          createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`)
        );
        return;
      }

      const { email, phoneNumber } = validation.sanitizedData!;

      // Process identity reconciliation with sanitized data
      const consolidatedContact = await this.identityProvider.identifyContact({
        email,
        phoneNumber,
      });

      // Return success response
      res.status(200).json(
        createSuccessResponse('Contact identified successfully', {
          contact: consolidatedContact
        })
      );

    } catch (error) {
      console.error('Error in identify controller:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        // Check for database connection errors
        if (error.message.includes('connect') || error.message.includes('connection')) {
          res.status(503).json(
            createErrorResponse('Database connection error. Please try again later.')
          );
          return;
        }
        
        // Check for validation errors from provider
        if (error.message.includes('validation') || error.message.includes('invalid')) {
          res.status(400).json(
            createErrorResponse(error.message)
          );
          return;
        }
      }
      
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  };

  /**
   * Health check endpoint
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      // Test database connection if using real Prisma
      let dbStatus = 'connected';
      try {
        // Simple database test - this will work with both mock and real database
        await this.identityProvider.testConnection();
      } catch (dbError) {
        dbStatus = 'disconnected';
        console.warn('Database connection test failed:', dbError);
      }

      res.status(200).json(
        createSuccessResponse('Service is healthy', {
          timestamp: new Date().toISOString(),
          service: 'Bitespeed Identity Service',
          version: '1.0.0',
          database: dbStatus,
          environment: process.env.NODE_ENV || 'development'
        })
      );
    } catch (error) {
      console.error('Error in health check:', error);
      res.status(500).json(
        createErrorResponse('Service is unhealthy')
      );
    }
  };
}
