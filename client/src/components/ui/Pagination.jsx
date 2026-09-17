import Icon from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/**
 * Builds a page list with ellipses, always showing the first page, the last
 * page and a window around the current one, so the control stays a fixed width
 * whether there are 3 pages or 300.
 */
function pageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const window = [current - 1, current, current + 1].filter((page) => page > 1 && page < total);
  const items = [1, ...window, total];

  const withGaps = [];
  items.forEach((page, index) => {
    if (index > 0 && page - items[index - 1] > 1) withGaps.push('gap');
    withGaps.push(page);
  });

  return withGaps;
}

export function Pagination({ page, totalPages, onChange, className }) {
  if (totalPages <= 1) return null;

  const buttonClass = (active) =>
    cn(
      'inline-flex h-11 min-w-11 items-center justify-center rounded-control px-3 text-sm font-medium transition-colors',
      active
        ? 'bg-gold-600 text-white'
        : 'border border-ink-200 bg-canvas-raised text-ink-700 hover:border-ink-400 disabled:opacity-40 disabled:pointer-events-none',
    );

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={buttonClass(false)}
      >
        <Icon name="chevronLeft" size="sm" />
      </button>

      {pageItems(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="text-ink-500 px-1.5 text-sm" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={buttonClass(item === page)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={buttonClass(false)}
      >
        <Icon name="chevronRight" size="sm" />
      </button>
    </nav>
  );
}

export default Pagination;
