import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id?: string;
  name: string;
  role: string;
  email?: string;
  branch?: string;
}

interface AuthState {
  user: User | null;
  // false cho đến khi client đọc xong localStorage — SSR và first paint
  // luôn là { user: null, ready: false } để không hydration mismatch
  ready: boolean;
}

const KEY = 'vietbank_user';

const readUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthState>({ user: null, ready: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  useEffect(() => {
    const sync = () => setState({ user: readUser(), ready: true });
    sync(); // đọc lần đầu sau hydration
    window.addEventListener('auth:changed', sync);
    return () => window.removeEventListener('auth:changed', sync);
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext).user;
export const useAuthReady = () => useContext(AuthContext).ready;
