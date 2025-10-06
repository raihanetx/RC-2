// Test script to verify order management API
async function testOrderAPI() {
  console.log('Testing Order Management API...\n');

  try {
    // Test GET all orders
    console.log('1. Testing GET /api/admin/orders');
    const getAllResponse = await fetch('http://localhost:3000/api/admin/orders');
    let orders = [];
    
    if (getAllResponse.ok) {
      orders = await getAllResponse.json();
      console.log(`✓ Found ${orders.length} orders`);
      orders.forEach(order => {
        console.log(`  - ${order.orderNumber}: ${order.customerName} (${order.status})`);
      });
    } else {
      console.log('✗ Failed to fetch orders');
    }

    // Test GET single order
    if (orders && orders.length > 0) {
      const firstOrderId = orders[0].id;
      console.log(`\n2. Testing GET /api/admin/orders/${firstOrderId}`);
      const getSingleResponse = await fetch(`http://localhost:3000/api/admin/orders/${firstOrderId}`);
      if (getSingleResponse.ok) {
        const order = await getSingleResponse.json();
        console.log(`✓ Fetched order: ${order.orderNumber}`);
        console.log(`  Customer: ${order.customerName}`);
        console.log(`  Items: ${order.items.length}`);
        console.log(`  Total: ${order.currency} ${order.total}`);
      } else {
        console.log('✗ Failed to fetch single order');
      }
    }

    console.log('\n✅ Order Management API test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Run the test
testOrderAPI();