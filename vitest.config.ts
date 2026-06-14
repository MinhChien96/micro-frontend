import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// MF remote (mfe_*/App) không resolve trong Vitest (không có MF runtime) → alias stub.
// @app/shared/* resolve thật qua workspace exports map (pnpm symlink).
const remoteStub = fileURLToPath(new URL('./shell/test/stubs/RemoteStub.tsx', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'mfe_auth/Login': remoteStub,
      'mfe_accounts/AccountsApp': remoteStub,
      'mfe_transfer/TransferApp': remoteStub,
      'mfe_cards/CardsApp': remoteStub,
      'mfe_loans/LoansApp': remoteStub,
      'mfe_profile/ProfileApp': remoteStub,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [fileURLToPath(new URL('./vitest.setup.ts', import.meta.url))],
    include: ['**/src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
