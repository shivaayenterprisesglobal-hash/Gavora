import { Router } from 'express';

import { notImplemented } from '../middleware/notImplemented.js';

export const orderRouter = Router();

orderRouter.post('/', notImplemented('place an order with server-side price and total validation'));
orderRouter.get('/', notImplemented("list the authenticated customer's orders"));
orderRouter.get('/:orderNumber', notImplemented('fetch one of the customer own orders'));
orderRouter.patch('/:orderNumber/cancel', notImplemented('cancel a cancellable order'));

export default orderRouter;
