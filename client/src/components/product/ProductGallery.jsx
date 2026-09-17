import { useState } from 'react';

import { ProductBadge } from '@/components/product/ProductBadge';
import ImageFrame from '@/components/ui/ImageFrame';
import { cn } from '@/utils/cn';

/**
 * Product image gallery.
 *
 * Real photographs become a tab list: each thumbnail is a tab controlling the
 * main panel. When the catalogue has no image URLs, a single editorial
 * placeholder is shown — no invented thumbs and no "1 of 3" labelling.
 */
export function ProductGallery({ product, className }) {
  const uploaded = (product?.images ?? []).filter((image) => image?.url);
  const images =
    uploaded.length > 0 ? uploaded : [{ url: '', alt: product?.name ?? '' }];
  const [activeByProduct, setActiveByProduct] = useState({});
  const active = activeByProduct[product?._id] ?? 0;

  const setActive = (index) => {
    if (!product?._id) return;
    setActiveByProduct((current) => ({ ...current, [product._id]: index }));
  };

  const current = images[Math.min(active, images.length - 1)];
  const hasThumbnails = uploaded.length > 1;
  const frameAlt = hasThumbnails
    ? current.alt || `${product?.name ?? 'Product'} — image ${active + 1} of ${images.length}`
    : current.alt || product?.name || '';

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row-reverse sm:gap-4', className)}>
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-card">
        <ImageFrame
          src={current.url}
          alt={frameAlt}
          seed={`${product?.name ?? 'product'}-${active}`}
          caption={product?.name}
          meta={product?.category?.name}
          ratio="portrait"
          eager
          imageClassName="ease-out-soft transition-opacity duration-500"
        />
        <div className="absolute top-4 left-4">
          <ProductBadge product={product} />
        </div>
      </div>

      {hasThumbnails && (
        <div
          role="tablist"
          aria-label="Product images"
          aria-orientation="horizontal"
          className="gv-scroll-x flex gap-2.5 overflow-x-auto sm:flex-col sm:overflow-visible"
        >
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              onClick={() => setActive(index)}
              className={cn(
                'w-16 shrink-0 overflow-hidden border-2 transition-colors sm:w-[4.5rem]',
                index === active ? 'border-ink-900' : 'border-transparent hover:border-ink-300',
              )}
            >
              <ImageFrame src={image.url} alt="" seed={`${product?.name}-${index}`} ratio="square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
