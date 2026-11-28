---
phase: 03-panel-admin-cv
plan: 14
subsystem: admin-skills
tags: [admin, skills, draft-publish, dnd-kit, react-hook-form, e2e, tdd]
requires: [03-04, 03-05]
provides: [skills actions (8), getSkills, getSkillsCore, skills admin queries, SkillForm, SkillsTable, /admin/skills routes]
affects: [03-11, 03-12]
key-files:
  created: [src/features/skills/queries.ts, src/features/skills/validation.ts, src/features/skills/actions.ts, src/features/skills/admin-queries.ts, src/features/skills/components/skill-form.tsx, src/features/skills/components/skills-table.tsx, src/features/skills/components/new-skill-form.tsx, src/app/admin/(panel)/skills/page.tsx, src/app/admin/(panel)/skills/nueva/page.tsx, src/app/admin/(panel)/skills/[id]/page.tsx, e2e/admin-skills.spec.ts]
  modified: [messages/en.json, messages/es.json]
decisions:
  - "Skill draft payload carries `featured` like any column; setSkillFeatured also patches a pending draft so publishing it later does not undo the list switch"
  - "Publish schema equals the draft schema: name is trimmed non-empty in both because the column is not null and unique"
  - "Name uniqueness is checked with a select before writing (clean fieldErrors.name = taken) and a 23505 unique violation is mapped to the same conflict as a race fallback"
metrics:
  completed: 2026-11-16
requirements-completed: [ADMN-04, ADMN-05, ADMN-06, ADMN-12]
---

# Phase 3 Plan 14: Skills admin Summary

Skills CRUD on the shared kit: list grouped by category (one SortableList and mono category header per group, reorder only inside a category by drag or keyboard), live Destacado and Visible switches, typed delete, single-section form with draft/publish, and the cached public read the CV builder uses.

## TDD

- RED `fd1ac22`: 21 unit tests (actions, queries, validation) against inert stubs; 19 failed on the planned assertions (session guard, conflict, reorder set equality, tag calls, years bounds, order by), 2 passed trivially (null/0/50 accepted, unfiltered query). Semantic assessment: failures were assertion failures against stubs, not import or syntax errors. The gsd RED classifier was not run (no record file produced).
- GREEN `58a0773`: implementation; one test fix in this commit (the `order by` expectation lacked drizzle's `asc` suffix, a test bug).
- Feature/UI `8295645`: components, pages, messages, e2e. No refactor commit.

## Behavior

- Actions (8): `createSkill`, `saveSkillDraft`, `publishSkill`, `discardSkillDraft`, `reorderSkills(category, ids)`, `setSkillVisible`, `setSkillFeatured`, `deleteSkill` (typed name). Each calls `requireActionSession()` first; unit test covers all eight.
- Tags: publish, visible, reorder, featured and delete of a published row call `updateTag(tags.skills)` and `updateTag(tags.projects)`; draft saves, discards, create and delete of a draft row call none.
- `reorderSkills` refuses ids of another category or an incomplete set before any write (T-03-33).
- Duplicate name returns `{ ok:false, error:"conflict", fieldErrors:{ name:["taken"] } }`; form shows "Ya hay una skill con este nombre".
- Public read: `getSkills()` is `'use cache'` + `cacheTag(tags.skills)` + `cacheLife("max")`, published and visible only, ordered category then order, never carrying `draft`; `getSkillsCore({ includeDrafts })` overlays drafts for Draft Mode and the CV builder.
- List columns: Nombre, Categoría, Años, Destacado, Estado, Visible; stacks below 768px; empty state; bare `<table>` per category.

## Deviations from Plan

**1. [Rule 3 - Blocking] `new-skill-form.tsx` added** (not in the plan's file list): `/skills/nueva` needs a client form.

**2. [Rule 2 - Missing] New message keys** `Admin.skills.nameTaken`, `Admin.skills.yearsInvalid`, `Admin.toasts.featuredOn/featuredOff` in es and en; labels flow through the existing `skills` slice of FormMessages, so the kit was not extended.

**3. Acceptance grep** `grep -A1 export async function | grep -c requireActionSession` is below 8 where signatures span lines; each action calls `requireActionSession()` first and the unit test asserts all eight return `session`.

## Data safety

The e2e creates `Skill temporal e2e` and `Skill temporal e2e B` in tools, publishes the first, moves it by keyboard and back, toggles Destacado on and off, deletes it; `afterAll` deletes both by name pattern and asserts the snapshot of every seeded skill (id, name, category, order, featured, visible, status) is unchanged and no `temporal e2e` row remains. Seeded skills were never edited.

## Verification

`pnpm check` green (240 unit tests, build). e2e `admin-skills` 4/4 passed; axe (serious/critical) clean on the list, the edit form and the list after switches.

## Known limits

- No Previsualizar button (`previewHref` undefined).
- Mobile (390px) stacking and the empty state were not captured with screenshots in this plan.
- Build logs show a HANGING_PROMISE_REJECTION notice for `/admin/skills/[id]` prerender (dynamic admin routes under cacheComponents); the build succeeds.

## Pending manual items

None new. BLOB_READ_WRITE_TOKEN still pending (H: luego); this plan does not need it.

## Known Stubs

None.

## Self-Check: PASSED

Commits fd1ac22, 58a0773, 8295645 exist; created files present; `pnpm check` and e2e green.
