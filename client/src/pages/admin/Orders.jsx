import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import AdminPage from '@/components/admin/AdminPage';
import { AdminTable, AdminTd, AdminTh } from '@/components/admin/AdminTable';
import OrderStatusBadge, { PaymentStatusBadge } from '@/components/account/OrderStatusBadge';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import useAsyncData from '@/hooks/useAsyncData';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/account';
import { listAdminOrders } from '@/lib/adminOrders';
import { formatCurrency, formatDate } from '@/utils/format';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All payment statuses' },
  ...Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'all', label: 'All methods' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'online', label: 'Online' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export function Orders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [sort, setSort] = useState('newest');
  const [searchDraft, setSearchDraft] = useState('');
  const [q, setQ] = useState('');

  const query = useMemo(
    () => ({ page, pageSize: 12, status, paymentStatus, paymentMethod, sort, q }),
    [page, status, paymentStatus, paymentMethod, sort, q],
  );

  const { data, isLoading, error, reload } = useAsyncData(() => listAdminOrders(query), [query]);
  const orders = data?.items ?? [];
  const meta = data?.meta;

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
    setQ(searchDraft.trim());
  }

  return (
    <AdminPage
      title="Orders"
      description="Live orders from the storefront. Status updates are saved immediately. COD payment status stays pending."
    >
      <form onSubmit={applySearch} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Input
          className="xl:col-span-2"
          label="Search"
          srOnlyLabel
          placeholder="Order number, customer or email"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <Select
          label="Status"
          srOnlyLabel
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Payment method"
          srOnlyLabel
          value={paymentMethod}
          onChange={(event) => {
            setPaymentMethod(event.target.value);
            setPage(1);
          }}
          options={PAYMENT_METHOD_OPTIONS}
        />
        <Select
          label="Payment status"
          srOnlyLabel
          value={paymentStatus}
          onChange={(event) => {
            setPaymentStatus(event.target.value);
            setPage(1);
          }}
          options={PAYMENT_STATUS_OPTIONS}
        />
        <div className="flex gap-3">
          <Select
            className="min-w-0 flex-1"
            label="Sort"
            srOnlyLabel
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            options={SORT_OPTIONS}
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </div>
      </form>

      {isLoading && (
        <div className="mt-8 space-y-3" aria-busy="true">
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
          <span className="sr-only">Loading orders</span>
        </div>
      )}

      {error && (
        <Alert variant="danger" title="Could not load orders" className="mt-8">
          {error.message || 'Please try again.'}{' '}
          <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
            Retry
          </button>
        </Alert>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="package"
          title="No orders yet"
          description="Customer COD orders will appear here as soon as they are placed."
        />
      )}

      {!isLoading && orders.length > 0 && (
        <>
          <ul className="mt-8 space-y-3 md:hidden">
            {orders.map((order) => (
              <li key={order._id} className="rounded-card border-ink-100 bg-canvas-raised border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-ink-500 text-sm">{order.customer?.name || '—'}</p>
                    <p className="text-ink-400 text-xs">{formatDate(order.createdAt, { withTime: true })}</p>
                  </div>
                  <p className="font-medium" data-numeric>
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OrderStatusBadge status={order.orderStatus} size="sm" />
                  <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden md:block">
            <AdminTable>
              <thead className="border-ink-100 border-b">
                <tr>
                  <AdminTh>Order</AdminTh>
                  <AdminTh>Customer</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh>Payment</AdminTh>
                  <AdminTh>Total</AdminTh>
                  <AdminTh>Date</AdminTh>
                </tr>
              </thead>
              <tbody className="divide-ink-100 divide-y">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-ink-50/70">
                    <AdminTd>
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </AdminTd>
                    <AdminTd>
                      <p>{order.customer?.name || '—'}</p>
                      <p className="text-ink-400 text-xs">{order.customer?.email || order.contactEmail}</p>
                    </AdminTd>
                    <AdminTd>
                      <OrderStatusBadge status={order.orderStatus} size="sm" />
                    </AdminTd>
                    <AdminTd>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
                        <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                      </div>
                    </AdminTd>
                    <AdminTd className="font-medium" data-numeric>
                      {formatCurrency(order.total)}
                    </AdminTd>
                    <AdminTd className="text-ink-500 text-xs">
                      {formatDate(order.createdAt, { withTime: true })}
                    </AdminTd>
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

export default Orders;
