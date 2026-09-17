import { useCallback, useMemo } from 'react';

import { WishlistContext } from '@/context/wishlistContext';
import usePersistentState from '@/hooks/usePersistentState';

const STORAGE_KEY = 'gavora.wishlist.v1';

/**
 * Saved-items list, stored on the device.
 *
 * Kept device-local rather than server-backed so it works before sign-in and
 * does not claim to sync across browsers or accounts.
 */
export function WishlistProvider({ children }) {
  const [items, setItems, resetItems] = usePersistentState(STORAGE_KEY, []);

  const has = useCallback((productId) => items.some((item) => item.productId === productId), [items]);

  const toggle = useCallback(
    (product) => {
      if (!product) return false;

      let nowSaved = false;

      setItems((current) => {
        const exists = current.some((item) => item.productId === product._id);

        if (exists) {
          nowSaved = false;
          return current.filter((item) => item.productId !== product._id);
        }

        nowSaved = true;
        return [
          ...current,
          {
            productId: product._id,
            slug: product.slug,
            name: product.name,
            image: product.images?.[0]?.url ?? '',
            unitPrice: product.salePrice ?? product.price,
            listPrice: product.price,
            categoryName: product.category?.name ?? '',
            savedAt: new Date().toISOString(),
          },
        ];
      });

      return nowSaved;
    },
    [setItems],
  );

  const remove = useCallback(
    (productId) => setItems((current) => current.filter((item) => item.productId !== productId)),
    [setItems],
  );

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isEmpty: items.length === 0,
      has,
      toggle,
      remove,
      clear: resetItems,
    }),
    [items, has, toggle, remove, resetItems],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export default WishlistProvider;
