'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  image: string;
  category: string;
  categorySlug: string;
  slug: string;
  pricing: Array<{
    duration: string;
    price: number;
  }>;
  stockOut?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  slug: string;
  icon: string;
}

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    long_description: '',
    image: '',
    category: '',
    pricing: [{ duration: '1 Month', price: 0 }],
    stock_out: false
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    long_description: '',
    image: '',
    category: '',
    pricing: [{ duration: '1 Month', price: 0 }],
    stock_out: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  const loadData = async () => {
    try {
      // Load categories from database
      const categoriesResponse = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
      
      // Load products from database
      const productsResponse = await fetch('/api/admin/products', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || productsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const slugify = (text: string): string => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleCreateProduct = async () => {
    try {
      const newProduct = {
        name: createForm.name,
        description: createForm.description,
        long_description: createForm.long_description,
        image: createForm.image,
        category: createForm.category,
        category_slug: slugify(createForm.category),
        slug: slugify(createForm.name),
        pricing: createForm.pricing,
        stock_out: createForm.stock_out
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        const updatedProducts = [...products, createdProduct];
        setProducts(updatedProducts);

        // Reset form
        setCreateForm({
          name: '',
          description: '',
          long_description: '',
          image: '',
          category: '',
          pricing: [{ duration: '1 Month', price: 0 }],
          stock_out: false
        });
        setIsCreateDialogOpen(false);
      } else {
        console.error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      const updatedProduct = {
        name: editForm.name,
        description: editForm.description,
        long_description: editForm.long_description,
        image: editForm.image,
        category: editForm.category,
        category_slug: slugify(editForm.category),
        slug: slugify(editForm.name),
        pricing: editForm.pricing,
        stock_out: editForm.stock_out
      };

      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        const updatedData = await response.json();
        const updatedProducts = products.map(product =>
          product.id === selectedProduct.id ? updatedData : product
        );
        setProducts(updatedProducts);

        setIsEditDialogOpen(false);
        setSelectedProduct(null);
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const updatedProducts = products.filter(product => product.id !== productId);
          setProducts(updatedProducts);
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      long_description: product.longDescription || '',
      image: product.image,
      category: product.category,
      pricing: product.pricing,
      stock_out: product.stockOut || false
    });
    setIsEditDialogOpen(true);
  };

  const addPricingOption = (isCreate: boolean = true) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        pricing: [...prev.pricing, { duration: '', price: 0 }]
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        pricing: [...prev.pricing, { duration: '', price: 0 }]
      }));
    }
  };

  const updatePricingOption = (index: number, field: 'duration' | 'price', value: string | number, isCreate: boolean = true) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        pricing: prev.pricing.map((option, i) =>
          i === index ? { ...option, [field]: value } : option
        )
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        pricing: prev.pricing.map((option, i) =>
          i === index ? { ...option, [field]: value } : option
        )
      }));
    }
  };

  const removePricingOption = (index: number, isCreate: boolean = true) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        pricing: prev.pricing.filter((_, i) => i !== index)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        pricing: prev.pricing.filter((_, i) => i !== index)
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Management (Neon DB)</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog with PostgreSQL database</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.slug} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief product description"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="long_description">Long Description</Label>
                  <Textarea
                    id="long_description"
                    value={createForm.long_description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, long_description: e.target.value }))}
                    placeholder="Detailed product description"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={createForm.image}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Pricing Options</Label>
                  <div className="space-y-2">
                    {createForm.pricing.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option.duration}
                          onChange={(e) => updatePricingOption(index, 'duration', e.target.value, true)}
                          placeholder="Duration (e.g., 1 Month)"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={option.price}
                          onChange={(e) => updatePricingOption(index, 'price', parseFloat(e.target.value) || 0, true)}
                          placeholder="Price"
                          className="w-24"
                        />
                        {createForm.pricing.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePricingOption(index, true)}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPricingOption(true)}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Pricing Option
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="stock_out"
                    checked={createForm.stock_out}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, stock_out: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="stock_out">Out of Stock</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProduct}>
                    Create Product
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.slug} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <i className="fas fa-box text-gray-400"></i>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {product.pricing && product.pricing.length > 0 ? (
                        <div className="text-sm">
                          ${Math.min(...product.pricing.map(p => p.price))} - ${Math.max(...product.pricing.map(p => p.price))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No pricing</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stockOut ? "destructive" : "default"}>
                        {product.stockOut ? "Out of Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(product)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.slug} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Short Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief product description"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="edit-long_description">Long Description</Label>
              <Textarea
                id="edit-long_description"
                value={editForm.long_description}
                onChange={(e) => setEditForm(prev => ({ ...prev, long_description: e.target.value }))}
                placeholder="Detailed product description"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={editForm.image}
                onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label>Pricing Options</Label>
              <div className="space-y-2">
                {editForm.pricing.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option.duration}
                      onChange={(e) => updatePricingOption(index, 'duration', e.target.value, false)}
                      placeholder="Duration (e.g., 1 Month)"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={option.price}
                      onChange={(e) => updatePricingOption(index, 'price', parseFloat(e.target.value) || 0, false)}
                      placeholder="Price"
                      className="w-24"
                    />
                    {editForm.pricing.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePricingOption(index, false)}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPricingOption(false)}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Pricing Option
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-stock_out"
                checked={editForm.stock_out}
                onChange={(e) => setEditForm(prev => ({ ...prev, stock_out: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="edit-stock_out">Out of Stock</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProduct}>
                Update Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}