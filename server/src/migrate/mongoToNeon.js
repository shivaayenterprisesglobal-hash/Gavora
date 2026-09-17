/**
 * One-way MongoDB → Neon PostgreSQL import.
 *
 * Default: plan/count only (no writes).
 * Writes:  node --env-file-if-exists=.env src/migrate/mongoToNeon.js --execute
 *
 * Never deletes MongoDB data. Does not switch the live API.
 */
import '../config/dns.js';

import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { Cart } from '../models/Cart.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Product } from '../models/Product.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { User } from '../models/User.js';
import {
  ADDRESS_LABELS,
  CATEGORY_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  PRODUCT_STATUSES,
  USER_ROLES,
} from '../models/constants.js';

const HEX_ID = /^[a-fA-F0-9]{24}$/;
const EXECUTE = process.argv.includes('--execute');

const prisma = new PrismaClient();

function oid(value, label) {
  if (value == null || value === '') {
    throw new Error(`${label} is missing`);
  }
  const id = String(value);
  if (!HEX_ID.test(id)) {
    throw new Error(`${label} is not a 24-character hex id`);
  }
  return id;
}

function optionalOid(value, label) {
  if (value == null || value === '') return null;
  return oid(value, label);
}

function asDate(value, label) {
  if (!value) {
    throw new Error(`${label} is missing`);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} is not a valid date`);
  }
  return date;
}

function optionalDate(value, label) {
  if (value == null) return null;
  return asDate(value, label);
}

function asInt(value, label, { allowNull = false } = {}) {
  if (value == null) {
    if (allowNull) return null;
    throw new Error(`${label} is required`);
  }
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`);
  }
  return value;
}

function asString(value, { fallback } = {}) {
  if (value == null) {
    return fallback === undefined ? null : fallback;
  }
  return String(value);
}

function asEnum(value, allowed, label, fallback) {
  if (value == null || value === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`${label} is required`);
  }
  if (!allowed.includes(value)) {
    throw new Error(`${label} has an unsupported value`);
  }
  return value;
}

async function mongoCounts() {
  const [users, categories, products, carts, orders, payments, storeSettings] = await Promise.all([
    User.countDocuments(),
    Category.countDocuments(),
    Product.countDocuments(),
    Cart.countDocuments(),
    Order.countDocuments(),
    Payment.countDocuments(),
    StoreSettings.countDocuments(),
  ]);

  const [addressAgg, imageAgg, specAgg, cartItemAgg, orderItemAgg, statusAgg] = await Promise.all([
    User.aggregate([{ $unwind: { path: '$addresses', preserveNullAndEmptyArrays: false } }, { $count: 'n' }]),
    Product.aggregate([{ $unwind: { path: '$images', preserveNullAndEmptyArrays: false } }, { $count: 'n' }]),
    Product.aggregate([{ $unwind: { path: '$specifications', preserveNullAndEmptyArrays: false } }, { $count: 'n' }]),
    Cart.aggregate([{ $unwind: { path: '$items', preserveNullAndEmptyArrays: false } }, { $count: 'n' }]),
    Order.aggregate([{ $unwind: { path: '$items', preserveNullAndEmptyArrays: false } }, { $count: 'n' }]),
    Order.aggregate([{ $unwind: { path: '$statusHistory', preserveNullAndEmptyArrays: false } }, { $count: 'n' }]),
  ]);

  const ordersWithAddress = await Order.countDocuments({ address: { $ne: null } });

  return {
    users,
    addresses: addressAgg[0]?.n ?? 0,
    categories,
    products,
    productImages: imageAgg[0]?.n ?? 0,
    productSpecifications: specAgg[0]?.n ?? 0,
    carts,
    cartItems: cartItemAgg[0]?.n ?? 0,
    orders,
    orderItems: orderItemAgg[0]?.n ?? 0,
    orderAddresses: ordersWithAddress,
    orderStatusEvents: statusAgg[0]?.n ?? 0,
    payments,
    storeSettings,
  };
}

