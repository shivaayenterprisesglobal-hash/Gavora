import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import ImageFrame from '@/components/ui/ImageFrame';
import Reveal from '@/components/ui/Reveal';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/storeRules';
import { formatCurrency } from '@/utils/format';

/**
 * Promotional section for the free-shipping threshold.
 * Anchored on a real store rule. Not a coupon, not a limited-time claim.
 */
export function PromoBanner({ products = [] }) {
  const frames = [products[0], products[1], products[2]].filter(Boolean);

  return (
    <section className="bg-gold-100">
      <Container className="grid items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:py-12">
        <Reveal>
          <p className="gv-eyebrow">Free shipping</p>

          <h2 className="mt-3 text-3xl sm:text-4xl">
            Free delivery over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
          </h2>

          <p className="text-ink-700 mt-3 max-w-md text-sm leading-relaxed sm:text-base">
            Cross the threshold and shipping comes off your total automatically. Applies to Cash on
            Delivery. No coupon code required.
          </p>

          <Button to="/shop" size="lg" className="mt-7">
            Shop the collection
            <Icon name="arrowRight" size="sm" />
          </Button>
        </Reveal>

        <div className="grid grid-cols-3 gap-3">
          {(frames.length > 0 ? frames : [null, null, null]).slice(0, 3).map((product, index) => {
            const frame = (
              <ImageFrame
                src={product?.images?.[0]?.url}
                alt={product ? product.name : ''}
                seed={product?.name ?? `Gavora delivery ${index + 1}`}
                caption={product?.name ?? 'Gavora'}
                meta={product?.category?.name ?? 'Catalogue'}
                ratio="portrait"
                className="rounded-card shadow-card"
                imageClassName={
                  product ? 'ease-out-soft transition-transform duration-500 group-hover:scale-[1.04]' : undefined
                }
              />
            );

            if (!product) {
              return <div key={index}>{frame}</div>;
            }

            return (
              <Link
                key={product._id}
                to={`/product/${product.slug}`}
                className="group block"
                aria-label={`View ${product.name}`}
              >
                {frame}
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default PromoBanner;
