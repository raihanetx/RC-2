import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const hotDeals = await db.hotDeal.findMany({
      include: {
        product: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(hotDeals);
  } catch (error) {
    console.error('Error fetching hot deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hot deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const hotDeal = await db.hotDeal.create({
      data: {
        productId: data.productId,
        customTitle: data.customTitle,
        customImage: data.customImage,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(hotDeal);
  } catch (error) {
    console.error('Error creating hot deal:', error);
    return NextResponse.json(
      { error: 'Failed to create hot deal' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { hotDeals } = data;
    
    // Update sort orders in a transaction
    await db.$transaction(async (tx) => {
      for (const hotDeal of hotDeals) {
        await tx.hotDeal.update({
          where: { id: hotDeal.id },
          data: { sortOrder: hotDeal.sortOrder }
        });
      }
    });

    // Return updated hot deals
    const updatedHotDeals = await db.hotDeal.findMany({
      include: {
        product: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(updatedHotDeals);
  } catch (error) {
    console.error('Error reordering hot deals:', error);
    return NextResponse.json(
      { error: 'Failed to reorder hot deals' },
      { status: 500 }
    );
  }
}