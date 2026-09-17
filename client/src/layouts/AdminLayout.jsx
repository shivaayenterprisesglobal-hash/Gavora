import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import Logo from '@/components/layout/Logo';
import { useAuth } from '@/context/authContext';
import { cn } from '@/utils/cn';

const sections = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/settings', label: 'Settings' },
];

function sectionClass({ isActive }) {
  return cn(
    'block rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
    isActive ? 'bg-ink-800 text-canvas' : 'text-ink-300 hover:bg-ink-900 hover:text-canvas',
  );
}

/**
 * Admin console shell. Kept visually distinct from the storefront so an
 * operator can never mistake one for the other.
 */
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
      navigate('/admin/login');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <header className="bg-ink-950 flex items-center justify-between px-4 py-3 lg:hidden">
        <Logo to="/admin" tone="light" />
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-expanded={sidebarOpen}
          aria-controls="admin-nav"
          className="text-ink-200 rounded-control p-2"
        >
          <span className="sr-only">Toggle admin navigation</span>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <aside
        id="admin-nav"
        className={cn(
          'bg-ink-950 flex-col gap-6 p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh',
          sidebarOpen ? 'flex' : 'hidden',
        )}
      >
        <div className="hidden px-2 pt-2 lg:block">
          <Logo to="/admin" tone="light" />
          <p className="text-ink-500 mt-1 text-xs tracking-widest uppercase">Admin console</p>
        </div>

        <nav aria-label="Admin sections" className="flex flex-col gap-1">
          {sections.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              onClick={() => setSidebarOpen(false)}
              className={sectionClass}
            >
              {section.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <Link
            to="/"
            className="text-ink-400 hover:text-canvas px-3 py-2 text-left text-xs transition-colors"
          >
            View storefront
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="text-ink-400 hover:text-canvas px-3 py-2 text-left text-xs transition-colors disabled:opacity-55"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="bg-canvas-sunken min-h-dvh overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
