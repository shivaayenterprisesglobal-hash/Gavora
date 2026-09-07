import AdminSection from '@/pages/admin/AdminSection';

export function Settings() {
  return (
    <AdminSection
      title="Settings"
      description="Store settings from /api/admin/settings. Payment keys are configured through server environment variables, never through this screen."
      scope={[
        'Store details',
        'Shipping charge and free-shipping threshold',
        'Cash on Delivery availability',
        'Contact information',
      ]}
    />
  );
}

export default Settings;
