const FORBIDDEN_KEY = /^\$|\./;

/**
 * Strips MongoDB operator keys ($gt, $where, dotted paths) out of user input so
 * a raw body cannot be reinterpreted as a query operator.
 *
 * Written in-repo rather than using express-mongo-sanitize: that package
 * reassigns `req.query`, which is a getter in Express 5 and throws.
 */
function scrub(value) {
  if (Array.isArray(value)) return value.map(scrub);

  if (value === null || typeof value !== 'object') return value;

  const clean = {};
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEY.test(key)) continue;
    clean[key] = scrub(nested);
  }
  return clean;
}

export function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = scrub(req.body);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = scrub(req.params);
  }

  // req.query is a lazily-computed getter in Express 5, so it is redefined
  // rather than assigned.
  if (req.query && typeof req.query === 'object') {
    const cleanQuery = scrub(req.query);
    Object.defineProperty(req, 'query', {
      value: cleanQuery,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  next();
}
