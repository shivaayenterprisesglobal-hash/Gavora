import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import { cn } from '@/utils/cn';

/**
 * Horizontally scrolling product row, used for best sellers and related items.
 *
 * On mobile it scrolls with snap points, which suits a rail better than a tall
 * grid; from `lg` up it becomes a four-column grid because horizontal scrolling
 * with a mouse is awkward. One component, two behaviours, no duplicated markup.
 */
export function ProductRail({ products = [], isLoading = false, label = 'Products', className }) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label={`Loading ${label.toLowerCase()}`}
        className={cn('gv-scroll-x flex gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-5', className)}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="w-[15rem] shrink-0 lg:w-auto">
            <ProductCardSkeleton />
          </div>
        ))}
        <span className="sr-only">Loading {label.toLowerCase()}</span>
      </div>
    );
  }

  return (
    <ul
      aria-label={label}
      className={cn(
        'gv-scroll-x -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0',
        className,
      )}
    >
      {products.map((product) => (
        <li key={product._id} className="w-[15rem] shrink-0 snap-start sm:w-[16rem] lg:w-auto">
          <ProductCard product={product} className="h-full" />
        </li>
      ))}
    </ul>
  );
}

export default ProductRail;
