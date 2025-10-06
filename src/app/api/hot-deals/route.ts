import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get active hot deals from database
    const hotDeals = await db.hotDeal.findMany({
      where: {
        isActive: true
      },
      include: {
        product: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Filter out deals where product is null or inactive
    const validDeals = hotDeals.filter(deal => deal.product !== null && deal.product.status === 'active');

    // Transform to match expected format
    const transformedDeals = validDeals.map(deal => ({
      productId: deal.productId,
      customTitle: deal.customTitle || deal.product.name,
      href: `/${deal.product.categorySlug}/${deal.product.slug}`,
      image: deal.customImage || deal.product.image,
      name: deal.customTitle || deal.product.name
    }));

    return NextResponse.json(transformedDeals);
  } catch (error) {
    console.error('Error fetching hot deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hot deals' },
      { status: 500 }
    );
  }
}