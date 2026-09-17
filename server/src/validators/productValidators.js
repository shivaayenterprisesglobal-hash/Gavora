import { z } from 'zod';

import { objectIdSchema } from './categoryValidators.js';
import { httpUrlSchema } from './adminValidators.js';

const productSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and hyphen-separated');

const imageSchema = z.object({
  url: httpUrlSchema,
  alt: z.string().trim().max(200).optional().default(''),
  isPrimary: z.boolean().optional(),
});

const specificationSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(500),
});

const productFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  slug: productSlugSchema.optional(),
  sku: z.string().trim().min(1, 'SKU is required').max(64),
  description: z.string().trim().max(5000).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  specifications: z.array(specificationSchema).max(40).optional(),
  images: z.array(imageSchema).max(12).optional(),
  category: objectIdSchema,
  brand: z.string().trim().max(120).optional(),
  price: z.number({ error: 'Price must be a number' }).finite().positive('Price must be positive'),
  salePrice: z
    .number({ error: 'Sale price must be a number' })
    .finite()
    .nonnegative('Sale price cannot be negative')
    .nullable()
    .optional(),
  stock: z.number({ error: 'Stock must be a number' }).int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
};

function salePriceDoesNotExceedRegular(value) {
  if (value.salePrice == null || value.price == null) return true;
  return value.salePrice < value.price;
}

export const productWriteSchema = z
  .object(productFields)
  .refine(salePriceDoesNotExceedRegular, {
    message: 'Sale price cannot exceed the regular price',
    path: ['salePrice'],
  });

export const productUpdateSchema = z
  .object(productFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  })
  .refine(salePriceDoesNotExceedRegular, {
    message: 'Sale price cannot exceed the regular price',
    path: ['salePrice'],
  });

export const publicProductListQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  availability: z.enum(['all', 'in-stock', 'on-sale']).optional().default('all'),
  sort: z
    .enum(['relevance', 'newest', 'price-asc', 'price-desc', 'rating', 'best-selling'])
    .optional()
    .default('relevance'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(48).optional(),
  pageSize: z.coerce.number().int().min(1).max(48).optional(),
});

export const adminProductListQuerySchema = publicProductListQuerySchema
  .omit({ sort: true })
  .extend({
    status: z.enum(['all', 'draft', 'active', 'archived']).optional().default('all'),
    lowStock: z.enum(['all', 'low']).optional().default('all'),
    sort: z
      .enum([
        'relevance',
        'newest',
        'price-asc',
        'price-desc',
        'rating',
        'best-selling',
        'stock-asc',
        'stock-desc',
        'name-asc',
        'updated',
      ])
      .optional()
      .default('newest'),
  });

export const limitQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).optional().default(8),
});

export const productSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(120),
});

export const productIdParamSchema = z.object({
  id: objectIdSchema,
});
