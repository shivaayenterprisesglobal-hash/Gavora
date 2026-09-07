import mongoose from 'mongoose';

import { CATEGORY_STATUSES } from './constants.js';
import { slugify } from '../utils/slugify.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [120, 'Category name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    image: {
      url: { type: String, trim: true, default: '' },
      alt: { type: String, trim: true, maxlength: 200, default: '' },
    },
    status: {
      type: String,
      enum: { values: CATEGORY_STATUSES, message: '{VALUE} is not a valid category status' },
      default: 'active',
      index: true,
    },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

categorySchema.pre('validate', function deriveSlug() {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

export const Category = mongoose.model('Category', categorySchema);
