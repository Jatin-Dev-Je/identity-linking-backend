const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Bitespeed Identity Backend for Production...\n');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 2: Generate Prisma client
  console.log('\n🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Step 3: Update provider to use Prisma types
  console.log('\n🔄 Updating to use Prisma generated types...');
  const providerPath = path.join(__dirname, 'src', 'providers', 'identity.provider.ts');
  let content = fs.readFileSync(providerPath, 'utf8');

  // Uncomment the Prisma import
  content = content.replace(
    '// import { Contact } from \'@prisma/client\';',
    'import { Contact } from \'@prisma/client\';'
  );

  // Remove the temporary interface
  const tempInterfaceRegex = /\/\/ Temporary Contact type until Prisma client is generated[\s\S]*?^}/m;
  content = content.replace(tempInterfaceRegex, '// Using Prisma generated Contact type');

  fs.writeFileSync(providerPath, content);
  console.log('✅ Updated identity provider to use Prisma types');

  // Step 4: Build the project
  console.log('\n🏗️ Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 5: Setup database (if DATABASE_URL is provided)
  if (process.env.DATABASE_URL) {
    console.log('\n🗄️ Setting up database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
  } else {
    console.log('\n⚠️ Skipping database setup - DATABASE_URL not provided');
    console.log('Please set DATABASE_URL environment variable and run: npx prisma db push');
  }

  console.log('\n✅ Production setup complete!');
  console.log('🎯 You can now run: npm start');
  console.log('📚 API Documentation: http://localhost:3000/api-docs');
  console.log('🔗 API Endpoint: http://localhost:3000/api/v1/identify');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
