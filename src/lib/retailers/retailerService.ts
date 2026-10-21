import { COMPONENT_CATALOG } from '@/data/catalog';
import { IndianRetailerRegistry } from '@/data/retailerAdapters';
import {
  NormalizedRetailerOffer,
  RetailerApiStatus,
  RetailerPricingResponse,
  ComponentCategory,
} from '@/types';
import { AmazonIndiaAdapter } from './amazonAdapter';
import { FlipkartAffiliateAdapter } from './flipkartAdapter';
import { IServerRetailerAdapter, ProductMatchCriteria } from './types';

export class RetailerAggregationService {
  private adapters: IServerRetailerAdapter[] = [];

  constructor(customAdapters?: IServerRetailerAdapter[]) {
    if (customAdapters && customAdapters.length > 0) {
      this.adapters = customAdapters;
    } else {
      this.adapters = [
        new AmazonIndiaAdapter(),
        new FlipkartAffiliateAdapter(),
      ];
    }
  }

  public async getRetailerStatuses(): Promise<RetailerApiStatus[]> {
    const statuses: RetailerApiStatus[] = [];
    for (const adapter of this.adapters) {
      statuses.push(await adapter.getStatus());
    }
    return statuses;
  }

  public async getPricingForComponent(componentId: string): Promise<RetailerPricingResponse | null> {
    const component = COMPONENT_CATALOG.find((c) => c.id === componentId);
    if (!component) return null;

    const criteria: ProductMatchCriteria = {
      componentId: component.id,
      name: component.name,
      brand: component.brand,
      category: component.category,
      modelNumber: component.modelNumber,
      asin: component.asin,
      flipkartId: component.flipkartId,
      expectedPriceINR: component.priceINR,
    };

    const offers: NormalizedRetailerOffer[] = [];
    const statuses = await this.getRetailerStatuses();
    const liveConnected = statuses.some((s) => s.isConfigured && s.connectionStatus === 'connected');

    // Query active adapters concurrently with safe settlements
    const adapterPromises = this.adapters.map(async (adapter) => {
      try {
        if (!adapter.isConfigured()) return null;
        return await adapter.fetchPriceByProduct(criteria);
      } catch (err: any) {
        console.warn(`[RetailerService] Adapter ${adapter.retailerId} error:`, err.message);
        return null;
      }
    });

    const settledOffers = await Promise.all(adapterPromises);
    for (const offer of settledOffers) {
      if (offer) {
        offers.push(offer);
      }
    }

    // Always include the baseline verified distributor reference offer
    const primaryDistributorName = component.retailerName || 'Indian Hardware Distributor';
    const primarySearchUrl = IndianRetailerRegistry.getRetailerDirectSearchUrl(
      'mdcomputers',
      `${component.brand} ${component.name}`
    );

    const catalogReferenceOffer: NormalizedRetailerOffer = {
      retailerId: 'mdcomputers',
      retailerName: primaryDistributorName,
      productId: component.id,
      productTitle: `${component.brand} ${component.name}`,
      priceINR: component.priceINR,
      inStock: true,
      stockStatus: 'in_stock',
      productUrl: component.retailerUrl || primarySearchUrl,
      dataSource: 'catalog_reference',
      lastCheckedAt: component.lastVerifiedAt || new Date().toISOString().split('T')[0],
      matchConfidence: 'exact_model',
      modelIdentifier: component.modelNumber || component.id,
      affiliateDisclosure: 'Verified reference price from Indian distributor catalog.',
    };

    offers.push(catalogReferenceOffer);

    // Sort offers by price ascending (in-stock items prioritized)
    offers.sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return a.priceINR - b.priceINR;
    });

    const bestOffer = offers.find((o) => o.inStock) || offers[0];

    let notice = IndianRetailerRegistry.getRetailerStatusNotice();
    if (liveConnected && offers.some((o) => o.dataSource === 'live_api')) {
      notice = 'Live pricing synchronized with authorized Indian retailer partner APIs. All comparisons are strictly evaluated between verified equivalent hardware models.';
    } else if (!liveConnected) {
      notice = 'Live API credentials not configured in environment. Displaying verified local catalog reference prices and direct search links.';
    }

    return {
      componentId: component.id,
      componentName: component.name,
      modelIdentifier: component.modelNumber,
      catalogPriceINR: component.priceINR,
      offers,
      bestOffer,
      retailerStatuses: statuses,
      isLiveApiConnected: liveConnected,
      notice,
    };
  }

  public async searchProducts(query: string, category?: ComponentCategory): Promise<NormalizedRetailerOffer[]> {
    const promises = this.adapters.map(async (adapter) => {
      try {
        if (!adapter.isConfigured()) return [];
        return await adapter.searchProducts(query, category);
      } catch {
        return [];
      }
    });

    const results = await Promise.all(promises);
    return results.flat();
  }
}

export const retailerService = new RetailerAggregationService();
