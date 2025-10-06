'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/helpers';
import { Product, CartItem, Modal, SiteConfig } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { categorySlug } = params as { categorySlug: string };
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    hero_banner: [],
    favicon: '',
    contact_info: {
      phone: '+880 1234-567890',
      whatsapp: '+880 1234-567890',
      email: 'info@submonth.com'
    },
    admin_password: 'password123',
    usd_to_bdt_rate: 110,
    site_logo: '',
    hero_slider_interval: 5000,
    hot_deals_speed: 40
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<Modal>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);

  // Fetch data from database
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setAllProducts(productsData);
        
        // Filter products by category
        const products = productsData.filter(p => p.categorySlug === categorySlug);
        if (products.length > 0) {
          setCategoryProducts(products);
          setCategoryName(products[0].category);
        } else {
          // No products found for this category
          setCategoryProducts([]);
          setCategoryName('');
        }
      }
      
      // Fetch config
      const configResponse = await fetch('/api/config');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setSiteConfig(configData);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to load products. Please refresh the page.'
      });
    } finally {
      setLoading(false);
    }
  }, [categorySlug]); // Add categorySlug as dependency

  useEffect(() => {
    fetchData();
    
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
  }, [fetchData]);

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim() === '') {
      const products = allProducts.filter(p => p.categorySlug === categorySlug);
      setCategoryProducts(products);
    } else {
      const filtered = allProducts.filter(product =>
        product.categorySlug === categorySlug &&
        (
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setCategoryProducts(filtered);
    }
  }, [searchQuery, categorySlug, allProducts]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'BDT' : 'USD');
    localStorage.setItem('currency', currency);
  };

  const addToCart = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { productId, quantity }];
      }
    });
    
    // Show success modal
    const product = categoryProducts.find(p => p.id === productId);
    setModal({
      visible: true,
      type: 'success',
      title: 'Added to Cart',
      message: `${product?.name} has been added to your cart.`
    });
  };

  const buyNowDirect = (productId: string, quantity: number) => {
    // Add to cart and redirect immediately
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { productId, quantity }];
      }
    });
    
    // Redirect to checkout immediately
    window.location.href = '/checkout';
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, visible: false }));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
          <p className="text-xl text-gray-500 mb-6">Category not found</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="header flex justify-between items-center px-4 bg-white shadow-md sticky top-0 z-40 h-16 md:h-20">
        <div className="flex items-center justify-between w-full md:hidden gap-2">
          <Link href="/" className="logo flex-shrink-0">
            {siteConfig.site_logo ? (
              <img src={siteConfig.site_logo} alt="Submonth Logo" className="h-8" />
            ) : (
              <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-8" />
            )}
          </Link>
          <div className="relative flex-1 min-w-0">
            <Input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..." 
              className="w-full h-9 text-sm" 
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={toggleCurrency} variant="ghost" size="sm" className="flex items-center gap-1">
              <i className="fas fa-dollar-sign"></i>
              <span className="text-sm">{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cartCount > 0 && <span className="notification-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center w-full gap-5">
          <Link href="/" className="logo flex-shrink-0 flex items-center text-gray-800 no-underline">
            {siteConfig.site_logo ? (
              <img src={siteConfig.site_logo} alt="Submonth Logo" className="h-9" />
            ) : (
              <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-9" />
            )}
          </Link>
          <div className="relative flex-1">
            <Input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${categoryName}...`} 
              className="w-full"
            />
          </div>
          <div className="flex-shrink-0 flex items-center gap-5">
            <Button onClick={toggleCurrency} variant="ghost" className="flex items-center gap-2">
              <i className="fas fa-dollar-sign text-xl"></i>
              <span>{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cartCount > 0 && <span className="notification-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Custom Modal Popup */}
      {modal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-6">
            <div className="mb-4">
              <i className={`fas text-5xl ${
                modal.type === 'success' ? 'fa-check-circle text-green-500' :
                modal.type === 'error' ? 'fa-exclamation-circle text-red-500' :
                'fa-info-circle text-blue-500'
              }`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{modal.title}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <Button onClick={closeModal} className="w-full">
              OK
            </Button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <div className="bg-white min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">{categoryName}</h1>
              <p className="text-gray-600">
                {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {categoryProducts.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <p className="text-xl text-gray-500 mb-6">No products found matching your search.</p>
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categoryProducts.map(product => (
                  <Card key={product.id} className="product-grid-card">
                    <CardContent className="p-0">
                      <Link href={`/${product.categorySlug}/${product.slug}`} className="block">
                        <div className="product-card-image-container relative">
                          <img src={product.image || 'https://via.placeholder.com/400x300.png?text=No+Image'} alt={product.name} className="product-image" />
                          {product.stockOut && (
                            <Badge variant="destructive" className="absolute top-2 right-2">
                              Stock Out
                            </Badge>
                          )}
                        </div>
                        <div className="p-3 sm:p-4 flex flex-col flex-grow min-h-0">
                          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-2 line-clamp-1 flex-shrink-0">{product.name}</h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2 preserve-whitespace flex-grow">{product.description}</p>
                          <p className="text-lg md:text-xl font-extrabold text-purple-600 mb-3 flex-shrink-0">
                            {formatPrice(product.pricing[0].price, currency, siteConfig.usd_to_bdt_rate)}
                          </p>
                          <div className="flex flex-row gap-2 flex-shrink-0">
                            <Button 
                              onClick={(e) => {
                                e.preventDefault();
                                addToCart(product.id, 1);
                              }} 
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              disabled={product.stockOut}
                            >
                              Add to Cart
                            </Button>
                            <Button 
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.preventDefault();
                                buyNowDirect(product.id, 1);
                              }}
                              disabled={product.stockOut}
                            >
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}