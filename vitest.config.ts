import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// @app/common/* resolve thật qua workspace exports map (pnpm symlink).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [fileURLToPath(new URL('./vitest.setup.ts', import.meta.url))],
    include: ['**/src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Gate vào core tái dùng (common). 6 MFE banking là example domain —
      // không coverage-gate (sẽ thay khi làm dự án thật).
      include: ['common/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.stories.tsx',
        '**/mocks/**',
        '**/routes/**',
        '**/*.d.ts',
      ],
      // Floor chống regression (≈ mức hiện tại) — nâng dần khi thêm test
      thresholds: { lines: 30, functions: 22, branches: 15, statements: 28 },
    },
  },
});
