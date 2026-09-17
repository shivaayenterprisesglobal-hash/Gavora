import { Outlet } from 'react-router-dom';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import useAsyncData from '@/hooks/useAsyncData';
import { listCategories, getStoreIdentity } from '@/lib/catalog';

/**
 * Chrome shared by every storefront page.
 *
 * Categories are fetched once here and passed down to the header and mobile
 * drawer, rather than each of them loading the same list independently.
 */
export function PublicLayout() {
  const { data: categories } = useAsyncData(listCategories, []);
  const { data: store } = useAsyncData(getStoreIdentity, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="focus:bg-ink-900 focus:text-canvas sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <Navbar categories={categories ?? []} />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer store={store} />
    </div>
  );
}

export default PublicLayout;
