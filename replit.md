# Manufacturing Profitability Copilot

A source-backed profitability cockpit for owner-led manufacturers using fragmented ERP, accounting, and spreadsheet data.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/manufacturing-profitability/` — React cockpit, jobs, job evidence, and source health
- `artifacts/api-server/src/routes/profitability.ts` — profitability API handlers
- `artifacts/api-server/src/lib/manufacturing-data.ts` — deterministic first-build dataset
- `lib/api-spec/openapi.yaml` — source of truth for the API contract

## Architecture decisions

- Keep the first product read-only; prove answer quality before adding source mutations.
- Use deterministic manufacturing calculations and source evidence. Natural language selects approved analyses but does not own financial math.
- Build the product before a full agent-evaluation system, while retaining a small golden-question set from the first workflow.

## Product

- Profitability cockpit for the current period
- Natural-language, source-backed margin questions
- Searchable job list with margin and leak indicators
- Job-level estimated-versus-actual cost evidence
- Connected-source health and reconciliation visibility

## User preferences

- Prioritize the working app first; expand formal agent evaluation after the initial product flow is useful.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
