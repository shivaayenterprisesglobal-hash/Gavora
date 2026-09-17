import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getPublicProduct,
  listAdminProducts,
  listBestSellers,
  listFeaturedProducts,
  listPublicProducts,
  listRelatedProducts,
  updateProduct,
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminProductListQuerySchema,
  limitQuerySchema,
  productIdParamSchema,
  productSlugParamSchema,
  productUpdateSchema,
  productWriteSchema,
  publicProductListQuerySchema,
} from '../validators/productValidators.js';

export const productRouter = Router();

productRouter.get('/', validate({ query: publicProductListQuerySchema }), listPublicProducts);
productRouter.get('/featured', validate({ query: limitQuerySchema }), listFeaturedProducts);
productRouter.get('/best-sellers', validate({ query: limitQuerySchema }), listBestSellers);
productRouter.get(
  '/admin',
  ...requireAdmin,
  validate({ query: adminProductListQuerySchema }),
  listAdminProducts,
);
productRouter.post('/', ...requireAdmin, validate({ body: productWriteSchema }), createProduct);
productRouter.put(
  '/:id',
  ...requireAdmin,
  validate({ params: productIdParamSchema, body: productUpdateSchema }),
  updateProduct,
);
productRouter.patch(
  '/:id',
  ...requireAdmin,
  validate({ params: productIdParamSchema, body: productUpdateSchema }),
  updateProduct,
);
productRouter.delete(
  '/:id',
  ...requireAdmin,
  validate({ params: productIdParamSchema }),
  deleteProduct,
);
productRouter.get(
  '/:slug/related',
  validate({ params: productSlugParamSchema, query: limitQuerySchema }),
  listRelatedProducts,
);
productRouter.get('/:slug', validate({ params: productSlugParamSchema }), getPublicProduct);

export default productRouter;
