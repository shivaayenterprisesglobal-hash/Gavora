import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  getAdminCategory,
  listAdminCategories,
  updateCategory,
} from '../controllers/categoryController.js';
import {
  createProduct,
  deleteProduct,
  getAdminProduct,
  listAdminProducts,
  updateProduct,
} from '../controllers/productController.js';
import { adminLogin, logout, me } from '../controllers/authController.js';
import { getAdminCustomer, listAdminCustomers, updateAdminCustomer } from '../controllers/customerController.js';
import { getDashboard } from '../controllers/dashboardController.js';
import { getAdminOrder, listAdminOrders, updateAdminOrderStatus } from '../controllers/orderController.js';
import { getAdminSettings, updateAdminSettings } from '../controllers/settingsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { notImplemented } from '../middleware/notImplemented.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/authValidators.js';
import {
  adminCustomerListQuerySchema,
  adminCustomerStatusSchema,
  storeSettingsSchema,
} from '../validators/adminValidators.js';
import {
  categoryUpdateSchema,
  categoryWriteSchema,
  idParamSchema,
} from '../validators/categoryValidators.js';
import {
  adminProductListQuerySchema,
  productIdParamSchema,
  productUpdateSchema,
  productWriteSchema,
} from '../validators/productValidators.js';
import { adminOrderListQuerySchema, adminOrderStatusSchema } from '../validators/orderValidators.js';

export const adminRouter = Router();

// Admin authentication is deliberately separate from the customer flow; the
// rest of this router sits behind requireAuth + requireRole('admin') so no
// admin surface is reachable with a missing or customer token.
adminRouter.post('/auth/login', authLimiter, validate({ body: loginSchema }), adminLogin);
adminRouter.post('/auth/logout', logout);
adminRouter.get('/auth/me', requireAuth, requireRole('admin'), me);

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/dashboard', getDashboard);

adminRouter.get('/products', validate({ query: adminProductListQuerySchema }), listAdminProducts);
adminRouter.post('/products', validate({ body: productWriteSchema }), createProduct);
adminRouter.get('/products/:id', validate({ params: productIdParamSchema }), getAdminProduct);
adminRouter.put(
  '/products/:id',
  validate({ params: productIdParamSchema, body: productUpdateSchema }),
  updateProduct,
);
adminRouter.patch(
  '/products/:id',
  validate({ params: productIdParamSchema, body: productUpdateSchema }),
  updateProduct,
);
adminRouter.delete('/products/:id', validate({ params: productIdParamSchema }), deleteProduct);

adminRouter.get('/categories', listAdminCategories);
adminRouter.post('/categories', validate({ body: categoryWriteSchema }), createCategory);
adminRouter.get('/categories/:id', validate({ params: idParamSchema }), getAdminCategory);
adminRouter.put(
  '/categories/:id',
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  updateCategory,
);
adminRouter.patch(
  '/categories/:id',
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  updateCategory,
);
adminRouter.delete('/categories/:id', validate({ params: idParamSchema }), deleteCategory);

adminRouter.get('/orders', validate({ query: adminOrderListQuerySchema }), listAdminOrders);
adminRouter.get('/orders/:id', validate({ params: idParamSchema }), getAdminOrder);
adminRouter.patch(
  '/orders/:id/status',
  validate({ params: idParamSchema, body: adminOrderStatusSchema }),
  updateAdminOrderStatus,
);
adminRouter.patch('/orders/:id/payment-status', notImplemented('update the payment status'));

adminRouter.get('/customers', validate({ query: adminCustomerListQuerySchema }), listAdminCustomers);
adminRouter.get('/customers/:id', validate({ params: idParamSchema }), getAdminCustomer);
adminRouter.patch(
  '/customers/:id',
  validate({ params: idParamSchema, body: adminCustomerStatusSchema }),
  updateAdminCustomer,
);

adminRouter.get('/payments', notImplemented('list payment records'));
adminRouter.get('/payments/:id', notImplemented('fetch a payment record'));

adminRouter.get('/settings', getAdminSettings);
adminRouter.patch('/settings', validate({ body: storeSettingsSchema }), updateAdminSettings);

export default adminRouter;
