import AdminPage from '@/components/admin/AdminPage';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

/**
 * Honest placeholder. Razorpay is out of scope; COD lives under Orders.
 * This page must not invent payment records or a fake paid-status editor.
 */
export function Payments() {
  return (
    <AdminPage
      title="Payments"
      description="Online payment (Razorpay) is not connected yet. Cash on Delivery orders are managed under Orders."
    >
      <Alert variant="info" title="Coming soon">
        Online payment is unavailable in this phase. COD orders keep{' '}
        <strong>payment method: Cash on Delivery</strong> and{' '}
        <strong>payment status: pending</strong>. Administrators cannot mark COD orders as paid.
      </Alert>
      <div className="mt-6">
        <Button to="/admin/orders">Go to orders</Button>
      </div>
    </AdminPage>
  );
}

export default Payments;
