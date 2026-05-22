import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getPermissionsForRole } from '../utils/permissions';

export const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    user: null,
    role: null,
    permissions: [],

    login: (user) => {
      const role = (user.role || 'CUSTOMER').toUpperCase();
      set({ user, role, permissions: getPermissionsForRole(role) });
    },

    logout: () => set({ user: null, role: null, permissions: [] }),

    updateProfile: (patch) =>
      set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

    hasPermission: (permission) => get().permissions.includes(permission),

    hasRole: (role) => get().role === role?.toUpperCase(),
  }))
);
