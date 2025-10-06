import { NextResponse } from 'next/server';
import { rupantorPayService } from '@/lib/payment';

export async function GET() {
  const config = rupantorPayService.getConfig();
  
  return NextResponse.json({
    message: 'RupantorPay payment configuration',
    configured: config.configured,
    provider: 'RupantorPay',
    isTest: !config.configured,
    baseUrl: config.baseUrl,
    features: {
      createPayment: true,
      verifyPayment: true,
      webhook: true
    },
    note: !config.configured ? 
      'RupantorPay is not configured. Payments will be simulated.' :
      'RupantorPay is configured for production use.'
  });
}