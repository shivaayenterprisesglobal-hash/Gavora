import { Router } from 'express';

import { notImplemented } from '../middleware/notImplemented.js';

export const categoryRouter = Router();

categoryRouter.get('/', notImplemented('list active categories'));
categoryRouter.get('/:slug', notImplemented('fetch a single category by slug'));

export default categoryRouter;
