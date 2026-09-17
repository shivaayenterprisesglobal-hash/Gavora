import { createContext, useContext } from 'react';

/**
 * Context object and consumer hook, kept in a non-component module so the
 * provider file exports components only and Fast Refresh stays reliable.
 */
export const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

/** Hard ceiling per line item, mirroring what the server will enforce. */
export const MAX_QUANTITY_PER_ITEM = 10;
