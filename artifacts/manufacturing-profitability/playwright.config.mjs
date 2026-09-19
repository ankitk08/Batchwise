import { defineConfig } from '@playwright/test';

const baseURL =
  process.env.E2E_BASE_URL ??
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : undefined);

if (!baseURL) {
  throw new Error(
    'Set E2E_BASE_URL or REPLIT_DEV_DOMAIN before running the browser route suite.',
  );
}

export default defineConfig({
  testDir: './test/browser',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  globalSetup: './test/browser/global-setup.mjs',
  use: {
    baseURL,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? '/repl/tools/bin/chromium',
    },
    trace: 'retain-on-failure',
  },
});