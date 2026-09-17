import { prisma } from '../config/prisma.js';
import { newHexId } from '../utils/hexId.js';

export const cartProductInclude = {
  category: { select: { id: true, name: true, slug: true, status: true } },
  images: { orderBy: { position: 'asc' } },
  specifications: { orderBy: { position: 'asc' } },
};

const cartWithItemsInclude = {
  items: {
    orderBy: { position: 'asc' },
    include: {
      product: { include: cartProductInclude },
    },
  },
};

export async function findProductForCart(productId) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: cartProductInclude,
  });
}

export async function loadCartWithItems(userId) {
  return prisma.cart.findUnique({
    where: { userId },
    include: cartWithItemsInclude,
  });
}

export async function getOrCreateCart(userId) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;

  try {
    return await prisma.cart.create({
      data: { id: newHexId(), userId },
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      return prisma.cart.findUnique({ where: { userId } });
    }
    throw error;
  }
}

export async function findCartItem(cartId, productId) {
  return prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
  });
}

async function nextPosition(cartId) {
  const aggregate = await prisma.cartItem.aggregate({
    where: { cartId },
    _max: { position: true },
  });
  return (aggregate._max.position ?? -1) + 1;
}

export async function upsertCartItem(cartId, productId, { quantity, priceSnapshot }) {
  const existing = await findCartItem(cartId, productId);
  if (existing) {
    return prisma.cartItem.update({
      where: { cartId_productId: { cartId, productId } },
      data: { quantity, priceSnapshot },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId,
      productId,
      quantity,
      priceSnapshot,
      position: await nextPosition(cartId),
    },
  });
}

export async function deleteCartItem(cartId, productId) {
  const existing = await findCartItem(cartId, productId);
  if (!existing) return false;
  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId, productId } },
  });
  return true;
}

export async function deleteAllCartItems(cartId) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
}
