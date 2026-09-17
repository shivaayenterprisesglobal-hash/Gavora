import { sampleReviews } from '@/data/reviews';
import api from '@/lib/api';

/**
 * Catalogue data access — the only module storefront pages use to read products
 * and categories. All catalogue reads go through the REST API.
 *
 * Demo/fixture files in `src/data` are not used here (except sample reviews,
 * which remain labelled as sample layout until the reviews phase).
 */

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'best-selling', label: 'Best selling' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All products' },
  { value: 'in-stock', label: 'In stock only' },
  { value: 'on-sale', label: 'On sale' },
];

export const DEFAULT_PAGE_SIZE = 12;

/** The price a customer actually pays, mirroring the model's virtual. */
export function effectivePrice(product) {
  return product.salePrice ?? product.price;
}

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
}

function unwrap(response) {
  return response.data.data;
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function isNotFound(error) {
  return error?.status === 404;
}

export async function listCategories() {
  const response = await api.get('/categories');
  return asList(unwrap(response));
}

/** Public storefront identity. Contact fields may be empty until configured. */
export async function getStoreIdentity() {
  const response = await api.get('/store');
  return unwrap(response);
}

export async function getCategoryBySlug(slug) {
  try {
    const response = await api.get(`/categories/${encodeURIComponent(slug)}`);
    return unwrap(response);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function getPriceBounds() {
  const response = await api.get('/products', { params: { limit: 1 } });
  return response.data.meta?.priceBounds ?? { min: 0, max: 0 };
}

/**
 * Paginated, filtered product list.
 *
 * @returns {Promise<{items: object[], total: number, page: number, pageSize: number, totalPages: number}>}
 */
export async function listProducts({
  q = '',
  category = '',
  minPrice,
  maxPrice,
  availability = 'all',
  sort = 'relevance',
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const response = await api.get('/products', {
    params: compactParams({
      q,
      category,
      minPrice,
      maxPrice,
      availability,
      sort,
      page,
      limit: pageSize,
    }),
  });

  const meta = response.data.meta ?? {};
  return {
    items: asList(unwrap(response)),
    total: meta.total ?? 0,
    page: meta.page ?? page,
    pageSize: meta.pageSize ?? pageSize,
    totalPages: meta.totalPages ?? 1,
  };
}

export async function getProductBySlug(slug) {
  try {
    const response = await api.get(`/products/${encodeURIComponent(slug)}`);
    return unwrap(response);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function getProductById(id) {
  return getProductBySlug(id);
}

export async function getFeaturedProducts(limit = 8) {
  const response = await api.get('/products/featured', { params: { limit } });
  return asList(unwrap(response));
}

export async function getBestSellers(limit = 8) {
  const response = await api.get('/products/best-sellers', { params: { limit } });
  return asList(unwrap(response));
}

export async function getNewArrivals(limit = 8) {
  const listing = await listProducts({ sort: 'newest', pageSize: limit });
  return listing.items;
}

export async function getRelatedProducts(slug, limit = 4) {
  try {
    const response = await api.get(`/products/${encodeURIComponent(slug)}/related`, {
      params: { limit },
    });
    return asList(unwrap(response));
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
}

export async function searchSuggestions(query, limit = 6) {
  if (!query || query.trim().length < 2) return [];

  const listing = await listProducts({ q: query.trim(), pageSize: limit, sort: 'relevance' });
  return listing.items.map(({ _id, name, slug, category }) => ({ _id, name, slug, category }));
}

export async function getSampleReviews() {
  return sampleReviews;
}