async function neonCounts() {
  const [
    users,
    addresses,
    categories,
    products,
    productImages,
    productSpecifications,
    carts,
    cartItems,
    orders,
    orderItems,
    orderAddresses,
    orderStatusEvents,
    payments,
    storeSettings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.address.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productImage.count(),
    prisma.productSpecification.count(),
    prisma.cart.count(),
    prisma.cartItem.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.orderAddress.count(),
    prisma.orderStatusEvent.count(),
    prisma.payment.count(),
    prisma.storeSettings.count(),
  ]);

  return {
    users,
    addresses,
    categories,
    products,
    productImages,
    productSpecifications,
    carts,
    cartItems,
    orders,
    orderItems,
    orderAddresses,
    orderStatusEvents,
    payments,
    storeSettings,
  };
}

async function inspectAdmin() {
  const admins = await User.find({ role: 'admin' })
    .select('+passwordHash name role isActive')
    .lean();

  return {
    count: admins.length,
    activeCount: admins.filter((user) => user.isActive !== false).length,
    hashesPresent: admins.filter((user) => Boolean(user.passwordHash)).length,
  };
}

function mapCategory(doc) {
  return {
    id: oid(doc._id, 'category.id'),
    name: asString(doc.name),
    slug: asString(doc.slug),
    description: asString(doc.description, { fallback: '' }),
    imageUrl: asString(doc.image?.url, { fallback: '' }),
    imageAlt: asString(doc.image?.alt, { fallback: '' }),
    status: asEnum(doc.status, CATEGORY_STATUSES, 'category.status', 'active'),
    displayOrder: asInt(doc.displayOrder ?? 0, 'category.displayOrder'),
    createdAt: asDate(doc.createdAt, 'category.createdAt'),
    updatedAt: asDate(doc.updatedAt, 'category.updatedAt'),
  };
}

function mapProduct(doc, categoryIds) {
  const categoryId = oid(doc.category, 'product.category');
  if (!categoryIds.has(categoryId)) {
    throw new Error('product.category does not match a migrated category');
  }

  return {
    id: oid(doc._id, 'product.id'),
    name: asString(doc.name),
    slug: asString(doc.slug),
    sku: asString(doc.sku),
    description: asString(doc.description, { fallback: '' }),
    shortDescription: asString(doc.shortDescription, { fallback: '' }),
    categoryId,
    brand: asString(doc.brand, { fallback: '' }),
    price: asInt(doc.price, 'product.price'),
    salePrice: asInt(doc.salePrice, 'product.salePrice', { allowNull: true }),
    stock: asInt(doc.stock ?? 0, 'product.stock'),
    lowStockThreshold: asInt(doc.lowStockThreshold ?? 5, 'product.lowStockThreshold'),
    status: asEnum(doc.status, PRODUCT_STATUSES, 'product.status', 'draft'),
    isFeatured: Boolean(doc.isFeatured),
    ratingAverage: typeof doc.ratingAverage === 'number' ? doc.ratingAverage : 0,
    ratingCount: asInt(doc.ratingCount ?? 0, 'product.ratingCount'),
    unitsSold: asInt(doc.unitsSold ?? 0, 'product.unitsSold'),
    createdAt: asDate(doc.createdAt, 'product.createdAt'),
    updatedAt: asDate(doc.updatedAt, 'product.updatedAt'),
    images: (doc.images ?? []).map((image, position) => ({
      productId: oid(doc._id, 'product.id'),
      url: asString(image.url),
      alt: asString(image.alt, { fallback: '' }),
      isPrimary: Boolean(image.isPrimary),
      position,
    })),
    specifications: (doc.specifications ?? []).map((spec, position) => ({
      productId: oid(doc._id, 'product.id'),
      key: asString(spec.key),
      value: asString(spec.value),
      position,
    })),
  };
}

