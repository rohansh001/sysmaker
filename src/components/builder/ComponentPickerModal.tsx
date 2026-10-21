import React, { useState, useMemo } from 'react';
import { Component, ComponentCategory, BuildComponents } from '@/types';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { Modal } from '@/components/ui/Modal';
import { InrPrice } from '@/components/common/InrPrice';
import { Component2DImage } from '@/components/common/Component2DImage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, ArrowUpDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CATEGORY_LABELS } from '@/components/common/ComponentIcon';
import { checkCompatibility } from '@/engine/compatibility';
import { RetailerPriceComparison } from './RetailerPriceComparison';

interface ComponentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ComponentCategory | null;
  currentBuild: BuildComponents;
  onSelectComponent: (component: Component) => void;
}

export const ComponentPickerModal: React.FC<ComponentPickerModalProps> = ({
  isOpen,
  onClose,
  category,
  currentBuild,
  onSelectComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('price-asc');

  // Filter components belonging to this category
  const categoryComponents = useMemo(() => {
    if (!category) return [];
    return COMPONENT_CATALOG.filter((c) => c.category === category);
  }, [category]);

  // Unique brands
  const brands = useMemo(() => {
    const bSet = new Set<string>();
    categoryComponents.forEach((c) => bSet.add(c.brand));
    return Array.from(bSet).sort();
  }, [categoryComponents]);

  // Filtered & sorted list
  const filteredComponents = useMemo(() => {
    let list = [...categoryComponents];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (selectedBrand !== 'all') {
      list = list.filter((c) => c.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.priceINR - b.priceINR);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.priceINR - a.priceINR);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [categoryComponents, searchQuery, selectedBrand, sortBy]);

  if (!category) return null;

  const categoryTitle = CATEGORY_LABELS[category];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select ${categoryTitle}`}
      description={`Choose from verified Indian market components. Real-time compatibility is assessed against your current build.`}
      maxWidth="4xl"
    >
      {/* Search and Filters Bar */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal-400" />
            <input
              type="text"
              placeholder={`Search ${categoryTitle.toLowerCase()} by brand or model...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-sm text-white placeholder-charcoal-500 focus:outline-none focus:border-magenta-500 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-sm text-white focus:outline-none focus:border-magenta-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 top-3.5 text-charcoal-400 pointer-events-none" />
          </div>
        </div>

        {/* Brand Filter Pills */}
        {brands.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-charcoal-400 mr-1">Brand:</span>
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-2.5 py-1 text-xs rounded-full transition-all font-medium ${
                selectedBrand === 'all'
                  ? 'bg-magenta-accent text-white'
                  : 'bg-charcoal-800 text-charcoal-300 hover:text-white'
              }`}
            >
              All ({categoryComponents.length})
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-2.5 py-1 text-xs rounded-full transition-all font-medium ${
                  selectedBrand === brand
                    ? 'bg-magenta-accent text-white'
                    : 'bg-charcoal-800 text-charcoal-300 hover:text-white'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Component Listings */}
      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-12 text-charcoal-400 border border-dashed border-charcoal-800 rounded-xl">
            <p className="text-sm">No components found matching your search.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredComponents.map((comp) => {
            // Check compatibility preview if this item were selected
            const simulatedBuild: BuildComponents = {
              ...currentBuild,
              [category]: comp,
            };
            const simReport = checkCompatibility(simulatedBuild);
            const errors = simReport.issues.filter(
              (i) => i.severity === 'error' && i.affectedComponents.includes(category)
            );
            const hasConflict = errors.length > 0;

            return (
              <div
                key={comp.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  hasConflict
                    ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/80'
                    : 'bg-charcoal-850/60 border-charcoal-750 hover:border-magenta-500/50 hover:bg-charcoal-800/80'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <Component2DImage
                    component={comp}
                    category={category}
                    size="md"
                    className="w-14 h-14"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-magenta-400 uppercase tracking-wide">
                      {comp.brand}
                    </span>
                    {comp.dataSource === 'verified' && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40 inline-flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified
                      </span>
                    )}
                    {comp.warrantyYears && (
                      <span className="text-[10px] text-charcoal-400">
                        {comp.warrantyYears} Yr Warranty
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5">
                    {comp.name}
                  </h4>

                  {comp.description && (
                    <p className="text-xs text-charcoal-400 mb-2 line-clamp-2">
                      {comp.description}
                    </p>
                  )}

                  {/* Compatibility Warning in card */}
                  {hasConflict && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/60 px-2 py-1 rounded border border-rose-800/60 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors[0].title}: {errors[0].message}</span>
                    </div>
                  )}

                  {/* Multi-Retailer Price Comparison Drawer */}
                  <RetailerPriceComparison
                    componentId={comp.id}
                    componentName={comp.name}
                    defaultPriceINR={comp.priceINR}
                    onSelectOffer={(offer) => {
                      onSelectComponent({
                        ...comp,
                        priceINR: offer.priceINR,
                        retailerName: offer.retailerName,
                        retailerUrl: offer.productUrl,
                      });
                      onClose();
                    }}
                  />
                </div>
              </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:pl-4 sm:border-l sm:border-charcoal-750 self-start sm:self-center">
                  <div className="text-left sm:text-right">
                    <InrPrice amount={comp.priceINR} size="lg" className="text-white" />
                    <span className="block text-[10px] text-charcoal-400">
                      Incl. 18% GST estimate
                    </span>
                  </div>

                  <Button
                    variant={hasConflict ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => {
                      onSelectComponent(comp);
                      onClose();
                    }}
                    className={hasConflict ? 'border-rose-700 text-rose-300 hover:bg-rose-900/40' : ''}
                  >
                    {hasConflict ? 'Select Anyway' : 'Add to Build'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
