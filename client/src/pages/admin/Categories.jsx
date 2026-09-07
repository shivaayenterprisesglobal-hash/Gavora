import AdminSection from '@/pages/admin/AdminSection';

export function Categories() {
  return (
    <AdminSection
      title="Categories"
      description="Category management against /api/admin/categories."
      scope={['Create category', 'Edit category', 'Delete category', 'Activate / deactivate']}
    />
  );
}

export default Categories;
