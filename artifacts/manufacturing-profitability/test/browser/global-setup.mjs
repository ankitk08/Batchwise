import { clerkSetup } from '@clerk/testing/playwright';

const PREFLIGHT_TIMEOUT_MS = 5_000;

async function checkService({ name, url, workflow }) {
  let response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(PREFLIGHT_TIMEOUT_MS),
    });
  } catch (error) {
    const reason =
      error instanceof Error && error.name === 'TimeoutError'
        ? `timed out after ${PREFLIGHT_TIMEOUT_MS / 1_000}s`
        : 'could not be reached';

    throw new Error(
      `${name} ${reason} at ${url}. Start or restart the "${workflow}" workflow, then rerun the browser route suite.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `${name} returned HTTP ${response.status} at ${url}. Start or restart the "${workflow}" workflow, then rerun the browser route suite.`,
    );
  }
}

export default async function globalSetup(config) {
  const baseURL = config.projects[0]?.use?.baseURL;

  if (typeof baseURL !== 'string') {
    throw new Error(
      'Browser route preflight could not determine the web app URL from Playwright config.',
    );
  }

  const origin = new URL(baseURL).origin;

  await Promise.all([
    checkService({
      name: 'Manufacturing web app',
      url: new URL('/', origin).toString(),
      workflow: 'artifacts/manufacturing-profitability: web',
    }),
    checkService({
      name: 'API health endpoint',
      url: new URL('/api/healthz', origin).toString(),
      workflow: 'artifacts/api-server: API Server',
    }),
  ]);

  await clerkSetup();
}
