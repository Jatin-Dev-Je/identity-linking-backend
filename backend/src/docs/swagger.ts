import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bitespeed Identity Reconciliation API',
      version: '1.0.0',
      description: `
        ## Bitespeed Backend Task: Identity Reconciliation
        
        This API helps identify and link customer contacts across multiple purchases.
        
        ### Key Features:
        - **Identity Linking**: Automatically links contacts with shared email or phone number
        - **Primary/Secondary Structure**: Maintains hierarchy with oldest contact as primary
        - **Smart Merging**: Handles complex scenarios where separate contact groups need to be merged
        
        ### How it works:
        1. Send a POST request to \`/identify\` with email and/or phone number
        2. The system finds existing contacts with matching information
        3. Links are created or updated based on the matching criteria
        4. Returns consolidated contact information with all linked emails and phone numbers
        
        ### Example Use Case:
        Customer places order with \`email=lorraine@hillvalley.edu\` & \`phoneNumber=123456\`,
        then later places another order with \`email=mcfly@hillvalley.edu\` & \`phoneNumber=123456\`.
        The system will link these as the same customer due to the shared phone number.
      `,
      contact: {
        name: 'API Support',
        email: 'support@bitespeed.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-app.onrender.com/api/v1' 
          : `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    tags: [
      {
        name: 'Identity',
        description: 'Customer identity reconciliation endpoints',
      },
      {
        name: 'Health',
        description: 'Service health monitoring endpoints',
      },
    ],
    components: {
      schemas: {
        IdentifyRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address',
              example: 'lorraine@hillvalley.edu',
            },
            phoneNumber: {
              type: 'string',
              description: 'Customer phone number',
              example: '123456',
            },
          },
          minProperties: 1,
          additionalProperties: false,
        },
        ConsolidatedContact: {
          type: 'object',
          properties: {
            primaryContactId: {
              type: 'number',
              description: 'ID of the primary contact',
              example: 1,
            },
            emails: {
              type: 'array',
              items: {
                type: 'string',
                format: 'email',
              },
              description: 'All emails associated with this contact (primary first)',
              example: ['lorraine@hillvalley.edu', 'mcfly@hillvalley.edu'],
            },
            phoneNumbers: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'All phone numbers associated with this contact (primary first)',
              example: ['123456'],
            },
            secondaryContactIds: {
              type: 'array',
              items: {
                type: 'number',
              },
              description: 'IDs of all secondary contacts linked to the primary',
              example: [23],
            },
          },
          required: ['primaryContactId', 'emails', 'phoneNumbers', 'secondaryContactIds'],
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            message: {
              type: 'string',
              description: 'Human-readable message about the result',
            },
            data: {
              type: 'object',
              description: 'Response data (present on success)',
            },
            error: {
              type: 'string',
              description: 'Error message (present on failure)',
            },
          },
          required: ['success', 'message'],
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Bitespeed Identity API',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }));
};

export { specs };
