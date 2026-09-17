import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  getPublicCategory,
  listAdminCategories,
  listPublicCategories,
  updateCategory,
} from '../controllers/categoryController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  categoryUpdateSchema,
  categoryWriteSchema,
  idParamSchema,
  slugParamSchema,
} from '../validators/categoryValidators.js';

export const categoryRouter = Router();

categoryRouter.get('/', listPublicCategories);
categoryRouter.get('/admin', ...requireAdmin, listAdminCategories);
categoryRouter.post('/', ...requireAdmin, validate({ body: categoryWriteSchema }), createCategory);
categoryRouter.put(
  '/:id',
  ...requireAdmin,
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  updateCategory,
);
categoryRouter.patch(
  '/:id',
  ...requireAdmin,
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  updateCategory,
);
categoryRouter.delete('/:id', ...requireAdmin, validate({ params: idParamSchema }), deleteCategory);
categoryRouter.get('/:slug', validate({ params: slugParamSchema }), getPublicCategory);

export default categoryRouter;
