import { Router } from 'express';

import {
  cancelMyOrder,
  createOrder,
  getMyOrder,
  getOrderByNumber,
  listMyOrders,
  listOrders,
} from '../controllers/orderController.js';
import { requireCustomer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderSchema,
  myOrderListQuerySchema,
  orderNumberParamSchema,
} from '../validators/orderValidators.js';

export const orderRouter = Router();

orderRouter.use(...requireCustomer);

orderRouter.post('/', validate({ body: createOrderSchema }), createOrder);
orderRouter.get('/my', validate({ query: myOrderListQuerySchema }), listMyOrders);
orderRouter.get('/my/:orderNumber', validate({ params: orderNumberParamSchema }), getMyOrder);
orderRouter.patch(
  '/my/:orderNumber/cancel',
  validate({ params: orderNumberParamSchema }),
  cancelMyOrder,
);
orderRouter.get('/', validate({ query: myOrderListQuerySchema }), listOrders);
orderRouter.get('/:orderNumber', validate({ params: orderNumberParamSchema }), getOrderByNumber);
orderRouter.patch(
  '/:orderNumber/cancel',
  validate({ params: orderNumberParamSchema }),
  cancelMyOrder,
);

export default orderRouter;
