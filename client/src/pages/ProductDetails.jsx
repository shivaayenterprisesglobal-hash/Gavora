import { useParams } from 'react-router-dom';

import PagePlaceholder from '@/components/common/PagePlaceholder';

export function ProductDetails() {
  const { slug } = useParams();

  return (
    <PagePlaceholder
      eyebrow="Product"
      title="Product details"
      description={`Route resolved for slug "${slug}". The product is loaded from /api/products/:slug in the next phase.`}
      scope={[
        'Image gallery',
        'Name, price, sale price and discount',
        'Stock status',
        'Description and specifications',
        'Quantity selector',
        'Add to Cart and Buy Now',
        'Related products',
      ]}
    />
  );
}

export default ProductDetails;
