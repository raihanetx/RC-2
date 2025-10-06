import { NextRequest, NextResponse } from 'next/server';
import { rupantorPayService } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Verify payment with RupantorPay
    const verification = await rupantorPayService.verifyPayment(transaction_id);

    if (verification && verification.success) {
      return NextResponse.json({
        success: true,
        data: verification,
        message: 'Payment verified successfully'
      });
    } else {
      return NextResponse.json(
        { 
          error: verification?.error || 'Payment verification failed',
          success: false
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const config = rupantorPayService.getConfig();
  return NextResponse.json({
    message: 'RupantorPay payment verification endpoint',
    configured: config.configured,
    baseUrl: config.baseUrl,
    usage: {
      method: 'POST',
      body: {
        transaction_id: 'string'
      }
    }
  });
}