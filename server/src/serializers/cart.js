import { calculateTotals } from '../utils/storeRules.js';
import { toPublicProduct } from './catalogue.js';

function primaryImage(product) {
  if (!product?.images?.length) return '';
  return product.images.find((image) => image.isPrimary)?.url || product.images[0]?.url || '';
}

function availability(product) {
  if (!product) return { available: false, reason: 'deleted' };
  if (product.status && product.status !== 'active') return { available: false, reason: 'inactive' };
  if (product.category?.status === 'inactive') return { available: false, reason: 'inactive' };
  if ((product.stock ?? 0) <= 0) return { available: false, reason: 'out-of-stock' };
  return { available: true, reason: null };
}

function populatedProduct(value) {
  if (!value || typeof value !== 'object') return null;
  if (value._id || value.id) return value;
  return null;
}

export function toCartItem(line) {
  const product = populatedProduct(line.product);
  const id = product?._id ?? product?.id ?? line.productId ?? line.product;
  const productId = id ? String(id) : '';
  const { available, reason } = availability(product);
  const unitPrice = available ? (product.salePrice ?? product.price) : (line.priceSnapshot ?? 0);
  const listPrice = available ? product.price : unitPrice;

  return {
    productId,
    quantity: line.quantity,
    priceSnapshot: line.priceSnapshot,
    unitPrice,
    listPrice,
    stock: product?.stock ?? 0,
    available,
    unavailableReason: reason,
    name: product?.name ?? 'Unavailable product',
    slug: product?.slug ?? '',
    sku: product?.sku ?? '',
    image: primaryImage(product),
    categoryName: product?.category?.name ?? '',
    product: product ? toPublicProduct(product) : null,
  };
}

export function toCartDto(cart) {
  const items = (cart?.items ?? []).map(toCartItem);
  const billable = items.filter((item) => item.available);
  const totals = calculateTotals(billable);
  const warnings = items
    .filter((item) => !item.available)
    .map((item) => ({
      productId: item.productId,
      reason: item.unavailableReason,
      message:
        item.unavailableReason === 'out-of-stock'
          ? `${item.name} is no longer in stock.`
          : `${item.name} is no longer available.`,
    }));

  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    lineCount: items.length,
    warnings,
    ...totals,
    updatedAt: cart?.updatedAt ?? null,
  };
}

export function emptyCartDto() {
  return {
    items: [],
    itemCount: 0,
    lineCount: 0,
    warnings: [],
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    updatedAt: null,
  };
}
