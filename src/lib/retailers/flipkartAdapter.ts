import {
  CachedOfferEntry,
  IServerRetailerAdapter,
  ProductMatchCriteria,
} from './types';
import { NormalizedRetailerOffer, RetailerApiStatus } from '@/types';
import { evaluateProductMatch } from './matcher';

export class FlipkartAffiliateAdapter implements IServerRetailerAdapter {
  readonly retailerId = 'flipkart' as const;
  readonly retailerName = 'Flipkart' as const;

  private affiliateId?: string;
  private affiliateToken?: string;
  private cache: Map<string, CachedOfferEntry> = new Map();
  private requestTimeoutMs: number;
  private cacheTtlMs: number;

  constructor(options?: {
    affiliateId?: string;
    affiliateToken?: string;
    requestTimeoutMs?: number;
    cacheTtlMs?: number;
  }) {
    this.affiliateId = options?.affiliateId || process.env.FLIPKART_AFFILIATE_ID;
    this.affiliateToken = options?.affiliateToken || process.env.FLIPKART_AFFILIATE_TOKEN;
    this.requestTimeoutMs = options?.requestTimeoutMs || 5000;
    this.cacheTtlMs = options?.cacheTtlMs || 3600 * 1000;
  }

  public isConfigured(): boolean {
    return Boolean(this.affiliateId && this.affiliateToken);
  }

  public async getStatus(): Promise<RetailerApiStatus> {
    const missing: string[] = [];
    if (!this.affiliateId) missing.push('FLIPKART_AFFILIATE_ID');
    if (!this.affiliateToken) missing.push('FLIPKART_AFFILIATE_TOKEN');

    if (missing.length > 0) {
      return {
        retailerId: this.retailerId,
        retailerName: this.retailerName,
        isConfigured: false,
        connectionStatus: 'not_configured',
        lastCheckedAt: new Date().toISOString(),
        requiresApprovedAccount: true,
        missingEnvVars: missing,
        errorMessage: 'Flipkart Affiliate API credentials not configured in server environment.',
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

  public async fetchPriceByProduct(criteria: ProductMatchCriteria): Promise<NormalizedRetailerOffer | null> {
    const cacheKey = `flipkart_${criteria.componentId}`;
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
      // 1. If exact Flipkart product ID is present, fetch direct
      if (criteria.flipkartId) {
        const directOffer = await this.executeGetProductById(criteria.flipkartId, criteria);
        if (directOffer) {
          this.cache.set(cacheKey, {
            offer: directOffer,
            cachedAt: now,
            expiresAt: now + this.cacheTtlMs,
          });
          return directOffer;
        }
      }

      // 2. Otherwise search query
      const searchQuery = criteria.modelNumber || `${criteria.brand} ${criteria.name}`;
      const searchOffers = await this.executeSearch(searchQuery, criteria);
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
      console.warn(`[FlipkartAdapter] Fetch failed for ${criteria.componentId}:`, err.message);
      return null;
    }
  }

  public async searchProducts(query: string, category?: string): Promise<NormalizedRetailerOffer[]> {
    if (!this.isConfigured()) return [];
    try {
      return await this.executeSearch(query);
    } catch (err: any) {
      console.warn(`[FlipkartAdapter] Search failed:`, err.message);
      return [];
    }
  }

  private async executeGetProductById(productId: string, criteria?: ProductMatchCriteria): Promise<NormalizedRetailerOffer | null> {
    const url = `https://affiliate-api.flipkart.net/affiliate/1.0/product.json?id=${encodeURIComponent(productId)}`;
    const data = await this.sendRequest(url);
    if (!data?.productBaseInfoV1) return null;
    return this.parseItemToOffer(data, criteria);
  }

  private async executeSearch(query: string, criteria?: ProductMatchCriteria): Promise<NormalizedRetailerOffer[]> {
    const url = `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${encodeURIComponent(query)}&resultCount=5`;
    const data = await this.sendRequest(url);
    const products = data?.products;
    if (!Array.isArray(products)) return [];

    const results: NormalizedRetailerOffer[] = [];
    for (const item of products) {
      const parsed = this.parseItemToOffer(item, criteria);
      if (parsed) {
        results.push(parsed);
      }
    }
    return results;
  }

  private parseItemToOffer(item: any, criteria?: ProductMatchCriteria): NormalizedRetailerOffer | null {
    const baseInfo = item?.productBaseInfoV1;
    if (!baseInfo) return null;

    const productId = baseInfo.productId;
    const title = baseInfo.title;
    const productUrl = baseInfo.productUrl;
    const rawPrice = baseInfo.flipkartSellingPrice?.amount;
    const priceINR = typeof rawPrice === 'number' ? Math.round(rawPrice) : null;
    const inStock = Boolean(baseInfo.inStock);

    if (!title || priceINR === null || !productUrl) {
      return null;
    }

    let confidence: NormalizedRetailerOffer['matchConfidence'] = 'high_part_number';

    if (criteria) {
      const evalResult = evaluateProductMatch(criteria, title, productId, priceINR);
      if (!evalResult.isMatch) {
        return null;
      }
      confidence = evalResult.confidence;
    }

    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + this.cacheTtlMs).toISOString();

    return {
      retailerId: this.retailerId,
      retailerName: this.retailerName,
      retailerLogo: '/images/retailers/flipkart.svg',
      productId: productId || 'FK-ITEM',
      productTitle: title,
      priceINR,
      inStock,
      stockStatus: inStock ? 'in_stock' : 'out_of_stock',
      productUrl,
      dataSource: 'live_api',
      lastCheckedAt: nowIso,
      cachedUntil: expiresIso,
      matchConfidence: confidence,
      modelIdentifier: productId,
      affiliateDisclosure: 'Participating in Flipkart Affiliate Program.',
    };
  }

  private async sendRequest(url: string): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Fk-Affiliate-Id': this.affiliateId!,
          'Fk-Affiliate-Token': this.affiliateToken!,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 429) {
          throw new Error(`Flipkart API rate limit exceeded (429): ${errorText}`);
        }
        if (res.status === 401 || res.status === 403) {
          throw new Error(`Flipkart API authentication failed (${res.status}): ${errorText}`);
        }
        throw new Error(`Flipkart API request error (${res.status}): ${errorText}`);
      }

      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}
