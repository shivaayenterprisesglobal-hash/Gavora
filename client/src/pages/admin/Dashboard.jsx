import { Link } from 'react-router-dom';

import AdminPage from '@/components/admin/AdminPage';
import StatCard from '@/components/admin/StatCard';
import OrderStatusBadge from '@/components/account/OrderStatusBadge';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import useAsyncData from '@/hooks/useAsyncData';
import { getAdminDashboard } from '@/lib/admin';
import { formatCurrency, formatDate } from '@/utils/format';

function Panel({ title, action, children }) {
  return (
    <section className="rounded-card border-ink-100 bg-canvas-raised border p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-base font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Dashboard() {
  const { data, isLoading, error, reload } = useAsyncData(getAdminDashboard, []);
  const stats = data?.stats;

  if (isLoading) {
    return (
      <AdminPage title="Dashboard" description="Live store metrics from MongoDB.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-card" />
          ))}
        </div>
        <span className="sr-only">Loading dashboard</span>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage title="Dashboard">
        <Alert variant="danger" title="Could not load dashboard">
          {error.message || 'Please try again.'}{' '}
          <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
            Retry
          </button>
        </Alert>
      </AdminPage>
    );
  }

  const cards = [
    { label: 'Total products', value: stats.totalProducts },
    { label: 'Total customers', value: stats.totalCustomers },
    { label: 'Total orders', value: stats.totalOrders },
    {
      label: 'Total sales',
      value: formatCurrency(stats.totalSales),
      hint: 'Excludes cancelled orders',
    },
    { label: 'Pending orders', value: stats.pendingOrders },
    { label: 'Processing orders', value: stats.processingOrders },
    { label: 'Delivered orders', value: stats.deliveredOrders },
    { label: 'Low-stock products', value: stats.lowStockProducts },
  ];

  const recentOrders = data.recentOrders ?? [];
  const recentCustomers = data.recentCustomers ?? [];
  const lowStock = data.lowStock ?? [];

  return (
    <AdminPage
      title="Dashboard"
      description="Figures come from the live catalogue and order records. Cancelled orders are not counted as sales."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Recent orders"
          action={
            <Link to="/admin/orders" className="text-ink-500 text-xs underline-offset-2 hover:underline">
              View all
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <EmptyState
              className="py-8"
              icon="package"
              title="No orders yet"
              description="COD checkouts will appear here as soon as customers place them."
            />
          ) : (
            <ul className="divide-ink-100 divide-y">
              {recentOrders.map((order) => (
                <li key={order._id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-ink-400 truncate text-xs">
                      {order.customer?.name || order.customer?.email || 'Customer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" data-numeric>
                      {formatCurrency(order.total)}
                    </p>
                    <OrderStatusBadge status={order.orderStatus} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent customers"
          action={
            <Link to="/admin/customers" className="text-ink-500 text-xs underline-offset-2 hover:underline">
              View all
            </Link>
          }
        >
          {recentCustomers.length === 0 ? (
            <EmptyState
              className="py-8"
              icon="user"
              title="No customers yet"
              description="New sign-ups will list here."
            />
          ) : (
            <ul className="divide-ink-100 divide-y">
              {recentCustomers.map((customer) => (
                <li key={customer._id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to={`/admin/customers/${customer._id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {customer.name}
                    </Link>
                    <p className="text-ink-400 truncate text-xs">{customer.email}</p>
                  </div>
                  <p className="text-ink-400 text-xs">{formatDate(customer.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Low-stock products"
          action={
            <Link
              to="/admin/products?lowStock=low"
              className="text-ink-500 text-xs underline-offset-2 hover:underline"
            >
              View all
            </Link>
          }
        >
          {lowStock.length === 0 ? (
            <EmptyState
              className="py-8"
              icon="package"
              title="Stock looks healthy"
              description="No active or draft products are at or below their low-stock threshold."
            />
          ) : (
            <ul className="divide-ink-100 divide-y">
              {lowStock.map((product) => (
                <li key={product._id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="text-ink-400 text-xs">SKU {product.sku}</p>
                  </div>
                  <Badge variant={product.stock === 0 ? 'danger' : 'warning'} size="sm">
                    {product.stock} left
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}

export default Dashboard;
