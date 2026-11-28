---
phase: 04-sitio-p-blico
plan: 14
subsystem: contact-rate-limit, case-study
tags: [gap-closure, upstash, validation, zod, WR-02, WR-03]
requires: [04-13]
provides:
  - resolveUpstashCredentials (pair-as-a-whole credential resolver shared by app and e2e)
  - toCalendarDay (real calendar date check for YYYY-MM / YYYY-MM-DD)
affects: [src/lib/rate-limit.ts, src/components/site/case-study/case-gallery.tsx, REQUIREMENTS.md]
key-files:
  created: [src/lib/upstash-env.ts, src/lib/upstash-env.test.ts]
  modified:
    - src/lib/rate-limit.ts
    - e2e/contact.spec.ts
    - e2e/contact-live.spec.ts
    - src/lib/format.ts
    - src/lib/format.test.ts
    - src/features/projects/validation.ts
    - src/features/projects/validation.test.ts
    - src/components/site/case-study/case-gallery.tsx
    - src/components/site/case-study/case-study.test.tsx
    - .planning/REQUIREMENTS.md
key-decisions:
  - "Credential pair chosen as a whole (UPSTASH_* complete, else KV_* complete, else null); never mixed across providers, fail closed preserved"
  - "toCalendarDay round-trips year/month/day because Date.UTC/Date.parse roll 2025-02-31 over to March"
requirements-completed: [CONT-04, CASE-01, CASE-03]
duration: ~10 min
completed: 2026-11-23
---

# Phase 4 Plan 14: WR-02 / WR-03 gap closure Summary

An empty `UPSTASH_REDIS_REST_*` line no longer shadows Marketplace `KV_REST_API_*` (one complete credential pair is chosen as a whole), and an impossible `capturedAt` is rejected on save and no longer crashes the published case study.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1. WR-02 credential pair (TDD) | 1a0f020 | `resolveUpstashCredentials`, `rate-limit.ts` and both e2e `HAS_LIMITER` flags use it |
| 2. WR-03 calendar-real capturedAt (TDD) | e669b33 | `toCalendarDay`, Zod refine, gallery hides only the bad date segment |
| 3. Gate and traceability | 5a2b7ed | `pnpm check` green; 26 Phase 4 rows Complete, CONT-02/CONT-04/QUAL-04 Human Needed, Phase 5 untouched; MOTN-02 note points to Plan B P4 |

Tests were written first and failed (module missing; toCalendarDay missing, 2025-13 accepted) before the fixes.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

Created files exist, three commits present, acceptance greps pass, `pnpm check` exit 0, REQUIREMENTS check script printed `bad: none`.
