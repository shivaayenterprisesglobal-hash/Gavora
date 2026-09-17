import api from '@/lib/api';

export async function fetchCart() {
  const { data } = await api.get('/cart');
  return data.data;
}

export async function addCartItem(productId, quantity) {
  const { data } = await api.post('/cart/items', { productId, quantity });
  return data.data;
}

export async function replaceCartItem(productId, quantity) {
  const { data } = await api.put(`/cart/items/${productId}`, { quantity });
  return data.data;
}

export async function removeCartItem(productId) {
  const { data } = await api.delete(`/cart/items/${productId}`);
  return data.data;
}

export async function clearRemoteCart() {
  const { data } = await api.delete('/cart');
  return data.data;
}
