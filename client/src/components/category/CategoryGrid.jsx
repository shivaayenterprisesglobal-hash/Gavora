import CategoryCard from '@/components/category/CategoryCard';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

function tileClass(index) {
  if (index === 0 || index === 3) return 'sm:col-span-2';
  return '';
}

/**
 * Mixed category mosaic: two larger lead tiles, supporting tiles beside them.
 */
export function CategoryGrid({ categories = [], isLoading = false, skeletonCount = 8, className }) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading categories"
        className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4', className)}
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <Skeleton
            key={index}
            className={cn('aspect-4/3 w-full rounded-card', tileClass(index))}
          />
        ))}
        <span className="sr-only">Loading categories</span>
      </div>
    );
  }

  return (
    <ul
      aria-label="Product categories"
      className={cn('grid grid-cols-2 items-start gap-3 sm:grid-cols-4 sm:gap-4', className)}
    >
      {categories.map((category, index) => (
        <li key={category._id} className={cn('min-h-0', tileClass(index))}>
          <CategoryCard category={category} featured={index === 0 || index === 3} />
        </li>
      ))}
    </ul>
  );
}

export default CategoryGrid;
