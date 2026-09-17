import { AVAILABILITY_OPTIONS, SORT_OPTIONS } from '@/lib/catalog';

const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value));
const AVAILABILITY_VALUES = new Set(AVAILABILITY_OPTIONS.map((option) => option.value));

/**
 * Reads the shop listing state out of the URL.
 *
 * Filters live in the query string rather than in component state so they are
 * shareable, survive a refresh, and can be set from the homepage category tiles
 * without any extra plumbing.
 */
export function parseShopSearch(searchParams) {
  const min = searchParams.get('minPrice');
  const max = searchParams.get('maxPrice');
  const page = Number(searchParams.get('page'));
  const sort = searchParams.get('sort');
  const availability = searchParams.get('availability');

  return {
    q: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
    minPrice: min === null || min === '' ? undefined : Number(min),
    maxPrice: max === null || max === '' ? undefined : Number(max),
    availability: AVAILABILITY_VALUES.has(availability) ? availability : 'all',
    sort: SORT_VALUES.has(sort) ? sort : 'relevance',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/**
 * Merges a partial update into the current search params.
 *
 * Empty values are deleted rather than stored as blank strings, so the URL
 * stays readable. Changing any filter other than `page` resets pagination to
 * page 1 — staying on page 4 of a now-smaller result set is a common trap.
 */
export function mergeShopSearch(searchParams, patch) {
  const next = new URLSearchParams(searchParams);

  for (const [key, value] of Object.entries(patch)) {
    const empty =
      value === undefined ||
      value === null ||
      value === '' ||
      (key === 'availability' && value === 'all') ||
      (key === 'sort' && value === 'relevance') ||
      (key === 'page' && value === 1);

    if (empty) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }

  if (!Object.hasOwn(patch, 'page')) {
    next.delete('page');
  }

  return next;
}
