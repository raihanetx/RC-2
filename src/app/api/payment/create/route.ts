import { NextRequest, NextResponse } from 'next/server';
import { rupantorPayService } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerEmail, 
      customerPhone,
      items, 
      totalAmount, 
      currency,
      orderId 
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !totalAmount || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerEmail, totalAmount, items' },
        { status: 400 }
      );
    }

    // Prepare callback URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log('Payment API - Using base URL:', origin);
    
    // Create payment with RupantorPay using correct parameters
    const paymentResult = await rupantorPayService.initiatePayment({
      amount: totalAmount,
      currency: currency || 'USD',
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || '',
      order_id: orderId,
      callback_url: `${origin}/api/payment/callback`,
      success_url: `${origin}/payment/success`,
      cancel_url: `${origin}/payment/cancel`,
      description: `Payment for order ${orderId}`
    });

    if (paymentResult.success && paymentResult.payment_url) {
      return NextResponse.json({
        success: true,
        payment_url: paymentResult.payment_url,
        transaction_id: paymentResult.transaction_id,
        message: 'Payment created successfully'
      });
    } else {
      return NextResponse.json(
        { 
          error: paymentResult.error || 'Failed to create payment',
          message: paymentResult.message 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const config = rupantorPayService.getConfig();
  return NextResponse.json({
    message: 'RupantorPay payment creation endpoint',
    configured: config.configured,
    apiKey: config.apiKey ? `${config.apiKey.slice(0, 8)}...` : 'Not configured',
    baseUrl: config.baseUrl,
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        customerName: 'string',
        customerEmail: 'string',
        customerPhone: 'string',
        items: 'array',
        totalAmount: 'number',
        currency: 'string',
        orderId: 'string'
      }
    }
  });
}