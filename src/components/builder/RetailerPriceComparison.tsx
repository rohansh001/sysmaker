'use client';

import React, { useState, useEffect } from 'react';
import { NormalizedRetailerOffer, RetailerPricingResponse } from '@/types';
import { InrPrice } from '@/components/common/InrPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Tag,
  Store,
} from 'lucide-react';
import { formatINR } from '@/engine/pricing';

interface RetailerPriceComparisonProps {
  componentId: string;
  componentName: string;
  defaultPriceINR: number;
  onSelectOffer?: (offer: NormalizedRetailerOffer) => void;
  selectedRetailerId?: string;
}

export const RetailerPriceComparison: React.FC<RetailerPriceComparisonProps> = ({
  componentId,
  componentName,
  defaultPriceINR,
  onSelectOffer,
  selectedRetailerId,
}) => {
  const [data, setData] = useState<RetailerPricingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/retailers/pricing?componentId=${encodeURIComponent(componentId)}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned HTTP ${res.status}`);
      }
      const json: RetailerPricingResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load live retailer prices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && !data && !loading) {
      fetchPricing();
    }
  }, [expanded, componentId]);

  return (
    <div className="mt-2.5 pt-2 border-t border-charcoal-750/80">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-magenta-400 hover:text-magenta-300 transition-colors"
      >
        <Store className="w-3.5 h-3.5" />
        <span>{expanded ? 'Hide Retailer Comparison' : 'Compare Retailer Offers (Amazon, Flipkart, Local)'}</span>
      </button>

      {/* Expanded Retailer Offers Card */}
      {expanded && (
        <div className="mt-3 p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-750 space-y-3 text-xs">
          {/* Header & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-charcoal-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-magenta-400" />
                Verified Retailer Pricing & Availability
              </span>
              {data?.modelIdentifier && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-charcoal-300 font-mono">
                  MPN: {data.modelIdentifier}
                </span>
              )}
            </div>

            <button
              onClick={fetchPricing}
              disabled={loading}
              className="inline-flex items-center gap-1 text-[11px] text-charcoal-400 hover:text-white transition-colors self-start sm:self-auto"
              title="Refresh pricing"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-2 py-3">
              <div className="h-4 bg-charcoal-800 rounded animate-pulse w-3/4" />
              <div className="h-10 bg-charcoal-850 rounded animate-pulse" />
              <div className="h-10 bg-charcoal-850 rounded animate-pulse" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Failed to retrieve live retailer prices</span>
                <span className="text-[11px] text-rose-200">{error}</span>
              </div>
            </div>
          )}

          {/* Connection Disclosure Notice */}
          {data && (
            <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
              data.isLiveApiConnected
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : 'bg-charcoal-850 border-charcoal-800 text-charcoal-400'
            }`}>
              {data.isLiveApiConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span>{data.notice}</span>
            </div>
          )}

          {/* Offers Table / List */}
          {data && data.offers && (
            <div className="space-y-2">
              {data.offers.map((offer) => {
                const isSelected = selectedRetailerId === offer.retailerId;
                const isBest = data.bestOffer?.retailerId === offer.retailerId && data.offers.length > 1;
                const diffFromCatalog = offer.priceINR - defaultPriceINR;

                return (
                  <div
                    key={`${offer.retailerId}-${offer.productId}`}
                    className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-magenta-950/40 border-magenta-600/80'
                        : isBest
                        ? 'bg-emerald-950/20 border-emerald-700/50'
                        : 'bg-charcoal-850 border-charcoal-800 hover:border-charcoal-700'
                    }`}
                  >
                    {/* Retailer identity & stock status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-white text-xs">
                          {offer.retailerName}
                        </span>

                        {isBest && (
                          <Badge variant="success" size="sm" className="text-[10px]">
                            <TrendingDown className="w-2.5 h-2.5" /> Best Price
                          </Badge>
                        )}

                        {offer.inStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        )}

                        {offer.dataSource === 'live_api' ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800">
                            Live API
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-charcoal-800 text-charcoal-400">
                            Catalog Ref
                          </span>
                        )}

                        <span className="text-[10px] text-charcoal-500 font-mono">
                          ID: {offer.productId}
                        </span>
                      </div>

                      <div className="text-[11px] text-charcoal-300 truncate">
                        {offer.productTitle}
                      </div>

                      {offer.affiliateDisclosure && (
                        <div className="text-[9px] text-charcoal-500 mt-0.5">
                          {offer.affiliateDisclosure}
                        </div>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-charcoal-800">
                      <div className="text-left sm:text-right">
                        <InrPrice amount={offer.priceINR} size="md" className="text-white" />
                        {diffFromCatalog !== 0 && (
                          <span className={`block text-[10px] font-semibold ${
                            diffFromCatalog < 0 ? 'text-emerald-400' : 'text-charcoal-400'
                          }`}>
                            {diffFromCatalog < 0
                              ? `Save ${formatINR(Math.abs(diffFromCatalog))}`
                              : `+${formatINR(diffFromCatalog)} vs Catalog`}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={offer.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 hover:text-white transition-colors"
                          title={`Open product page on ${offer.retailerName}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {onSelectOffer && (
                          <Button
                            variant={isSelected ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => onSelectOffer(offer)}
                            disabled={!offer.inStock}
                            className="text-xs"
                          >
                            {isSelected ? 'Selected' : 'Use Price'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
