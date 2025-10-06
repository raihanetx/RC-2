import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if slug already exists (if slug is being changed)
    if (body.slug !== existingCategory.slug) {
      const slugExists = await db.category.findUnique({
        where: { slug: body.slug }
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update category
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        icon: body.icon,
        status: body.status || 'active',
        sortOrder: body.sortOrder || existingCategory.sortOrder
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products and delete them first
    if (existingCategory._count.products > 0) {
      console.log(`Category has ${existingCategory._count.products} products, deleting them first...`);
      
      // First delete any hot deals associated with products in this category
      const productsInCategory = await db.product.findMany({
        where: { categoryId: id }
      });
      
      const productIds = productsInCategory.map(p => p.id);
      if (productIds.length > 0) {
        await db.hotDeal.deleteMany({
          where: {
            productId: {
              in: productIds
            }
          }
        });
      }
      
      // Then delete the products
      await db.product.deleteMany({
        where: { categoryId: id }
      });
    }

    // Delete category
    await db.category.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}