import { toAdminProduct, toPublicProduct } from '../serializers/catalogue.js';
import {
  archiveProductRecord,
  createProductRecord,
  findAdminProduct,
  findCategoryById,
  findProductConflict,
  listAdminProducts as listAdminProductsStore,
  updateProductRecord,
} from '../services/adminStore.js';
import {
  getPublicProductBySlugOrId,
  listBestSellers as listPrismaBestSellers,
  listFeaturedProducts as listPrismaFeatured,
  listPublicProducts as listPrismaPublicProducts,
  listRelatedProducts as listPrismaRelated,
} from '../services/catalogueRead.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated, sendResponse } from '../utils/sendResponse.js';
import { slugify } from '../utils/slugify.js';

async function assertUniqueProduct({ slug, sku, excludeId }) {
  const existing = await findProductConflict({ slug, sku, excludeId });
  if (!existing) return;

  if (sku && existing.sku === sku) {
    throw ApiError.conflict('A product with this SKU already exists', {
      details: { sku: 'already in use' },
    });
  }

  throw ApiError.conflict('A product with this slug already exists', {
    details: { slug: 'already in use' },
  });
}

async function assertCategoryExists(categoryId) {
  const category = await findCategoryById(categoryId);
  if (!category) {
    throw ApiError.badRequest('Category does not exist', {
      details: { category: 'must reference a valid category' },
    });
  }
  return category;
}

function usableImages(images) {
  if (!Array.isArray(images)) return images;
  const cleaned = images.filter((image) => image?.url?.trim());
  if (cleaned.length > 0 && !cleaned.some((image) => image.isPrimary)) {
    cleaned[0] = { ...cleaned[0], isPrimary: true };
  }
  return cleaned;
}

export const listPublicProducts = asyncHandler(async (req, res) => {
  const listing = await listPrismaPublicProducts(req.query);
  return sendResponse(res, { message: 'Products', data: listing.items.map(toPublicProduct), meta: listing.meta });
});

export const listFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await listPrismaFeatured(req.query.limit);
  return sendResponse(res, {
    message: 'Featured products',
    data: products.map(toPublicProduct),
  });
});

export const listBestSellers = asyncHandler(async (req, res) => {
  const products = await listPrismaBestSellers(req.query.limit);
  return sendResponse(res, {
    message: 'Best sellers',
    data: products.map(toPublicProduct),
  });
});

export const getPublicProduct = asyncHandler(async (req, res) => {
  const product = await getPublicProductBySlugOrId(req.params.slug);

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  return sendResponse(res, { message: 'Product', data: toPublicProduct(product) });
});

export const listRelatedProducts = asyncHandler(async (req, res) => {
  const products = await listPrismaRelated(req.params.slug, req.query.limit ?? 4);

  if (!products) {
    throw ApiError.notFound('Product not found');
  }

  return sendResponse(res, {
    message: 'Related products',
    data: products.map(toPublicProduct),
  });
});

export const getAdminProduct = asyncHandler(async (req, res) => {
  const product = await findAdminProduct(req.params.id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return sendResponse(res, { message: 'Product', data: toAdminProduct(product) });
});

export const listAdminProducts = asyncHandler(async (req, res) => {
  const listing = await listAdminProductsStore({ query: req.query });
  return sendResponse(res, {
    message: 'Products',
    data: listing.items.map(toAdminProduct),
    meta: listing.meta,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  await assertCategoryExists(req.body.category);
  const slug = req.body.slug || slugify(req.body.name);
  const sku = req.body.sku.toUpperCase();
  await assertUniqueProduct({ slug, sku });

  const product = await createProductRecord({
    name: req.body.name,
    slug,
    sku,
    description: req.body.description,
    shortDescription: req.body.shortDescription,
    categoryId: req.body.category,
    brand: req.body.brand,
    price: req.body.price,
    salePrice: req.body.salePrice,
    stock: req.body.stock,
    lowStockThreshold: req.body.lowStockThreshold,
    status: req.body.status,
    isFeatured: req.body.isFeatured,
    images: usableImages(req.body.images),
    specifications: req.body.specifications,
  });

  return sendCreated(res, { message: 'Product created', data: toAdminProduct(product) });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await findAdminProduct(req.params.id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (req.body.category) {
    await assertCategoryExists(req.body.category);
  }

  const nextSlug = req.body.slug ?? (req.body.name ? slugify(req.body.name) : product.slug);
  const nextSku = req.body.sku ? req.body.sku.toUpperCase() : product.sku;
  await assertUniqueProduct({ slug: nextSlug, sku: nextSku, excludeId: product.id });

  const nextPrice = req.body.price ?? product.price;
  const nextSale = Object.hasOwn(req.body, 'salePrice') ? req.body.salePrice : product.salePrice;
  if (nextSale != null && nextSale >= nextPrice) {
    throw ApiError.unprocessable('Validation failed', {
      details: { salePrice: 'Sale price cannot exceed the regular price' },
    });
  }

  const payload = {};
  if (req.body.name !== undefined) payload.name = req.body.name;
  if (req.body.description !== undefined) payload.description = req.body.description;
  if (req.body.shortDescription !== undefined) payload.shortDescription = req.body.shortDescription;
  if (req.body.brand !== undefined) payload.brand = req.body.brand;
  if (req.body.price !== undefined) payload.price = req.body.price;
  if (Object.hasOwn(req.body, 'salePrice')) payload.salePrice = req.body.salePrice;
  if (req.body.stock !== undefined) payload.stock = req.body.stock;
  if (req.body.lowStockThreshold !== undefined) payload.lowStockThreshold = req.body.lowStockThreshold;
  if (req.body.status !== undefined) payload.status = req.body.status;
  if (req.body.isFeatured !== undefined) payload.isFeatured = req.body.isFeatured;
  if (req.body.category) payload.categoryId = req.body.category;
  payload.slug = nextSlug;
  payload.sku = nextSku;
  if (req.body.images) payload.images = usableImages(req.body.images);
  if (req.body.specifications) payload.specifications = req.body.specifications;

  const updated = await updateProductRecord(product.id, payload);
  return sendResponse(res, { message: 'Product updated', data: toAdminProduct(updated) });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await findAdminProduct(req.params.id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const archived = await archiveProductRecord(product.id);
  return sendResponse(res, { message: 'Product archived', data: toAdminProduct(archived) });
});
