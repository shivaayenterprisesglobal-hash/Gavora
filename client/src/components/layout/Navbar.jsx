import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import Logo from '@/components/layout/Logo';
import Container from '@/components/ui/Container';
import { useAuth } from '@/context/authContext';
import { useCart } from '@/context/cartContext';
import { cn } from '@/utils/cn';

const primaryLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
];

function navLinkClass({ isActive }) {
  return cn(
    'relative py-2 text-sm font-medium transition-colors',
    isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900',
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();

  // The drawer is closed by the navigating control itself rather than by an
  // effect on the pathname, which would cause a second render on every
  // navigation whether the drawer was open or not.
  const closeDrawer = () => setMobileOpen(false);

  function handleSearch(event) {
    event.preventDefault();
    closeDrawer();
    const query = searchTerm.trim();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop');
  }

  return (
    <header className="border-ink-100 bg-canvas/90 sticky top-0 z-40 border-b backdrop-blur">
      {/* Trust strip — reassurance above the fold on every page. */}
      <div className="bg-ink-900 text-ink-200 hidden py-2 text-center text-xs sm:block">
        Free delivery on orders above &#8377;999 &middot; Cash on Delivery available
      </div>

      <Container className="flex h-16 items-center gap-4 lg:h-20 lg:gap-8">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {primaryLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form
          role="search"
          onSubmit={handleSearch}
          className="ml-auto hidden max-w-md flex-1 md:block"
        >
          <label htmlFor="navbar-search" className="sr-only">
            Search products
          </label>
          <input
            id="navbar-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search for products, brands and more"
            className="rounded-control border-ink-200 bg-canvas-raised text-ink-900 placeholder:text-ink-300 hover:border-ink-300 h-10 w-full border px-4 text-sm transition-colors"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="text-ink-600 hover:bg-ink-50 hover:text-ink-900 rounded-control hidden px-3 py-2 text-sm font-medium transition-colors sm:block"
          >
            {isAuthenticated ? (user?.name?.split(' ')[0] ?? 'Account') : 'Sign in'}
          </Link>

          <Link
            to="/cart"
            onClick={closeDrawer}
            className="text-ink-700 hover:bg-ink-50 rounded-control relative px-3 py-2 text-sm font-medium transition-colors"
          >
            Cart
            {itemCount > 0 && (
              <span className="bg-gold-500 text-ink-950 absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full text-[11px] font-semibold">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            className="text-ink-700 hover:bg-ink-50 rounded-control p-2 transition-colors lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <div id="mobile-menu" className="border-ink-100 bg-canvas border-t lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <form role="search" onSubmit={handleSearch} className="mb-3 md:hidden">
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <input
                id="mobile-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products"
                className="rounded-control border-ink-200 bg-canvas-raised text-ink-900 placeholder:text-ink-300 h-11 w-full border px-4 text-sm"
              />
            </form>

            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={closeDrawer}
                className="text-ink-700 hover:bg-ink-50 rounded-control px-3 py-2.5 text-sm font-medium"
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              onClick={closeDrawer}
              className="text-ink-700 hover:bg-ink-50 rounded-control px-3 py-2.5 text-sm font-medium"
            >
              {isAuthenticated ? 'My account' : 'Sign in'}
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}

export default Navbar;
