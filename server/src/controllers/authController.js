import { toSafeUser } from '../serializers/user.js';
import {
  createCustomer,
  findUserByEmail,
  findUserById,
  findActiveUserForAuth,
  isEmailConflict,
  touchLastLogin,
} from '../services/userStore.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookies, setAuthCookies } from '../utils/authCookies.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { sendCreated, sendResponse } from '../utils/sendResponse.js';
import { verifyRefreshToken, wasIssuedBeforePasswordChange } from '../utils/tokens.js';
import { REFRESH_COOKIE } from '../config/cookies.js';

const INVALID_CREDENTIALS = 'Invalid email or password';

async function authenticate(email, password, { adminOnly = false } = {}) {
  const user = await findUserByEmail(email, { withPassword: true });
  const matches = await verifyPassword(password, user?.passwordHash);

  if (!user || !user.isActive || !matches) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  if (adminOnly && user.role !== 'admin') {
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  return touchLastLogin(user.id);
}

export const signup = asyncHandler(async (req, res) => {
  const existing = await findUserByEmail(req.body.email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists', {
      details: { email: 'already in use' },
    });
  }

  const passwordHash = await hashPassword(req.body.password);
  let user;
  try {
    user = await createCustomer({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      passwordHash,
    });
  } catch (error) {
    if (isEmailConflict(error)) {
      throw ApiError.conflict('An account with this email already exists', {
        details: { email: 'already in use' },
      });
    }
    throw error;
  }

  setAuthCookies(res, user.id);
  return sendCreated(res, { message: 'Account created', data: toSafeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  setAuthCookies(res, user.id);
  return sendResponse(res, { message: 'Signed in', data: toSafeUser(user) });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password, { adminOnly: true });
  setAuthCookies(res, user.id);
  return sendResponse(res, { message: 'Signed in', data: toSafeUser(user) });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
  return sendResponse(res, { message: 'Signed out', data: null });
});

export const refreshSession = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired authentication token');
  }

  const user = await findActiveUserForAuth(payload.sub ?? payload.id);
  if (!user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (wasIssuedBeforePasswordChange(payload, user.passwordChangedAt)) {
    throw ApiError.unauthorized('Authentication required');
  }

  setAuthCookies(res, user.id);
  return sendResponse(res, { message: 'Session refreshed', data: null });
});

export const me = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Authentication required');
  }
  return sendResponse(res, { message: 'Current user', data: toSafeUser(user) });
});
