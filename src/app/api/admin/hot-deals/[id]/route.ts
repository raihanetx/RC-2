import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const hotDeal = await db.hotDeal.update({
      where: { id },
      data: {
        productId: data.productId,
        customTitle: data.customTitle,
        customImage: data.customImage,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        updatedAt: new Date()
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(hotDeal);
  } catch (error) {
    console.error('Error updating hot deal:', error);
    return NextResponse.json(
      { error: 'Failed to update hot deal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await db.hotDeal.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Hot deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting hot deal:', error);
    return NextResponse.json(
      { error: 'Failed to delete hot deal' },
      { status: 500 }
    );
  }
}