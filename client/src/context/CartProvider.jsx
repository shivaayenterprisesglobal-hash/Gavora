import { useCallback, useMemo, useState } from 'react';

import { CartContext } from '@/context/cartContext';

/**
 * Phase 1 skeleton. Cart contents live client-side for responsiveness, but
 * every price and total is recalculated server-side at checkout — the values
 * here are for display only and are never trusted when creating an order.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      // Display-only estimate; the server is the source of truth for money.
      estimatedSubtotal: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      // Implemented in the cart phase.
      addItem: () => {
        throw new Error('Cart is not implemented yet');
      },
      updateQuantity: () => {
        throw new Error('Cart is not implemented yet');
      },
      removeItem: () => {
        throw new Error('Cart is not implemented yet');
      },
      clear,
    }),
    [items, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;
