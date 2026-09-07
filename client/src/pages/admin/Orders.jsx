import AdminSection from '@/pages/admin/AdminSection';

export function Orders() {
  return (
    <AdminSection
      title="Orders"
      description="Order operations against /api/admin/orders. Statuses: pending, confirmed, processing, shipped, delivered, cancelled."
      scope={[
        'View orders',
        'View order details',
        'Customer information',
        'Products ordered',
        'Delivery address',
        'Payment method and status',
        'Update order status',
      ]}
    />
  );
}

export default Orders;