function mapUser(doc) {
  return {
    id: oid(doc._id, 'user.id'),
    name: asString(doc.name),
    email: asString(doc.email),
    phone: asString(doc.phone),
    passwordHash: asString(doc.passwordHash),
    role: asEnum(doc.role, USER_ROLES, 'user.role', 'customer'),
    isActive: doc.isActive !== false,
    lastLoginAt: optionalDate(doc.lastLoginAt, 'user.lastLoginAt'),
    passwordChangedAt: optionalDate(doc.passwordChangedAt, 'user.passwordChangedAt'),
    createdAt: asDate(doc.createdAt, 'user.createdAt'),
    updatedAt: asDate(doc.updatedAt, 'user.updatedAt'),
    addresses: (doc.addresses ?? []).map((address) => ({
      id: oid(address._id, 'address.id'),
      userId: oid(doc._id, 'user.id'),
      label: asEnum(address.label, ADDRESS_LABELS, 'address.label', 'home'),
      fullName: asString(address.fullName),
      phone: asString(address.phone),
      line1: asString(address.line1),
      line2: asString(address.line2, { fallback: '' }),
      landmark: asString(address.landmark, { fallback: '' }),
      city: asString(address.city),
      state: asString(address.state),
      pincode: asString(address.pincode),
      country: asString(address.country, { fallback: 'India' }),
      isDefault: Boolean(address.isDefault),
      createdAt: asDate(address.createdAt, 'address.createdAt'),
      updatedAt: asDate(address.updatedAt, 'address.updatedAt'),
    })),
  };
}

function mapOrder(doc, userIds, productIds) {
  const customerId = oid(doc.customer, 'order.customer');
  if (!userIds.has(customerId)) {
    throw new Error('order.customer does not match a migrated user');
  }
  if (!doc.address) {
    throw new Error('order.address is missing');
  }

  const items = (doc.items ?? []).map((item, position) => {
    const productId = oid(item.product, 'orderItem.product');
    if (!productIds.has(productId)) {
      throw new Error('orderItem.product does not match a migrated product');
    }
    return {
      orderId: oid(doc._id, 'order.id'),
      productId,
      name: asString(item.name),
      sku: asString(item.sku),
      image: asString(item.image, { fallback: '' }),
      unitPrice: asInt(item.unitPrice, 'orderItem.unitPrice'),
      quantity: asInt(item.quantity, 'orderItem.quantity'),
      lineTotal: asInt(item.lineTotal, 'orderItem.lineTotal'),
      position,
    };
  });

  if (items.length === 0) {
    throw new Error('order.items is empty');
  }

  return {
    id: oid(doc._id, 'order.id'),
    orderNumber: asString(doc.orderNumber),
    customerId,
    contactEmail: asString(doc.contactEmail),
    subtotal: asInt(doc.subtotal, 'order.subtotal'),
    discount: asInt(doc.discount ?? 0, 'order.discount'),
    shipping: asInt(doc.shipping ?? 0, 'order.shipping'),
    total: asInt(doc.total, 'order.total'),
    currency: asString(doc.currency, { fallback: 'INR' }),
    paymentMethod: asEnum(doc.paymentMethod, PAYMENT_METHODS, 'order.paymentMethod'),
    paymentStatus: asEnum(doc.paymentStatus, PAYMENT_STATUSES, 'order.paymentStatus', 'pending'),
    paymentReference: asString(doc.paymentReference),
    orderStatus: asEnum(doc.orderStatus, ORDER_STATUSES, 'order.orderStatus', 'pending'),
    customerNote: asString(doc.customerNote, { fallback: '' }),
    cancelledAt: optionalDate(doc.cancelledAt, 'order.cancelledAt'),
    deliveredAt: optionalDate(doc.deliveredAt, 'order.deliveredAt'),
    createdAt: asDate(doc.createdAt, 'order.createdAt'),
    updatedAt: asDate(doc.updatedAt, 'order.updatedAt'),
    items,
    address: {
      orderId: oid(doc._id, 'order.id'),
      fullName: asString(doc.address.fullName),
      phone: asString(doc.address.phone),
      line1: asString(doc.address.line1),
      line2: asString(doc.address.line2, { fallback: '' }),
      landmark: asString(doc.address.landmark, { fallback: '' }),
      city: asString(doc.address.city),
      state: asString(doc.address.state),
      pincode: asString(doc.address.pincode),
      country: asString(doc.address.country, { fallback: 'India' }),
    },
    statusHistory: (doc.statusHistory ?? []).map((event, position) => ({
      orderId: oid(doc._id, 'order.id'),
      status: asEnum(event.status, ORDER_STATUSES, 'orderStatusEvent.status'),
      note: asString(event.note, { fallback: '' }),
      changedById: optionalOid(event.changedBy, 'orderStatusEvent.changedBy'),
      changedAt: event.changedAt ? asDate(event.changedAt, 'orderStatusEvent.changedAt') : asDate(doc.createdAt, 'order.createdAt'),
      position,
    })),
  };
}

