import { Link } from 'react-router-dom';

import OrderStatusBadge, { PaymentStatusBadge } from '@/components/account/OrderStatusBadge';
import Button from '@/components/ui/Button';
import { PAYMENT_METHOD_LABELS } from '@/lib/account';
import { formatCurrency, formatDate, pluralize } from '@/utils/format';

/**
 * Compact order row for history lists. The full record lives on the order
 * details page so this stays scannable.
 */
export function OrderCard({ order }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className="border-ink-100 bg-canvas-raised rounded-card border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-ink-500 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
            Order {order.orderNumber}
          </p>
          <p className="text-ink-900 mt-1.5 font-display text-xl tracking-tight">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <OrderStatusBadge status={order.orderStatus} size="sm" />
          <PaymentStatusBadge status={order.paymentStatus} size="sm" />
        </div>
      </div>

      <ul className="text-ink-600 mt-4 space-y-1 text-sm">
        {order.items.map((item) => (
          <li key={item.sku}>
            {item.quantity} × {item.name}
          </li>
        ))}
      </ul>

      <div className="border-ink-100 mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-ink-500 text-xs">
          {pluralize(itemCount, 'item')} · {PAYMENT_METHOD_LABELS[order.paymentMethod]} ·{' '}
          <span data-numeric>{formatCurrency(order.total)}</span>
        </p>
        <Button to={`/account/orders/${order.orderNumber}`} variant="outline" size="sm">
          View details
        </Button>
      </div>
    </article>
  );
}

export function OrderItemRow({ item }) {
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        {item.slug ? (
          <Link to={`/product/${item.slug}`} className="text-ink-900 hover:text-ink-600 text-sm font-medium">
            {item.name}
          </Link>
        ) : (
          <p className="text-ink-900 text-sm font-medium">{item.name}</p>
        )}
        <p className="text-ink-500 mt-0.5 text-xs">
          SKU {item.sku} · Qty {item.quantity}
        </p>
      </div>
      <p className="text-ink-900 shrink-0 text-sm font-medium" data-numeric>
        {formatCurrency(item.lineTotal)}
      </p>
    </li>
  );
}

export default OrderCard;
