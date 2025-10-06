import { NextRequest, NextResponse } from 'next/server';
import { rupantorPayService } from '@/lib/payment';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook data for debugging
    console.log('RupantorPay webhook received:', body);
    
    // Extract payment information from webhook
    const { 
      transaction_id, 
      status, 
      order_id, 
      amount, 
      currency,
      payment_method,
      customer_name,
      customer_email,
      customer_phone
    } = body;

    if (!transaction_id || !status) {
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Update order status based on payment status
    if (order_id && (status === 'COMPLETED' || status === 'completed')) {
      try {
        // Find the order in database
        const order = await db.order.findUnique({
          where: { orderNumber: order_id }
        });

        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: 'paid',
              paymentStatus: 'completed',
              paymentId: transaction_id,
              paymentMethod: payment_method || 'RupantorPay',
            }
          });
          
          console.log(`Order ${order_id} marked as completed via webhook`);
        } else {
          console.warn(`Order ${order_id} not found in database`);
        }
      } catch (orderError) {
        console.error('Error updating order from webhook:', orderError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      transaction_id,
      status
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const config = rupantorPayService.getConfig();
  return NextResponse.json({
    message: 'RupantorPay payment webhook endpoint',
    configured: config.configured,
    baseUrl: config.baseUrl,
    note: 'This webhook handles payment status updates from RupantorPay'
  });
}