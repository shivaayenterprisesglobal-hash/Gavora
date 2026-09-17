import api from '@/lib/api';

/**
 * Customer account API access. Orders and profile always belong to the
 * authenticated session — the client never sends a customer id.
 */

export async function getProfile() {
  const { data } = await api.get('/users/me');
  return data.data;
}

export async function updateProfile(payload) {
  const { data } = await api.put('/users/me', payload);
  return data.data;
}

export async function listAddresses() {
  const { data } = await api.get('/users/me/addresses');
  return data.data ?? [];
}

export async function createAddress(payload) {
  const { data } = await api.post('/users/me/addresses', payload);
  return data.data;
}

export async function updateAddress(id, payload) {
  const { data } = await api.put(`/users/me/addresses/${id}`, payload);
  return data.data;
}

export async function deleteAddress(id) {
  await api.delete(`/users/me/addresses/${id}`);
}

export async function setDefaultAddress(id) {
  const { data } = await api.patch(`/users/me/addresses/${id}/default`);
  return data.data;
}

export async function listOrders({ page = 1, pageSize = 10 } = {}) {
  const { data } = await api.get('/orders/my', { params: { page, pageSize } });
  return { items: data.data ?? [], meta: data.meta };
}

export async function getOrderByNumber(orderNumber) {
  try {
    const { data } = await api.get(`/orders/my/${encodeURIComponent(orderNumber)}`);
    return data.data;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function cancelOrder(orderNumber) {
  const { data } = await api.patch(`/orders/my/${encodeURIComponent(orderNumber)}/cancel`);
  return data.data;
}

export async function changePassword(payload) {
  const { data } = await api.patch('/users/password', payload);
  return data.data;
}

export const CANCELLABLE_ORDER_STATUSES = ['pending', 'confirmed', 'processing'];

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload);
  return data.data;
}

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Payment pending',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
};

export const PAYMENT_METHOD_LABELS = {
  online: 'Online payment',
  cod: 'Cash on Delivery',
};
