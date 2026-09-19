---
name: Batchwise workspace persistence
description: Product decision for demo data, authenticated ownership, and persisted operating activity.
---

Keep a public seeded Lakeview Specialty Foods demo, but store its production runs and activity in PostgreSQL. Give each signed-in user a separate owned workspace; uploads, readiness results, copilot questions, and admin activity must never cross workspace boundaries.

**Why:** The hackathon demo must work without sign-in while still proving that authenticated customer workspaces can persist and isolate real activity.

**How to apply:** New operating records and activity endpoints should always resolve the current workspace on the server. Static catalog content can remain shared, but workspace-specific data must be queried and written through PostgreSQL.