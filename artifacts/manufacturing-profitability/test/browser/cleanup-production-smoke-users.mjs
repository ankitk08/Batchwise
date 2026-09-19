const CLERK_API_ORIGIN = 'https://api.clerk.com/v1';
const MARKER_KIND = 'batchwise-production-route-smoke';
const MARKER_VERSION = 1;
const DEFAULT_MINIMUM_AGE_HOURS = 6;
const PAGE_SIZE = 100;

function isProductionSmokeUser(user) {
  const marker = user?.private_metadata?.production_smoke;
  return marker?.kind === MARKER_KIND && marker?.version === MARKER_VERSION;
}

export function findStaleProductionSmokeUsers(
  users,
  { now = Date.now(), minimumAgeHours = DEFAULT_MINIMUM_AGE_HOURS } = {},
) {
  const cutoff = now - minimumAgeHours * 60 * 60 * 1000;

  return users.filter(
    (user) =>
      isProductionSmokeUser(user) &&
      Number.isFinite(user.created_at) &&
      user.created_at <= cutoff,
  );
}

async function clerkApi(secretKey, path, init = {}) {
  const response = await fetch(`${CLERK_API_ORIGIN}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
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

async function listAllUsers(secretKey) {
  const users = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await clerkApi(
      secretKey,
      `/users?limit=${PAGE_SIZE}&offset=${offset}&order_by=-created_at`,
    );

    if (!Array.isArray(page)) {
      throw new Error('Clerk users response was not an array; refusing cleanup.');
    }

    users.push(...page);
    if (page.length < PAGE_SIZE) return users;
  }
}

function parseArguments(argv) {
  const deleteUsers = argv.includes('--delete');
  const ageArgument = argv.find((argument) =>
    argument.startsWith('--minimum-age-hours='),
  );
  const minimumAgeHours = ageArgument
    ? Number(ageArgument.split('=', 2)[1])
    : DEFAULT_MINIMUM_AGE_HOURS;

  if (!Number.isFinite(minimumAgeHours) || minimumAgeHours <= 0) {
    throw new Error('--minimum-age-hours must be a positive number.');
  }

  return { deleteUsers, minimumAgeHours };
}

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY is required.');
  }

  const { deleteUsers, minimumAgeHours } = parseArguments(process.argv.slice(2));
  const users = await listAllUsers(secretKey);
  const staleUsers = findStaleProductionSmokeUsers(users, { minimumAgeHours });

  if (staleUsers.length === 0) {
    console.log(
      `No marked production-smoke users older than ${minimumAgeHours} hours found.`,
    );
    return;
  }

  console.log(
    `${deleteUsers ? 'Deleting' : 'Dry run: found'} ${staleUsers.length} marked production-smoke user(s) older than ${minimumAgeHours} hours:`,
  );
  for (const user of staleUsers) {
    console.log(`- ${user.id} (created ${new Date(user.created_at).toISOString()})`);
  }

  if (!deleteUsers) {
    console.log('No users were deleted. Re-run with --delete to delete this exact set.');
    return;
  }

  for (const user of staleUsers) {
    if (!isProductionSmokeUser(user)) {
      throw new Error(`User ${user.id} lost its smoke marker; refusing deletion.`);
    }
    await clerkApi(secretKey, `/users/${encodeURIComponent(user.id)}`, {
      method: 'DELETE',
    });
  }

  console.log(`Deleted ${staleUsers.length} stale production-smoke user(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}