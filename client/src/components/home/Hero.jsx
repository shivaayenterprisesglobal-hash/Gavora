import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import ImageFrame from '@/components/ui/ImageFrame';
import { formatCurrency } from '@/utils/format';

/**
 * Product-forward hero. The visual column uses live catalogue items (or
 * branded placeholders when photography is missing) — never invented photos.
 */
export function Hero({ featured = [] }) {
  const lead = featured[0];
  const supporting = featured.slice(1, 4);

  return (
    <section className="from-gold-50 via-canvas to-canvas relative overflow-hidden bg-gradient-to-br">
      <Container className="grid items-center gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-10 lg:py-12">
        <div className="animate-rise min-w-0">
          <p className="gv-eyebrow">Gavora</p>

          <h1 className="mt-3 text-[2.15rem] leading-[1.1] sm:text-5xl lg:text-display">
            Shop everyday essentials in one place
          </h1>

          <p className="text-ink-600 mt-4 max-w-md text-base leading-relaxed">
            Fashion, home, jewellery, beauty and more — honest prices, Cash on Delivery, and
            delivery across India.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button to="/shop" size="lg">
              Shop now
              <Icon name="arrowRight" size="sm" />
            </Button>
            <Button href="#categories" variant="outline" size="lg">
              Browse categories
            </Button>
          </div>
        </div>

        <div className="animate-fade-in grid min-h-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] sm:gap-4">
          <HeroTile product={lead} ratio="portrait" eager className="h-full min-h-[20rem]" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <HeroTile
                key={supporting[index]?._id ?? `support-${index}`}
                product={supporting[index]}
                ratio="square"
                eager={index === 0}
                fallbackSeed={`Gavora catalogue ${index + 2}`}
                compact
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroTile({
  product,
  ratio,
  className,
  eager = false,
  fallbackSeed = 'Gavora catalogue',
  compact = false,
}) {
  const frame = (
    <ImageFrame
      src={product?.images?.[0]?.url}
      alt={product ? product.name : ''}
      seed={product?.name ?? fallbackSeed}
      caption={product?.name ?? 'Gavora'}
      meta={product?.category?.name ?? 'Catalogue'}
      ratio={ratio}
      eager={eager}
      className="h-full min-h-full rounded-card shadow-card"
      imageClassName="ease-out-soft transition-transform duration-500 group-hover:scale-[1.04]"
    />
  );

  if (!product) {
    return <div className={`overflow-hidden rounded-card ${className ?? ''}`}>{frame}</div>;
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`group relative block overflow-hidden rounded-card ${className ?? ''}`}
      aria-label={`View ${product.name}`}
    >
      {frame}
      <span className="absolute top-3 right-3 z-[1] rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-sm" data-numeric>
        {formatCurrency(product.salePrice ?? product.price)}
      </span>
      {product.images?.[0]?.url ? (
        <span
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-ink-900/75 to-transparent ${compact ? 'p-2.5 sm:p-3' : 'p-4 sm:p-5'}`}
        >
          {product.category?.name && (
            <span className="text-gold-200 block text-[0.65rem] font-semibold tracking-[0.12em] uppercase">
              {product.category.name}
            </span>
          )}
          <span
            className={`text-canvas mt-0.5 block truncate font-semibold ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
          >
            {product.name}
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export default Hero;
