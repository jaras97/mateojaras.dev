---
phase: 02-base-t-cnica
plan: 08
subsystem: infra
tags: [cache-components, go-no-go, e2e]
requires: [02-07]
provides:
  - scripts/go-no-go.sh repeatable Plan B protocol (signals 1-6)
  - decisions.md verdict GO, staying on Cache Components
affects: [03]
key-files:
  created: [scripts/go-no-go.sh]
  modified: [docs/decisions.md, e2e/public.spec.ts]
key-decisions:
  - "GO: keep cacheComponents true; Teo chose option (a) after signal 4 could not return a real 404"
  - "Signal 4 re-scoped to not-found UI + noindex + no draft content; status 200 or 404 accepted"
requirements-completed: [BASE-09]
duration: ~2h
completed: 2026-11-16
---

# Phase 2 Plan 08: Plan B go/no-go Summary

Cache Components stays on: signals 1-6 pass on the production build (Next 16.4.6) once signal 4 is judged on the not-found UI, noindex and absent draft content instead of the HTTP status.

## Commits

| Step | Commit |
|------|--------|
| go-no-go script | 0f58871 |
| status-agnostic e2e and signal 4 | 9ebd2f1 |
| decisions.md verdict and Neon `dev` note | eb68b33 |

## Results

- `bash scripts/go-no-go.sh`: PASS 1-6, SKIP 7, verdict GO.
- `pnpm check` green (91 unit tests, build). `pnpm test:e2e`: 21 passed.
- Draft and unknown slugs return 200 on a cold server and 404 once the cache is warm; the shell is sent first (loading.md "Status codes"). A cached published-slug check at the top of the page did not change this and was reverted.

## Deviations from Plan

- [Rule 3] Script fixes: README.md excluded from slug parsing, route-table truncation ("[+N more paths]") handled, port-in-use guard added after a leftover `next-server` contaminated runs.
- Signal 4 re-scoped by Teo's decision; e2e not-found specs now accept 200 or 404.
- Task 2 (Plan B) not applied: GO path, no application code changed.
- One transient unit-test failure appeared in the first `pnpm check` and did not reproduce on rerun (91/91 twice).

## Known follow-up

- Soft-404 reports in Search Console are possible; a proxy.ts slug check giving a real 404 can be revisited then.
- The Neon `dev` branch did not exist; Teo created it from `main` on 2026-11-15 (recorded in decisions.md).

## Self-Check: PASSED
