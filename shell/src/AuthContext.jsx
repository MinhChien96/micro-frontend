import React, { createContext, useContext, useState, useEffect } from 'react';

const KEY = 'vietbank_user';

const readUser = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); }
  catch { return null; }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  useEffect(() => {
    const handler = () => setUser(readUser());
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
