---
phase: 02-base-t-cnica
plan: 02
subsystem: database
tags: [drizzle, neon, migrations, schema]
requires: [02-01]
provides:
  - full Drizzle schema of docs/data-model.md (10 tables, 5 enums)
  - createDb(url) on neon-http, requireEnv, describeDbTarget
  - scripts/migrate.ts (advisory lock, masked target) and drizzle/0000 applied to Neon dev
affects: [02-03, 02-04, 02-09]
tech-stack:
  added: []
  patterns: [schema per feature re-exported from src/db/schema.ts, migrations only (no drizzle-kit push)]
key-files:
  created: [src/db/columns.ts, src/db/schema.ts, src/db/client.ts, src/lib/env.ts, src/lib/db-target.ts, scripts/migrate.ts, scripts/lib/env.ts, drizzle.config.ts, drizzle/0000_nappy_phil_sheldon.sql, src/db/schema.test.ts, src/lib/db-target.test.ts]
  modified: [package.json, biome.json]
key-decisions:
  - "Biome ignores generated drizzle/ output (snapshot JSON failed the formatter)"
requirements-completed: []  # BASE-01 also needs main (02-09)
duration: ~15min
completed: 2026-11-15
---

# Phase 2 Plan 02: Data layer and migration 0000 Summary

Full Drizzle schema from docs/data-model.md (with `languages` jsonb and `metrics_en/es`) applied to Neon dev through a locked migration runner, read back through the neon-http client and pinned by network-free tests.

## Tasks

| Task | Commit |
|------|--------|
| 1 (checkpoint, done by Teo: .env.local) | n/a |
| 2 Schema, client, env, migrate, migration 0000 | e1ff5cd |
| 3 Schema contract and db-target tests | b380738 |

## Results

- Migration 0000 applied to Neon dev; second `pnpm db:migrate` run applied nothing and exited 0.
- Tables in `public`: contact_messages, education, experience_projects, experience_skills, experiences, project_skills, projects, resume_versions, site_settings, skills.
- Read-back through createDb: `rows: 0,0` (site_settings, projects).
- `grep '"languages" jsonb' drizzle/0000_*.sql` = 1; one migration file only.
- `pnpm check` green (54 tests).
- migrate output prints `migrate target: <endpoint> (<host>)` with no credentials.

## Deviations from Plan

**1. [Rule 3 - Blocking] Biome formatting of drizzle/ output.** `pnpm check` failed on generated `drizzle/meta/*.json`. Added `!drizzle` to biome.json includes. Commit e1ff5cd.

**2. [Rule 1 - Bug] Type error in schema.test.ts** (PgTable type predicate over mixed exports). Fixed with a cast before the commit was finalized (amended b380738).

**3. Verification method.** The read-back and table listing ran via a throwaway script (created in scripts/ and deleted, since tsx could not resolve the aliases/deps from the scratchpad) because the `.env.local` guard hook blocks naming that file on the command line. psql was not used; the table list came from information_schema through the same neon driver. Output printed only counts and table names.

## Notes for docs/decisions.md

- The Neon `dev` branch did not exist, contrary to CLAUDE.md; Teo created it from `main` right before this plan. Log this when decisions.md is next updated.

## Known Stubs

None.

## Self-Check: PASSED
