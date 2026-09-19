# Production route smoke test

Run the authenticated route smoke test against the production URL with:

```sh
PLAYWRIGHT_BASE_URL=https://your-production-url.example \
CLERK_SECRET_KEY=your-production-instance-key \
pnpm run test:browser:production
```

The suite creates one temporary Clerk user and normally deletes it during
teardown. Production smoke users also receive an exact marker in Clerk private
metadata so an account left by a forcibly interrupted run can be identified
without relying on its name or email address.

## Clean up interrupted runs

First inspect marked users older than six hours. This is a dry run and deletes
nothing:

```sh
CLERK_SECRET_KEY=your-production-instance-key \
pnpm run cleanup:production-smoke-users
```

After checking the listed user IDs, delete that exact class of stale users:

```sh
CLERK_SECRET_KEY=your-production-instance-key \
pnpm run cleanup:production-smoke-users -- --delete
```

The command only selects users with the exact production-smoke private metadata
marker and a valid creation time older than the cutoff. Ordinary application
users, lookalike email addresses, unmarked users, and marker versions the script
does not recognize are never selected. The cutoff defaults to six hours and can
be changed with `--minimum-age-hours=N`; it must remain greater than zero.