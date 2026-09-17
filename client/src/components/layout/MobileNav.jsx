import { Link, NavLink, useNavigate } from 'react-router-dom';

import SearchBar from '@/components/layout/SearchBar';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/context/authContext';
import { useWishlist } from '@/context/wishlistContext';
import { cn } from '@/utils/cn';

const primaryLinks = [
  { to: '/', label: 'Home', icon: 'sparkle', end: true },
  { to: '/shop', label: 'Shop all', icon: 'grid' },
];

const accountLinks = [
  { to: '/account', label: 'My account', icon: 'user', end: true },
  { to: '/account/orders', label: 'My orders', icon: 'package' },
  { to: '/account/addresses', label: 'Saved addresses', icon: 'mapPin' },
];

function itemClass({ isActive }) {
  return cn(
    'flex min-h-11 items-center gap-3 rounded-control px-3 py-3 text-sm font-medium transition-colors',
    isActive ? 'bg-gold-50 text-gold-800' : 'text-ink-700 hover:bg-ink-50',
  );
}

/**
 * Slide-out navigation for mobile and tablet.
 *
 * Everything the desktop header offers is reachable here: search, the full
 * category list, account links and the wishlist. Built on the shared Drawer, so
 * focus trapping, Escape handling and scroll locking come for free.
 */
export function MobileNav({ open, onClose, categories = [] }) {
  const { isAuthenticated, isAdmin, logout, isLoading } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    onClose();
    navigate('/');
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Menu"
      side="left"
      footer={
        isLoading ? null : isAuthenticated ? (
          <div className="flex flex-col gap-2">
            <Button to="/account" fullWidth onClick={onClose}>
              My account
            </Button>
            <Button variant="outline" fullWidth onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button to="/login" fullWidth onClick={onClose}>
              Sign in
            </Button>
            <Button to="/signup" variant="outline" fullWidth onClick={onClose}>
              Create an account
            </Button>
          </div>
        )
      }
    >
      <div className="p-4">
        <SearchBar onNavigate={onClose} />
      </div>

      <nav aria-label="Main" className="flex flex-col gap-0.5 px-4">
        {primaryLinks.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={onClose} className={itemClass}>
            <Icon name={link.icon} size="sm" />
            {link.label}
          </NavLink>
        ))}

        <NavLink to="/wishlist" onClick={onClose} className={itemClass}>
          <Icon name="heart" size="sm" />
          Wishlist
          {wishlistCount > 0 && (
            <span className="bg-gold-500 text-ink-950 ml-auto rounded-full px-2 py-0.5 text-xs font-semibold">
              {wishlistCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/cart" onClick={onClose} className={itemClass}>
          <Icon name="cart" size="sm" />
          Cart
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" onClick={onClose} className={itemClass}>
            <Icon name="shield" size="sm" />
            Admin console
          </NavLink>
        )}
      </nav>

      <div className="mt-6 px-4">
        <h3 className="gv-eyebrow font-sans">Shop by category</h3>
        <ul className="mt-2 flex flex-col gap-0.5">
          {categories.map((category) => (
            <li key={category._id}>
              <Link
                to={`/shop?category=${category.slug}`}
                onClick={onClose}
                className="text-ink-600 hover:bg-ink-50 rounded-control flex items-center justify-between px-3 py-2.5 text-sm transition-colors"
              >
                {category.name}
                <Icon name="chevronRight" size="xs" className="text-ink-300" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isAuthenticated && (
        <div className="mt-6 px-4 pb-6">
          <h3 className="gv-eyebrow font-sans">Account</h3>
          <nav aria-label="Account" className="mt-2 flex flex-col gap-0.5">
            {accountLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={onClose} className={itemClass}>
                <Icon name={link.icon} size="sm" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </Drawer>
  );
}

export default MobileNav;
