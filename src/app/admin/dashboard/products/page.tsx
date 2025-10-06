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
import ImageUpload from '@/components/admin/image-upload';

interface Product {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  image: string;
  category: string;
  categorySlug: string;
  slug: string;
  pricing: Array<{
    duration: string;
    price: number;
  }>;
  stockOut?: boolean;
  status?: string;
  featured?: boolean;
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    long_description: '',
    image: '',
    category: '',
    pricing: [{ duration: '1 Month', price: 10 }],
    stockOut: false,
    status: 'active',
    featured: false
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    long_description: '',
    image: '',
    category: '',
    pricing: [{ duration: '1 Month', price: 0 }],
    stockOut: false,
    status: 'active',
    featured: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const loadData = async () => {
    try {
      // Load products from PostgreSQL API with authentication
      const productsResponse = await fetch('/api/admin/products', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || productsData);
      } else {
        console.error('Failed to load products from API');
      }

      // Load categories from PostgreSQL API
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
      } else {
        console.error('Failed to load categories from API');
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

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => (product.status || 'active') === statusFilter);
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
      // Validation
      if (!createForm.name.trim()) {
        alert('Product name is required');
        return;
      }
      
      if (!createForm.description.trim()) {
        alert('Product description is required');
        return;
      }
      
      if (!createForm.category.trim()) {
        alert('Product category is required');
        return;
      }
      
      if (!createForm.pricing || createForm.pricing.length === 0 || createForm.pricing.some(p => !p.duration || p.duration.trim() === '')) {
        alert('At least one valid pricing option with duration is required');
        return;
      }

      const newProduct = {
        name: createForm.name,
        description: createForm.description,
        long_description: createForm.long_description,
        image: createForm.image,
        category: createForm.category,
        categorySlug: slugify(createForm.category),
        slug: slugify(createForm.name),
        pricing: createForm.pricing,
        stockOut: createForm.stockOut,
        status: createForm.status,
        featured: createForm.featured
      };

      console.log('Sending product data:', newProduct);

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
        setProducts(prev => [...prev, createdProduct]);

        // Reset form
        setCreateForm({
          name: '',
          description: '',
          long_description: '',
          image: '',
          category: '',
          pricing: [{ duration: '1 Month', price: 10 }],
          stockOut: false,
          status: 'active',
          featured: false
        });
        setIsCreateDialogOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to create product:', errorData);
        alert(`Failed to create product: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.');
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
        categorySlug: slugify(editForm.category),
        slug: slugify(editForm.name),
        pricing: editForm.pricing,
        stockOut: editForm.stockOut,
        status: editForm.status,
        featured: editForm.featured
      };

      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProducts(prev => prev.map(product =>
          product.id === selectedProduct.id ? updatedData : product
        ));

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
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        });

        if (response.ok) {
          setProducts(prev => prev.filter(product => product.id !== productId));
          setSelectedProducts(prev => prev.filter(id => id !== productId));
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    const confirmMessage = bulkAction === 'delete' 
      ? `Are you sure you want to delete ${selectedProducts.length} product(s)?`
      : `Are you sure you want to ${bulkAction} ${selectedProducts.length} product(s)?`;

    if (!confirm(confirmMessage)) return;

    try {
      const promises = selectedProducts.map(productId => {
        if (bulkAction === 'delete') {
          return fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer admin-token' }
          });
        } else if (bulkAction === 'activate' || bulkAction === 'deactivate') {
          return fetch(`/api/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer admin-token'
            },
            body: JSON.stringify({
              status: bulkAction === 'activate' ? 'active' : 'inactive'
            })
          });
        }
        return null;
      }).filter(Boolean);

      await Promise.all(promises);

      // Reload data
      await loadData();
      setSelectedProducts([]);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      long_description: product.long_description || '',
      image: product.image,
      category: product.category,
      pricing: product.pricing,
      stockOut: product.stockOut || false,
      status: product.status || 'active',
      featured: product.featured || false
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
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
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
                  <Label>Product Image</Label>
                  <ImageUpload
                    value={createForm.image}
                    onChange={(url) => setCreateForm(prev => ({ ...prev, image: url }))}
                    placeholder="Upload product image or enter URL"
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
                    checked={createForm.stockOut}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, stockOut: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="stock_out">Out of Stock</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateProduct} className="flex-1">
                    Create Product
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                    Cancel
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
          <div className="flex flex-col gap-4">
            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Bulk action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate</SelectItem>
                    <SelectItem value="deactivate">Deactivate</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  size="sm"
                  variant="outline"
                >
                  Apply
                </Button>
                <Button 
                  onClick={() => setSelectedProducts([])}
                  size="sm"
                  variant="ghost"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
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
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-box text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-500 mb-2">No products found</p>
              <p className="text-gray-400">Get started by adding your first product</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
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
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image || 'https://via.placeholder.com/60x60.png?text=No+Image'} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
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
                        <div className="text-sm">
                          ${Math.min(...product.pricing.map(p => p.price)).toFixed(2)} - ${Math.max(...product.pricing.map(p => p.price)).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={product.stockOut ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {product.stockOut ? 'Out of Stock' : 'In Stock'}
                          </Badge>
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status || 'active'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
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
                <Label>Product Image</Label>
                <ImageUpload
                  value={editForm.image}
                  onChange={(url) => setEditForm(prev => ({ ...prev, image: url }))}
                  placeholder="Upload product image or enter URL"
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
                  checked={editForm.stockOut}
                  onChange={(e) => setEditForm(prev => ({ ...prev, stockOut: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-stock_out">Out of Stock</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateProduct} className="flex-1">
                  Update Product
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}