function mapCart(doc, userIds, productIds, orderIds) {
  const userId = oid(doc.user, 'cart.user');
  if (!userIds.has(userId)) {
    throw new Error('cart.user does not match a migrated user');
  }

  const lastOrderId = optionalOid(doc.lastOrder, 'cart.lastOrder');
  if (lastOrderId && !orderIds.has(lastOrderId)) {
    throw new Error('cart.lastOrder does not match a migrated order');
  }

  const seenProducts = new Set();
  const items = (doc.items ?? []).map((item, position) => {
    const productId = oid(item.product, 'cartItem.product');
    if (!productIds.has(productId)) {
      throw new Error('cartItem.product does not match a migrated product');
    }
    if (seenProducts.has(productId)) {
      throw new Error('cart contains duplicate product lines');
    }
    seenProducts.add(productId);
    return {
      cartId: oid(doc._id, 'cart.id'),
      productId,
      quantity: asInt(item.quantity, 'cartItem.quantity'),
      priceSnapshot: asInt(item.priceSnapshot, 'cartItem.priceSnapshot'),
      position,
    };
  });

  return {
    id: oid(doc._id, 'cart.id'),
    userId,
    lastCheckoutKey: asString(doc.lastCheckoutKey),
    lastOrderId,
    checkoutLock: Boolean(doc.checkoutLock),
    checkoutLockAt: optionalDate(doc.checkoutLockAt, 'cart.checkoutLockAt'),
    createdAt: asDate(doc.createdAt, 'cart.createdAt'),
    updatedAt: asDate(doc.updatedAt, 'cart.updatedAt'),
    items,
  };
}

function mapPayment(doc, orderIds) {
  const orderId = oid(doc.order, 'payment.order');
  if (!orderIds.has(orderId)) {
    throw new Error('payment.order does not match a migrated order');
  }

  return {
    id: oid(doc._id, 'payment.id'),
    orderId,
    provider: asEnum(doc.provider, PAYMENT_PROVIDERS, 'payment.provider'),
    paymentId: asString(doc.paymentId),
    providerOrderId: asString(doc.providerOrderId),
    signature: asString(doc.signature),
    amount: asInt(doc.amount, 'payment.amount'),
    currency: asString(doc.currency, { fallback: 'INR' }),
    status: asEnum(doc.status, PAYMENT_STATUSES, 'payment.status', 'pending'),
    failureReason: asString(doc.failureReason),
    refundId: asString(doc.refundId),
    refundedAmount: asInt(doc.refundedAmount ?? 0, 'payment.refundedAmount'),
    providerResponse: doc.providerResponse ?? null,
    createdAt: asDate(doc.createdAt, 'payment.createdAt'),
    updatedAt: asDate(doc.updatedAt, 'payment.updatedAt'),
  };
}

