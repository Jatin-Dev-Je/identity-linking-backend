// Fallback to mock database if Prisma client is not available
let prisma: any;

declare global {
  var __prisma: any | undefined;
}

try {
  const { PrismaClient } = require('@prisma/client');
  
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.__prisma) {
      global.__prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    prisma = global.__prisma;
  }
} catch (error) {
  console.warn('Prisma client not available, using mock database for testing');
  const mockDb = require('./mock-db.config.js');
  prisma = mockDb.mockPrisma;
}

export default prisma;
