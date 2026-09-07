import AdminSection from '@/pages/admin/AdminSection';

export function Customers() {
  return (
    <AdminSection
      title="Customers"
      description="Read-only customer records from /api/admin/customers. Password hashes are never returned."
      scope={['Customer list', 'Customer details', 'Customer order history']}
    />
  );
}

export default Customers;
