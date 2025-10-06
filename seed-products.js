const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedProducts() {
  try {
    console.log('Starting to seed products...');
    
    // Check if products already exist
    const existingProducts = await prisma.product.count();
    if (existingProducts > 0) {
      console.log('Products already exist, skipping seed');
      return;
    }

    // Create categories first
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'design-tools' },
        update: {},
        create: {
          name: 'Design Tools',
          slug: 'design-tools',
          icon: 'fas fa-palette',
          status: 'active'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'productivity' },
        update: {},
        create: {
          name: 'Productivity',
          slug: 'productivity',
          icon: 'fas fa-tasks',
          status: 'active'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'development' },
        update: {},
        create: {
          name: 'Development',
          slug: 'development',
          icon: 'fas fa-code',
          status: 'active'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'marketing' },
        update: {},
        create: {
          name: 'Marketing',
          slug: 'marketing',
          icon: 'fas fa-bullhorn',
          status: 'active'
        }
      })
    ]);

    console.log('Categories created:', categories.length);

    // Create sample products
    const sampleProducts = [
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
        stockOut: true,
        status: 'active',
        featured: false,
        categoryId: categories[0].id
      }
    ];

    // Insert products
    for (const productData of sampleProducts) {
      await prisma.product.create({
        data: productData
      });
    }

    console.log('Products created:', sampleProducts.length);

    // Create some hot deals
    const createdProducts = await prisma.product.findMany({
      where: { featured: true }
    });

    for (let i = 0; i < Math.min(3, createdProducts.length); i++) {
      await prisma.hotDeal.create({
        data: {
          productId: createdProducts[i].id,
          customTitle: i === 0 ? 'Special Offer - 50% Off' : undefined,
          isActive: true,
          sortOrder: i
        }
      });
    }

    console.log('Hot deals created');

    // Create site config
    await prisma.siteConfig.upsert({
      where: { id: 'site-config' },
      update: {},
      create: {
        id: 'site-config',
        heroBanner: [],
        favicon: '',
        contactPhone: '+880 1234-567890',
        contactWhatsapp: '+880 1234-567890',
        contactEmail: 'info@submonth.com',
        adminPassword: 'password123',
        usdToBdtRate: 110,
        siteLogo: '',
        heroSliderInterval: 5000,
        hotDealsSpeed: 40
      }
    });

    console.log('Site config created');
    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();