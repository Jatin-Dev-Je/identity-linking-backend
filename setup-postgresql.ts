import postgresql from './src/config/postgresql.config';

async function setupPostgreSQL() {
  console.log('🗄️ Setting up PostgreSQL for Bitespeed Identity Backend...\n');

  try {
    // Test connection
    console.log('1. Testing database connection...');
    const connected = await postgresql.connect();
    
    if (!connected) {
      console.log('❌ Database connection failed!');
      console.log('\n🔧 Please check:');
      console.log('1. Your DATABASE_URL in .env file');
      console.log('2. Database server is running');
      console.log('3. Network connectivity');
      process.exit(1);
    }

    // Create tables
    console.log('2. Creating database tables...');
    await postgresql.createTables();

    // Test basic operations
    console.log('3. Testing basic operations...');
    const testContact = await postgresql.createContact({
      email: 'test@bitespeed.com',
      phoneNumber: '123456789',
      linkPrecedence: 'primary'
    });
    console.log('✅ Test contact created:', testContact.id);

    // Verify the contact exists
    const contacts = await postgresql.findContacts('test@bitespeed.com');
    console.log('✅ Found contacts:', contacts.length);

    console.log('\n🎉 PostgreSQL setup complete!');
    console.log('📊 Database is ready for the Bitespeed Identity Backend');
    console.log('🚀 You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n🆘 Troubleshooting:');
    console.log('1. Make sure your DATABASE_URL is correct in .env');
    console.log('2. Check if the database exists');
    console.log('3. Verify database permissions');
  } finally {
    await postgresql.disconnect();
  }
}

setupPostgreSQL();
