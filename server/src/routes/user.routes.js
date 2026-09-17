import { Router } from 'express';

import {
  createAddress,
  deleteAddress,
  getProfile,
  listAddresses,
  setDefaultAddress,
  updateAddress,
  updateProfile,
  changePassword,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { objectIdSchema } from '../validators/categoryValidators.js';
import {
  addressUpdateSchema,
  addressWriteSchema,
  changePasswordSchema,
  profileUpdateSchema,
} from '../validators/userValidators.js';
import { z } from 'zod';

const idParams = z.object({ id: objectIdSchema });
const addressIdParams = z.object({ addressId: objectIdSchema });

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/me', getProfile);
userRouter.put('/me', validate({ body: profileUpdateSchema }), updateProfile);
userRouter.patch('/me', validate({ body: profileUpdateSchema }), updateProfile);

userRouter.get('/me/addresses', listAddresses);
userRouter.post('/me/addresses', validate({ body: addressWriteSchema }), createAddress);
userRouter.put(
  '/me/addresses/:id',
  validate({ params: idParams, body: addressUpdateSchema }),
  updateAddress,
);
userRouter.patch(
  '/me/addresses/:id',
  validate({ params: idParams, body: addressUpdateSchema }),
  updateAddress,
);
userRouter.delete('/me/addresses/:id', validate({ params: idParams }), deleteAddress);
userRouter.patch(
  '/me/addresses/:id/default',
  validate({ params: idParams }),
  setDefaultAddress,
);

userRouter.get('/profile', getProfile);
userRouter.patch('/profile', validate({ body: profileUpdateSchema }), updateProfile);
userRouter.patch(
  '/password',
  authLimiter,
  validate({ body: changePasswordSchema }),
  changePassword,
);

userRouter.get('/addresses', listAddresses);
userRouter.post('/addresses', validate({ body: addressWriteSchema }), createAddress);
userRouter.patch(
  '/addresses/:addressId',
  validate({ params: addressIdParams, body: addressUpdateSchema }),
  updateAddress,
);
userRouter.delete('/addresses/:addressId', validate({ params: addressIdParams }), deleteAddress);
userRouter.patch(
  '/addresses/:addressId/default',
  validate({ params: addressIdParams }),
  setDefaultAddress,
);

export default userRouter;
