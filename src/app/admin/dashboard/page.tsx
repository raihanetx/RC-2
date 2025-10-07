'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Package, 
  ShoppingCart, 
  Tags, 
  Flame, 
  CreditCard, 
  Image,
  Plus,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalHotDeals: number;
  activeProducts: number;
  pendingOrders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalHotDeals: 0,
    activeProducts: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load products count
      const productsResponse = await fetch('/api/admin/products', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products = productsData.products || productsData;
        const activeProducts = products.filter((p: any) => p.status === 'active').length;
        
        setStats(prev => ({
          ...prev,
          totalProducts: products.length,
          activeProducts: activeProducts
        }));
      }

      // Load categories count
      const categoriesResponse = await fetch('/api/admin/categories', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.categories || categoriesData;
        
        setStats(prev => ({
          ...prev,
          totalCategories: categories.length
        }));
      }

      // Load orders count
      const ordersResponse = await fetch('/api/admin/orders', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const orders = ordersData.orders || ordersData;
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
        
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          pendingOrders: pendingOrders
        }));
      }

      // Load hot deals count
      const hotDealsResponse = await fetch('/api/admin/hot-deals');
      if (hotDealsResponse.ok) {
        const hotDealsData = await hotDealsResponse.json();
        const hotDeals = Array.isArray(hotDealsData) ? hotDealsData : [];
        
        setStats(prev => ({
          ...prev,
          totalHotDeals: hotDeals.length
        }));
      }

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setMessage({ type: 'error', text: 'Failed to load dashboard statistics' });
    } finally {
      setLoading(false);
    }
  };

  const managementSections = [
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: Package,
      href: '/admin/dashboard/products',
      color: 'bg-blue-500',
      stats: `${stats.totalProducts} products`,
      actions: ['Add', 'Edit', 'Delete', 'Manage Stock']
    },
    {
      title: 'Categories',
      description: 'Organize products by categories',
      icon: Tags,
      href: '/admin/dashboard/categories',
      color: 'bg-green-500',
      stats: `${stats.totalCategories} categories`,
      actions: ['Add', 'Edit', 'Delete', 'Reorder']
    },
    {
      title: 'Orders',
      description: 'Manage customer orders',
      icon: ShoppingCart,
      href: '/admin/dashboard/orders',
      color: 'bg-purple-500',
      stats: `${stats.totalOrders} orders`,
      actions: ['View', 'Update Status', 'Manage']
    },
    {
      title: 'Hot Deals',
      description: 'Manage featured products',
      icon: Flame,
      href: '/admin/dashboard/hot-deals',
      color: 'bg-orange-500',
      stats: `${stats.totalHotDeals} deals`,
      actions: ['Add', 'Edit', 'Remove', 'Reorder']
    },
    {
      title: 'Settings',
      description: 'Configure store settings',
      icon: Settings,
      href: '/admin/dashboard/settings',
      color: 'bg-gray-500',
      stats: 'General config',
      actions: ['Upload Images', 'Payment', 'Contact']
    },
    {
      title: 'Coupons',
      description: 'Manage discount coupons',
      icon: CreditCard,
      href: '/admin/dashboard/coupons',
      color: 'bg-red-500',
      stats: 'Discount codes',
      actions: ['Create', 'Edit', 'Delete', 'Track Usage']
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Complete control over your e-commerce store</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Tags className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Flame className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hot Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHotDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 group cursor-pointer" onClick={() => window.location.href = section.href}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${section.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${section.color.replace('bg-', 'text-')}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {section.stats}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-purple-700 transition-colors">{section.title}</CardTitle>
                <p className="text-sm text-gray-600">{section.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {section.actions.map((action, actionIndex) => (
                      <Badge key={actionIndex} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage {section.title}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/dashboard/products">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Link href="/admin/dashboard/categories">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </Link>
            <Link href="/admin/dashboard/orders">
              <Button className="w-full" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Link href="/admin/dashboard/settings">
              <Button className="w-full" variant="outline">
                <Image className="h-4 w-4 mr-2" alt="" />
                Upload Banner
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">File Upload: Working</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">API: Operational</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}