import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await db.product.findFirst({
      where: {
        slug: slug,
        status: 'active'
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product from PostgreSQL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product from database' },
      { status: 500 }
    );
  }
}