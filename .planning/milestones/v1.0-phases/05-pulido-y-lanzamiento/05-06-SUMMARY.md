---
phase: 05-pulido-y-lanzamiento
plan: 06
subsystem: ci
tags: [github-actions, playwright, e2e, neon]
requires: [05-05]
provides:
  - "CI e2e job: login, project CRUD, contact (fail-closed), 404 and headers specs against Neon dev"
affects: [05-07]
key-files:
  modified:
    - .github/workflows/ci.yml
    - docs/decisions.md
key-decisions:
  - "Global concurrency group e2e-neon-dev (no cancel); contact stays fail-closed, no Resend/Upstash vars in CI"
requirements-completed: [QUAL-05]
duration: ~15min
completed: 2026-11-26
---

# Phase 5 Plan 06: e2e in CI Summary

CI now runs a second job `e2e` (needs `check`) that builds and starts the app locally and runs auth, admin-projects, contact, not-found and headers specs on Neon dev: 27 passed in CI, both jobs green on phase-05-polish.

## Tasks

| Task | Commit |
|---|---|
| 1 tracer: e2e job with auth spec | ccae2e0 |
| 2 full spec list + decisions entry | 09b3023 |

Action majors confirmed from latest releases: actions/cache@v6, actions/upload-artifact@v7. Playwright browsers cached by Playwright version; report uploaded only on failure.

## Deviations from Plan

- `pnpm check` was not run locally for Task 2 (only a workflow file and a docs file changed); the CI `check` job ran it and passed (82 files, 505 tests).
- No retries added; no flakiness observed.

## Issues Encountered

None. Secrets ADMIN_EMAIL and ADMIN_PASSWORD were already present.

## Self-Check: PASSED
ci.yml has e2e-neon-dev, needs: check, no RESEND/UPSTASH/KV/BLOB variables, no contact-live; commits ccae2e0 and 09b3023 exist; run 45877867731 green.
