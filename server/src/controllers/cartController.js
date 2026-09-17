import { emptyCartDto, toCartDto } from '../serializers/cart.js';
import {
  deleteAllCartItems,
  deleteCartItem,
  findCartItem,
  findProductForCart,
  getOrCreateCart,
  loadCartWithItems,
  upsertCartItem,
} from '../services/cartStore.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import { MAX_CART_QUANTITY } from '../utils/storeRules.js';

function liveUnitPrice(product) {
  return product.salePrice ?? product.price;
}

function assertPurchasable(product) {
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  if (product.status !== 'active') {
    throw ApiError.unprocessable('This product is not available', {
      details: { productId: 'inactive' },
    });
  }
  if (product.category?.status === 'inactive') {
    throw ApiError.unprocessable('This product is not available', {
      details: { productId: 'inactive' },
    });
  }
  if ((product.stock ?? 0) <= 0) {
    throw ApiError.unprocessable('This product is out of stock', {
      details: { productId: 'out-of-stock' },
    });
  }
}

function assertQuantityAgainstStock(quantity, stock) {
  if (quantity > stock) {
    throw ApiError.unprocessable('Requested quantity exceeds available stock', {
      details: { quantity: `Only ${stock} available` },
    });
  }
  if (quantity > MAX_CART_QUANTITY) {
    throw ApiError.unprocessable(`Quantity cannot exceed ${MAX_CART_QUANTITY}`, {
      details: { quantity: `Maximum ${MAX_CART_QUANTITY} per item` },
    });
  }
}

async function loadPurchasableProduct(productId) {
  const product = await findProductForCart(productId);
  assertPurchasable(product);
  return product;
}

async function loadCartDto(userId) {
  const cart = await loadCartWithItems(userId);
  if (!cart) return emptyCartDto();
  return toCartDto(cart);
}

export const getCart = asyncHandler(async (req, res) => {
  const data = await loadCartDto(req.user.id);
  return sendResponse(res, { message: 'Cart', data });
});

export const addCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await loadPurchasableProduct(productId);
  const cart = await getOrCreateCart(req.user.id);
  const existing = await findCartItem(cart.id, productId);
  const nextQuantity = (existing?.quantity ?? 0) + quantity;

  assertQuantityAgainstStock(nextQuantity, product.stock);
  await upsertCartItem(cart.id, productId, {
    quantity: nextQuantity,
    priceSnapshot: liveUnitPrice(product),
  });

  return sendResponse(res, { message: 'Cart updated', data: await loadCartDto(req.user.id) });
});

export const replaceCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const product = await loadPurchasableProduct(productId);
  const cart = await getOrCreateCart(req.user.id);
  const existing = await findCartItem(cart.id, productId);

  if (!existing) {
    throw ApiError.notFound('Item is not in your cart');
  }

  assertQuantityAgainstStock(quantity, product.stock);
  await upsertCartItem(cart.id, productId, {
    quantity,
    priceSnapshot: liveUnitPrice(product),
  });

  return sendResponse(res, { message: 'Cart updated', data: await loadCartDto(req.user.id) });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user.id);
  await deleteCartItem(cart.id, productId);
  return sendResponse(res, { message: 'Item removed', data: await loadCartDto(req.user.id) });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await deleteAllCartItems(cart.id);
  return sendResponse(res, { message: 'Cart cleared', data: emptyCartDto() });
});
