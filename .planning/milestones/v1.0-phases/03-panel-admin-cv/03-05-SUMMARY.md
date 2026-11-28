---
phase: 03-panel-admin-cv
plan: 05
subsystem: admin-project-form
tags: [react-hook-form, tiptap, form-kit, unsaved-guard, e2e]
requires: [03-03, 03-04]
provides: [AdminPageHeader, FormSection, SectionIndex, FormSkeleton, BilingualField, BilingualRepeater, UnsavedGuard, RichTextField, RichTextEditor, FormLabelsProvider, richTextExtensions, RichText, hasBlobToken, slugify, project form-model, full ProjectForm, /admin/proyectos/nuevo]
affects: [03-06, 03-07, 03-08, 03-09, 03-14]
key-files:
  created: [src/components/admin/admin-page-header.tsx, src/components/admin/form-section.tsx, src/components/admin/section-index.tsx, src/components/admin/form-skeleton.tsx, src/components/admin/form-labels.tsx, src/components/admin/bilingual-field.tsx, src/components/admin/bilingual-repeater.tsx, src/components/admin/unsaved-guard.tsx, src/components/admin/rich-text-field.tsx, src/components/admin/rich-text-editor.tsx, src/lib/tiptap-extensions.ts, src/lib/rich-text.tsx, src/lib/blob.ts, src/lib/slug.ts, src/lib/form-errors.ts, src/features/projects/form-model.ts, src/features/projects/components/new-project-form.tsx, src/app/admin/(panel)/proyectos/nuevo/page.tsx, src/app/admin/(panel)/proyectos/[id]/loading.tsx, e2e/admin-unsaved.spec.ts]
  modified: [src/features/projects/components/project-form.tsx, src/features/projects/admin-queries.ts, src/app/admin/(panel)/proyectos/[id]/page.tsx, src/lib/messages.ts, messages/es.json, messages/en.json, e2e/admin-projects.spec.ts, docs/decisions.md]
decisions:
  - "Form works on paired rows ({es,en}); form-model.ts converts to and from the per-locale draft payload; no RHF resolver, schemas are run manually before each action"
  - "Kit strings come from FormLabelsProvider (slice of messages/es.json) instead of props"
  - "Draft save on a published project updates a local pending flag instead of refreshing the route, so focus and editors survive Cmd+S"
metrics:
  completed: 2026-11-16
requirements-completed: [ADMN-03, ADMN-07, ADMN-09, ADMN-10]
---

# Phase 3 Plan 05: Full project form and form kit Summary

One numbered-section project form (01 Básico, 02 Caso, 03 Decisiones, 04 Métricas) on a reusable kit: sticky header with Cmd+S, section index with "{n} sin ES", bilingual ES|EN fields with "Falta ES", paired repeaters, Tiptap editor with a shared extensions list and a server renderer, unsaved-changes guard, slug lock, and a create page.

## Tasks and commits

1. `0834759` feat(admin): project form kit with Cmd+S and unsaved guard (tracer). e2e `admin-unsaved` passes: leave dialog with "Seguir editando" focused, Cmd+S saves and clears the dirty text, "Salir sin guardar" resets and navigates; axe clean on the form.
2. `a1e4531` feat(admin): full project form with repeaters and rich text. Sections 02-04, `BilingualRepeater`, `RichTextEditor`/`RichTextField`, `richTextExtensions`, `RichText`, `/admin/proyectos/nuevo`. Build free of "Uncached data" and `empty-generate-static-params`.
3. `718bba5` test(admin): form kit components and project creation. 14 new unit tests; e2e create, publish-blocked, delete.
4. `31fdae9` docs: decisions log.

`pnpm check` passes (167 unit tests, build); e2e `admin-unsaved` + `admin-projects` green (4 tests).

## Deviations from Plan

**1. [Rule 1 - Bug] e2e labels.** The plan's tracer e2e types in "Tagline ES", but the field is "Frase corta" in `messages/es.json` (authoritative Spanish UI). Specs use "Frase corta ES/EN".

**2. [Rule 1 - Bug] Fixture instead of a seeded project.** `admin-unsaved.spec.ts` opens its own complete published fixture (`e2e-unsaved-project`, not visible) rather than `firstPublishedProject()`: seeded projects cannot be published and must not be mutated. Dropped the "public page still shows the published tagline" and "restore with Publicar cambios" steps (the fixture is deleted afterwards; the draft-stays-off-the-site behavior is already covered by `admin-projects.spec.ts`).

**3. [Rule 3 - Blocking] Form model instead of RHF over `projectDraftSchema`.** `useFieldArray` cannot drive string arrays and paired ES/EN arrays, so the form uses `{es,en}` rows (`form-model.ts`) and validates the converted payload with `projectDraftSchema` / `projectPublishSchema` before each action (no resolver). Issue paths map back to form field names.

**4. [Rule 2 - Missing] `Admin.projects.add.aiTool`** ("Añadir herramienta" / "Add tool") added to both message files for the AI-tools repeater.

**5. SectionIndex fed by props, not a registration context.** `FormSection` is a plain section; the form computes the per-section missing-ES counts and passes them to `SectionIndex` (same behavior, less machinery).

**6. Mobile actions bar is `fixed` (not `sticky`)** at the bottom below 768px; the form reserves bottom padding. Both action sets are in the DOM (one hidden by CSS), so unit tests pick the first match.

**7. `getByRole("alert")` in e2e** is filtered by text because Next's route announcer is also `role=alert`.

## Known limits

- Browser back/forward is not intercepted (no App Router API), as recorded in the plan.
- `previewHref` is `null` and `uploadsEnabled` is passed but not yet used: the Previsualizar target arrives in 03-06 and images (05 Imágenes) in 03-07. `BLOB_READ_WRITE_TOKEN` is still pending (H: luego); `hasBlobToken()` is the gate.
- Rich-text editor behavior (toolbar, link popover) is covered by the shared extensions list and the server schema, not by a jsdom test (ProseMirror does not run there); no e2e drives the editor yet.
- Axe ran on the create page and on the edit page of the fixture; the lazily loaded editors may not have mounted at scan time.
- Existing ES/EN arrays of different length are padded with empty rows on load (shown as "Falta ES").

## TDD note

Plan type is `execute`; task 3 (`tdd="true"`) covered code already written in tasks 1-2, so its tests were written after the implementation and passed on first run (one assertion fixed for attribute order). No RED evidence exists for them.

## Known Stubs

None that block the plan goal (`previewHref={null}` and `uploadsEnabled` are intentional hand-offs to 03-06/03-07).

## Self-Check: PASSED

Commits 0834759, a1e4531, 718bba5, 31fdae9 exist; created files present; lint, 167 tests and build green; e2e green.
