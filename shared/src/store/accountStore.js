import { create } from 'zustand';

export const useAccountStore = create((set, get) => ({
  accounts: [],

  setAccounts: (accounts) => set({ accounts }),

  getTotalBalance: () =>
    get().accounts.reduce((sum, a) => sum + (a.balance || 0), 0),

  getAccount: (id) =>
    get().accounts.find((a) => a.id === id),
}));
