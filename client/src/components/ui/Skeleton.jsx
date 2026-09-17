import { cn } from '@/utils/cn';

/**
 * Placeholder block shown while real data is in flight.
 *
 * Marked aria-hidden with the loading state announced once by the parent
 * region, so a screen reader hears "Loading products" rather than a stream of
 * meaningless boxes.
 */
export function Skeleton({ className, rounded = 'rounded-md' }) {
  return <div aria-hidden="true" className={cn('bg-ink-100 animate-shimmer', rounded, className)} />;
}

/** Multi-line text placeholder with a shorter final line, as real text wraps. */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          rounded="rounded-full"
          className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export default Skeleton;
