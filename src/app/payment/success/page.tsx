'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      
      // Check if this is a fallback payment and auto-complete it
      const urlParams = new URLSearchParams(window.location.search);
      const isFallback = urlParams.get('fallback') === 'true';
      const transactionId = urlParams.get('transaction_id');
      
      if (isFallback && transactionId) {
        // For fallback payments, automatically mark as completed
        completeFallbackPayment(orderId, transactionId);
      }
    }
  }, [orderId]);

  const completeFallbackPayment = async (orderId: string, transactionId: string) => {
    try {
      const response = await fetch('/api/payment/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          order_id: orderId,
          status: 'completed',
          amount: 0,
        }),
      });

      if (response.ok) {
        console.log('Fallback payment completed successfully');
        // Refresh order details
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error completing fallback payment:', error);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Order not found</p>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-semibold">{orderDetails.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {orderDetails.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-green-600">
                  {orderDetails.currency === 'USD' ? '$' : '৳'}{orderDetails.total}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{orderDetails.customerName}</p>
                <p className="text-sm text-gray-600">{orderDetails.customerEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Purchased Items */}
          <Card>
            <CardHeader>
              <CardTitle>Purchased Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderDetails.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">{item.duration} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      {orderDetails.currency === 'USD' ? '$' : '৳'}{item.price}
                    </p>
                  </div>
                ))}
              </div>
              
              {orderDetails.couponCode && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Coupon <span className="font-semibold">{orderDetails.couponCode}</span> applied
                  </p>
                  <p className="text-sm text-green-600">
                    Discount: {orderDetails.currency === 'USD' ? '$' : '৳'}{orderDetails.couponDiscount}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Continue Shopping
          </Button>
          <Button 
            onClick={() => router.push('/order-history')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            View Order History
          </Button>
        </div>

        {/* Delivery Information */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Delivery Information</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Digital Delivery:</strong> Your subscription details and activation instructions will be sent to your email address within 5-10 minutes.
              </p>
              <p className="text-blue-700 text-sm mt-2">
                If you don't receive the email, please check your spam folder or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}