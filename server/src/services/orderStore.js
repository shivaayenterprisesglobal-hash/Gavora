import { prisma } from '../config/prisma.js';
import { newHexId } from '../utils/hexId.js';
import { cartProductInclude } from './cartStore.js';

const CHECKOUT_LOCK_MS = 30_000;

export const orderReadInclude = {
  items: { orderBy: { position: 'asc' } },
  address: true,
  statusHistory: { orderBy: [{ position: 'asc' }, { changedAt: 'asc' }] },
};

export const adminOrderInclude = {
  ...orderReadInclude,
  customer: { select: { id: true, name: true, email: true, phone: true } },
};

const cartCheckoutInclude = {
  items: {
    orderBy: { position: 'asc' },
    include: {
      product: { include: cartProductInclude },
    },
  },
};

export function isUniqueConflict(error, field) {
  if (error?.code !== 'P2002') return false;
  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes(field) || target.some((value) => String(value).includes(field));
  }
  return String(target ?? '').includes(field);
}

export async function findOrderById(id, { admin = false } = {}) {
  return prisma.order.findUnique({
    where: { id },
    include: admin ? adminOrderInclude : orderReadInclude,
  });
}

export async function findOrderByNumber(orderNumber, customerId) {
  return prisma.order.findFirst({
    where: { orderNumber, ...(customerId ? { customerId } : {}) },
    include: orderReadInclude,
  });
}

export async function findIdempotentOrder(userId, checkoutKey) {
  if (!checkoutKey) return null;
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { lastCheckoutKey: true, lastOrderId: true },
  });
  if (!cart?.lastOrderId || cart.lastCheckoutKey !== checkoutKey) return null;
  return findOrderById(cart.lastOrderId);
}

export async function acquireCheckoutLock(tx, userId) {
  const existing = await tx.cart.findUnique({
    where: { userId },
    include: cartCheckoutInclude,
  });
  if (!existing || existing.items.length === 0) {
    return { empty: true };
  }

  const stale = new Date(Date.now() - CHECKOUT_LOCK_MS);
  const locked = await tx.cart.updateMany({
    where: {
      id: existing.id,
      OR: [{ checkoutLock: false }, { checkoutLockAt: { lte: stale } }, { checkoutLockAt: null }],
    },
    data: { checkoutLock: true, checkoutLockAt: new Date() },
  });

  if (locked.count !== 1) {
    return { busy: true };
  }

  const cart = await tx.cart.findUnique({
    where: { id: existing.id },
    include: cartCheckoutInclude,
  });
  return { cart };
}

export async function completeCheckout(tx, cart, { checkoutKey, orderId }) {
  await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  return tx.cart.update({
    where: { id: cart.id },
    data: {
      lastCheckoutKey: checkoutKey ?? cart.lastCheckoutKey,
      lastOrderId: orderId,
      checkoutLock: false,
      checkoutLockAt: null,
    },
  });
}

export async function decrementProductStock(tx, productId, quantity) {
  return tx.product.updateMany({
    where: { id: productId, status: 'active', stock: { gte: quantity } },
    data: {
      stock: { decrement: quantity },
      unitsSold: { increment: quantity },
    },
  });
}

export async function restoreProductStock(tx, productId, quantity) {
  return tx.product.updateMany({
    where: { id: productId },
    data: {
      stock: { increment: quantity },
      unitsSold: { decrement: quantity },
    },
  });
}

export async function createCodOrder(tx, payload) {
  const orderId = newHexId();
  const paymentId = newHexId();

  await tx.order.create({
    data: {
      id: orderId,
      orderNumber: payload.orderNumber,
      customerId: payload.customerId,
      contactEmail: payload.contactEmail,
      subtotal: payload.subtotal,
      discount: payload.discount,
      shipping: payload.shipping,
      total: payload.total,
      currency: 'INR',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      customerNote: payload.customerNote ?? '',
      items: {
        create: payload.items.map((item, position) => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          image: item.image ?? '',
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          position,
        })),
      },
      address: {
        create: {
          fullName: payload.address.fullName,
          phone: payload.address.phone,
          line1: payload.address.line1,
          line2: payload.address.line2 ?? '',
          landmark: payload.address.landmark ?? '',
          city: payload.address.city,
          state: payload.address.state,
          pincode: payload.address.pincode,
          country: payload.address.country ?? 'India',
        },
      },
      statusHistory: {
        create: {
          status: 'pending',
          note: 'Order placed',
          changedById: payload.customerId,
          changedAt: new Date(),
          position: 0,
        },
      },
      payments: {
        create: {
          id: paymentId,
          provider: 'cod',
          amount: payload.total,
          currency: 'INR',
          status: 'pending',
        },
      },
    },
  });

  return tx.order.findUnique({
    where: { id: orderId },
    include: orderReadInclude,
  });
}

export async function saveCheckoutAddress(tx, userId, address) {
  const count = await tx.address.count({ where: { userId } });
  return tx.address.create({
    data: {
      id: newHexId(),
      userId,
      label: address.label ?? 'home',
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? '',
      landmark: address.landmark ?? '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country ?? 'India',
      isDefault: count === 0,
    },
  });
}

export async function listCustomerOrders(customerId, { skip, take }) {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { customerId },
      include: orderReadInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where: { customerId } }),
  ]);
  return { items, total };
}

export async function listAdminOrders(where, { skip, take, oldest = false }) {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: adminOrderInclude,
      orderBy: { createdAt: oldest ? 'asc' : 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total };
}

export async function searchCustomerIds(q) {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true },
  });
  return users.map((user) => user.id);
}

export async function cancelEligibleOrder(tx, { where, userId, note }) {
  const existing = await tx.order.findFirst({
    where,
    include: { items: true },
  });
  if (!existing) return { missing: true };

  const now = new Date();
  const updated = await tx.order.updateMany({
    where: {
      id: existing.id,
      orderStatus: { in: ['pending', 'confirmed', 'processing'] },
    },
    data: {
      orderStatus: 'cancelled',
      cancelledAt: now,
    },
  });

  if (updated.count !== 1) {
    return { order: existing, cancelled: false };
  }

  const historyCount = await tx.orderStatusEvent.count({ where: { orderId: existing.id } });
  await tx.orderStatusEvent.create({
    data: {
      orderId: existing.id,
      status: 'cancelled',
      note,
      changedById: userId,
      changedAt: now,
      position: historyCount,
    },
  });

  for (const item of existing.items) {
    await restoreProductStock(tx, item.productId, item.quantity);
  }

  const cancelled = await tx.order.findUnique({
    where: { id: existing.id },
    include: adminOrderInclude,
  });
  return { order: cancelled, cancelled: true };
}

export async function updateOrderStatus(tx, order, { nextStatus, note, userId }) {
  const now = new Date();
  const data = { orderStatus: nextStatus };
  if (nextStatus === 'delivered') data.deliveredAt = now;

  await tx.order.update({
    where: { id: order.id },
    data,
  });

  const historyCount = await tx.orderStatusEvent.count({ where: { orderId: order.id } });
  await tx.orderStatusEvent.create({
    data: {
      orderId: order.id,
      status: nextStatus,
      note: note ?? '',
      changedById: userId,
      changedAt: now,
      position: historyCount,
    },
  });

  return tx.order.findUnique({
    where: { id: order.id },
    include: adminOrderInclude,
  });
}

export function withOrderTransaction(work) {
  return prisma.$transaction(work, { maxWait: 5000, timeout: 15000 });
}
