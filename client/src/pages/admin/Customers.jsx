import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import AdminPage from '@/components/admin/AdminPage';
import { AdminTable, AdminTd, AdminTh } from '@/components/admin/AdminTable';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import useAsyncData from '@/hooks/useAsyncData';
import { listAdminCustomers } from '@/lib/admin';
import { formatCurrency, formatDate } from '@/utils/format';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All accounts' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function Customers() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [searchDraft, setSearchDraft] = useState('');
  const [q, setQ] = useState('');

  const query = useMemo(() => ({ page, pageSize: 12, status, q }), [page, status, q]);
  const { data, isLoading, error, reload } = useAsyncData(() => listAdminCustomers(query), [query]);
  const customers = data?.items ?? [];
  const meta = data?.meta;

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
    setQ(searchDraft.trim());
  }

  return (
    <AdminPage
      title="Customers"
      description="Customer accounts only. Password hashes and session tokens are never returned."
    >
      <form onSubmit={applySearch} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
        <Input
          label="Search"
          srOnlyLabel
          placeholder="Name, email or phone"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <Select
          label="Account status"
          srOnlyLabel
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="mt-8 space-y-3" aria-busy="true">
          <Skeleton className="h-16 w-full rounded-card" />
          <span className="sr-only">Loading customers</span>
        </div>
      )}

      {error && (
        <Alert variant="danger" title="Could not load customers" className="mt-8">
          {error.message || 'Please try again.'}{' '}
          <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
            Retry
          </button>
        </Alert>
      )}

      {!isLoading && !error && customers.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="user"
          title="No customers"
          description="New storefront sign-ups will appear here."
        />
      )}

      {!isLoading && customers.length > 0 && (
        <>
          <ul className="mt-8 space-y-3 md:hidden">
            {customers.map((customer) => (
              <li key={customer._id} className="rounded-card border-ink-100 bg-canvas-raised border p-4">
                <Link to={`/admin/customers/${customer._id}`} className="font-medium underline-offset-2 hover:underline">
                  {customer.name}
                </Link>
                <p className="text-ink-500 text-sm">{customer.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant={customer.isActive ? 'success' : 'neutral'} size="sm">
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-ink-400">{customer.orderCount} orders</span>
                  <span className="text-ink-400" data-numeric>
                    {formatCurrency(customer.totalOrderValue)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden md:block">
            <AdminTable minClassName="min-w-[56rem]">
              <thead className="border-ink-100 border-b">
                <tr>
                  <AdminTh>Name</AdminTh>
                  <AdminTh>Email</AdminTh>
                  <AdminTh>Phone</AdminTh>
                  <AdminTh>Role</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh>Registered</AdminTh>
                  <AdminTh>Orders</AdminTh>
                  <AdminTh>Order value</AdminTh>
                </tr>
              </thead>
              <tbody className="divide-ink-100 divide-y">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-ink-50/70">
                    <AdminTd>
                      <Link
                        to={`/admin/customers/${customer._id}`}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </AdminTd>
                    <AdminTd className="text-ink-600">{customer.email}</AdminTd>
                    <AdminTd>{customer.phone || '—'}</AdminTd>
                    <AdminTd>{customer.role}</AdminTd>
                    <AdminTd>
                      <Badge variant={customer.isActive ? 'success' : 'neutral'} size="sm">
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </AdminTd>
                    <AdminTd className="text-ink-500 text-xs">{formatDate(customer.createdAt)}</AdminTd>
                    <AdminTd>{customer.orderCount}</AdminTd>
                    <AdminTd data-numeric>{formatCurrency(customer.totalOrderValue)}</AdminTd>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
        </>
      )}

      <Pagination
        page={meta?.page ?? page}
        totalPages={meta?.totalPages ?? 1}
        onChange={setPage}
        className="mt-6"
      />
    </AdminPage>
  );
}

export default Customers;
