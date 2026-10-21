import { NextResponse } from 'next/server';
import { retailerService } from '@/lib/retailers/retailerService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const statuses = await retailerService.getRetailerStatuses();
    const allConnected = statuses.every((s) => s.isConfigured && s.connectionStatus === 'connected');
    const anyConnected = statuses.some((s) => s.isConfigured && s.connectionStatus === 'connected');

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      liveSyncActive: anyConnected,
      fullyConnected: allConnected,
      retailers: statuses,
      cachingPolicy: {
        ttlHours: 1,
        restrictionNotice: 'Amazon Product Advertising API and Flipkart Affiliate terms require reasonable caching and fresh price retrieval prior to purchase.',
      },
      disclaimer: 'Live retailer credentials must be provisioned via server environment variables. Scraping is strictly prohibited.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to query retailer statuses.' },
      { status: 500 }
    );
  }
}
