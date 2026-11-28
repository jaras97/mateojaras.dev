---
status: complete
phase: 03-panel-admin-cv
source: [03-VERIFICATION.md]
started: 2026-11-22T19:40:00Z
updated: 2026-11-22T19:40:08.243Z
---

## Current Test

[testing complete]

## Tests

### 1. Decide on SC1/SC6 scope: 3 of 4 projects (EcoExport, Finanzas, Inventario) are not loaded
expected: Either accept the deviation as an override (the content is deferred by Teo's own decision, D-10, 2026-11-21) or open a gap-closure plan to load them
result: pass

### 2. Run DATABASE_URL='<Neon main URL>' pnpm exec tsx scripts/check-phase-3.ts and paste output
expected: ManuJ, resume and skills lines PASS. EcoExport content lines FAIL by design while it stays published-but-hidden with empty fields
result: pass
retested: 2026-11-22 after generating CV en/es against Neon main (first run reported resume FAILs, see gap G-03-2)

### 3. Review the 3 ManuJ screenshots (16:10, alt es/en) and the EN translation in the admin; open /cv/en.pdf and /cv/es.pdf
expected: Images are 16:10 and acceptable; English text approved (draft-translation flag cleared); CVs read correctly
result: pass

### 4. Decide whether CR-01 (stale relation ids in pending drafts block publish) must be fixed before phase 4
expected: Fix now, or accept as known open item (escape route: "Descartar borrador")
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-03-2
  truth: "check-phase-3.ts against Neon main reports PASS for resume en and resume es (a latest resume_versions row exists per locale)"
  status: failed
  reason: "User reported: FAIL resume en: latest version exists; FAIL resume es: latest version exists (RESULT: 9 FAIL, 7 of them the expected EcoExport content lines)"
  severity: major
  test: 2
  retest: "pass on 2026-11-22: Teo generated both CVs against main and the check script's resume lines passed. Closed by data load, no gap-closure plan."
  root_cause: "Data, not code. Neon main has no resume_versions rows for en/es. The CVs approved in test 3 were most likely generated against the dev branch (local .env.local). src/app/api/cv/[lang]/route.ts serves the latest row via getLatestResume(lang), so on production /cv/en.pdf and /cv/es.pdf return 404 until a CV is generated against main. Not verified against the dev branch (secret-read guard blocks reading .env.local)."
  artifacts:
    - path: "src/app/api/cv/[lang]/route.ts"
      issue: "Returns 404 when no resume_versions row exists for the locale (correct behavior, missing data)"
    - path: "scripts/check-phase-3.ts"
      issue: "Line 193 check 'latest version exists' fails on main"
  missing:
    - "Generate CV en and es from /admin/cv with the app pointed at Neon main (Production deploy, or locally with DATABASE_URL=main)"
    - "Re-run DATABASE_URL='<Neon main URL>' pnpm exec tsx scripts/check-phase-3.ts and confirm both resume lines PASS (plus 'generated after newest published content update')"
  debug_session: ""
