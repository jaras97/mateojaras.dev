---
phase: 01-identidad-y-contenido
plan: 05
subsystem: content
tags: [zod, yaml, content-contract, number-parity, decisions, design-md]

requires:
  - phase: 01-identidad-y-contenido
    provides: "01-01 Vitest config and Biome exclusions; 01-03 G1 answers (yaml: sí)"
provides:
  - "src/features/projects/content-schema.ts: metricSchema (strict, bilingual), techDecisionsSchema, mediaSchema, projectFrontMatterSchema, projectSectionsSchema, validateProjectContent, checkNumberParity and inferred types"
  - "src/features/projects/content-file.ts: splitContentFile, parseFrontMatter (yaml 2.9.1), parseContentFile, loadContentDir"
  - "pnpm content:check (vitest run src/features/projects), CONTENT_MIN_FILES gate on the real-file block"
  - "docs/content/README.md: format spec, D-08 mapping to data-model.md, interview script (0 to 10 plus cover)"
  - "docs/decisions.md: eight phase-start entries"
  - "DESIGN.md §2 next/font/google and §3 .dark class (D-16, D-17)"
affects: [01-07 interviews, 01-10 captures (media/coverImage/altStatus), 01-12 check-phase-1.sh, phase 2 seed]

tech-stack:
  added: ["yaml 2.9.1 (devDependency, exact pin)"]
  patterns:
    - "Strict Zod objects for content files: unknown keys and typos fail instead of being dropped"
    - "pendingFields as the only way a field may be absent; slug, metrics and pendingFields issues are never silenced"
    - "Digit-multiset parity across every paired Es/En string as an anti-invention check"

key-files:
  created:
    - src/features/projects/content-schema.ts
    - src/features/projects/content-file.ts
    - src/features/projects/content-schema.test.ts
    - docs/content/README.md
  modified:
    - package.json
    - pnpm-lock.yaml
    - docs/decisions.md
    - DESIGN.md

key-decisions:
  - "G1 branch implemented: yaml (Teo's 'yaml: sí'); no PyYAML fallback script was created and pnpm check never calls python3"
  - "Front-matter, sections, metrics, decisions and media are strict objects: an unknown key (typo or the single-language metric shape) is an issue"
  - "metrics is always present ([] when no sourced figure exists); listing it in pendingFields never silences a metric issue"
  - "Cross-field rules added: altStatus required once media has entries, media files under material/<slug>/, coverImage must be one of the media files"
  - "pendingFields only accepts contract field names; slug and pendingFields itself cannot be pending"
  - "Parity also covers titles and media alt text, documented in the README"

patterns-established:
  - "Content files are validated only through pnpm content:check (later plans never call vitest directly)"

requirements-completed: []
requirements-groundwork: [IDEN-05, IDEN-01]

actuals:
  tokens: 10200
  tasks: 2
  commits: 2
plan_head_before: 7e17c0bb411fb85a1e503449c05fef77e8c362e7
plan_head_after: 7e01f725cddf2cd0eeb763ba56eae74f12a8f807

duration: 6min
completed: 2026-10-30
status: complete
---

# Phase 1 Plan 05: docs/content contract, format guide and phase-start decisions Summary

**Strict Zod contract for docs/content/<slug>.md with bilingual sourced metrics, 2-3 decisions per language, pendingFields-only absence and an en/es digit-parity check, run by `pnpm content:check` on yaml 2.9.1; plus the Spanish format and interview guide, eight decision entries and the approved DESIGN.md §2/§3 sync.**

## Performance

- **Duration:** ~6 min (2026-10-30T19:30Z to 19:36Z)
- **Tasks:** 2 (1 tracer, 1 auto)
- **Files created:** 4; modified: 4

## G1 branch

`yaml: sí` in 01-03-ANSWERS.md, so the **yaml branch** was implemented: `pnpm add -D -E yaml@2.9.1`, `"test": "vitest run"` (no `--passWithNoTests`), `"content:check": "vitest run src/features/projects"`. `scripts/front-matter-to-json.py` was not created. The bilingual metric shape `{ labelEs, labelEn, value, sourceEs, sourceEn }` is the only metric shape.

## Accomplishments

