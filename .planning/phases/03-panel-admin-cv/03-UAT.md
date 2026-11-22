---
status: testing
phase: 03-panel-admin-cv
source: [03-VERIFICATION.md]
started: 2026-11-22T19:40:00Z
updated: 2026-11-22T19:40:00Z
---

## Current Test

number: 1
name: Decide on SC1/SC6 scope: 3 of 4 projects (EcoExport, Finanzas, Inventario) are not loaded
expected: |
  Either accept the deviation as an override (the content is deferred by Teo's own decision, D-10, 2026-11-21) or open a gap-closure plan to load them
awaiting: user response

## Tests

### 1. Decide on SC1/SC6 scope: 3 of 4 projects (EcoExport, Finanzas, Inventario) are not loaded
expected: Either accept the deviation as an override (the content is deferred by Teo's own decision, D-10, 2026-11-21) or open a gap-closure plan to load them
result: [pending]

### 2. Run DATABASE_URL='<Neon main URL>' pnpm exec tsx scripts/check-phase-3.ts and paste output
expected: ManuJ, resume and skills lines PASS. EcoExport content lines FAIL by design while it stays published-but-hidden with empty fields
result: [pending]

### 3. Review the 3 ManuJ screenshots (16:10, alt es/en) and the EN translation in the admin; open /cv/en.pdf and /cv/es.pdf
expected: Images are 16:10 and acceptable; English text approved (draft-translation flag cleared); CVs read correctly
result: [pending]

### 4. Decide whether CR-01 (stale relation ids in pending drafts block publish) must be fixed before phase 4
expected: Fix now, or accept as known open item (escape route: "Descartar borrador")
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