function mapStoreSettings(doc) {
  return {
    id: oid(doc._id, 'storeSettings.id'),
    storeName: asString(doc.storeName, { fallback: 'Gavora' }),
    logoUrl: asString(doc.logoUrl, { fallback: '' }),
    description: asString(doc.description, { fallback: '' }),
    contactEmail: asString(doc.contactEmail, { fallback: '' }),
    contactPhone: asString(doc.contactPhone, { fallback: '' }),
    createdAt: asDate(doc.createdAt, 'storeSettings.createdAt'),
    updatedAt: asDate(doc.updatedAt, 'storeSettings.updatedAt'),
  };
}

async function loadMongo() {
  const [categories, products, users, orders, carts, payments, storeSettings] = await Promise.all([
    Category.find().lean(),
    Product.find().lean(),
    User.find().select('+passwordHash +passwordChangedAt').lean(),
    Order.find().lean(),
    Cart.find().lean(),
    Payment.find().select('+signature +providerResponse').lean(),
    StoreSettings.find().lean(),
  ]);

  return { categories, products, users, orders, carts, payments, storeSettings };
}

function buildPlan(mongo) {
  const categories = mongo.categories.map(mapCategory);
  const categoryIds = new Set(categories.map((item) => item.id));
  const products = mongo.products.map((doc) => mapProduct(doc, categoryIds));
  const productIds = new Set(products.map((item) => item.id));
  const users = mongo.users.map(mapUser);
  const userIds = new Set(users.map((item) => item.id));

  for (const user of users) {
    if (!user.passwordHash) {
      throw new Error('user.passwordHash is missing');
    }
  }

  const orders = mongo.orders.map((doc) => mapOrder(doc, userIds, productIds));
  const orderIds = new Set(orders.map((item) => item.id));
  const carts = mongo.carts.map((doc) => mapCart(doc, userIds, productIds, orderIds));
  const payments = mongo.payments.map((doc) => mapPayment(doc, orderIds));
  const storeSettings = mongo.storeSettings.map(mapStoreSettings);

  const uniqueOrThrow = (values, label) => {
    const seen = new Set();
    for (const value of values) {
      if (value == null || value === '') continue;
      if (seen.has(value)) throw new Error(`duplicate ${label}`);
      seen.add(value);
    }
  };
  uniqueOrThrow(users.map((item) => item.email), 'user.email');
  uniqueOrThrow(categories.map((item) => item.slug), 'category.slug');
  uniqueOrThrow(products.map((item) => item.slug), 'product.slug');
  uniqueOrThrow(products.map((item) => item.sku), 'product.sku');
  uniqueOrThrow(orders.map((item) => item.orderNumber), 'order.orderNumber');
  uniqueOrThrow(users.map((item) => item.id), 'user.id');
  uniqueOrThrow(
    users.flatMap((user) => user.addresses.map((address) => address.id)),
    'address.id',
  );

  for (const event of orders.flatMap((order) => order.statusHistory)) {
    if (event.changedById && !userIds.has(event.changedById)) {
      throw new Error('orderStatusEvent.changedBy does not match a migrated user');
    }
  }

  return {
    categories,
    products,
    users,
    orders,
    carts,
    payments,
    storeSettings,
    planned: {
      users: users.length,
      addresses: users.reduce((sum, user) => sum + user.addresses.length, 0),
      categories: categories.length,
      products: products.length,
      productImages: products.reduce((sum, product) => sum + product.images.length, 0),
      productSpecifications: products.reduce((sum, product) => sum + product.specifications.length, 0),
      carts: carts.length,
      cartItems: carts.reduce((sum, cart) => sum + cart.items.length, 0),
      orders: orders.length,
      orderItems: orders.reduce((sum, order) => sum + order.items.length, 0),
      orderAddresses: orders.length,
      orderStatusEvents: orders.reduce((sum, order) => sum + order.statusHistory.length, 0),
      payments: payments.length,
      storeSettings: storeSettings.length,
    },
  };
}

