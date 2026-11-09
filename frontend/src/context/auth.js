import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// The logged-in user and the login/logout actions (see AuthContext.jsx).
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
