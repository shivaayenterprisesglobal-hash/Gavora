import { prisma } from '../config/prisma.js';
import { productReadInclude, prismaSearchAnd } from './catalogueRead.js';
import { newHexId } from '../utils/hexId.js';

const LOW_STOCK_LIMIT = 8;
const RECENT_LIMIT = 8;
const HEX_ID = /^[a-fA-F0-9]{24}$/;

export function isLowStock(product) {
  const threshold = product.lowStockThreshold ?? 5;
  return (product.stock ?? 0) <= threshold;
}

function effectivePrice(product) {
  return product.salePrice ?? product.price;
}

function pageSizeFrom(query, fallback = 12) {
  return query.limit ?? query.pageSize ?? fallback;
}

function sortAdminProducts(products, sort) {
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
    case 'updated':
      return copy.sort((a, b) => by(b, a, [(item) => item.updatedAt.getTime()]));
    case 'price-asc':
      return copy.sort((a, b) => by(a, b, [effectivePrice, (item) => -item.createdAt.getTime()]));
    case 'price-desc':
      return copy.sort((a, b) => by(b, a, [effectivePrice, (item) => item.createdAt.getTime()]));
    case 'rating':
      return copy.sort((a, b) => by(b, a, [(item) => item.ratingAverage, (item) => item.ratingCount]));
    case 'best-selling':
      return copy.sort((a, b) => by(b, a, [(item) => item.unitsSold, (item) => item.createdAt.getTime()]));
    case 'stock-asc':
      return copy.sort((a, b) => by(a, b, [(item) => item.stock, (item) => item.name]));
    case 'stock-desc':
      return copy.sort((a, b) => by(b, a, [(item) => item.stock, (item) => item.name]));
    case 'name-asc':
      return copy.sort((a, b) => by(a, b, [(item) => item.name]));
    default:
      return copy.sort((a, b) =>
        by(b, a, [
          (item) => (item.stock > 0 ? 1 : 0),
          (item) => (item.isFeatured ? 1 : 0),
          (item) => item.unitsSold,
          (item) => item.createdAt.getTime(),
        ]),
      );
  }
}

export async function loadDashboard() {
  const [totalProducts, totalCustomers, totalOrders, sales, statusCounts, catalogProducts, recentOrders, recentCustomers] =
    await Promise.all([
      prisma.product.count(),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { orderStatus: { not: 'cancelled' } },
        _sum: { total: true },
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: { _all: true },
      }),
      prisma.product.findMany({
        where: { status: { in: ['active', 'draft'] } },
        include: productReadInclude,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: RECENT_LIMIT,
        include: {
          items: true,
          customer: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: 'customer' },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

  const countByStatus = Object.fromEntries(statusCounts.map((row) => [row.orderStatus, row._count._all]));
  const lowStockProducts = catalogProducts
    .filter(isLowStock)
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name))
    .slice(0, LOW_STOCK_LIMIT);

  return {
    totalProducts,
    totalCustomers,
    totalOrders,
    totalSales: sales._sum.total ?? 0,
    salesOrderCount: sales._count._all ?? 0,
    pendingOrders: countByStatus.pending ?? 0,
    processingOrders: countByStatus.processing ?? 0,
    deliveredOrders: countByStatus.delivered ?? 0,
    cancelledOrders: countByStatus.cancelled ?? 0,
    lowStockCount: catalogProducts.filter(isLowStock).length,
    lowStockProducts,
    recentOrders,
    recentCustomers,
  };
}

export async function listAdminCustomers({ query }) {
  const page = query.page;
  const pageSize = pageSizeFrom(query, 12);
  const skip = (page - 1) * pageSize;
  const where = { role: 'customer' };

  if (query.status === 'active') where.isActive = true;
  if (query.status === 'inactive') where.isActive = false;

  const q = query.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { addresses: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, pageSize };
}

