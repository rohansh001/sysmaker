'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { Component, ComponentCategory } from '@/types';
import { CATEGORY_LABELS, ComponentIcon } from '@/components/common/ComponentIcon';
import { Component2DImage } from '@/components/common/Component2DImage';
import { InrPrice } from '@/components/common/InrPrice';
import { Search, X, Plus, Check, ExternalLink, ArrowRight } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (comp: Component) => void;
  selectedComponents: Partial<Record<ComponentCategory, Component>>;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectComponent,
  selectedComponents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
      setSelectedCategoryFilter('all');
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredComponents = useMemo(() => {
    let list = COMPONENT_CATALOG;
    if (selectedCategoryFilter !== 'all') {
      list = list.filter((c) => c.category === selectedCategoryFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.modelNumber && c.modelNumber.toLowerCase().includes(q))
      );
    }
    return list.slice(0, 24); // Show top 24 matches
  }, [searchTerm, selectedCategoryFilter]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Parts' },
    { id: 'cpu', label: 'CPU' },
    { id: 'motherboard', label: 'Motherboard' },
    { id: 'gpu', label: 'Video Card' },
    { id: 'ram', label: 'Memory' },
    { id: 'cabinet', label: 'Case' },
    { id: 'psu', label: 'Power Supply' },
    { id: 'cooler', label: 'CPU Cooler' },
    { id: 'storage', label: 'Storage' },
    { id: 'monitor', label: 'Monitor' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-charcoal-900 border border-charcoal-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-charcoal-800 flex items-center gap-3 bg-charcoal-950/80">
          <Search className="w-5 h-5 text-magenta-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search parts by name, model, socket, or brand (e.g. Ryzen 7800X3D, RTX 4070, B650)..."
            className="w-full bg-transparent text-white placeholder-charcoal-500 text-sm sm:text-base outline-none font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-charcoal-400 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-charcoal-800 border border-charcoal-700 text-[10px] text-charcoal-300 font-mono">
            <span>ESC</span> to close
          </div>
          <button
            onClick={onClose}
            className="sm:hidden p-1.5 text-charcoal-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="px-4 py-2.5 bg-charcoal-950/40 border-b border-charcoal-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategoryFilter === cat.id
                  ? 'bg-magenta-600 text-white shadow-sm'
                  : 'bg-charcoal-800/60 text-charcoal-400 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredComponents.length === 0 ? (
            <div className="py-12 text-center text-charcoal-400">
              <p className="text-sm">No components found matching &quot;{searchTerm}&quot;</p>
              <p className="text-xs text-charcoal-500 mt-1">
                Try searching for general terms like &quot;Intel&quot;, &quot;AMD&quot;, &quot;RTX&quot;, or &quot;DDR5&quot;.
              </p>
            </div>
          ) : (
            filteredComponents.map((comp) => {
              const isSelected = selectedComponents[comp.category]?.id === comp.id;

              return (
                <div
                  key={comp.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'bg-magenta-950/30 border-magenta-600/60'
                      : 'bg-charcoal-850/60 border-charcoal-800 hover:border-charcoal-700 hover:bg-charcoal-800/80'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-charcoal-900 border border-charcoal-700/60 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <Component2DImage
                      component={comp}
                      category={comp.category}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-charcoal-800 text-charcoal-300 border border-charcoal-700">
                        {CATEGORY_LABELS[comp.category]}
                      </span>
                      <span className="text-xs text-charcoal-400">{comp.brand}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                      {comp.name}
                    </h4>
                    <div className="text-[11px] text-charcoal-400 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-magenta-400">
                        <InrPrice amount={comp.priceINR} />
                      </span>
                      {comp.retailerName && (
                        <span>• via {comp.retailerName}</span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => {
                      onSelectComponent(comp);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                      isSelected
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-magenta-accent hover:bg-magenta-600 text-white shadow-magenta-sm'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Installed</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Part</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-charcoal-950/80 border-t border-charcoal-800 text-[11px] text-charcoal-400 flex items-center justify-between">
          <span>Showing {filteredComponents.length} verified components</span>
          <span>Indian Rupees (INR) pricing</span>
        </div>
      </div>
    </div>
  );
};
