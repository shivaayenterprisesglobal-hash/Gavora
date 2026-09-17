import Icon from '@/components/ui/Icon';
import { AVAILABILITY_OPTIONS } from '@/lib/catalog';
import { formatCurrency } from '@/utils/format';

/**
 * Removable chips summarising what is currently filtered.
 *
 * Without these, a customer who scrolls past the sidebar has no idea why the
 * grid is nearly empty. Each chip removes exactly one condition, so recovering
 * from an over-narrow search does not mean clearing everything.
 */
export function ActiveFilters({ filters, categories = [], onChange, onClear }) {
  const chips = [];

  if (filters.q) {
    chips.push({ key: 'q', label: `“${filters.q}”`, clear: { q: '' } });
  }

  if (filters.category) {
    const category = categories.find((item) => item.slug === filters.category);
    chips.push({ key: 'category', label: category?.name ?? filters.category, clear: { category: '' } });
  }

  if (Number.isFinite(filters.minPrice) || Number.isFinite(filters.maxPrice)) {
    const from = Number.isFinite(filters.minPrice) ? formatCurrency(filters.minPrice) : 'Any';
    const to = Number.isFinite(filters.maxPrice) ? formatCurrency(filters.maxPrice) : 'Any';
    chips.push({
      key: 'price',
      label: `${from} – ${to}`,
      clear: { minPrice: undefined, maxPrice: undefined },
    });
  }

  if (filters.availability && filters.availability !== 'all') {
    const option = AVAILABILITY_OPTIONS.find((item) => item.value === filters.availability);
    chips.push({
      key: 'availability',
      label: option?.label ?? filters.availability,
      clear: { availability: 'all' },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-ink-500 text-xs">Filtered by</span>

      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.clear)}
          className="border-ink-200 bg-canvas-raised text-ink-700 hover:border-ink-400 inline-flex max-w-full items-center gap-1.5 rounded-full border py-1 pr-2 pl-3 text-xs transition-colors"
        >
          <span className="truncate">{chip.label}</span>
          <Icon name="close" size="xs" />
          <span className="sr-only">Remove this filter</span>
        </button>
      ))}

      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClear}
          className="text-ink-500 hover:text-ink-900 ml-1 text-xs font-medium underline underline-offset-2 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

export default ActiveFilters;
