import React from 'react';
import { Component, PsuSpecs } from '@/types';
import { Zap, AlertCircle, ShieldCheck } from 'lucide-react';

interface PowerEstimatorProps {
  estimatedWattage: number;
  recommendedWattage: number;
  selectedPsu?: Component;
}

export const PowerEstimator: React.FC<PowerEstimatorProps> = ({
  estimatedWattage,
  recommendedWattage,
  selectedPsu,
}) => {
  const psuSpecs = selectedPsu?.specifications as PsuSpecs | undefined;
  const psuWattage = psuSpecs?.wattage;

  // Percentage of PSU used by estimated draw
  const percentage = psuWattage
    ? Math.min(Math.round((estimatedWattage / psuWattage) * 100), 100)
    : 0;

  const isOverloaded = psuWattage ? estimatedWattage > psuWattage : false;
  const isTight = psuWattage ? psuWattage < recommendedWattage : false;

  return (
    <div className="bg-charcoal-900 border border-charcoal-750 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Power Estimator
          </h4>
        </div>

        <div className="text-right">
          <span className="text-xs text-charcoal-400 mr-2">Estimated Draw:</span>
          <span className="text-sm font-black text-amber-400 font-mono">
            ~{estimatedWattage}W
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {psuWattage ? (
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-charcoal-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOverloaded
                  ? 'bg-rose-500'
                  : isTight
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-charcoal-400">
            <span>
              Load: {percentage}% of {psuWattage}W PSU
            </span>
            <span>
              Target Headroom: {recommendedWattage}W (+30%)
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-charcoal-850 border border-charcoal-800 text-xs text-charcoal-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-charcoal-400 shrink-0" />
          <span>
            Select a Power Supply (PSU) to verify wattage headroom. Recommended: at least {recommendedWattage}W.
          </span>
        </div>
      )}

      {/* Transparent Disclaimer */}
      <div className="mt-3 pt-3 border-t border-charcoal-800/80 text-[10px] text-charcoal-400 leading-relaxed flex items-start gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-charcoal-400 shrink-0 mt-0.5" />
        <span>
          Note: Wattage arithmetic is an estimated baseline. High-tier GPUs experience sudden millisecond transient power spikes requiring high-quality capacitors and 12V single-rail stability.
        </span>
      </div>
    </div>
  );
};
