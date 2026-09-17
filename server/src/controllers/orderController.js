import { env } from '../config/env.js';
import { toAdminOrder, toAdminOrderSummary, toCustomerOrder } from '../serializers/order.js';
import { findUserById } from '../services/userStore.js';
import {
  acquireCheckoutLock,
  cancelEligibleOrder,
  completeCheckout,
  createCodOrder,
  decrementProductStock,
  findIdempotentOrder,
  findOrderById,
  findOrderByNumber,
  isUniqueConflict,
  listAdminOrders as listAdminOrdersStore,
  listCustomerOrders,
  saveCheckoutAddress,
  searchCustomerIds,
  updateOrderStatus,
  withOrderTransaction,
} from '../services/orderStore.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { sendCreated, sendResponse } from '../utils/sendResponse.js';
import { calculateTotals, isCodAllowed } from '../utils/storeRules.js';

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

function pageSizeFrom(query, fallback = 10) {
  return query.limit ?? query.pageSize ?? fallback;
}

function primaryImage(product) {
  if (!product?.images?.length) return '';
  return product.images.find((image) => image.isPrimary)?.url || product.images[0]?.url || '';
}

function snapshotAddress(address) {
  return {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? '',
    landmark: address.landmark ?? '',
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country ?? 'India',
    label: address.label,
  };
}

async function loadCustomer(userId) {
  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Authentication required');
  }
  return user;
}

async function resolveShippingAddress(tx, user, body) {
  if (body.addressId) {
    const saved = await tx.address.findFirst({
      where: { id: body.addressId, userId: user.id },
    });
    if (!saved) {
      throw ApiError.unprocessable('Saved address not found', {
        details: { addressId: 'not found' },
      });
    }
    return snapshotAddress(saved);
  }

  return snapshotAddress(body.address);
}

function assertLinePurchasable(product, quantity) {
  if (!product) {
    throw ApiError.unprocessable('A product in your cart is no longer available', {
      details: { cart: 'unavailable-product' },
    });
  }
  if (product.status !== 'active' || product.category?.status === 'inactive') {
    throw ApiError.unprocessable(`${product.name} is no longer available`, {
      details: { productId: 'inactive' },
    });
  }
  if ((product.stock ?? 0) < quantity) {
    throw ApiError.conflict(
      product.stock > 0
        ? `Only ${product.stock} of ${product.name} left in stock`
        : `${product.name} is out of stock`,
      { details: { productId: 'insufficient-stock' } },
    );
  }
}

function buildOrderLines(cart) {
  return cart.items.map((line) => {
    const product = line.product;
    const quantity = line.quantity;
    assertLinePurchasable(product, quantity);
    const unitPrice = product.salePrice ?? product.price;
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: primaryImage(product),
      quantity,
      unitPrice,
      listPrice: product.price,
      lineTotal: unitPrice * quantity,
    };
  });
}

async function placeOrder(tx, { user, body }) {
  const lock = await acquireCheckoutLock(tx, user.id);
  if (lock.empty) {
    throw ApiError.unprocessable('Your cart is empty', { details: { cart: 'empty' } });
  }
  if (lock.busy) {
    throw ApiError.conflict('An order is already being placed. Please wait a moment and try again.');
  }

  const cart = lock.cart;
  if (body.checkoutKey && cart.lastCheckoutKey === body.checkoutKey && cart.lastOrderId) {
    const existing = await tx.order.findUnique({
      where: { id: cart.lastOrderId },
      include: {
        items: { orderBy: { position: 'asc' } },
        address: true,
        statusHistory: { orderBy: [{ position: 'asc' }, { changedAt: 'asc' }] },
      },
    });
    if (existing) return existing;
  }

  if (!cart.items.length) {
    throw ApiError.unprocessable('Your cart is empty', { details: { cart: 'empty' } });
  }

  const lines = buildOrderLines(cart);
  const totals = calculateTotals(lines);
  const paymentMethod = body.paymentMethod;

  if (paymentMethod === 'online') {
    throw ApiError.unprocessable('Online payment is not available yet. Please choose Cash on Delivery.', {
      details: { paymentMethod: 'not implemented' },
    });
  }

  if (!env.COD_ENABLED) {
    throw ApiError.unprocessable('Cash on Delivery is currently unavailable', {
      details: { paymentMethod: 'cod-disabled' },
    });
  }

  if (!isCodAllowed(totals.total)) {
    throw ApiError.unprocessable(
      `Cash on Delivery is available on orders up to ₹${env.COD_MAX_ORDER_VALUE.toLocaleString('en-IN')}`,
      { details: { paymentMethod: 'cod-limit' } },
    );
  }

  const address = await resolveShippingAddress(tx, user, body);

  for (const line of lines) {
    const updated = await decrementProductStock(tx, line.productId, line.quantity);
    if (updated.count !== 1) {
      throw ApiError.conflict('Not enough stock for one or more items', {
        details: { cart: 'insufficient-stock' },
      });
    }
  }

  const order = await createCodOrder(tx, {
    orderNumber: generateOrderNumber(),
    customerId: user.id,
    contactEmail: user.email,
    items: lines,
    address,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.total,
    customerNote: body.customerNote ?? '',
  });

  await completeCheckout(tx, cart, {
    checkoutKey: body.checkoutKey,
    orderId: order.id,
  });

  if (body.address && body.saveAddress) {
    await saveCheckoutAddress(tx, user.id, { ...address, label: body.address.label });
  }

  return order;
}

