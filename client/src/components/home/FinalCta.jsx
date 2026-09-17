import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import ImageFrame from '@/components/ui/ImageFrame';
import Reveal from '@/components/ui/Reveal';

/**
 * Compact closing frame. Always points at the catalogue.
 */
export function FinalCta({ products = [] }) {
  const tiles = products.slice(0, 4);

  return (
    <section className="bg-gold-50">
      <Container className="py-10 sm:py-12">
        <Reveal className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <p className="gv-eyebrow">The collection</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Everything you need.
              <br />
              One Gavora cart.
            </h2>
            <Button to="/shop" size="lg" className="mt-6">
              Shop the collection
              <Icon name="arrowRight" size="sm" />
            </Button>
          </div>

          <div className="grid w-full max-w-lg grid-cols-4 gap-2 sm:gap-3 lg:w-[28rem]">
            {Array.from({ length: 4 }, (_, index) => {
              const product = tiles[index];
              const frame = (
                <ImageFrame
                  src={product?.images?.[0]?.url}
                  alt=""
                  seed={product?.name ?? `Gavora close ${index}`}
                  ratio="square"
                  className="rounded-card"
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
        </Reveal>
      </Container>
    </section>
  );
}

export default FinalCta;
