import { Link, Outlet } from 'react-router-dom';

import Logo from '@/components/layout/Logo';

/**
 * Centered, light auth layout. The form is the focus on every breakpoint.
 */
export function AuthLayout() {
  return (
    <div className="bg-canvas flex min-h-dvh flex-col">
      <header className="border-ink-100 bg-canvas-raised border-b">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-5 sm:max-w-lg">
          <Logo />
          <Link to="/" className="text-ink-600 hover:text-ink-900 text-sm font-medium">
            Back to store
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="border-ink-100 bg-canvas-raised rounded-card w-full max-w-md border p-6 shadow-card sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
