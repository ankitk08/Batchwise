---
name: Wouter deep-route fallback
description: Routing constraint for direct loading of nested Batchwise workspace URLs.
---

Use an unpathed final `Route` as the top-level workspace fallback. Do not use a named wildcard such as `/:rest*` for this catch-all.

**Why:** The named wildcard matched one-segment pages but failed to enter the workspace router for multi-segment links, leaving production detail URLs completely blank with no API request or browser error.

**How to apply:** Keep public/auth routes first in the top-level `Switch`, then place the workspace router as the final unpathed route. Verify both list and detail URLs by loading them directly.