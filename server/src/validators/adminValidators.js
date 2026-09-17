import { z } from 'zod';

export const httpUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => value === '' || /^https?:\/\//i.test(value), 'Enter a valid http(s) URL');

export const adminCustomerListQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  status: z.enum(['all', 'active', 'inactive']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(48).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

export const adminCustomerStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .refine((value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), 'Enter a valid email address');

export const storeSettingsSchema = z
  .object({
    storeName: z.string().trim().min(2).max(80).optional(),
    logoUrl: httpUrlSchema.optional(),
    description: z.string().trim().max(500).optional(),
    contactEmail: optionalEmail.optional(),
    contactPhone: z.string().trim().max(20).optional(),
  })
  .strict();
