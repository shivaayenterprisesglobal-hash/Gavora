import { memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ProductBadge } from '@/components/product/ProductBadge';
import ProductPrice from '@/components/product/ProductPrice';
import WishlistButton from '@/components/product/WishlistButton';
import Icon from '@/components/ui/Icon';
import ImageFrame from '@/components/ui/ImageFrame';
import { useCart } from '@/context/cartContext';
import { useToast } from '@/context/toastContext';
import { cn } from '@/utils/cn';

const ADD_FAILURE_MESSAGES = {
  'out-of-stock': 'This product is currently out of stock.',
  'stock-limit': 'You have already added all the available stock.',
  'max-quantity': 'You have reached the maximum quantity for this item.',
  unavailable: 'This product is no longer available.',
  'not-customer': 'Sign in with a customer account to add items to your cart.',
};

/**
 * Canonical product tile for home, shop, related products and wishlist.
 *
 * Ratings are not shown: the catalogue still carries seed figures, and those
 * must not be presented as verified reviews. The media and title share one
 * link; wishlist and add-to-cart sit as sibling buttons.
 */
function ProductCardComponent({ product, eager = false, className }) {
  const { addItem, isInCart } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  if (!product) return null;

  const outOfStock = product.stock <= 0;
  const inCart = isInCart(product._id);
  const href = `/product/${product.slug}`;

  const handleAdd = async () => {
    const result = await addItem(product, 1);

    if (result.reason === 'unauthenticated') {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (result.ok) {
      notify(`${product.name} added to your cart`, { tone: 'success' });
    } else {
      notify(ADD_FAILURE_MESSAGES[result.reason] ?? result.message ?? 'Could not add this item.', {
        tone: 'danger',
      });
    }
  };

  return (
    <article
      className={cn(
        'group border-ink-100 bg-canvas-raised hover:border-gold-200 rounded-card relative flex flex-col overflow-hidden border shadow-card transition-[border-color,box-shadow] duration-200 hover:shadow-card-hover',
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
          <ImageFrame
            src={product.images?.[0]?.url}
            alt=""
            seed={product.name}
            caption={product.name}
            meta={product.category?.name}
            ratio="portrait"
            eager={eager}
            className="rounded-none"
            imageClassName="ease-out-soft transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </Link>

        <div className="absolute top-3 left-3">
          <ProductBadge product={product} size="sm" />
        </div>

        <div className="absolute top-2 right-2">
          <WishlistButton product={product} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {product.category?.name && (
          <p className="text-ink-500 truncate text-xs font-medium tracking-[0.08em] uppercase">
            {product.category.name}
          </p>
        )}

        <h3 className="mt-1 text-[0.95rem] leading-snug font-semibold sm:text-[1.05rem]">
          <Link to={href} className="hover:text-gold-700 transition-colors">
            {product.name}
          </Link>
        </h3>

        <ProductPrice price={product.price} salePrice={product.salePrice} size="md" className="mt-2" />

        <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={cn(
            'inline-flex h-11 w-full items-center justify-center gap-2 rounded-control text-sm font-semibold transition-colors duration-200',
            outOfStock
              ? 'bg-ink-50 text-ink-400 cursor-not-allowed'
              : inCart
                ? 'bg-success-50 text-success-700 hover:bg-success-100'
                : 'bg-gold-600 text-white hover:bg-gold-700',
          )}
        >
          {outOfStock ? (
            'Out of stock'
          ) : inCart ? (
            <>
              <Icon name="check" size="sm" />
              In cart · add another
            </>
          ) : (
            <>
              <Icon name="cart" size="sm" />
              Add to cart
            </>
          )}
        </button>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardComponent);

export default ProductCard;
