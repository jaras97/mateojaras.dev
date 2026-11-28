---
phase: 03-panel-admin-cv
plan: 11
subsystem: resume
tags: [react-pdf, vercel-blob, cv, unpdf, tanstack-table]
requires: ["03-07", "03-08", "03-09", "03-14"]
provides:
  - buildCvData / CvData (single builder over published+visible cores)
  - CvDocument (A4 react-pdf) and registerCvFonts
  - generateCv Server Action (both locales, Blob, one db.batch)
  - /api/cv/[lang] stream behind /cv/{en,es}.pdf
  - /admin/cv (pre-flight, public links, version history)
  - scripts/check-cv-pdf.ts, E2E_BASE_URL override
affects: [phase-03 gate, 03-12 resume.json]
tech-stack:
  added: []
  patterns: ["render in Server Action, upload to Blob, insert rows after uploads", "stream upstream.body, never a Buffer"]
key-files:
  created:
    - src/features/resume/cv-data.ts
    - src/features/resume/cv-fixture.ts
    - src/features/resume/pdf/fonts.ts
    - src/features/resume/pdf/cv-document.tsx
    - src/features/resume/actions.ts
    - src/features/resume/queries.ts
    - src/features/resume/admin-queries.ts
    - src/features/resume/components/generate-cv-button.tsx
    - src/features/resume/components/cv-links.tsx
    - src/features/resume/components/cv-history.tsx
    - src/app/admin/(panel)/cv/page.tsx
    - src/app/api/cv/[lang]/route.ts
    - scripts/check-cv-pdf.ts
    - e2e/cv.spec.ts
  modified:
    - src/lib/action-result.ts
    - playwright.config.ts
    - messages/en.json
    - messages/es.json
    - docs/decisions.md
decisions:
  - "Blob path resume/<lang>/v<n>-<suffix>.pdf, A4 (Teo F and G)"
  - "Blank locale field falls back to English in the PDF; pre-flight flags it"
  - "Per-family accent glyph test instead of inventing copy for the fixture"
metrics:
  tasks: 2
  completed: 2026-11-16
---

# Phase 3 Plan 11: CV pipeline Summary

CV generation from the admin: one Server Action renders en and es PDFs (react-pdf, A4, static TTFs) from published and visible data, uploads them to Blob and records both versions; `/cv/{en,es}.pdf` stream the latest; `/admin/cv` shows pre-flight problems, the four public links and the history.

## Commits
- 9552731 feat(cv): generate en/es PDF snapshots and serve /cv/{lang}.pdf
- 51a7b3f feat(cv): CV admin with pre-flight, public links and history

## Verification
- `pnpm check` green (45 files, 283 tests, build).
- Unit: cv-data (cores called with includeDrafts false, draft/never-published/hidden rows absent), cv-document (en and es: totalPages <= 2, accents intact, Medellín, plus a glyph test of áéíóúñ in all four registered font faces), generateCv (no session, no token, render failure, upload failure with cleanup, success with two rows and one updateTag).
- Render path exercised in a production build (`next build && next start`) through a temporary debug route (removed, not committed): both locales render, fonts found, valid PDFs (about 21 KB). `check-cv-pdf.ts` printed PASS for es with `--chars=éíó`.
- e2e `cv.spec.ts`: 4 passed, 2 skipped (they need `BLOB_READ_WRITE_TOKEN`): no-token disabled state and notice, 404 without versions, pre-flight/links/axe, empty state.

## Preview result (acceptance criterion)
Not run. `BLOB_READ_WRITE_TOKEN` does not exist yet (Teo answer H: later), so nothing can be uploaded and no Preview round trip is possible. The local production build proves bundling and font resolution; the Vercel-specific parts (font tracing on the Vercel file system, streamed Blob body, Content-Length) remain a human-check once the token exists: generate at /admin/cv on a Preview, then `pnpm exec tsx scripts/check-cv-pdf.ts <preview>/cv/en.pdf <preview>/cv/es.pdf --chars=...`, or `E2E_BASE_URL=<preview> pnpm exec playwright test e2e/cv.spec.ts`. Fallback order from the plan (session-gated POST route, then pdfkit) was not needed.

## Deviations from Plan
1. **[Rule 3 - fixture]** Seeded data lacks some accented letters per locale (no ú in Spanish, few in English) and inventing copy is forbidden. The fixture test asserts the letters the fixture contains; a separate test covers all six letters in every font face. Logged in docs/decisions.md.
2. **[Rule 1]** `check-cv-pdf.ts` needs an async main (tsx cjs has no top-level await) and gained `--chars=` because real seeded content does not contain every letter (real es PDF has no ú; real en PDF has no á ó ú ñ). With default chars the real PDFs report FAIL by design of the content, not the font.
3. **[Rule 2]** Added `Admin.cv.preflightProblems` and `languageNames` to es.json and en.json for the pre-flight lines.
4. **[Rule 1]** `generateCv` deletes already-uploaded blobs best-effort if a later step fails, so a failed run leaves no orphan files.
5. e2e extras not in the plan: cleanup of generated `resume_versions` rows in afterAll.

## Pending manual items
- BLOB_READ_WRITE_TOKEN (Teo H): real upload, the generation e2e tests, the Preview check, and visual review of the real-content PDF (pages <= 2 on real data is only proven on the fixture).
- Real data has no featured project and no skills, so pre-flight will show "Ningún proyecto destacado" and the CV omits those sections until Teo adds them.
- `/resume.json` and `/resume.es.json` link rows exist but their route (`/api/resume/[lang]`) belongs to another plan.

## Known Stubs
None.

## Threat Flags
None beyond the plan's threat model (T-03-37..41 mitigated as specified: includeDrafts false and no draftMode import, session first in generateCv, lang allowlist and DB-sourced URL, streamed body).

## Self-Check: PASSED
