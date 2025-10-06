import { NextRequest, NextResponse } from 'next/server';
import { rupantorPayService } from '@/lib/payment';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, order_id, status, amount } = body;

    console.log('Payment callback received:', { transaction_id, order_id, status, amount });

    if (!transaction_id || !order_id) {
      return NextResponse.json(
        { error: 'Missing transaction ID or order ID' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await db.order.findUnique({
      where: { orderNumber: order_id },
      include: {
        items: true,
        coupons: true,
      }
    });

    if (!order) {
      console.error('Order not found:', order_id);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment service is configured
    const paymentConfig = rupantorPayService.getConfig();
    if (!paymentConfig.configured) {
      console.warn('Payment service not configured, using fallback verification');
      
      // For fallback transactions, mark as paid if status indicates success
      if (status === 'completed' || status === 'success') {
        await db.order.update({
          where: { id: order.id },
          data: {
            status: 'paid',
            paymentStatus: 'completed',
            paymentId: transaction_id,
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Payment processed (fallback mode)',
          order_id: order_id,
          status: 'completed',
        });
      } else {
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: status || 'failed',
          }
        });

        return NextResponse.json(
          { 
            error: 'Payment failed',
            details: 'Payment service not configured'
          },
          { status: 400 }
        );
      }
    }

    // Verify payment with Rupantor Pay
    const verification = await rupantorPayService.verifyPayment(transaction_id);

    if (verification.success && verification.status === 'completed') {
      // Update order status
      await db.order.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          paymentStatus: 'completed',
          paymentId: transaction_id,
        }
      });

      // Update coupon usage if applicable
      if (order.couponCode) {
        const coupon = await db.coupon.findUnique({
          where: { code: order.couponCode }
        });

        if (coupon) {
          await db.coupon.update({
            where: { id: coupon.id },
            data: {
              usageCount: coupon.usageCount + 1,
            }
          });
        }
      }

      console.log('Payment completed successfully for order:', order_id);

      return NextResponse.json({
        success: true,
        message: 'Payment verified and order updated',
        order_id: order_id,
        status: 'completed',
      });
    } else {
      // Payment failed or is pending
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: verification.status || 'failed',
        }
      });

      console.log('Payment verification failed:', verification.error);

      return NextResponse.json(
        { 
          error: 'Payment verification failed',
          details: verification.error 
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for status checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transaction_id = searchParams.get('transaction_id');

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Missing transaction ID' },
        { status: 400 }
      );
    }

    // Check if payment service is configured
    const paymentConfig = rupantorPayService.getConfig();
    if (!paymentConfig.configured) {
      return NextResponse.json({
        success: false,
        error: 'Payment service not configured',
      });
    }

    const verification = await rupantorPayService.verifyPayment(transaction_id);

    return NextResponse.json(verification);

  } catch (error: any) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}