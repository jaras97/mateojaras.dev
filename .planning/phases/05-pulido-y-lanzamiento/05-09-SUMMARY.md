---
phase: 05-pulido-y-lanzamiento
plan: 09
subsystem: launch
tags: [QUAL-08, QUAL-07, D-09, D-12, D-18, review-fixes, search-console, gate]
requires: [05-08]
provides:
  - 31 of 31 consolidated review rows with a disposition (fixed, dismissed or backlog)
  - Code fixes K-06, K-07, K-13, K-24, K-28 and parts of K-12, K-22, K-29 (PR #3, merge 2860c16)
  - Content C-1..C-4 published on production, CV v6
  - Sitemap submitted and indexing requested in Search Console
  - 05-GATE.md with RESULT all PASS
affects: []
key-files:
  created:
    - .planning/phases/05-pulido-y-lanzamiento/05-FIXES.md
    - .planning/phases/05-pulido-y-lanzamiento/05-GATE.md
    - e2e/review-fixes.spec.ts
  modified:
    - docs/reviews.md
    - docs/backlog.md
    - docs/decisions.md
    - README.md
    - .github/workflows/ci.yml
    - .planning/REQUIREMENTS.md
decisions:
  - "D-18 exception: Claude Code entered C-2..C-4 through the production admin UI with Teo's OK (\"Hazlo\", 2026-11-27)"
  - "QUAL-07 dashboard confirmation deferred to Teo by his decision (2026-11-27); script and beacon answer 200 in production"
metrics:
  tasks: 3
  completed: 2026-11-27
---

# Phase 5 Plan 09: Review fixes, launch and phase gate Summary

Every review finding has a disposition, the code fixes are merged and verified on production, the approved content is published, the CV is regenerated, and the sitemap is in Search Console. The phase gate passes.

## What was done

- **Triage (05-FIXES.md):** the 31 consolidated rows were sorted into fix-code, fix-content, dismiss, backlog and questions. Teo answered the questions; the backlog lines went to `docs/backlog.md`.
- **Code fixes (branch phase-05-review-fixes, PR #3, merged by Teo):**
  - e4085b2 K-24: CTAs as plain links
  - baaa92a K-13: backtick spans render as `<code>`
  - a8d90be K-06: no fi/ff ligatures in the CV
  - fe20c41 K-29: 24 px footer targets
  - 9979739 K-28: a single-month period shown once
  - 7ea56d0 K-07: project README
  - c6738f8 K-22: CI on PRs and main only
  - fd7a99e K-12: figure alignment
  - `e2e/review-fixes.spec.ts` passes 6/6 against production.
- **Content (D-18 exception):**
  - C-1 was already published.
  - C-2, C-3 and C-4 were entered by Claude Code through the admin UI with Teo's authorization and verified on the public pages in en and es.
  - "Generar CV" produced v6; check-cv-pdf passes on both PDFs.
- **Launch:** Teo verified the domain property in Search Console, submitted `https://mateojaras.dev/sitemap.xml` and requested indexing of `/` and `/es`. The sitemap answers 200 with 9 URLs.
- **Gate:**
  - check-live all PASS.
  - CI on main is green.
  - `pnpm check` is green.
  - QUAL-08 is marked complete with the agent re-scope; the human review stays pending (D-10).

## Deviations

- **D-18:** content was entered by Claude Code rather than Teo, at Teo's request. It went through the admin UI only: no direct database access, and `scripts/load-content.ts` was never run. The exception is logged in `docs/decisions.md`.
- **QUAL-07 must-have:** the Analytics dashboard confirmation was not obtained. Teo kept it as his own task and closed the phase without it.
- **Contact delivery:** the live contact check stays waived ("manual", from 05-07).

## Self-Check: PASSED
