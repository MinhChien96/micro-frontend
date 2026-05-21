import { create } from 'zustand';

/**
 * Auth store — source of truth cho authentication state.
 *
 * Được expose qua Module Federation. Khi zustand được mark singleton: true,
 * tất cả MFE (shell, mfe-auth, mfe-products...) dùng CÙNG 1 instance này.
 * Không cần event bus, không cần prop drilling qua shell.
 */
export const useAuthStore = create((set) => ({
  user: null,

  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
