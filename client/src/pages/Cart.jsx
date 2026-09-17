import { Link } from 'react-router-dom';

import CartLine from '@/components/cart/CartLine';
import CartSummary from '@/components/cart/CartSummary';
import Alert from '@/components/ui/Alert';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/authContext';
import { useCart } from '@/context/cartContext';
import { useToast } from '@/context/toastContext';
import useDocumentMeta from '@/hooks/useDocumentMeta';

export function Cart() {
  const {
    items,
    isEmpty,
    isLoading,
    error,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    warnings,
    updateQuantity,
    removeItem,
    refreshCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();

  useDocumentMeta({
    title: 'Cart',
    description: 'Review the items in your Gavora cart before checkout.',
    noIndex: true,
  });

  const handleRemove = async (productId) => {
    const line = items.find((item) => String(item.productId) === String(productId));
    try {
      await removeItem(productId);
      notify(`${line?.name ?? 'Item'} removed from your cart`, { tone: 'info' });
    } catch (err) {
      notify(err.message || 'Could not remove this item.', { tone: 'danger' });
    }
  };

  const handleQuantity = async (productId, quantity) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      notify(err.message || 'Could not update quantity.', { tone: 'danger' });
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8 sm:py-12" aria-busy="true">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-10 w-48" />
        <Skeleton className="mt-10 h-48 w-full rounded-card" />
        <span className="sr-only">Loading cart</span>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-12 sm:py-16">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
        <EmptyState
          icon="cart"
          title="Sign in to view your cart"
          description="Your cart is saved to your account so it is waiting for you on every device."
          actions={
            <>
              <Button to="/login" state={{ from: { pathname: '/cart' } }}>
                Sign in
                <Icon name="arrowRight" size="sm" />
              </Button>
              <Button to="/shop" variant="outline">
                Continue shopping
              </Button>
            </>
          }
        />
      </Container>
    );
  }

  if (error && isEmpty) {
    return (
      <Container className="py-12 sm:py-16">
        <Alert variant="danger" title="Could not load your cart">
          {error.message || 'Please try again.'}{' '}
          <button type="button" className="font-medium underline underline-offset-2" onClick={() => refreshCart()}>
            Retry
          </button>
        </Alert>
      </Container>
    );
  }

  if (isEmpty) {
    return (
      <Container className="py-12 sm:py-16">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          description="Browse the store and add something you like. Your cart will wait here until you are ready."
          actions={
            <>
              <Button to="/shop">
                Start shopping
                <Icon name="arrowRight" size="sm" />
              </Button>
              <Button to="/wishlist" variant="outline">
                View wishlist
              </Button>
            </>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="gv-eyebrow">Cart</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Your cart</h1>
        </div>
        <Link to="/shop" className="text-ink-600 hover:text-ink-900 text-sm font-medium underline-offset-4 hover:underline">
          Continue shopping
        </Link>
      </div>

      {warnings?.length > 0 && (
        <Alert variant="warning" title="Some items need attention" className="mt-6">
          {warnings.map((warning) => (
            <p key={String(warning.productId)}>{warning.message}</p>
          ))}
        </Alert>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="border-ink-100 bg-canvas-raised rounded-card overflow-hidden border">
          {items.map((line) => (
            <CartLine
              key={String(line.productId)}
              line={line}
              onQuantityChange={handleQuantity}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <CartSummary
          itemCount={itemCount}
          subtotal={subtotal}
          discount={discount}
          shipping={shipping}
          total={total}
        />
      </div>
    </Container>
  );
}

export default Cart;
