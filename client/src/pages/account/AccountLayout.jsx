import { NavLink, Outlet } from 'react-router-dom';

import Container from '@/components/ui/Container';
import { cn } from '@/utils/cn';

const tabs = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/addresses', label: 'Saved addresses' },
  { to: '/account/orders', label: 'Order history' },
];

function tabClass({ isActive }) {
  return cn(
    'rounded-control px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-ink-900 text-canvas' : 'text-ink-600 hover:bg-ink-50',
  );
}

/** Shared chrome for the customer account area. */
export function AccountLayout() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="gv-eyebrow">My account</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">Account</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Account sections" className="flex flex-wrap gap-1 lg:flex-col">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div>
          <Outlet />
        </div>
      </div>
    </Container>
  );
}

export default AccountLayout;
