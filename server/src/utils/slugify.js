/** URL-safe slug: lowercase, ASCII, hyphen-separated. */
export function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Appends a short random suffix, for resolving slug collisions. */
export function uniqueSlug(value) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugify(value)}-${suffix}`;
}
