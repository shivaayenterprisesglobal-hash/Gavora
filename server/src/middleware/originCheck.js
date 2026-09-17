import { isAllowedOrigin } from '../config/cors.js';
import { ApiError } from '../utils/ApiError.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function requestOrigin(req) {
  const origin = req.get('origin');
  if (origin) return origin;

  const referer = req.get('referer');
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Companion to CORS + SameSite cookies. Browser mutating requests must come
 * from an allowed origin so a third-party site cannot POST a login or change
 * an account. Tools without Origin/Referer (curl) are allowed so the API
 * remains usable outside a browser.
 */
export function verifyRequestOrigin(req, _res, next) {
  if (!MUTATING.has(req.method)) return next();

  const origin = requestOrigin(req);
  if (!origin) return next();

  if (isAllowedOrigin(origin)) return next();

  return next(ApiError.forbidden('Origin is not allowed'));
}
