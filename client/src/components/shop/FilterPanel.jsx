import PriceFilter from '@/components/shop/PriceFilter';
import Icon from '@/components/ui/Icon';
import { AVAILABILITY_OPTIONS } from '@/lib/catalog';
import { cn } from '@/utils/cn';

function FilterGroup({ title, children }) {
  return (
    <div className="border-ink-100 border-b py-5 first:pt-0 last:border-b-0">
      <h3 className="text-ink-900 font-sans text-sm font-semibold">{title}</h3>
      <div className="mt-3.5">{children}</div>
    </div>
  );
}

/**
 * The filter controls themselves, with no surrounding chrome.
 *
 * Rendered twice — in the desktop sidebar and inside the mobile drawer — so the
 * two can never drift apart. Categories are a radio group because the API
 * filters on a single category; availability likewise.
 */
export function FilterPanel({ categories = [], bounds, boundsLoading = false, filters, onChange }) {
  const optionClass = (active) =>
    cn(
      'flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm transition-colors',
      active ? 'bg-gold-50 text-gold-800 font-medium' : 'text-ink-600 hover:bg-ink-50',
    );

  return (
    <div>
      <FilterGroup title="Category">
        <div role="radiogroup" aria-label="Filter by category" className="flex flex-col gap-0.5">
          <button
            type="button"
            role="radio"
            aria-checked={!filters.category}
            onClick={() => onChange({ category: '' })}
            className={optionClass(!filters.category)}
          >
            All categories
            {!filters.category && <Icon name="check" size="sm" />}
          </button>

          {categories.map((category) => {
            const active = filters.category === category.slug;

            return (
              <button
                key={category._id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ category: active ? '' : category.slug })}
                className={optionClass(active)}
              >
                <span className="truncate">{category.name}</span>
                {active && <Icon name="check" size="sm" />}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <PriceFilter bounds={bounds} boundsLoading={boundsLoading} value={filters} onChange={onChange} />
      </FilterGroup>

      <FilterGroup title="Availability">
        <div role="radiogroup" aria-label="Filter by availability" className="flex flex-col gap-0.5">
          {AVAILABILITY_OPTIONS.map((option) => {
            const active = filters.availability === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ availability: option.value })}
                className={optionClass(active)}
              >
                {option.label}
                {active && <Icon name="check" size="sm" />}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );
}

export default FilterPanel;
