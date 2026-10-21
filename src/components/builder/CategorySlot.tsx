import React from 'react';
import { Component, ComponentCategory } from '@/types';
import { ComponentIcon, CATEGORY_LABELS } from '@/components/common/ComponentIcon';
import { Component2DImage } from '@/components/common/Component2DImage';
import { InrPrice } from '@/components/common/InrPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, RefreshCw, Trash2, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { IndianRetailerRegistry } from '@/data/retailerAdapters';
import { CORE_CATEGORIES } from '@/engine/compatibility';
import { NormalizedRetailerOffer } from '@/types';
import { RetailerPriceComparison } from './RetailerPriceComparison';

interface CategorySlotProps {
  category: ComponentCategory;
  selectedComponent?: Component;
  onSelect: (category: ComponentCategory) => void;
  onRemove: (category: ComponentCategory) => void;
  onUpdateOffer?: (category: ComponentCategory, offer: NormalizedRetailerOffer) => void;
  isGpuRequired?: boolean;
}

export const CategorySlot: React.FC<CategorySlotProps> = ({
  category,
  selectedComponent,
  onSelect,
  onRemove,
  onUpdateOffer,
  isGpuRequired = false,
}) => {
  const isCore = CORE_CATEGORIES.includes(category);
  const label = CATEGORY_LABELS[category];

  // Helper to format key specs briefly
  const renderSpecSummary = (comp: Component) => {
    const s = comp.specifications as any;
    const items: string[] = [];

    switch (comp.category) {
      case 'cpu':
        if (s.socket) items.push(s.socket);
        if (s.cores) items.push(`${s.cores}C/${s.threads || s.cores}T`);
        if (s.tdpWatts) items.push(`${s.tdpWatts}W TDP`);
        if (s.integratedGraphics) items.push('iGPU');
        break;
      case 'motherboard':
        if (s.socket) items.push(s.socket);
        if (s.formFactor) items.push(s.formFactor);
        if (s.memoryType) items.push(s.memoryType);
        if (s.hasWifi) items.push('WiFi');
        break;
      case 'ram':
        if (s.capacityGb) items.push(`${s.capacityGb}GB`);
        if (s.type) items.push(s.type);
        if (s.speedMhz) items.push(`${s.speedMhz}MHz`);
        if (s.modules) items.push(`${s.modules} Stick${s.modules > 1 ? 's' : ''}`);
        break;
      case 'gpu':
        if (s.vramGb) items.push(`${s.vramGb}GB ${s.vramType || ''}`);
        if (s.tdpWatts) items.push(`${s.tdpWatts}W`);
        if (s.lengthMm) items.push(`${s.lengthMm}mm`);
        break;
      case 'storage':
        if (s.capacityGb) items.push(s.capacityGb >= 1000 ? `${s.capacityGb / 1000}TB` : `${s.capacityGb}GB`);
        if (s.type) items.push(s.type);
        if (s.readSpeedMbps) items.push(`Up to ${s.readSpeedMbps}MB/s`);
        break;
      case 'psu':
        if (s.wattage) items.push(`${s.wattage}W`);
        if (s.efficiencyRating) items.push(s.efficiencyRating);
        if (s.modularity) items.push(s.modularity);
        break;
      case 'cabinet':
        if (s.supportedFormFactors) items.push(s.supportedFormFactors.join('/'));
        if (s.maxGpuLengthMm) items.push(`GPU up to ${s.maxGpuLengthMm}mm`);
        break;
      case 'cooler':
        if (s.type) items.push(s.type);
        if (s.heightMm) items.push(`${s.heightMm}mm height`);
        break;
      case 'monitor':
        if (s.screenSizeInches) items.push(`${s.screenSizeInches}"`);
        if (s.resolution) items.push(s.resolution);
        if (s.refreshRateHz) items.push(`${s.refreshRateHz}Hz`);
        if (s.panelType) items.push(s.panelType);
        break;
      case 'keyboard':
        if (s.type) items.push(s.type);
        if (s.layout) items.push(s.layout);
        if (s.connectivity) items.push(s.connectivity);
        break;
      case 'mouse':
        if (s.sensorDpi) items.push(`${s.sensorDpi} DPI`);
        if (s.connectivity) items.push(s.connectivity);
        break;
    }

    return items;
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      selectedComponent
        ? 'bg-charcoal-900 border-charcoal-700/80 shadow-sm'
        : 'bg-charcoal-900/40 border-dashed border-charcoal-800 hover:border-charcoal-700'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Icon & Title / Selected Component */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          {selectedComponent ? (
            <Component2DImage
              component={selectedComponent}
              category={category}
              size="md"
              className="w-12 h-12"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-charcoal-800/80 border border-charcoal-700/60 text-charcoal-400 flex items-center justify-center shrink-0">
              <ComponentIcon category={category} className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
                {label}
              </span>
              {isCore ? (
                <Badge variant="outline" size="sm" className="text-[10px]">
                  Essential Core
                </Badge>
              ) : (
                <Badge variant="charcoal" size="sm" className="text-[10px]">
                  Peripheral
                </Badge>
              )}
              {category === 'gpu' && isGpuRequired && !selectedComponent && (
                <Badge variant="danger" size="sm" className="text-[10px]">
                  Required (No iGPU)
                </Badge>
              )}
            </div>

            {selectedComponent ? (
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                  {selectedComponent.brand} {selectedComponent.name}
                </h4>
                {/* Specs pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {renderSpecSummary(selectedComponent).map((spec, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300 font-mono"
                    >
                      {spec}
                    </span>
                  ))}
                  {selectedComponent.dataSource === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Indian Spec
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                      <AlertCircle className="w-3 h-3" />
                      Demo Catalog
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-charcoal-400 italic">
                No {label.toLowerCase()} selected yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Price & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-charcoal-800">
          {selectedComponent ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <InrPrice amount={selectedComponent.priceINR} size="md" className="text-white" />
                <div className="flex items-center gap-1 justify-end text-[10px] text-charcoal-400">
                  <span>{selectedComponent.retailerName || 'Indian Retail'}</span>
                  <a
                    href={IndianRetailerRegistry.getRetailerDirectSearchUrl(
                      'mdcomputers',
                      `${selectedComponent.brand} ${selectedComponent.name}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-magenta-400 hover:text-magenta-300 inline-flex items-center"
                    title="Search Indian retailers"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelect(category)}
                  title="Replace component"
                  aria-label={`Replace ${label}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(category)}
                  className="hover:border-rose-700 hover:text-rose-400"
                  title="Remove component"
                  aria-label={`Remove ${label}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => onSelect(category)}
              className="w-full sm:w-auto"
            >
              Select {label.split(' ')[0]}
            </Button>
          )}
        </div>
      </div>

      {/* Retailer Price Comparison & Live Offers Drawer */}
      {selectedComponent && (
        <RetailerPriceComparison
          componentId={selectedComponent.id}
          componentName={selectedComponent.name}
          defaultPriceINR={selectedComponent.priceINR}
          selectedRetailerId={selectedComponent.retailerUrl ? undefined : undefined}
          onSelectOffer={(offer) => onUpdateOffer?.(category, offer)}
        />
      )}
    </div>
  );
};
