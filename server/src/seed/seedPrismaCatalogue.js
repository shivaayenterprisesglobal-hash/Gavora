/**
 * Prisma/Neon development catalogue seed.
 * Prepared from server/src/seed/catalogueData.js. Not executed by the HTTP server.
 *
 * Run later with: npm run seed:prisma --workspace server
 * Do not run while NODE_ENV=production.
 *
 * Product images: each seed product may include `images: [{ url, alt, isPrimary, position? }]`.
 * Empty arrays clear ProductImage rows so the storefront shows the branded placeholder.
 * When real https URLs are added later, this seed creates the matching ProductImage rows.
 */
import { createHash } from 'node:crypto';

import { isProduction } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { slugify } from '../utils/slugify.js';
import { seedCategories, seedProducts } from './catalogueData.js';

if (isProduction) {
  console.error('Refusing to seed the Prisma catalogue in production.');
  process.exit(1);
}

function stableId(kind, key) {
  return createHash('md5').update(`gavora:${kind}:${key}`).digest('hex').slice(0, 24);
}

/** Build ProductImage create rows. Skips blank URLs; ensures one primary when any remain. */
function imageCreates(productId, images = []) {
  const cleaned = images.filter((image) => typeof image?.url === 'string' && image.url.trim());
  if (cleaned.length === 0) return [];

  const hasPrimary = cleaned.some((image) => image.isPrimary);
  return cleaned.map((image, index) => ({
    productId,
    url: image.url.trim(),
    alt: image.alt ?? '',
    isPrimary: hasPrimary ? Boolean(image.isPrimary) : index === 0,
    position: Number.isInteger(image.position) ? image.position : index,
  }));
}

async function seed() {
  const categoriesBySlug = {};

  for (const item of seedCategories) {
    const id = stableId('category', item.slug);
    const category = await prisma.category.upsert({
      where: { slug: item.slug },
      create: {
        id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? '',
        imageUrl: item.image?.url ?? '',
        imageAlt: item.image?.alt ?? '',
        status: 'active',
        displayOrder: item.displayOrder ?? 0,
      },
      update: {
        name: item.name,
        description: item.description ?? '',
        imageUrl: item.image?.url ?? '',
        imageAlt: item.image?.alt ?? '',
        status: 'active',
        displayOrder: item.displayOrder ?? 0,
      },
    });
    categoriesBySlug[item.slug] = category;
  }

  for (const item of seedProducts) {
    const category = categoriesBySlug[item.categorySlug];
    if (!category) {
      throw new Error(`Seed category missing: ${item.categorySlug}`);
    }

    const {
      categorySlug: _categorySlug,
      createdAt,
      specifications = [],
      images = [],
      ...fields
    } = item;
    const slug = slugify(fields.name);
    const id = stableId('product', fields.sku);

    await prisma.product.upsert({
      where: { sku: fields.sku },
      create: {
        id,
        name: fields.name,
        slug,
        sku: fields.sku,
        description: fields.description ?? '',
        shortDescription: fields.shortDescription ?? '',
        categoryId: category.id,
        brand: fields.brand ?? '',
        price: fields.price,
        salePrice: fields.salePrice ?? null,
        stock: fields.stock ?? 0,
        status: 'active',
        isFeatured: Boolean(fields.isFeatured),
        ratingAverage: fields.ratingAverage ?? 0,
        ratingCount: fields.ratingCount ?? 0,
        unitsSold: fields.unitsSold ?? 0,
        createdAt,
        updatedAt: createdAt,
      },
      update: {
        name: fields.name,
        slug,
        description: fields.description ?? '',
        shortDescription: fields.shortDescription ?? '',
        categoryId: category.id,
        brand: fields.brand ?? '',
        price: fields.price,
        salePrice: fields.salePrice ?? null,
        stock: fields.stock ?? 0,
        status: 'active',
        isFeatured: Boolean(fields.isFeatured),
        ratingAverage: fields.ratingAverage ?? 0,
        ratingCount: fields.ratingCount ?? 0,
        unitsSold: fields.unitsSold ?? 0,
        createdAt,
        updatedAt: createdAt,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productSpecification.deleteMany({ where: { productId: id } });

    const imageRows = imageCreates(id, images);
    if (imageRows.length > 0) {
      await prisma.productImage.createMany({ data: imageRows });
    }

    if (specifications.length > 0) {
      await prisma.productSpecification.createMany({
        data: specifications.map((spec, position) => ({
          productId: id,
          key: spec.key,
          value: spec.value,
          position,
        })),
      });
    }
  }

  const [categoryCount, productCount, imageCount] = await Promise.all([
    prisma.category.count({ where: { status: 'active' } }),
    prisma.product.count({ where: { status: 'active' } }),
    prisma.productImage.count(),
  ]);

  console.log(
    `Prisma catalogue seed complete: ${categoryCount} active categories, ${productCount} active products, ${imageCount} product images.`,
  );
}

seed()
  .catch((error) => {
    const masked = String(error.message || '').replace(/postgresql:\/\/[^@\s]+@/gi, 'postgresql://***@');
    console.error(`Prisma catalogue seed failed: ${masked}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
