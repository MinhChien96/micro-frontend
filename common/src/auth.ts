import type { EntitledAction } from './permissions/entitledAction';
import type { Role } from './permissions/roles';
import { clearAuthState, globalStore, setAuthToken, setGlobalUser } from './stores/global.store';

export type { Role } from './permissions/roles';

export interface User {
  id?: string;
  name: string;
  /** nhãn hồ sơ demo — quyền THẬT nằm ở entitledActions */
  role: Role;
  /** danh sách quyền P/S/F backend trả về — nguồn sự thật cho canAction */
  entitledActions?: EntitledAction[];
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
