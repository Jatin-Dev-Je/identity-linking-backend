import app from './app';
import prisma from './config/db.config';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection (skip for mock database)
    if (prisma.$connect) {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } else {
      console.log('✅ Using mock database for testing');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 API Endpoint: http://localhost:${PORT}/api/v1/identify`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  if (prisma.$disconnect) {
    await prisma.$disconnect();
    console.log('📦 Database disconnected');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  if (prisma.$disconnect) {
    await prisma.$disconnect();
    console.log('📦 Database disconnected');
  }
  process.exit(0);
});

startServer();
