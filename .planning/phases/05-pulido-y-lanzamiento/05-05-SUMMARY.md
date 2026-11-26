---
phase: 05-pulido-y-lanzamiento
plan: 05
subsystem: a11y-favicon
tags: [favicon, a11y, keyboard, axe, reduced-motion]
requires: [05-03, 05-04]
provides: [MJ favicon, a11y e2e matrix]
affects: [src/app, e2e, src/components/site/site-header.tsx]
tech-stack:
  added: []
key-files:
  created: [src/app/icon.svg, src/app/apple-icon.png, e2e/favicon.spec.ts, e2e/a11y-sweep.spec.ts]
  modified: [src/app/favicon.ico, e2e/keyboard.spec.ts, e2e/reduced-motion.spec.ts, src/components/site/site-header.tsx, docs/decisions.md]
decisions:
  - Favicon variant a installed (Teo approved), logged in docs/decisions.md
requirements-completed: [QUAL-03]
duration: ~40min
completed: 2026-11-26
---

# Phase 5 Plan 05: Favicon and accessibility gates Summary

Approved MJ favicon (variant a) served from both root layouts, plus keyboard, focus-order, axe and reduced-motion gates now covering es routes, the 404, 390 px and dark theme.

## Commits
- 014a278 feat(site): MJ favicon (icon.svg, apple-icon.png 180, PNG-in-ICO 32/48 RGBA, favicon.spec, decisions entry)
- fix(site): home link accessible name matches visible text at 390 px
- test(site): keyboard, axe and reduced-motion gates for es routes, 404, 390 px, dark

## Verification
- Local and Preview (HEAD 78bfac8 READY): favicon, keyboard, reduced-motion, a11y-sweep, 20/20 green.
- `pnpm check` build stage completed.

## Deviations
- [Rule 1 - Bug] axe `label-content-name-mismatch` (serious) on the header home link at 390 px: aria-label "Home" vs visible initials. Fix in `src/components/site/site-header.tsx`: removed the aria-label, added an sr-only full name below sm. No visual change.
- [Rule 3] First ICO had RGB PNGs, which Turbopack rejects; regenerated as RGBA via canvas (scratchpad script, no dependencies).
- No axe exclusions added. The mobile header does not collapse (no menu), so the keyboard 390 px test walks the inline header controls.

## Notes
- The home link lost its localized "home" aria-label; the translation key `Site.header.home` may now be unused (left in messages).

## Self-Check: PASSED
