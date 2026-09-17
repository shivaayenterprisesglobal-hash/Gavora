import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import FreeShippingBar from '@/components/cart/FreeShippingBar';
import { formatCurrency, pluralize } from '@/utils/format';

/**
 * Order totals used on the cart and checkout pages.
 *
 * Every figure is labelled as an estimate. The server recalculates subtotal,
 * discount, shipping and total from the live catalogue when an order is placed.
 */
export function CartSummary({
  itemCount,
  subtotal,
  discount,
  shipping,
  total,
  checkout = false,
  children,
}) {
  return (
    <Card className="lg:sticky lg:top-28">
      <CardBody>
        <h2 className="font-sans text-base font-semibold">
          {checkout ? '4. Order summary' : 'Order summary'}
        </h2>
        <p className="text-ink-500 mt-1 text-xs">{pluralize(itemCount, 'item')} in this order</p>

        <div className="mt-5">
          <FreeShippingBar subtotal={subtotal} />
        </div>

        <dl className="border-ink-100 mt-6 space-y-3.5 border-t pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Subtotal</dt>
            <dd className="text-ink-900 font-medium" data-numeric>
              {formatCurrency(subtotal + discount)}
            </dd>
          </div>

          {discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-success-700">Discount</dt>
              <dd className="text-success-700 font-medium" data-numeric>
                −{formatCurrency(discount)}
              </dd>
            </div>
          )}

          <div className="flex justify-between">
            <dt className="text-ink-500">Shipping</dt>
            <dd className="text-ink-900 font-medium" data-numeric>
              {shipping === 0 ? 'Free' : formatCurrency(shipping)}
            </dd>
          </div>

          <div className="border-ink-100 flex items-baseline justify-between border-t pt-4">
            <dt className="text-ink-900 text-sm font-semibold">Total</dt>
            <dd className="text-ink-900 text-2xl font-semibold tracking-tight" data-numeric>
              {formatCurrency(total)}
            </dd>
          </div>
        </dl>

        <p className="text-ink-500 mt-3 text-xs">
          Display estimate only. The amount charged is calculated on the server at checkout.
        </p>

        {children}

        {!checkout && (
          <Button to="/checkout" size="lg" fullWidth className="mt-5">
            Proceed to checkout
            <Icon name="arrowRight" size="sm" />
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

export default CartSummary;
