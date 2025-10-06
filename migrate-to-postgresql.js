// Migration script: SQLite to PostgreSQL
const { PrismaClient } = require('@prisma/client');

async function migrate() {
  // 1. Export from SQLite
  const sqlite = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });
  
  const products = await sqlite.product.findMany();
  const categories = await sqlite.category.findMany();
  const orders = await sqlite.order.findMany();
  
  // 2. Import to PostgreSQL
  const postgres = new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_URL } } });
  
  // Migrate data
  for (const category of categories) {
    await postgres.category.create({ data: category });
  }
  
  for (const product of products) {
    await postgres.product.create({ data: product });
  }
  
  console.log('Migration complete! 🎉');
}

migrate().catch(console.error);