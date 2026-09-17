/**
 * Display-only copies of the store's commercial rules.
 *
 * The authoritative values live in server environment variables
 * (SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD, COD_ENABLED) and every amount
 * charged is recalculated server-side at checkout. These constants exist purely
 * so the UI can show an estimate before the order API is called, and any
 * mismatch is resolved in the server's favour.
 */
export const SHIPPING_FLAT_RATE = 79;
export const FREE_SHIPPING_THRESHOLD = 999;
export const COD_MAX_ORDER_VALUE = 20000;

/** Estimated shipping for a subtotal. Free above the threshold. */
export function estimateShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
}

/** How much more a customer must spend to qualify for free shipping. */
export function amountToFreeShipping(subtotal) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  return remaining > 0 ? remaining : 0;
}

/** Cash on Delivery is unavailable above the configured order value. */
export function isCodAvailable(total) {
  return total > 0 && total <= COD_MAX_ORDER_VALUE;
}

/** Indicative delivery window shown on product and checkout pages. */
export const DELIVERY_ESTIMATE_DAYS = { min: 3, max: 6 };
