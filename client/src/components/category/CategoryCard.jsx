import { Link } from 'react-router-dom';

import Icon from '@/components/ui/Icon';
import ImageFrame from '@/components/ui/ImageFrame';
import { cn } from '@/utils/cn';

/**
 * Category shopping tile. The visual is a branded field until photography
 * exists; the category name is always on the tile.
 */
export function CategoryCard({ category, featured = false, className }) {
  if (!category) return null;

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className={cn(
        'group border-ink-100 bg-canvas-raised hover:border-gold-200 rounded-card flex h-full flex-col overflow-hidden border shadow-card transition-[border-color,box-shadow] duration-200 hover:shadow-card-hover',
        className,
      )}
    >
      <ImageFrame
        src={category.image?.url}
        alt=""
        seed={category.name}
        caption={category.name}
        meta="Shop"
        ratio={featured ? 'landscape' : 'square'}
        className="rounded-none"
        imageClassName="ease-out-soft transition-transform duration-500 group-hover:scale-[1.05]"
      />

      <span className="flex min-h-12 items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <span className="text-ink-900 min-w-0 truncate text-sm font-semibold sm:text-[0.9375rem]">
          {category.name}
        </span>
        <span className="bg-gold-50 text-gold-700 flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5">
          <Icon name="arrowRight" size="sm" />
        </span>
      </span>
    </Link>
  );
}

export default CategoryCard;
