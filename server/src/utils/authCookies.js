import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authCookieOptions,
  clearCookieOptions,
} from '../config/cookies.js';
import {
  accessCookieMaxAge,
  refreshCookieMaxAge,
  signAccessToken,
  signRefreshToken,
} from './tokens.js';

export function setAuthCookies(res, userId) {
  res.cookie(ACCESS_COOKIE, signAccessToken(userId), authCookieOptions({ maxAge: accessCookieMaxAge }));
  res.cookie(REFRESH_COOKIE, signRefreshToken(userId), authCookieOptions({ maxAge: refreshCookieMaxAge }));
}

export function clearAuthCookies(res) {
  const options = clearCookieOptions();
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
}
