import { NextRequest, NextResponse } from 'next/server';
import rupantorPayService from '@/lib/payment';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      items, 
      currency = 'USD', 
      couponCode,
      notes 
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate total amount
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.stockOut) {
        return NextResponse.json(
          { error: `Product ${product.name} is out of stock` },
          { status: 400 }
        );
      }

      const pricing = product.pricing[item.durationIndex || 0];
      const itemTotal = pricing.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: pricing.price,
        duration: pricing.duration,
      });
    }

    // Apply coupon discount if provided
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });

      if (coupon && coupon.status === 'active') {
        const now = new Date();
        if (coupon.validFrom <= now && (!coupon.validUntil || coupon.validUntil >= now)) {
          if (!coupon.minimumAmount || subtotal >= coupon.minimumAmount) {
            if (coupon.discountType === 'percentage') {
              couponDiscount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maximumDiscount) {
                couponDiscount = Math.min(couponDiscount, coupon.maximumDiscount);
              }
            } else {
              couponDiscount = coupon.discountValue;
            }
          }
        }
      }
    }

    const total = subtotal - couponDiscount;
    const finalAmount = rupantorPayService.formatAmount(total);

    // Generate order ID
    const orderId = rupantorPayService.generateOrderId();

    // Create order in database
    const order = await db.order.create({
      data: {
        orderNumber: orderId,
        customerName,
        customerEmail,
        customerPhone,
        subtotal,
        total,
        currency,
        deliveryType: 'digital',
        notes,
        couponCode: couponCode || null,
        couponDiscount,
        status: 'pending',
        paymentStatus: 'pending',
        items: {
          create: orderItems.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            duration: item.duration,
            productId: item.productId,
          }))
        }
      }
    });

    // Prepare payment request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const paymentData = {
      amount: finalAmount,
      currency,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      order_id: orderId,
      callback_url: `${baseUrl}/api/payment/callback`,
      success_url: `${baseUrl}/payment/success?order_id=${orderId}`,
      cancel_url: `${baseUrl}/payment/cancel?order_id=${orderId}`,
      description: `Payment for order ${orderId} - ${orderItems.length} items`,
    };

    // Initiate payment
    const paymentResponse = await rupantorPayService.initiatePayment(paymentData);

    if (paymentResponse.success) {
      // Update order with payment transaction ID
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentId: paymentResponse.transaction_id,
        }
      });

      return NextResponse.json({
        success: true,
        order_id: orderId,
        payment_url: paymentResponse.payment_url,
        transaction_id: paymentResponse.transaction_id,
        amount: finalAmount,
        currency,
      });
    } else {
      // Delete the order since payment failed
      await db.order.delete({
        where: { id: order.id }
      });

      return NextResponse.json(
        { 
          error: 'Payment initiation failed',
          details: paymentResponse.error 
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}