import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Preset dùng chung — mỗi package mergeConfig(base, { test: { ...overrides } }).
// MF remote (mfe_*/App) không resolve trong Vitest → mock bằng test.alias per-package.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [new URL('./vitest.setup.ts', import.meta.url).pathname],
    css: false,
  },
});
