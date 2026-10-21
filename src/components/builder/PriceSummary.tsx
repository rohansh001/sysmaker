import React, { useState } from 'react';
import { PriceBreakdown } from '@/types';
import { InrPrice } from '@/components/common/InrPrice';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Bookmark,
  Share2,
  Download,
  Trash2,
  Info,
  DollarSign,
  Truck,
  Settings2,
} from 'lucide-react';
import { formatINR } from '@/engine/pricing';

interface PriceSummaryProps {
  breakdown: PriceBreakdown;
  budgetCapINR: number;
  onBudgetChange: (val: number) => void;
  includePeripheralsInBudget: boolean;
  onToggleIncludePeripherals: (val: boolean) => void;
  enableTaxEstimate: boolean;
  onToggleTax: (val: boolean) => void;
  enableShippingEstimate: boolean;
  onToggleShipping: (val: boolean) => void;
  onSaveBuild: () => void;
  onShareBuild: () => void;
  onExportJson: () => void;
  onClearBuild: () => void;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  breakdown,
  budgetCapINR,
  onBudgetChange,
  includePeripheralsInBudget,
  onToggleIncludePeripherals,
  enableTaxEstimate,
  onToggleTax,
  enableShippingEstimate,
  onToggleShipping,
  onSaveBuild,
  onShareBuild,
  onExportJson,
  onClearBuild,
}) => {
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budgetCapINR ? String(budgetCapINR) : '');

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(budgetInput, 10);
    onBudgetChange(isNaN(parsed) || parsed < 0 ? 0 : parsed);
  };

  return (
    <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl p-5 space-y-5 sticky top-20 shadow-xl">
      {/* Title & Count */}
      <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Build Summary
          </h3>
          <p className="text-xs text-charcoal-400">
            {breakdown.componentCount} component{breakdown.componentCount !== 1 ? 's' : ''} selected
          </p>
        </div>

        <Badge variant={breakdown.componentCount > 0 ? 'magenta' : 'outline'} size="sm">
          {breakdown.componentCount} / 11 Parts
        </Badge>
      </div>

      {/* Subtotals Breakdown */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-charcoal-300">
          <span>Core Components Subtotal</span>
          <InrPrice amount={breakdown.coreSubtotalINR} size="sm" className="text-white" />
        </div>

        <div className="flex items-center justify-between text-charcoal-300">
          <div className="flex items-center gap-1.5">
            <span>Peripherals Subtotal</span>
            {breakdown.peripheralSubtotalINR > 0 && !includePeripheralsInBudget && (
              <span className="text-[10px] text-charcoal-500">(Excluded from budget)</span>
            )}
          </div>
          <InrPrice amount={breakdown.peripheralSubtotalINR} size="sm" className="text-white" />
        </div>

        {enableTaxEstimate && (
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-magenta-400" />
              Tax / GST Estimate (18%)
            </span>
            <InrPrice amount={breakdown.taxEstimateINR} size="sm" className="text-white" />
          </div>
        )}

        {enableShippingEstimate && (
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-magenta-400" />
              Estimated Indian Shipping
            </span>
            <InrPrice amount={breakdown.shippingEstimateINR} size="sm" className="text-white" />
          </div>
        )}

        {/* Grand Total */}
        <div className="pt-3 border-t border-charcoal-800 flex items-baseline justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Grand Total</span>
            <span className="text-[10px] text-charcoal-400">Indian Market Estimate (INR)</span>
          </div>
          <InrPrice
            amount={breakdown.effectiveTotalINR}
            size="xl"
            className="text-magenta-400 font-black tracking-tight"
          />
        </div>
      </div>

      {/* Budget Goal Tracker */}
      <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-charcoal-200">
            Target Budget (₹)
          </label>
          {budgetCapINR > 0 && (
            <Badge
              variant={breakdown.budgetStatus === 'within_budget' ? 'success' : 'danger'}
              size="sm"
            >
              {breakdown.budgetStatus === 'within_budget'
                ? `${formatINR(breakdown.budgetDeltaINR || 0)} Remaining`
                : `${formatINR(Math.abs(breakdown.budgetDeltaINR || 0))} Over Budget`}
            </Badge>
          )}
        </div>

        <form onSubmit={handleBudgetSubmit} className="flex gap-2">
          <input
            type="number"
            placeholder="e.g. 50000"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-charcoal-900 border border-charcoal-700 rounded-lg text-xs text-white placeholder-charcoal-500 focus:outline-none focus:border-magenta-500"
          />
          <Button variant="secondary" size="sm" type="submit">
            Set
          </Button>
        </form>

        {/* Peripherals in budget toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-charcoal-400 hover:text-charcoal-300 select-none pt-1">
          <input
            type="checkbox"
            checked={includePeripheralsInBudget}
            onChange={(e) => onToggleIncludePeripherals(e.target.checked)}
            className="rounded border-charcoal-700 bg-charcoal-900 text-magenta-accent focus:ring-magenta-500/30"
          />
          <span>Include monitor & accessories in target budget</span>
        </label>
      </div>

      {/* Advanced Pricing Options (Tax & Shipping) */}
      <div className="space-y-2">
        <button
          onClick={() => setShowAdvancedPricing(!showAdvancedPricing)}
          className="flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-white transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{showAdvancedPricing ? 'Hide Tax & Shipping Controls' : 'Configure Tax & Shipping Estimates'}</span>
        </button>

        {showAdvancedPricing && (
          <div className="p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800 space-y-2 text-xs">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableTaxEstimate}
                onChange={(e) => onToggleTax(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-700 bg-charcoal-900 text-magenta-accent"
              />
              <div>
                <span className="font-semibold text-charcoal-200 block">Apply 18% GST Surcharge</span>
                <span className="text-[10px] text-charcoal-400">
                  Most Indian retailer prices already include GST. Enable only if purchasing ex-GST products.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={enableShippingEstimate}
                onChange={(e) => onToggleShipping(e.target.checked)}
                className="mt-0.5 rounded border-charcoal-700 bg-charcoal-900 text-magenta-accent"
              />
              <div>
                <span className="font-semibold text-charcoal-200 block">Add ₹500 Flat Shipping Allowance</span>
                <span className="text-[10px] text-charcoal-400">
                  Estimated inter-state courier cost for heavy items like cabinet and PSU.
                </span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Primary Builder Actions */}
      <div className="space-y-2 pt-2 border-t border-charcoal-800">
        <Button
          variant="primary"
          className="w-full"
          size="md"
          icon={<Bookmark className="w-4 h-4" />}
          onClick={onSaveBuild}
          disabled={breakdown.componentCount === 0}
        >
          Save Build
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Share2 className="w-3.5 h-3.5" />}
            onClick={onShareBuild}
            disabled={breakdown.componentCount === 0}
          >
            Share URL
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={onExportJson}
            disabled={breakdown.componentCount === 0}
          >
            Export JSON
          </Button>
        </div>

        {breakdown.componentCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={onClearBuild}
            className="w-full text-charcoal-500 hover:text-rose-400"
          >
            Clear Entire Build
          </Button>
        )}
      </div>
    </div>
  );
};
