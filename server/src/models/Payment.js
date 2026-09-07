import mongoose from 'mongoose';

import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from './constants.js';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      index: true,
    },
    provider: {
      type: String,
      enum: { values: PAYMENT_PROVIDERS, message: '{VALUE} is not a supported payment provider' },
      required: [true, 'Payment provider is required'],
    },
    /** Provider's payment identifier (razorpay_payment_id). Absent until captured. */
    paymentId: { type: String, trim: true, default: null },
    /** Provider's order identifier (razorpay_order_id). */
    providerOrderId: { type: String, trim: true, default: null },
    /**
     * Signature returned by the provider. Stored only after it has been
     * verified server-side with the webhook/key secret.
     */
    signature: { type: String, trim: true, default: null, select: false },
    amount: { type: Number, required: [true, 'Amount is required'], min: [0, 'Amount cannot be negative'] },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    status: {
      type: String,
      enum: { values: PAYMENT_STATUSES, message: '{VALUE} is not a valid payment status' },
      default: 'pending',
      index: true,
    },
    failureReason: { type: String, trim: true, maxlength: 500, default: null },
    refundId: { type: String, trim: true, default: null },
    refundedAmount: { type: Number, min: 0, default: 0 },
    /** Raw provider payload, kept for reconciliation and dispute handling. */
    providerResponse: { type: mongoose.Schema.Types.Mixed, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        delete ret.signature;
        delete ret.providerResponse;
        return ret;
      },
    },
  },
);

// A provider payment id must map to at most one Payment record, but the field
// is null until capture — a sparse unique index allows the nulls.
paymentSchema.index({ paymentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
