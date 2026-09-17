import { env } from '../config/env.js';
import { getPublicStoreSettings } from '../services/catalogueRead.js';
import { getStoreSettings, upsertStoreSettings } from '../services/adminStore.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';

const DEFAULT_DESCRIPTION =
  'Gavora brings together carefully selected products across categories, with honest pricing, secure checkout and dependable delivery across India.';

function identityFrom(doc) {
  return {
    storeName: doc?.storeName || 'Gavora',
    logoUrl: doc?.logoUrl || '',
    description: doc?.description || DEFAULT_DESCRIPTION,
    contactEmail: doc?.contactEmail || '',
    contactPhone: doc?.contactPhone || '',
  };
}

function commerceBlock() {
  return {
    shippingFlatRate: env.SHIPPING_FLAT_RATE,
    freeShippingThreshold: env.FREE_SHIPPING_THRESHOLD,
    codEnabled: env.COD_ENABLED,
    codMaxOrderValue: env.COD_MAX_ORDER_VALUE,
    source: 'environment',
    writable: false,
  };
}

export const getPublicStore = asyncHandler(async (_req, res) => {
  const doc = await getPublicStoreSettings();
  return sendResponse(res, { message: 'Store', data: identityFrom(doc) });
});

export const getAdminSettings = asyncHandler(async (_req, res) => {
  const doc = await getStoreSettings();
  return sendResponse(res, {
    message: 'Settings',
    data: {
      store: identityFrom(doc),
      commerce: commerceBlock(),
    },
  });
});

export const updateAdminSettings = asyncHandler(async (req, res) => {
  const payload = {};
  for (const key of ['storeName', 'logoUrl', 'description', 'contactEmail', 'contactPhone']) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }

  const doc = await upsertStoreSettings(payload);
  return sendResponse(res, {
    message: 'Settings saved',
    data: {
      store: identityFrom(doc),
      commerce: commerceBlock(),
    },
  });
});