export async function findAdminCustomer(id) {
  return prisma.user.findFirst({
    where: { id, role: 'customer' },
    include: { addresses: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function updateAdminCustomerActive(id, isActive) {
  return prisma.user.update({
    where: { id },
    data: { isActive },
    include: { addresses: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function orderStatsByCustomer(ids) {
  if (ids.length === 0) return new Map();

  const rows = await prisma.order.groupBy({
    by: ['customerId'],
    where: { customerId: { in: ids }, orderStatus: { not: 'cancelled' } },
    _count: { _all: true },
    _sum: { total: true },
  });

  return new Map(
    rows.map((row) => [
      row.customerId,
      { orderCount: row._count._all, totalOrderValue: row._sum.total ?? 0 },
    ]),
  );
}

export async function listCustomerOrders(customerId, take = 50) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      items: { orderBy: { position: 'asc' } },
      address: true,
    },
  });
}

export async function findCategoryById(id) {
  return prisma.category.findUnique({ where: { id } });
}

export async function listAdminCategories() {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.product.groupBy({
      by: ['categoryId'],
      where: { status: { not: 'archived' } },
      _count: { _all: true },
    }),
  ]);

  const countById = new Map(counts.map((row) => [row.categoryId, row._count._all]));
  return { categories, countById };
}

export async function countActiveCategoryProducts(categoryId) {
  return prisma.product.count({
    where: { categoryId, status: { not: 'archived' } },
  });
}

export async function findCategoryConflict({ name, slug, excludeId }) {
  const clauses = [];
  if (name) clauses.push({ name: { equals: name, mode: 'insensitive' } });
  if (slug) clauses.push({ slug });
  if (clauses.length === 0) return null;

  return prisma.category.findFirst({
    where: {
      OR: clauses,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createCategoryRecord(payload) {
  return prisma.category.create({
    data: {
      id: newHexId(),
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? '',
      imageUrl: payload.image?.url ?? '',
      imageAlt: payload.image?.alt ?? '',
      status: payload.status ?? 'active',
      displayOrder: payload.displayOrder ?? 0,
    },
  });
}

export async function updateCategoryRecord(id, data) {
  return prisma.category.update({ where: { id }, data });
}

export async function findProductConflict({ slug, sku, excludeId }) {
  const clauses = [];
  if (slug) clauses.push({ slug });
  if (sku) clauses.push({ sku });
  if (clauses.length === 0) return null;

  return prisma.product.findFirst({
    where: {
      OR: clauses,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function findAdminProduct(id) {
  return prisma.product.findUnique({
    where: { id },
    include: productReadInclude,
  });
}

export async function listAdminProducts({ query }) {
  const page = query.page;
  const pageSize = pageSizeFrom(query);
  const where = {};

  if (query.status && query.status !== 'all') where.status = query.status;

  if (query.category) {
    const category = HEX_ID.test(query.category)
      ? await prisma.category.findUnique({ where: { id: query.category }, select: { id: true } })
      : await prisma.category.findUnique({ where: { slug: query.category }, select: { id: true } });
    if (!category) {
      return {
        items: [],
        meta: { page, pageSize, total: 0, totalPages: 1 },
      };
    }
    where.categoryId = category.id;
  }

  const searchAnd = prismaSearchAnd(query.q);
  if (searchAnd) where.AND = searchAnd;

  let rows = await prisma.product.findMany({
    where,
    include: productReadInclude,
  });

  rows = rows.filter((product) => {
    const price = effectivePrice(product);
    if (Number.isFinite(query.minPrice) && price < query.minPrice) return false;
    if (Number.isFinite(query.maxPrice) && price > query.maxPrice) return false;
    if (query.lowStock === 'low' && !isLowStock(product)) return false;
    return true;
  });

  const sorted = sortAdminProducts(rows, query.sort);
  const total = sorted.length;
  const skip = (page - 1) * pageSize;
  const items = sorted.slice(skip, skip + pageSize);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize) || 1),
    },
  };
}

function imageCreates(images = []) {
  const cleaned = images.filter((image) => typeof image?.url === 'string' && image.url.trim());
  const hasPrimary = cleaned.some((image) => image.isPrimary);
  return cleaned.map((image, index) => ({
    url: image.url.trim(),
    alt: image.alt ?? '',
    isPrimary: hasPrimary ? Boolean(image.isPrimary) : index === 0,
    position: Number.isInteger(image.position) ? image.position : index,
  }));
}

function specCreates(specifications = []) {
  return specifications.map((spec, position) => ({
    key: spec.key,
    value: spec.value,
    position,
  }));
}

export async function createProductRecord(payload) {
  return prisma.$transaction(async (tx) => {
    return tx.product.create({
      data: {
        id: newHexId(),
        name: payload.name,
        slug: payload.slug,
        sku: payload.sku,
        description: payload.description ?? '',
        shortDescription: payload.shortDescription ?? '',
        categoryId: payload.categoryId,
        brand: payload.brand ?? '',
        price: payload.price,
        salePrice: payload.salePrice ?? null,
        stock: payload.stock ?? 0,
        lowStockThreshold: payload.lowStockThreshold ?? 5,
        status: payload.status ?? 'draft',
        isFeatured: Boolean(payload.isFeatured),
        images: { create: imageCreates(payload.images) },
        specifications: { create: specCreates(payload.specifications) },
      },
      include: productReadInclude,
    });
  });
}

export async function updateProductRecord(id, payload) {
  return prisma.$transaction(async (tx) => {
    const data = { ...payload };
    delete data.images;
    delete data.specifications;
    delete data.categoryId;

    if (payload.categoryId) data.categoryId = payload.categoryId;

    if (payload.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      data.images = { create: imageCreates(payload.images) };
    }
    if (payload.specifications) {
      await tx.productSpecification.deleteMany({ where: { productId: id } });
      data.specifications = { create: specCreates(payload.specifications) };
    }

    return tx.product.update({
      where: { id },
      data,
      include: productReadInclude,
    });
  });
}

export async function archiveProductRecord(id) {
  return prisma.product.update({
    where: { id },
    data: { status: 'archived' },
    include: productReadInclude,
  });
}

export async function getStoreSettings() {
  return prisma.storeSettings.findFirst();
}

export async function upsertStoreSettings(payload) {
  const existing = await prisma.storeSettings.findFirst();
  if (existing) {
    return prisma.storeSettings.update({
      where: { id: existing.id },
      data: payload,
    });
  }
  return prisma.storeSettings.create({
    data: {
      id: newHexId(),
      storeName: payload.storeName ?? 'Gavora',
      logoUrl: payload.logoUrl ?? '',
      description: payload.description ?? '',
      contactEmail: payload.contactEmail ?? '',
      contactPhone: payload.contactPhone ?? '',
    },
  });
}
