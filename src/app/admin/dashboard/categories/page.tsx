'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  status?: string;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

const availableIcons = [
  'fas fa-palette',
  'fas fa-tasks',
  'fas fa-code',
  'fas fa-bullhorn',
  'fas fa-graduation-cap',
  'fas fa-chart-line',
  'fas fa-camera',
  'fas fa-music',
  'fas fa-video',
  'fas fa-book',
  'fas fa-gamepad',
  'fas fa-heartbeat',
  'fas fa-plane',
  'fas fa-car',
  'fas fa-home',
  'fas fa-shopping-bag',
  'fas fa-utensils',
  'fas fa-dumbbell',
  'fas fa-briefcase',
  'fas fa-users'
];

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    icon: 'fas fa-palette'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    icon: 'fas fa-palette'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  const loadData = async () => {
    try {
      // Load categories from PostgreSQL API with authentication
      const categoriesResponse = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || categoriesData);
      } else {
        console.error('Failed to load categories from API');
        setCategories([]);
      }

      // Load products to get accurate counts
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
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setCategories([]);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductCount = (categorySlug: string) => {
    return products.filter(product => product.categorySlug === categorySlug).length;
  };

  const filterCategories = () => {
    let filtered = categories;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const slugify = (text: string): string => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleCreateCategory = async () => {
    try {
      // Validation
      if (!createForm.name.trim()) {
        alert('Please enter a category name');
        return;
      }

      const newCategory = {
        name: createForm.name.trim(),
        slug: slugify(createForm.name),
        icon: createForm.icon,
        status: 'active'
      };

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories(prev => [...prev, createdCategory]);

        // Reset form
        setCreateForm({
          name: '',
          icon: 'fas fa-palette'
        });
        setIsCreateDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Error creating category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category. Please try again.');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      const updatedCategory = {
        name: editForm.name,
        slug: slugify(editForm.name),
        icon: editForm.icon,
        status: 'active'
      };

      const response = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(updatedCategory)
      });

      if (response.ok) {
        const updated = await response.json();
        setCategories(prev => prev.map(category =>
          category.id === selectedCategory.id ? updated : category
        ));

        setIsEditDialogOpen(false);
        setSelectedCategory(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Error updating category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: string, categorySlug: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all products in this category. This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        });

        if (response.ok) {
          setCategories(prev => prev.filter(category => category.id !== categoryId));
          // Also remove the deleted products from the products state
          setProducts(prev => prev.filter(product => product.categorySlug !== categorySlug));
        } else {
          const error = await response.json();
          alert(error.error || 'Error deleting category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
      }
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name,
      icon: category.icon
    });
    setIsEditDialogOpen(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-2">Manage product categories</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {availableIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setCreateForm(prev => ({ ...prev, icon }))}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          createForm.icon === icon
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <i className={`${icon} text-lg`}></i>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateCategory} className="flex-1">
                    Create Category
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-folder text-purple-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Empty Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => getProductCount(cat.slug) === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-folder-open text-gray-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + getProductCount(cat.slug), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-box text-green-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex-1">
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-folder text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-500 mb-2">No categories found</p>
              <p className="text-gray-400">Get started by adding your first category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => {
                    const productCount = getProductCount(category.slug);
                    return (
                      <TableRow key={category.slug}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <i className={`${category.icon} text-purple-600`}></i>
                            </div>
                            <div className="font-medium">{category.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{category.slug}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={productCount > 0 ? "default" : "secondary"} className={productCount > 0 ? "bg-green-100 text-green-800" : ""}>
                            {productCount} {productCount === 1 ? 'Product' : 'Products'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <i className={`${category.icon} text-gray-600`}></i>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(category)}
                              title="Edit Category"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id, category.slug)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Category"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, icon }))}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        editForm.icon === icon
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${icon} text-lg`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateCategory} className="flex-1">
                  Update Category
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