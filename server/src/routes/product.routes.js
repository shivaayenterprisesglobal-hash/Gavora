import { Router } from 'express';

import { notImplemented } from '../middleware/notImplemented.js';

export const productRouter = Router();

productRouter.get('/', notImplemented('list products with search, filter, sort and pagination'));
productRouter.get('/featured', notImplemented('list featured products'));
productRouter.get('/best-sellers', notImplemented('list best-selling products'));
productRouter.get('/:slug', notImplemented('fetch a single product by slug'));
productRouter.get('/:slug/related', notImplemented('list related products'));

export default productRouter;
