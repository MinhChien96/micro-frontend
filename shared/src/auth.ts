import { getPermissionsForRole, type Permission, type Role } from './utils/permissions';

export type { Permission, Role } from './utils/permissions';

// Nguồn chân lý cho localStorage keys — đổi 1 chỗ là đổi toàn hệ thống.
export const STORAGE_KEYS = {
  user: 'vietbank_user',
  token: 'vietbank_token',
  theme: 'vietbank_theme',
} as const;

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

// SSR guard: server không có localStorage → luôn coi là chưa đăng nhập
const hasStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getUser = (): User | null => {
  if (!hasStorage()) return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null') as User | null;
  } catch {
    return null;
  }
};

export const setUser = (user: User): void =>
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

export const getToken = (): string | null =>
  hasStorage() ? localStorage.getItem(STORAGE_KEYS.token) : null;

export const setToken = (token: string): void => localStorage.setItem(STORAGE_KEYS.token, token);

export const clearAuth = (): void => {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
};

export const isAuthenticated = (): boolean => !!getToken();

export const getPermissions = (): readonly Permission[] => {
  const user = getUser();
  if (!user) return [];
  return getPermissionsForRole(String(user.role).toUpperCase());
};

export const hasPermission = (permission: Permission): boolean =>
  getPermissions().includes(permission);
