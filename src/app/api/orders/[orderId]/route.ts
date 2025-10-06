import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    const order = await db.order.findUnique({
      where: { orderNumber: orderId },
      include: {
        items: true,
        coupons: true,
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      total: order.total,
      currency: order.currency,
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        duration: item.duration
      }))
    });

  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}