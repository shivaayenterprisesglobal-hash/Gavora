import axios from 'axios';

/**
 * Single axios instance for the whole app.
 *
 * Defaults to the relative "/api" path so the Vite dev proxy handles local work
 * and a same-origin deployment needs no configuration. VITE_API_URL overrides
 * it when the API is hosted on a different origin.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const ACCESS_TOKEN_KEY = 'gavora.accessToken';

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token) {
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // Storage can be unavailable in private browsing; the in-memory session
    // still works for the current tab.
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Flattens the server's error envelope into a predictable shape so components
 * never have to unwrap `error.response.data.error` themselves.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data?.error;

    const normalized = new Error(
      payload?.message ||
        (error.code === 'ECONNABORTED'
          ? 'The request timed out. Please try again.'
          : error.response
            ? 'Something went wrong. Please try again.'
            : 'Cannot reach the Gavora server. Check your connection.'),
    );

    normalized.status = error.response?.status ?? 0;
    normalized.code = payload?.code ?? error.code ?? 'NETWORK_ERROR';
    normalized.details = payload?.details;

    return Promise.reject(normalized);
  },
);

export default api;
