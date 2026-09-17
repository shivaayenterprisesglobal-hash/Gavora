import { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext } from '@/context/authContext';
import api, { onUnauthorized } from '@/lib/api';

async function fetchCurrentUser() {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (error) {
    if (error.status !== 401) throw error;
    // No cookie at all — skip the refresh round-trip.
    if (error.message === 'Authentication required') throw error;
    await api.post('/auth/refresh');
    const { data } = await api.get('/auth/me');
    return data.data;
  }
}

/**
 * Session state holder for httpOnly cookie authentication.
 *
 * The JWT never enters React state, localStorage, or sessionStorage. This
 * provider only holds the safe user profile returned by GET /api/auth/me.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => onUnauthorized(() => setUser(null)), []);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.data);
    return data.data;
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    setUser(data.data);
    return data.data;
  }, []);

  const adminLogin = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/admin/login', credentials);
    setUser(data.data);
    return data.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clearing local state still signs the UI out if the cookie is already gone.
    }
    setUser(null);
  }, []);

  const applyUser = useCallback((profile) => {
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      signup,
      adminLogin,
      logout,
      applyUser,
    }),
    [user, isLoading, login, signup, adminLogin, logout, applyUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
