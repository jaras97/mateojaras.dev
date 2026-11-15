---
phase: 02-base-t-cnica
plan: 01
subsystem: infra
tags: [deps, playwright, docs, approvals]
requires: []
provides:
  - approved dependencies installed (react 19.3.1, next 16.4.6, better-auth 1.7.25, tiptap pinned exact)
  - playwright harness on port 3100 and e2e/axe.ts
  - corrected data-model (languages, metrics_en/es, auth CLI)
affects: [02-02, 02-03, 02-05, 02-06]
tech-stack:
  added: [server-only, "@dnd-kit/utilities", "@tiptap/pm", "@tiptap/static-renderer", tsx, "@testing-library/dom", "@testing-library/user-event"]
  patterns: [one exact version for all @tiptap/*]
key-files:
  created: [playwright.config.ts, e2e/axe.ts, .planning/phases/02-base-t-cnica/02-01-ANSWERS.md]
  modified: [package.json, pnpm-lock.yaml, docs/data-model.md, docs/decisions.md, CLAUDE.md, .env.example, messages/en.json, messages/es.json, src/lib/messages.ts]
key-decisions:
  - "A sí: next 16.4.6, better-auth 1.7.25"
  - "B memoria: login rate limit in memory until Upstash"
  - "C: languages jsonb { code, level }[]"
  - "D b: metrics_en / metrics_es"
  - "E sí: seed bio and freelance bullets"
requirements-completed: [BASE-01, BASE-03, BASE-10]
duration: 15min
completed: 2026-11-15
---

# Phase 2 Plan 01: Approvals and housekeeping Summary

Teo's phase-start approvals applied: patched next/better-auth, phase 2 dependencies, Playwright harness with the axe gate, corrected data model, and /lab deleted.

## Commits
- a7e2694: Teo's answers (Task 1, done before this run)
- e89bdf7: chore(deps): install phase 2 approvals and remove /lab
- af00785: docs(02): apply D-02/D-03 and log phase-start decisions

## Deviations from Plan
- Cleared stale `.next/dev/types` (gitignored) after deleting /lab because typecheck read the old generated route types. No source change.
- Plan said "pnpm add -E next" etc.; `better-auth` and `@tiptap/*` were pinned exact too, `server-only`, `tsx` and the other additions keep caret ranges.

## Known Stubs
None.

## Self-Check: PASSED
