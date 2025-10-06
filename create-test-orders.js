const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestOrders() {
  try {
    // Create test orders
    const testOrders = [
      {
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        status: 'pending',
        subtotal: 35.00,
        total: 35.00,
        currency: 'USD',
        deliveryType: 'digital',
        notes: 'Customer requested quick delivery',
        paymentStatus: 'pending',
        items: {
          create: [
            {
              productId: '1',
              productName: 'Canva Pro',
              quantity: 1,
              price: 35.00,
              duration: '1 Year'
            }
          ]
        }
      },
      {
        orderNumber: 'ORD-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '+0987654321',
        status: 'processing',
        subtotal: 20.00,
        total: 20.00,
        currency: 'USD',
        deliveryType: 'digital',
        notes: 'Premium customer',
        paymentStatus: 'paid',
        items: {
          create: [
            {
              productId: '2',
              productName: 'ChatGPT Plus',
              quantity: 1,
              price: 20.00,
              duration: '1 Month'
            }
          ]
        }
      },
      {
        orderNumber: 'ORD-003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob@example.com',
        customerPhone: '+1122334455',
        status: 'completed',
        subtotal: 55.00,
        total: 55.00,
        currency: 'USD',
        deliveryType: 'digital',
        notes: 'Delivered successfully',
        paymentStatus: 'paid',
        items: {
          create: [
            {
              productId: '3',
              productName: 'Figma Pro',
              quantity: 1,
              price: 30.00,
              duration: '3 Months'
            },
            {
              productId: '4',
              productName: 'Adobe Creative Cloud',
              quantity: 1,
              price: 25.00,
              duration: '1 Month'
            }
          ]
        }
      },
      {
        orderNumber: 'ORD-004',
        customerName: 'Alice Brown',
        customerEmail: 'alice@example.com',
        customerPhone: '+5544332211',
        status: 'cancelled',
        subtotal: 8.00,
        total: 8.00,
        currency: 'USD',
        deliveryType: 'digital',
        notes: 'Customer requested cancellation',
        paymentStatus: 'failed',
        items: {
          create: [
            {
              productId: '5',
              productName: 'Notion Plus',
              quantity: 1,
              price: 8.00,
              duration: '1 Month'
            }
          ]
        }
      }
    ];

    console.log('Creating test orders...');
    
    for (const orderData of testOrders) {
      const order = await prisma.order.create({
        data: orderData,
        include: {
          items: true
        }
      });
      console.log(`Created order: ${order.orderNumber}`);
    }

    console.log('Test orders created successfully!');
    
    // Display all orders
    const allOrders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\nAll orders in database:');
    allOrders.forEach(order => {
      console.log(`- ${order.orderNumber}: ${order.customerName} - ${order.status} - ${order.currency} ${order.total}`);
    });

  } catch (error) {
    console.error('Error creating test orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrders();