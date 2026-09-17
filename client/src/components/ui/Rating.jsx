import { cn } from '@/utils/cn';

const STAR_PATH = 'm12 3.5 2.6 5.6 6 .7-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.8l6-.7z';

const sizes = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' };

/**
 * Star rating with partial fill.
 *
 * The fill is a clipped overlay rather than rounding to the nearest half star,
 * so 4.3 and 4.5 are visually distinguishable. The stars themselves are
 * decorative — the accessible value comes from the text label alongside them.
 */
export function Rating({ value = 0, count, size = 'md', showValue = true, className }) {
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const percent = (clamped / 5) * 100;

  const stars = (fill) =>
    Array.from({ length: 5 }, (_, index) => (
      <svg key={index} viewBox="0 0 24 24" className={sizes[size]} fill={fill} aria-hidden="true">
        <path d={STAR_PATH} />
      </svg>
    ));

  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span className="relative inline-flex">
        <span className="text-ink-200 flex gap-0.5">{stars('currentColor')}</span>
        <span
          className="text-gold-400 absolute inset-0 flex gap-0.5 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          {stars('currentColor')}
        </span>
      </span>

      {showValue && (
        <span className="text-ink-500 text-xs" data-numeric>
          {clamped.toFixed(1)}
          {count !== undefined && <span className="text-ink-400"> ({count})</span>}
        </span>
      )}

      <span className="sr-only">
        Rated {clamped.toFixed(1)} out of 5{count !== undefined ? ` from ${count} reviews` : ''}
      </span>
    </span>
  );
}

export default Rating;
