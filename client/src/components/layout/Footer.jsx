import { Link } from 'react-router-dom';

import Logo from '@/components/layout/Logo';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/context/authContext';

const shopLinks = [
  { to: '/shop', label: 'All products' },
  { to: '/shop?sort=newest', label: 'New arrivals' },
  { to: '/shop?sort=best-selling', label: 'Best sellers' },
  { to: '/shop?availability=on-sale', label: 'On sale' },
  { to: '/wishlist', label: 'Wishlist' },
];

const supportLinks = [
  { to: '/shipping-policy', label: 'Shipping & delivery' },
  { to: '/returns-policy', label: 'Returns & refunds' },
  { to: '/terms', label: 'Terms & conditions' },
  { to: '/privacy', label: 'Privacy policy' },
];

const DEFAULT_DESCRIPTION =
  'Gavora brings together carefully selected products across categories, with honest pricing, secure checkout and dependable delivery across India.';

function FooterColumn({ title, links }) {
  return (
    <nav aria-label={title} className="lg:col-span-2">
      <h2 className="text-ink-900 font-sans text-sm font-semibold">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-ink-600 hover:text-gold-700 text-sm transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({ store }) {
  const { isAuthenticated } = useAuth();
  const description = store?.description || DEFAULT_DESCRIPTION;
  const email = store?.contactEmail?.trim() || '';
  const phone = store?.contactPhone?.trim() || '';
  const hasContact = Boolean(email || phone);

  const accountLinks = isAuthenticated
    ? [
        { to: '/account', label: 'My profile' },
        { to: '/account/orders', label: 'Order history' },
        { to: '/account/addresses', label: 'Saved addresses' },
        { to: '/cart', label: 'Cart' },
      ]
    : [
        { to: '/login', label: 'Sign in' },
        { to: '/signup', label: 'Create an account' },
        { to: '/cart', label: 'Cart' },
      ];

  return (
    <footer className="border-ink-100 bg-canvas-sunken text-ink-600 mt-auto border-t">
      <Container className="py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{description}</p>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Account" links={accountLinks} />
          <FooterColumn title="Support" links={supportLinks} />

          {hasContact && (
            <div className="lg:col-span-2">
              <h2 className="text-ink-900 font-sans text-sm font-semibold">Contact</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {email ? (
                  <li className="flex items-start gap-2.5">
                    <Icon name="mail" size="sm" className="text-gold-600 mt-0.5" />
                    <a href={`mailto:${email}`} className="hover:text-gold-700">
                      {email}
                    </a>
                  </li>
                ) : null}
                {phone ? (
                  <li className="flex items-start gap-2.5">
                    <Icon name="phone" size="sm" className="text-gold-600 mt-0.5" />
                    <a href={`tel:${phone}`} className="hover:text-gold-700">
                      {phone}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          )}
        </div>

        <div className="border-ink-200 mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-500 text-xs">
            &copy; {new Date().getFullYear()} {store?.storeName || 'Gavora'}. All rights reserved.
          </p>

          <div className="text-ink-500 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="shield" size="xs" />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="cash" size="xs" />
              Cash on Delivery
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="card" size="xs" />
              Online payment coming soon
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
