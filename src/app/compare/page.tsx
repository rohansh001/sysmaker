'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Component, ComponentCategory } from '@/types';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { InrPrice } from '@/components/common/InrPrice';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CATEGORY_LABELS, ComponentIcon } from '@/components/common/ComponentIcon';
import { Component2DImage } from '@/components/common/Component2DImage';
import { LocalBuildStorage } from '@/storage/localStorage';
import { formatINR } from '@/engine/pricing';
import {
  Scale,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Check,
} from 'lucide-react';
import { IndianRetailerRegistry } from '@/data/retailerAdapters';

export default function ComparePage() {
  const [category, setCategory] = useState<ComponentCategory>('gpu');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Load any pending comparison IDs from LocalStorage on mount
  useEffect(() => {
    const stored = LocalBuildStorage.getCompareIds();
    if (stored.length > 0) {
      // Find the category of the first stored item
      const firstItem = COMPONENT_CATALOG.find((c) => c.id === stored[0]);
      if (firstItem) {
        setCategory(firstItem.category);
        // Only keep items matching that category
        const matching = stored.filter((id) => {
          const comp = COMPONENT_CATALOG.find((c) => c.id === id);
          return comp && comp.category === firstItem.category;
        });
        setSelectedIds(matching.slice(0, 3));
      }
    } else {
      // Defaults: two popular GPUs
      setSelectedIds(['gpu-asrock-rx6600', 'gpu-asus-dual-rtx4060']);
    }
  }, []);

  // Update localStorage when comparison list changes
  const updateSelectedIds = (ids: string[]) => {
    setSelectedIds(ids);
    LocalBuildStorage.saveCompareIds(ids);
  };

  const handleCategoryChange = (newCat: ComponentCategory) => {
    setCategory(newCat);
    // Pick first two items in that category
    const items = COMPONENT_CATALOG.filter((c) => c.category === newCat);
    const newSelection = items.slice(0, 2).map((c) => c.id);
    updateSelectedIds(newSelection);
  };

  const availableInCategory = useMemo(() => {
    return COMPONENT_CATALOG.filter((c) => c.category === category);
  }, [category]);

  const comparedComponents = useMemo(() => {
    return selectedIds
      .map((id) => COMPONENT_CATALOG.find((c) => c.id === id))
      .filter((c): c is Component => Boolean(c));
  }, [selectedIds]);

  const handleAddComponent = (id: string) => {
    if (selectedIds.length >= 3) return;
    if (!selectedIds.includes(id)) {
      updateSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveComponent = (id: string) => {
    updateSelectedIds(selectedIds.filter((x) => x !== id));
  };

  const handleAddToBuild = (comp: Component) => {
    const active = LocalBuildStorage.getActiveBuild();
    active.components[comp.category] = comp;
    active.updatedAt = new Date().toISOString();
    LocalBuildStorage.saveActiveBuild(active);

    setNotification(`Set ${comp.name} as active ${CATEGORY_LABELS[comp.category]}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Extract all distinct specification keys across compared components
  const specKeys = useMemo(() => {
    const keySet = new Set<string>();
    comparedComponents.forEach((comp) => {
      Object.keys(comp.specifications).forEach((k) => keySet.add(k));
    });
    return Array.from(keySet);
  }, [comparedComponents]);

  // Derive transparent trade-offs description based on real catalog data
  const tradeOffSummary = useMemo(() => {
    if (comparedComponents.length < 2) return null;

    const [a, b, c] = comparedComponents;
    const priceDiffAB = Math.abs(a.priceINR - b.priceINR);
    const cheaper = a.priceINR <= b.priceINR ? a : b;
    const pricier = a.priceINR > b.priceINR ? a : b;

    const observations: string[] = [];

    observations.push(
      `${pricier.brand} ${pricier.name} costs ${formatINR(priceDiffAB)} more than ${cheaper.brand} ${cheaper.name}.`
    );

    // Category-specific trade-offs
    if (category === 'gpu') {
      const vramA = (a.specifications as any).vramGb;
      const vramB = (b.specifications as any).vramGb;
      if (vramA && vramB && vramA !== vramB) {
        observations.push(
          `${vramA > vramB ? a.name : b.name} offers ${Math.max(vramA, vramB)}GB VRAM versus ${Math.min(vramA, vramB)}GB, providing additional headroom for high-resolution textures and local AI workloads.`
        );
      }
    } else if (category === 'cpu') {
      const coresA = (a.specifications as any).cores;
      const coresB = (b.specifications as any).cores;
      if (coresA && coresB && coresA !== coresB) {
        observations.push(
          `${coresA > coresB ? a.name : b.name} has ${Math.max(coresA, coresB)} cores versus ${Math.min(coresA, coresB)} cores, aiding heavy multi-threaded render workflows.`
        );
      }
      const sockA = (a.specifications as any).socket;
      const sockB = (b.specifications as any).socket;
      if (sockA && sockB && sockA !== sockB) {
        observations.push(
          `Socket platform differs (${sockA} vs ${sockB}). Motherboards and memory generation choices must align accordingly.`
        );
      }
    } else if (category === 'ram') {
      const typeA = (a.specifications as any).type;
      const typeB = (b.specifications as any).type;
      if (typeA !== typeB) {
        observations.push(
          `Generational difference: ${typeA} and ${typeB} require different motherboards and cannot be mixed.`
        );
      }
    }

    return observations;
  }, [comparedComponents, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-magenta-400">
            Side-by-Side Analysis
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Component Comparison
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-400 mt-1">
            Compare 2 or 3 components from the same category. Objective specification differences and honest trade-offs.
          </p>
        </div>

        {notification && (
          <div className="px-3.5 py-2 rounded-xl bg-magenta-950/60 border border-magenta-700/60 text-xs text-magenta-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-magenta-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Category Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-charcoal-400 mr-2 shrink-0">
          Category:
        </span>
        {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
          const isSelected = category === catKey;
          return (
            <button
              key={catKey}
              onClick={() => handleCategoryChange(catKey as ComponentCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-magenta-accent text-white shadow-magenta-sm'
                  : 'bg-charcoal-900 text-charcoal-400 hover:text-white border border-charcoal-800'
              }`}
            >
              <ComponentIcon category={catKey as ComponentCategory} className="w-3.5 h-3.5" />
              <span>{label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Component Selection Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparedComponents.map((comp, idx) => (
          <div
            key={comp.id}
            className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-750 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="magenta" size="sm">
                  Option {idx + 1}
                </Badge>
                <button
                  onClick={() => handleRemoveComponent(comp.id)}
                  className="text-charcoal-400 hover:text-rose-400 p-1 rounded"
                  title="Remove from comparison"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-start gap-3 my-2">
                <Component2DImage
                  component={comp}
                  category={comp.category}
                  size="md"
                  className="w-14 h-14"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-2">{comp.name}</h3>
                  <p className="text-xs text-magenta-400 font-semibold mb-1">{comp.brand}</p>
                  <InrPrice amount={comp.priceINR} size="md" className="text-white" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-charcoal-800 mt-3 flex items-center justify-between">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAddToBuild(comp)}
              >
                Use in Builder
              </Button>
              <a
                href={IndianRetailerRegistry.getRetailerDirectSearchUrl('mdcomputers', `${comp.brand} ${comp.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-charcoal-400 hover:text-magenta-300 inline-flex items-center gap-1"
              >
                <span>Store</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}

        {/* Add more button if less than 3 */}
        {comparedComponents.length < 3 && (
          <div className="p-4 rounded-xl border border-dashed border-charcoal-800 bg-charcoal-900/40 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
            <span className="text-xs text-charcoal-400">
              Add a {CATEGORY_LABELS[category].toLowerCase()} to compare
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddComponent(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-xs text-white focus:outline-none focus:border-magenta-500 max-w-xs"
            >
              <option value="" disabled>
                Select component...
              </option>
              {availableInCategory
                .filter((c) => !selectedIds.includes(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand} {c.name} ({formatINR(c.priceINR)})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Trade-Offs Summary */}
      {tradeOffSummary && tradeOffSummary.length > 0 && (
        <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Scale className="w-4 h-4 text-magenta-400" />
            <span>Honest Trade-Off Analysis</span>
          </div>
          <ul className="space-y-1.5 text-xs text-charcoal-300 list-disc list-inside">
            {tradeOffSummary.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-charcoal-500 pt-1">
            Note: System Maker Core India presents objective specifications. We do not invent synthetic percentage leads or declare artificial winners.
          </p>
        </div>
      )}

      {/* Side-by-Side Specifications Matrix */}
      {comparedComponents.length >= 2 && (
        <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-charcoal-800 bg-charcoal-850/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Technical Specification Matrix
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-charcoal-850 text-charcoal-400 uppercase tracking-wider font-semibold border-b border-charcoal-800">
                <tr>
                  <th className="py-3 px-4 w-1/4">Specification</th>
                  {comparedComponents.map((comp) => (
                    <th key={comp.id} className="py-3 px-4">
                      {comp.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {/* Price Row */}
                <tr className="bg-charcoal-850/30">
                  <td className="py-3 px-4 font-semibold text-charcoal-300">Price (INR)</td>
                  {comparedComponents.map((comp) => (
                    <td key={comp.id} className="py-3 px-4">
                      <InrPrice amount={comp.priceINR} size="md" className="text-magenta-400" />
                    </td>
                  ))}
                </tr>

                {/* Brand */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-charcoal-300">Manufacturer</td>
                  {comparedComponents.map((comp) => (
                    <td key={comp.id} className="py-3 px-4 text-white font-medium">
                      {comp.brand}
                    </td>
                  ))}
                </tr>

                {/* Warranty */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-charcoal-300">Warranty</td>
                  {comparedComponents.map((comp) => (
                    <td key={comp.id} className="py-3 px-4 text-charcoal-200">
                      {comp.warrantyYears ? `${comp.warrantyYears} Years (India)` : 'Standard Manufacturer'}
                    </td>
                  ))}
                </tr>

                {/* Spec keys */}
                {specKeys.map((key) => (
                  <tr key={key} className="hover:bg-charcoal-850/40 transition-colors">
                    <td className="py-3 px-4 font-mono capitalize text-charcoal-400">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </td>
                    {comparedComponents.map((comp) => {
                      const val = (comp.specifications as any)[key];
                      return (
                        <td key={comp.id} className="py-3 px-4 text-charcoal-200">
                          {val === undefined || val === null ? (
                            <span className="text-charcoal-600">—</span>
                          ) : typeof val === 'boolean' ? (
                            val ? (
                              <Badge variant="success" size="sm">Yes</Badge>
                            ) : (
                              <Badge variant="outline" size="sm">No</Badge>
                            )
                          ) : Array.isArray(val) ? (
                            val.join(', ')
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
