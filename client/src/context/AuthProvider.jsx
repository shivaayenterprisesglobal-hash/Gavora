import { useMemo, useState } from 'react';

import { AuthContext } from '@/context/authContext';

/**
 * Phase 1 skeleton. The shape of the context value is final, so components
 * written against it will not need changing when the real signup/login/logout
 * calls to /api/auth are added in the next phase.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading] = useState(false);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isLoading,
      // Implemented in the authentication phase.
      login: async () => {
        throw new Error('Authentication is not implemented yet');
      },
      signup: async () => {
        throw new Error('Authentication is not implemented yet');
      },
      logout: () => setUser(null),
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
