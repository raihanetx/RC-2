'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice, calculateOrderTotals } from '@/lib/helpers';
import { CartItem, Product, SiteConfig } from '@/types';

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [products, setProducts] = useState<Product[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Simplified form for digital products
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    // Load currency preference
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency === 'USD' || savedCurrency === 'BDT') {
      setCurrency(savedCurrency);
    }

    // Load data from API
    const loadData = async () => {
      try {
        // Load products
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }

        // Load site config
        const configResponse = await fetch('/api/config');
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setSiteConfig(configData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'BDT' : 'USD');
    localStorage.setItem('currency', currency);
  };

  // Calculate totals using the unified function
  const { subtotal, tax, shipping, total } = calculateOrderTotals(cart, products);

  // Coupon functions
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          subtotal: subtotal,
          currency: currency
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDiscount(result.discount);
        setAppliedCoupon(couponCode.trim().toUpperCase());
        setCouponCode('');
      } else {
        setCouponError(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate form data
      if (!formData.firstName || !formData.email || !formData.phone) {
        alert('Please fill in all required fields.');
        setIsProcessing(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        setIsProcessing(false);
        return;
      }

      // Generate order number
      const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

      // Create payment with Rupantar Pay
      try {
        const paymentResponse = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: formData.firstName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            items: cart.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              durationIndex: 0 // Use first pricing option by default
            })),
            currency: currency,
            notes: formData.notes,
            couponCode: appliedCoupon,
            discount: discount
          })
        });

        const paymentResult = await paymentResponse.json();

        if (paymentResult.success && paymentResult.payment_url) {
          console.log('Redirecting to Rupantar Pay payment URL:', paymentResult.payment_url);
          
          // Clear cart after successful payment initiation
          localStorage.removeItem('cart');
          setCart([]);
          
          // Redirect to Rupantar Pay payment page
          window.location.href = paymentResult.payment_url;
        } else {
          // Handle payment creation error
          console.error('Payment creation failed:', paymentResult.error);
          alert(`Payment initialization failed: ${paymentResult.error || 'Unknown error'}`);
        }
      } catch (paymentError) {
        console.error('Payment service error:', paymentError);
        alert('Payment service is currently unavailable. Please try again later.');
      }

    } catch (error) {
      console.error('Order processing error:', error);
      alert('An error occurred while processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some digital products to your cart before checkout.</p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Continue Shopping
                </Button>
              </Link>
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Add sample items to cart for testing
                    const sampleCart = [
                      { productId: '1', quantity: 1 },
                      { productId: '2', quantity: 1 }
                    ];
                    setCart(sampleCart);
                    localStorage.setItem('cart', JSON.stringify(sampleCart));
                  }}
                >
                  Add Sample Items (for testing)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <div className="text-center py-12">
            <div className="mb-6">
              <i className="fas fa-check-circle text-6xl text-green-500"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Complete!</h1>
            <p className="text-xl text-gray-600 mb-6">Thank you for your purchase.</p>
            <p className="text-gray-600 mb-4">Your digital products will be delivered to your email.</p>
            <p className="text-gray-600 mb-8">Order confirmation has been sent to {formData.email}</p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Continue Shopping
                </Button>
              </Link>
              <div>
                <Link href="/order-history" className="text-purple-600 hover:text-purple-700">
                  View Order History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout - Submonth</title>
      </Head>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
      <header className="header flex justify-between items-center px-4 bg-white shadow-md sticky top-0 z-40 h-16 md:h-20">
        <div className="flex items-center justify-between w-full md:hidden gap-2">
          <Link href="/" className="logo flex-shrink-0">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-8" />
          </Link>
          <div className="flex items-center gap-3">
            <Button onClick={toggleCurrency} variant="ghost" size="sm" className="flex items-center gap-1">
              <i className="fas fa-dollar-sign"></i>
              <span className="text-sm">{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cart.length > 0 && <span className="notification-badge">{cart.length}</span>}
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center w-full gap-5">
          <Link href="/" className="logo flex-shrink-0 flex items-center text-gray-800 no-underline">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-9" />
          </Link>
          <div className="flex-shrink-0 flex items-center gap-5 ml-auto">
            <Button onClick={toggleCurrency} variant="ghost" className="flex items-center gap-2">
              <i className="fas fa-dollar-sign text-xl"></i>
              <span>{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cart.length > 0 && <span className="notification-badge">{cart.length}</span>}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Digital Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your digital product order below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-user text-purple-600"></i>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="firstName">Full Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">Digital products will be delivered to this email</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-sticky-note text-purple-600"></i>
                    Order Notes (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special instructions or notes for your order..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-credit-card text-purple-600"></i>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-check-circle text-green-600"></i>
                        <span className="font-medium text-green-800">RupantorPay Payment System</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Secure payment processing via RupantorPay. 
                        You will be redirected to the payment gateway to complete your purchase.
                      </p>
                    </div>
                    <div className="text-center py-4">
                      <i className="fas fa-credit-card text-4xl text-purple-600 mb-2"></i>
                      <p className="text-gray-600">Secure Payment Processing</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <i className="fas fa-lock text-green-600"></i>
                        <span className="text-sm text-gray-500">SSL Encrypted Transaction</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="mt-8">
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock"></i>
                      Complete Payment with RupantorPay
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  <i className="fas fa-shield-alt mr-1"></i>
                  Secure payment processing via RupantorPay gateway
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-shopping-bag text-purple-600"></i>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.map(item => {
                    const product = Array.isArray(products) ? products.find(p => p.id === item.productId) : null;
                    if (!product) return null;
                    
                    return (
                      <div key={item.productId} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-cube text-gray-400 text-xl"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {product.pricing[0].duration} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(product.pricing[0].price * item.quantity, currency, siteConfig?.usd_to_bdt_rate || 110)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Coupon Section */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <i className="fas fa-ticket-alt text-purple-600"></i>
                    Coupon Code
                  </div>
                  
                  {appliedCoupon ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-600"></i>
                          <span className="text-sm font-medium text-green-800">{appliedCoupon} applied</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        Discount: -{formatPrice(discount, currency, siteConfig?.usd_to_bdt_rate || 110)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={applyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        variant="outline"
                        size="sm"
                        className="px-4"
                      >
                        {isApplyingCoupon ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {couponError && (
                    <div className="text-sm text-red-600">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {couponError}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>{formatPrice(subtotal, currency, siteConfig?.usd_to_bdt_rate || 110)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-{formatPrice(discount, currency, siteConfig?.usd_to_bdt_rate || 110)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Delivery</span>
                    <span>Instant (Digital)</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">
                    {formatPrice(total - discount, currency, siteConfig?.usd_to_bdt_rate || 110)}
                  </span>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form"
                  className="w-full bg-purple-600 hover:bg-purple-700 mt-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock mr-2"></i>
                      Pay with RupantorPay
                    </>
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link href="/cart" className="text-sm text-purple-600 hover:text-purple-700">
                    ← Back to Cart
                  </Link>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <i className="fas fa-shield-alt"></i>
                    <span className="font-medium">Secure Digital Delivery</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Instant delivery to your email after purchase
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}