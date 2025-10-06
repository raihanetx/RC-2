import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get the first (and only) site config
    const config = await db.siteConfig.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (!config) {
      // Create default config if none exists
      const defaultConfig = await db.siteConfig.create({
        data: {
          heroBanner: [],
          favicon: '',
          contactPhone: '+880 1234-567890',
          contactWhatsapp: '+880 1234-567890',
          contactEmail: 'info@submonth.com',
          adminPassword: 'password123',
          usdToBdtRate: 110,
          siteLogo: '',
          heroSliderInterval: 5000,
          hotDealsSpeed: 40,
          rupantarPayEnabled: false,
          rupantarPayMerchantId: '',
          rupantarPaySecret: '',
          rupantarPayBaseUrl: 'https://pay.rupantar.com/api'
        }
      });

      return NextResponse.json({
        hero_banner: defaultConfig.heroBanner,
        favicon: defaultConfig.favicon,
        contact_info: {
          phone: defaultConfig.contactPhone,
          whatsapp: defaultConfig.contactWhatsapp,
          email: defaultConfig.contactEmail
        },
        admin_password: defaultConfig.adminPassword,
        usd_to_bdt_rate: defaultConfig.usdToBdtRate,
        site_logo: defaultConfig.siteLogo,
        hero_slider_interval: defaultConfig.heroSliderInterval,
        hot_deals_speed: defaultConfig.hotDealsSpeed,
        rupantar_pay_enabled: defaultConfig.rupantarPayEnabled,
        rupantar_pay_merchant_id: defaultConfig.rupantarPayMerchantId,
        rupantar_pay_secret: defaultConfig.rupantarPaySecret,
        rupantar_pay_base_url: defaultConfig.rupantarPayBaseUrl
      });
    }

    return NextResponse.json({
      hero_banner: config.heroBanner,
      favicon: config.favicon,
      contact_info: {
        phone: config.contactPhone,
        whatsapp: config.contactWhatsapp,
        email: config.contactEmail
      },
      admin_password: config.adminPassword,
      usd_to_bdt_rate: config.usdToBdtRate,
      site_logo: config.siteLogo,
      hero_slider_interval: config.heroSliderInterval,
      hot_deals_speed: config.hotDealsSpeed,
      rupantar_pay_enabled: config.rupantarPayEnabled,
      rupantar_pay_merchant_id: config.rupantarPayMerchantId,
      rupantar_pay_secret: config.rupantarPaySecret,
      rupantar_pay_base_url: config.rupantarPayBaseUrl
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}