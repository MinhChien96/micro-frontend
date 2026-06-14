import { getUser, type User } from '@app/shared/auth';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  // false cho đến khi client đọc xong localStorage — SSR và first paint
  // luôn là { user: null, ready: false } để không hydration mismatch
  ready: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  useEffect(() => {
    const sync = () => setState({ user: getUser(), ready: true });
    sync(); // đọc lần đầu sau hydration
    window.addEventListener('auth:changed', sync);
    return () => window.removeEventListener('auth:changed', sync);
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext).user;
export const useAuthReady = () => useContext(AuthContext).ready;
