---
phase: 03-panel-admin-cv
plan: 13
subsystem: content-session
tags: [content, playwright, production, cv, checker]
requires: ["03-01", "03-02", "03-03", "03-04", "03-05", "03-06", "03-07", "03-08", "03-09", "03-10", "03-11", "03-12", "03-14"]
provides:
  - ManuJ case study, Sofka and Freelance bullets and Now loaded in production through the admin forms
  - CV v1 (en/es) generated from the admin
  - check-phase-3.ts with draft-allowed handling and a TODO false-positive fix
affects: [phase-03 gate]
key-files:
  created:
    - .planning/phases/03-panel-admin-cv/03-13-SUMMARY.md
  modified:
    - scripts/check-phase-3.ts
    - .planning/phases/03-panel-admin-cv/03-13-CARGA.md
    - docs/decisions.md
decisions:
  - "Teo delegated the loading ('hazlo tu'); Claude loaded only text Teo approved, through a Playwright script kept outside the repo"
  - "EcoExport, Finanzas and Inventario left uncompleted by Teo; EcoExport is still status published from the seed"
  - "Checker: EcoExport in DRAFT_ALLOWED, unpublished draft-allowed projects skip content lines, TODO matched as an uppercase word"
  - "D-09 close stays open until Teo's own 'listo' and the checker run against Neon main"
metrics:
  tasks: "2 of 2 executable (Task 2 delegated), D-09 'listo' pending"
  completed: 2026-11-21
requirements-completed: []
---

# Phase 3 Plan 13: Content session Summary

Production now carries the ManuJ case study (3 results, 3 decisions, 3 captioned screenshots, cover 01-inicio, featured and visible), the Sofka and Freelance bullets, the Now text and CV v1 in both languages, all entered through the real admin forms.

## What was loaded (production)
- Centro Estético ManuJ from `docs/content/centro-estetico-manuj.md`; screenshots uploaded through `/api/blob/upload` with alt en/es; no metrics (qualitative results only).
- Sofka bullets (Teo's exact text), Freelance bullets and Now from `docs/copy.md`. Headline and bio were already filled and untouched.
- "Generar CV" pressed in `/admin/cv`: version 1 in en and es.
- The loader (`load-content/` in the session scratchpad, not in the repo) is idempotent and was debugged first against the Neon dev branch with `pnpm build && pnpm start`.

## Verification
- `/cv/es.pdf` PASS, 1 page. `/cv/en.pdf` FAIL with the default character set (the English content has no á ó ú ñ) and PASS with `--chars=éí`; extracted text checked.
- `/resume.json` and `/resume.es.json`: 200, name, ManuJ, 3 Sofka highlights; skills = 0.
- Public ManuJ pages (en and es) return 200 but still render only the title; the case-study sections are phase 4. Results, decisions and images were read back through the admin.
- `pnpm check`: typecheck, lint, 291 tests and build green.

## Deviations from Plan
1. [Rule 1 - Bug] `/TODO/i` in the checker matched the Spanish word "Todos" in the ManuJ gallery alt text. Now `\bTODO\b` (case-sensitive) plus a case-insensitive `lorem`. Commit 0bcce0f.
2. [Teo's decision] EcoExport added to `DRAFT_ALLOWED`; unpublished draft-allowed projects print the INFO status line and the marker check only. Commit dc25ad0.
3. The project-root pin script named in the dispatch contract did not exist; root, branch (main) and cwd were verified by hand.
4. Task 2 was run by Claude on Teo's delegation instead of Teo typing in the forms; no content was written, translated or published beyond Teo's approved sources.

## Open items (Teo)
- Checker against Neon main not run: Vercel returns `[SENSITIVE]` for `DATABASE_URL` in `vercel env pull`. Not worked around.
- EcoExport is published and visible with empty fields; the admin has no unpublish action.
- Skills table is empty in production, so the CV and JSON Resume list no skills.
- Teo's "listo" (D-09) is not given, so the phase gate is not closed.

## Known Stubs
None added.

## Self-Check: PASSED
- scripts/check-phase-3.ts, 03-13-CARGA.md and docs/decisions.md modified; commits dc25ad0 and 0bcce0f present.
