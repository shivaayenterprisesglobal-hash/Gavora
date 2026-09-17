const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

function asCategorySummary(category) {
  if (!category) return null;
  const json = typeof category.toJSON === 'function' ? category.toJSON() : category;
  return {
    _id: json._id ?? json.id,
    name: json.name,
    slug: json.slug,
  };
}

function isRecentlyAdded(createdAt) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() <= NEW_WINDOW_MS;
}

function discountPercentage(price, salePrice) {
  if (!salePrice || salePrice >= price || price <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

/** Storefront-safe product shape. Status and internal flags stay off this list. */
export function toPublicProduct(doc) {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;

  return {
    _id: json._id ?? json.id,
    name: json.name,
    slug: json.slug,
    sku: json.sku,
    description: json.description ?? '',
    shortDescription: json.shortDescription ?? '',
    specifications: (json.specifications ?? []).map((item) => ({
      key: item.key,
      value: item.value,
    })),
    images: (json.images ?? []).map((item, index) => ({
      url: item.url,
      alt: item.alt ?? '',
      isPrimary: Boolean(item.isPrimary),
      position: Number.isInteger(item.position) ? item.position : index,
    })),
    category: asCategorySummary(json.category),
    brand: json.brand ?? '',
    price: json.price,
    salePrice: json.salePrice ?? null,
    stock: json.stock,
    lowStockThreshold: json.lowStockThreshold ?? 5,
    isFeatured: Boolean(json.isFeatured),
    isNew: isRecentlyAdded(json.createdAt),
    ratingAverage: json.ratingAverage ?? 0,
    ratingCount: json.ratingCount ?? 0,
    unitsSold: json.unitsSold ?? 0,
    inStock: (json.stock ?? 0) > 0,
    effectivePrice: json.salePrice ?? json.price,
    discountPercentage: discountPercentage(json.price, json.salePrice),
    createdAt: json.createdAt,
  };
}

export function toAdminProduct(doc) {
  return {
    ...toPublicProduct(doc),
    status: doc.status,
    updatedAt: doc.updatedAt,
  };
}

export function toPublicCategory(doc) {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;
  return {
    _id: json._id ?? json.id,
    name: json.name,
    slug: json.slug,
    description: json.description ?? '',
    image: json.image ?? { url: json.imageUrl ?? '', alt: json.imageAlt ?? '' },
    displayOrder: json.displayOrder ?? 0,
  };
}

export function toAdminCategory(doc, extras = {}) {
  return {
    ...toPublicCategory(doc),
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    productCount: extras.productCount ?? 0,
  };
}
