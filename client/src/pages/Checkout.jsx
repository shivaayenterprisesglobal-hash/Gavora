import PagePlaceholder from '@/components/common/PagePlaceholder';

export function Checkout() {
  return (
    <PagePlaceholder
      eyebrow="Checkout"
      title="Checkout"
      description="Sign-in required. Totals shown here are recalculated on the server before an order is created, so a tampered client total is rejected."
      scope={[
        'Customer details',
        'Delivery address selection',
        'Order summary',
        'Online payment via Razorpay',
        'Cash on Delivery',
        'Order confirmation',
      ]}
    />
  );
}

export default Checkout;
