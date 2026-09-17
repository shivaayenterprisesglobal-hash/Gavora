import Skeleton from '@/components/ui/Skeleton';

/**
 * Loading placeholder shaped like ProductCard, so the grid does not jump when
 * real products replace it.
 */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="border-ink-100 bg-canvas-raised rounded-card overflow-hidden border">
      <Skeleton className="aspect-4/5 w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton rounded="rounded-full" className="h-2.5 w-16" />
        <Skeleton rounded="rounded-full" className="h-4 w-11/12" />
        <Skeleton rounded="rounded-full" className="h-4 w-24" />
        <Skeleton className="mt-2 h-11 w-full rounded-control" />
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
