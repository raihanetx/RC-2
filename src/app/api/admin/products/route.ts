import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import adminService from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Simple admin authentication for demo purposes
    // In production, use proper JWT/session validation
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get products and total count
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          categoryObj: true
        }
      }),
      db.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simple admin authentication for demo purposes
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Log the received data for debugging
    console.log('Received product data:', body);
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'categorySlug', 'slug', 'pricing'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Ensure slug is not empty
    if (!body.slug || body.slug.trim() === '') {
      return NextResponse.json(
        { error: 'Product slug is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await db.product.findFirst({
      where: { slug: body.slug }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Create product
    const product = await db.product.create({
      data: {
        name: body.name,
        description: body.description,
        longDescription: body.long_description || body.longDescription || '',
        image: body.image || '',
        category: body.category,
        categorySlug: body.categorySlug,
        slug: body.slug,
        pricing: body.pricing,
        stockOut: body.stockOut || false,
        status: body.status || 'active',
        featured: body.featured || false,
        categoryId: body.categoryId || null
      }
    });

    console.log('Product created successfully:', product);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}