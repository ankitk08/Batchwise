# Batchwise Decision Intelligence

A governed analytics and decision-intelligence prototype for US SMB specialty food processors using fragmented ERP, accounting, quality, labor, and spreadsheet data.

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

- Guided file onboarding with column profiling and suggested semantic mappings
- Data-readiness gates with named business owners and explicit KPI blocks
- Versioned food-processing semantic model and metric contracts
- Executive cockpit for margin, yield, waste, schedule attainment, and quality holds
- Source-backed consultant questions and production-run evidence
- Prioritized recommendations with impact, effort, confidence, owner, and supporting evidence
- Authenticated customer accounts plus a public seeded-demo workspace

## Prototype ICP and assumptions

- US specialty food processors with 25–250 employees, $5M–$75M revenue, and one to three plants
- Initial segments: sauces, dips, prepared foods, bakery, beverages, and private-label products
- Initial source pattern: QuickBooks or a mid-market ERP plus recurring CSV/XLSX quality, labor, and production exports
- Primary buyer: owner, controller, or general manager; recurring users include plant, finance, and quality leaders
- First decision: which production runs, SKUs, and customers are eroding contribution margin, why, and what should be acted on this week
- The prototype is read-only and does not replace food-safety, HACCP, QMS, ERP, or accounting systems of record

## User preferences

- Prioritize the working app first; expand formal agent evaluation after the initial product flow is useful.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
