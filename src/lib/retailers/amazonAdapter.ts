import {
  CachedOfferEntry,
  IServerRetailerAdapter,
  ProductMatchCriteria,
} from './types';
import { NormalizedRetailerOffer, RetailerApiStatus } from '@/types';
import { signAmazonPaapi5 } from './sigv4';
import { evaluateProductMatch } from './matcher';

export class AmazonIndiaAdapter implements IServerRetailerAdapter {
  readonly retailerId = 'amazon_in' as const;
  readonly retailerName = 'Amazon India' as const;

  private accessKey?: string;
  private secretKey?: string;
  private associateTag?: string;
  private cache: Map<string, CachedOfferEntry> = new Map();
  private lastRequestTime = 0;
  private minIntervalMs = 1100; // PA-API 1 request/second compliance
  private requestTimeoutMs: number;
  private cacheTtlMs: number;

  constructor(options?: {
    accessKey?: string;
    secretKey?: string;
    associateTag?: string;
    requestTimeoutMs?: number;
    cacheTtlMs?: number;
  }) {
    this.accessKey = options?.accessKey || process.env.AMAZON_ACCESS_KEY;
    this.secretKey = options?.secretKey || process.env.AMAZON_SECRET_KEY;
    this.associateTag = options?.associateTag || process.env.AMAZON_ASSOCIATE_TAG;
    this.requestTimeoutMs = options?.requestTimeoutMs || 5000;
    // Amazon Affiliate Operating Agreement permits short-term price caching (max 24h)
    this.cacheTtlMs = options?.cacheTtlMs || 3600 * 1000; // 1 hour default
  }

  public isConfigured(): boolean {
    return Boolean(this.accessKey && this.secretKey && this.associateTag);
  }

