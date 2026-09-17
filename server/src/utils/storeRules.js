import { env } from '../config/env.js';

/** Hard ceiling per line, matching the storefront quantity stepper. */
export const MAX_CART_QUANTITY = 10;

export function calculateShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= env.FREE_SHIPPING_THRESHOLD ? 0 : env.SHIPPING_FLAT_RATE;
}

/**
 * Totals from live catalogue unit prices. `discount` is the saving against
 * list price and is not added on top of `subtotal`.
 */
export function calculateTotals(lines) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const discount = lines.reduce(
    (sum, line) => sum + Math.max(0, (line.listPrice ?? line.unitPrice) - line.unitPrice) * line.quantity,
    0,
  );
  const shipping = calculateShipping(subtotal);
  return { subtotal, discount, shipping, total: subtotal + shipping };
}

export function isCodAllowed(total) {
  return Boolean(env.COD_ENABLED) && total > 0 && total <= env.COD_MAX_ORDER_VALUE;
}
