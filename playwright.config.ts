import { defineConfig, devices } from '@playwright/test';

// E2E smoke cho CSR + runtime MF. Boot fleet (pnpm start) qua webServer, chờ shell.
// Chạy nightly + workflow_dispatch trong CI (nặng: 8 server) — xem .github/workflows/ci.yml.
// SHELL_PORT: đổi port shell khi 3000 bận (boot fleet thủ công + reuseExistingServer).
const shellPort = process.env.SHELL_PORT || '3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${shellPort}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm start',
    url: `http://localhost:${shellPort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
