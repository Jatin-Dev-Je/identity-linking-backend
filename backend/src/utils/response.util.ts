import { ApiResponse } from '../models/contact.model';

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(message: string, data?: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: string): ApiResponse<never> {
  return {
    success: false,
    message: 'Request failed',
    error,
  };
}

/**
 * Sanitize error messages for production
 */
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred while processing your request';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
}
