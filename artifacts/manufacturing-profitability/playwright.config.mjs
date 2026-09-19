import { defineConfig } from '@playwright/test';

const isProductionSmoke = process.env.E2E_PRODUCTION_SMOKE === '1';
const explicitBaseURL = process.env.E2E_BASE_URL;

if (isProductionSmoke && !explicitBaseURL) {
  throw new Error(
    'Production smoke tests require an explicit published URL. Set E2E_BASE_URL=https://your-published-app.example and rerun test:browser:production.',
  );
}

const baseURL =
  explicitBaseURL ??
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : undefined);

if (!baseURL) {
  throw new Error(
    'Set E2E_BASE_URL or REPLIT_DEV_DOMAIN before running the browser route suite.',
  );
}

if (isProductionSmoke) {
  const publishedURL = new URL(baseURL);
  const developmentHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
  ];

  if (
    publishedURL.protocol !== 'https:' ||
    developmentHosts.includes(publishedURL.hostname) ||
    publishedURL.hostname.endsWith('.replit.dev')
  ) {
    throw new Error(
      'Production smoke tests only target an HTTPS published URL; localhost, IP loopback, and *.replit.dev preview URLs are rejected.',
    );
  }
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