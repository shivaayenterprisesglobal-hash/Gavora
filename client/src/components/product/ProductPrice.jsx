import { cn } from '@/utils/cn';
import { discountPercent, formatCurrency } from '@/utils/format';

const sizes = {
  sm: { current: 'text-sm', was: 'text-xs' },
  md: { current: 'text-base', was: 'text-sm' },
  lg: { current: 'text-2xl sm:text-3xl', was: 'text-base' },
};

/**
 * Price display used everywhere a price appears, so cards, cart lines and the
 * product page can never drift apart on formatting or discount wording.
 *
 * When an item is discounted the original is kept visible with a strikethrough
 * and marked up as `<s>`, which conveys "was this, now that" to a screen reader
 * rather than reading two unexplained numbers.
 */
export function ProductPrice({ price, salePrice, size = 'md', showSaving = false, className }) {
  const scale = sizes[size];
  const percent = discountPercent(price, salePrice);
  const current = salePrice ?? price;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('text-ink-900 font-semibold', scale.current)} data-numeric>
        {formatCurrency(current)}
      </span>

      {percent !== null && (
        <>
          <s className={cn('text-ink-500', scale.was)} data-numeric>
            {formatCurrency(price)}
          </s>
          <span className={cn('text-success-700 font-semibold', scale.was)}>{percent}% off</span>
        </>
      )}

      {showSaving && percent !== null && (
        <span className="text-ink-500 w-full text-xs">
          You save {formatCurrency(price - current)}
        </span>
      )}
    </div>
  );
}

export default ProductPrice;
