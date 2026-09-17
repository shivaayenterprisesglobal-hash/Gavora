import { z } from 'zod';

import { objectIdSchema } from './categoryValidators.js';
import { MAX_CART_QUANTITY } from '../utils/storeRules.js';

export const cartItemBodySchema = z.object({
  productId: objectIdSchema,
  quantity: z
    .number({ error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1')
    .max(MAX_CART_QUANTITY, `Quantity cannot exceed ${MAX_CART_QUANTITY}`),
});

export const cartItemQuantitySchema = z.object({
  quantity: z
    .number({ error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1')
    .max(MAX_CART_QUANTITY, `Quantity cannot exceed ${MAX_CART_QUANTITY}`),
});

export const cartProductParamSchema = z.object({
  productId: objectIdSchema,
});
