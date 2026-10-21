import { describe, it, expect } from 'vitest';
import {
  RECOMMENDATION_PRESETS,
  getRecommendation,
  BUDGET_TIER_LABELS,
} from '@/engine/recommendations';
import { checkCompatibility } from '@/engine/compatibility';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { BuildComponents } from '@/types';

describe('Budget Recommendation Engine', () => {
  it('has valid, existing catalog components for every preset', () => {
    for (const preset of RECOMMENDATION_PRESETS) {
      for (const cid of preset.componentIds) {
        const found = COMPONENT_CATALOG.find((c) => c.id === cid);
        expect(found, `Preset ${preset.id} references missing component ${cid}`).toBeDefined();
      }
    }
  });

  it('guarantees every preset produces a 100% compatible build with 0 errors', () => {
    for (const preset of RECOMMENDATION_PRESETS) {
      const build: BuildComponents = {};
      for (const cid of preset.componentIds) {
        const comp = COMPONENT_CATALOG.find((c) => c.id === cid);
        if (comp) build[comp.category] = comp;
      }
      const report = checkCompatibility(build);
      const errors = report.issues.filter((i) => i.severity === 'error');
      expect(
        errors,
        `Preset "${preset.title}" produced errors: ${errors.map((e) => e.message).join('; ')}`
      ).toHaveLength(0);
      expect(report.coreComplete, `Preset "${preset.title}" missing core components`).toBe(true);
    }
  });

  it('respects the budget tier ceiling for preset recommendations', () => {
    for (const preset of RECOMMENDATION_PRESETS) {
      const tierMeta = BUDGET_TIER_LABELS[preset.budgetTier];
      let total = 0;
      for (const cid of preset.componentIds) {
        const comp = COMPONENT_CATALOG.find((c) => c.id === cid);
        if (comp) total += comp.priceINR;
      }
      expect(
        total,
        `Preset "${preset.title}" price ₹${total} exceeded max ₹${tierMeta.maxINR}`
      ).toBeLessThanOrEqual(tierMeta.maxINR);
    }
  });

  it('retrieves recommendation with trade-offs and highlights', () => {
    const rec = getRecommendation('35k-50k', 'gaming');
    expect(rec.preset).toBeDefined();
    expect(rec.preset?.tradeOffs.length).toBeGreaterThan(0);
    expect(rec.preset?.highlights.length).toBeGreaterThan(0);
    expect(rec.totalCostINR).toBeGreaterThan(35000);
    expect(rec.totalCostINR).toBeLessThanOrEqual(50000);
  });
});
