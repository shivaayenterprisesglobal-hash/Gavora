import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import { cn } from '@/utils/cn';

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

/**
 * Responsive product grid with a matching loading state.
 *
 * Two columns on mobile rather than one: at 390px a single column pushes almost
 * everything below the fold, and two tiles still leave room for a readable name
 * and price.
 *
 * The grid is a labelled list so assistive technology announces how many
 * products it contains before reading them out.
 */
export function ProductGrid({
  products = [],
  columns = 4,
  isLoading = false,
  skeletonCount = 8,
  eagerCount = 0,
  label = 'Products',
  className,
}) {
  const gridClass = cn('grid gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8', columnClasses[columns], className);

  if (isLoading) {
    return (
      <div role="status" aria-label={`Loading ${label.toLowerCase()}`} className={gridClass}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
        <span className="sr-only">Loading {label.toLowerCase()}</span>
      </div>
    );
  }

  return (
    <ul aria-label={label} className={gridClass}>
      {products.map((product, index) => (
        <li key={product._id} className="flex">
          {/* Eager-load only the first row; the rest lazy-load as they scroll in. */}
          <ProductCard product={product} eager={index < eagerCount} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

export default ProductGrid;
