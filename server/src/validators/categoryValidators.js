import { httpUrlSchema } from './adminValidators.js';
import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, 'Must be a valid id');

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and hyphen-separated'),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});

const categorySlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and hyphen-separated');

const categoryImageSchema = z
  .object({
    url: httpUrlSchema.default(''),
    alt: z.string().trim().max(200).default(''),
  })
  .optional();

export const categoryWriteSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  slug: categorySlugSchema.optional(),
  description: z.string().trim().max(1000).optional(),
  image: categoryImageSchema,
  status: z.enum(['active', 'inactive']).optional(),
  displayOrder: z.number().int().min(0).max(10000).optional(),
});

export const categoryUpdateSchema = categoryWriteSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field is required' },
);
