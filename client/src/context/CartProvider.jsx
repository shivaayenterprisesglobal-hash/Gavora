import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/context/authContext';
import { CartContext } from '@/context/cartContext';
import { addCartItem, clearRemoteCart, fetchCart, removeCartItem, replaceCartItem } from '@/lib/cart';

const EMPTY_CART = {
  items: [],
  itemCount: 0,
  lineCount: 0,
  warnings: [],
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  updatedAt: null,
};

function toAddFailure(error) {
  if (error?.status === 401) return { ok: false, reason: 'unauthenticated' };
  if (error?.status === 403) return { ok: false, reason: 'not-customer' };

  const details = error?.details ?? {};
  const productReason = details.productId || details['body.productId'];
  if (productReason === 'out-of-stock') return { ok: false, reason: 'out-of-stock' };
  if (productReason === 'inactive') return { ok: false, reason: 'unavailable' };

  const quantityMessage = String(details.quantity || details['body.quantity'] || error?.message || '');
  if (/maximum/i.test(quantityMessage)) return { ok: false, reason: 'max-quantity' };
  if (/stock/i.test(quantityMessage) || error?.status === 409) return { ok: false, reason: 'stock-limit' };

  return { ok: false, reason: 'error', message: error?.message };
}

/**
 * Server-backed cart. localStorage is not the source of truth; the authenticated
 * customer's cart lives in MongoDB and is loaded after login and on refresh.
 */
export function CartProvider({ children }) {
  const { isAuthenticated, isAdmin, isLoading: authLoading, user } = useAuth();
  const canUseCart = isAuthenticated && !isAdmin;
  const ownerId = authLoading ? 'pending' : canUseCart ? String(user?._id || user?.id || '') : 'guest';
  const [snapshot, setSnapshot] = useState({ ownerId: 'pending', cart: EMPTY_CART, error: null });

  const applyCart = useCallback((data, nextOwnerId = ownerId) => {
    setSnapshot({
      ownerId: nextOwnerId,
      error: null,
      cart: {
        items: data?.items ?? [],
        itemCount: data?.itemCount ?? 0,
        lineCount: data?.lineCount ?? data?.items?.length ?? 0,
        warnings: data?.warnings ?? [],
        subtotal: data?.subtotal ?? 0,
        discount: data?.discount ?? 0,
        shipping: data?.shipping ?? 0,
        total: data?.total ?? 0,
        updatedAt: data?.updatedAt ?? null,
      },
    });
  }, [ownerId]);

  const refreshCart = useCallback(async () => {
    if (!canUseCart) {
      applyCart(EMPTY_CART, 'guest');
      return EMPTY_CART;
    }

    const data = await fetchCart();
    applyCart(data);
    return data;
  }, [applyCart, canUseCart]);

  useEffect(() => {
    if (ownerId === 'pending') return undefined;

    let cancelled = false;
    const request = canUseCart ? fetchCart() : Promise.resolve(EMPTY_CART);

    request
      .then((data) => {
        if (!cancelled) applyCart(canUseCart ? data : EMPTY_CART, ownerId);
      })
      .catch((err) => {
        if (!cancelled) {
          setSnapshot({ ownerId, cart: EMPTY_CART, error: err });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applyCart, canUseCart, ownerId]);

  const cart = snapshot.ownerId === ownerId ? snapshot.cart : EMPTY_CART;
  const error = snapshot.ownerId === ownerId ? snapshot.error : null;
  const isLoading = ownerId === 'pending' || snapshot.ownerId !== ownerId;

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (!isAuthenticated) return { ok: false, reason: 'unauthenticated' };
      if (isAdmin) return { ok: false, reason: 'not-customer' };
      if (!product || product.stock <= 0) return { ok: false, reason: 'out-of-stock' };

      try {
        const data = await addCartItem(product._id, quantity);
        applyCart(data);
        return { ok: true, reason: 'added' };
      } catch (err) {
        return toAddFailure(err);
      }
    },
    [applyCart, isAdmin, isAuthenticated],
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        const data = await removeCartItem(productId);
        applyCart(data);
        return;
      }

      setSnapshot((current) => ({
        ...current,
        cart: {
          ...current.cart,
          items: current.cart.items.map((line) =>
            String(line.productId) === String(productId) ? { ...line, quantity } : line,
          ),
        },
      }));

      try {
        const data = await replaceCartItem(productId, quantity);
        applyCart(data);
      } catch (err) {
        await refreshCart();
        throw err;
      }
    },
    [applyCart, refreshCart],
  );

  const removeItem = useCallback(
    async (productId) => {
      const data = await removeCartItem(productId);
      applyCart(data);
    },
    [applyCart],
  );

  const clear = useCallback(async () => {
    const data = await clearRemoteCart();
    applyCart(data);
  }, [applyCart]);

  const isInCart = useCallback(
    (productId) => cart.items.some((line) => String(line.productId) === String(productId)),
    [cart.items],
  );

  const quantityOf = useCallback(
    (productId) =>
      cart.items.find((line) => String(line.productId) === String(productId))?.quantity ?? 0,
    [cart.items],
  );

  const value = useMemo(
    () => ({
      items: cart.items,
      itemCount: cart.itemCount,
      lineCount: cart.lineCount,
      warnings: cart.warnings,
      isEmpty: cart.items.length === 0,
      isLoading: authLoading || isLoading,
      error,
      subtotal: cart.subtotal,
      discount: cart.discount,
      shipping: cart.shipping,
      total: cart.total,
      addItem,
      updateQuantity,
      removeItem,
      isInCart,
      quantityOf,
      clear,
      refreshCart,
    }),
    [
      cart,
      authLoading,
      isLoading,
      error,
      addItem,
      updateQuantity,
      removeItem,
      isInCart,
      quantityOf,
      clear,
      refreshCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;
