import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test database performance
    const results = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.order.count(),
      db.user.count()
    ]);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return NextResponse.json({
      performance: {
        responseTime: `${responseTime}ms`,
        status: responseTime < 100 ? 'Excellent' : responseTime < 500 ? 'Good' : 'Needs Optimization'
      },
      stats: {
        products: results[0],
        categories: results[1],
        orders: results[2],
        users: results[3]
      },
      recommendations: {
        sqlite: results[0] < 1000 ? 'Perfect for SQLite' : 'Consider PostgreSQL',
        hosting: 'Railway or Vercel recommended',
        scaling: results[2] > 500 ? 'Plan database migration' : 'Current setup fine'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Performance test failed' }, { status: 500 });
  }
}