import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import AdminPage from '@/components/admin/AdminPage';
import { AdminTable, AdminTd, AdminTh } from '@/components/admin/AdminTable';
import OrderStatusBadge, { PaymentStatusBadge } from '@/components/account/OrderStatusBadge';
import { AddressCard } from '@/components/checkout/AddressCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/toastContext';
import useAsyncData from '@/hooks/useAsyncData';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/account';
import { getAdminOrder, updateAdminOrderStatus } from '@/lib/adminOrders';
import { formatCurrency, formatDate } from '@/utils/format';

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function OrderDetails() {
  const { id } = useParams();
  const { notify } = useToast();
  const { data: order, isLoading, error, reload } = useAsyncData(() => getAdminOrder(id), [id]);
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const options = (ALLOWED_TRANSITIONS[order?.orderStatus] ?? []).map((status) => ({
    value: status,
    label: ORDER_STATUS_LABELS[status],
  }));

  async function handleStatusUpdate(event) {
    event.preventDefault();
    if (!nextStatus) return;
    setSaving(true);
    setFormError('');
    try {
      await updateAdminOrderStatus(id, { status: nextStatus });
      setNextStatus('');
      notify('Order status updated');
      reload();
    } catch (err) {
      setFormError(err.message || 'Could not update status.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPage title="Order">
        <Skeleton className="h-48 w-full rounded-card" />
        <span className="sr-only">Loading order</span>
      </AdminPage>
    );
  }

  if (error || !order) {
    return (
      <AdminPage title="Order">
        {error ? (
          <Alert variant="danger" title="Could not load order">
            {error.message || 'Please try again.'}
          </Alert>
        ) : (
          <EmptyState
            icon="package"
            title="Order not found"
            description="This order id does not match a record."
            actions={<Button to="/admin/orders">Back to orders</Button>}
          />
        )}
      </AdminPage>
    );
  }

  const phone = order.customer?.phone || order.address?.phone || '—';
  const email = order.customer?.email || order.contactEmail || '—';

  return (
    <AdminPage
      title={order.orderNumber}
      description={`${formatDate(order.createdAt, { withTime: true })}`}
      actions={
        <Button to="/admin/orders" variant="outline">
          Back to orders
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        <OrderStatusBadge status={order.orderStatus} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-ink-400">Customer</dt>
          <dd>
            {order.customer?._id ? (
              <Link to={`/admin/customers/${order.customer._id}`} className="underline-offset-2 hover:underline">
                {order.customer.name}
              </Link>
            ) : (
              order.customer?.name || '—'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-ink-400">Email</dt>
          <dd>{email}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Phone</dt>
          <dd>{phone}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Payment method</dt>
          <dd>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Payment status</dt>
          <dd>{order.paymentStatus}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Created</dt>
          <dd>{formatDate(order.createdAt, { withTime: true })}</dd>
        </div>
      </dl>

      {order.paymentMethod === 'cod' && (
        <Alert variant="info" title="Cash on Delivery" className="mt-6">
          Payment stays pending. Administrators cannot mark COD orders as paid in this phase.
        </Alert>
      )}

      {formError && (
        <Alert variant="danger" title="Could not update status" className="mt-6">
          {formError}
        </Alert>
      )}

      {options.length > 0 && (
        <form onSubmit={handleStatusUpdate} className="mt-6 flex flex-wrap items-end gap-3">
          <Select
            label="Update status"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
            options={[{ value: '', label: 'Choose next status' }, ...options]}
          />
          <Button type="submit" loading={saving} disabled={!nextStatus}>
            Save status
          </Button>
        </form>
      )}

      <h2 className="mt-10 font-sans text-base font-semibold">Products</h2>
      <div className="mt-3">
        <AdminTable minClassName="min-w-[36rem]">
          <thead className="border-ink-100 border-b">
            <tr>
              <AdminTh>Product</AdminTh>
              <AdminTh>Qty</AdminTh>
              <AdminTh>Unit price</AdminTh>
              <AdminTh>Line total</AdminTh>
            </tr>
          </thead>
          <tbody className="divide-ink-100 divide-y">
            {order.items.map((item) => (
              <tr key={`${item.sku}-${item.name}`}>
                <AdminTd>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-ink-400 text-xs">SKU {item.sku}</p>
                </AdminTd>
                <AdminTd>{item.quantity}</AdminTd>
                <AdminTd data-numeric>{formatCurrency(item.unitPrice)}</AdminTd>
                <AdminTd className="font-medium" data-numeric>
                  {formatCurrency(item.lineTotal)}
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </div>

      <dl className="mt-6 max-w-sm space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Subtotal</dt>
          <dd data-numeric>{formatCurrency(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Discount</dt>
          <dd data-numeric>{order.discount > 0 ? `−${formatCurrency(order.discount)}` : formatCurrency(0)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Shipping</dt>
          <dd data-numeric>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-base font-semibold">
          <dt>Total</dt>
          <dd data-numeric>{formatCurrency(order.total)}</dd>
        </div>
      </dl>

      {order.address && (
        <div className="mt-8">
          <h2 className="font-sans text-base font-semibold">Shipping address</h2>
          <AddressCard address={{ ...order.address, label: 'home' }} className="mt-3 max-w-lg" />
        </div>
      )}

      {order.customerNote ? (
        <p className="text-ink-500 mt-6 text-sm">
          Customer note: {order.customerNote}
        </p>
      ) : null}
    </AdminPage>
  );
}

export default OrderDetails;
