import { toCustomerOrder } from '../serializers/order.js';
import { toSafeAddress, toSafeUser } from '../serializers/user.js';
import {
  findAdminCustomer,
  listAdminCustomers as listAdminCustomersStore,
  listCustomerOrders,
  orderStatsByCustomer,
  updateAdminCustomerActive,
} from '../services/adminStore.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';

export function toAdminCustomer(user, stats = {}) {
  return {
    ...toSafeUser(user),
    isActive: Boolean(user.isActive),
    lastLoginAt: user.lastLoginAt ?? null,
    orderCount: stats.orderCount ?? 0,
    totalOrderValue: stats.totalOrderValue ?? 0,
  };
}

export const listAdminCustomers = asyncHandler(async (req, res) => {
  const { users, total, page, pageSize } = await listAdminCustomersStore({ query: req.query });
  const stats = await orderStatsByCustomer(users.map((user) => user.id));

  return sendResponse(res, {
    message: 'Customers',
    data: users.map((user) => toAdminCustomer(user, stats.get(user.id))),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize) || 1),
    },
  });
});

export const getAdminCustomer = asyncHandler(async (req, res) => {
  const user = await findAdminCustomer(req.params.id);
  if (!user) {
    throw ApiError.notFound('Customer not found');
  }

  const [statsMap, orders] = await Promise.all([
    orderStatsByCustomer([user.id]),
    listCustomerOrders(user.id),
  ]);

  return sendResponse(res, {
    message: 'Customer',
    data: {
      ...toAdminCustomer(user, statsMap.get(user.id)),
      addresses: (user.addresses ?? []).map(toSafeAddress),
      orders: orders.map(toCustomerOrder),
    },
  });
});

export const updateAdminCustomer = asyncHandler(async (req, res) => {
  const user = await findAdminCustomer(req.params.id);
  if (!user) {
    throw ApiError.notFound('Customer not found');
  }

  if (req.body.isActive === false && user.id === req.user.id) {
    throw ApiError.unprocessable('You cannot deactivate your own account', {
      details: { isActive: 'not allowed' },
    });
  }

  const updated =
    req.body.isActive === undefined ? user : await updateAdminCustomerActive(user.id, req.body.isActive);
  const statsMap = await orderStatsByCustomer([updated.id]);

  return sendResponse(res, {
    message: 'Customer updated',
    data: toAdminCustomer(updated, statsMap.get(updated.id)),
  });
});
