import { Link } from 'react-router-dom';

import ProductPrice from '@/components/product/ProductPrice';
import ImageFrame from '@/components/ui/ImageFrame';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

function Rank({ index }) {
  return (
    <span
      className="bg-gold-600 text-white flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      aria-hidden="true"
    >
      {index + 1}
    </span>
  );
}

/**
 * Best sellers with a different rhythm from the featured grid: one large lead
 * product and a numbered list. Ranked by units sold from the API.
 */
export function BestSellers({ products = [], isLoading = false, className }) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading best selling products"
        className={cn('grid gap-6 lg:grid-cols-2 lg:gap-10', className)}
      >
        <Skeleton className="aspect-4/5 w-full rounded-card" />
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-card" />
          ))}
        </div>
        <span className="sr-only">Loading best selling products</span>
      </div>
    );
  }

  if (products.length === 0) return null;

  const [lead, ...rest] = products;

  return (
    <div className={cn('grid items-start gap-8 lg:grid-cols-2 lg:gap-10', className)}>
      <Link
        to={`/product/${lead.slug}`}
        className="group border-ink-100 bg-canvas-raised hover:border-gold-200 rounded-card block overflow-hidden border shadow-card transition-[border-color,box-shadow] duration-200 hover:shadow-card-hover"
      >
        <ImageFrame
          src={lead.images?.[0]?.url}
          alt=""
          seed={lead.name}
          caption={lead.name}
          meta={lead.category?.name}
          ratio="portrait"
          className="rounded-none"
          imageClassName="ease-out-soft transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-ink-500 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] uppercase">
              <Rank index={0} />
              {lead.category?.name ?? 'Best seller'}
            </p>
            <h3 className="mt-2 text-xl leading-tight">{lead.name}</h3>
          </div>
          <ProductPrice price={lead.price} salePrice={lead.salePrice} size="md" className="shrink-0" />
        </div>
      </Link>

      {rest.length > 0 && (
        <ul aria-label="Best selling products" className="flex flex-col gap-3">
          {rest.map((product, index) => (
            <li key={product._id}>
              <Link
                to={`/product/${product.slug}`}
                className="group border-ink-100 bg-canvas-raised hover:border-ink-200 rounded-card flex items-center gap-4 border p-3 transition-colors sm:gap-5 sm:p-4"
              >
                <Rank index={index + 1} />
                <ImageFrame
                  src={product.images?.[0]?.url}
                  alt=""
                  seed={product.name}
                  caption={product.name}
                  meta={product.category?.name}
                  ratio="square"
                  className="size-20 shrink-0 rounded-lg sm:size-24"
                  imageClassName="ease-out-soft transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="min-w-0 flex-1">
                  {product.category?.name && (
                    <span className="text-ink-500 block text-xs font-medium uppercase">
                      {product.category.name}
                    </span>
                  )}
                  <span className="text-ink-900 mt-1 block text-base leading-snug font-semibold group-hover:text-gold-700">
                    {product.name}
                  </span>
                  <ProductPrice
                    price={product.price}
                    salePrice={product.salePrice}
                    size="sm"
                    className="mt-1.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BestSellers;
