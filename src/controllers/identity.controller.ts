import { Request, Response } from 'express';
import { IdentityProvider } from '../providers/identity.provider';
import { IdentifyRequest } from '../models/contact.model';
import { createSuccessResponse, createErrorResponse } from '../utils/response.util';

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
      const { email, phoneNumber }: IdentifyRequest = req.body;

      // Validate input
      if (!email && !phoneNumber) {
        res.status(400).json(
          createErrorResponse('At least one of email or phoneNumber must be provided')
        );
        return;
      }

      // Validate email format if provided
      if (email && !this.isValidEmail(email)) {
        res.status(400).json(
          createErrorResponse('Invalid email format')
        );
        return;
      }

      // Validate phone number format if provided
      if (phoneNumber && !this.isValidPhoneNumber(phoneNumber)) {
        res.status(400).json(
          createErrorResponse('Invalid phone number format')
        );
        return;
      }

      // Process identity reconciliation
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
      res.status(200).json(
        createSuccessResponse('Service is healthy', {
          timestamp: new Date().toISOString(),
          service: 'Bitespeed Identity Service',
          version: '1.0.0'
        })
      );
    } catch (error) {
      console.error('Error in health check:', error);
      res.status(500).json(
        createErrorResponse('Service is unhealthy')
      );
    }
  };

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Allow various phone number formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 6;
  }
}
