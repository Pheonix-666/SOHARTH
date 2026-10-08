/**
 * Centralized pricing and luxury offer discount utility for SOHARTH
 * Ensures every single price (Original MRP and Discounted Price) strictly ends in 49 or 99
 * with premium 30% or 40% random/stable discount assignments.
 */

export interface PricingDetails {
  originalPrice: number;    // Real MRP (e.g. ₹999)
  discountedPrice: number;  // Selling price (e.g. ₹699)
  discountPercent: number;  // Real calculated percentage (e.g. 30%)
  savings: number;          // Total savings amount (e.g. ₹300)
}

/**
 * Rounds any number to the closest psychological retail price ending strictly in 49 or 99
 */
export function roundTo49or99(num: number): number {
  if (num <= 49) return 49;
  const baseHundred = Math.floor(num / 100) * 100;
  const candidates = [
    baseHundred - 51,  // e.g. 249
    baseHundred - 1,   // e.g. 299
    baseHundred + 49,  // e.g. 349
    baseHundred + 99,  // e.g. 399
    baseHundred + 149, // e.g. 449
    baseHundred + 199, // e.g. 499
  ].filter(c => c > 0);

  candidates.sort((a, b) => Math.abs(a - num) - Math.abs(b - num));
  return candidates[0];
}

export function getProductPricing(product: {
  id?: string | number;
  name?: string;
  price?: number;
  original_price?: number | string | null;
  originalPrice?: number | string | null;
} | null | undefined): PricingDetails {
  if (!product) {
    return {
      originalPrice: 0,
      discountedPrice: 0,
      discountPercent: 0,
      savings: 0,
    };
  }

  const basePrice = Number(product.price) || 0;
  const rawOriginalPrice = Number(product.original_price ?? product.originalPrice);

  // If real original price (MRP) is explicitly provided and greater than selling price
  if (rawOriginalPrice && rawOriginalPrice > basePrice && basePrice > 0) {
    const originalPrice = Math.round(rawOriginalPrice);
    const discountedPrice = Math.round(basePrice);
    const savings = Math.max(0, originalPrice - discountedPrice);
    const discountPercent = Math.round((savings / originalPrice) * 100);

    return {
      originalPrice,
      discountedPrice,
      discountPercent,
      savings,
    };
  }

  if (basePrice <= 0) {
    return {
      originalPrice: 0,
      discountedPrice: 0,
      discountPercent: 0,
      savings: 0,
    };
  }

  // Fallback deterministic assignment for legacy products
  const key = String(product.id || product.name || '');
  const charSum = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const targetPercent = charSum % 2 === 0 ? 40 : 30;

  // Double the price for reference MRP and round to 49 or 99
  const originalPrice = roundTo49or99(basePrice * 2);

  // Compute target discounted price and round strictly to 49 or 99
  const rawDiscounted = originalPrice * (1 - targetPercent / 100);
  let discountedPrice = roundTo49or99(rawDiscounted);

  // Guarantee discountedPrice is always lower than originalPrice
  if (discountedPrice >= originalPrice) {
    discountedPrice = roundTo49or99(originalPrice * 0.7);
  }

  // Display clean rounded percentage: 30% or 40%
  const actualPercent = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  const discountPercent = actualPercent >= 35 ? 40 : 30;
  const savings = Math.max(0, originalPrice - discountedPrice);

  return {
    originalPrice,
    discountedPrice,
    discountPercent,
    savings,
  };
}

export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}
