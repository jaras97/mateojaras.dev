---
phase: 03-panel-admin-cv
plan: 04
subsystem: admin-shell-projects-list
tags: [admin, shell, dnd-kit, tanstack-table, server-actions, e2e]
requires: [03-01, 03-03]
provides: [Spanish admin shell, panel checklist, NavigationBlocker, SortableList, DeleteConfirm, project list actions, /admin/proyectos]
affects: [03-05, 03-06, 03-07, 03-08, 03-09]
key-files:
  created: [src/components/admin/admin-nav.tsx, src/components/admin/admin-link.tsx, src/components/admin/navigation-blocker.tsx, src/components/admin/mobile-menu.tsx, src/components/admin/status-badge.tsx, src/components/admin/list-header.tsx, src/components/admin/sortable-list.tsx, src/components/admin/delete-confirm.tsx, src/lib/bilingual.ts, src/features/admin/panel-queries.ts, src/features/projects/list-actions.ts, src/features/projects/components/projects-table.tsx, src/app/admin/(panel)/proyectos/page.tsx, e2e/admin-shell.spec.ts, e2e/admin-reorder.spec.ts]
  modified: [src/app/admin/(panel)/layout.tsx, src/app/admin/(panel)/_components/auth-gate.tsx, src/app/admin/(panel)/page.tsx, e2e/auth.spec.ts, e2e/db.ts, messages/es.json, messages/en.json]
decisions:
  - "Projects list renders a bare <table>, not the shadcn Table wrapper: its overflow-x-auto container breaks dnd-kit keyboard coordinates (ArrowDown never changes the over row)"
  - "Sortable rows use CSS.Translate, not CSS.Transform, so differently sized rows do not stretch while dragging"
  - "Added Admin.dnd.roleDescription (es and en) to replace dnd-kit's English aria-roledescription"
metrics:
  completed: 2026-11-16
requirements-completed: [ADMN-01, ADMN-03, ADMN-05, ADMN-06, ADMN-12]
---

# Phase 3 Plan 04: Admin shell and projects list Summary

Spanish admin shell (240px sidebar, Menú Sheet below 1024px, numbered nav with unread badge, navigation blocker, toasts), a Neon-backed panel checklist, and `/admin/proyectos` with keyboard reorder, live Visible/Destacado switches, type-to-confirm delete and discard of pending drafts.

## Tasks and commits

1. `3d6d7cf` feat(admin): shell, numbered nav and panel checklist. Tracer; `admin-shell` and `auth` e2e pass, axe clean on /admin.
2. TDD for the list actions: RED `ecd24cc` (11 tests failing on assertions against a permissive stub), GREEN `565844f` (11 pass). No refactor commit.
3. `50a7765` feat(admin): projects list (UI, ProjectsTable on TanStack Table v9, SortableList, DeleteConfirm).
4. `e38fb58` test(admin): e2e for reorder, visibility and delete (5 tests pass; axe clean on /admin/proyectos).

`pnpm check` passes (153 unit tests, build).

## Deviations from Plan

**1. [Rule 1 - Bug] shadcn Table wrapper breaks keyboard dnd.** Its `overflow-x-auto` container made ArrowDown a no-op (over stayed on the lifted row). The list uses a bare `<table>` with the shadcn row/cell parts.

**2. [Rule 1 - Bug] Dragged row stretched** (scaleY 1.17) with `CSS.Transform`; switched to `CSS.Translate`.

**3. [Rule 2 - Missing] `Admin.dnd.roleDescription`** added to es and en messages so assistive tech does not read dnd-kit's English "sortable".

**4. [Rule 3 - Blocking] `MobileMenu`** client component added (not in the plan's file list) to hold the Sheet state and close it on route change.

**5. aria-current e2e** moved from admin-shell (route did not exist in task 1) to admin-reorder ("the list marks the active nav entry").

**6. Acceptance grep** `grep -A1 export async function | grep -c requireActionSession` prints 1, not 4: visible/featured delegate to a shared `setFlag` that calls `requireActionSession` first; the no-session unit test covers all four.

## Findings worth knowing (not fixed here)

- **Prerendered public pages serve stale HTML once after `updateTag`.** Hiding a published project: the first request to `/es/proyectos/<slug>` still returns the old page, the next one is correct (the home list updates immediately). The e2e reloads until the page settles. Relevant to the "no redeploy" promise for prerendered slugs; worth a check in phase 5 or on Vercel.
- dnd-kit attaches its key listeners on a timeout after the lift; a key sent in the same tick is dropped. The e2e waits 300 ms after Space.
- Build logs NeonDbError "fetch() rejects when the prerender is complete" for admin routes (session read during prerender). Build and runtime are fine; pre-existing pattern from AuthGate.

## Data safety

During development a debugging script reordered the seeded projects once; I restored the seeded order (Centro, EcoExport, Finanzas, Sistema) through the UI and verified it in the database. The final e2e run asserts order and visibility are unchanged in `afterAll`. No seeded content was edited or deleted.

## Pending manual items

None new. BLOB_READ_WRITE_TOKEN still pending (H: luego). `/admin/proyectos/nuevo` (Nuevo proyecto link) arrives in 03-05.

## Known Stubs

None.

## Self-Check: PASSED

Commits 3d6d7cf, ecd24cc, 565844f, 50a7765, e38fb58 exist; created files present; `pnpm check` green; final e2e run 5/5 passed.
