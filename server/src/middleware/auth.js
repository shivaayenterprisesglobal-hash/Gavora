import jwt from 'jsonwebtoken';

import { ACCESS_COOKIE } from '../config/cookies.js';
import { findActiveUserForAuth } from '../services/userStore.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken, wasIssuedBeforePasswordChange } from '../utils/tokens.js';

function readAccessToken(req) {
  const cookieToken = req.cookies?.[ACCESS_COOKIE];
  if (typeof cookieToken === 'string' && cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  return null;
}

/**
 * Verifies the access cookie (or Bearer token for non-browser tools), then
 * loads the user from PostgreSQL. Role always comes from the database, never
 * from a client-supplied claim.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = readAccessToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Authentication token has expired');
    }
    throw ApiError.unauthorized('Invalid or expired authentication token');
  }

  const id = payload.sub ?? payload.id;
  if (!id) {
    throw ApiError.unauthorized('Invalid authentication token');
  }

  const user = await findActiveUserForAuth(id);
  if (!user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (wasIssuedBeforePasswordChange(payload, user.passwordChangedAt)) {
    throw ApiError.unauthorized('Authentication required');
  }

  req.user = {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  return next();
});

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    return next();
  };
}

export const requireAdmin = [requireAuth, requireRole('admin')];

export const requireCustomer = [requireAuth, requireRole('customer')];
