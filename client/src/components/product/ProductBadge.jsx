import Badge from '@/components/ui/Badge';

/**
 * Status badge only — sold out or new. Sale percentage lives on ProductPrice
 * so the discount is never announced twice.
 *
 * Returns null when there is nothing worth saying, so cards stay uncluttered.
 */
export function ProductBadge({ product, size = 'md' }) {
  if (!product) return null;

  if (product.stock <= 0) {
    return (
      <Badge variant="neutral" size={size}>
        Sold out
      </Badge>
    );
  }

  if (product.isNew) {
    return (
      <Badge variant="accent" size={size}>
        New
      </Badge>
    );
  }

  return null;
}

/** Stock messaging, kept separate so it can sit apart from the corner badge. */
export function StockBadge({ product, size = 'md' }) {
  if (!product) return null;

  if (product.stock <= 0) {
    return (
      <Badge variant="danger" size={size}>
        Out of stock
      </Badge>
    );
  }

  if (product.stock <= (product.lowStockThreshold ?? 5)) {
    return (
      <Badge variant="warning" size={size}>
        Only {product.stock} left
      </Badge>
    );
  }

  return (
    <Badge variant="success" size={size}>
      In stock
    </Badge>
  );
}

export default ProductBadge;
