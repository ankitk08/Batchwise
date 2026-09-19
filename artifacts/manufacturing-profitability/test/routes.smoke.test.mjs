import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(
  new URL('../src/App.tsx', import.meta.url),
  'utf8',
);
const detailSource = await readFile(
  new URL('../src/pages/production-detail.tsx', import.meta.url),
  'utf8',
);
const apiClientSource = await readFile(
  new URL('../../../lib/api-client-react/src/generated/api.ts', import.meta.url),
  'utf8',
);

function routePosition(route) {
  const position = appSource.indexOf(`<Route path="${route}"`);
  assert.notEqual(position, -1, `Expected ${route} to be registered`);
  return position;
}

test('public and sign-in routes resolve before the workspace fallback', () => {
  const workspaceFallback = appSource.indexOf(
    '<Route component={WorkspaceRoutes} />',
  );

  assert.notEqual(workspaceFallback, -1, 'Expected an unpathed workspace route');
  assert.ok(routePosition('/') < workspaceFallback);
  assert.ok(routePosition('/sign-in/*?') < workspaceFallback);
  assert.ok(routePosition('/sign-up/*?') < workspaceFallback);
  assert.ok(routePosition('/app') < workspaceFallback);
});

test('production list and nested detail links resolve inside the workspace', () => {
  const detailRoute = routePosition('/production/:id');
  const listRoute = routePosition('/production');
  const notFoundRoute = appSource.indexOf('<Route component={NotFound} />');

  assert.ok(detailRoute < listRoute, 'Detail route must precede the list route');
  assert.ok(listRoute < notFoundRoute, 'Production routes must precede NotFound');
});

test('the workspace fallback remains unpathed so nested refreshes cannot go blank', () => {
  assert.match(appSource, /<Route component=\{WorkspaceRoutes\} \/>/);
  assert.doesNotMatch(
    appSource,
    /<Route path="\/:[^"]*" component=\{WorkspaceRoutes\} \/>/,
  );
});

test('the production detail route loads and displays the requested run', () => {
  assert.match(detailSource, /useGetJob\(id\)/);
  assert.match(detailSource, /Job \{job\.jobNumber\}/);
  assert.match(detailSource, /\{job\.product\}/);
  assert.match(apiClientSource, /return `\/api\/jobs\/\$\{jobId\}`/);
});