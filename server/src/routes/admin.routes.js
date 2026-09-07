import { Router } from 'express';

import { notImplemented } from '../middleware/notImplemented.js';
import { authLimiter } from '../middleware/rateLimit.js';

export const adminRouter = Router();

// Admin authentication is deliberately separate from the customer flow; the
// whole router will sit behind `requireAuth` + `requireRole('admin')` once
// implemented, so no admin surface is reachable with a customer token.
adminRouter.post('/auth/login', authLimiter, notImplemented('admin login'));
adminRouter.post('/auth/logout', notImplemented('admin logout'));
adminRouter.get('/auth/me', notImplemented('return the authenticated admin'));

adminRouter.get('/dashboard', notImplemented('dashboard metrics'));

adminRouter.get('/products', notImplemented('list products with search and filters'));
adminRouter.post('/products', notImplemented('create a product'));
adminRouter.get('/products/:id', notImplemented('fetch a product for editing'));
adminRouter.patch('/products/:id', notImplemented('update a product'));
adminRouter.delete('/products/:id', notImplemented('delete a product'));

adminRouter.get('/categories', notImplemented('list all categories'));
adminRouter.post('/categories', notImplemented('create a category'));
adminRouter.patch('/categories/:id', notImplemented('update or activate/deactivate a category'));
adminRouter.delete('/categories/:id', notImplemented('delete a category'));

adminRouter.get('/orders', notImplemented('list orders with filters'));
adminRouter.get('/orders/:id', notImplemented('fetch full order details'));
adminRouter.patch('/orders/:id/status', notImplemented('update the order status'));
adminRouter.patch('/orders/:id/payment-status', notImplemented('update the payment status'));

adminRouter.get('/customers', notImplemented('list customers'));
adminRouter.get('/customers/:id', notImplemented('fetch customer details and order history'));

adminRouter.get('/payments', notImplemented('list payment records'));
adminRouter.get('/payments/:id', notImplemented('fetch a payment record'));

adminRouter.get('/settings', notImplemented('read store settings'));
adminRouter.patch('/settings', notImplemented('update store settings'));

export default adminRouter;
