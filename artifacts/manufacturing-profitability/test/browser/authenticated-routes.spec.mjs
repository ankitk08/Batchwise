import { randomUUID } from 'node:crypto';
import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const smokeScope =
  process.env.E2E_PRODUCTION_SMOKE === '1' ? 'production' : 'development';
const productionSmokeMarker = {
  kind: 'batchwise-production-route-smoke',
  version: 1,
};
const testEmail = `route-smoke-${smokeScope}+${randomUUID()}@example.com`;
const testPassword = `Route-smoke-${randomUUID()}!aA1`;
let testUserId;

async function clerkApi(path, init = {}) {
  if (!clerkSecretKey) {
    throw new Error('CLERK_SECRET_KEY is required for authenticated route tests.');
  }

  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Clerk API ${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.status === 204 ? undefined : response.json();
}

async function signIn(page) {
  await page.goto('/');
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    emailAddress: testEmail,
  });
}

test.describe.serial('Clerk-initialized application routes', () => {
  test.beforeAll(async () => {
    const user = await clerkApi('/users', {
      method: 'POST',
      body: JSON.stringify({
        email_address: [testEmail],
        password: testPassword,
        first_name: 'Route Smoke',
        last_name: smokeScope,
        ...(smokeScope === 'production'
          ? { private_metadata: { production_smoke: productionSmokeMarker } }
          : {}),
        skip_password_checks: true,
        skip_password_requirement: true,
      }),
    });
    testUserId = user.id;
  });

  test.afterAll(async () => {
    if (testUserId) {
      await clerkApi(`/users/${testUserId}`, { method: 'DELETE' });
    }
  });

  test('signed-out users entering /app reach /sign-in', async ({ page }) => {
    await page.goto('/app');

    await expect(page).toHaveURL(/\/sign-in(?:\/|$|\?)/);
    await expect(
      page.getByRole('heading', { name: 'Sign in to Batchwise' }),
    ).toBeVisible();
  });

  test('signed-in users entering /app reach /cockpit', async ({ page }) => {
    await signIn(page);

    await page.goto('/app');

    await expect(page).toHaveURL(/\/cockpit(?:$|\?)/);
    await expect(
      page.getByRole('heading', { name: 'Executive Cockpit' }),
    ).toBeVisible();
  });

  test('signed-in production detail survives a direct load and refresh', async ({
    page,
  }) => {
    await signIn(page);

    await page.goto('/production/run-240917-a');
    await page.reload();

    await expect(page).toHaveURL(/\/production\/run-240917-a(?:$|\?)/);
    await expect(
      page.getByRole('heading', { name: 'Job PR-240917-A' }),
    ).toBeVisible();
    await expect(
      page.getByText('Roasted Red Pepper Hummus 10 oz'),
    ).toBeVisible();
  });
});