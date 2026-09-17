import mongoose from 'mongoose';

import '../config/dns.js';
import { env, isProduction } from '../config/env.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { slugify } from '../utils/slugify.js';
import { seedCategories, seedProducts } from './catalogueData.js';

if (isProduction) {
  console.error('Refusing to seed the catalogue in production.');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });

  const categoriesBySlug = {};

  for (const item of seedCategories) {
    const category = await Category.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          image: item.image,
          status: 'active',
          displayOrder: item.displayOrder,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    categoriesBySlug[item.slug] = category;
  }

  for (const item of seedProducts) {
    const category = categoriesBySlug[item.categorySlug];
    if (!category) {
      throw new Error(`Seed category missing: ${item.categorySlug}`);
    }

    const { categorySlug: _categorySlug, createdAt, ...fields } = item;

    await Product.findOneAndUpdate(
      { sku: fields.sku },
      {
        $set: {
          ...fields,
          slug: slugify(fields.name),
          category: category._id,
          images: [],
          status: 'active',
          createdAt,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, timestamps: false },
    );
  }

  const [categoryCount, productCount] = await Promise.all([
    Category.countDocuments({ status: 'active' }),
    Product.countDocuments({ status: 'active' }),
  ]);

  console.log(`Catalogue seed complete: ${categoryCount} active categories, ${productCount} active products.`);
}

seed()
  .catch((error) => {
    console.error(`Catalogue seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
