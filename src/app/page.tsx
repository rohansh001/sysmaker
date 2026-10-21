'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Gamepad2,
  CheckCircle,
  ArrowRight,
  IndianRupee,
  Sparkles,
  ExternalLink,
  Laptop,
  Code2,
  Palette,
  Briefcase,
} from 'lucide-react';
import { BudgetTier, UseCase } from '@/types';
import {
  BUDGET_TIER_LABELS,
  USE_CASE_LABELS,
  getRecommendation,
  RECOMMENDATION_PRESETS,
} from '@/engine/recommendations';
import { InrPrice } from '@/components/common/InrPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LocalBuildStorage } from '@/storage/localStorage';
import { formatINR } from '@/engine/pricing';

export default function HomePage() {
  const router = useRouter();

  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>('35k-50k');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase>('gaming');

  // Compute recommendation dynamically based on selection
  const recommendation = getRecommendation(selectedBudget, selectedUseCase);

  const handleLoadRecommendation = (presetBuildComponents: any, name: string) => {
    const build = {
      id: `build-${Date.now()}`,
      name,
      components: presetBuildComponents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      includePeripheralsInBudget: false,
    };
    LocalBuildStorage.saveActiveBuild(build);
    router.push('/builder');
  };

  const useCaseIcons: Record<UseCase, React.ReactNode> = {
    'study-office': <Laptop className="w-4 h-4" />,
    programming: <Code2 className="w-4 h-4" />,
    'graphic-video': <Palette className="w-4 h-4" />,
    gaming: <Gamepad2 className="w-4 h-4" />,
    workstation: <Briefcase className="w-4 h-4" />,
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-charcoal-800">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-magenta-glow blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal-900 border border-charcoal-700/80 text-xs font-semibold text-charcoal-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-magenta-accent animate-pulse" />
            <span>Built for the Indian PC Building Community</span>
            <span className="text-charcoal-500">•</span>
            <span className="text-magenta-400 font-mono">100% Free & Transparent</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Design Your Custom PC in India with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-magenta-400 via-magenta-accent to-pink-500">
              Zero Compatibility Headaches
            </span>
          </h1>

          <p className="text-base sm:text-lg text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
            Verify CPU sockets, memory generations, GPU dimensions, and power headroom in real-time. Transparent INR pricing with verified Indian retailer references.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/builder">
              <Button
                variant="primary"
                size="lg"
                icon={<Wrench className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm px-6 py-3 font-bold"
              >
                Launch PC Builder
              </Button>
            </Link>

            <Link href="/components">
              <Button
                variant="secondary"
                size="lg"
                icon={<Cpu className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm px-6 py-3"
              >
                Explore Catalog ({50}+ Parts)
              </Button>
            </Link>
          </div>

          {/* Value highlights */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="text-xs font-bold text-white">Rule-Based Engine</div>
              <div className="text-[11px] text-charcoal-400">Deterministic socket & RAM check</div>
            </div>
            <div className="p-3.5 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
              <IndianRupee className="w-4 h-4 text-magenta-400 mb-1" />
              <div className="text-xs font-bold text-white">True INR Pricing</div>
              <div className="text-[11px] text-charcoal-400">Plausible local prices + 18% GST</div>
            </div>
            <div className="p-3.5 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
              <Gamepad2 className="w-4 h-4 text-sky-400 mb-1" />
              <div className="text-xs font-bold text-white">No Fake FPS</div>
              <div className="text-[11px] text-charcoal-400">Strict lab benchmark telemetry</div>
            </div>
            <div className="p-3.5 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
              <Zap className="w-4 h-4 text-amber-400 mb-1" />
              <div className="text-xs font-bold text-white">Power & Clearances</div>
              <div className="text-[11px] text-charcoal-400">Transient spikes & GPU lengths</div>
            </div>
          </div>
        </div>
      </section>

      {/* Guided Budget & Use-Case Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-charcoal-900 border border-charcoal-750 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-magenta-400">
              Guided Recommendation Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Select Your Budget & Primary Purpose
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-400">
              Our rule engine matches your target budget with verified, 100% compatible components and explains transparent trade-offs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Interactive Selectors */}
            <div className="space-y-6">
              {/* Budget Tiers */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-300 block">
                  1. Target Budget (INR)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(BUDGET_TIER_LABELS).map(([tierKey, meta]) => {
                    const isSelected = selectedBudget === tierKey;
                    return (
                      <button
                        key={tierKey}
                        onClick={() => setSelectedBudget(tierKey as BudgetTier)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-magenta-950/60 border-magenta-500 shadow-magenta-sm'
                            : 'bg-charcoal-850 border-charcoal-800 hover:border-charcoal-700 hover:bg-charcoal-800'
                        }`}
                      >
                        <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-charcoal-200'}`}>
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Use Cases */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-300 block">
                  2. Primary Intended Use
                </label>
                <div className="space-y-2">
                  {Object.entries(USE_CASE_LABELS).map(([ucKey, meta]) => {
                    const isSelected = selectedUseCase === ucKey;
                    return (
                      <button
                        key={ucKey}
                        onClick={() => setSelectedUseCase(ucKey as UseCase)}
                        className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-magenta-950/60 border-magenta-500 shadow-magenta-sm'
                            : 'bg-charcoal-850 border-charcoal-800 hover:border-charcoal-700 hover:bg-charcoal-800'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${
                          isSelected ? 'bg-magenta-accent text-white' : 'bg-charcoal-800 text-charcoal-400'
                        }`}>
                          {useCaseIcons[ucKey as UseCase]}
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-charcoal-200'}`}>
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-charcoal-400 line-clamp-1 mt-0.5">
                            {meta.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Dynamic Recommended Build Card */}
            <div className="bg-charcoal-850 border border-charcoal-750 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
                <div>
                  <Badge variant="magenta" size="sm" className="mb-1">
                    Recommended Match
                  </Badge>
                  <h3 className="text-base font-bold text-white">
                    {recommendation.preset?.title}
                  </h3>
                </div>

                <div className="text-right">
                  <InrPrice amount={recommendation.totalCostINR} size="xl" className="text-magenta-400" />
                  <span className="block text-[10px] text-charcoal-400">
                    Estimated Build Total
                  </span>
                </div>
              </div>

              {/* Rationale */}
              <p className="text-xs text-charcoal-300 leading-relaxed">
                {recommendation.preset?.rationale}
              </p>

              {/* Selected components list */}
              <div className="space-y-1.5 bg-charcoal-900/90 p-4 rounded-xl border border-charcoal-800 text-xs">
                {Object.entries(recommendation.components).map(([cat, comp]) => (
                  <div key={cat} className="flex justify-between items-center py-0.5">
                    <span className="text-charcoal-400 uppercase text-[10px] font-mono w-24">
                      {cat}:
                    </span>
                    <span className="font-semibold text-white truncate max-w-[220px]">
                      {comp?.brand} {comp?.name}
                    </span>
                    <InrPrice amount={comp?.priceINR || 0} size="sm" className="text-charcoal-300 ml-2" />
                  </div>
                ))}
              </div>

              {/* Trade-offs & Highlights */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-charcoal-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-magenta-400" />
                  <span>Key Trade-Offs & Disclosures:</span>
                </div>
                <ul className="space-y-1 text-charcoal-400 list-disc list-inside text-[11px]">
                  {recommendation.preset?.tradeOffs.map((to, i) => (
                    <li key={i}>{to}</li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <Button
                variant="primary"
                size="md"
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() =>
                  handleLoadRecommendation(
                    recommendation.components,
                    recommendation.preset?.title || 'Recommended Build'
                  )
                }
              >
                Customize This Build in Builder
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Indian Builds */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-charcoal-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-magenta-400">
              Popular Presets
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Curated Builds for Indian Gamers & Creators
            </h2>
          </div>

          <Link href="/builder" className="text-xs font-semibold text-magenta-400 hover:text-magenta-300 inline-flex items-center gap-1">
            <span>Explore all options in builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {RECOMMENDATION_PRESETS.slice(0, 4).map((preset) => {
            const rec = getRecommendation(preset.budgetTier, preset.useCase);
            return (
              <div
                key={preset.id}
                className="bg-charcoal-900 border border-charcoal-750 hover:border-magenta-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-charcoal-850/60 shadow-lg group"
              >
                <div className="space-y-3">
                  <Badge variant="magenta" size="sm">
                    {BUDGET_TIER_LABELS[preset.budgetTier].label}
                  </Badge>

                  <h3 className="text-sm font-bold text-white group-hover:text-magenta-300 transition-colors">
                    {preset.title}
                  </h3>

                  <InrPrice amount={rec.totalCostINR} size="xl" className="text-white" />

                  <p className="text-xs text-charcoal-400 line-clamp-3 leading-relaxed">
                    {preset.rationale}
                  </p>

                  <div className="space-y-1 text-[11px] text-charcoal-300 pt-1">
                    {preset.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span className="text-charcoal-300 truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-charcoal-800 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-magenta-accent group-hover:border-magenta-accent group-hover:text-white transition-all"
                    onClick={() => handleLoadRecommendation(rec.components, preset.title)}
                  >
                    Open in Configurator
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to action section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-charcoal-900 via-charcoal-850 to-charcoal-900 border border-charcoal-700/80 p-8 sm:p-12 text-center space-y-5 overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-magenta-accent text-white flex items-center justify-center mx-auto shadow-magenta-sm">
            <Wrench className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight max-w-xl mx-auto">
            Ready to Build Your Custom Desktop PC?
          </h2>

          <p className="text-xs sm:text-sm text-charcoal-400 max-w-md mx-auto leading-relaxed">
            Start picking components from scratch or modify a curated preset. Save your configuration locally or share it with friends with a single URL.
          </p>

          <div className="pt-2">
            <Link href="/builder">
              <Button variant="primary" size="lg" className="font-bold px-8">
                Start Building Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
