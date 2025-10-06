import { db } from '@/lib/db';

async function createTestData() {
  try {
    // Get existing categories
    const categories = await db.category.findMany();
    if (categories.length === 0) {
      console.log('No categories found. Please create categories first.');
      return;
    }

    const designCategory = categories.find(c => c.slug === 'design-tools');
    const productivityCategory = categories.find(c => c.slug === 'productivity');

    // Create test products
    if (designCategory) {
      await db.product.create({
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
          categoryId: designCategory.id
        }
      });
    }

    if (productivityCategory) {
      await db.product.create({
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
          featured: true,
          categoryId: productivityCategory.id
        }
      });
    }

    // Create test orders
    const orders = [
      {
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        status: 'pending',
        subtotal: 13.0,
        total: 13.0,
        currency: 'USD',
        deliveryType: 'digital',
        notes: 'Test order 1'
      },
      {
        orderNumber: 'ORD-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '+0987654321',
        status: 'completed',
        subtotal: 8.0,
        total: 8.0,
        currency: 'USD',
        deliveryType: 'digital',
        notes: 'Test order 2'
      },
      {
        orderNumber: 'ORD-003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob@example.com',
        customerPhone: '+1122334455',
        status: 'cancelled',
        subtotal: 20.0,
        total: 20.0,
        currency: 'USD',
        deliveryType: 'digital',
        notes: 'Test order 3'
      }
    ];

    for (const orderData of orders) {
      const order = await db.order.create({
        data: orderData
      });

      // Create order items
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: 'test-product-id',
          productName: 'Test Product',
          quantity: 1,
          price: orderData.total,
          duration: '1 Month'
        }
      });
    }

    console.log('Test data created successfully!');
    console.log(`Created ${orders.length} test orders`);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await db.$disconnect();
  }
}

createTestData();