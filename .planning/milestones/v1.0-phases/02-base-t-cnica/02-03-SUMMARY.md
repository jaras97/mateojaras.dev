---
phase: 02-base-t-cnica
plan: 03
subsystem: database
tags: [seed, drizzle, neon, cache-components, root-params, e2e]
requires: [02-02]
provides:
  - pnpm seed (docs/content projects into Neon, guarded, idempotent with --force)
  - cached project reads over uncached cores (getProjects, getProject)
  - src/app/[locale] root layout and home listing published titles in en and es
  - e2e/public.spec.ts and vitest server-only alias
affects: [02-04, 02-09]
tech-stack:
  added: []
  patterns: [core + 'use cache' wrapper per query, wrappers never read the locale, scripts use unguarded @/db/client]
key-files:
  created: [src/db/index.ts, src/lib/locale.ts, src/lib/cache-tags.ts, src/lib/seed-guard.ts, src/features/projects/seed-map.ts, src/features/projects/queries.ts, scripts/seed.ts, "src/app/[locale]/layout.tsx", "src/app/[locale]/page.tsx", e2e/public.spec.ts, src/test/server-only-stub.ts]
  modified: [package.json, vitest.config.ts, playwright.config.ts, .gitignore]
  deleted: [src/app/layout.tsx, src/app/page.tsx]
key-decisions:
  - "Metrics follow reading b: metricsEn/Es labels are `label (source)` per language"
  - "playwright webServer waits on /en because `/` has no route until 02-04 routing exists"
requirements-completed: [BASE-02, BASE-05, BASE-06, BASE-08]
duration: ~25min
completed: 2026-11-15
---

# Phase 2 Plan 03: Walking-skeleton tracer Summary

Four docs/content projects (two published, two draft) are seeded into Neon dev and the two published titles prerender on `/en` and `/es` through `'use cache'` queries and `next/root-params`, with a seed that refuses to overwrite without `--force`.

## Commits

| Task | Commit |
|------|--------|
| 1 Tracer | b89f62a |
| 2 Hardening | 316e6fd |

## Results

- `pnpm seed` on the empty table: 4 projects, 2 published. Without `--force` on the seeded DB it exits 1 naming `--force`. Two `--force` runs keep 4 rows. Output prints only `seed target: <endpoint> (<host>)`, no credentials.
- DB check (throwaway script, deleted): slugs/status are exactly the four expected; rows with tagline_en, cover_image or media non-null: 0.
- `pnpm check` green (64 tests, build prerenders `/en` and `/es`).
- `pnpm test:e2e e2e/public.spec.ts`: 3 passed (titles per locale, drafts absent, exact NFC title in HTML).

## Deviations from Plan

**1. [Rule 3 - Blocking] Playwright webServer URL.** With the scaffold page deleted `/` is a 404, so Playwright never saw the server as ready and timed out. Changed `webServer.url` to `/en`. Files: playwright.config.ts.

**2. [Rule 3 - Blocking] queries.test.ts needs DATABASE_URL.** `queries.ts` imports `@/db`, which reads the variable at import. The test stubs it with a synthetic URL (`vi.stubEnv`) and imports dynamically; nothing else is mocked.

**3. [Rule 2] .gitignore** gained `test-results/` and `playwright-report/` so Playwright output is never left untracked.

**4. Ad-hoc DB check** used a throwaway tsx script with `loadLocalEnv` instead of psql (hook blocks naming `.env.local`).

## Assumption outcomes

- BASE-02: build passes with no `app/layout.tsx` (A6 held; no global-not-found needed).
- BASE-05: `draftMode()` is readable inside `'use cache'` (build and e2e pass).
- BASE-06: upsert by slug works (unique index `projects_slug_idx`).

## Known Stubs

None. The home page is a skeleton listing titles; the real home is a later phase.

## Self-Check: PASSED
