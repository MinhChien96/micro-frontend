import { clearAuthState, globalStore, setAuthToken, setGlobalUser } from './stores/global.store';
import { getPermissionsForRole, type Permission, type Role } from './utils/permissions';

export type { Permission, Role } from './utils/permissions';

export interface User {
  id?: string;
  name: string;
  role: Role;
  email?: string;
  branch?: string;
  // Trường example domain (banking) — tùy biến theo dự án thật
  customerId?: string;
  phone?: string;
}

// Facade mỏng quanh global store (zustand singleton — xem stores/global.store.ts).
// Giữ API cũ để component không phải đổi; phiên nằm trong sessionStorage
// (đóng tab là hết), preferences nằm localStorage.

export const getUser = (): User | null => globalStore.getState().user;

export const setUser = (user: User): void => setGlobalUser(user);

export const getToken = (): string | null => globalStore.getState().authToken;

export const setToken = (token: string): void => setAuthToken(token);

export const clearAuth = (): void => clearAuthState();

export const isAuthenticated = (): boolean => !!getToken();

export const getPermissions = (): readonly Permission[] => {
  const user = getUser();
  if (!user) return [];
  return getPermissionsForRole(String(user.role).toUpperCase());
};

export const hasPermission = (permission: Permission): boolean =>
  getPermissions().includes(permission);
