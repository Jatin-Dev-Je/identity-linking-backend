const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in environment variables');
    console.log('📝 Please update your .env file with a valid DATABASE_URL');
    console.log('\nExample:');
    console.log('DATABASE_URL="postgresql://username:password@hostname:5432/database"');
    process.exit(1);
  }
  
  console.log('📡 DATABASE_URL found:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if Contact table exists
    try {
      const contactCount = await prisma.contact.count();
      console.log(`📊 Contact table exists with ${contactCount} records`);
    } catch (error) {
      console.log('⚠️ Contact table not found - run: npm run db:push');
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n🆘 Troubleshooting:');
    console.log('1. Check if your database server is running');
    console.log('2. Verify your DATABASE_URL is correct');
    console.log('3. Ensure your database exists');
    console.log('4. Check network connectivity');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
