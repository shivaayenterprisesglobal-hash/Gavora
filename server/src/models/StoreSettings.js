import mongoose from 'mongoose';

/**
 * Singleton storefront identity. Commercial rules (shipping, COD) stay in
 * environment variables so checkout maths cannot drift from a second source.
 */
const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, trim: true, maxlength: 80, default: 'Gavora' },
    logoUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
    contactPhone: { type: String, trim: true, maxlength: 20, default: '' },
  },
  { timestamps: true },
);

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
