import { describe, it, expect } from 'vitest';
import { calculatePriceBreakdown, formatINR } from '@/engine/pricing';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { BuildComponents } from '@/types';

function getComp(id: string) {
  const found = COMPONENT_CATALOG.find((c) => c.id === id);
  if (!found) throw new Error(`Component ${id} missing`);
  return found;
}

describe('Pricing Engine and INR Calculations', () => {
  it('formats Indian currency properly with lakh/thousand delimiters', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(35499)).toBe('₹35,499');
    expect(formatINR(125000)).toBe('₹1,25,000');
    expect(formatINR(1050000)).toBe('₹10,50,000');
  });

  it('separates core components and peripheral subtotals', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-amd-5600'), // 10499
      motherboard: getComp('mb-msi-b550m-vdh'), // 8999
      ram: getComp('ram-gskill-ripjaws-16gb-ddr4'), // 2999
      storage: getComp('storage-wd-blue-sn580-1tb'), // 5699
      psu: getComp('psu-cooler-master-mwe-550'), // 3799
      cabinet: getComp('cab-galax-revolution-05'), // 3299
      monitor: getComp('mon-viewsonic-vx2428'), // 9899
      mouse: getComp('mouse-logitech-g102'), // 1399
    };

    const breakdown = calculatePriceBreakdown(build);
    expect(breakdown.coreSubtotalINR).toBe(10499 + 8999 + 2999 + 5699 + 3799 + 3299); // 35294
    expect(breakdown.peripheralSubtotalINR).toBe(9899 + 1399); // 11298
    expect(breakdown.grandTotalINR).toBe(35294 + 11298); // 46592
    expect(breakdown.componentCount).toBe(8);
  });

  it('computes budget headroom and detect budget overruns', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-amd-5600'), // 10499
      gpu: getComp('gpu-asrock-rx6600'), // 18999
    };
    // Core sum = 29498

    const underBudget = calculatePriceBreakdown(build, { budgetCapINR: 35000 });
    expect(underBudget.budgetStatus).toBe('within_budget');
    expect(underBudget.budgetDeltaINR).toBe(35000 - 29498); // 5502

    const overBudget = calculatePriceBreakdown(build, { budgetCapINR: 25000 });
    expect(overBudget.budgetStatus).toBe('over_budget');
    expect(overBudget.budgetDeltaINR).toBe(25000 - 29498); // -4498
  });

  it('applies optional GST and flat shipping when explicitly enabled', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-intel-12400f'), // 8999
    };

    const standard = calculatePriceBreakdown(build);
    expect(standard.taxEstimateINR).toBe(0);
    expect(standard.shippingEstimateINR).toBe(0);
    expect(standard.effectiveTotalINR).toBe(8999);

    const withExtras = calculatePriceBreakdown(build, {
      enableTaxEstimate: true,
      taxRatePercent: 18,
      enableShippingEstimate: true,
      flatShippingINR: 400,
    });
    // 18% of 8999 = 1619.82 -> 1620
    expect(withExtras.taxEstimateINR).toBe(1620);
    expect(withExtras.shippingEstimateINR).toBe(400);
    expect(withExtras.effectiveTotalINR).toBe(8999 + 1620 + 400);
  });
});
