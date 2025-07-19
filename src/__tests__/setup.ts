import { beforeAll, afterAll } from '@jest/globals';
import prisma from '../config/db.config';

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up and disconnect
  await prisma.$disconnect();
});
