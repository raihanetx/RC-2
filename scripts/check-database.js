import { db } from '../src/lib/db.js';

async function checkDatabase() {
  try {
    console.log('Checking database contents...\n');
    
    // Check categories
    const categories = await db.category.findMany();
    console.log(`Categories found: ${categories.length}`);
    if (categories.length > 0) {
      console.log('Sample categories:', categories.slice(0, 3).map(c => ({ id: c.id, name: c.name, slug: c.slug })));
    }
    
    // Check products
    const products = await db.product.findMany();
    console.log(`\nProducts found: ${products.length}`);
    if (products.length > 0) {
      console.log('Sample products:', products.slice(0, 3).map(p => ({ id: p.id, name: p.name, category: p.category })));
    }
    
    // Check site config
    const siteConfig = await db.siteConfig.findFirst();
    console.log(`\nSite config found: ${siteConfig ? 'Yes' : 'No'}`);
    
    // Check hot deals
    const hotDeals = await db.hotDeal.findMany();
    console.log(`Hot deals found: ${hotDeals.length}`);
    
    console.log('\n✅ Database check completed successfully');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await db.$disconnect();
  }
}

checkDatabase();