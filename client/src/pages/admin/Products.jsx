import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import AdminPage from '@/components/admin/AdminPage';
import { AdminTable, AdminTd, AdminTh } from '@/components/admin/AdminTable';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ImageFrame from '@/components/ui/ImageFrame';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import { archiveAdminProduct, listAdminCategories, listAdminProducts } from '@/lib/admin';
import { formatCurrency } from '@/utils/format';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const STOCK_OPTIONS = [
  { value: 'all', label: 'All stock' },
  { value: 'low', label: 'Low stock' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'name-asc', label: 'Name' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'stock-asc', label: 'Stock: low to high' },
  { value: 'stock-desc', label: 'Stock: high to low' },
];

const STATUS_VARIANT = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
};

function primaryImage(product) {
  const images = product.images ?? [];
  return images.find((image) => image.isPrimary)?.url || images[0]?.url || '';
}

export function Products() {
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') ?? '');
  const [archivingId, setArchivingId] = useState('');

  const query = useMemo(
    () => ({
      page: Number(searchParams.get('page') || 1),
      pageSize: 12,
      q: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? '',
      status: searchParams.get('status') ?? 'all',
      lowStock: searchParams.get('lowStock') ?? 'all',
      sort: searchParams.get('sort') ?? 'newest',
    }),
    [searchParams],
  );

  const { data: categories } = useAsyncData(listAdminCategories, []);
  const { data, isLoading, error, reload } = useAsyncData(() => listAdminProducts(query), [query]);
  const products = data?.items ?? [];
  const meta = data?.meta;

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value || value === 'all' || (key === 'page' && value === 1)) next.delete(key);
      else next.set(key, String(value));
    });
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  }

  function applySearch(event) {
    event.preventDefault();
    updateParams({ q: searchDraft.trim(), page: 1 });
  }

  async function handleArchive(product) {
    if (!window.confirm(`Archive “${product.name}”? It will leave the public catalogue.`)) return;
    setArchivingId(product._id);
    try {
      await archiveAdminProduct(product._id);
      notify('Product archived');
      reload();
    } catch (err) {
      notify(err.message || 'Could not archive product.', { tone: 'danger' });
    } finally {
      setArchivingId('');
    }
  }

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...(categories ?? []).map((category) => ({ value: category.slug, label: category.name })),
  ];

  return (
    <AdminPage
      title="Products"
      description="Create, edit and archive catalogue items. Archived products stay in history but cannot be purchased."
      actions={<Button to="/admin/products/new">Add product</Button>}
    >
      <form
        onSubmit={applySearch}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_10rem_9rem_9rem_10rem_auto]"
      >
        <Input
          label="Search"
          srOnlyLabel
          placeholder="Name, SKU or description"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <Select
          label="Category"
          srOnlyLabel
          value={query.category}
          onChange={(event) => updateParams({ category: event.target.value, page: 1 })}
          options={categoryOptions}
        />
        <Select
          label="Status"
          srOnlyLabel
          value={query.status}
          onChange={(event) => updateParams({ status: event.target.value, page: 1 })}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Stock"
          srOnlyLabel
          value={query.lowStock}
          onChange={(event) => updateParams({ lowStock: event.target.value, page: 1 })}
          options={STOCK_OPTIONS}
        />
        <Select
          label="Sort"
          srOnlyLabel
          value={query.sort}
          onChange={(event) => updateParams({ sort: event.target.value, page: 1 })}
          options={SORT_OPTIONS}
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="mt-8 space-y-3" aria-busy="true">
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
          <span className="sr-only">Loading products</span>
        </div>
      )}

      {error && (
        <Alert variant="danger" title="Could not load products" className="mt-8">
          {error.message || 'Please try again.'}{' '}
          <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
            Retry
          </button>
        </Alert>
      )}

      {!isLoading && !error && products.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="package"
          title="No products match"
          description="Try a different search, or add a product to the catalogue."
          actions={<Button to="/admin/products/new">Add product</Button>}
        />
      )}

      {!isLoading && products.length > 0 && (
        <>
          <ul className="mt-8 space-y-3 md:hidden">
            {products.map((product) => (
              <li key={product._id} className="rounded-card border-ink-100 bg-canvas-raised border p-4">
                <div className="flex gap-3">
                  <ImageFrame
                    src={primaryImage(product)}
                    alt=""
                    seed={product.name}
                    className="size-16 shrink-0 rounded-control"
                  />
                  <div className="min-w-0 flex-1">
                    <Link to={`/admin/products/${product._id}`} className="font-medium underline-offset-2 hover:underline">
                      {product.name}
                    </Link>
                    <p className="text-ink-400 text-xs">SKU {product.sku}</p>
                    <p className="mt-1 text-sm" data-numeric>
                      {formatCurrency(product.salePrice ?? product.price)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[product.status]} size="sm">
                    {product.status}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-ink-500">Stock {product.stock}</span>
                  <div className="flex gap-2">
                    <Button to={`/admin/products/${product._id}`} variant="outline" size="sm">
                      Edit
                    </Button>
                    {product.status !== 'archived' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        loading={archivingId === product._id}
                        onClick={() => handleArchive(product)}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden md:block">
            <AdminTable minClassName="min-w-[52rem]">
              <thead className="border-ink-100 border-b">
                <tr>
                  <AdminTh>Product</AdminTh>
                  <AdminTh>SKU</AdminTh>
                  <AdminTh>Category</AdminTh>
                  <AdminTh>Price</AdminTh>
                  <AdminTh>Stock</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh>
                    <span className="sr-only">Actions</span>
                  </AdminTh>
                </tr>
              </thead>
              <tbody className="divide-ink-100 divide-y">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-ink-50/70">
                    <AdminTd>
                      <div className="flex items-center gap-3">
                        <ImageFrame
                          src={primaryImage(product)}
                          alt=""
                          seed={product.name}
                          className="size-12 shrink-0 rounded-control"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/products/${product._id}`}
                            className="font-medium underline-offset-2 hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-ink-400 truncate text-xs">{product.slug}</p>
                        </div>
                      </div>
                    </AdminTd>
                    <AdminTd className="font-mono text-xs">{product.sku}</AdminTd>
                    <AdminTd>{product.category?.name || '—'}</AdminTd>
                    <AdminTd data-numeric>
                      {formatCurrency(product.salePrice ?? product.price)}
                      {product.salePrice ? (
                        <span className="text-ink-400 ml-2 text-xs line-through">
                          {formatCurrency(product.price)}
                        </span>
                      ) : null}
                    </AdminTd>
                    <AdminTd>
                      <span className={product.stock <= (product.lowStockThreshold ?? 5) ? 'text-warning-700' : ''}>
                        {product.stock}
                      </span>
                    </AdminTd>
                    <AdminTd>
                      <Badge variant={STATUS_VARIANT[product.status]} size="sm">
                        {product.status}
                      </Badge>
                    </AdminTd>
                    <AdminTd>
                      <div className="flex justify-end gap-2">
                        <Button to={`/admin/products/${product._id}`} variant="outline" size="sm">
                          Edit
                        </Button>
                        {product.status !== 'archived' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            loading={archivingId === product._id}
                            onClick={() => handleArchive(product)}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
                    </AdminTd>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
        </>
      )}

      <Pagination
        page={meta?.page ?? query.page}
        totalPages={meta?.totalPages ?? 1}
        onChange={(page) => updateParams({ page })}
        className="mt-6"
      />
    </AdminPage>
  );
}

export default Products;
