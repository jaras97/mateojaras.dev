---
phase: 03-panel-admin-cv
plan: 03
subsystem: admin-data-layer
tags: [drizzle, migration, draft-publish, server-actions, zod, tiptap-allowlist]
requires: [03-01, 03-02]
provides: [draft column + migration 0002, stripDraft/applyDraft, requireActionSession, ActionResult, project actions, richTextDocSchema, /admin/proyectos/[id] tracer form]
affects: [03-04, 03-05, 03-08, 03-09, 03-14]
key-files:
  created: [drizzle/0002_keen_mentor.sql, src/lib/draft.ts, src/lib/action-result.ts, src/lib/rich-text-schema.ts, src/lib/zod-jitless.ts, src/features/projects/actions.ts, src/features/projects/validation.ts, src/features/projects/admin-queries.ts, src/features/projects/components/project-form.tsx, src/app/admin/(panel)/proyectos/[id]/page.tsx, e2e/admin-projects.spec.ts, e2e/admin-session.ts, e2e/db.ts]
  modified: [src/db/columns.ts, src/features/site-settings/schema.ts, src/features/site-settings/fixture.ts, src/lib/dal.ts, src/features/projects/queries.ts, docs/data-model.md, docs/decisions.md, src/lib/cache-tags.ts]
decisions:
  - "draft jsonb per row; publish copies it to columns with db.batch; saves never call updateTag"
  - "Form message state lives outside the keyed form body so it survives the post-publish refresh"
  - "Tracer e2e uses its own complete fixture project, never the seeded ones"
requirements-completed: [ADMN-03, ADMN-05, ADMN-09, ADMN-12]
metrics:
  completed: 2026-11-16
---

# Phase 3 Plan 03: Draft/publish tracer and project data layer Summary

Migration 0002 (nullable `draft` jsonb on five tables, `site_settings.status`) applied to Neon dev, draft-aware public cores, project actions (save, publish, discard, create) with slug lock, uniqueness and session-first guards, a recursive Tiptap allowlist, and a minimal admin edit page proven by a tracer e2e.

## Tasks and commits

1. `6537ece` feat(db): draft column and site_settings status (migration 0002). SQL is six ADD COLUMN statements, no drop. Applied to `ep-floral-queen` (dev) only; main migrates at the 03-13 push.
2. `b2d7ccb` feat(admin): project draft/publish tracer. e2e passes: a draft of a published project stays off `/es/proyectos/<slug>`, Publicar shows it without redeploy.
3. TDD: RED `3794e75` (17 failing tests on assertions: slug rules, allowlist rejections, action behavior; rich-text schema was a permissive stub so tests failed on assertions, not imports), GREEN `8ce5d86`. No refactor commit.
4. `66a0246` docs: decisions log.

Restore cycle (export, `seed --from-content --force`, export) diff empty against the verified dev target. `pnpm check` passes.

## Deviations from Plan

**1. [Rule 1 - Bug] Seeded projects cannot be published, so the tracer e2e uses a fixture.** The three required publish fields (tagline, problem, role) are null on every seeded project, so `firstPublishedProject()` would have failed the restore Publicar step and left a stuck draft on real content. The spec inserts `e2e-tracer-project` (complete, published, order 999) and deletes it afterwards; `firstPublishedProject` stays exported in `e2e/db.ts` as specified. Stale draft left by my first failed run was cleared.

**2. [Rule 1 - Bug] Form message lost after publish.** `updateTag` refreshes the route, the keyed form remounted and cleared its local message. `ProjectForm` now holds the message outside the keyed `ProjectFormBody`.

**3. [Rule 3 - Blocking] `src/features/site-settings/fixture.ts`** needed `status` and `draft` to satisfy the new row type.

**4. Slug message constants** live in `validation.ts` (a test asserts equality with `messages/es.json`) instead of importing the whole messages file into the client bundle.

**5. Empty strings become null** for nullable text, URL, cover and date columns in `toColumns`, so form defaults never write `""` into columns.

## Known limits

- The form body is intentionally minimal (two title inputs); 03-05 replaces it.
- `node --env-file=.env.local` in the plan's host-assertion command is blocked by the secret-read hook; target was verified through the `seed target:` and `migrate target:` lines (`ep-floral-queen`).
- No classifier-validated TAP RED record (`gsd_run` unavailable); semantic assessment: the target tests failed on the planned assertions.

## Pending manual items

None new. BLOB_READ_WRITE_TOKEN still pending (H: luego); exports skip with a warning on Vercel without it.

## Self-Check: PASSED

Commits 6537ece, b2d7ccb, 3794e75, 8ce5d86, 66a0246 exist; created files present; `pnpm check` green.
