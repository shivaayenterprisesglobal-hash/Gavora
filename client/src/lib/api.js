import axios from 'axios';

/**
 * Single axios instance for the whole app.
 *
 * Defaults to the relative "/api" path so the Vite dev proxy handles local work
 * and a same-origin deployment needs no configuration. VITE_API_URL overrides
 * it when the API is hosted on a different origin.
 *
 * Authentication is cookie-based: the server sets an httpOnly, Secure,
 * SameSite session cookie that the browser attaches automatically because of
 * `withCredentials`. There is deliberately no token in localStorage or in an
 * Authorization header — a token readable by JavaScript is readable by any
 * injected script, which is exactly what httpOnly prevents.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Listeners notified when the server rejects a request as unauthenticated, so
 * the auth provider can clear its cached user without every caller having to
 * handle 401 itself.
 */
const unauthorizedListeners = new Set();

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function isAuthSessionUrl(url = '') {
  return (
    url.includes('/auth/me') ||
    url.includes('/auth/login') ||
    url.includes('/auth/signup') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/admin/login') ||
    url.includes('/admin/auth/login')
  );
}

function normalizeError(error) {
  const payload = error.response?.data?.error;
  const status = error.response?.status ?? 0;

  const normalized = new Error(
    payload?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : error.response
          ? 'Something went wrong. Please try again.'
          : 'Cannot reach the Gavora server. Check your connection.'),
  );

  normalized.status = status;
  normalized.code = payload?.code ?? error.code ?? 'NETWORK_ERROR';
  normalized.details = payload?.details;
  return normalized;
}

let refreshPromise = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh').finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Flattens the server's error envelope into a predictable shape so components
 * never have to unwrap `error.response.data.error` themselves.
 *
 * A 401 on an ordinary request first tries the refresh cookie. If that
 * succeeds the original call is retried once; if it fails, listeners clear
 * the cached user. Auth endpoints are excluded so login failures and the
 * session probe stay quiet.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalized = normalizeError(error);
    const original = error.config;
    const url = original?.url ?? '';
    const skipUnauthorizedBroadcast = isAuthSessionUrl(url);

    if (
      normalized.status === 401 &&
      original &&
      !original._retry &&
      !skipUnauthorizedBroadcast
    ) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        unauthorizedListeners.forEach((listener) => listener(normalized));
        return Promise.reject(normalized);
      }
    }

    if (normalized.status === 401 && !skipUnauthorizedBroadcast) {
      unauthorizedListeners.forEach((listener) => listener(normalized));
    }

    return Promise.reject(normalized);
  },
);

export default api;
