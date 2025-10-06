'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

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

  const handleRetryPayment = () => {
    if (orderDetails) {
      router.push('/checkout');
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cancel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Payment Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">What happened?</p>
                <p className="text-gray-700">
                  The payment process was interrupted or cancelled. This could be due to:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li>You clicked the cancel button</li>
                  <li>Payment window was closed</li>
                  <li>Connection issues during payment</li>
                  <li>Payment method was declined</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending Payment
                </span>
              </div>

              {orderId && (
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold">{orderId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What would you like to do?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  onClick={handleRetryPayment}
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Payment Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/cart')}
                  className="w-full"
                >
                  Review Cart
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="w-full flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Need Help?</strong> If you encountered any issues during payment, our support team is here to assist you.
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Email: support@submonth.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary (if available) */}
        {orderDetails && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
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
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    {orderDetails.currency === 'USD' ? '$' : '৳'}{orderDetails.total}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Information */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Security & Privacy</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                <strong>Your security is important to us:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>No payment information is stored on our servers</li>
                <li>All transactions are encrypted and secure</li>
                <li>Your order was saved but no payment was processed</li>
                <li>You can safely retry payment at any time</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}