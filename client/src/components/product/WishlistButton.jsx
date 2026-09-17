import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import { useToast } from '@/context/toastContext';
import { useWishlist } from '@/context/wishlistContext';
import { cn } from '@/utils/cn';

/**
 * Save / unsave toggle.
 *
 * `aria-pressed` communicates the current state, which a plain button label
 * cannot, and the label itself flips so the action is always described in terms
 * of what the next press will do.
 */
export function WishlistButton({ product, variant = 'solid', size = 'md', className }) {
  const { has, toggle } = useWishlist();
  const { notify } = useToast();

  if (!product) return null;

  const saved = has(product._id);

  const handleClick = (event) => {
    // Cards wrap the whole tile in a link, so the toggle must not navigate.
    event.preventDefault();
    event.stopPropagation();

    const nowSaved = toggle(product);
    notify(nowSaved ? `Saved ${product.name} to your wishlist` : `Removed ${product.name} from your wishlist`, {
      tone: 'info',
    });
  };

  return (
    <IconButton
      label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      aria-pressed={saved}
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(saved ? 'text-gold-700 hover:!text-gold-800' : 'hover:!text-gold-700', className)}
    >
      <Icon name="heart" filled={saved} />
    </IconButton>
  );
}

export default WishlistButton;
