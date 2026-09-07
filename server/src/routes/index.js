import { Router } from 'express';

import adminRouter from './admin.routes.js';
import authRouter from './auth.routes.js';
import categoryRouter from './category.routes.js';
import healthRouter from './health.routes.js';
import orderRouter from './order.routes.js';
import paymentRouter from './payment.routes.js';
import productRouter from './product.routes.js';
import userRouter from './user.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Gavora API',
    data: {
      version: '1.0.0',
      endpoints: [
        '/api/health',
        '/api/auth',
        '/api/products',
        '/api/categories',
        '/api/orders',
        '/api/users',
        '/api/payments',
        '/api/admin',
      ],
    },
  });
});

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/admin', adminRouter);

export default apiRouter;
