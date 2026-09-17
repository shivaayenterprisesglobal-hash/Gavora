import { useState } from 'react';

import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';

/**
 * Min/max price filter.
 *
 * Two number inputs plus an explicit Apply, rather than a dual-thumb slider:
 * a slider is fiddly on touch, hard to operate by keyboard, and gives no way to
 * type an exact budget. Applying on submit also avoids refiltering the grid on
 * every keystroke.
 *
 * Reversed bounds are normalised on apply, so entering 5000-1000 works.
 */
export function PriceFilter({ bounds, boundsLoading = false, value, onChange }) {
  const appliedMin = value.minPrice ?? '';
  const appliedMax = value.maxPrice ?? '';
  const [draft, setDraft] = useState({ min: appliedMin, max: appliedMax, from: `${appliedMin}:${appliedMax}` });

  // If the URL-driven values change (clear all, a shared link), drop the draft.
  const appliedKey = `${appliedMin}:${appliedMax}`;
  const min = draft.from === appliedKey ? draft.min : appliedMin;
  const max = draft.from === appliedKey ? draft.max : appliedMax;

  const apply = (event) => {
    event.preventDefault();

    const parsedMin = min === '' ? undefined : Number(min);
    const parsedMax = max === '' ? undefined : Number(max);

    const bothSet = Number.isFinite(parsedMin) && Number.isFinite(parsedMax);
    const flipped = bothSet && parsedMin > parsedMax;

    onChange({
      minPrice: flipped ? parsedMax : parsedMin,
      maxPrice: flipped ? parsedMin : parsedMax,
    });
  };

  const inputClass =
    'rounded-control border-ink-200 bg-canvas-raised text-ink-900 placeholder:text-ink-300 h-10 w-full border px-3 text-sm';

  return (
    <form onSubmit={apply}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="filter-min-price" className="sr-only">
            Minimum price in rupees
          </label>
          <input
            id="filter-min-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={min}
            onChange={(event) => setDraft({ min: event.target.value, max, from: appliedKey })}
            placeholder={boundsLoading ? '' : String(bounds?.min ?? '')}
            className={inputClass}
          />
        </div>

        <span className="text-ink-300 text-sm" aria-hidden="true">
          &ndash;
        </span>

        <div className="flex-1">
          <label htmlFor="filter-max-price" className="sr-only">
            Maximum price in rupees
          </label>
          <input
            id="filter-max-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={max}
            onChange={(event) => setDraft({ min, max: event.target.value, from: appliedKey })}
            placeholder={boundsLoading ? '' : String(bounds?.max ?? '')}
            className={inputClass}
          />
        </div>
      </div>

      <p className="text-ink-500 mt-2 text-xs">
        {boundsLoading
          ? 'Loading catalogue range…'
          : bounds && Number.isFinite(bounds.min) && Number.isFinite(bounds.max)
            ? `Catalogue range ${formatCurrency(bounds.min)} to ${formatCurrency(bounds.max)}`
            : 'Catalogue range unavailable'}
      </p>

      <Button type="submit" variant="subtle" size="sm" fullWidth className="mt-3">
        Apply price
      </Button>
    </form>
  );
}

export default PriceFilter;
