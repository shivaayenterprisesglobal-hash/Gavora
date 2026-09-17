import { Link } from 'react-router-dom';

import ProductGrid from '@/components/product/ProductGrid';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import SectionError from '@/components/ui/SectionError';
import { useWishlist } from '@/context/wishlistContext';
import useAsyncData from '@/hooks/useAsyncData';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { getProductById } from '@/lib/catalog';

export function Wishlist() {
  const { items, isEmpty, clear } = useWishlist();

  useDocumentMeta({
    title: 'Wishlist',
    description: 'Products you have saved at Gavora.',
    noIndex: true,
  });

  const { data: products, isLoading, error, reload } = useAsyncData(async () => {
    const resolved = await Promise.all(items.map((item) => getProductById(item.productId)));
    return resolved.filter(Boolean);
  }, [items]);

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="gv-eyebrow">Saved</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Wishlist</h1>
          <p className="text-ink-500 mt-2 max-w-md text-sm">
            Saved on this device only. Clearing browser data will remove it.
          </p>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={clear}
            className="text-ink-500 hover:text-ink-900 text-sm font-medium underline underline-offset-2"
          >
            Clear wishlist
          </button>
        )}
      </div>

      {isEmpty ? (
        <EmptyState
          icon="heart"
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here. Your wishlist stays on this device and is not synced across browsers."
          actions={
            <Button to="/shop">
              Browse products
              <Icon name="arrowRight" size="sm" />
            </Button>
          }
        />
      ) : error ? (
        <SectionError title="Could not load saved products" error={error} onRetry={reload} />
      ) : (
        <ProductGrid
          products={products ?? []}
          isLoading={isLoading}
          columns={4}
          skeletonCount={Math.max(items.length, 4)}
          label="Wishlist"
          className="mt-10"
        />
      )}

      {!isEmpty && !error && !isLoading && products?.length === 0 && (
        <p className="text-ink-500 mt-8 text-sm">
          Saved items could not be matched to the catalogue.{' '}
          <Link to="/shop" className="text-ink-900 underline underline-offset-2">
            Continue shopping
          </Link>
        </p>
      )}
    </Container>
  );
}

export default Wishlist;
