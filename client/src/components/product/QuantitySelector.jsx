import Icon from '@/components/ui/Icon';
import { MAX_QUANTITY_PER_ITEM } from '@/context/cartContext';
import { cn } from '@/utils/cn';

const sizes = {
  sm: { wrap: 'h-11', button: 'w-10', value: 'w-8 text-sm' },
  md: { wrap: 'h-11', button: 'w-10', value: 'w-10 text-sm' },
};

/**
 * Stepper for item quantity.
 *
 * Uses buttons plus a read-only display rather than a number input: a free-text
 * number field invites values the stock cannot satisfy, and mobile keyboards
 * handle it poorly. The upper bound is whichever is lower — available stock or
 * the per-line cap.
 */
export function QuantitySelector({
  value,
  onChange,
  max = MAX_QUANTITY_PER_ITEM,
  size = 'md',
  label = 'Quantity',
  className,
}) {
  const scale = sizes[size];
  const ceiling = Math.max(1, Math.min(max, MAX_QUANTITY_PER_ITEM));

  const step = (delta) => onChange(Math.max(1, Math.min(ceiling, value + delta)));

  return (
    <div
      className={cn(
        'border-ink-200 rounded-control bg-canvas-raised inline-flex items-center border',
        scale.wrap,
        className,
      )}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={value <= 1}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={cn(
          'text-ink-600 hover:text-ink-900 flex h-full items-center justify-center transition-colors disabled:opacity-35 disabled:hover:text-ink-600',
          scale.button,
        )}
      >
        <Icon name="minus" size="sm" />
      </button>

      <span
        role="status"
        aria-label={`${label}: ${value}`}
        className={cn('text-ink-900 text-center font-medium', scale.value)}
        data-numeric
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => step(1)}
        disabled={value >= ceiling}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={cn(
          'text-ink-600 hover:text-ink-900 flex h-full items-center justify-center transition-colors disabled:opacity-35 disabled:hover:text-ink-600',
          scale.button,
        )}
      >
        <Icon name="plus" size="sm" />
      </button>
    </div>
  );
}

export default QuantitySelector;
