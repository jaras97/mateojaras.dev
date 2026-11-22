---
phase: 04-sitio-p-blico
plan: 01
subsystem: public-site
tags: [next-intl, routing, i18n, a11y, docs]
requires: []
provides:
  - "/about and /contact routes (en, /es/sobre-mi, /es/contacto)"
  - "single main#main landmark and skip link in the locale layout"
  - "every phase 4 interface string in messages/en.json and messages/es.json"
  - "phase 4 decisions log and data-model notes"
affects: [04-03, 04-06, 04-07, 04-08, 04-09, 04-10]
tech-stack:
  added: []
  patterns:
    - "getPathname for hrefs built outside React (hero CTA)"
    - "vitest inlines next-intl so navigation helpers resolve in unit tests"
key-files:
  created:
    - src/app/[locale]/about/page.tsx
    - src/app/[locale]/contact/page.tsx
    - e2e/routes.spec.ts
  modified:
    - src/i18n/routing.ts
    - src/i18n/routing.test.ts
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/app/[locale]/projects/[slug]/page.tsx
    - src/app/[locale]/not-found.tsx
    - src/components/site/hero-copy.ts
    - e2e/headers.spec.ts
    - messages/en.json
    - messages/es.json
    - src/lib/messages.test.ts
    - vitest.config.ts
    - docs/decisions.md
    - docs/data-model.md
    - .env.example
key-decisions:
  - "[propuesta] strings shipped as pending P6, not approved"
  - "messages ownership: only 04-08 may later delete Site.home.projectsHeading"
requirements-completed: [SITE-04, CONT-01]
duration: 20 min
completed: 2026-11-22
---

# Phase 4 Plan 01: Routes tracer, strings and decisions Summary

/about and /contact are live in both locales behind next-intl pathnames, with one `main#main` landmark and skip link in the layout, and every phase 4 string and decision is logged once.

## Accomplishments
- Pathnames `/about` (`/es/sobre-mi`) and `/contact` (`/es/contacto`); routing tests cover both.
- Layout renders the skip link first and the only `<main id="main" tabIndex={-1}>`; the three existing pages switched to `<div>`.
- Hero CTA href now comes from `getPathname`; `CTA_HREF` removed.
- About page (H1 + bio when non-empty) and Contact page (H1 + intro + mailto) with real content.
- All Site.*, Admin.images and Admin.messages strings added with parity; test guards em-dashes, emojis and "!".
- decisions.md (D-05, D-10, P1-P5 and Claude decisions), data-model.md (`email_sent_at`, media caption fields), `.env.example` cleaned.

Commits: b0b3bf0 (Task 1), 7eb2631 (Task 2).

## Verification
- `pnpm check` green (typecheck, lint, 293+ unit tests, build).
- e2e routes, headers and public specs green (routes: 5/5).

## Deviations from Plan

**1. [Rule 3 - Blocking] vitest could not resolve `next/navigation` through next-intl**
- Found during: Task 1. Importing `src/i18n/navigation` in unit tests (routing test, hero-copy) failed.
- Fix: `test.server.deps.inline: ["next-intl"]` in `vitest.config.ts`.
- Commit: b0b3bf0

**2. [Rule 1 - Spec mismatch] `/es/about` redirects instead of returning 404**
- Found during: Task 1 e2e. next-intl canonicalizes English pathnames under /es to the localized ones (same as `/es/projects/[slug]`), and Cache Components also make the status unreliable.
- Fix: the e2e asserts the redirect to `/es/sobre-mi` (and `/es/contacto`), so `/es/about` is never served.
- Commit: b0b3bf0

**Total deviations:** 2 auto-fixed. **Impact:** none on scope.

## Known Stubs
None. About and Contact pages are minimal by design; 04-06, 04-07 and 04-09 expand them.

## Self-Check: PASSED
Files and commits b0b3bf0, 7eb2631 verified; acceptance greps pass.
