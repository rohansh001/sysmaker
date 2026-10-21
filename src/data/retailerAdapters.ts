/**
 * Indian Retailer Adapter Interface and Fallback Providers
 * 
 * Provides an extensible abstraction for querying pricing and stock status
 * from verified Indian computer hardware retailers (e.g., MDComputers, Vedant,
 * PrimeABGB, Amazon India, EliteHubs).
 * 
 * NOTE: Live scraping or unauthorized unofficial API endpoints are strictly avoided.
 * When real authorized API keys or live feeds are configured in the future,
 * this adapter layer can connect directly without altering the UI or catalog schemas.
 */

export interface RetailerProductListing {
  retailerId: string;
  retailerName: string;
  retailerUrl: string;
  inStock: boolean;
  priceINR: number;
  deliveryEstimateDays?: number;
  lastCheckedAt: string;
  isMockFeed: boolean;
}

export interface RetailerAdapter {
  id: string;
  name: string;
  homepageUrl: string;
  supportedCategories: string[];
  isConfigured: boolean;
  fetchProductPrice: (componentId: string, modelSku?: string) => Promise<RetailerProductListing | null>;
}

export const INDIAN_RETAILERS: { id: string; name: string; url: string; note: string }[] = [
  { id: 'mdcomputers', name: 'MDComputers', url: 'https://mdcomputers.in', note: 'Kolkata-based hardware retailer' },
  { id: 'vedant', name: 'Vedant Computers', url: 'https://www.vedantcomputers.com', note: 'Major distributor in Eastern India' },
  { id: 'primeabgb', name: 'PrimeABGB', url: 'https://www.primeabgb.com', note: 'Mumbai Lamington Road specialist' },
  { id: 'amazon_in', name: 'Amazon.in', url: 'https://www.amazon.in', note: 'Nationwide marketplace' },
  { id: 'elitehubs', name: 'EliteHubs', url: 'https://elitehubs.com', note: 'Mumbai-based gaming retailer' },
];

/**
 * Default adapter instance.
 * Transparently indicates when live retailer feeds are offline or using local catalog defaults.
 */
export class IndianRetailerRegistry {
  private static adapters: Map<string, RetailerAdapter> = new Map();

  public static getRetailerDirectSearchUrl(retailerId: string, query: string): string {
    const encoded = encodeURIComponent(query);
    switch (retailerId) {
      case 'mdcomputers':
        return `https://mdcomputers.in/index.php?category_id=0&search=${encoded}&submit_search=&route=product%2Fsearch`;
      case 'vedant':
        return `https://www.vedantcomputers.com/index.php?route=product/search&search=${encoded}`;
      case 'primeabgb':
        return `https://www.primeabgb.com/?s=${encoded}&post_type=product`;
      case 'amazon_in':
        return `https://www.amazon.in/s?k=${encoded}`;
      case 'elitehubs':
        return `https://elitehubs.com/?s=${encoded}&post_type=product`;
      default:
        return `https://www.google.co.in/search?q=${encoded}+price+india`;
    }
  }

  public static getRetailerStatusNotice(): string {
    return 'Live retailer API sync is currently in Adapter mode. Prices reflect local catalog references from Indian distributors (PrimeABGB, MDComputers, Vedant, Amazon IN). Stock and final checkout prices may vary upon visiting individual retailer portals.';
  }
}
