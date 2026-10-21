import { ProductMatchCriteria } from './types';

export interface MatchEvaluationResult {
  isMatch: boolean;
  confidence: 'exact_model' | 'high_part_number' | 'catalog_fallback';
  reason: string;
}

/**
 * Sanitizes alphanumeric tokens for exact model identifier comparison.
 * e.g., "100-100000926BOX" -> "100100000926BOX"
 */
function cleanIdentifier(str?: string): string {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Evaluates whether an external retailer listing corresponds to the exact hardware component.
 * Prevents false equivalency (e.g., RTX 4060 vs RTX 4060 Ti, laptop editions, accessories).
 */
export function evaluateProductMatch(
  criteria: ProductMatchCriteria,
  remoteTitle: string,
  remoteIdentifier?: string,
  remotePriceINR?: number
): MatchEvaluationResult {
  const normTitle = remoteTitle.toLowerCase();
  const cleanRemoteId = cleanIdentifier(remoteIdentifier);
  const cleanModelNum = cleanIdentifier(criteria.modelNumber);
  const cleanAsin = cleanIdentifier(criteria.asin);
  const cleanFkId = cleanIdentifier(criteria.flipkartId);

  // 1. Direct verified ID matches
  if (cleanAsin && (cleanRemoteId === cleanAsin || cleanIdentifier(remoteTitle).includes(cleanAsin))) {
    return {
      isMatch: true,
      confidence: 'exact_model',
      reason: `Matched verified Amazon ASIN: ${criteria.asin}`,
    };
  }

  if (cleanFkId && (cleanRemoteId === cleanFkId || cleanIdentifier(remoteTitle).includes(cleanFkId))) {
    return {
      isMatch: true,
      confidence: 'exact_model',
      reason: `Matched verified Flipkart Product ID: ${criteria.flipkartId}`,
    };
  }

  // 2. Direct Manufacturer Part Number (MPN) match
  if (cleanModelNum && cleanModelNum.length >= 5) {
    if (cleanRemoteId === cleanModelNum || cleanIdentifier(remoteTitle).includes(cleanModelNum)) {
      return {
        isMatch: true,
        confidence: 'exact_model',
        reason: `Matched exact Manufacturer Part Number: ${criteria.modelNumber}`,
      };
    }
  }

  // 3. Negative Guards: Reject accessory items, laptops, cables, or wrong tiers
  const negativeTokens = ['laptop', 'notebook', 'case only', 'protective skin', 'keychain', 'cable adapter', 't-shirt', 'poster'];
  for (const neg of negativeTokens) {
    if (normTitle.includes(neg)) {
      return {
        isMatch: false,
        confidence: 'catalog_fallback',
        reason: `Rejected listing containing non-component keyword: "${neg}"`,
      };
    }
  }

  // GPU variant clash guards
  if (criteria.category === 'gpu') {
    // If criteria is NOT Ti or Super, reject Ti / Super listings
    const targetName = criteria.name.toLowerCase();
    const isTargetTi = targetName.includes(' ti');
    const isTargetSuper = targetName.includes('super');
    const isRemoteTi = normTitle.includes(' ti') || normTitle.includes('-ti');
    const isRemoteSuper = normTitle.includes('super');

    if (!isTargetTi && isRemoteTi) {
      return {
        isMatch: false,
        confidence: 'catalog_fallback',
        reason: 'Target is standard GPU, but retailer item is "Ti" variant.',
      };
    }

    if (!isTargetSuper && isRemoteSuper) {
      return {
        isMatch: false,
        confidence: 'catalog_fallback',
        reason: 'Target is standard GPU, but retailer item is "Super" variant.',
      };
    }
  }

  // RAM generation clash guards
  if (criteria.category === 'ram') {
    const isTargetDdr4 = criteria.name.toLowerCase().includes('ddr4');
    const isTargetDdr5 = criteria.name.toLowerCase().includes('ddr5');
    const isRemoteDdr4 = normTitle.includes('ddr4');
    const isRemoteDdr5 = normTitle.includes('ddr5');

    if (isTargetDdr4 && isRemoteDdr5) {
      return {
        isMatch: false,
        confidence: 'catalog_fallback',
        reason: 'Target is DDR4 memory, but retailer item is DDR5.',
      };
    }
    if (isTargetDdr5 && isRemoteDdr4) {
      return {
        isMatch: false,
        confidence: 'catalog_fallback',
        reason: 'Target is DDR5 memory, but retailer item is DDR4.',
      };
    }
  }

  // CPU generation & variant guards
  if (criteria.category === 'cpu') {
    const isTargetF = criteria.name.toLowerCase().includes('f ') || criteria.name.toLowerCase().endsWith('f');
    const isTargetG = criteria.name.toLowerCase().includes('g ') || criteria.name.toLowerCase().endsWith('g');
    const isRemoteF = normTitle.includes('f ') || normTitle.includes('12400f');
    const isRemoteG = normTitle.includes('5600g') || normTitle.includes('3000g');

    if (isTargetF && !isRemoteF && !normTitle.includes('12400f')) {
      return {
        isMatch: false,
        confidence: 'catalog_fallback',
        reason: 'Target requires discrete F-series processor, but listing lacks variant indicator.',
      };
    }
  }

  // 4. Brand and primary keyword check
  const brandNorm = criteria.brand.toLowerCase();
  if (!normTitle.includes(brandNorm)) {
    return {
      isMatch: false,
      confidence: 'catalog_fallback',
      reason: `Brand "${criteria.brand}" missing from retailer title.`,
    };
  }

  // 5. Price sanity check (item price cannot be less than 25% or more than 350% of expected price)
  if (remotePriceINR && remotePriceINR > 0 && criteria.expectedPriceINR > 0) {
    const ratio = remotePriceINR / criteria.expectedPriceINR;
    if (ratio < 0.25) {
      return {
        isMatch: false,
        confidence: 'catalog_fallback',
        reason: `Price ₹${remotePriceINR} is suspiciously low compared to expected ₹${criteria.expectedPriceINR} (possible accessory or bracket).`,
      };
    }
    if (ratio > 3.5) {
      return {
        isMatch: false,
        confidence: 'catalog_fallback',
        reason: `Price ₹${remotePriceINR} is excessively high compared to expected ₹${criteria.expectedPriceINR} (possible pre-built system).`,
      };
    }
  }

  // Check key words from name
  const nameTokens = criteria.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && t !== criteria.brand.toLowerCase() && t !== 'processor' && t !== 'graphics');

  const matchedTokens = nameTokens.filter((t) => normTitle.includes(t));
  const tokenMatchRatio = nameTokens.length > 0 ? matchedTokens.length / nameTokens.length : 0;

  if (tokenMatchRatio >= 0.75) {
    return {
      isMatch: true,
      confidence: 'high_part_number',
      reason: `High keyword overlap (${matchedTokens.join(', ')}) with brand ${criteria.brand}.`,
    };
  }

  return {
    isMatch: false,
    confidence: 'catalog_fallback',
    reason: 'Insufficient specification and model token overlap.',
  };
}
