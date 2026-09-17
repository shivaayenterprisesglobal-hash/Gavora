/**
 * Forwards rejected promises from async route handlers to Express's error
 * middleware. Express 5 does this natively; the wrapper keeps handler intent
 * obvious and stays safe if a route is ever mounted on an older adapter.
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
