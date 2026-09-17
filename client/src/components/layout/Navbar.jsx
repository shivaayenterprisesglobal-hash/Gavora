import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import CategoryMenu from '@/components/layout/CategoryMenu';
import Logo from '@/components/layout/Logo';
import MobileNav from '@/components/layout/MobileNav';
import SearchBar from '@/components/layout/SearchBar';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import { useAuth } from '@/context/authContext';
import { useCart } from '@/context/cartContext';
import { useWishlist } from '@/context/wishlistContext';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/storeRules';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

function navLinkClass({ isActive }) {
  return cn(
    'relative py-2 text-sm font-semibold transition-colors',
    isActive ? 'text-gold-700' : 'text-ink-600 hover:text-ink-900',
    isActive && "after:bg-gold-500 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:content-['']",
  );
}

function CountBadge({ count }) {
  if (count <= 0) return null;

  return (
    <span
      className="bg-gold-600 text-white absolute -top-0.5 -right-0.5 flex min-w-[1.15rem] items-center justify-center rounded-full px-1 text-[0.6875rem] leading-[1.15rem] font-semibold"
      aria-hidden="true"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

/**
 * Storefront header.
 *
 * Sticky, because a shopper part-way down a long grid should always be able to
 * reach search and the cart. It compacts slightly once the page scrolls.
 */
export function Navbar({ categories = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="border-ink-100 bg-canvas-raised/95 sticky top-0 z-40 border-b backdrop-blur">
        <div
          className={cn(
            'bg-gold-600 text-white ease-out-soft overflow-hidden text-center transition-all duration-300',
            scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100',
          )}
        >
          <p className="px-4 py-2 text-xs font-medium tracking-wide">
            Free delivery on orders above {formatCurrency(FREE_SHIPPING_THRESHOLD)}
            <span aria-hidden="true" className="mx-2 text-white/50">
              |
            </span>
            Cash on Delivery available across India
          </p>
        </div>

        <Container
          className={cn(
            'ease-out-soft flex items-center gap-3 transition-[height] duration-300 lg:gap-6',
            scrolled ? 'h-16' : 'h-16 lg:h-[4.5rem]',
          )}
        >
          <IconButton
            label="Open menu"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            className="-ml-1 lg:hidden"
          >
            <Icon name="menu" />
          </IconButton>

          <Logo className="shrink-0" />

          <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
            <NavLink to="/shop" className={navLinkClass}>
              Shop
            </NavLink>
            <CategoryMenu categories={categories} />
          </nav>

          <div className="ml-auto hidden max-w-xl flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
            <IconButton
              label={mobileSearchOpen ? 'Hide search' : 'Search products'}
              onClick={() => setMobileSearchOpen((current) => !current)}
              aria-expanded={mobileSearchOpen}
              className="lg:hidden"
            >
              <Icon name={mobileSearchOpen ? 'close' : 'search'} />
            </IconButton>

            <IconButton label="Wishlist" to="/wishlist">
              <Icon name="heart" />
              <CountBadge count={wishlistCount} />
            </IconButton>

            {isAdmin && (
              <Link
                to="/admin"
                className="text-ink-600 hover:bg-ink-50 hover:text-ink-900 rounded-control hidden min-h-11 items-center px-3 text-sm font-medium transition-colors lg:inline-flex"
              >
                Admin
              </Link>
            )}

            {isLoading ? (
              <span className="hidden h-11 w-24 lg:block" aria-hidden="true" />
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="text-ink-600 hover:bg-ink-50 hover:text-ink-900 rounded-control hidden min-h-11 items-center gap-2 px-3 text-sm font-medium transition-colors lg:inline-flex"
                >
                  <Icon name="user" size="sm" />
                  {user?.name?.split(' ')[0] ?? 'Account'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-ink-600 hover:bg-ink-50 hover:text-ink-900 rounded-control hidden min-h-11 items-center px-3 text-sm font-medium transition-colors lg:inline-flex"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-ink-600 hover:bg-ink-50 hover:text-ink-900 rounded-control hidden min-h-11 items-center gap-2 px-3 text-sm font-medium transition-colors lg:inline-flex"
              >
                <Icon name="user" size="sm" />
                Account
              </Link>
            )}

            <Link
              to="/cart"
              aria-label={`Cart, ${itemCount} items`}
              className="bg-gold-600 hover:bg-gold-700 rounded-control relative ml-1 inline-flex min-h-11 items-center gap-2 px-3.5 text-sm font-semibold text-white transition-colors"
            >
              <Icon name="cart" size="sm" />
              <span className="hidden xl:inline">Cart</span>
              {itemCount > 0 && (
                <span className="bg-white text-gold-700 min-w-5 rounded-full px-1.5 text-center text-xs leading-5">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </Container>

        {mobileSearchOpen && (
          <div className="border-ink-100 animate-fade-in border-t lg:hidden">
            <Container className="py-3">
              <SearchBar autoFocus onNavigate={() => setMobileSearchOpen(false)} />
            </Container>
          </div>
        )}
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} />
    </>
  );
}

export default Navbar;
