---
phase: 03-panel-admin-cv
plan: 08
subsystem: admin-settings-education
tags: [admin, site-settings, education, draft-publish, draft-mode, e2e]
requires: [03-04, 03-05, 03-06]
provides: [settings actions (3), SettingsForm, /admin/ajustes, education actions (7), getEducation, getEducationCore, EducationForm, EducationTable, /admin/educacion routes]
affects: [03-11, 03-12]
key-files:
  created: [src/features/site-settings/validation.ts, src/features/site-settings/actions.ts, src/features/site-settings/admin-queries.ts, src/features/site-settings/form-model.ts, src/features/site-settings/components/settings-form.tsx, src/app/admin/(panel)/ajustes/page.tsx, src/features/education/queries.ts, src/features/education/validation.ts, src/features/education/actions.ts, src/features/education/admin-queries.ts, src/features/education/components/education-form.tsx, src/features/education/components/education-table.tsx, src/features/education/components/new-education-form.tsx, src/app/admin/(panel)/educacion/page.tsx, src/app/admin/(panel)/educacion/nueva/page.tsx, src/app/admin/(panel)/educacion/[id]/page.tsx, e2e/admin-settings.spec.ts, e2e/admin-education.spec.ts]
decisions:
  - "Settings and education labels reach the forms through an explicit prop slice (levels, discard dialog, education/settings messages), not by widening FormMessages"
  - "Time zones are validated with new Intl.DateTimeFormat({ timeZone }) in try/catch (accepts every zone Intl knows, aliases included); Intl.supportedValuesOf omits aliases such as UTC"
  - "Education create needs institution and the ES program only; the EN program may be empty until publish (so publish can be blocked on it)"
metrics:
  completed: 2026-11-16
requirements-completed: [ADMN-02, ADMN-04, ADMN-05, ADMN-07, ADMN-12]
---

# Phase 3 Plan 08: Settings and education admin Summary

Site settings (six numbered sections, ES|EN, SEO counters, CEFR languages repeater) edited with draft, home preview through `/api/draft?kind=home` and publish, plus education CRUD on the shared kit with the cached public read the CV builder will use.

## Commits

- `c821be7` test(03-08): failing tests for settings validation and actions (RED)
- `8213498` feat(admin): site settings with draft, preview and publish (GREEN + tracer e2e)
- `99b9289` test(03-08): failing tests for education queries and actions (RED)
- `3060885` feat(03-08): education reads, validation and actions (GREEN)
- `0f6cf8e` feat(admin): education CRUD with draft and publish (UI + e2e)

## RED evidence

- Settings: stub schemas (`z.any()`) and stub actions returning ok. 14 of 15 tests failed on assertions of the planned behavior (from_date without date, "Mars/Phobos", level "B3", http links, strict keys, SEO caps, session, draft-only save, publish tag). Valid RED.
- Education: stub query without filters and stub actions returning ok. 14 of 15 tests failed on assertions (SQL filter, draftless reads, session, draft rule, publish validation, reorder, delete). The "does not filter when drafts are included" test passed against the stub by construction. Valid RED.

## Behavior

- Settings: `saveSettingsDraft` writes only `site_settings.draft` while the row is published, `publishSettings` copies into the columns and clears the draft and calls only `updateTag(tags.settings)`, `discardSettingsDraft` clears the draft; none of save/discard touches a tag. A "Descartar cambios" button with a confirm dialog appears in the form when a draft is pending. Previsualizar uses `draftPreviewHref({ kind: "home" })` (hardened `/api/draft` and `safeReturnPath` untouched).
- Publish rules: name, headline and bio en/es, valid email, availableFrom when from_date, known time zone, https-only GitHub/LinkedIn/Cal.com, CEFR `native|A1..C2`; the draft schema already enforces shapes, https links and the 60/160 SEO caps. Rich text uses `richTextDocSchema`.
- Education: seven actions, `updateTag(tags.education)` only on publish, visible, reorder and delete of a published row. `getEducation()` is `'use cache'` + `cacheTag(tags.education)` + `cacheLife("max")`, published and visible only, ordered, no `draft`; `getEducationCore({ includeDrafts })` overlays the draft for Draft Mode and the CV.
- List: Institución, Programa (ES, EN below), Fechas ("ago 2021 – ago 2025", "Actualidad", em dash when there are no dates), Estado, Visible switch, menu with typed delete; empty state "Todavía no hay formación" with "Nueva formación".

## Verification

- `pnpm check` exit 0 (typecheck, biome, vitest, build). 11 education and 8 settings unit tests plus 4 education query tests, all green.
- e2e `admin-settings` 1/1 and `admin-education` 2/2 passed on a production build; axe (serious/critical) clean on /admin/ajustes, /admin/educacion and the education edit form.
- Settings e2e: snapshots every column except `updated_at`, saves a draft, checks the cookieless home still shows the published name, previews with the band and the draft name, publishes, checks the visitor sees the new name, restores the original name through Publicar, with a `finally` plus `afterAll` SQL safety net; both assert `toEqual(original)`. The row ended exactly as it started.

## Deviations from Plan

**1. [Rule 3 - Blocking] Extra files.** `form-model.ts` (settings Zod path to field name) and `new-education-form.tsx` (client form for `/nueva`, mirrors experience). Not in the plan's file list.

**2. [Rule 1 - Bug] Create schema.** Plan e2e needs publish blocked on the EN program, which the experience-style create form (all fields required) would prevent; `createEducationSchema` requires institution and ES program only, the EN program may be empty until publish.

**3. Acceptance grep** `grep -A1 export async function | grep -c requireActionSession` prints 3 for settings but 2 for education: several signatures span lines. Each of the seven actions calls `requireActionSession()` first and the unit test asserts all seven return `session` (same note as 03-09).

**4. e2e scoping.** With Cache Components the previous route stays mounted hidden, so the education e2e scopes "Programa EN" to `#programa`.

## Known limits

- Settings form has no dedicated preview for ES vs EN: Previsualizar opens the ES home (`/es`, the helper default).
- The settings form's `now` rich text uses the shared editor; round trip was not changed by the e2e (the row restored equal).
- Timezone is a free text input (validated), not a picker.

## Pending manual items

- Visual check and `/impeccable:audit` / `/impeccable:critique` on /admin/ajustes and /admin/educacion (slash commands not invokable from this agent).
- `BLOB_READ_WRITE_TOKEN` still pending (H: luego); not needed here.

## Known Stubs

None.

## Self-Check: PASSED

Commits c821be7, 8213498, 99b9289, 3060885, 0f6cf8e exist; created files present; `pnpm check` and the two e2e specs green.
