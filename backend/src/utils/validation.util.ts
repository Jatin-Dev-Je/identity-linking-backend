/**
 * Input validation and sanitization utilities
 * Provides comprehensive validation for email and phone number inputs
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  error?: string;
}

export class InputValidator {
  /**
   * Validate and sanitize email address
   */
  static validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email must be a non-empty string' };
    }

    // Basic sanitization - trim whitespace and convert to lowercase
    const sanitized = email.trim().toLowerCase();

    // Check for minimum length
    if (sanitized.length < 5) {
      return { isValid: false, error: 'Email must be at least 5 characters long' };
    }

    // Check for maximum length (RFC 5321 specifies 320 characters max)
    if (sanitized.length > 320) {
      return { isValid: false, error: 'Email must be less than 320 characters' };
    }

    // Enhanced email regex that covers most valid email formats
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(sanitized)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Additional checks
    const parts = sanitized.split('@');
    if (parts.length !== 2) {
      return { isValid: false, error: 'Email must contain exactly one @ symbol' };
    }

    const [localPart, domainPart] = parts;

    // Check local part (before @)
    if (localPart && localPart.length > 64) {
      return { isValid: false, error: 'Email local part must be less than 64 characters' };
    }

    // Check domain part (after @)
    if (domainPart && domainPart.length > 253) {
      return { isValid: false, error: 'Email domain part must be less than 253 characters' };
    }

    // Check for valid domain structure
    const domainParts = domainPart ? domainPart.split('.') : [];
    if (domainParts.length < 2 || domainParts.some(part => part.length === 0)) {
      return { isValid: false, error: 'Invalid domain format' };
    }

    return { isValid: true, sanitizedValue: sanitized };
  }

  /**
   * Validate and sanitize phone number
   */
  static validatePhoneNumber(phoneNumber: string): ValidationResult {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return { isValid: false, error: 'Phone number must be a non-empty string' };
    }

    // Basic sanitization - trim whitespace
    const trimmed = phoneNumber.trim();

    // Remove all non-digit characters for validation
    const digitsOnly = trimmed.replace(/\D/g, '');

    // Check for minimum length (at least 6 digits for short codes)
    if (digitsOnly.length < 6) {
      return { isValid: false, error: 'Phone number must contain at least 6 digits' };
    }

    // Check for maximum length (E.164 format allows up to 15 digits)
    if (digitsOnly.length > 15) {
      return { isValid: false, error: 'Phone number must contain at most 15 digits' };
    }

    // Check for common phone number patterns
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{6,20}$/;
    if (!phoneRegex.test(trimmed)) {
      return { isValid: false, error: 'Phone number contains invalid characters' };
    }

    // Sanitize: standardize format (keep only digits and leading +)
    let sanitized = digitsOnly;
    if (trimmed.startsWith('+')) {
      sanitized = '+' + digitsOnly;
    }

    // Additional validation for common formats
    if (sanitized.startsWith('+1') && digitsOnly.length === 11) {
      // US/Canada format
      return { isValid: true, sanitizedValue: sanitized };
    } else if (sanitized.startsWith('+91') && digitsOnly.length === 12) {
      // India format
      return { isValid: true, sanitizedValue: sanitized };
    } else if (sanitized.startsWith('+44') && digitsOnly.length === 12) {
      // UK format
      return { isValid: true, sanitizedValue: sanitized };
    } else if (!sanitized.startsWith('+') && digitsOnly.length === 10) {
      // Assume US domestic format without country code
      sanitized = '+1' + digitsOnly;
      return { isValid: true, sanitizedValue: sanitized };
    } else if (!sanitized.startsWith('+') && digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      // US format with leading 1 but no +
      sanitized = '+' + digitsOnly;
      return { isValid: true, sanitizedValue: sanitized };
    }

    // For other international formats, accept if within valid length range
    if (digitsOnly.length >= 6 && digitsOnly.length <= 15) {
      return { isValid: true, sanitizedValue: sanitized };
    }

    return { isValid: false, error: 'Invalid phone number format' };
  }

  /**
   * Validate request payload for identity endpoint
   */
  static validateIdentifyRequest(payload: any): {
    isValid: boolean;
    sanitizedData?: { email?: string; phoneNumber?: string };
    errors: string[];
  } {
    const errors: string[] = [];
    const sanitizedData: { email?: string; phoneNumber?: string } = {};

    // Check if payload exists
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, errors: ['Request body must be a valid JSON object'] };
    }

    // Check if at least one field is provided
    if (!payload.email && !payload.phoneNumber) {
      return { isValid: false, errors: ['At least one of email or phoneNumber must be provided'] };
    }

    // Validate email if provided
    if (payload.email !== undefined) {
      if (payload.email === null || payload.email === '') {
        // Allow null/empty email but don't include it in sanitized data
      } else {
        const emailValidation = this.validateEmail(payload.email);
        if (!emailValidation.isValid) {
          errors.push(`Email validation error: ${emailValidation.error}`);
        } else {
          sanitizedData.email = emailValidation.sanitizedValue;
        }
      }
    }

    // Validate phone number if provided
    if (payload.phoneNumber !== undefined) {
      if (payload.phoneNumber === null || payload.phoneNumber === '') {
        // Allow null/empty phone number but don't include it in sanitized data
      } else {
        const phoneValidation = this.validatePhoneNumber(payload.phoneNumber);
        if (!phoneValidation.isValid) {
          errors.push(`Phone number validation error: ${phoneValidation.error}`);
        } else {
          sanitizedData.phoneNumber = phoneValidation.sanitizedValue;
        }
      }
    }

    // Ensure at least one valid field after sanitization
    if (!sanitizedData.email && !sanitizedData.phoneNumber) {
      errors.push('At least one valid email or phone number must be provided');
    }

    return {
      isValid: errors.length === 0,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined,
      errors
    };
  }
}
