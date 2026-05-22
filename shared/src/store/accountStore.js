import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export const useAccountStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        accounts: [],

        setAccounts: (accounts) => set({ accounts }),

        getTotalBalance: () =>
          get().accounts.reduce((sum, a) => sum + (a.balance || 0), 0),

        getAccount: (id) =>
          get().accounts.find((a) => a.id === id),
      }),
      {
        name: 'vietbank-accounts',
        partialize: (s) => ({ accounts: s.accounts }),
      }
    )
  )
);
