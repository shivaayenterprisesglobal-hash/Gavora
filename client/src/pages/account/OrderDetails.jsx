import { useState } from 'react';
import { useParams } from 'react-router-dom';

import OrderStatusBadge, { PaymentStatusBadge } from '@/components/account/OrderStatusBadge';
import { OrderItemRow } from '@/components/account/OrderCard';
import { AddressCard } from '@/components/checkout/AddressCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import {
  CANCELLABLE_ORDER_STATUSES,
  cancelOrder,
  getOrderByNumber,
  PAYMENT_METHOD_LABELS,
} from '@/lib/account';
import { formatCurrency, formatDate } from '@/utils/format';

export function OrderDetails() {
  const { orderNumber } = useParams();
  const { notify } = useToast();
  const { data: order, isLoading, error, reload } = useAsyncData(
    () => getOrderByNumber(orderNumber),
    [orderNumber],
  );
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-card" />
        <span className="sr-only">Loading order</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" title="Could not load this order">
        {error.message || 'Please try again.'}
      </Alert>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon="package"
        title="Order not found"
        description="This order does not belong to your account, or the order number is invalid."
        actions={<Button to="/account/orders">Back to orders</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-ink-500 text-xs">Order {order.orderNumber}</p>
        <h2 className="mt-1 text-xl sm:text-2xl">Order details</h2>
        <p className="text-ink-500 mt-1 text-sm">
          Placed {formatDate(order.createdAt, { withTime: true })} ·{' '}
          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <ul className="border-ink-100 divide-y divide-ink-100 border-y">
        {order.items.map((item) => (
          <OrderItemRow key={`${item.sku}-${item.name}`} item={item} />
        ))}
      </ul>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Subtotal</dt>
          <dd data-numeric>{formatCurrency(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="text-success-700 flex justify-between gap-4">
            <dt>Discount</dt>
            <dd data-numeric>−{formatCurrency(order.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Shipping</dt>
          <dd data-numeric>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-base font-semibold">
          <dt>Total</dt>
          <dd data-numeric>{formatCurrency(order.total)}</dd>
        </div>
      </dl>

      {order.address && (
        <div>
          <h3 className="font-sans text-sm font-semibold">Shipping address</h3>
          <AddressCard address={{ ...order.address, label: 'home' }} className="mt-3" />
        </div>
      )}

      {CANCELLABLE_ORDER_STATUSES.includes(order.orderStatus) && (
        <div className="border-ink-100 max-w-lg border-t pt-6">
          {cancelError && (
            <Alert variant="danger" title="Could not cancel this order" className="mb-4">
              {cancelError}
            </Alert>
          )}

          {confirming ? (
            <>
              <Alert variant="warning" title="Cancel this order?">
                Cancellation cannot be undone. Items will be returned to stock.
              </Alert>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="danger"
                  loading={cancelling}
                  onClick={async () => {
                    setCancelling(true);
                    setCancelError('');
                    try {
                      await cancelOrder(order.orderNumber);
                      setConfirming(false);
                      notify('Order cancelled');
                      reload();
                    } catch (err) {
                      setCancelError(err.message || 'Could not cancel this order.');
                    } finally {
                      setCancelling(false);
                    }
                  }}
                >
                  Confirm cancellation
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={cancelling}
                  onClick={() => {
                    setConfirming(false);
                    setCancelError('');
                  }}
                >
                  Keep order
                </Button>
              </div>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
              Cancel this order
            </Button>
          )}
        </div>
      )}

      <Button to="/account/orders" variant="outline">
        Back to orders
      </Button>
    </div>
  );
}

export default OrderDetails;
