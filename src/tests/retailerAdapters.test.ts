import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AmazonIndiaAdapter } from '@/lib/retailers/amazonAdapter';
import { FlipkartAffiliateAdapter } from '@/lib/retailers/flipkartAdapter';
import { RetailerAggregationService } from '@/lib/retailers/retailerService';
import { evaluateProductMatch } from '@/lib/retailers/matcher';
import { signAmazonPaapi5 } from '@/lib/retailers/sigv4';
import { ProductMatchCriteria } from '@/lib/retailers/types';

describe('Retailer Price Integration & Server Adapters', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const sampleCriteria: ProductMatchCriteria = {
    componentId: 'cpu-amd-5600',
    name: 'AMD Ryzen 5 5600 Processor',
    brand: 'AMD',
    category: 'cpu',
    modelNumber: '100-100000926BOX',
    asin: 'B09VCHR1VH',
    flipkartId: 'CPUGCFZHY8Q6',
    expectedPriceINR: 10499,
  };

  describe('AWS SigV4 Signing for Amazon India PA-API', () => {
    it('generates compliant AWS4-HMAC-SHA256 headers and signature', () => {
      const signed = signAmazonPaapi5({
        method: 'POST',
        host: 'webservices.amazon.in',
        region: 'eu-west-1',
        service: 'ProductAdvertisingAPI',
        path: '/paapi5/searchitems',
        payload: JSON.stringify({ Keywords: 'AMD Ryzen 5 5600' }),
        target: 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        accessKey: 'TEST_ACCESS_KEY',
        secretKey: 'TEST_SECRET_KEY',
        date: new Date('2024-10-19T12:00:00Z'),
      });

      expect(signed.headers['Authorization']).toBeDefined();
      expect(signed.headers['Authorization']).toContain('AWS4-HMAC-SHA256 Credential=TEST_ACCESS_KEY/20241019/eu-west-1/ProductAdvertisingAPI/aws4_request');
      expect(signed.headers['x-amz-date']).toBe('20241019T120000Z');
      expect(signed.headers['host']).toBe('webservices.amazon.in');
      expect(signed.headers['x-amz-target']).toBe('com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems');
    });
  });

  describe('Product Matcher Verification (Anti-False Equivalency)', () => {
    it('matches exact verified ASIN with exact_model confidence', () => {
      const match = evaluateProductMatch(sampleCriteria, 'AMD Ryzen 5 5600 Desktop Processor', 'B09VCHR1VH', 10499);
      expect(match.isMatch).toBe(true);
      expect(match.confidence).toBe('exact_model');
      expect(match.reason).toContain('B09VCHR1VH');
    });

    it('matches exact Manufacturer Part Number (MPN)', () => {
      const match = evaluateProductMatch(sampleCriteria, 'AMD Ryzen 5 5600 6-Core 12-Thread 100-100000926BOX', 'UNKNOWN_ID', 10499);
      expect(match.isMatch).toBe(true);
      expect(match.confidence).toBe('exact_model');
      expect(match.reason).toContain('100-100000926BOX');
    });

    it('rejects GPU tier mismatches (e.g. RTX 4060 vs RTX 4060 Ti)', () => {
      const gpuCriteria: ProductMatchCriteria = {
        componentId: 'gpu-asus-dual-rtx4060',
        name: 'ASUS Dual GeForce RTX 4060 EVO OC Edition 8GB',
        brand: 'ASUS',
        category: 'gpu',
        expectedPriceINR: 28499,
      };

      const match = evaluateProductMatch(gpuCriteria, 'ASUS Dual GeForce RTX 4060 Ti 8GB GDDR6', undefined, 38000);
      expect(match.isMatch).toBe(false);
      expect(match.reason).toContain('Ti');
    });

    it('rejects RAM generation mismatches (DDR4 vs DDR5)', () => {
      const ramCriteria: ProductMatchCriteria = {
        componentId: 'ram-gskill-ripjaws-16gb-ddr4',
        name: 'G.Skill Ripjaws V 16GB (2x8GB) DDR4 3200MHz',
        brand: 'G.Skill',
        category: 'ram',
        expectedPriceINR: 2999,
      };

      const match = evaluateProductMatch(ramCriteria, 'G.Skill Ripjaws S5 16GB DDR5 5200MHz', undefined, 4200);
      expect(match.isMatch).toBe(false);
      expect(match.reason).toContain('DDR5');
    });

    it('rejects laptops and accessories falsely matching desktop components', () => {
      const matchLaptop = evaluateProductMatch(sampleCriteria, 'Gaming Laptop with AMD Ryzen 5 5600H and 16GB RAM', undefined, 55000);
      expect(matchLaptop.isMatch).toBe(false);
      expect(matchLaptop.reason).toContain('laptop');

      const matchBracket = evaluateProductMatch(sampleCriteria, 'AMD Ryzen AM4 CPU Cooler Mounting Bracket Plastic Clip', undefined, 250);
      expect(matchBracket.isMatch).toBe(false);
      expect(matchBracket.reason).toContain('suspiciously low');
    });
  });

  describe('Amazon India Adapter with Mocked API', () => {
    it('returns isConfigured: false when server credentials are not set', async () => {
      const adapter = new AmazonIndiaAdapter({
        accessKey: '',
        secretKey: '',
        associateTag: '',
      });
      expect(adapter.isConfigured()).toBe(false);

      const status = await adapter.getStatus();
      expect(status.isConfigured).toBe(false);
      expect(status.connectionStatus).toBe('not_configured');
      expect(status.missingEnvVars).toContain('AMAZON_ACCESS_KEY');

      const result = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(result).toBeNull();
    });

    it('successfully parses valid in-stock product and returns normalized offer', async () => {
      const mockAmazonResponse = {
        ItemsResult: {
          Items: [
            {
              ASIN: 'B09VCHR1VH',
              DetailPageURL: 'https://www.amazon.in/dp/B09VCHR1VH?tag=testtag-21',
              ItemInfo: {
                Title: {
                  DisplayValue: 'AMD 5000 Series Ryzen 5 5600 Desktop Processor 6 cores 12 Threads 35 MB Cache 3.5 GHz (100-100000926BOX)',
                },
              },
              Offers: {
                Listings: [
                  {
                    Price: {
                      Amount: 10499,
                      Currency: 'INR',
                    },
                    Availability: {
                      Type: 'Now',
                      Message: 'In stock',
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockAmazonResponse,
      } as any);

      const adapter = new AmazonIndiaAdapter({
        accessKey: 'KEY',
        secretKey: 'SECRET',
        associateTag: 'testtag-21',
      });

      const offer = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer).not.toBeNull();
      expect(offer?.retailerId).toBe('amazon_in');
      expect(offer?.priceINR).toBe(10499);
      expect(offer?.inStock).toBe(true);
      expect(offer?.stockStatus).toBe('in_stock');
      expect(offer?.matchConfidence).toBe('exact_model');
      expect(offer?.productUrl).toContain('amazon.in');
      expect(offer?.affiliateDisclosure).toContain('Amazon Associate');
    });

    it('handles out-of-stock product properly', async () => {
      const mockOutOfStockResponse = {
        ItemsResult: {
          Items: [
            {
              ASIN: 'B09VCHR1VH',
              DetailPageURL: 'https://www.amazon.in/dp/B09VCHR1VH?tag=testtag-21',
              ItemInfo: {
                Title: {
                  DisplayValue: 'AMD Ryzen 5 5600 Desktop Processor (100-100000926BOX)',
                },
              },
              Offers: {
                Listings: [
                  {
                    Price: {
                      Amount: 10499,
                      Currency: 'INR',
                    },
                    Availability: {
                      Type: 'OutOfStock',
                      Message: 'Currently unavailable.',
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockOutOfStockResponse,
      } as any);

      const adapter = new AmazonIndiaAdapter({
        accessKey: 'KEY',
        secretKey: 'SECRET',
        associateTag: 'testtag-21',
      });

      const offer = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer).not.toBeNull();
      expect(offer?.inStock).toBe(false);
      expect(offer?.stockStatus).toBe('out_of_stock');
    });

    it('handles missing price gracefully without NaN or crashing', async () => {
      const mockMissingPrice = {
        ItemsResult: {
          Items: [
            {
              ASIN: 'B09VCHR1VH',
              ItemInfo: { Title: { DisplayValue: 'AMD Ryzen 5 5600' } },
              Offers: { Listings: [] }, // No pricing listing
            },
          ],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockMissingPrice,
      } as any);

      const adapter = new AmazonIndiaAdapter({
        accessKey: 'KEY',
        secretKey: 'SECRET',
        associateTag: 'testtag-21',
      });

      const offer = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer).toBeNull();
    });

    it('handles authentication failure (HTTP 401/403) gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => '{"__type":"MissingClientTokenIdException","message":"The security token included in the request is invalid"}',
      } as any);

      const adapter = new AmazonIndiaAdapter({
        accessKey: 'INVALID_KEY',
        secretKey: 'INVALID_SECRET',
        associateTag: 'testtag-21',
      });

      // Should not throw or crash; logs warning and returns null
      const offer = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer).toBeNull();
    });

    it('handles rate-limiting (HTTP 429) gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => '{"__type":"TooManyRequestsException","message":"You are submitting requests too quickly"}',
      } as any);

      const adapter = new AmazonIndiaAdapter({
        accessKey: 'KEY',
        secretKey: 'SECRET',
        associateTag: 'testtag-21',
      });

      const offer = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer).toBeNull();
    });

    it('adheres to caching policy and returns cached_api on subsequent call', async () => {
      const mockResponse = {
        ItemsResult: {
          Items: [
            {
              ASIN: 'B09VCHR1VH',
              DetailPageURL: 'https://www.amazon.in/dp/B09VCHR1VH',
              ItemInfo: { Title: { DisplayValue: 'AMD Ryzen 5 5600 100-100000926BOX' } },
              Offers: { Listings: [{ Price: { Amount: 10499 } }] },
            },
          ],
        },
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);
      global.fetch = fetchMock;

      const adapter = new AmazonIndiaAdapter({
        accessKey: 'KEY',
        secretKey: 'SECRET',
        associateTag: 'testtag-21',
        cacheTtlMs: 60000,
      });

      const offer1 = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer1?.dataSource).toBe('live_api');
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call should hit in-memory cache
      const offer2 = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer2?.dataSource).toBe('cached_api');
      expect(fetchMock).toHaveBeenCalledTimes(1); // not called again
    });
  });

  describe('Flipkart Affiliate Adapter with Mocked API', () => {
    it('returns isConfigured: false when credentials are empty', async () => {
      const adapter = new FlipkartAffiliateAdapter({
        affiliateId: '',
        affiliateToken: '',
      });
      expect(adapter.isConfigured()).toBe(false);

      const status = await adapter.getStatus();
      expect(status.isConfigured).toBe(false);
      expect(status.missingEnvVars).toContain('FLIPKART_AFFILIATE_ID');
    });

    it('successfully parses valid Flipkart product response', async () => {
      const mockFlipkartResponse = {
        productBaseInfoV1: {
          productId: 'CPUGCFZHY8Q6',
          title: 'AMD Ryzen 5 5600 3.5 GHz Upto 4.4 GHz AM4 Socket 6 Cores 12 Threads Desktop Processor (100-100000926BOX)',
          productUrl: 'https://dl.flipkart.com/s/sample?affid=testaffid',
          inStock: true,
          flipkartSellingPrice: {
            amount: 10299,
            currency: 'INR',
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockFlipkartResponse,
      } as any);

      const adapter = new FlipkartAffiliateAdapter({
        affiliateId: 'testaffid',
        affiliateToken: 'testtoken',
      });

      const offer = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer).not.toBeNull();
      expect(offer?.retailerId).toBe('flipkart');
      expect(offer?.priceINR).toBe(10299);
      expect(offer?.inStock).toBe(true);
      expect(offer?.matchConfidence).toBe('exact_model');
      expect(offer?.affiliateDisclosure).toContain('Flipkart');
    });

    it('handles Flipkart 401 Unauthorized cleanly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Invalid Affiliate Token',
      } as any);

      const adapter = new FlipkartAffiliateAdapter({
        affiliateId: 'bad_id',
        affiliateToken: 'bad_token',
      });

      const offer = await adapter.fetchPriceByProduct(sampleCriteria);
      expect(offer).toBeNull();
    });
  });

  describe('RetailerAggregationService Integration', () => {
    it('returns verified catalog reference offer when live APIs are not configured', async () => {
      const unconfiguredService = new RetailerAggregationService([
        new AmazonIndiaAdapter({ accessKey: '' }),
        new FlipkartAffiliateAdapter({ affiliateId: '' }),
      ]);

      const response = await unconfiguredService.getPricingForComponent('cpu-amd-5600');
      expect(response).not.toBeNull();
      expect(response?.componentId).toBe('cpu-amd-5600');
      expect(response?.isLiveApiConnected).toBe(false);
      expect(response?.offers.length).toBeGreaterThan(0);
      expect(response?.offers[0].dataSource).toBe('catalog_reference');
      expect(response?.notice).toContain('not configured');
    });

    it('aggregates and compares multiple equivalent retailer offers', async () => {
      const mockAmazonOffer = {
        retailerId: 'amazon_in' as const,
        retailerName: 'Amazon India',
        productId: 'B09VCHR1VH',
        productTitle: 'AMD Ryzen 5 5600 (100-100000926BOX)',
        priceINR: 10499,
        inStock: true,
        stockStatus: 'in_stock' as const,
        productUrl: 'https://amazon.in/dp/B09VCHR1VH',
        dataSource: 'live_api' as const,
        lastCheckedAt: new Date().toISOString(),
        matchConfidence: 'exact_model' as const,
      };

      const mockFlipkartOffer = {
        retailerId: 'flipkart' as const,
        retailerName: 'Flipkart',
        productId: 'CPUGCFZHY8Q6',
        productTitle: 'AMD Ryzen 5 5600 (100-100000926BOX)',
        priceINR: 10199,
        inStock: true,
        stockStatus: 'in_stock' as const,
        productUrl: 'https://flipkart.com/p/CPUGCFZHY8Q6',
        dataSource: 'live_api' as const,
        lastCheckedAt: new Date().toISOString(),
        matchConfidence: 'exact_model' as const,
      };

      const mockAmazonAdapter: any = {
        retailerId: 'amazon_in',
        retailerName: 'Amazon India',
        isConfigured: () => true,
        getStatus: async () => ({
          retailerId: 'amazon_in',
          retailerName: 'Amazon India',
          isConfigured: true,
          connectionStatus: 'connected',
          lastCheckedAt: new Date().toISOString(),
          requiresApprovedAccount: true,
        }),
        fetchPriceByProduct: async () => mockAmazonOffer,
      };

      const mockFlipkartAdapter: any = {
        retailerId: 'flipkart',
        retailerName: 'Flipkart',
        isConfigured: () => true,
        getStatus: async () => ({
          retailerId: 'flipkart',
          retailerName: 'Flipkart',
          isConfigured: true,
          connectionStatus: 'connected',
          lastCheckedAt: new Date().toISOString(),
          requiresApprovedAccount: true,
        }),
        fetchPriceByProduct: async () => mockFlipkartOffer,
      };

      const service = new RetailerAggregationService([mockAmazonAdapter, mockFlipkartAdapter]);
      const res = await service.getPricingForComponent('cpu-amd-5600');

      expect(res).not.toBeNull();
      expect(res?.isLiveApiConnected).toBe(true);
      // Offers should include Flipkart (10199), Amazon (10499), and distributor reference (10499)
      expect(res?.offers.length).toBe(3);
      // Best offer should be Flipkart at ₹10,199
      expect(res?.bestOffer?.retailerId).toBe('flipkart');
      expect(res?.bestOffer?.priceINR).toBe(10199);
    });
  });
});
