import { Link, Outlet } from 'react-router-dom';

import Logo from '@/components/layout/Logo';

/**
 * Split layout for signup and login: a quiet brand panel on the left, the form
 * on the right. The panel collapses away below `lg` so mobile gets the form
 * immediately.
 */
export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="bg-ink-950 hidden flex-col justify-between p-12 lg:flex">
        <Logo tone="light" />
        <div>
          <h1 className="text-canvas font-display text-4xl leading-tight">
            Shopping worth
            <br />
            coming back to.
          </h1>
          <p className="text-ink-300 mt-5 max-w-sm text-sm leading-relaxed">
            Save your addresses, track every order and check out in seconds. One Gavora account
            across all categories.
          </p>
        </div>
        <p className="text-ink-500 text-xs">Secure checkout &middot; Cash on Delivery available</p>
      </aside>

      <main className="bg-canvas flex flex-col items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <Outlet />
          <p className="text-ink-400 mt-10 text-center text-xs">
            <Link to="/" className="hover:text-ink-700 transition-colors">
              &larr; Back to store
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
