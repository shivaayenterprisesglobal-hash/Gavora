import { z } from 'zod';

import { emailSchema, passwordSchema, phoneSchema } from './authValidators.js';

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120).optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const addressWriteSchema = z.object({
  label: z.enum(['home', 'work', 'other']).optional(),
  fullName: z.string().trim().min(2, 'Enter the recipient’s name').max(120),
  phone: phoneSchema,
  line1: z.string().trim().min(1, 'Enter address line 1').max(200),
  line2: z.string().trim().max(200).optional().default(''),
  landmark: z.string().trim().max(120).optional().default(''),
  city: z.string().trim().min(1, 'Enter a city').max(100),
  state: z.string().trim().min(1, 'Select a state').max(100),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code'),
  country: z.string().trim().max(100).optional().default('India'),
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = addressWriteSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field is required' },
);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(72),
    newPassword: passwordSchema,
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });
