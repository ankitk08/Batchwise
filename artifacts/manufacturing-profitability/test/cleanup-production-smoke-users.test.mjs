import assert from 'node:assert/strict';
import test from 'node:test';
import { findStaleProductionSmokeUsers } from './browser/cleanup-production-smoke-users.mjs';

const now = Date.parse('2026-09-19T12:00:00.000Z');
const markedMetadata = {
  production_smoke: {
    kind: 'batchwise-production-route-smoke',
    version: 1,
  },
};

test('selects only stale users carrying the exact production-smoke marker', () => {
  const users = [
    { id: 'stale-smoke', created_at: now - 7 * 60 * 60 * 1000, private_metadata: markedMetadata },
    { id: 'fresh-smoke', created_at: now - 60 * 60 * 1000, private_metadata: markedMetadata },
    { id: 'ordinary', created_at: now - 24 * 60 * 60 * 1000, private_metadata: {} },
    {
      id: 'lookalike',
      created_at: now - 24 * 60 * 60 * 1000,
      private_metadata: {
        production_smoke: {
          kind: 'batchwise-production-route-smoke',
          version: 2,
        },
      },
    },
  ];

  assert.deepEqual(
    findStaleProductionSmokeUsers(users, { now, minimumAgeHours: 6 }).map(
      ({ id }) => id,
    ),
    ['stale-smoke'],
  );
});

test('refuses users without a finite creation timestamp', () => {
  assert.deepEqual(
    findStaleProductionSmokeUsers(
      [{ id: 'invalid', created_at: undefined, private_metadata: markedMetadata }],
      { now },
    ),
    [],
  );
});