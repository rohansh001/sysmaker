'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Component, ComponentCategory } from '@/types';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { ComponentIcon, CATEGORY_LABELS } from '@/components/common/ComponentIcon';
import { Component2DImage } from '@/components/common/Component2DImage';
import { InrPrice } from '@/components/common/InrPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LocalBuildStorage } from '@/storage/localStorage';
import { IndianRetailerRegistry } from '@/data/retailerAdapters';
import { RetailerPriceComparison } from '@/components/builder/RetailerPriceComparison';
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Plus,
  Scale,
  Check,
  Info,
} from 'lucide-react';

const CATEGORIES: { id: ComponentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Components' },
  { id: 'cpu', label: 'Processors' },
  { id: 'motherboard', label: 'Motherboards' },
  { id: 'ram', label: 'Memory' },
  { id: 'gpu', label: 'Graphic Cards' },
  { id: 'storage', label: 'Storage' },
  { id: 'psu', label: 'Power Supplies' },
  { id: 'cabinet', label: 'Cabinets' },
  { id: 'cooler', label: 'Coolers' },
  { id: 'monitor', label: 'Monitors' },
  { id: 'keyboard', label: 'Keyboards' },
  { id: 'mouse', label: 'Mice' },
];

export default function ComponentsCatalogPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('price-asc');
  const [detailComponent, setDetailComponent] = useState<Component | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Available brands for current category filter
  const brands = useMemo(() => {
    let pool = COMPONENT_CATALOG;
    if (selectedCategory !== 'all') {
      pool = pool.filter((c) => c.category === selectedCategory);
    }
    const bSet = new Set<string>();
    pool.forEach((c) => bSet.add(c.brand));
    return Array.from(bSet).sort();
  }, [selectedCategory]);

  // Filter and sort items
  const filteredComponents = useMemo(() => {
    let list = [...COMPONENT_CATALOG];

    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    if (selectedBrand !== 'all') {
      list = list.filter((c) => c.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.priceINR - b.priceINR);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.priceINR - a.priceINR);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  const handleAddToBuild = (comp: Component) => {
    const active = LocalBuildStorage.getActiveBuild();
    active.components[comp.category] = comp;
    active.updatedAt = new Date().toISOString();
    LocalBuildStorage.saveActiveBuild(active);

    setAddedNotice(`Added ${comp.name} to your active build.`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  const handleCompare = (comp: Component) => {
    const existing = LocalBuildStorage.getCompareIds();
    if (!existing.includes(comp.id)) {
      const updated = [...existing, comp.id].slice(-3); // max 3
      LocalBuildStorage.saveCompareIds(updated);
    }
    router.push('/compare');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-magenta-400">
            Catalog Explorer
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PC Component Catalog
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-400 mt-1">
            Explore {COMPONENT_CATALOG.length} verified hardware components with Indian distributor pricing.
          </p>
        </div>

        {addedNotice && (
          <div className="px-3.5 py-2 rounded-xl bg-magenta-950/60 border border-magenta-700/60 text-xs text-magenta-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-magenta-400" />
            <span>{addedNotice}</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id);
                setSelectedBrand('all');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-magenta-accent text-white shadow-magenta-sm'
                  : 'bg-charcoal-900 text-charcoal-400 hover:text-white hover:bg-charcoal-800 border border-charcoal-800'
              }`}
            >
              {tab.id !== 'all' && (
                <ComponentIcon category={tab.id as ComponentCategory} className="w-3.5 h-3.5" />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search components by model, brand, chipset, socket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-sm text-white placeholder-charcoal-500 focus:outline-none focus:border-magenta-500"
            />
          </div>

          {/* Sort selector */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-sm text-white focus:outline-none focus:border-magenta-500 cursor-pointer"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Brand filters */}
        {brands.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-charcoal-800">
            <span className="text-xs text-charcoal-400 mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Brand:
            </span>
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-2.5 py-1 text-xs rounded-full transition-all font-medium ${
                selectedBrand === 'all'
                  ? 'bg-magenta-accent text-white'
                  : 'bg-charcoal-800 text-charcoal-300 hover:text-white'
              }`}
            >
              All Brands
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-2.5 py-1 text-xs rounded-full transition-all font-medium ${
                  selectedBrand === b
                    ? 'bg-magenta-accent text-white'
                    : 'bg-charcoal-800 text-charcoal-300 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredComponents.length === 0 ? (
          <div className="col-span-full text-center py-16 border border-dashed border-charcoal-800 rounded-2xl">
            <p className="text-sm text-charcoal-400">No components match your search or filter.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          filteredComponents.map((comp) => (
            <div
              key={comp.id}
              className="bg-charcoal-900 border border-charcoal-750 hover:border-magenta-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-charcoal-850/60 hover:shadow-lg group"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <Component2DImage
                    component={comp}
                    category={comp.category}
                    size="md"
                    className="w-14 h-14"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-magenta-400 uppercase tracking-wide">
                        {comp.brand}
                      </span>
                      {comp.dataSource === 'verified' ? (
                        <Badge variant="success" size="sm" className="text-[10px]">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="text-[10px]">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <h3
                      onClick={() => setDetailComponent(comp)}
                      className="text-sm font-bold text-white line-clamp-2 cursor-pointer group-hover:text-magenta-300 transition-colors"
                    >
                      {comp.name}
                    </h3>
                  </div>
                </div>

                {comp.description && (
                  <p className="text-xs text-charcoal-400 mb-4 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                )}

                {/* Specs overview pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Object.entries(comp.specifications)
                    .slice(0, 3)
                    .map(([key, val]) => {
                      if (val === undefined || val === null) return null;
                      return (
                        <span
                          key={key}
                          className="text-[11px] px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300 font-mono"
                        >
                          {key}: {Array.isArray(val) ? val.join('/') : String(val)}
                        </span>
                      );
                    })}
                </div>
              </div>

              {/* Bottom Card Footer: Price and CTA */}
              <div className="pt-4 border-t border-charcoal-800 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <InrPrice amount={comp.priceINR} size="lg" className="text-white" />
                    <span className="block text-[10px] text-charcoal-400">
                      Reference price (India)
                    </span>
                  </div>

                  <a
                    href={IndianRetailerRegistry.getRetailerDirectSearchUrl(
                      'mdcomputers',
                      `${comp.brand} ${comp.name}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-magenta-400 hover:text-magenta-300"
                  >
                    <span>Retailer</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => handleAddToBuild(comp)}
                  >
                    Add to Build
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Scale className="w-3.5 h-3.5" />}
                    onClick={() => handleCompare(comp)}
                  >
                    Compare
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Component Detail Modal */}
      {detailComponent && (
        <Modal
          isOpen={true}
          onClose={() => setDetailComponent(null)}
          title={`${detailComponent.brand} ${detailComponent.name}`}
          description={`Category: ${CATEGORY_LABELS[detailComponent.category]}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-charcoal-800">
              <Component2DImage
                component={detailComponent}
                category={detailComponent.category}
                size="lg"
                className="w-20 h-20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <InrPrice amount={detailComponent.priceINR} size="xl" className="text-magenta-400" />
                    <span className="block text-xs text-charcoal-400">Estimated Indian retail price (incl. GST)</span>
                  </div>

                  {detailComponent.dataSource === 'verified' ? (
                    <Badge variant="success" size="md">
                      <ShieldCheck className="w-3 h-3" /> Verified Indian Spec
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="md">
                      <AlertCircle className="w-3 h-3" /> Demo Listing
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {detailComponent.description && (
              <p className="text-sm text-charcoal-300 leading-relaxed">
                {detailComponent.description}
              </p>
            )}

            {/* Complete Specifications Grid */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 bg-charcoal-850 p-4 rounded-xl border border-charcoal-800 text-xs">
                {Object.entries(detailComponent.specifications).map(([k, v]) => (
                  <div key={k} className="flex flex-col py-1 border-b border-charcoal-800/50">
                    <span className="text-charcoal-400 font-mono capitalize">{k}:</span>
                    <span className="text-white font-semibold">
                      {Array.isArray(v) ? v.join(', ') : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Retailer Price Comparison */}
            <div>
              <RetailerPriceComparison
                componentId={detailComponent.id}
                componentName={detailComponent.name}
                defaultPriceINR={detailComponent.priceINR}
                onSelectOffer={(offer) => {
                  handleAddToBuild({
                    ...detailComponent,
                    priceINR: offer.priceINR,
                    retailerName: offer.retailerName,
                    retailerUrl: offer.productUrl,
                  });
                  setDetailComponent(null);
                }}
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-charcoal-800">
              <a
                href={IndianRetailerRegistry.getRetailerDirectSearchUrl(
                  'mdcomputers',
                  `${detailComponent.brand} ${detailComponent.name}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-magenta-400 hover:text-magenta-300"
              >
                <span>Check Availability at Indian Retailers</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleAddToBuild(detailComponent);
                  setDetailComponent(null);
                }}
              >
                Add to Current Build
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
