import { Link } from 'react-router-dom';

import QuantitySelector from '@/components/product/QuantitySelector';
import Icon from '@/components/ui/Icon';
import ImageFrame from '@/components/ui/ImageFrame';
import { formatCurrency } from '@/utils/format';

/**
 * One cart line: live product details from the server cart, plus quantity and
 * remove controls. Checkout re-prices from the catalogue regardless of what is
 * shown here.
 */
export function CartLine({ line, onQuantityChange, onRemove }) {
  const unavailable = line.available === false;

  return (
    <article className="border-ink-100 flex gap-4 border-b p-4 last:border-b-0 sm:gap-5 sm:p-5">
      <Link to={line.slug ? `/product/${line.slug}` : '/shop'} className="block w-20 shrink-0 sm:w-24">
        <ImageFrame
          src={line.image}
          alt=""
          seed={line.name}
          caption={line.name}
          meta={line.categoryName}
          ratio="portrait"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {line.categoryName && (
              <p className="text-ink-500 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                {line.categoryName}
              </p>
            )}
            <h3 className="mt-1 text-base leading-snug font-semibold sm:text-lg">
              {line.slug ? (
                <Link to={`/product/${line.slug}`} className="hover:text-ink-600 transition-colors">
                  {line.name}
                </Link>
              ) : (
                line.name
              )}
            </h3>
            {line.sku && <p className="text-ink-500 mt-1 text-xs">SKU {line.sku}</p>}
            {unavailable && (
              <p className="text-danger-600 mt-1 text-xs">
                {line.unavailableReason === 'out-of-stock'
                  ? 'Out of stock — remove this item to continue.'
                  : 'No longer available — remove this item to continue.'}
              </p>
            )}
          </div>

          <p className="text-ink-900 shrink-0 text-lg font-semibold" data-numeric>
            {formatCurrency(line.unitPrice * line.quantity)}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          {unavailable ? (
            <p className="text-ink-500 text-xs">Qty {line.quantity}</p>
          ) : (
            <QuantitySelector
              value={line.quantity}
              onChange={(quantity) => onQuantityChange(line.productId, quantity)}
              max={line.stock}
              size="sm"
              label={`Quantity of ${line.name}`}
            />
          )}

          <div className="flex items-center gap-3">
            {line.listPrice > line.unitPrice && (
              <p className="text-ink-500 text-xs">
                <s data-numeric>{formatCurrency(line.listPrice)}</s>
                <span className="text-ink-700 ml-1.5" data-numeric>
                  {formatCurrency(line.unitPrice)} each
                </span>
              </p>
            )}

            <button
              type="button"
              onClick={() => onRemove(line.productId)}
              className="text-ink-500 hover:text-danger-500 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <Icon name="trash" size="xs" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CartLine;
