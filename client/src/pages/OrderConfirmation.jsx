import { useParams } from 'react-router-dom';

import PagePlaceholder from '@/components/common/PagePlaceholder';

export function OrderConfirmation() {
  const { orderNumber } = useParams();

  return (
    <PagePlaceholder
      eyebrow="Order placed"
      title="Order confirmation"
      description={`Route resolved for order "${orderNumber}". Order details are loaded from /api/orders/:orderNumber in the next phase.`}
      scope={[
        'Order number and placement date',
        'Items ordered',
        'Delivery address',
        'Payment method and status',
        'Amount breakdown',
      ]}
    />
  );
}

export default OrderConfirmation;
