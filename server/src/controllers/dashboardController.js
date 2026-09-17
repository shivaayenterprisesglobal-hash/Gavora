import { env } from '../config/env.js';
import { toAdminProduct } from '../serializers/catalogue.js';
import { toAdminOrderSummary } from '../serializers/order.js';
import { toSafeUser } from '../serializers/user.js';
import { loadDashboard } from '../services/adminStore.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';

export const getDashboard = asyncHandler(async (_req, res) => {
  const dashboard = await loadDashboard();

  return sendResponse(res, {
    message: 'Dashboard',
    data: {
      stats: {
        totalProducts: dashboard.totalProducts,
        totalCustomers: dashboard.totalCustomers,
        totalOrders: dashboard.totalOrders,
        totalSales: dashboard.totalSales,
        salesOrderCount: dashboard.salesOrderCount,
        pendingOrders: dashboard.pendingOrders,
        processingOrders: dashboard.processingOrders,
        deliveredOrders: dashboard.deliveredOrders,
        cancelledOrders: dashboard.cancelledOrders,
        lowStockProducts: dashboard.lowStockCount,
      },
      recentOrders: dashboard.recentOrders.map(toAdminOrderSummary),
      recentCustomers: dashboard.recentCustomers.map((user) => ({
        ...toSafeUser(user),
        isActive: user.isActive,
      })),
      lowStock: dashboard.lowStockProducts.map(toAdminProduct),
      commerce: {
        currency: 'INR',
        freeShippingThreshold: env.FREE_SHIPPING_THRESHOLD,
      },
    },
  });
});
