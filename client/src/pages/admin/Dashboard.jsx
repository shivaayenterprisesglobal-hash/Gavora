import AdminSection from '@/pages/admin/AdminSection';

export function Dashboard() {
  return (
    <AdminSection
      title="Dashboard"
      description="Aggregated store metrics from /api/admin/dashboard."
      scope={[
        'Total orders and revenue',
        'Orders by status',
        'Recent orders',
        'Low-stock products',
        'Customer count',
      ]}
    />
  );
}

export default Dashboard;
