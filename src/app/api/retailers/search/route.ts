import { NextRequest, NextResponse } from 'next/server';
import { retailerService } from '@/lib/retailers/retailerService';
import { ComponentCategory } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category') as ComponentCategory | null;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "query" is required.' },
        { status: 400 }
      );
    }

    const results = await retailerService.searchProducts(query.trim(), category || undefined);
    return NextResponse.json({
      query,
      category,
      count: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error while searching retailer products.' },
      { status: 500 }
    );
  }
}
