import { isProduction } from './env.js';

export const ACCESS_COOKIE = 'accessToken';
export const REFRESH_COOKIE = 'refreshToken';

/**
 * Shared cookie flags for auth cookies.
 *
 * Local HTTP cannot set Secure cookies, so Secure is production-only.
 * SameSite=Lax is correct for same-site deployments (Vite proxy locally,
 * same-origin in production) and blocks most cross-site POST cookie use.
 */
export function authCookieOptions({ maxAge }) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };
}
