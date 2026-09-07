import mongoose from 'mongoose';

import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from './constants.js';

/**
 * Line items snapshot the product's name, SKU and unit price at purchase time.
 * A later price or catalogue change must never rewrite order history.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    sku: { type: String, required: true, trim: true, maxlength: 64 },
    image: { type: String, trim: true, default: '' },
    unitPrice: { type: Number, required: true, min: [0, 'Unit price cannot be negative'] },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' },
    },
    lineTotal: { type: Number, required: true, min: [0, 'Line total cannot be negative'] },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200, default: '' },
    landmark: { type: String, trim: true, maxlength: 120, default: '' },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true, maxlength: 100 },
  },
  { _id: false },
);

const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
      index: true,
    },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'An order must contain at least one item',
      },
    },
    address: { type: shippingAddressSchema, required: [true, 'Delivery address is required'] },

    // Every monetary field is recomputed server-side from the catalogue at
    // checkout; values sent by the client are never trusted.
    subtotal: { type: Number, required: true, min: [0, 'Subtotal cannot be negative'] },
    discount: { type: Number, required: true, min: [0, 'Discount cannot be negative'], default: 0 },
    shipping: { type: Number, required: true, min: [0, 'Shipping cannot be negative'], default: 0 },
    total: { type: Number, required: true, min: [0, 'Total cannot be negative'] },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },

    paymentMethod: {
      type: String,
      enum: { values: PAYMENT_METHODS, message: '{VALUE} is not a supported payment method' },
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: { values: PAYMENT_STATUSES, message: '{VALUE} is not a valid payment status' },
      default: 'pending',
      index: true,
    },
    /** Provider-side identifier, e.g. a Razorpay payment id. */
    paymentReference: { type: String, trim: true, default: null },

    orderStatus: {
      type: String,
      enum: { values: ORDER_STATUSES, message: '{VALUE} is not a valid order status' },
      default: 'pending',
      index: true,
    },
    statusHistory: { type: [statusEventSchema], default: [] },

    customerNote: { type: String, trim: true, maxlength: 500, default: '' },
    cancelledAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
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

// Admin order list and customer order history both sort newest-first.
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

orderSchema.virtual('itemCount').get(function getItemCount() {
  return this.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
});

export const Order = mongoose.model('Order', orderSchema);
