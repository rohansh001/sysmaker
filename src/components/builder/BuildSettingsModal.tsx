'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Settings, IndianRupee, ShieldCheck, Truck, Percent } from 'lucide-react';

interface BuildSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetCapINR: number;
  onBudgetChange: (val: number) => void;
  includePeripheralsInBudget: boolean;
  onToggleIncludePeripherals: (val: boolean) => void;
  enableTaxEstimate: boolean;
  onToggleTax: (val: boolean) => void;
  enableShippingEstimate: boolean;
  onToggleShipping: (val: boolean) => void;
}

export const BuildSettingsModal: React.FC<BuildSettingsModalProps> = ({
  isOpen,
  onClose,
  budgetCapINR,
  onBudgetChange,
  includePeripheralsInBudget,
  onToggleIncludePeripherals,
  enableTaxEstimate,
  onToggleTax,
  enableShippingEstimate,
  onToggleShipping,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Build & Budget Settings"
      description="Configure target budget constraints, tax allowances, and peripheral inclusions."
      maxWidth="md"
    >
      <div className="space-y-5 text-xs text-charcoal-300">
        {/* Target Budget Cap */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            Target Budget Cap (INR)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-charcoal-400 font-bold">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="5000"
              value={budgetCapINR || ''}
              onChange={(e) => onBudgetChange(Number(e.target.value) || 0)}
              placeholder="e.g. 80000 (0 for unlimited)"
              className="w-full pl-8 pr-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white font-medium focus:border-magenta-500 outline-none"
            />
          </div>
          <p className="text-[11px] text-charcoal-400">
            Set to 0 to disable budget constraint warnings.
          </p>
        </div>

        {/* Include Peripherals Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
          <div>
            <div className="font-semibold text-white">Include Peripherals in Total Budget</div>
            <div className="text-[11px] text-charcoal-400">
              Count Monitor, Keyboard, and Mouse towards the target budget cap.
            </div>
          </div>
          <input
            type="checkbox"
            checked={includePeripheralsInBudget}
            onChange={(e) => onToggleIncludePeripherals(e.target.checked)}
            className="w-4 h-4 rounded text-magenta-600 bg-charcoal-800 border-charcoal-700 focus:ring-magenta-500 cursor-pointer"
          />
        </div>

        {/* GST / Tax Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
          <div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-magenta-400" />
              <span>Show GST / Tax Breakdown</span>
            </div>
            <div className="text-[11px] text-charcoal-400">
              Estimated 18% GST calculation on Indian hardware components.
            </div>
          </div>
          <input
            type="checkbox"
            checked={enableTaxEstimate}
            onChange={(e) => onToggleTax(e.target.checked)}
            className="w-4 h-4 rounded text-magenta-600 bg-charcoal-800 border-charcoal-700 focus:ring-magenta-500 cursor-pointer"
          />
        </div>

        {/* Shipping Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
          <div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-magenta-400" />
              <span>Estimated Shipping Buffer</span>
            </div>
            <div className="text-[11px] text-charcoal-400">
              Add nominal delivery estimate for heavy items (cases, monitors).
            </div>
          </div>
          <input
            type="checkbox"
            checked={enableShippingEstimate}
            onChange={(e) => onToggleShipping(e.target.checked)}
            className="w-4 h-4 rounded text-magenta-600 bg-charcoal-800 border-charcoal-700 focus:ring-magenta-500 cursor-pointer"
          />
        </div>

        <div className="pt-3 border-t border-charcoal-800 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
