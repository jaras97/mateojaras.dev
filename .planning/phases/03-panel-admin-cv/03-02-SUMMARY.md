---
phase: 03-panel-admin-cv
plan: 02
subsystem: seed-and-backup
tags: [seed, guard, backup, blob, content]
requires: [03-01]
provides: [assertNotProduction, insert-only seed --force, CONTENT_EXPORT_DIR, random-suffix backups]
affects: [scripts/seed.ts, src/lib/seed-guard.ts, src/lib/content-export.ts, playwright.config.ts, .gitignore]
key-files:
  modified: [scripts/seed.ts, src/lib/seed-guard.ts, src/lib/seed-guard.test.ts, src/lib/content-export.ts, src/lib/content-export.test.ts, playwright.config.ts, .gitignore, docs/decisions.md]
decisions:
  - "content/ gitignored and untracked (Teo D: a); files stay on disk"
  - "seed --force inserts only missing rows; experiences/education facts skipped when table non-empty"
metrics:
  completed: 2026-11-16
---

# Phase 3 Plan 02: Seed safety and backups Summary

Insert-only `seed --force`, a production guard (`assertNotProduction`, `--allow-production`) on every seed mode, Blob backups with random suffix, `CONTENT_EXPORT_DIR` for export/restore/e2e, and `/content/` removed from git.

## Tasks

1. Tracer (TDD): RED `c34d17e`, GREEN `da77aad`. Seed uses `onConflictDoNothing` only; non-empty experiences/education skip facts; production guard runs right after the target log.
2. `1035d09`: `addRandomSuffix: true`, `CONTENT_EXPORT_DIR` default, Playwright webServer env, `/content/` gitignored and `git rm --cached` (0 tracked files, files on disk).

## RED evidence

Target: the four `assertNotProduction` tests in `src/lib/seed-guard.test.ts`. They failed with `TypeError: assertNotProduction is not a function` (symbol did not exist yet), 4 failed / 3 passed. Semantic assessment: failure for the intended reason (missing feature); not a classifier-validated TAP record (no `gsd_run` classifier available in this environment).

## Verification

- `vitest` seed-guard (7) and content-export (9) pass; `pnpm check` green.
- `pnpm seed --force` on Neon dev: "experiences: 2 filas existentes, no se siembran hechos", "seeded projects: 0 inserted, 4 kept"; a fake `ep-billowing-union` URL prints "es producción" and exits 1.
- Restore cycle (export, `seed --from-content --force`, export) diff empty.

## Deviations

- Task 1 commit message for GREEN was prefixed `feat(03-02): fix(seed) ...` (cosmetic).
- Added a decisions.md entry for the content/ policy. Updated the `assertSeedable` message wording ("insertar solo lo que falta").

## Pending manual items

- BLOB_READ_WRITE_TOKEN still absent (Teo H: luego): Blob backups skip with a warning on Vercel until created.

## Self-Check: PASSED
