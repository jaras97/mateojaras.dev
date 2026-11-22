---
phase: 04-sitio-p-blico
plan: 12
subsystem: site-ui-primitives
tags: [reveal, css, copy-email, segment-line, page-section]
requires: []
provides:
  - Reveal, PageSection, pageGridClass, SegmentLine, Segment, CopyEmail, CopyEmailLabels, splitPlainText, PlainBlock, siteUrl
  - ".reveal, split-failsafe, view-transition and .prose-site CSS"
affects: [04-03, 04-04, 04-05, 04-06, 04-08]
tech-stack:
  added: []
  patterns: [CSS-only staggered reveal, labels-as-props client leaf]
key-files:
  created:
    - src/components/motion/reveal.tsx
    - src/components/site/page-section.tsx
    - src/components/site/segment-line.tsx
    - src/components/site/copy-email.tsx
    - src/lib/plain-text.ts
    - src/lib/site-url.ts
  modified:
    - src/app/globals.css
    - src/components/site/hero/hero-parts.tsx
    - src/components/site/status-line.tsx
decisions:
  - "Reveal clamps its index to 0..5 (360 ms stagger cap)"
  - "heroSectionClass kept as alias of the new pageGridClass"
metrics:
  tasks: 2
  completed: 2026-11-22
---

# Phase 4 Plan 12: Shared site primitives Summary

Presentational primitives for home, case study, about and contact: CSS-only Reveal (opacity/transform, reduced-motion safe), PageSection on a shared grid class, SegmentLine extracted from StatusLine, CopyEmail with clipboard fallback, plain-text splitter and siteUrl.

## Commits
- ea416dd test RED and 2c70eda feat (task 1)
- 2a527bf test RED and 7869c8a feat (task 2)

## Deviations from Plan
None in scope. One test-only fix: userEvent.setup installs its own clipboard stub, so CopyEmail tests stub navigator.clipboard after setup, and the timeout test uses advanceTimersByTimeAsync.

## Verification
`pnpm check` green (typecheck, lint, 314 tests, build). status-line.test.tsx unchanged and passing. Keyframes animate only opacity and transform; no will-change.

## Known Stubs
None.

## Self-Check: PASSED
