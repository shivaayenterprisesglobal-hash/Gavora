import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import AdminPage from '@/components/admin/AdminPage';
import { AdminTable, AdminTd, AdminTh } from '@/components/admin/AdminTable';
import OrderStatusBadge, { PaymentStatusBadge } from '@/components/account/OrderStatusBadge';
import { AddressCard } from '@/components/checkout/AddressCard';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import { getAdminCustomer, updateAdminCustomer } from '@/lib/admin';
import { PAYMENT_METHOD_LABELS } from '@/lib/account';
import { formatCurrency, formatDate } from '@/utils/format';

export function CustomerDetails() {
  const { id } = useParams();
  const { notify } = useToast();
  const { data: customer, isLoading, error, reload } = useAsyncData(() => getAdminCustomer(id), [id]);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  async function setActive(isActive) {
    setSaving(true);
    setActionError('');
    try {
      await updateAdminCustomer(id, { isActive });
      notify(isActive ? 'Account activated' : 'Account deactivated');
      reload();
    } catch (err) {
      setActionError(err.message || 'Could not update account status.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPage title="Customer">
        <Skeleton className="h-48 w-full rounded-card" />
        <span className="sr-only">Loading customer</span>
      </AdminPage>
    );
  }

  if (error || !customer) {
    return (
      <AdminPage title="Customer">
        {error ? (
          <Alert variant="danger" title="Could not load customer">
            {error.message || 'Please try again.'}
          </Alert>
        ) : (
          <EmptyState
            icon="user"
            title="Customer not found"
            actions={<Button to="/admin/customers">Back to customers</Button>}
          />
        )}
      </AdminPage>
    );
  }

  const addresses = customer.addresses ?? [];
  const orders = customer.orders ?? [];

  return (
    <AdminPage
      title={customer.name}
      description={customer.email}
      actions={
        <Button to="/admin/customers" variant="outline">
          Back to customers
        </Button>
      }
    >
      {actionError && (
        <Alert variant="danger" title="Could not update account" className="mb-6">
          {actionError}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="rounded-card border-ink-100 bg-canvas-raised space-y-3 border p-5">
          <h2 className="font-sans text-base font-semibold">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-ink-400">Email</dt>
              <dd>{customer.email}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Phone</dt>
              <dd>{customer.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Role</dt>
              <dd>{customer.role}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Status</dt>
              <dd>
                <Badge variant={customer.isActive ? 'success' : 'neutral'} size="sm">
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-ink-400">Registered</dt>
              <dd>{formatDate(customer.createdAt, { withTime: true })}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Orders</dt>
              <dd>
                {customer.orderCount} · {formatCurrency(customer.totalOrderValue)}
              </dd>
            </div>
          </dl>
          <p className="text-ink-400 text-xs">
            Role cannot be changed from this screen. Administrators are managed separately.
          </p>
          {customer.isActive ? (
            <Button type="button" variant="outline" loading={saving} onClick={() => setActive(false)}>
              Deactivate account
            </Button>
          ) : (
            <Button type="button" loading={saving} onClick={() => setActive(true)}>
              Activate account
            </Button>
          )}
        </section>

        <div className="space-y-8">
          <section>
            <h2 className="font-sans text-base font-semibold">Addresses</h2>
            {addresses.length === 0 ? (
              <p className="text-ink-500 mt-3 text-sm">No saved addresses.</p>
            ) : (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <li key={address._id}>
                    <AddressCard address={address} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-sans text-base font-semibold">Orders</h2>
            {orders.length === 0 ? (
              <EmptyState
                className="py-10"
                icon="package"
                title="No orders"
                description="This customer has not placed an order yet."
              />
            ) : (
              <div className="mt-3">
                <AdminTable minClassName="min-w-[40rem]">
                  <thead className="border-ink-100 border-b">
                    <tr>
                      <AdminTh>Order</AdminTh>
                      <AdminTh>Status</AdminTh>
                      <AdminTh>Payment</AdminTh>
                      <AdminTh>Total</AdminTh>
                      <AdminTh>Date</AdminTh>
                    </tr>
                  </thead>
                  <tbody className="divide-ink-100 divide-y">
                    {orders.map((order) => (
                      <tr key={order.orderNumber}>
                        <AdminTd>
                          {order._id ? (
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="font-medium underline-offset-2 hover:underline"
                            >
                              {order.orderNumber}
                            </Link>
                          ) : (
                            <span className="font-medium">{order.orderNumber}</span>
                          )}
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
                        <AdminTd data-numeric>{formatCurrency(order.total)}</AdminTd>
                        <AdminTd className="text-ink-500 text-xs">
                          {formatDate(order.createdAt, { withTime: true })}
                        </AdminTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
                <p className="text-ink-400 mt-2 text-xs">
                  Open an order from{' '}
                  <Link to="/admin/orders" className="underline-offset-2 hover:underline">
                    Orders
                  </Link>{' '}
                  to update its status.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminPage>
  );
}

export default CustomerDetails;
