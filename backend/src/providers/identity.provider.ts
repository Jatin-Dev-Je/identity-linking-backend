import prisma from '../config/db.config';
import { IdentifyRequest, ConsolidatedContact } from '../models/contact.model';
import { InputValidator } from '../utils/validation.util';

// Temporary Contact type until Prisma client is generated
// This will be replaced with: import { Contact } from '@prisma/client';
interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class IdentityProvider {
  /**
   * Test database connection
   */
  async testConnection(): Promise<void> {
    try {
      // For mock database, this will always succeed
      // For real Prisma, this will test the connection
      if (prisma.$connect) {
        await prisma.$connect();
      }
    } catch (error) {
      throw new Error('Database connection failed');
    }
  }

  /**
   * Main identity reconciliation logic
   */
  async identifyContact(request: IdentifyRequest): Promise<ConsolidatedContact> {
    try {
      // Additional validation at provider level
      const validation = InputValidator.validateIdentifyRequest(request);
      if (!validation.isValid) {
        throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
      }

      const { email, phoneNumber } = validation.sanitizedData!;

      // Find existing contacts with matching email or phone
      const existingContacts = await this.findExistingContacts(email, phoneNumber);

      if (existingContacts.length === 0) {
        // No existing contacts - create new primary contact
        const newContact = await this.createPrimaryContact(email, phoneNumber);
        return this.buildConsolidatedContact([newContact]);
      }

      // Group contacts by their primary contact
      const contactGroups = await this.groupContactsByPrimary(existingContacts);

      if (contactGroups.length === 1) {
        // All contacts belong to same group
        const allContacts = contactGroups[0];
        if (!allContacts) {
          throw new Error('Contact group is undefined');
        }
        
        const needsNewSecondary = this.shouldCreateSecondaryContact(allContacts, email, phoneNumber);
        
        if (needsNewSecondary) {
          const primaryContact = allContacts.find(c => c.linkPrecedence === 'primary');
          if (!primaryContact) {
            throw new Error('Primary contact not found');
          }
          const newSecondary = await this.createSecondaryContact(email, phoneNumber, primaryContact.id);
          allContacts.push(newSecondary);
        }
        
        return this.buildConsolidatedContact(allContacts);
      }

      // Multiple groups found - need to merge them
      return await this.mergeContactGroups(contactGroups, email, phoneNumber);
    } catch (error) {
      // Log the error for debugging
      console.error('Error in identifyContact:', error);
      
      // Re-throw with more context if it's a known error type
      if (error instanceof Error) {
        throw error;
      }
      
      // For unknown errors, throw a generic error
      throw new Error('Failed to process identity reconciliation');
    }
  }

  /**
   * Find existing contacts with matching email or phone number
   */
  private async findExistingContacts(email?: string, phoneNumber?: string): Promise<Contact[]> {
    try {
      if (!email && !phoneNumber) {
        return [];
      }

      const whereConditions = [];
      if (email) {
        // Ensure email is properly sanitized for database query
        const emailValidation = InputValidator.validateEmail(email);
        if (emailValidation.isValid && emailValidation.sanitizedValue) {
          whereConditions.push({ email: emailValidation.sanitizedValue });
        }
      }
      if (phoneNumber) {
        // Ensure phone number is properly sanitized for database query
        const phoneValidation = InputValidator.validatePhoneNumber(phoneNumber);
        if (phoneValidation.isValid && phoneValidation.sanitizedValue) {
          whereConditions.push({ phoneNumber: phoneValidation.sanitizedValue });
        }
      }

      if (whereConditions.length === 0) {
        return [];
      }

      return await prisma.contact.findMany({
        where: {
          OR: whereConditions,
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      console.error('Error finding existing contacts:', error);
      throw new Error('Failed to search for existing contacts');
    }
  }

  /**
   * Group contacts by their primary contact
   */
  private async groupContactsByPrimary(contacts: Contact[]): Promise<Contact[][]> {
    try {
      const primaryIds = new Set<number>();
      
      // Collect all primary IDs
      for (const contact of contacts) {
        if (contact.linkPrecedence === 'primary') {
          primaryIds.add(contact.id);
        } else if (contact.linkedId) {
          primaryIds.add(contact.linkedId);
        }
      }

      // Fetch complete contact groups
      const groups: Contact[][] = [];
      for (const primaryId of primaryIds) {
        const groupContacts = await this.getContactGroup(primaryId);
        if (groupContacts.length > 0) {
          groups.push(groupContacts);
        }
      }

      return groups;
    } catch (error) {
      console.error('Error grouping contacts by primary:', error);
      throw new Error('Failed to group contacts');
    }
  }

  /**
   * Get all contacts in a group (primary + all secondaries)
   */
  private async getContactGroup(primaryId: number): Promise<Contact[]> {
    const primary = await prisma.contact.findUnique({
      where: { id: primaryId, deletedAt: null },
    });

    const secondaries = await prisma.contact.findMany({
      where: { linkedId: primaryId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    return primary ? [primary, ...secondaries] : secondaries;
  }

  /**
   * Check if we need to create a new secondary contact
   */
  private shouldCreateSecondaryContact(contacts: Contact[], email?: string, phoneNumber?: string): boolean {
    // Check if this exact combination already exists
    const exactMatch = contacts.some(contact => 
      contact.email === (email || null) && contact.phoneNumber === (phoneNumber || null)
    );

    if (exactMatch) {
      return false;
    }

    // Check if this brings new information
    const hasNewEmail = email ? !contacts.some(c => c.email === email) : false;
    const hasNewPhone = phoneNumber ? !contacts.some(c => c.phoneNumber === phoneNumber) : false;

    return hasNewEmail || hasNewPhone;
  }

  /**
   * Create a new primary contact
   */
  private async createPrimaryContact(email?: string, phoneNumber?: string): Promise<Contact> {
    try {
      // Sanitize inputs before saving
      let sanitizedEmail: string | null = null;
      let sanitizedPhone: string | null = null;

      if (email) {
        const emailValidation = InputValidator.validateEmail(email);
        if (emailValidation.isValid && emailValidation.sanitizedValue) {
          sanitizedEmail = emailValidation.sanitizedValue;
        }
      }

      if (phoneNumber) {
        const phoneValidation = InputValidator.validatePhoneNumber(phoneNumber);
        if (phoneValidation.isValid && phoneValidation.sanitizedValue) {
          sanitizedPhone = phoneValidation.sanitizedValue;
        }
      }

      if (!sanitizedEmail && !sanitizedPhone) {
        throw new Error('Cannot create contact without valid email or phone number');
      }

      return await prisma.contact.create({
        data: {
          email: sanitizedEmail,
          phoneNumber: sanitizedPhone,
          linkPrecedence: 'primary',
        },
      });
    } catch (error) {
      console.error('Error creating primary contact:', error);
      throw new Error('Failed to create primary contact');
    }
  }

  /**
   * Create a new secondary contact
   */
  private async createSecondaryContact(email?: string, phoneNumber?: string, linkedId?: number): Promise<Contact> {
    try {
      if (!linkedId) {
        throw new Error('LinkedId is required for secondary contact');
      }

      // Sanitize inputs before saving
      let sanitizedEmail: string | null = null;
      let sanitizedPhone: string | null = null;

      if (email) {
        const emailValidation = InputValidator.validateEmail(email);
        if (emailValidation.isValid && emailValidation.sanitizedValue) {
          sanitizedEmail = emailValidation.sanitizedValue;
        }
      }

      if (phoneNumber) {
        const phoneValidation = InputValidator.validatePhoneNumber(phoneNumber);
        if (phoneValidation.isValid && phoneValidation.sanitizedValue) {
          sanitizedPhone = phoneValidation.sanitizedValue;
        }
      }

      if (!sanitizedEmail && !sanitizedPhone) {
        throw new Error('Cannot create contact without valid email or phone number');
      }

      return await prisma.contact.create({
        data: {
          email: sanitizedEmail,
          phoneNumber: sanitizedPhone,
          linkedId,
          linkPrecedence: 'secondary',
        },
      });
    } catch (error) {
      console.error('Error creating secondary contact:', error);
      throw new Error('Failed to create secondary contact');
    }
  }

  /**
   * Merge multiple contact groups when they should be linked
   */
  private async mergeContactGroups(groups: Contact[][], email?: string, phoneNumber?: string): Promise<ConsolidatedContact> {
    // Find the oldest primary contact (will remain primary)
    const primaries = groups
      .map(group => group.find(c => c.linkPrecedence === 'primary'))
      .filter((p): p is Contact => p !== undefined);
    
    if (primaries.length === 0) {
      throw new Error('No primary contacts found in groups');
    }
    
    const oldestPrimary = primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]!;

    // Collect all contacts and update non-primary groups
    const allContacts: Contact[] = [];
    
    for (const group of groups) {
      const primary = group.find(c => c.linkPrecedence === 'primary');
      if (!primary) continue;
      
      if (primary.id === oldestPrimary.id) {
        // This is the winning primary group
        allContacts.push(...group);
      } else {
        // Convert this primary to secondary and link to oldest primary
        const updatedPrimary = await prisma.contact.update({
          where: { id: primary.id },
          data: {
            linkedId: oldestPrimary.id,
            linkPrecedence: 'secondary',
          },
        });
        
        // Update all secondaries in this group to link to oldest primary
        await prisma.contact.updateMany({
          where: { linkedId: primary.id },
          data: { linkedId: oldestPrimary.id },
        });

        // Fetch updated contacts
        const updatedGroup = await this.getContactGroup(oldestPrimary.id);
        const newContacts = updatedGroup.filter(c => 
          c.id === updatedPrimary.id || group.some(gc => gc.id === c.id && gc.linkPrecedence === 'secondary')
        );
        
        allContacts.push(...newContacts);
      }
    }

    // Remove duplicates
    const uniqueContacts = allContacts.filter((contact, index, self) => 
      index === self.findIndex(c => c.id === contact.id)
    );

    // Check if we need to create a new secondary contact
    const needsNewSecondary = this.shouldCreateSecondaryContact(uniqueContacts, email, phoneNumber);
    
    if (needsNewSecondary) {
      const newSecondary = await this.createSecondaryContact(email, phoneNumber, oldestPrimary.id);
      uniqueContacts.push(newSecondary);
    }

    return this.buildConsolidatedContact(uniqueContacts);
  }

  /**
   * Build the consolidated contact response
   */
  private buildConsolidatedContact(contacts: Contact[]): ConsolidatedContact {
    const primary = contacts.find(c => c.linkPrecedence === 'primary');
    if (!primary) {
      throw new Error('Primary contact not found');
    }
    
    const secondaries = contacts.filter(c => c.linkPrecedence === 'secondary');

    // Collect unique emails and phone numbers, with primary first
    const emails = [
      ...(primary.email ? [primary.email] : []),
      ...secondaries
        .map(c => c.email)
        .filter((email): email is string => email !== null && email !== primary.email)
        .filter((email, index, self) => self.indexOf(email) === index)
    ];

    const phoneNumbers = [
      ...(primary.phoneNumber ? [primary.phoneNumber] : []),
      ...secondaries
        .map(c => c.phoneNumber)
        .filter((phone): phone is string => phone !== null && phone !== primary.phoneNumber)
        .filter((phone, index, self) => self.indexOf(phone) === index)
    ];

    return {
      primaryContactId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaries.map(c => c.id),
    };
  }
}
