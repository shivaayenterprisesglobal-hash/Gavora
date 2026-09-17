import { Router } from 'express';

import {
  adminLogin,
  login,
  logout,
  me,
  refreshSession,
  signup,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signupSchema } from '../validators/authValidators.js';

export const authRouter = Router();

authRouter.post('/signup', authLimiter, validate({ body: signupSchema }), signup);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), login);
authRouter.post('/admin/login', authLimiter, validate({ body: loginSchema }), adminLogin);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refreshSession);
authRouter.get('/me', requireAuth, me);

export default authRouter;
