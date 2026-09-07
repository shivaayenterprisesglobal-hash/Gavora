import mongoose from 'mongoose';

import { PRODUCT_STATUSES } from './constants.js';
import { slugify } from '../utils/slugify.js';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: [true, 'Image URL is required'], trim: true },
    alt: { type: String, trim: true, maxlength: 200, default: '' },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false },
);

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String, required: [true, 'Specification key is required'], trim: true, maxlength: 100 },
    value: { type: String, required: [true, 'Specification value is required'], trim: true, maxlength: 500 },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 64,
    },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    shortDescription: { type: String, trim: true, maxlength: 300, default: '' },
    specifications: { type: [specificationSchema], default: [] },
    images: { type: [imageSchema], default: [] },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    brand: { type: String, trim: true, maxlength: 120, default: '' },
    // Prices are stored in whole rupees; all order maths happens server-side.
    price: {
      type: Number,
      required: [true, 'Regular price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, 'Sale price cannot be negative'],
      validate: {
        validator(value) {
          return value === null || value === undefined || value < this.price;
        },
        message: 'Sale price must be lower than the regular price',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
    status: {
      type: String,
      enum: { values: PRODUCT_STATUSES, message: '{VALUE} is not a valid product status' },
      default: 'draft',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    unitsSold: { type: Number, min: 0, default: 0 },
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

// Text search across shop-facing fields.
productSchema.index({ name: 'text', description: 'text', brand: 'text', sku: 'text' });
// Supports the default shop listing: active products filtered by category and sorted by price.
productSchema.index({ status: 1, category: 1, price: 1 });
productSchema.index({ status: 1, unitsSold: -1 });

/** The price a customer actually pays. */
productSchema.virtual('effectivePrice').get(function getEffectivePrice() {
  return this.salePrice ?? this.price;
});

productSchema.virtual('discountPercentage').get(function getDiscountPercentage() {
  if (!this.salePrice || this.salePrice >= this.price || this.price <= 0) return 0;
  return Math.round(((this.price - this.salePrice) / this.price) * 100);
});

productSchema.virtual('inStock').get(function getInStock() {
  return this.stock > 0;
});

productSchema.pre('validate', function deriveSlug() {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

// Guarantee exactly one primary image so galleries always have a lead shot.
productSchema.pre('save', function enforcePrimaryImage() {
  if (!this.isModified('images') || this.images.length === 0) return;

  const primaries = this.images.filter((image) => image.isPrimary);
  if (primaries.length === 0) {
    this.images[0].isPrimary = true;
  } else if (primaries.length > 1) {
    primaries.slice(1).forEach((image) => {
      image.isPrimary = false;
    });
  }
});

export const Product = mongoose.model('Product', productSchema);
