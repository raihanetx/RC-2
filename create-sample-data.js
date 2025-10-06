const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function createSampleData() {
  try {
    // Create categories
    const designCategory = await db.category.upsert({
      where: { slug: 'design-tools' },
      update: {},
      create: {
        name: 'Design Tools',
        slug: 'design-tools',
        icon: 'fas fa-palette'
      }
    });
    
    const productivityCategory = await db.category.upsert({
      where: { slug: 'productivity' },
      update: {},
      create: {
        name: 'Productivity',
        slug: 'productivity',
        icon: 'fas fa-tasks'
      }
    });
    
    const developmentCategory = await db.category.upsert({
      where: { slug: 'development' },
      update: {},
      create: {
        name: 'Development',
        slug: 'development',
        icon: 'fas fa-code'
      }
    });
    
    // Check if products already exist
    const existingCanva = await db.product.findFirst({ where: { slug: 'canva-pro' } });
    const existingChatgpt = await db.product.findFirst({ where: { slug: 'chatgpt-plus' } });
    const existingFigma = await db.product.findFirst({ where: { slug: 'figma-pro' } });
    
    // Create products only if they don't exist
    let canvaProduct, chatgptProduct, figmaProduct;
    
    if (!existingCanva) {
      canvaProduct = await db.product.create({
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
          categoryId: designCategory.id
        }
      });
    } else {
      canvaProduct = existingCanva;
    }
    
    if (!existingChatgpt) {
      chatgptProduct = await db.product.create({
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
          categoryId: productivityCategory.id
        }
      });
    } else {
      chatgptProduct = existingChatgpt;
    }
    
    if (!existingFigma) {
      figmaProduct = await db.product.create({
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
          categoryId: designCategory.id
        }
      });
    } else {
      figmaProduct = existingFigma;
    }
    
    // Create hot deals
    const existingCanvaDeal = await db.hotDeal.findFirst({ where: { productId: canvaProduct.id } });
    if (!existingCanvaDeal) {
      await db.hotDeal.create({
        data: {
          productId: canvaProduct.id,
          customTitle: 'Canva Pro - 50% Off',
          isActive: true,
          sortOrder: 0
        }
      });
    }
    
    const existingChatgptDeal = await db.hotDeal.findFirst({ where: { productId: chatgptProduct.id } });
    if (!existingChatgptDeal) {
      await db.hotDeal.create({
        data: {
          productId: chatgptProduct.id,
          isActive: true,
          sortOrder: 1
        }
      });
    }
    
    console.log('Sample data created successfully');
    console.log('Categories:', await db.category.count());
    console.log('Products:', await db.product.count());
    console.log('Hot Deals:', await db.hotDeal.count());
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await db.$disconnect();
  }
}

createSampleData();