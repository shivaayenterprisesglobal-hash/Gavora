import AdminSection from '@/pages/admin/AdminSection';

export function Payments() {
  return (
    <AdminSection
      title="Payments"
      description="Payment records from /api/admin/payments. Provider secrets and signatures stay server-side."
      scope={['Payment list', 'Payment details', 'Provider and reference', 'Amount and status']}
    />
  );
}

export default Payments;
