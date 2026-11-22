---
phase: 03-panel-admin-cv
verified: 2026-11-22T20:00:00Z
status: human_needed
score: 4/6 must-haves verified (SC1 and SC6 partial, pending Teo's decision)
covered_files:
  - ".planning/phases/03-panel-admin-cv/03-01-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-01-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-02-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-02-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-03-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-03-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-04-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-04-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-05-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-05-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-06-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-06-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-07-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-07-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-08-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-08-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-09-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-09-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-10-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-10-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-11-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-11-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-12-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-12-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-13-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-13-SUMMARY.md"
  - ".planning/phases/03-panel-admin-cv/03-14-PLAN.md"
  - ".planning/phases/03-panel-admin-cv/03-14-SUMMARY.md"
  - "next.config.ts"
  - "scripts/check-cv-pdf.ts"
  - "scripts/check-phase-3.ts"
  - "src/app/api/blob/upload/route.ts"
  - "src/app/api/cv/[lang]/route.ts"
  - "src/app/api/draft/route.ts"
  - "src/components/admin/sortable-list.tsx"
  - "src/components/admin/unsaved-guard.tsx"
  - "src/features/projects/actions.ts"
  - "src/features/resume/actions.ts"
  - "src/features/resume/json-resume.ts"
  - "src/features/resume/pdf/cv-document.tsx"
  - "src/features/skills/actions.ts"
covered_digest: "v4:sha256:db891b3bfab065f296901a7ef982cbebf1d28f92d16a4352d8d9e5ad4598253d"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Decide on SC1/SC6 scope: 3 of 4 projects (EcoExport, Finanzas, Inventario) are not loaded"
    expected: "Either accept the deviation as an override (the content is deferred by Teo's own decision, D-10, 2026-11-21) or open a gap-closure plan to load them"
    why_human: "Only Teo can accept a re-scope of 'real content of the 4 projects, approved by Teo'"
  - test: "Run DATABASE_URL='<Neon main URL>' pnpm exec tsx scripts/check-phase-3.ts and paste output"
    expected: "ManuJ lines PASS; EcoExport lines skipped or INFO (hidden, DRAFT_ALLOWED); no FAIL on resume/skills"
    why_human: "DATABASE_URL is marked sensitive in Vercel; only Teo holds the main-DB URL. Recorded as not received in docs/decisions.md"
  - test: "Review the 3 ManuJ screenshots (16:10, alt es/en) and the EN translation in the admin; open /cv/en.pdf and /cv/es.pdf"
    expected: "Images are 16:10 and acceptable; English text approved (draft-translation flag cleared); CVs read correctly"
    why_human: "Visual and editorial approval (IDEN-06/IDEN-07 'approved by Teo')"
  - test: "Decide whether CR-01 (stale relation ids in pending drafts block publish) must be fixed before phase 4"
    expected: "Fix now, or accept as known open item (escape route: 'Descartar borrador')"
    why_human: "Severity/priority call; 03-REVIEW-DISPOSITION marks it open"
---

# Phase 3: Panel admin + CV Verification Report

**Phase Goal:** Teo administra todo el contenido del sitio desde `/admin` sin tocar código ni redeploy, y genera desde esos mismos datos un CV en PDF correcto en inglés y español
**Verified:** 2026-11-22
**Status:** human_needed
**Re-verification:** No, initial verification

## Goal Achievement

The machinery for the goal is built, wired and tested. The content half of the goal (real content of all 4 projects loaded and approved) is only partly met, by Teo's explicit choice.

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Spanish admin; Teo loads real content of the 4 projects, experience, skills, education and SiteSettings from forms, en/es side by side, empty-es marked, images in Blob with alt en/es | PARTIAL (human decision) | Forms, bilingual kit and uploader exist (`src/components/admin/bilingual-field.tsx`, `image-uploader.tsx` with `altEn/altEs`, features/* actions). Loaded in production: ManuJ only (3 images with alt, 3 decisions), Sofka and Freelance bullets, Now, 1 skill (Frontend: Css). EcoExport, Finanzas and Inventario not loaded (03-13-CARGA.md, decisions D-10 2026-11-21). Literal wording "los 4 proyectos" is unmet |
| 2 | Draft save, Draft Mode preview on real route, publish with no redeploy; visible toggle removes from site; published slug not editable | VERIFIED | `app/api/draft/route.ts` enables `draftMode()` behind session; `checkSlug` in `features/projects/actions.ts:93-105` rejects slug change on published rows; 20 `updateTag` calls across actions; ManuJ `/projects/...` served 200 in prod, EcoExport hidden returns 404 (orchestrator evidence). Draft Mode e2e noise ("Unexpected cache miss") is open |
| 3 | Reorder by drag or keyboard; Cmd+S saves; unsaved-changes prompt | VERIFIED | `sortable-list.tsx` uses dnd-kit `KeyboardSensor`; `unsaved-guard.tsx` handles `metaKey/ctrlKey` and `beforeunload`; navigation-blocker.tsx. WR-10 (sign-out skips the guard) is a minor open warning |
| 4 | CV generated from admin; `/cv/en.pdf`, `/cv/es.pdf` serve latest, one column, no photo, text layer with á é í ó ú ñ intact; history lists and downloads past copies | VERIFIED | `generateCv` renders both locales with `renderToBuffer`, uploads to Blob, batch-inserts `resume_versions`; `app/api/cv/[lang]/route.ts` streams the latest row; rewrites in `next.config.ts:62-63`; `cv-document.test.tsx` uses unpdf to assert accents survive in all three font families (passes, 291/291 tests re-run by me). Prod PDFs 1 page, pass `check-cv-pdf.ts` (orchestrator evidence). EN passes only with `--chars=éí` because EN copy has no ó/ú/ñ (accents ó/ú/ñ proven by the Spanish PDF and the unit test) |
| 5 | `/resume.json` and `/resume.es.json` valid JSON Resume live; contact inbox in admin | VERIFIED | rewrites to `/api/resume/{en,es}`; `json-resume.ts` + `json-resume-schema.test.ts`; prod returned 200 with skill list; `features/contact/` actions (4 session checks) and `mensajes/page.tsx` |
| 6 | Content of the 4 projects (IDEN-05), 3+ 16:10 screenshots each reviewed by Teo (IDEN-06), copy without markers incl. Sofka bullets (IDEN-07), loaded and approved by Teo from the admin | PARTIAL (human decision) | IDEN-07 met (Sofka and Freelance bullets, Now loaded; no `TBD/FIXME/XXX` in src or scripts). IDEN-05/IDEN-06 met for ManuJ only; 3 projects remain unloaded or draft. Teo has not confirmed the 16:10 ratio of ManuJ images (script did not read the uploader warning) |

**Score:** 4/6 fully verified, 2 partial on content scope.

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/features/{projects,experience,education,skills,site-settings,resume,contact}/actions.ts` | VERIFIED | Substantive; every exported action calls `requireActionSession` (counts match exported functions) |
| `src/app/api/blob/upload/route.ts` | VERIFIED | `requireSessionForRequest` guard; content types and size restricted |
| `src/app/api/draft/route.ts` | VERIFIED | session-gated enable/disable |
| `src/features/resume/pdf/cv-document.tsx`, `fonts.ts` | VERIFIED | static TTF from `assets/fonts-pdf/`, test covers extraction |
| `src/app/api/cv/[lang]/route.ts`, `api/resume/[lang]/route.ts` | VERIFIED | DB-driven, 404 on bad lang/no row |
| `scripts/check-phase-3.ts`, `scripts/check-cv-pdf.ts` | EXISTS | check-phase-3 not run against main |

### Key Links

| From | To | Status |
|------|----|--------|
| admin actions | `updateTag` + `exportContent` | WIRED (21 and 20 occurrences; `generateCv` omits exportContent, WR-07) |
| `/cv/*.pdf`, `/resume*.json` | route handlers | WIRED via `beforeFiles` rewrites |
| ImageUploader | `/api/blob/upload` | WIRED, URL persisted via entity action |
| generateCv | `resume_versions` | WIRED (`db.batch` insert, `getLatestResume` reads it) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Unit suite | `pnpm exec vitest run` | 47 files, 291 tests passed | PASS |
| `pnpm check` (typecheck, lint, build) | run by orchestrator | passes at HEAD | PASS (not re-run) |
| Prod resume/CV checks | orchestrator, read-only | per task statement | accepted as observed fact |

### Probe Execution

Step 7c: no `probe-*.sh` declared; SKIPPED.

### Requirements Coverage

All 21 IDs in the task are claimed by at least one PLAN and exist in REQUIREMENTS.md; no orphans.

| Requirement | Source Plan(s) | Status | Evidence |
|-------------|----------------|--------|----------|
| ADMN-01 | 03-01, 03-04 | SATISFIED | Admin UI in Spanish, strings in messages/es.json |
| ADMN-02 | 03-08 | SATISFIED | site-settings feature with draft and preview |
| ADMN-03 | 03-03, 03-04, 03-05 | SATISFIED | project CRUD, decisions, metrics |
| ADMN-04 | 03-08, 03-09, 03-14 | SATISFIED | experience, skills, education CRUD |
| ADMN-05 | 03-03, 03-04, 03-08, 03-09, 03-14 | SATISFIED | draft/publish actions, visible toggle (CR-01 can block publish after deletes) |
| ADMN-06 | 03-04, 03-09, 03-14 | SATISFIED | dnd-kit + KeyboardSensor |
| ADMN-07 | 03-05, 03-08, 03-09 | SATISFIED | bilingual field/repeater |
| ADMN-08 | 03-07 | SATISFIED | client upload, alt en/es; WR-08 (filename regex) open |
| ADMN-09 | 03-03, 03-05 | SATISFIED | `checkSlug` |
| ADMN-10 | 03-05 | SATISFIED | unsaved-guard |
| ADMN-11 | 03-06 | SATISFIED | draft route; WR-05 (outlives sign-out) open |
| ADMN-12 | 03-03/04/08/09/12/14 | SATISFIED | `updateTag` per entity |
| ADMN-13 | 03-10 | SATISFIED | inbox |
| CV-01..CV-04 | 03-11, 03-13 | SATISFIED | see SC4 |
| CV-05 | 03-12 | SATISFIED | see SC5 |
| IDEN-05 | 03-02, 03-13 | PARTIAL | 1 of 4 projects loaded; REQUIREMENTS.md marks it Complete, which overstates |
| IDEN-06 | 03-07, 03-13 | PARTIAL | ManuJ only; ratio unconfirmed by Teo |
| IDEN-07 | 03-02, 03-09, 03-13 | SATISFIED | bullets and copy loaded |

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `features/skills/actions.ts`, `projects/list-actions.ts`, projects/experience actions | CR-01: stale ids in draft jsonb break publish permanently until draft discarded | Warning (review says critical; edge path, has an escape route) | Real defect in publish flow; open in 03-REVIEW-DISPOSITION |
| `features/resume/actions.ts:20-22` | WR-06 raw error text to client; WR-07 no `exportContent()` | Warning | Backup drift, error leakage (admin-only) |
| WR-01..WR-11 | see 03-REVIEW.md | Warning | Advisory |
| No `TBD/FIXME/XXX` markers in src or scripts | | Clean | |

Accepted/known: CSP `connect-src` for Blob deferred to phase 5 (AR-03-03); UI review 17/24; `/impeccable:audit` and `critique` not run on the draft band, Ajustes and Educación; Draft Mode e2e cache-miss noise; Better Auth HANGING_PROMISE_REJECTION log noise. Custom domain DNS is phase 5.

### Human Verification Required

1. **SC1/SC6 scope.** Test: confirm whether leaving EcoExport, Finanzas and Inventario unloaded is accepted. Expected: an override, or a closure plan. This verifier cannot accept it for Teo. Suggested override if accepted:

```yaml
overrides:
  - must_have: "Teo carga el contenido real de los 4 proyectos ... cargados y aprobados por Teo desde el admin"
    reason: "Teo decided on 2026-11-21 (D-10) to complete EcoExport, Finanzas and Inventario later; the admin supports it, content is data not code"
    accepted_by: "Teo"
    accepted_at: "<ISO timestamp>"
```

2. **check-phase-3.ts against Neon main.** Only Teo can run it. Without it, the "content loaded in the DB" claim rests on public HTTP checks.
3. **Visual and editorial review** of ManuJ screenshots (16:10), EN translation, both CV PDFs.
4. **CR-01 priority decision.**

### Gaps Summary

No code gaps were found: every admin capability, the CV pipeline and the JSON Resume endpoints exist, are session-guarded, wired, and tested. The open points are (a) a content-scope deviation that Teo chose and has not formally accepted as an override, (b) a verification Teo alone can run, and (c) advisory review findings including CR-01.

---

_Verified: 2026-11-22_
_Verifier: Claude (gsd-verifier)_
