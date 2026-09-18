import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ProductGallery from '@/components/product/ProductGallery';
import ProductPrice from '@/components/product/ProductPrice';
import ProductRail from '@/components/product/ProductRail';
import QuantitySelector from '@/components/product/QuantitySelector';
import WishlistButton from '@/components/product/WishlistButton';
import { StockBadge } from '@/components/product/ProductBadge';
import Alert from '@/components/ui/Alert';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import SectionError from '@/components/ui/SectionError';
import Skeleton from '@/components/ui/Skeleton';
import { useCart } from '@/context/cartContext';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { getProductBySlug, getRelatedProducts, preferProductsWithImages } from '@/lib/catalog';
import { DELIVERY_ESTIMATE_DAYS, FREE_SHIPPING_THRESHOLD } from '@/lib/storeRules';
import { formatCurrency } from '@/utils/format';

const ADD_FAILURE_MESSAGES = {
  'out-of-stock': 'This product is currently out of stock.',
  'stock-limit': 'You have already added all the available stock.',
  'max-quantity': 'You have reached the maximum quantity for this item.',
  unavailable: 'This product is no longer available.',
  'not-customer': 'Sign in with a customer account to add items to your cart.',
};

export function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantityBySlug, setQuantityBySlug] = useState({});
  const quantity = quantityBySlug[slug] ?? 1;
  const setQuantity = (next) => setQuantityBySlug((current) => ({ ...current, [slug]: next }));

  const { data: product, isLoading, error, reload } = useAsyncData(() => getProductBySlug(slug), [slug]);
  const {
    data: related,
    isLoading: loadingRelated,
    error: relatedError,
    reload: reloadRelated,
  } = useAsyncData(() => getRelatedProducts(slug, 4), [slug]);

  const { addItem } = useCart();
  const { notify } = useToast();

  useDocumentMeta({
    title: product?.name ?? (isLoading ? 'Product' : 'Product not found'),
    description: product?.shortDescription ?? 'Product details at Gavora.',
    noIndex: !product && !isLoading,
  });

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error) {
    return (
      <Container className="py-16">
        <EmptyState
          icon="package"
          tone="danger"
          title="This product could not be loaded"
          description={error.message || 'The catalogue is temporarily unavailable. Please try again.'}
          actions={
            <>
              <Button type="button" onClick={reload}>
                Try again
              </Button>
              <Button to="/shop" variant="outline">
                Browse the store
              </Button>
            </>
          }
        />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-16">
        <EmptyState
          icon="package"
          tone="danger"
          title="We could not find this product"
          description="It may have been removed, or the link you followed is out of date."
          actions={
            <>
              <Button to="/shop">Browse the store</Button>
              <Button to="/" variant="outline">
                Back to home
              </Button>
            </>
          }
        />
      </Container>
    );
  }

  const outOfStock = product.stock <= 0;

  const addToCart = async () => {
    const result = await addItem(product, quantity);
    if (result.reason === 'unauthenticated') {
      navigate('/login', { state: { from: { pathname: `/product/${product.slug}` } } });
      return false;
    }
    if (result.ok) {
      notify(`${product.name} added to your cart`);
      return true;
    }
    notify(ADD_FAILURE_MESSAGES[result.reason] ?? result.message ?? 'Could not add this item.', {
      tone: 'danger',
    });
    return false;
  };

  const buyNow = async () => {
    if (await addToCart()) navigate('/checkout');
  };

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          {
            label: product.category.name,
            to: `/shop?category=${product.category.slug}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <ProductGallery product={product} />

        <div className="border-ink-100 bg-canvas-raised rounded-card border p-5 sm:p-6 lg:sticky lg:top-28 lg:self-start">
          <p className="text-ink-500 text-xs font-semibold tracking-[0.1em] uppercase">
            {product.category.name}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl leading-tight sm:text-3xl">{product.name}</h1>
            <WishlistButton product={product} variant="outline" />
          </div>

          {product.brand && <p className="text-ink-500 mt-2 text-sm">By {product.brand}</p>}

          <ProductPrice
            price={product.price}
            salePrice={product.salePrice}
            size="lg"
            showSaving
            className="mt-6"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StockBadge product={product} />
            <p className="text-ink-500 text-xs">SKU {product.sku}</p>
          </div>

          <p className="text-ink-600 mt-6 text-sm leading-relaxed">{product.shortDescription}</p>

          {outOfStock && (
            <Alert variant="warning" title="Currently unavailable" className="mt-6">
              This product is out of stock. You can save it to your wishlist on this device and
              come back to it later.
            </Alert>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={product.stock}
              label="Quantity"
            />
            <Button
              size="lg"
              className="w-full"
              onClick={addToCart}
              disabled={outOfStock}
            >
              <Icon name="cart" size="sm" />
              Add to cart
            </Button>
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={buyNow}
              disabled={outOfStock}
            >
              Buy now
            </Button>
          </div>

          <ul className="border-ink-100 mt-8 space-y-3 border-t pt-6 text-sm">
            <li className="text-ink-600 flex items-start gap-3">
              <Icon name="truck" size="sm" className="text-gold-700 mt-0.5" />
              Delivery in {DELIVERY_ESTIMATE_DAYS.min}–{DELIVERY_ESTIMATE_DAYS.max} days. Free above{' '}
              {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
            </li>
            <li className="text-ink-600 flex items-start gap-3">
              <Icon name="card" size="sm" className="text-gold-700 mt-0.5" />
              Cash on Delivery is available now. Online payment (UPI, cards, net banking) is coming
              soon.
            </li>
            <li className="text-ink-600 flex items-start gap-3">
              <Icon name="package" size="sm" className="text-gold-700 mt-0.5" />
              Easy returns within the published return window. See the{' '}
              <Link to="/returns-policy" className="text-ink-900 underline underline-offset-2">
                returns policy
              </Link>
              .
            </li>
          </ul>
        </div>
      </div>

      <section className="mt-12 grid gap-8 border-ink-100 border-t pt-12 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-2xl">Description</h2>
          <p className="text-ink-600 mt-4 text-sm leading-relaxed whitespace-pre-line sm:text-[0.9375rem]">
            {product.description}
          </p>
        </div>

        {product.specifications?.length > 0 && (
          <div>
            <h2 className="text-2xl">Specifications</h2>
            <dl className="border-ink-100 mt-4 divide-y divide-ink-100 border-y">
              {product.specifications.map((spec) => (
                <div key={spec.key} className="grid grid-cols-2 gap-4 py-3.5 text-sm">
                  <dt className="text-ink-500">{spec.key}</dt>
                  <dd className="text-ink-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <section className="mt-12 border-ink-100 border-t pt-12">
        <h2 className="text-2xl">You may also like</h2>
        {relatedError ? (
          <SectionError
            title="Could not load related products"
            error={relatedError}
            onRetry={reloadRelated}
            className="mt-6"
          />
        ) : (
          <ProductRail
            products={preferProductsWithImages(related ?? [])}
            isLoading={loadingRelated}
            label="Related products"
            className="mt-6"
          />
        )}
      </section>
    </Container>
  );
}

function ProductDetailsSkeleton() {
  return (
    <Container className="py-8 sm:py-12" aria-busy="true">
      <Skeleton className="h-4 w-64" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-4/5 w-full" />
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-10 w-3/4" />
          <Skeleton className="mt-6 h-8 w-40" />
          <Skeleton className="mt-6 h-20 w-full" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading product</span>
    </Container>
  );
}

export default ProductDetails;
