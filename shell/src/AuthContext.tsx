import { getUser, type User } from '@app/common/auth';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  ready: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  // CSR: render đầu tiên đã ở client → đọc localStorage đồng bộ ngay được
  const [state, setState] = useState<AuthState>(() => ({ user: getUser(), ready: true }));

  useEffect(() => {
    const sync = () => setState({ user: getUser(), ready: true });
    window.addEventListener('auth:changed', sync);
    return () => window.removeEventListener('auth:changed', sync);
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext).user;
export const useAuthReady = () => useContext(AuthContext).ready;
