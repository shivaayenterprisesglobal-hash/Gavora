import { useState } from 'react';

import OrderCard from '@/components/account/OrderCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import useAsyncData from '@/hooks/useAsyncData';
import { listOrders } from '@/lib/account';

export function Orders() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, reload } = useAsyncData(() => listOrders({ page, pageSize: 10 }), [page]);
  const orders = data?.items ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-32 w-full rounded-card" />
        <Skeleton className="h-32 w-full rounded-card" />
        <span className="sr-only">Loading orders</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" title="Could not load orders">
        {error.message || 'Please try again.'}{' '}
        <button type="button" className="font-medium underline underline-offset-2" onClick={reload}>
          Retry
        </button>
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="No orders yet"
        description="When you place an order it will appear here, with status updates from dispatch to delivery."
        actions={<Button to="/shop">Start shopping</Button>}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <OrderCard key={order.orderNumber} order={order} />
        ))}
      </div>
      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} onChange={setPage} className="pt-8" />
    </div>
  );
}

export default Orders;
