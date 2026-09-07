import { Router } from 'express';

import { notImplemented } from '../middleware/notImplemented.js';
import { authLimiter } from '../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/signup', authLimiter, notImplemented('customer signup'));
authRouter.post('/login', authLimiter, notImplemented('customer login'));
authRouter.post('/logout', notImplemented('logout and refresh-token revocation'));
authRouter.post('/refresh', notImplemented('access token refresh'));
authRouter.get('/me', notImplemented('return the authenticated user'));

export default authRouter;
