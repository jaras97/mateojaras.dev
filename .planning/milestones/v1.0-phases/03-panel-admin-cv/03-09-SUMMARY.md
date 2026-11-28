---
phase: 03-panel-admin-cv
plan: 09
subsystem: admin-experience
tags: [admin, experience, draft-publish, dnd-kit, react-hook-form, e2e]
requires: [03-04, 03-05]
provides: [experience actions (7), getExperiences, getExperiencesCore, experience admin queries, ExperienceForm, ExperienceTable, /admin/experiencia routes]
affects: [03-11, 03-12]
key-files:
  created: [src/features/experience/queries.ts, src/features/experience/validation.ts, src/features/experience/actions.ts, src/features/experience/admin-queries.ts, src/features/experience/form-model.ts, src/features/experience/components/experience-form.tsx, src/features/experience/components/experience-table.tsx, src/features/experience/components/new-experience-form.tsx, src/app/admin/(panel)/experiencia/page.tsx, src/app/admin/(panel)/experiencia/nueva/page.tsx, src/app/admin/(panel)/experiencia/[id]/page.tsx, e2e/admin-experience.spec.ts]
  modified: []
decisions:
  - "Experience form labels arrive through an explicit `experience` prop instead of widening FormMessages, so the shared kit and its tests stay untouched"
  - "Draft save of a published row keeps column edits and skillIds/projectIds together in the draft jsonb; relations are written only on never-published saves and on publish"
metrics:
  completed: 2026-11-16
requirements-completed: [ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-12, IDEN-07]
---

# Phase 3 Plan 09: Experience admin Summary

Experience CRUD on the shared kit: list with keyboard/drag reorder, live Visible switch and typed delete; three-section form (01 Puesto, 02 Logros with the paired ES|EN bullets repeater, 03 Relaciones) with draft/publish, plus the cached public read the CV builder will use.

## Task and commit

1. `f13eb76` feat(admin): experience CRUD with bullets, relations and reorder. `pnpm check` green (219 unit tests incl. 15 new for queries/actions and 3 for the form model; build). e2e `admin-experience` 3/3 passed on a production build; axe (serious/critical) clean on the list, the create page and the edit form.

## Behavior

- Actions: `createExperience`, `saveExperienceDraft`, `publishExperience`, `discardExperienceDraft`, `reorderExperiences`, `setExperienceVisible`, `deleteExperience` (typed company). All check `requireActionSession()` first (unit test covers all seven). `updateTag(tags.experience)` only on publish, visible, reorder and delete of a published row; draft saves and discards call none.
- Publish rule: company, role ES/EN, type, start date; every bullet pair filled in both languages; end date not before start.
- Relations (`experience_skills`, `experience_projects`) use `db.batch` delete + insert on publish and on saves of a never-published row; a published row keeps pending relation ids inside `draft`.
- Public read: `getExperiences()` is `'use cache'` + `cacheTag(tags.experience)` + `cacheLife("max")`, published and visible only, ordered, never carrying `draft`; `getExperiencesCore({ includeDrafts })` overlays the draft for Draft Mode and the CV builder.
- List columns: Empresa, Puesto, Tipo, Fechas (mono, "ago 2021 – ago 2025" or "Actualidad"), Estado, Visible; bare `<table>` (dnd-kit keyboard), stacks below 768px, empty state.

## Deviations from Plan

**1. [Rule 3 - Blocking] Labels via prop, not FormLabelsProvider.** Adding `experience` to `FormMessages` broke five existing call sites and tests; `ExperienceForm` and `NewExperienceForm` take `experience` as a prop instead.

**2. [Rule 3 - Blocking] `new-experience-form.tsx` and `form-model.ts` added** (not in the plan's file list): `/nueva` needs a client form, and paired bullet rows need the same ES/EN conversion layer used by projects.

**3. Acceptance grep** `grep -A1 export async function | grep -c requireActionSession` prints fewer than 7 because several signatures span lines; each action calls `requireActionSession()` as its first statement and the unit test asserts all seven return `session`.

## Data safety

The e2e creates `Empresa temporal e2e`, publishes, moves it by keyboard and back, deletes it; `afterAll` deletes by company and asserts the seeded experiences keep id, company and order. No seeded row was edited, published or reordered, and no Sofka text was written.

## Known limits

- No Previsualizar button (`previewHref` undefined): experience has no public route yet.
- The admin Skills checkbox list is empty until skills have rows (03-14 builds their CRUD); it reuses `listSkillOptionsForAdmin` from projects.
- Dates in the list use `es` short months, so September reads "sept".

## Pending manual items

None new. BLOB_READ_WRITE_TOKEN still pending (H: luego); this plan does not need it.

## Known Stubs

None.

## Self-Check: PASSED

Commit f13eb76 exists; created files present; `pnpm check` and e2e green.
