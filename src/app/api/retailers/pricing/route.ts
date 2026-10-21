import { NextRequest, NextResponse } from 'next/server';
import { retailerService } from '@/lib/retailers/retailerService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId');

    if (!componentId) {
      return NextResponse.json(
        { error: 'Query parameter "componentId" is required.' },
        { status: 400 }
      );
    }

    const data = await retailerService.getPricingForComponent(componentId);
    if (!data) {
      return NextResponse.json(
        { error: `Component with ID "${componentId}" not found in catalog.` },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error while fetching retailer pricing.' },
      { status: 500 }
    );
  }
}
