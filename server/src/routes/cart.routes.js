import { Router } from 'express';

import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  replaceCartItem,
} from '../controllers/cartController.js';
import { requireCustomer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  cartItemBodySchema,
  cartItemQuantitySchema,
  cartProductParamSchema,
} from '../validators/cartValidators.js';

export const cartRouter = Router();

cartRouter.use(...requireCustomer);

cartRouter.get('/', getCart);
cartRouter.post('/items', validate({ body: cartItemBodySchema }), addCartItem);
cartRouter.put(
  '/items/:productId',
  validate({ params: cartProductParamSchema, body: cartItemQuantitySchema }),
  replaceCartItem,
);
cartRouter.delete('/items/:productId', validate({ params: cartProductParamSchema }), removeCartItem);
cartRouter.delete('/', clearCart);

export default cartRouter;
