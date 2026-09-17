import { useState } from 'react';

import { cn } from '@/utils/cn';
import { layoutFor, tintFor } from '@/utils/placeholder';

const ratios = {
  square: 'aspect-square',
  portrait: 'aspect-4/5',
  landscape: 'aspect-4/3',
  wide: 'aspect-16/9',
  hero: 'aspect-3/4 sm:aspect-4/3',
};

function PlaceholderGraphic({ layout, tint }) {
  if (layout === 0) {
    return (
      <>
        <circle cx="300" cy="90" r="130" fill={tint.shape} opacity="0.95" />
        <circle cx="70" cy="380" r="110" fill={tint.accent} opacity="0.22" />
      </>
    );
  }
  if (layout === 1) {
    return (
      <>
        <polygon points="0,40 400,-40 400,180 0,280" fill={tint.shape} />
        <rect x="220" y="260" width="200" height="200" rx="28" fill={tint.accent} opacity="0.2" />
      </>
    );
  }
  if (layout === 2) {
    return (
      <>
        <rect x="40" y="50" width="190" height="240" rx="24" fill={tint.shape} />
        <rect x="160" y="160" width="190" height="240" rx="24" fill={tint.accent} opacity="0.28" />
      </>
    );
  }
  if (layout === 3) {
    return (
      <>
        <circle cx="320" cy="80" r="100" fill={tint.shape} />
        <rect x="24" y="250" width="180" height="180" rx="28" fill={tint.accent} opacity="0.26" />
      </>
    );
  }
  if (layout === 4) {
    return (
      <>
        <circle cx="210" cy="200" r="150" fill="none" stroke={tint.rule} strokeWidth="22" />
        <circle cx="210" cy="200" r="72" fill={tint.shape} />
      </>
    );
  }
  return (
    <>
      <rect x="36" y="0" width="56" height="500" fill={tint.shape} />
      <rect x="300" y="0" width="36" height="500" fill={tint.accent} opacity="0.28" />
      <circle cx="200" cy="420" r="70" fill={tint.shape} opacity="0.7" />
    </>
  );
}

/**
 * Branded product field used when photography is missing or broken.
 * Shows the real product/category name so tiles never look like empty GS boxes.
 */
function Placeholder({ seed, caption, meta, prominent = false }) {
  const tint = tintFor(seed);
  const layout = layoutFor(seed);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: tint.bg }} aria-hidden="true">
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <PlaceholderGraphic layout={layout} tint={tint} />
      </svg>
      <div
        className="pointer-events-none absolute inset-3 rounded-[0.85rem] border"
        style={{ borderColor: tint.rule }}
      />
      {(meta || caption) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-4 sm:px-5">
          <div
            className="max-w-[90%] rounded-xl px-3 py-2.5 backdrop-blur-[2px] sm:px-3.5 sm:py-3"
            style={{ backgroundColor: 'rgb(255 253 251 / 0.72)' }}
          >
            {meta ? (
              <p
                className="truncate text-[0.65rem] font-semibold tracking-[0.12em] uppercase"
                style={{ color: tint.accent }}
              >
                {meta}
              </p>
            ) : null}
            {caption ? (
              <p
                className={
                  prominent
                    ? 'mt-1 line-clamp-4 text-xl leading-snug font-semibold sm:text-2xl'
                    : 'mt-0.5 line-clamp-3 text-[0.95rem] leading-snug font-semibold sm:text-base'
                }
                style={{ color: tint.ink }}
              >
                {caption}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Fixed-ratio image container. Reserving the aspect ratio up front means the
 * page never reflows as images arrive, which keeps grids stable and avoids
 * layout shift.
 *
 * @param {string}  [src]          Image URL. Falls back to a placeholder when absent or broken.
 * @param {string}  alt            Describes the image, or '' when purely decorative.
 * @param {string}  [seed]         Seeds the placeholder tint and composition; defaults to `alt`.
 * @param {string}  [caption]      Product or category name drawn on the placeholder.
 * @param {string}  [meta]         Secondary label (usually the category).
 * @param {boolean} [eager]        Loads immediately instead of lazily. Use for above-the-fold images only.
 */
export function ImageFrame({
  src,
  alt = '',
  seed,
  caption,
  meta,
  ratio = 'square',
  eager = false,
  className,
  imageClassName,
  children,
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = Boolean(src) && failedSrc === src;

  const showPlaceholder = !src || failed;
  const placeholderSeed = seed ?? caption ?? alt ?? 'Gavora';

  return (
    <div className={cn('bg-canvas-sunken relative overflow-hidden', ratios[ratio], className)}>
      {showPlaceholder ? (
        <Placeholder
          seed={placeholderSeed}
          caption={caption}
          meta={meta}
          prominent={ratio === 'portrait' || ratio === 'hero'}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
          onError={() => setFailedSrc(src)}
          className={cn('h-full w-full object-cover', imageClassName)}
        />
      )}
      {children}
    </div>
  );
}

export default ImageFrame;
