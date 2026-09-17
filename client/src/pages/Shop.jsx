import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import ActiveFilters from '@/components/shop/ActiveFilters';
import FilterPanel from '@/components/shop/FilterPanel';
import ProductGrid from '@/components/product/ProductGrid';
import Alert from '@/components/ui/Alert';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Drawer from '@/components/ui/Drawer';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import useAsyncData from '@/hooks/useAsyncData';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import {
  DEFAULT_PAGE_SIZE,
  SORT_OPTIONS,
  getPriceBounds,
  listCategories,
  listProducts,
} from '@/lib/catalog';
import { mergeShopSearch, parseShopSearch } from '@/lib/shopQuery';
import { pluralize } from '@/utils/format';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(() => parseShopSearch(searchParams), [searchParams]);

  const { data: categories } = useAsyncData(listCategories, []);
  const { data: bounds, isLoading: loadingBounds } = useAsyncData(getPriceBounds, []);
  const { data: listing, isLoading, error, reload } = useAsyncData(
    () => listProducts({ ...filters, pageSize: DEFAULT_PAGE_SIZE }),
    [
      filters.q,
      filters.category,
      filters.minPrice,
      filters.maxPrice,
      filters.availability,
      filters.sort,
      filters.page,
    ],
  );

  const categoryName = categories?.find((item) => item.slug === filters.category)?.name;
  const heading = categoryName ?? (filters.q ? `Results for “${filters.q}”` : 'All products');

  useDocumentMeta({
    title: heading === 'All products' ? 'Shop' : heading,
    description: `Browse ${heading.toLowerCase()} at Gavora. Filter by category, price and availability.`,
  });

  const patch = (update) => setSearchParams(mergeShopSearch(searchParams, update), { replace: true });
  const clearFilters = () =>
    setSearchParams(
      mergeShopSearch(searchParams, {
        q: '',
        category: '',
        minPrice: undefined,
        maxPrice: undefined,
        availability: 'all',
        page: 1,
      }),
      { replace: true },
    );

  const total = listing?.total ?? 0;
  const items = listing?.items ?? [];
  const empty = !isLoading && !error && total === 0;

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          ...(categoryName ? [{ label: categoryName }] : []),
        ]}
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="gv-eyebrow">Shop</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{heading}</h1>
          {categoryName ? (
            <p className="text-ink-500 mt-3 max-w-xl text-sm leading-relaxed">
              Browse {categoryName.toLowerCase()} in this catalogue. Filters apply to this category
              only.
            </p>
          ) : heading === 'All products' ? (
            <p className="text-ink-500 mt-3 max-w-xl text-sm leading-relaxed">
              Browse products available to order. Filter by category, price and availability.
            </p>
          ) : null}
        </div>
        <p className="text-ink-500 text-sm" aria-live="polite">
          {isLoading ? 'Loading products' : error ? 'Unavailable' : `${pluralize(total, 'product')}`}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16.5rem_1fr] lg:items-start">
        <aside className="border-ink-100 bg-canvas-raised rounded-card hidden border p-5 lg:sticky lg:top-28 lg:block lg:self-start">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-sans text-sm font-semibold">Filters</h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-ink-500 hover:text-ink-900 text-xs font-medium underline underline-offset-2"
            >
              Reset
            </button>
          </div>
          <FilterPanel
            categories={categories ?? []}
            bounds={bounds}
            boundsLoading={loadingBounds}
            filters={filters}
            onChange={patch}
          />
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <Icon name="filter" size="sm" />
              Filters
            </Button>

            <div className="ml-auto w-full sm:w-56">
              <Select
                label="Sort products"
                srOnlyLabel
                value={filters.sort}
                onChange={(event) => patch({ sort: event.target.value })}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          <div className="mt-4">
            <ActiveFilters
              filters={filters}
              categories={categories ?? []}
              onChange={patch}
              onClear={clearFilters}
            />
          </div>

          {error ? (
            <Alert variant="danger" title="Could not load products" className="mt-6">
              <p>{error.message || 'The catalogue is temporarily unavailable. Please try again.'}</p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={reload}>
                Try again
              </Button>
            </Alert>
          ) : empty ? (
            <EmptyState
              icon="search"
              title="No products match these filters"
              description="Try a broader search, a different category, or clearing the price range."
              actions={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <ProductGrid
                products={items}
                isLoading={isLoading}
                columns={3}
                skeletonCount={12}
                eagerCount={4}
                label={heading}
                className="mt-6"
              />
              <Pagination
                page={listing?.page ?? 1}
                totalPages={listing?.totalPages ?? 1}
                onChange={(page) => patch({ page })}
                className="mt-10"
              />
            </>
          )}
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        side="left"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={clearFilters}>
              Reset
            </Button>
            <Button fullWidth onClick={() => setFiltersOpen(false)}>
              Show {pluralize(total, 'product')}
            </Button>
          </div>
        }
      >
        <div className="p-5">
          <FilterPanel
            categories={categories ?? []}
            bounds={bounds}
            boundsLoading={loadingBounds}
            filters={filters}
            onChange={patch}
          />
        </div>
      </Drawer>
    </Container>
  );
}

export default Shop;