- `pnpm content:check`: 19 tests pass (16 synthetic contract tests, 2 splitter tests, 1 real-file block reporting "0 found"). With `CONTENT_MIN_FILES=1` it fails ("expected 0 to be greater than or equal to 1"), so 01-12's `CONTENT_MIN_FILES=4` cannot pass vacuously.
- Every behavior in the plan is a test: empty/missing `sourceEn`, empty `sourceEs`, the single-language shape, metric issues surviving `pendingFields`, `slug` in `pendingFields`, parity on a metric label (`90`) and source date (`2025` vs `2026`), 1 and 4 decisions, `40%` only in the English tagline, `problemEs` and `clientPermission` absent unless pending, bad `enStatus`, `2,5` vs `2.5` equal.
- The real-file block also checks that each file name equals its slug and that no file uses `contract-fixture`.
- `pnpm check` (typecheck, Biome, 21 tests, build) passes.
- `docs/content/README.md` documents every field, the bilingual metrics, the parity rule, the `media[].file` to `media[].url` / `coverImage` to Blob URL mapping for phase 3, and the interview script (slug question 0, questions 1-10, cover question).
- `docs/decisions.md` grows from 2 to 10 dated entries.
- `DESIGN.md` differs from HEAD only in the §2 font bullet and the §3 selector plus one sentence in the §3 rules paragraph; PDF bullet, palette, status and concept untouched.

## Task Commits

1. **Task 1: Tracer, content contract with number parity** - `8525aa2` (feat)
2. **Task 2: Format guide, decision log, DESIGN.md §2/§3** - `7e01f72` (docs)

Tracer gate: `pnpm content:check` was re-run after the Task 1 commit (19 passed) before Task 2 started.

## Files Created/Modified

- `src/features/projects/content-schema.ts` - Zod contract, validateProjectContent, checkNumberParity
- `src/features/projects/content-file.ts` - front-matter/section splitter, yaml parse, directory loader
- `src/features/projects/content-schema.test.ts` - synthetic contract tests and the real-file block
- `docs/content/README.md` - format spec and interview script (Spanish)
- `docs/decisions.md` - eight entries: Aprobaciones de arranque, Métricas bilingües, Inglés de IDEN-07, Textos de interfaz en messages/, Fuentes estáticas del PDF (D-19), --color-signal, Biome exclusions, Política de material/
- `DESIGN.md` - §2 next/font/google, §3 `.dark` on `<html>`
- `package.json`, `pnpm-lock.yaml` - yaml 2.9.1, test and content:check scripts

## Decisions Made

See key-decisions. All are inside the plan's latitude (internal structure and tests). The extra strictness (unknown keys, cross-field media rules, pendingFields name check) only rejects malformed files; it adds no content rule beyond what D-08/D-10/D-15 already require.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Strict objects and cross-field checks**
- **Found during:** Task 1
- **Issue:** With a plain `z.object` front-matter, a misspelled key (for example `taglinEs`) would be silently dropped and the real field reported missing only if not pending; a `coverImage` could point at a file that is not in `media`.
- **Fix:** front-matter and sections are `z.strictObject`; `validateProjectContent` adds altStatus-with-media, `material/<slug>/` paths and coverImage-in-media checks, and rejects unknown names in `pendingFields`. Covered by two extra tests.
- **Files modified:** src/features/projects/content-schema.ts, src/features/projects/content-schema.test.ts
- **Commit:** 8525aa2

**2. [Rule 3 - Blocking] Biome formatting**
- **Found during:** Task 1 (`pnpm check`)
- **Issue:** Biome flagged redundant parentheses in a loop initializer.
- **Fix:** `biome format --write src/features/projects`.
- **Commit:** 8525aa2

**3. [Rule 1 - Bug] Requirements not marked complete**
- **Found during:** state updates
- **Issue:** `requirements.mark-complete IDEN-05 IDEN-01` checked both off, but this plan is groundwork only: IDEN-05 needs the four interviewed content files (01-07) and IDEN-01 needs DESIGN.md APROBADO with Teo's two sentences (01-11, 01-13).
- **Fix:** reverted `.planning/REQUIREMENTS.md`; both stay Pending.

Wording note: the "Textos de interfaz" entry states the Lab namespace exists now (01-02) and the Hero namespace is created in both files by 01-04, since `messages/*.json` currently hold only Lab.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- 01-07 writes the four content files against `docs/content/README.md` and validates them with `pnpm content:check`. Before captures, omit `media`, `coverImage` and `altStatus`; `metrics` must be present (`[]` if no sourced figure).
- Unquoted YAML numbers parse as numbers and fail (`value` must be a string); the README tells the writer to quote dates, values and URLs.
- 01-10 adds `media`, `coverImage` and `altStatus: draft`; the contract checks paths are under `material/<slug>/` and the cover is one of the media files.

## Self-Check: PASSED

- FOUND: src/features/projects/content-schema.ts, content-file.ts, content-schema.test.ts, docs/content/README.md
- FOUND commits: 8525aa2, 7e01f72 (ancestors of HEAD)
