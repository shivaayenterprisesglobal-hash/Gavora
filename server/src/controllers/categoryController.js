import { toAdminCategory, toPublicCategory } from '../serializers/catalogue.js';
import {
  countActiveCategoryProducts,
  createCategoryRecord,
  findCategoryById,
  findCategoryConflict,
  listAdminCategories as listAdminCategoriesStore,
  updateCategoryRecord,
} from '../services/adminStore.js';
import {
  getPublicCategoryBySlug,
  listPublicCategories as listPrismaCategories,
} from '../services/catalogueRead.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated, sendResponse } from '../utils/sendResponse.js';
import { slugify } from '../utils/slugify.js';

async function assertUniqueCategory({ name, slug, excludeId }) {
  const existing = await findCategoryConflict({ name, slug, excludeId });
  if (!existing) return;

  if (slug && existing.slug === slug) {
    throw ApiError.conflict('A category with this slug already exists', {
      details: { slug: 'already in use' },
    });
  }

  throw ApiError.conflict('A category with this name already exists', {
    details: { name: 'already in use' },
  });
}

export const listPublicCategories = asyncHandler(async (_req, res) => {
  const categories = await listPrismaCategories();
  return sendResponse(res, {
    message: 'Categories',
    data: categories.map(toPublicCategory),
  });
});

export const getPublicCategory = asyncHandler(async (req, res) => {
  const category = await getPublicCategoryBySlug(req.params.slug);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  return sendResponse(res, { message: 'Category', data: toPublicCategory(category) });
});

export const listAdminCategories = asyncHandler(async (_req, res) => {
  const { categories, countById } = await listAdminCategoriesStore();
  return sendResponse(res, {
    message: 'Categories',
    data: categories.map((category) =>
      toAdminCategory(category, { productCount: countById.get(category.id) ?? 0 }),
    ),
  });
});

export const getAdminCategory = asyncHandler(async (req, res) => {
  const category = await findCategoryById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  const productCount = await countActiveCategoryProducts(category.id);
  return sendResponse(res, {
    message: 'Category',
    data: toAdminCategory(category, { productCount }),
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = payload.slug || slugify(payload.name);
  await assertUniqueCategory({ name: payload.name, slug: payload.slug });

  const category = await createCategoryRecord(payload);
  return sendCreated(res, { message: 'Category created', data: toAdminCategory(category, { productCount: 0 }) });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await findCategoryById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const nextName = req.body.name ?? category.name;
  const nextSlug = req.body.slug ?? (req.body.name ? slugify(req.body.name) : category.slug);
  await assertUniqueCategory({ name: nextName, slug: nextSlug, excludeId: category.id });

  const data = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.description !== undefined) data.description = req.body.description;
  if (req.body.status !== undefined) data.status = req.body.status;
  if (req.body.displayOrder !== undefined) data.displayOrder = req.body.displayOrder;
  if (req.body.image) {
    data.imageUrl = req.body.image.url ?? '';
    data.imageAlt = req.body.image.alt ?? '';
  }
  data.slug = nextSlug;

  const updated = await updateCategoryRecord(category.id, data);
  const productCount = await countActiveCategoryProducts(updated.id);
  return sendResponse(res, {
    message: 'Category updated',
    data: toAdminCategory(updated, { productCount }),
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await findCategoryById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const productCount = await countActiveCategoryProducts(category.id);
  const updated = await updateCategoryRecord(category.id, { status: 'inactive' });

  return sendResponse(res, {
    message: 'Category deactivated',
    data: toAdminCategory(updated, { productCount }),
  });
});
