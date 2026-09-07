import PanelPlaceholder from '@/components/common/PanelPlaceholder';

export function Orders() {
  return (
    <PanelPlaceholder
      title="Order history"
      description="Scoped to the signed-in customer only; the server never returns another customer's orders."
      scope={[
        'Past orders, newest first',
        'Order status',
        'Payment method and status',
        'Order details',
        'Cancel a pending order',
      ]}
    />
  );
}

export default Orders;
