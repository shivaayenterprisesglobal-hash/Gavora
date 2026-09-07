import { Link } from 'react-router-dom';

import Logo from '@/components/layout/Logo';
import Container from '@/components/ui/Container';

const columns = [
  {
    title: 'Shop',
    links: [
      { to: '/shop', label: 'All products' },
      { to: '/shop?sort=newest', label: 'New arrivals' },
      { to: '/shop?sort=best-selling', label: 'Best sellers' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/account', label: 'My profile' },
      { to: '/account/orders', label: 'Order history' },
      { to: '/account/addresses', label: 'Saved addresses' },
      { to: '/cart', label: 'Cart' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-300 mt-auto">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo tone="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Gavora brings together carefully selected products across categories, with honest
              pricing, secure checkout and dependable delivery across India.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-canvas font-sans text-xs font-semibold tracking-[0.18em] uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-gold-300 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-ink-800 mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-400 text-xs">
            &copy; {new Date().getFullYear()} Gavora. All rights reserved.
          </p>
          <p className="text-ink-400 text-xs">
            Secure online payments &middot; Cash on Delivery available
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
