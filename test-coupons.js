// Test file to verify coupon functionality
// This would be run in a browser console or testing environment

async function testCouponValidation() {
  console.log('Testing coupon validation...');
  
  try {
    // Test valid coupon
    const response1 = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'SAVE10',
        subtotal: 100,
        currency: 'USD'
      })
    });
    
    const result1 = await response1.json();
    console.log('SAVE10 coupon test:', result1);
    
    // Test invalid coupon
    const response2 = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'INVALID',
        subtotal: 100,
        currency: 'USD'
      })
    });
    
    const result2 = await response2.json();
    console.log('Invalid coupon test:', result2);
    
    // Test minimum amount requirement
    const response3 = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'SAVE20',
        subtotal: 25,
        currency: 'USD'
      })
    });
    
    const result3 = await response3.json();
    console.log('Minimum amount test:', result3);
    
  } catch (error) {
    console.error('Error testing coupons:', error);
  }
}

// Available test coupons:
console.log(`
Available test coupons:
- SAVE10: 10% discount (max $50)
- SAVE20: 20% discount on orders over $50 (max $100)
- FLAT5: $5 discount
- FLAT10: $10 discount on orders over $25
- NEWUSER: 15% discount (max $75)
`);

// Uncomment to test in browser console:
// testCouponValidation();