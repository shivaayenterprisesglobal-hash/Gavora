import { createContext, useContext } from 'react';

/**
 * Context object and consumer hook, kept in a non-component module so the
 * provider file exports components only and Fast Refresh stays reliable.
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
