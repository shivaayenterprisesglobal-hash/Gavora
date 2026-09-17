import { amountToFreeShipping, FREE_SHIPPING_THRESHOLD } from '@/lib/storeRules';
import { formatCurrency } from '@/utils/format';

/**
 * Progress toward the free-shipping threshold, shown in the cart and checkout
 * summaries so the threshold is visible before the customer reaches the total.
 */
export function FreeShippingBar({ subtotal }) {
  const remaining = amountToFreeShipping(subtotal);
  const qualified = remaining <= 0 && subtotal > 0;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div>
      <p className="text-ink-600 text-sm">
        {qualified ? (
          <>You have unlocked free delivery on this order.</>
        ) : subtotal <= 0 ? (
          <>Free delivery on orders above {formatCurrency(FREE_SHIPPING_THRESHOLD)}.</>
        ) : (
          <>
            Add {formatCurrency(remaining)} more for free delivery.
          </>
        )}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
        aria-label="Progress toward free delivery"
        className="bg-ink-100 mt-2.5 h-1.5 overflow-hidden rounded-full"
      >
        <div
          className="bg-gold-500 h-full rounded-full transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default FreeShippingBar;
