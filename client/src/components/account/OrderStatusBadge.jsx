import Badge from '@/components/ui/Badge';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/account';

const orderVariants = {
  pending: 'warning',
  confirmed: 'ink',
  processing: 'ink',
  shipped: 'accent-soft',
  delivered: 'success',
  cancelled: 'neutral',
};

const paymentVariants = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'neutral',
};

export function OrderStatusBadge({ status, size = 'md' }) {
  return (
    <Badge variant={orderVariants[status] ?? 'neutral'} size={size}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status, size = 'md' }) {
  return (
    <Badge variant={paymentVariants[status] ?? 'neutral'} size={size}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export default OrderStatusBadge;
