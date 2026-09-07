import AdminSection from '@/pages/admin/AdminSection';

export function Products() {
  return (
    <AdminSection
      title="Products"
      description="Full product CRUD against /api/admin/products."
      scope={[
        'Add product',
        'Edit product',
        'Delete product',
        'Product images',
        'Name, SKU and category',
        'Description and specifications',
        'Regular price and sale price',
        'Stock and status',
        'Search and filter',
      ]}
    />
  );
}

export default Products;
