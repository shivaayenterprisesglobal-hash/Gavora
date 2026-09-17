import api from '@/lib/api';

export async function listAdminOrders(params = {}) {
  const { data } = await api.get('/admin/orders', { params });
  return { items: data.data ?? [], meta: data.meta };
}

export async function getAdminOrder(id) {
  const { data } = await api.get(`/admin/orders/${id}`);
  return data.data;
}

export async function updateAdminOrderStatus(id, payload) {
  const { data } = await api.patch(`/admin/orders/${id}/status`, payload);
  return data.data;
}
