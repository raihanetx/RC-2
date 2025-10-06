#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    const prisma = new PrismaClient({
      log: ['info', 'warn', 'error'],
    });
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Basic query test passed:', result);
    
    // Test if tables exist
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible, current count: ${userCount}`);
    } catch (err) {
      console.log('ℹ️  Tables might not exist yet. Run `npm run db:push` to create them.');
    }
    
    await prisma.$disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check if the database server is running');
      console.log('2. Verify the connection string in .env file');
      console.log('3. Check network connectivity');
      console.log('4. For Neon: Ensure the project is active and not paused');
    }
    
    process.exit(1);
  }
}

testConnection();