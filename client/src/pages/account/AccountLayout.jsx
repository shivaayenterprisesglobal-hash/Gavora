import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { useAuth } from '@/context/authContext';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { cn } from '@/utils/cn';

const tabs = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/orders', label: 'Orders' },
  { to: '/account/addresses', label: 'Addresses' },
];

function tabClass({ isActive }) {
  return cn(
    'rounded-control min-h-11 px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-gold-600 text-white' : 'text-ink-600 hover:bg-ink-50',
  );
}

/** Shared chrome for the customer account area. */
export function AccountLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  useDocumentMeta({
    title: 'Account',
    description: 'Manage your Gavora profile, orders and addresses.',
    noIndex: true,
  });

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Container className="py-12 sm:py-16">
      <p className="gv-eyebrow">My account</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">
        {user?.name ? `Hello, ${user.name.split(' ')[0]}.` : 'Account'}
      </h1>
      {user?.email && <p className="text-ink-500 mt-2 text-sm">{user.email}</p>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[13rem_1fr]">
        <nav aria-label="Account sections" className="flex flex-wrap gap-1 lg:flex-col">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
              {tab.label}
            </NavLink>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 justify-start lg:mt-4"
            loading={signingOut}
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </nav>

        <div>
          <Outlet />
        </div>
      </div>
    </Container>
  );
}

export default AccountLayout;
