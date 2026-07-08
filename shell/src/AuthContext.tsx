import { useGlobalStore } from '@app/common/stores';
import type { ReactNode } from 'react';

// Auth state sống trong global store singleton (@app/common/stores) —
// remote setUser/setToken là shell re-render ngay, không cần event.
// Giữ AuthProvider + hooks để API cũ của components không đổi.

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const useAuth = () => useGlobalStore((s) => s.user);
export const useAuthReady = () => true;
