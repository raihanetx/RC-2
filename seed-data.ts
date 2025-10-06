import { db } from './src/lib/db';

async function seedData() {
  try {
    console.log('Starting to seed data...');

    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Design Tools',
          slug: 'design-tools',
          icon: 'fas fa-palette',
          status: 'active',
          sortOrder: 1
        }
      }),
      db.category.create({
        data: {
          name: 'Productivity',
          slug: 'productivity',
          icon: 'fas fa-tasks',
          status: 'active',
          sortOrder: 2
        }
      }),
      db.category.create({
        data: {
          name: 'Development',
          slug: 'development',
          icon: 'fas fa-code',
          status: 'active',
          sortOrder: 3
        }
      }),
      db.category.create({
        data: {
          name: 'Marketing',
          slug: 'marketing',
          icon: 'fas fa-bullhorn',
          status: 'active',
          sortOrder: 4
        }
      }),
      db.category.create({
        data: {
          name: 'Education',
          slug: 'education',
          icon: 'fas fa-graduation-cap',
          status: 'active',
          sortOrder: 5
        }
      })
    ]);

    console.log('Created categories:', categories.length);

    // Create products
    const products = await Promise.all([
      db.product.create({
        data: {
          name: 'Canva Pro',
          description: 'Professional design tool with premium templates',
          longDescription: 'Canva Pro is a premium design tool that offers advanced features like brand kits, background remover, premium templates, and more. Perfect for professionals and businesses.',
          image: 'https://via.placeholder.com/400x300.png?text=Canva+Pro',
          category: 'Design Tools',
          categorySlug: 'design-tools',
          slug: 'canva-pro',
          pricing: [
            { duration: '1 Month', price: 5 },
            { duration: '3 Months', price: 12 },
            { duration: '6 Months', price: 20 },
            { duration: '1 Year', price: 35 }
          ],
          stockOut: false,
          status: 'active',
          featured: true,
          categoryId: categories[0].id
        }
      }),
      db.product.create({
        data: {
          name: 'ChatGPT Plus',
          description: 'Advanced AI assistant with GPT-4',
          longDescription: 'ChatGPT Plus gives you access to GPT-4, faster response times, and access to new features. Perfect for professionals, students, and anyone who needs advanced AI assistance.',
          image: 'https://via.placeholder.com/400x300.png?text=ChatGPT+Plus',
          category: 'Productivity',
          categorySlug: 'productivity',
          slug: 'chatgpt-plus',
          pricing: [
            { duration: '1 Month', price: 20 },
            { duration: '3 Months', price: 55 },
            { duration: '6 Months', price: 100 },
            { duration: '1 Year', price: 180 }
          ],
          stockOut: false,
          status: 'active',
          featured: true,
          categoryId: categories[1].id
        }
      }),
      db.product.create({
        data: {
          name: 'Figma Pro',
          description: 'Collaborative design interface tool',
          longDescription: 'Figma Pro is a powerful design tool that allows teams to collaborate in real-time. Features include advanced prototyping, version history, and team libraries.',
          image: 'https://via.placeholder.com/400x300.png?text=Figma+Pro',
          category: 'Design Tools',
          categorySlug: 'design-tools',
          slug: 'figma-pro',
          pricing: [
            { duration: '1 Month', price: 12 },
            { duration: '3 Months', price: 30 },
            { duration: '6 Months', price: 55 },
            { duration: '1 Year', price: 100 }
          ],
          stockOut: false,
          status: 'active',
          featured: false,
          categoryId: categories[0].id
        }
      }),
      db.product.create({
        data: {
          name: 'Adobe Creative Cloud',
          description: 'Complete suite of creative tools',
          longDescription: 'Adobe Creative Cloud gives you access to all Adobe creative apps like Photoshop, Illustrator, Premiere Pro, and more. Perfect for designers, video editors, and creative professionals.',
          image: 'https://via.placeholder.com/400x300.png?text=Adobe+CC',
          category: 'Design Tools',
          categorySlug: 'design-tools',
          slug: 'adobe-creative-cloud',
          pricing: [
            { duration: '1 Month', price: 20 },
            { duration: '3 Months', price: 55 },
            { duration: '6 Months', price: 100 },
            { duration: '1 Year', price: 180 }
          ],
          stockOut: false,
          status: 'active',
          featured: true,
          categoryId: categories[0].id
        }
      }),
      db.product.create({
        data: {
          name: 'GitHub Pro',
          description: 'Advanced version control and collaboration',
          longDescription: 'GitHub Pro offers advanced features like private repositories with unlimited collaborators, advanced code review tools, and more. Perfect for developers and teams.',
          image: 'https://via.placeholder.com/400x300.png?text=GitHub+Pro',
          category: 'Development',
          categorySlug: 'development',
          slug: 'github-pro',
          pricing: [
            { duration: '1 Month', price: 4 },
            { duration: '3 Months', price: 10 },
            { duration: '6 Months', price: 18 },
            { duration: '1 Year', price: 30 }
          ],
          stockOut: false,
          status: 'active',
          featured: false,
          categoryId: categories[2].id
        }
      }),
      db.product.create({
        data: {
          name: 'Notion Plus',
          description: 'All-in-one workspace for notes and tasks',
          longDescription: 'Notion Plus is an all-in-one workspace where you can write, plan, collaborate, and organize. Features include unlimited file uploads, version history, and advanced permissions.',
          image: 'https://via.placeholder.com/400x300.png?text=Notion+Plus',
          category: 'Productivity',
          categorySlug: 'productivity',
          slug: 'notion-plus',
          pricing: [
            { duration: '1 Month', price: 8 },
            { duration: '3 Months', price: 20 },
            { duration: '6 Months', price: 35 },
            { duration: '1 Year', price: 60 }
          ],
          stockOut: false,
          status: 'active',
          featured: false,
          categoryId: categories[1].id
        }
      })
    ]);

    console.log('Created products:', products.length);

    // Create hot deals (we'll use featured products as hot deals)
    const hotDeals = products.filter(p => p.featured).map(p => ({
      productId: p.id,
      customTitle: p.name === 'Canva Pro' ? 'Canva Pro - 50% Off' : 
                  p.name === 'Adobe Creative Cloud' ? 'Adobe CC - Special Deal' : 
                  undefined
    }));

    console.log('Hot deals created:', hotDeals.length);

    // Create sample coupons
    const coupons = await Promise.all([
      db.coupon.create({
        data: {
          code: 'WELCOME10',
          name: 'Welcome Discount',
          description: 'Get 10% off on your first order',
          discountType: 'percentage',
          discountValue: 10,
          minimumAmount: 10,
          usageLimit: 100,
          status: 'active',
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      }),
      db.coupon.create({
        data: {
          code: 'SAVE20',
          name: 'Special Discount',
          description: 'Get 20% off on orders above $50',
          discountType: 'percentage',
          discountValue: 20,
          minimumAmount: 50,
          usageLimit: 50,
          status: 'active',
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
        }
      })
    ]);

    console.log('Created coupons:', coupons.length);

    console.log('Data seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Featured Products (Hot Deals): ${hotDeals.length}`);
    console.log(`- Coupons: ${coupons.length}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await db.$disconnect();
  }
}

seedData();