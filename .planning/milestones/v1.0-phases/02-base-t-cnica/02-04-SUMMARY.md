---
phase: 02-base-t-cnica
plan: 04
subsystem: database
tags: [seed, export, backup, drizzle, neon, vercel-blob]
requires: [02-03]
provides:
  - exportContent / restoreContent over an allowlist of 9 content tables
  - pnpm export:content and pnpm seed --from-content --force
  - full seed of site_settings, experiences and education from verified sources
  - committed content/*.json
affects: [02-05, 02-07, 03]
tech-stack:
  added: []
  patterns: [allowlist not denylist for exports, restore as a single db.batch, copy.md parsers drop HTML comments]
key-files:
  created: [src/lib/content-export.ts, src/lib/content-export.test.ts, scripts/export-content.ts, scripts/lib/seed-facts.ts, src/features/site-settings/copy-doc.ts, src/features/site-settings/copy-doc.test.ts, content/ (9 files)]
  modified: [scripts/seed.ts, package.json, src/features/site-settings/types.ts, src/features/site-settings/fixture.ts, docs/decisions.md]
key-decisions:
  - "content/*.json is committed; only the 9 allowlisted tables"
  - "Experience dates stored as the first day of the month (sources give month precision)"
requirements-completed: [BASE-06, BASE-07]
duration: ~25min
completed: 2026-11-15
---

# Phase 2 Plan 04: Full seed and content export Summary

Neon dev now holds every verified fact (site settings with About bio, Sofka and freelance experience, Universidad de Antioquia) and `pnpm export:content` / `pnpm seed --from-content --force` round-trip the base byte-for-byte.

## Commits

| Task | Commit |
|------|--------|
| 1 Tracer: export and restore | 90eaa01 |
| 2 Full seed, SiteSettings = $inferSelect | 5981aff |

## Results

- Export wrote 9 files. After the full seed: site_settings 1 row (2 languages, availability open), experiences 2 (Sofka with empty bullets, freelance with 3 bullet pairs), education 1, projects 4, skills 0.
- Round trip (export, copy, `seed --from-content --force`, export, `diff -r`) is empty, both before and after the full seed.
- `pnpm check` green: 76 tests (8 new for export, 5 for copy-doc), build prerenders `/en` and `/es`.
- Blob path is unit-tested with a mocked `put`; with `VERCEL` and no `BLOB_READ_WRITE_TOKEN` it returns `skipped` for every table and warns once. Live Blob behavior waits for phase 3.

## Deviations from Plan

None of consequence. Experiences and education have no unique index, so the seed matches them by natural key (company + startDate, institution) with a select before the batch instead of `onConflictDoUpdate`; both statements still go in the same `db.batch` as projects. Seeded experience and education rows are `published`.

## Known Stubs

None. Sofka bullets are intentionally empty and skills/Sofka U are not seeded (no verified source, decisions.md "Textos sembrados").

## Self-Check: PASSED
