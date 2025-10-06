import { NextRequest, NextResponse } from 'next/server';

// Mock coupon data - in a real app, this would come from a database
const MOCK_COUPONS = {
  'SAVE10': {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    minAmount: 0,
    maxDiscount: 50,
    usageLimit: null,
    usageCount: 0,
    isActive: true,
    description: '10% discount on your order'
  },
  'SAVE20': {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    minAmount: 50,
    maxDiscount: 100,
    isActive: true,
    description: '20% discount on orders over $50'
  },
  'FLAT5': {
    code: 'FLAT5',
    type: 'fixed',
    value: 5,
    minAmount: 0,
    maxDiscount: null,
    usageLimit: null,
    usageCount: 0,
    isActive: true,
    description: '$5 discount on your order'
  },
  'FLAT10': {
    code: 'FLAT10',
    type: 'fixed',
    value: 10,
    minAmount: 25,
    maxDiscount: null,
    usageLimit: null,
    usageCount: 0,
    isActive: true,
    description: '$10 discount on orders over $25'
  },
  'NEWUSER': {
    code: 'NEWUSER',
    type: 'percentage',
    value: 15,
    minAmount: 0,
    maxDiscount: 75,
    usageLimit: 1,
    usageCount: 0,
    isActive: true,
    description: '15% discount for new users'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal, currency } = await request.json();

    if (!code || !subtotal) {
      return NextResponse.json({
        success: false,
        message: 'Coupon code and subtotal are required'
      }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();
    const coupon = MOCK_COUPONS[normalizedCode];

    if (!coupon) {
      return NextResponse.json({
        success: false,
        message: 'Invalid coupon code'
      }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({
        success: false,
        message: 'This coupon is no longer active'
      }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({
        success: false,
        message: 'This coupon has reached its usage limit'
      }, { status: 400 });
    }

    if (subtotal < coupon.minAmount) {
      return NextResponse.json({
        success: false,
        message: `Minimum order amount of ${currency === 'USD' ? '$' : '৳'}${coupon.minAmount} required`
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
      
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
      
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value
      },
      discount: discountAmount,
      message: `Coupon applied successfully! You saved ${currency === 'USD' ? '$' : '৳'}${discountAmount.toFixed(2)}`
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}