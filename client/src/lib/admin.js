import api from '@/lib/api';

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export async function getAdminDashboard() {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
}

export async function listAdminProducts(params = {}) {
  const { data } = await api.get('/admin/products', { params: compactParams(params) });
  return { items: data.data ?? [], meta: data.meta };
}

export async function getAdminProduct(id) {
  const { data } = await api.get(`/admin/products/${id}`);
  return data.data;
}

export async function createAdminProduct(payload) {
  const { data } = await api.post('/admin/products', payload);
  return data.data;
}

export async function updateAdminProduct(id, payload) {
  const { data } = await api.patch(`/admin/products/${id}`, payload);
  return data.data;
}

export async function archiveAdminProduct(id) {
  const { data } = await api.delete(`/admin/products/${id}`);
  return data.data;
}

export async function listAdminCategories() {
  const { data } = await api.get('/admin/categories');
  return data.data ?? [];
}

export async function getAdminCategory(id) {
  const { data } = await api.get(`/admin/categories/${id}`);
  return data.data;
}

export async function createAdminCategory(payload) {
  const { data } = await api.post('/admin/categories', payload);
  return data.data;
}

export async function updateAdminCategory(id, payload) {
  const { data } = await api.patch(`/admin/categories/${id}`, payload);
  return data.data;
}

export async function deactivateAdminCategory(id) {
  const { data } = await api.delete(`/admin/categories/${id}`);
  return data.data;
}

export async function listAdminCustomers(params = {}) {
  const { data } = await api.get('/admin/customers', { params: compactParams(params) });
  return { items: data.data ?? [], meta: data.meta };
}

export async function getAdminCustomer(id) {
  const { data } = await api.get(`/admin/customers/${id}`);
  return data.data;
}

export async function updateAdminCustomer(id, payload) {
  const { data } = await api.patch(`/admin/customers/${id}`, payload);
  return data.data;
}

export async function getAdminSettings() {
  const { data } = await api.get('/admin/settings');
  return data.data;
}

export async function updateAdminSettings(payload) {
  const { data } = await api.patch('/admin/settings', payload);
  return data.data;
}

export function isHttpUrl(value) {
  return /^https?:\/\/\S+$/i.test(String(value).trim());
}