export const createOrder = asyncHandler(async (req, res) => {
  const existing = await findIdempotentOrder(req.user.id, req.body.checkoutKey);
  if (existing) {
    return sendResponse(res, { message: 'Order already placed', data: toCustomerOrder(existing) });
  }

  const user = await loadCustomer(req.user.id);
  let order;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      order = await withOrderTransaction((tx) => placeOrder(tx, { user, body: req.body }));
      break;
    } catch (error) {
      if (isUniqueConflict(error, 'orderNumber') && attempt < 4) continue;
      throw error;
    }
  }

  if (!order) {
    throw ApiError.internal('Could not allocate an order number');
  }

  return sendCreated(res, { message: 'Order placed', data: toCustomerOrder(order) });
});

async function sendCustomerOrderList(req, res) {
  const page = req.query.page;
  const pageSize = pageSizeFrom(req.query);
  const skip = (page - 1) * pageSize;
  const { items, total } = await listCustomerOrders(req.user.id, { skip, take: pageSize });

  return sendResponse(res, {
    message: 'Orders',
    data: items.map(toCustomerOrder),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize) || 1),
    },
  });
}

async function sendCustomerOrder(req, res) {
  const order = await findOrderByNumber(req.params.orderNumber, req.user.id);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }
  return sendResponse(res, { message: 'Order', data: toCustomerOrder(order) });
}

export const listMyOrders = asyncHandler(sendCustomerOrderList);
export const listOrders = asyncHandler(sendCustomerOrderList);
export const getMyOrder = asyncHandler(sendCustomerOrder);
export const getOrderByNumber = asyncHandler(sendCustomerOrder);

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const owned = { orderNumber: req.params.orderNumber, customerId: req.user.id };

  const result = await withOrderTransaction((tx) =>
    cancelEligibleOrder(tx, {
      where: owned,
      userId: req.user.id,
      note: 'Cancelled by customer',
    }),
  );

  if (result.missing) {
    throw ApiError.notFound('Order not found');
  }
  if (result.cancelled) {
    return sendResponse(res, { message: 'Order cancelled', data: toCustomerOrder(result.order) });
  }
  if (result.order.orderStatus === 'cancelled') {
    throw ApiError.conflict('This order is already cancelled', {
      details: { status: 'already-cancelled' },
    });
  }
  throw ApiError.unprocessable('This order can no longer be cancelled', {
    details: { status: 'not-cancellable' },
  });
});

export const listAdminOrders = asyncHandler(async (req, res) => {
  const page = req.query.page;
  const pageSize = pageSizeFrom(req.query);
  const skip = (page - 1) * pageSize;
  const where = {};

  if (req.query.status && req.query.status !== 'all') {
    where.orderStatus = req.query.status;
  }
  if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
    where.paymentStatus = req.query.paymentStatus;
  }
  if (req.query.paymentMethod && req.query.paymentMethod !== 'all') {
    where.paymentMethod = req.query.paymentMethod;
  }

  const q = req.query.q?.trim();
  if (q) {
    const customerIds = await searchCustomerIds(q);
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { contactEmail: { contains: q, mode: 'insensitive' } },
      ...(customerIds.length > 0 ? [{ customerId: { in: customerIds } }] : []),
    ];
  }

  const { items, total } = await listAdminOrdersStore(where, {
    skip,
    take: pageSize,
    oldest: req.query.sort === 'oldest',
  });

  return sendResponse(res, {
    message: 'Orders',
    data: items.map(toAdminOrderSummary),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize) || 1),
    },
  });
});

export const getAdminOrder = asyncHandler(async (req, res) => {
  const order = await findOrderById(req.params.id, { admin: true });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }
  return sendResponse(res, { message: 'Order', data: toAdminOrder(order) });
});

export const updateAdminOrderStatus = asyncHandler(async (req, res) => {
  const updated = await withOrderTransaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const nextStatus = req.body.status;
    if (nextStatus === order.orderStatus) {
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: { orderBy: { position: 'asc' } },
          address: true,
          statusHistory: { orderBy: [{ position: 'asc' }, { changedAt: 'asc' }] },
          customer: { select: { id: true, name: true, email: true, phone: true } },
        },
      });
    }

    const allowed = ALLOWED_TRANSITIONS[order.orderStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw ApiError.unprocessable(`Cannot change status from ${order.orderStatus} to ${nextStatus}`, {
        details: { status: 'invalid-transition' },
      });
    }

    if (nextStatus === 'cancelled') {
      const cancelled = await cancelEligibleOrder(tx, {
        where: { id: order.id },
        userId: req.user.id,
        note: req.body.note ?? '',
      });
      if (cancelled.cancelled) return cancelled.order;
      if (cancelled.missing) {
        throw ApiError.notFound('Order not found');
      }
      if (cancelled.order.orderStatus === 'cancelled') {
        throw ApiError.conflict('This order is already cancelled', {
          details: { status: 'already-cancelled' },
        });
      }
      throw ApiError.unprocessable(`Cannot change status from ${cancelled.order.orderStatus} to cancelled`, {
        details: { status: 'invalid-transition' },
      });
    }

    return updateOrderStatus(tx, order, {
      nextStatus,
      note: req.body.note ?? '',
      userId: req.user.id,
    });
  });

  return sendResponse(res, { message: 'Order status updated', data: toAdminOrder(updated) });
});
