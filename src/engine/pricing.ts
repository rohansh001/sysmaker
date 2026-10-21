import { BuildComponents, PriceBreakdown } from '@/types';
import { CORE_CATEGORIES, PERIPHERAL_CATEGORIES } from './compatibility';

export interface PricingOptions {
  includePeripheralsInBudget?: boolean;
  budgetCapINR?: number;
  enableTaxEstimate?: boolean;
  taxRatePercent?: number; // default 18% GST in India
  enableShippingEstimate?: boolean;
  flatShippingINR?: number;
}

/**
 * Formats a number into Indian Rupee representation with Indian numbering grouping (Lakhs, Crores).
 * e.g., 35499 -> "₹35,499", 125000 -> "₹1,25,000"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Calculates subtotals, optional peripherals inclusion, tax/shipping estimates, and budget headroom.
 */
export function calculatePriceBreakdown(
  components: BuildComponents,
  options: PricingOptions = {}
): PriceBreakdown {
  const {
    includePeripheralsInBudget = false,
    budgetCapINR,
    enableTaxEstimate = false,
    taxRatePercent = 18,
    enableShippingEstimate = false,
    flatShippingINR = 500,
  } = options;

  let coreSubtotalINR = 0;
  let peripheralSubtotalINR = 0;
  let componentCount = 0;

  for (const [category, component] of Object.entries(components)) {
    if (!component) continue;
    const price = Math.round(component.priceINR || 0);
    componentCount += 1;

    if (CORE_CATEGORIES.includes(category as any)) {
      coreSubtotalINR += price;
    } else if (PERIPHERAL_CATEGORIES.includes(category as any)) {
      peripheralSubtotalINR += price;
    } else {
      coreSubtotalINR += price;
    }
  }

  const grandTotalINR = coreSubtotalINR + peripheralSubtotalINR;

  // Retail prices on Indian computer portals (MDComputers, PrimeABGB, Vedant) generally INCLUDE 18% GST.
  // Optional tax estimator simulates if components were purchased ex-GST (B2B) or supplementary local state levies.
  const taxEstimateINR = enableTaxEstimate
    ? Math.round((grandTotalINR * taxRatePercent) / 100)
    : 0;

  const shippingEstimateINR = enableShippingEstimate ? Math.round(flatShippingINR) : 0;

  const effectiveTotalINR = grandTotalINR + taxEstimateINR + shippingEstimateINR;

  // Budget calculations
  const consideredBudgetTotal = includePeripheralsInBudget
    ? effectiveTotalINR
    : coreSubtotalINR + (enableTaxEstimate ? Math.round((coreSubtotalINR * taxRatePercent) / 100) : 0);

  let budgetDeltaINR: number | undefined;
  let budgetStatus: PriceBreakdown['budgetStatus'] = 'no_budget_set';

  if (budgetCapINR !== undefined && budgetCapINR > 0) {
    budgetDeltaINR = budgetCapINR - consideredBudgetTotal;
    budgetStatus = budgetDeltaINR >= 0 ? 'within_budget' : 'over_budget';
  }

  return {
    coreSubtotalINR,
    peripheralSubtotalINR,
    grandTotalINR,
    componentCount,
    taxEstimateINR,
    shippingEstimateINR,
    effectiveTotalINR,
    budgetCapINR,
    budgetDeltaINR,
    budgetStatus,
  };
}
