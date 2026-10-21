import { ComponentCategory, NormalizedRetailerOffer, RetailerApiStatus, RetailerId } from '@/types';

export interface ProductMatchCriteria {
  componentId: string;
  name: string;
  brand: string;
  category: ComponentCategory;
  modelNumber?: string;
  asin?: string;
  flipkartId?: string;
  expectedPriceINR: number;
}

export interface CachedOfferEntry {
  offer: NormalizedRetailerOffer;
  cachedAt: number;
  expiresAt: number;
}

export interface IServerRetailerAdapter {
  readonly retailerId: RetailerId;
  readonly retailerName: string;
  isConfigured(): boolean;
  getStatus(): Promise<RetailerApiStatus>;
  fetchPriceByProduct(criteria: ProductMatchCriteria): Promise<NormalizedRetailerOffer | null>;
  searchProducts(query: string, category?: ComponentCategory): Promise<NormalizedRetailerOffer[]>;
}

export interface RetailerServiceConfig {
  amazonAccessKey?: string;
  amazonSecretKey?: string;
  amazonAssociateTag?: string;
  flipkartAffiliateId?: string;
  flipkartAffiliateToken?: string;
  cacheTtlMs?: number; // default 1 hour (3600000 ms)
  requestTimeoutMs?: number; // default 5000 ms
}
