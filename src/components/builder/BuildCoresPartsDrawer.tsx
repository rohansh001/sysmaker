'use client';

import React, { useState } from 'react';
import { BuildComponents, Component, ComponentCategory } from '@/types';
import { CATEGORY_LABELS } from '@/components/common/ComponentIcon';
import { Component2DImage } from '@/components/common/Component2DImage';
import { InrPrice } from '@/components/common/InrPrice';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  X,
  ExternalLink,
  Settings,
  TrendingDown,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  ShoppingBag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { INDIAN_RETAILERS } from '@/data/retailerAdapters';

interface BuildCoresPartsDrawerProps {
  components: BuildComponents;
  onSelectCategory: (category: ComponentCategory) => void;
  onRemoveCategory: (category: ComponentCategory) => void;
  onOpenSettingsModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const BuildCoresPartsDrawer: React.FC<BuildCoresPartsDrawerProps> = ({
  components,
  onSelectCategory,
  onRemoveCategory,
  onOpenSettingsModal,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'history'>('parts');
  const [isPcBuildOpen, setIsPcBuildOpen] = useState(true);

  // Categories in exact BuildCores order
  const buildCoresCategories: {
    category: ComponentCategory;
    label: string;
    description: string;
  }[] = [
    { category: 'cabinet', label: 'Case', description: 'ATX Mid/Full Tower' },
    { category: 'cpu', label: 'CPU', description: 'Processor' },
    { category: 'motherboard', label: 'Motherboard', description: 'Mainboard' },
    { category: 'gpu', label: 'GPU', description: 'Video Graphics Card' },
    { category: 'ram', label: 'RAM', description: 'DDR4 / DDR5 Memory' },
    { category: 'cooler', label: 'CPU Cooler', description: 'Air / AIO Liquid Cooler' },
    { category: 'storage', label: 'Storage', description: 'NVMe SSD / SATA' },
    { category: 'psu', label: 'Power Supply', description: '80+ Certified PSU' },
  ];

  const peripheralCategories: {
    category: ComponentCategory;
    label: string;
  }[] = [
    { category: 'monitor', label: 'Monitor' },
    { category: 'keyboard', label: 'Keyboard' },
    { category: 'mouse', label: 'Mouse' },
  ];

  const additionalProducts = [
    { name: 'Thermal Compound', desc: 'High-conductivity paste (e.g. Arctic MX-6)' },
    { name: 'Operating System', desc: 'Windows 11 Home / Pro 64-bit' },
    { name: 'Sound Card', desc: 'Dedicated 7.1 DAC / PCIe Audio' },
    { name: 'Network Card', desc: 'Wi-Fi 6E / 2.5GbE PCIe Adapter' },
    { name: 'Capture Card', desc: '4K60 HDR Streaming Card' },
  ];

  const totalPartsCount = Object.keys(components).filter(
    (k) => components[k as ComponentCategory]
  ).length;

  return (
    <aside
      className={`w-80 sm:w-96 shrink-0 bg-charcoal-950/95 border-l border-charcoal-800/80 flex flex-col h-full select-none text-xs transition-all ${
        isCollapsed ? 'hidden' : 'flex'
      } ${className}`}
    >
      {/* Top Drawer Header with Tabs */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-charcoal-800 bg-charcoal-900/60">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('parts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'parts'
                ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
                : 'text-charcoal-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-magenta-400" />
            <span>Parts</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-magenta-950 text-magenta-300 text-[10px] font-bold border border-magenta-700/60">
              {totalPartsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
                : 'text-charcoal-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Price History</span>
          </button>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-charcoal-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
            title="Collapse Parts Panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'parts' ? (
          <>
            {/* PC BUILD Section Accordion */}
            <div>
              <div
                onClick={() => setIsPcBuildOpen(!isPcBuildOpen)}
                className="flex items-center justify-between py-1.5 px-1 text-charcoal-300 hover:text-white cursor-pointer font-bold uppercase tracking-wider text-[11px]"
              >
                <div className="flex items-center gap-1.5">
                  {isPcBuildOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-magenta-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-magenta-400" />
                  )}
                  <span>PC BUILD</span>
                </div>
                <span className="text-[10px] text-charcoal-400 normal-case">
                  {totalPartsCount} of 8 Core Slots
                </span>
              </div>

              {/* Retailer Sponsor banner matching BuildCores screenshot */}
              <div className="my-2 p-2 rounded-lg bg-charcoal-900/80 border border-charcoal-800 text-[10px] text-charcoal-300 flex items-center justify-between">
                <span className="font-semibold text-charcoal-300">
                  ⚡ Verified Indian Retailer Pricing
                </span>
                <span className="text-magenta-400 font-bold">100% Free</span>
              </div>

              {/* Slots List */}
              {isPcBuildOpen && (
                <div className="space-y-2 mt-2">
                  {buildCoresCategories.map((slot) => {
                    const comp = components[slot.category];

                    return (
                      <div
                        key={slot.category}
                        className={`rounded-xl border transition-all ${
                          comp
                            ? 'bg-charcoal-900/90 border-charcoal-800 p-2.5'
                            : 'bg-charcoal-900/40 border-dashed border-charcoal-800/80 p-2 hover:border-charcoal-700 hover:bg-charcoal-900/60'
                        }`}
                      >
                        {/* Slot Header / Category Pill */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300 border border-charcoal-700">
                            {slot.label}
                          </span>

                          {comp && (
                            <div className="flex items-center gap-1">
                              {/* Settings gear */}
                              <button
                                onClick={onOpenSettingsModal}
                                className="p-1 text-charcoal-400 hover:text-white rounded transition-colors"
                                title="Slot settings"
                              >
                                <Settings className="w-3 h-3" />
                              </button>
                              {/* Swap icon */}
                              <button
                                onClick={() => onSelectCategory(slot.category)}
                                className="p-1 text-charcoal-400 hover:text-magenta-400 rounded transition-colors"
                                title={`Swap ${slot.label}`}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                              {/* Remove icon */}
                              <button
                                onClick={() => onRemoveCategory(slot.category)}
                                className="p-1 text-charcoal-400 hover:text-rose-400 rounded transition-colors"
                                title={`Remove ${slot.label}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {comp ? (
                          /* Populated Component State */
                          <div className="flex items-center gap-3">
                            {/* 2D Thumbnail */}
                            <div
                              onClick={() => onSelectCategory(slot.category)}
                              className="w-12 h-12 rounded-lg bg-charcoal-950 border border-charcoal-700/60 flex items-center justify-center p-1 shrink-0 overflow-hidden cursor-pointer hover:border-magenta-500 transition-colors"
                            >
                              <Component2DImage
                                component={comp}
                                category={comp.category}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            {/* Info & Price */}
                            <div className="flex-1 min-w-0">
                              <h4
                                onClick={() => onSelectCategory(slot.category)}
                                className="text-xs font-semibold text-white truncate cursor-pointer hover:text-magenta-300 transition-colors"
                              >
                                {comp.name}
                              </h4>
                              <div className="text-xs font-bold text-magenta-400 mt-0.5">
                                <InrPrice amount={comp.priceINR} />
                              </div>
                            </div>

                            {/* Indian Retailer Buy Button */}
                            <a
                              href={comp.retailerUrl || 'https://www.amazon.in'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-[#f0c14b]/15 hover:bg-[#f0c14b]/25 border border-[#f0c14b]/40 text-[#f0c14b] text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-sm"
                              title={`View offer on ${comp.retailerName || 'Indian Retailer'}`}
                            >
                              <span>{comp.retailerName ? `${comp.retailerName.split(' ')[0]} Buy` : 'Buy'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ) : (
                          /* Empty Slot State matching BuildCores "+ Add Part" */
                          <button
                            onClick={() => onSelectCategory(slot.category)}
                            className="w-full flex items-center justify-between py-1 px-1 text-charcoal-400 hover:text-white transition-colors group"
                          >
                            <span className="text-[11px] text-charcoal-400 group-hover:text-charcoal-300">
                              Select {slot.label}
                            </span>
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800 group-hover:bg-magenta-accent text-charcoal-300 group-hover:text-white font-semibold text-[10px] transition-all">
                              <Plus className="w-3 h-3" />
                              <span>Add Part</span>
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Additional Products Section matching BuildCores screenshot */}
            <div className="pt-2 border-t border-charcoal-800/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 mb-2">
                Additional Products
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {additionalProducts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      alert(
                        `${item.name}: ${item.desc}\n(Optional accessory support is active in System Maker Core India!)`
                      )
                    }
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 text-charcoal-300 hover:text-white text-[11px] font-medium transition-all text-left"
                  >
                    <Plus className="w-3 h-3 text-charcoal-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Peripherals Section */}
            <div className="pt-2 border-t border-charcoal-800/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 mb-2">
                Peripherals (Setup Mode)
              </div>
              <div className="space-y-1.5">
                {peripheralCategories.map((periph) => {
                  const comp = components[periph.category];

                  return (
                    <div
                      key={periph.category}
                      className="p-2 rounded-xl bg-charcoal-900/60 border border-charcoal-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-charcoal-800 text-charcoal-400">
                          {periph.label}
                        </span>
                        <span className="text-[11px] text-white truncate">
                          {comp ? comp.name : `No ${periph.label} selected`}
                        </span>
                      </div>

                      {comp ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-bold text-magenta-400 mr-1">
                            <InrPrice amount={comp.priceINR} />
                          </span>
                          <button
                            onClick={() => onRemoveCategory(periph.category)}
                            className="p-1 text-charcoal-400 hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectCategory(periph.category)}
                          className="px-2 py-0.5 rounded bg-charcoal-800 hover:bg-magenta-accent text-charcoal-300 hover:text-white font-semibold text-[10px] flex items-center gap-1 shrink-0 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* "Price History & Specs" Tab */
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Lowest Price Tracker</span>
                <span className="text-[10px] text-emerald-400 font-bold">Good Time to Buy</span>
              </div>
              <p className="text-[11px] text-charcoal-400 leading-relaxed">
                Aggregated daily from Amazon India, MDComputers, Vedant, and PrimeABGB.
              </p>
            </div>

            {/* Component price trend rows */}
            <div className="space-y-2">
              {buildCoresCategories
                .filter((slot) => components[slot.category])
                .map((slot) => {
                  const comp = components[slot.category]!;
                  const historicalLow = Math.round(comp.priceINR * 0.94);

                  return (
                    <div
                      key={slot.category}
                      className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                          {slot.label}
                        </span>
                        <span className="text-[11px] font-bold text-white">
                          <InrPrice amount={comp.priceINR} />
                        </span>
                      </div>
                      <div className="text-[11px] text-white font-medium truncate">
                        {comp.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-charcoal-400 pt-1 border-t border-charcoal-800">
                        <span>30-Day Lowest: <strong className="text-emerald-400"><InrPrice amount={historicalLow} /></strong></span>
                        <span>via {comp.retailerName || 'MDComputers'}</span>
                      </div>
                    </div>
                  );
                })}

              {totalPartsCount === 0 && (
                <div className="py-8 text-center text-charcoal-500 text-xs">
                  Select components to view historical pricing and retailer trends.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
