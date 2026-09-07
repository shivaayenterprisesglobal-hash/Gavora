import { Router } from 'express';

import { notImplemented } from '../middleware/notImplemented.js';

export const userRouter = Router();

userRouter.get('/profile', notImplemented('fetch the authenticated customer profile'));
userRouter.patch('/profile', notImplemented('update name, phone and email'));
userRouter.patch('/password', notImplemented('change password'));

userRouter.get('/addresses', notImplemented('list saved addresses'));
userRouter.post('/addresses', notImplemented('add a saved address'));
userRouter.patch('/addresses/:addressId', notImplemented('update a saved address'));
userRouter.delete('/addresses/:addressId', notImplemented('delete a saved address'));
userRouter.patch('/addresses/:addressId/default', notImplemented('set the default address'));

export default userRouter;
