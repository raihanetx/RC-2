'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/helpers';
import { Product, CartItem, Modal, SiteConfig } from '@/types';

export default function ProductDetail() {
  const params = useParams();
  const { categorySlug, productSlug } = params as { categorySlug: string; productSlug: string };
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
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
  const [modal, setModal] = useState<Modal>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);

  // Load cart and currency from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency === 'USD' || savedCurrency === 'BDT') {
        setCurrency(savedCurrency);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${productSlug}`);
        
        if (response.ok) {
          const product = await response.json();
          
          // Verify the category matches
          if (product && product.categorySlug === categorySlug) {
            setSelectedProduct(product);
          } else {
            setModal({
              visible: true,
              type: 'error',
              title: 'Product Not Found',
              message: 'The requested product could not be found.'
            });
          }
        } else if (response.status === 404) {
          setModal({
            visible: true,
            type: 'error',
            title: 'Product Not Found',
            message: 'The requested product could not be found.'
          });
        } else {
          setModal({
            visible: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to load product details.'
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to load product details.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (categorySlug && productSlug) {
      fetchProduct();
    }
  }, [categorySlug, productSlug]);

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const configData = await response.json();
          setSiteConfig(configData);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchConfig();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Save currency preference
  useEffect(() => {
    try {
      localStorage.setItem('currency', currency);
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  }, [currency]);

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
    if (selectedProduct) {
      setModal({
        visible: true,
        type: 'success',
        title: 'Added to Cart',
        message: `${selectedProduct.name} has been added to your cart.`
      });
    }
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, visible: false }));
  };

  // Calculate selected price
  const selectedPrice = selectedProduct ? selectedProduct.pricing[selectedDurationIndex].price : 0;
  const selectedPriceFormatted = formatPrice(selectedPrice, currency, siteConfig.usd_to_bdt_rate);
  
  // Format long description with line breaks
  const formattedLongDescription = selectedProduct?.longDescription?.replace(/\n/g, '<br />') || '';

  if (isLoading || !selectedProduct) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-xl text-gray-500">Loading product...</p>
          <p className="text-sm text-gray-400 mt-2">Category: {categorySlug}, Product: {productSlug}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
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

      <div className="max-w-6xl mx-auto px-6 sm:px-20 lg:px-[110px] pt-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div ref={imageContainerRef} className="rounded-lg shadow-lg overflow-hidden border">
              {isImageLoading && (
                <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              )}
              <img 
                src={selectedProduct.image || 'https://via.placeholder.com/400x400.png?text=No+Image'} 
                alt={selectedProduct.name} 
                onLoad={() => setIsImageLoading(false)} 
                onError={() => setIsImageLoading(false)}
                className={`w-full aspect-square object-cover rounded-lg transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : ''}`}
              />
            </div>

            {/* Product Info */}
            <div ref={infoContainerRef} className="flex flex-col justify-center">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{selectedProduct.name}</h1>
                {!selectedProduct.stockOut && (
                  <span className="text-sm font-semibold text-green-600 whitespace-nowrap">[In Stock]</span>
                )}
                {selectedProduct.stockOut && (
                  <span className="text-sm font-semibold text-red-600 whitespace-nowrap">[Stock Out]</span>
                )}
              </div>
              <p className="mt-2 text-gray-600">{selectedProduct.description}</p>
              <div className="mt-6">
                <span className="text-3xl font-bold text-purple-600">{selectedPriceFormatted}</span>
              </div>
              
              {/* Pricing Options */}
              {selectedProduct.pricing.length > 1 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select an option</label>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.pricing.map((p, index) => (
                      <Button
                        key={index}
                        variant={selectedDurationIndex === index ? "default" : "outline"}
                        onClick={() => setSelectedDurationIndex(index)}
                        className="relative"
                      >
                        {p.duration}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => addToCart(selectedProduct.id, 1)} 
                  variant="outline"
                  className="flex-1"
                >
                  Add to Cart
                </Button>
                <Button 
                  onClick={() => {
                    // Add to cart and redirect to checkout
                    addToCart(selectedProduct.id, 1);
                    setTimeout(() => {
                      window.location.href = '/checkout';
                    }, 500);
                  }}
                  disabled={selectedProduct.stockOut} 
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <div className="flex border-b justify-center">
              <Button
                variant={activeTab === 'description' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('description')}
                className="rounded-none border-b-2"
              >
                Description
              </Button>
              <Button
                variant={activeTab === 'reviews' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('reviews')}
                className="rounded-none border-b-2"
              >
                Reviews
              </Button>
            </div>
            <div className="pt-6">
              {activeTab === 'description' && (
                <div className="w-full max-w-4xl mx-auto">
                  <div 
                    className={`text-gray-700 leading-relaxed text-justify whitespace-pre-line ${
                      !isDescriptionExpanded ? 'line-clamp-4' : ''
                    }`}
                  >
                    {selectedProduct.longDescription || selectedProduct.description}
                  </div>
                  {selectedProduct.longDescription && selectedProduct.longDescription.length > 300 && (
                    <Button 
                      variant="link" 
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-2"
                    >
                      {!isDescriptionExpanded ? 'See More' : 'See Less'}
                    </Button>
                  )}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="w-full max-w-4xl mx-auto">
                  <div className="text-center py-8">
                    <i className="fas fa-star text-4xl text-gray-300 mb-4"></i>
                    <p className="text-xl text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}