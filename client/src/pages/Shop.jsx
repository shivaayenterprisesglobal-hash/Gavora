import PagePlaceholder from '@/components/common/PagePlaceholder';

export function Shop() {
  return (
    <PagePlaceholder
      eyebrow="Shop"
      title="All products"
      description="The product grid, filters and sorting are wired to /api/products in the next phase."
      scope={[
        'Responsive product grid',
        'Keyword search',
        'Category filtering',
        'Price range filtering',
        'Sorting (price, newest, best-selling)',
        'Pagination / load more',
      ]}
    />
  );
}

export default Shop;