  public async getStatus(): Promise<RetailerApiStatus> {
    const missing: string[] = [];
    if (!this.accessKey) missing.push('AMAZON_ACCESS_KEY');
    if (!this.secretKey) missing.push('AMAZON_SECRET_KEY');
    if (!this.associateTag) missing.push('AMAZON_ASSOCIATE_TAG');

    if (missing.length > 0) {
      return {
        retailerId: this.retailerId,
        retailerName: this.retailerName,
        isConfigured: false,
        connectionStatus: 'not_configured',
        lastCheckedAt: new Date().toISOString(),
        requiresApprovedAccount: true,
        missingEnvVars: missing,
        errorMessage: 'Amazon India Creators API credentials not configured in server environment.',
      };
    }

    return {
      retailerId: this.retailerId,
      retailerName: this.retailerName,
      isConfigured: true,
      connectionStatus: 'connected',
      lastCheckedAt: new Date().toISOString(),
      requiresApprovedAccount: true,
    };
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  public async fetchPriceByProduct(criteria: ProductMatchCriteria): Promise<NormalizedRetailerOffer | null> {
    // Check in-memory cache first
    const cacheKey = `amazon_${criteria.componentId}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return {
        ...cached.offer,
        dataSource: 'cached_api',
      };
    }

    if (!this.isConfigured()) {
      return null;
    }

    try {
      await this.throttle();

      // If we have an exact ASIN, use GetItems
      if (criteria.asin) {
        const itemOffer = await this.executeGetItems(criteria.asin, criteria);
        if (itemOffer) {
          this.cache.set(cacheKey, {
            offer: itemOffer,
            cachedAt: now,
            expiresAt: now + this.cacheTtlMs,
          });
          return itemOffer;
        }
      }

      // Otherwise search by Keywords
      const searchQuery = criteria.modelNumber || `${criteria.brand} ${criteria.name}`;
      const searchOffers = await this.executeSearchItems(searchQuery, criteria);
      if (searchOffers.length > 0) {
        const best = searchOffers[0];
        this.cache.set(cacheKey, {
          offer: best,
          cachedAt: now,
          expiresAt: now + this.cacheTtlMs,
        });
        return best;
      }

      return null;
    } catch (err: any) {
      console.warn(`[AmazonIndiaAdapter] Fetch failed for ${criteria.componentId}:`, err.message);
      return null;
    }
  }

  public async searchProducts(query: string, category?: string): Promise<NormalizedRetailerOffer[]> {
    if (!this.isConfigured()) return [];
    try {
      await this.throttle();
      return await this.executeSearchItems(query);
    } catch (err: any) {
      console.warn(`[AmazonIndiaAdapter] Search failed:`, err.message);
      return [];
    }
  }

  private async executeGetItems(asin: string, criteria?: ProductMatchCriteria): Promise<NormalizedRetailerOffer | null> {
    const payload = JSON.stringify({
      ItemIds: [asin],
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Message',
        'Offers.Listings.Availability.Type',
        'Images.Primary.Medium',
      ],
      PartnerTag: this.associateTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.in',
    });

    const response = await this.sendPaapiRequest('com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems', '/paapi5/getitems', payload);
    const items = response?.ItemsResult?.Items;
    if (!items || items.length === 0) return null;

    return this.parseItemToOffer(items[0], criteria);
  }

  private async executeSearchItems(keywords: string, criteria?: ProductMatchCriteria): Promise<NormalizedRetailerOffer[]> {
    const payload = JSON.stringify({
      Keywords: keywords,
      SearchIndex: 'Electronics',
      ItemCount: 5,
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Message',
        'Offers.Listings.Availability.Type',
        'Images.Primary.Medium',
      ],
      PartnerTag: this.associateTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.in',
    });

    const response = await this.sendPaapiRequest('com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems', '/paapi5/searchitems', payload);
    const items = response?.SearchResult?.Items;
    if (!items || !Array.isArray(items)) return [];

    const results: NormalizedRetailerOffer[] = [];
    for (const item of items) {
      const parsed = this.parseItemToOffer(item, criteria);
      if (parsed) {
        results.push(parsed);
      }
    }

    return results;
  }

  private parseItemToOffer(item: any, criteria?: ProductMatchCriteria): NormalizedRetailerOffer | null {
    const asin = item.ASIN;
    const title = item.ItemInfo?.Title?.DisplayValue;
    const detailUrl = item.DetailPageURL || `https://www.amazon.in/dp/${asin}?tag=${this.associateTag}`;
    const listing = item.Offers?.Listings?.[0];
    const rawPrice = listing?.Price?.Amount;
    const priceINR = typeof rawPrice === 'number' ? Math.round(rawPrice) : null;
    const availType = listing?.Availability?.Type;
    const availMsg = listing?.Availability?.Message || '';

    if (!title || priceINR === null) {
      return null;
    }

    let isMatch = true;
    let confidence: NormalizedRetailerOffer['matchConfidence'] = 'high_part_number';

    if (criteria) {
      const evalResult = evaluateProductMatch(criteria, title, asin, priceINR);
      if (!evalResult.isMatch) {
        return null; // Skip non-matching products
      }
      confidence = evalResult.confidence;
    }

    const inStock = availType === 'Now' || (!availMsg.toLowerCase().includes('out of stock') && !availMsg.toLowerCase().includes('unavailable'));
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + this.cacheTtlMs).toISOString();

    return {
      retailerId: this.retailerId,
      retailerName: this.retailerName,
      retailerLogo: '/images/retailers/amazon.svg',
      productId: asin,
      productTitle: title,
      priceINR,
      inStock,
      stockStatus: inStock ? 'in_stock' : 'out_of_stock',
      productUrl: detailUrl,
      dataSource: 'live_api',
      lastCheckedAt: nowIso,
      cachedUntil: expiresIso,
      matchConfidence: confidence,
      modelIdentifier: asin,
      affiliateDisclosure: 'As an Amazon Associate we earn from qualifying purchases.',
    };
  }

  private async sendPaapiRequest(target: string, path: string, payload: string): Promise<any> {
    const host = 'webservices.amazon.in';
    const region = 'eu-west-1';

    const signed = signAmazonPaapi5({
      method: 'POST',
      host,
      region,
      service: 'ProductAdvertisingAPI',
      path,
      payload,
      target,
      accessKey: this.accessKey!,
      secretKey: this.secretKey!,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const res = await fetch(`https://${host}${path}`, {
        method: 'POST',
        headers: signed.headers,
        body: payload,
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 429) {
          throw new Error(`Amazon API rate limit exceeded (429): ${errorText}`);
        }
        if (res.status === 401 || res.status === 403) {
          throw new Error(`Amazon API authentication failed (${res.status}): ${errorText}`);
        }
        throw new Error(`Amazon API request error (${res.status}): ${errorText}`);
      }

      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}
