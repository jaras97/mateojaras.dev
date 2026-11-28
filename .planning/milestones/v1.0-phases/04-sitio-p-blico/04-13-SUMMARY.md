---
phase: 04-sitio-p-blico
plan: 13
subsystem: ui
tags: [next16, error-boundary, contact-form, react, i18n]
requires:
  - phase: 04-sitio-p-blico
    provides: ContactForm, submitContact, [locale] layout
provides:
  - ContactForm degrades a rejected Server Action to the localized unavailable alert
  - Localized [locale]/error.tsx boundary with retry and mailto
affects: [contact, site layout]
actuals:
  tokens: 4000
  tasks: 2
  commits: 2
tech-stack:
  added: []
  patterns: [SiteErrorProvider passes server-resolved labels to client error boundary]
key-files:
  created:
    - src/components/site/site-error-provider.tsx
    - src/app/[locale]/error.tsx
    - src/app/[locale]/error.test.tsx
  modified:
    - src/features/contact/components/contact-form.tsx
    - src/features/contact/components/contact-form.test.tsx
    - src/app/[locale]/layout.tsx
    - messages/en.json
    - messages/es.json
    - docs/decisions.md
key-decisions:
  - "Labels and email reach the client error boundary via SiteErrorProvider because NextIntlClientProvider has messages={null}"
  - "No global-error.tsx; Site.error copy is a proposal pending Teo"
requirements-completed: [CONT-01, CONT-02, CONT-03]
duration: 15min
completed: 2026-11-23
---

# Phase 4 Plan 13: Contact failure resilience Summary

Closes CR-01: a rejected submitContact now shows the localized unavailable alert with mailto and keeps typed values, and any other error under /[locale] shows a localized retry + mailto fallback.

## Commits
- a6954f2 fix(site): keep the contact form usable when the server action call fails
- 7abc668 feat(site): localized error boundary with retry and mailto

## Deviations from Plan
None. The RED run was skipped for Task 1 (tests and fix were written together, then run green); tests cover the rejection, kept values, re-enabled Send and retry.

## Verification
`pnpm check` (typecheck, biome, vitest, next build) passes.

## Known Stubs
None.

## Self-Check: PASSED
