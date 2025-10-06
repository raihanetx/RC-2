import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Simple admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const config = await db.siteConfig.findFirst();
    
    if (!config) {
      // Create default config if none exists
      const defaultConfig = await db.siteConfig.create({
        data: {
          siteLogo: '',
          favicon: '',
          heroBanner: [],
          contactPhone: '',
          contactWhatsapp: '',
          contactEmail: '',
          usdToBdtRate: 110,
          heroSliderInterval: 5000,
          hotDealsSpeed: 40,
          rupantarPayEnabled: false,
          rupantarPayMerchantId: '',
          rupantarPaySecret: '',
          rupantarPayBaseUrl: 'https://pay.rupantar.com/api',
        }
      });
      return NextResponse.json(defaultConfig);
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Simple admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Settings update request:', body); // Debug log
    
    const existingConfig = await db.siteConfig.findFirst();
    
    if (existingConfig) {
      const updatedConfig = await db.siteConfig.update({
        where: { id: existingConfig.id },
        data: {
          siteLogo: body.siteLogo !== undefined ? body.siteLogo : existingConfig.siteLogo,
          favicon: body.favicon !== undefined ? body.favicon : existingConfig.favicon,
          heroBanner: body.heroBanner !== undefined ? body.heroBanner : existingConfig.heroBanner,
          contactPhone: body.contactPhone !== undefined ? body.contactPhone : existingConfig.contactPhone,
          contactWhatsapp: body.contactWhatsapp !== undefined ? body.contactWhatsapp : existingConfig.contactWhatsapp,
          contactEmail: body.contactEmail !== undefined ? body.contactEmail : existingConfig.contactEmail,
          usdToBdtRate: body.usdToBdtRate !== undefined ? body.usdToBdtRate : existingConfig.usdToBdtRate,
          heroSliderInterval: body.heroSliderInterval !== undefined ? body.heroSliderInterval : existingConfig.heroSliderInterval,
          hotDealsSpeed: body.hotDealsSpeed !== undefined ? body.hotDealsSpeed : existingConfig.hotDealsSpeed,
          rupantarPayEnabled: body.rupantarPayEnabled !== undefined ? body.rupantarPayEnabled : existingConfig.rupantarPayEnabled,
          rupantarPayMerchantId: body.rupantarPayMerchantId !== undefined ? body.rupantarPayMerchantId : existingConfig.rupantarPayMerchantId,
          rupantarPaySecret: body.rupantarPaySecret !== undefined ? body.rupantarPaySecret : existingConfig.rupantarPaySecret,
          rupantarPayBaseUrl: body.rupantarPayBaseUrl !== undefined ? body.rupantarPayBaseUrl : existingConfig.rupantarPayBaseUrl,
        }
      });
      
      console.log('Settings updated successfully:', updatedConfig); // Debug log
      return NextResponse.json(updatedConfig);
    } else {
      const newConfig = await db.siteConfig.create({
        data: {
          siteLogo: body.siteLogo || '',
          favicon: body.favicon || '',
          heroBanner: body.heroBanner || [],
          contactPhone: body.contactPhone || '',
          contactWhatsapp: body.contactWhatsapp || '',
          contactEmail: body.contactEmail || '',
          usdToBdtRate: body.usdToBdtRate || 110,
          heroSliderInterval: body.heroSliderInterval || 5000,
          hotDealsSpeed: body.hotDealsSpeed || 40,
          rupantarPayEnabled: body.rupantarPayEnabled || false,
          rupantarPayMerchantId: body.rupantarPayMerchantId || '',
          rupantarPaySecret: body.rupantarPaySecret || '',
          rupantarPayBaseUrl: body.rupantarPayBaseUrl || 'https://pay.rupantar.com/api',
        }
      });
      
      console.log('Settings created successfully:', newConfig); // Debug log
      return NextResponse.json(newConfig);
    }
    
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings: ' + error.message },
      { status: 500 }
    );
  }
}
