import { z } from 'zod';

import { ORDER_STATUSES, PAYMENT_STATUSES } from '../models/constants.js';
import { objectIdSchema } from './categoryValidators.js';
import { addressWriteSchema } from './userValidators.js';

const checkoutAddressSchema = addressWriteSchema.omit({ isDefault: true });

export const createOrderSchema = z
  .object({
    paymentMethod: z.enum(['cod', 'online']),
    addressId: objectIdSchema.optional(),
    address: checkoutAddressSchema.optional(),
    customerNote: z.string().trim().max(500).optional().default(''),
    saveAddress: z.boolean().optional().default(false),
    checkoutKey: z.string().trim().min(8).max(80).optional(),
  })
  .refine((value) => Boolean(value.addressId) || Boolean(value.address), {
    message: 'A shipping address is required',
    path: ['address'],
  });

export const orderNumberParamSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(6, 'Order number is required')
    .max(40)
    .regex(/^[A-Z0-9-]+$/, 'Invalid order number'),
});

export const myOrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(48).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

export const adminOrderListQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  status: z.enum(['all', ...ORDER_STATUSES]).optional().default('all'),
  paymentStatus: z.enum(['all', ...PAYMENT_STATUSES]).optional().default('all'),
  paymentMethod: z.enum(['all', 'cod', 'online']).optional().default('all'),
  sort: z.enum(['newest', 'oldest']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(48).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  note: z.string().trim().max(500).optional().default(''),
});