async function upsertParent(tx, delegate, data) {
  const { id, ...fields } = data;
  await delegate.upsert({
    where: { id },
    create: { id, ...fields },
    update: fields,
  });
}

async function execute(plan) {
  await prisma.$transaction(
    async (tx) => {
      for (const category of plan.categories) {
        await upsertParent(tx, tx.category, category);
      }

      for (const product of plan.products) {
        const { images, specifications, ...fields } = product;
        await upsertParent(tx, tx.product, fields);
        await tx.productImage.deleteMany({ where: { productId: product.id } });
        if (images.length) await tx.productImage.createMany({ data: images });
        await tx.productSpecification.deleteMany({ where: { productId: product.id } });
        if (specifications.length) await tx.productSpecification.createMany({ data: specifications });
      }

      for (const user of plan.users) {
        const { addresses, ...fields } = user;
        await upsertParent(tx, tx.user, fields);
        const keepIds = addresses.map((address) => address.id);
        await tx.address.deleteMany({
          where: { userId: user.id, id: { notIn: keepIds } },
        });
        for (const address of addresses) {
          await upsertParent(tx, tx.address, address);
        }
      }

      for (const order of plan.orders) {
        const { items, address, statusHistory, ...fields } = order;
        await upsertParent(tx, tx.order, fields);
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        if (items.length) await tx.orderItem.createMany({ data: items });
        await tx.orderStatusEvent.deleteMany({ where: { orderId: order.id } });
        if (statusHistory.length) await tx.orderStatusEvent.createMany({ data: statusHistory });
        await tx.orderAddress.upsert({
          where: { orderId: order.id },
          create: address,
          update: address,
        });
      }

      for (const cart of plan.carts) {
        const { items, ...fields } = cart;
        await upsertParent(tx, tx.cart, fields);
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        if (items.length) await tx.cartItem.createMany({ data: items });
      }

      for (const payment of plan.payments) {
        await upsertParent(tx, tx.payment, payment);
      }

      for (const settings of plan.storeSettings) {
        await upsertParent(tx, tx.storeSettings, settings);
      }
    },
    { timeout: 120000, maxWait: 20000 },
  );
}

function report(payload) {
  console.log(JSON.stringify(payload, null, 2));
}

async function main() {
  const mongoShape = (() => {
    const raw = env.MONGO_URI;
    const url = new URL(raw);
    return {
      protocol: url.protocol.replace(':', ''),
      isAtlas: url.protocol === 'mongodb+srv:',
      isLocal: /^(127\.0\.0\.1|localhost)$/i.test(url.hostname),
      database: (url.pathname || '').replace(/^\//, '') || '(default)',
    };
  })();

  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });

  const [fromMongo, fromNeon, admin] = await Promise.all([mongoCounts(), neonCounts(), inspectAdmin()]);
  const mongoDocs = await loadMongo();
  const plan = buildPlan(mongoDocs);

  const payload = {
    mode: EXECUTE ? 'execute' : 'plan',
    mongoConnection: mongoShape,
    mongo: fromMongo,
    neon: fromNeon,
    planned: plan.planned,
    admin,
    wroteToNeon: false,
  };

  if (!EXECUTE) {
    report(payload);
    return;
  }

  await execute(plan);
  payload.wroteToNeon = true;
  payload.neonAfter = await neonCounts();
  report(payload);
}

main()
  .catch((error) => {
    const masked = String(error.message || '').replace(
      /(mongodb(\+srv)?|postgresql):\/\/[^@\s]+@/gi,
      '$1://***@',
    );
    console.error(`Migration failed: ${masked}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([prisma.$disconnect(), mongoose.disconnect()]);
  });
