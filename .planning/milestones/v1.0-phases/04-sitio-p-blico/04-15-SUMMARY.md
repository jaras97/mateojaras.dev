---
phase: 04-sitio-p-blico
plan: 15
subsystem: site/case-study
tags: [gap-closure, next-intl, e2e, G-04-2]
requires: []
provides:
  - "Case studies with gallery media render in en and es"
affects: [src/app/[locale]/projects/[slug]/page.tsx]
key-files:
  modified:
    - src/app/[locale]/projects/[slug]/page.tsx
    - src/components/site/case-study/case-study.test.tsx
    - e2e/case-study.spec.ts
key-decisions:
  - "Use t.raw(\"figure\") as string at the call site, matching the public-site convention; CaseGallery and catalogs untouched"
requirements-completed: [CASE-02, CASE-01]
duration: 10 min
completed: 2026-11-24
---

# Phase 4 Plan 15: Case gallery FORMATTING_ERROR fix Summary

One-line fix passing the raw ICU template (`t.raw("figure")`) to CaseGallery, so case studies with gallery media no longer throw FORMATTING_ERROR; locked by catalog-backed unit tests and an en/es e2e with a gallery fixture.

## Accomplishments

- page.tsx now passes `t.raw("figure") as string` (commit b7a7821).
- Unit tests feed the real `Site.project.figure` from messages/en.json and es.json into CaseGallery and assert "01 / 02" and "02 / 02"; cover-only renders nothing. These tests do not render page.tsx, so they are not sensitive to reverting the page change; only the e2e is.
- E2E `withGalleryFixture` (cover + one non-cover image) opened in en and es: h1, figure with "01 / 01" figcaption, localized img alt, no error title, no FORMATTING_ERROR (commit 3a8359b).

## Verification

- `pnpm vitest run` on case-study.test.tsx: 20 passed. `pnpm typecheck`: pass.
- `pnpm exec playwright test e2e/case-study.spec.ts`: 9 passed (including the two new cases). The server logs upstream image 404/400 for the fixture blob host, expected and unasserted.
- `pnpm check`: exit 0.
- I did not revert page.tsx to confirm the e2e fails without the fix.

## Deviations from Plan

None - plan executed exactly as written. (Biome reordered the JSON imports in the test file.)

## Self-Check: PASSED

Commits b7a7821 and 3a8359b exist; modified files present.
