'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Plus, Trash2, Image as ImageIcon, Settings, CreditCard, RefreshCw } from 'lucide-react';

interface SiteConfig {
  id: string;
  heroBanner: any[];
  favicon: string;
  siteLogo: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  usdToBdtRate: number;
  heroSliderInterval: number;
  hotDealsSpeed: number;
  rupantarPayEnabled: boolean;
  rupantarPayMerchantId: string;
  rupantarPaySecret: string;
  rupantarPayBaseUrl: string;
}

interface BannerItem {
  id: string;
  url: string;
  text: string;
  bgColor: string;
  type: 'image' | 'text';
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'favicon' | 'banner' | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setBanners(data.heroBanner || []);
      } else {
        console.error('Failed to load settings from admin API');
        // Fallback to public API
        const publicResponse = await fetch('/api/config');
        if (publicResponse.ok) {
          const data = await publicResponse.json();
          setConfig(data);
          setBanners(data.heroBanner || []);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      console.log('Saving settings with banners:', banners); // Debug log
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          ...config,
          heroBanner: banners
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        setBanners(updatedConfig.heroBanner || []);
        setMessage({ type: 'success', text: 'Settings saved successfully! Banners will now appear on your site.' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: `Failed to save settings: ${error.message}` });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon' | 'banner') => {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token'
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        if (type === 'logo') {
          setConfig(prev => prev ? { ...prev, siteLogo: data.url } : null);
        } else if (type === 'favicon') {
          setConfig(prev => prev ? { ...prev, favicon: data.url } : null);
        }
        
        setMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!` });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: `Failed to upload ${type}: ${error.message}` });
    } finally {
      setUploading(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeleteImage = async (type: 'logo' | 'favicon', imageUrl: string) => {
    if (!confirm(`Are you sure you want to delete the ${type}?`)) return;
    
    try {
      // Extract filename from URL
      const filename = imageUrl.split('/').pop();
      if (!filename) throw new Error('Invalid image URL');
      
      // Delete file from server
      const deleteResponse = await fetch(`/api/upload?filename=${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      
      if (deleteResponse.ok) {
        // Update config to remove image
        if (type === 'logo') {
          setConfig(prev => prev ? { ...prev, siteLogo: '' } : null);
        } else if (type === 'favicon') {
          setConfig(prev => prev ? { ...prev, favicon: '' } : null);
        }
        
        setMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!` });
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setMessage({ type: 'error', text: `Failed to delete ${type}: ${error.message}` });
    } finally {
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const addBanner = (type: 'image' | 'text') => {
    const newBanner: BannerItem = {
      id: Date.now().toString(),
      url: '',
      text: type === 'text' ? 'New Banner Text' : '',
      bgColor: type === 'text' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : '',
      type
    };
    setBanners([...banners, newBanner]);
  };

  const updateBanner = (id: string, updates: Partial<BannerItem>) => {
    setBanners(banners.map(banner => 
      banner.id === id ? { ...banner, ...updates } : banner
    ));
  };

  const removeBanner = (id: string) => {
    setBanners(banners.filter(banner => banner.id !== id));
  };

  const handleBannerImageUpload = async (file: File, bannerId: string) => {
    setUploading('banner');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token'
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        updateBanner(bannerId, { url: data.url });
        setMessage({ type: 'success', text: 'Banner image uploaded successfully!' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading banner image:', error);
      setMessage({ type: 'error', text: `Failed to upload banner image: ${error.message}` });
    } finally {
      setUploading(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeleteBannerImage = async (bannerId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this banner image?')) return;
    
    try {
      // Extract filename from URL
      const filename = imageUrl.split('/').pop();
      if (!filename) throw new Error('Invalid image URL');
      
      // Delete file from server
      const deleteResponse = await fetch(`/api/upload?filename=${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      
      if (deleteResponse.ok) {
        // Update banner to remove image
        updateBanner(bannerId, { url: '' });
        setMessage({ type: 'success', text: 'Banner image deleted successfully!' });
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting banner image:', error);
      setMessage({ type: 'error', text: `Failed to delete banner image: ${error.message}` });
    } finally {
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newBanners.length) {
      [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
      setBanners(newBanners);
    }
  };

  // File management functions
  const loadUploadedFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch('/api/admin/files', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      
      if (response.ok) {
        const files = await response.json();
        setUploadedFiles(files);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadUploadedFiles();
  }, []);

  const deleteFile = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch(`/api/upload?filename=${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      
      if (response.ok) {
        setUploadedFiles(uploadedFiles.filter(file => file.filename !== filename));
        setMessage({ type: 'success', text: 'File deleted successfully!' });
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage({ type: 'error', text: `Failed to delete file: ${error.message}` });
    } finally {
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your store configuration and appearance</p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Contact
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div>
                <Label htmlFor="logo" className="text-base font-medium">Store Logo</Label>
                <p className="text-sm text-gray-500 mb-3">Upload your store logo. Recommended size: 200x60px</p>
                <div className="flex items-center gap-4">
                  {config.siteLogo && (
                    <div className="relative">
                      <div className="w-32 h-20 border rounded-lg overflow-hidden bg-gray-50">
                        <img src={config.siteLogo} alt="Store Logo" className="w-full h-full object-contain" />
                      </div>
                      <Button
                        onClick={() => handleDeleteImage('logo', config.siteLogo)}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                      disabled={uploading === 'logo'}
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById('logo')?.click()}
                      disabled={uploading === 'logo'}
                      variant="outline"
                    >
                      {uploading === 'logo' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {config.siteLogo ? 'Change Logo' : 'Upload Logo'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Favicon Upload */}
              <div>
                <Label htmlFor="favicon" className="text-base font-medium">Favicon</Label>
                <p className="text-sm text-gray-500 mb-3">Upload your favicon. Recommended size: 32x32px or 16x16px</p>
                <div className="flex items-center gap-4">
                  {config.favicon && (
                    <div className="relative">
                      <div className="w-16 h-16 border rounded-lg overflow-hidden bg-gray-50">
                        <img src={config.favicon} alt="Favicon" className="w-full h-full object-contain" />
                      </div>
                      <Button
                        onClick={() => handleDeleteImage('favicon', config.favicon)}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div>
                    <Input
                      id="favicon"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'favicon');
                      }}
                      disabled={uploading === 'favicon'}
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById('favicon')?.click()}
                      disabled={uploading === 'favicon'}
                      variant="outline"
                    >
                      {uploading === 'favicon' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {config.favicon ? 'Change Favicon' : 'Upload Favicon'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Currency Settings */}
              <div>
                <Label htmlFor="usdToBdtRate" className="text-base font-medium">USD to BDT Exchange Rate</Label>
                <p className="text-sm text-gray-500 mb-3">Set the exchange rate for USD to BDT conversion</p>
                <Input
                  id="usdToBdtRate"
                  type="number"
                  value={config.usdToBdtRate}
                  onChange={(e) => setConfig({ ...config, usdToBdtRate: parseFloat(e.target.value) || 110 })}
                  min="0"
                  step="0.01"
                />
              </div>

              <Separator />

              {/* Slider Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heroSliderInterval" className="text-base font-medium">Hero Slider Interval (ms)</Label>
                  <p className="text-sm text-gray-500 mb-3">Time between slide changes in milliseconds</p>
                  <Input
                    id="heroSliderInterval"
                    type="number"
                    value={config.heroSliderInterval}
                    onChange={(e) => setConfig({ ...config, heroSliderInterval: parseInt(e.target.value) || 5000 })}
                    min="1000"
                    step="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="hotDealsSpeed" className="text-base font-medium">Hot Deals Speed (s)</Label>
                  <p className="text-sm text-gray-500 mb-3">Animation duration for hot deals scrolling</p>
                  <Input
                    id="hotDealsSpeed"
                    type="number"
                    value={config.hotDealsSpeed}
                    onChange={(e) => setConfig({ ...config, hotDealsSpeed: parseInt(e.target.value) || 40 })}
                    min="10"
                    step="5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners */}
        <TabsContent value="banners" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hero Banners</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => addBanner('text')} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Text Banner
                  </Button>
                  <Button onClick={() => addBanner('image')} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image Banner
                  </Button>
                  <Button onClick={saveSettings} disabled={saving} className="bg-green-600 hover:bg-green-700" size="sm">
                    {saving ? 'Saving...' : 'Save Banners'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Manage your homepage hero banners. These will rotate automatically on your site. Don't forget to save changes!
              </p>
            </CardHeader>
            <CardContent>
              {banners.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No banners added yet</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => addBanner('text')} variant="outline">
                      Add Text Banner
                    </Button>
                    <Button onClick={() => addBanner('image')} variant="outline">
                      Add Image Banner
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner, index) => (
                    <Card key={banner.id} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={banner.type === 'image' ? 'default' : 'secondary'}>
                            {banner.type === 'image' ? 'Image' : 'Text'} Banner
                          </Badge>
                          <span className="text-sm text-gray-500">Position {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => moveBanner(index, 'up')}
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <i className="fas fa-chevron-up text-xs"></i>
                          </Button>
                          <Button
                            onClick={() => moveBanner(index, 'down')}
                            variant="ghost"
                            size="sm"
                            disabled={index === banners.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <i className="fas fa-chevron-down text-xs"></i>
                          </Button>
                          <Button
                            onClick={() => removeBanner(banner.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {banner.type === 'image' ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Image</Label>
                            <div className="flex items-center gap-4 mt-2">
                              {banner.url && (
                                <div className="relative">
                                  <div className="w-48 h-24 border rounded-lg overflow-hidden bg-gray-50">
                                    <img src={banner.url} alt="Banner" className="w-full h-full object-cover" />
                                  </div>
                                  <Button
                                    onClick={() => handleDeleteBannerImage(banner.id, banner.url)}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              <div>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleBannerImageUpload(file, banner.id);
                                  }}
                                  disabled={uploading === 'banner'}
                                  className="hidden"
                                  id={`banner-image-${banner.id}`}
                                />
                                <Button
                                  onClick={() => document.getElementById(`banner-image-${banner.id}`)?.click()}
                                  disabled={uploading === 'banner'}
                                  variant="outline"
                                  size="sm"
                                >
                                  {uploading === 'banner' ? 'Uploading...' : 'Upload Image'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label>Text</Label>
                            <Input
                              value={banner.text}
                              onChange={(e) => updateBanner(banner.id, { text: e.target.value })}
                              placeholder="Enter banner text"
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Background Color</Label>
                            <Input
                              value={banner.bgColor}
                              onChange={(e) => updateBanner(banner.id, { bgColor: e.target.value })}
                              placeholder="bg-gradient-to-r from-purple-500 to-indigo-600"
                              className="mt-2"
                            />
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Management */}
        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>File Management</CardTitle>
                <Button onClick={loadUploadedFiles} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Manage all uploaded files. Delete unused files to free up space.
              </p>
            </CardHeader>
            <CardContent>
              {loadingFiles ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading files...</p>
                </div>
              ) : uploadedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 mb-4">
                    Total files: {uploadedFiles.length} | Total storage: {formatFileSize(uploadedFiles.reduce((total, file) => total + (file.size || 0), 0))}
                  </div>
                  <div className="grid gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {file.type?.startsWith('image/') ? (
                              <img src={file.url} alt={file.filename} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <i className="fas fa-file text-gray-400"></i>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{file.filename}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size || 0)} • {new Date(file.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => window.open(file.url, '_blank')}
                            variant="outline"
                            size="sm"
                          >
                            <i className="fas fa-external-link-alt h-3 w-3"></i>
                          </Button>
                          <Button
                            onClick={() => navigator.clipboard.writeText(file.url)}
                            variant="outline"
                            size="sm"
                          >
                            <i className="fas fa-copy h-3 w-3"></i>
                          </Button>
                          <Button
                            onClick={() => deleteFile(file.filename)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rupantar Pay Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Rupantar Pay</Label>
                  <p className="text-sm text-gray-500">Allow payments through Rupantar Pay gateway</p>
                </div>
                <Switch
                  checked={config.rupantarPayEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, rupantarPayEnabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="merchantId">Merchant ID</Label>
                  <Input
                    id="merchantId"
                    value={config.rupantarPayMerchantId}
                    onChange={(e) => setConfig({ ...config, rupantarPayMerchantId: e.target.value })}
                    placeholder="Enter your Rupantar Pay Merchant ID"
                    disabled={!config.rupantarPayEnabled}
                  />
                </div>

                <div>
                  <Label htmlFor="secret">Secret Key</Label>
                  <Input
                    id="secret"
                    type="password"
                    value={config.rupantarPaySecret}
                    onChange={(e) => setConfig({ ...config, rupantarPaySecret: e.target.value })}
                    placeholder="Enter your Rupantar Pay Secret Key"
                    disabled={!config.rupantarPayEnabled}
                  />
                </div>

                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={config.rupantarPayBaseUrl}
                    onChange={(e) => setConfig({ ...config, rupantarPayBaseUrl: e.target.value })}
                    placeholder="https://pay.rupantar.com/api"
                    disabled={!config.rupantarPayEnabled}
                  />
                </div>
              </div>

              {config.rupantarPayEnabled && (
                <Alert>
                  <AlertDescription>
                    Make sure to test your Rupantar Pay configuration after saving these settings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={config.contactPhone}
                  onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                  placeholder="+880 1234-567890"
                />
              </div>

              <div>
                <Label htmlFor="contactWhatsapp">WhatsApp Number</Label>
                <Input
                  id="contactWhatsapp"
                  value={config.contactWhatsapp}
                  onChange={(e) => setConfig({ ...config, contactWhatsapp: e.target.value })}
                  placeholder="+880 1234-567890"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  placeholder="info@yourstore.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="px-8">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}