import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id?: string;
  name: string;
  role: string;
  email?: string;
  branch?: string;
}

const KEY = 'vietbank_user';

const readUser = (): User | null => {
  if (typeof window === 'undefined') return null; // SSG guard
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); }
  catch { return null; }
};

const AuthContext = createContext<User | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser);

  useEffect(() => {
    const handler = () => setUser(readUser());
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
