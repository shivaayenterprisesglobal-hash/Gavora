import { Router } from 'express';

import { notImplemented } from '../middleware/notImplemented.js';

export const paymentRouter = Router();

paymentRouter.post('/razorpay/order', notImplemented('create a Razorpay order for a Gavora order'));
paymentRouter.post(
  '/razorpay/verify',
  notImplemented('verify the Razorpay payment signature server-side'),
);
paymentRouter.post(
  '/razorpay/webhook',
  notImplemented('handle Razorpay webhooks with signature verification'),
);
paymentRouter.get('/methods', notImplemented('list enabled payment methods'));

export default paymentRouter;
