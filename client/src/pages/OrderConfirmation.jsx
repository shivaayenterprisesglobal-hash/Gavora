import { useParams } from 'react-router-dom';

import OrderStatusBadge, { PaymentStatusBadge } from '@/components/account/OrderStatusBadge';
import { OrderItemRow } from '@/components/account/OrderCard';
import { AddressCard } from '@/components/checkout/AddressCard';
import Alert from '@/components/ui/Alert';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import useAsyncData from '@/hooks/useAsyncData';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { getOrderByNumber, PAYMENT_METHOD_LABELS } from '@/lib/account';
import { formatCurrency, formatDate } from '@/utils/format';

export function OrderConfirmation() {
  const { orderNumber } = useParams();
  const { data: order, isLoading, error } = useAsyncData(
    () => getOrderByNumber(orderNumber),
    [orderNumber],
  );

  useDocumentMeta({
    title: order ? `Order ${order.orderNumber}` : 'Order confirmation',
    description: 'Your Gavora order confirmation.',
    noIndex: true,
  });

  if (isLoading) {
    return (
      <Container className="max-w-2xl py-12 sm:py-16" aria-busy="true">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-8 h-10 w-72" />
        <Skeleton className="mt-6 h-40 w-full rounded-card" />
        <span className="sr-only">Loading order</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-16">
        <Alert variant="danger" title="Could not load this order">
          {error.message || 'Please try again.'}
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-16">
        <EmptyState
          icon="package"
          title="Order not found"
          description="We could not find this order on your account. Check the order number or view your order history."
          actions={
            <>
              <Button to="/account/orders">View orders</Button>
              <Button to="/shop" variant="outline">
                Continue shopping
              </Button>
            </>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Orders', to: '/account/orders' },
          { label: order.orderNumber },
        ]}
      />

      <p className="gv-eyebrow mt-8">Order confirmed</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">Thank you for your order</h1>
      <p className="text-ink-500 mt-3 text-sm">
        Order {order.orderNumber}. We will send updates as it moves from confirmation to delivery.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <OrderStatusBadge status={order.orderStatus} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <p className="text-ink-500 mt-4 text-sm">
        Placed {formatDate(order.createdAt, { withTime: true })} ·{' '}
        {PAYMENT_METHOD_LABELS[order.paymentMethod]}
      </p>

      <ul className="border-ink-100 mt-8 divide-y divide-ink-100 border-y">
        {order.items.map((item) => (
          <OrderItemRow key={`${item.sku}-${item.name}`} item={item} />
        ))}
      </ul>

      <dl className="mt-6 space-y-2 text-sm">
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
        <div className="mt-8">
          <h2 className="font-sans text-base font-semibold">Shipping address</h2>
          <AddressCard address={{ ...order.address, label: 'home' }} className="mt-3" />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to="/shop">Continue shopping</Button>
        <Button to={`/account/orders/${order.orderNumber}`} variant="outline">
          View order details
        </Button>
      </div>
    </Container>
  );
}

export default OrderConfirmation;
