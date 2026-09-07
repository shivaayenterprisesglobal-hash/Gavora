import mongoose from 'mongoose';

import { ADDRESS_LABELS, USER_ROLES } from './constants.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INDIAN_PHONE_PATTERN = /^[6-9]\d{9}$/;
const PINCODE_PATTERN = /^[1-9]\d{5}$/;

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, enum: ADDRESS_LABELS, default: 'home' },
    fullName: { type: String, required: [true, 'Recipient name is required'], trim: true, maxlength: 120 },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
      match: [INDIAN_PHONE_PATTERN, 'Enter a valid 10-digit Indian mobile number'],
    },
    line1: { type: String, required: [true, 'Address line 1 is required'], trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200, default: '' },
    landmark: { type: String, trim: true, maxlength: 120, default: '' },
    city: { type: String, required: [true, 'City is required'], trim: true, maxlength: 100 },
    state: { type: String, required: [true, 'State is required'], trim: true, maxlength: 100 },
    pincode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true,
      match: [PINCODE_PATTERN, 'Enter a valid 6-digit PIN code'],
    },
    country: { type: String, default: 'India', trim: true, maxlength: 100 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_PATTERN, 'Enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      match: [INDIAN_PHONE_PATTERN, 'Enter a valid 10-digit Indian mobile number'],
    },
    // Never store or accept a plain password. Excluded from queries by default
    // so it cannot leak through a forgotten `.select()`.
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: { values: USER_ROLES, message: '{VALUE} is not a valid role' },
      default: 'customer',
      index: true,
    },
    addresses: { type: [addressSchema], default: [] },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.virtual('defaultAddress').get(function getDefaultAddress() {
  return this.addresses?.find((address) => address.isDefault) ?? this.addresses?.[0] ?? null;
});

// Exactly one default address per user.
userSchema.pre('save', function enforceSingleDefaultAddress() {
  if (!this.isModified('addresses') || this.addresses.length === 0) return;

  const defaults = this.addresses.filter((address) => address.isDefault);
  if (defaults.length === 0) {
    this.addresses[0].isDefault = true;
  } else if (defaults.length > 1) {
    defaults.slice(0, -1).forEach((address) => {
      address.isDefault = false;
    });
  }
});

export const User = mongoose.model('User', userSchema);
