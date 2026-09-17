import { prisma } from '../config/prisma.js';

const HEX_ID = /^[a-fA-F0-9]{24}$/;

export const productReadInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: 'asc' } },
  specifications: { orderBy: { position: 'asc' } },
};

function searchTerms(q) {
  return String(q || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
}

export function prismaSearchAnd(q) {
  const terms = searchTerms(q);
  if (terms.length === 0) return undefined;

  return terms.map((term) => ({
    OR: [
      { name: { contains: term, mode: 'insensitive' } },
      { brand: { contains: term, mode: 'insensitive' } },
      { sku: { contains: term, mode: 'insensitive' } },
      { shortDescription: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ],
  }));
}

function effectivePrice(product) {
  return product.salePrice ?? product.price;
}

function inStockFlag(product) {
  return product.stock > 0 ? 1 : 0;
}

function sortProducts(products, sort) {
  const copy = [...products];
  const by = (a, b, getters) => {
    for (const getter of getters) {
      const av = getter(a);
      const bv = getter(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  };

  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => by(b, a, [(item) => item.createdAt.getTime()]));
    case 'price-asc':
      return copy.sort((a, b) =>
        by(a, b, [effectivePrice, (item) => -item.createdAt.getTime()]),
      );
    case 'price-desc':
      return copy.sort((a, b) =>
        by(b, a, [effectivePrice, (item) => item.createdAt.getTime()]),
      );
    case 'rating':
      return copy.sort((a, b) => by(b, a, [(item) => item.ratingAverage, (item) => item.ratingCount]));
    case 'best-selling':
      return copy.sort((a, b) =>
        by(b, a, [(item) => item.unitsSold, (item) => item.createdAt.getTime()]),
      );
    case 'relevance':
    default:
      return copy.sort((a, b) =>
        by(b, a, [
          inStockFlag,
          (item) => (item.isFeatured ? 1 : 0),
          (item) => item.unitsSold,
          (item) => item.createdAt.getTime(),
        ]),
      );
  }
}

function matchesEffectivePrice(product, minPrice, maxPrice) {
  const price = effectivePrice(product);
  if (Number.isFinite(minPrice) && price < minPrice) return false;
  if (Number.isFinite(maxPrice) && price > maxPrice) return false;
  return true;
}

export async function priceBoundsActive() {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    select: { price: true, salePrice: true },
  });

  if (products.length === 0) return { min: 0, max: 0 };

  const prices = products.map(effectivePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return {
    min: Math.floor(min / 100) * 100,
    max: Math.ceil(max / 100) * 100,
  };
}

export async function resolveActiveCategoryId(slug) {
  if (!slug) return null;
  const category = await prisma.category.findFirst({
    where: { slug, status: 'active' },
    select: { id: true },
  });
  return category?.id ?? false;
}

export function pageSizeFrom(query, fallback = 12) {
  return query.limit ?? query.pageSize ?? fallback;
}

export async function listPublicCategories() {
  return prisma.category.findMany({
    where: { status: 'active' },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function getPublicCategoryBySlug(slug) {
  return prisma.category.findFirst({
    where: { slug, status: 'active' },
  });
}

export async function listPublicProducts(query) {
  const page = query.page;
  const pageSize = pageSizeFrom(query);
  const categoryId = await resolveActiveCategoryId(query.category);

  if (query.category && categoryId === false) {
    return {
      items: [],
      meta: {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
        priceBounds: await priceBoundsActive(),
      },
    };
  }

  const where = { status: 'active' };
  if (categoryId) where.categoryId = categoryId;
  if (query.availability === 'in-stock') where.stock = { gt: 0 };
  if (query.availability === 'on-sale') where.salePrice = { not: null };

  const searchAnd = prismaSearchAnd(query.q);
  if (searchAnd) where.AND = searchAnd;

  const rows = await prisma.product.findMany({
    where,
    include: productReadInclude,
  });

  const priced = rows.filter((product) =>
    matchesEffectivePrice(product, query.minPrice, query.maxPrice),
  );
  const sorted = sortProducts(priced, query.sort);
  const total = sorted.length;
  const skip = (page - 1) * pageSize;
  const items = sorted.slice(skip, skip + pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      priceBounds: await priceBoundsActive(),
    },
  };
}

export async function listFeaturedProducts(limit) {
  return prisma.product.findMany({
    where: { status: 'active', isFeatured: true },
    orderBy: [{ unitsSold: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: productReadInclude,
  });
}

export async function listBestSellers(limit) {
  return prisma.product.findMany({
    where: { status: 'active' },
    orderBy: [{ unitsSold: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: productReadInclude,
  });
}

export async function getPublicProductBySlugOrId(slug) {
  const where = HEX_ID.test(slug)
    ? { id: slug, status: 'active' }
    : { slug, status: 'active' };

  return prisma.product.findFirst({
    where,
    include: productReadInclude,
  });
}

export async function listRelatedProducts(slug, limit = 4) {
  const product = await prisma.product.findFirst({
    where: HEX_ID.test(slug) ? { id: slug, status: 'active' } : { slug, status: 'active' },
    select: { id: true, categoryId: true },
  });

  if (!product) return null;

  const sameCategory = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: 'active',
      categoryId: product.categoryId,
    },
    orderBy: { unitsSold: 'desc' },
    take: limit,
    include: productReadInclude,
  });

  if (sameCategory.length >= limit) return sameCategory;

  const excludeIds = [product.id, ...sameCategory.map((item) => item.id)];
  const fillers = await prisma.product.findMany({
    where: {
      id: { notIn: excludeIds },
      status: 'active',
    },
    orderBy: { unitsSold: 'desc' },
    take: limit - sameCategory.length,
    include: productReadInclude,
  });

  return [...sameCategory, ...fillers];
}

export async function getPublicStoreSettings() {
  return prisma.storeSettings.findFirst();
}
