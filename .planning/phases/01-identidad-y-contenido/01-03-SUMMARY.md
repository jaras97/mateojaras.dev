---
phase: 01-identidad-y-contenido
plan: 03
subsystem: assets
tags: [fonts, react-pdf, fonttools, ofl, approvals, dependencies]

requires: []
provides:
  - "assets/fonts-pdf/: six static TTFs (FunnelDisplay SemiBold/Bold, HankenGrotesk Regular/Bold/Italic, GeistMono Regular) with the react-pdf file names of .claude/CLAUDE.md §7"
  - "assets/fonts-pdf/OFL-{FunnelDisplay,HankenGrotesk,GeistMono}.txt shipped next to the fonts"
  - "scripts/fetch-pdf-fonts.sh: re-runnable download from the official Google Fonts download manifest (static/ folders, D-19)"
  - "scripts/verify-pdf-fonts.py: fontTools gate (no fvar, usWeightClass by name, italicAngle for Italic, á é í ó ú ü ñ Á É Í Ó Ú Ü Ñ ¿ ¡ in cmap), exit 1 on failure or no arguments"
  - "01-03-ANSWERS.md: Teo's G1 reply and axe legitimacy verdict verbatim, Lectura lines yaml: sí, axe: sí, axe-legitimidad: verificado"
affects: [01-05 content contract (yaml), 01-08 axe gate (@axe-core/playwright), 01-12 check-phase-1.sh, phase 3 CV PDF Font.register]

actuals:
  tokens: 4700
  tasks: 3
  commits: 3
plan_head_before: 11f15ddb52c96923417026645ae9c07f4823eb3a
plan_head_after: 14747075022e086dc968d656db75eb2150df9a0e

tech-stack:
  added: []
  patterns:
    - "Binary assets fetched by a committed, re-runnable script and gated by a local fontTools check (fontTools stays a local tool, never a project dependency)"
    - "Human approvals recorded verbatim in an ANSWERS file, with machine-read Lectura lines derived only by the plan's reading rule"

key-files:
  created:
    - scripts/fetch-pdf-fonts.sh
    - scripts/verify-pdf-fonts.py
    - assets/fonts-pdf/FunnelDisplay-SemiBold.ttf
    - assets/fonts-pdf/FunnelDisplay-Bold.ttf
    - assets/fonts-pdf/HankenGrotesk-Regular.ttf
    - assets/fonts-pdf/HankenGrotesk-Bold.ttf
    - assets/fonts-pdf/HankenGrotesk-Italic.ttf
    - assets/fonts-pdf/GeistMono-Regular.ttf
    - assets/fonts-pdf/OFL-FunnelDisplay.txt
    - assets/fonts-pdf/OFL-HankenGrotesk.txt
    - assets/fonts-pdf/OFL-GeistMono.txt
    - .planning/phases/01-identidad-y-contenido/01-03-ANSWERS.md
  modified: []

key-decisions:
  - "D-19 followed as locked: all six TTFs come from the official static/ folders; the varLib.instancer fallback was not needed"
  - "OFL texts kept byte-identical to the official manifest (CRLF line endings preserved)"
  - "Teo approved yaml@2.9.1 and @axe-core/playwright@4.14.0 as exact devDependencies (G1: '1 si, 2 si'); install happens in 01-05 and 01-08, not here"
  - "Teo verified @axe-core/playwright on npm (axe-legitimidad: verificado) and asked to be consulted only on highly relevant matters"

patterns-established:
  - "ANSWERS file per checkpointed plan: verbatim reply block, then a Lectura block derived by a re-checkable rule"

requirements-completed: [IDEN-03]

coverage:
  - id: D1
    description: "Six static TTFs pass the fontTools gate (no fvar, correct weight, italic angle, Spanish glyphs)"
    requirement: IDEN-03
    verification:
      - kind: other
        ref: "python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf"
        status: pass
    human_judgment: false
  - id: D2
    description: "Exactly six TTFs and three OFL files, SIL text present, all nine tracked; gate exits 1 with no arguments"
    requirement: IDEN-03
    verification:
      - kind: other
        ref: "ls/wc counts + grep 'SIL OPEN FONT LICENSE' + git ls-files --error-unmatch + no-arg run exit 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "Fetch script uses the download/list manifest, never the CSS API"
    verification:
      - kind: other
        ref: "grep -c 'download/list' = 2, grep -c 'googleapis' = 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "G1 and legitimacy answers recorded verbatim from Teo, Lectura lines by the reading rules, committed alone"
    verification:
      - kind: other
        ref: "grep -cE '^(yaml|axe): ' = 2, grep -cE '^(material|métricas): ' = 0, grep -c '^axe-legitimidad: ' = 1"
        status: pass
    human_judgment: true
    rationale: "Only Teo's own messages count; 01-12 check-phase-1.sh re-derives every Lectura line"

duration: 31min
completed: 2026-10-30
status: complete
---

# Phase 1 Plan 03: Static PDF fonts and phase-start approvals Summary

**Six static TTFs from Google Fonts' official static/ folders (Funnel Display, Hanken Grotesk, Geist Mono) with their OFL licenses and a fontTools gate proving they are static, correctly weighted and cover Spanish; plus Teo's verbatim approval of yaml and @axe-core/playwright and his npm legitimacy verdict for the latter.**

## Performance

- **Duration:** ~31 min wall clock (2026-10-30T18:52Z to 19:23Z), most of it waiting on Teo's two checkpoint replies
- **Started:** 2026-10-30T18:52:42Z (plan base 11f15dd)
- **Completed:** 2026-10-30T19:23:06Z
- **Tasks:** 3 (1 tracer, 2 blocking-human checkpoints)
- **Files created:** 12

## Accomplishments
- `python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf` prints six OK lines: FunnelDisplay 600/700 (348 glyphs), HankenGrotesk 400/700/400-italic (550), GeistMono 400 (889). Baseline: `assets/` did not exist.
- `scripts/fetch-pdf-fonts.sh` re-creates all nine files from `fonts.google.com/download/list` (D-19 source), failing loudly on any missing entry.
- Teo's G1 approvals and the axe legitimacy verdict are committed in `01-03-ANSWERS.md`, each in its own commit, before any dependent plan (01-05, 01-08, 01-12) reads them.
- No package was installed.

## Respuestas de Teo

Copied from `01-03-ANSWERS.md`.

G1 (Fecha: 2026-10-30):

> 1 si, 2 si

Lectura de G1: `yaml: sí`, `axe: sí`.

Legitimidad de @axe-core/playwright (Fecha: 2026-10-30):

> verificado, igual estas en modo yolo, solo preguntame cosas que tengan mucha relevancia

Lectura de legitimidad: `axe-legitimidad: verificado` (first word is "verificado", the reply contains no "rechaz").

## Task Commits

1. **Task 1: Tracer, download, rename, license and verify the six static TTFs** - `9856cea` (feat)
2. **Task 2: G1, Teo approves the phase-start dependencies** - `03fab8f` (docs)
3. **Task 3: Package legitimacy, Teo verifies @axe-core/playwright on npm** - `1474707` (docs)

Tracer gate: the automated verify was re-run end to end before the G1 checkpoint and passed.

## Files Created/Modified
- `scripts/fetch-pdf-fonts.sh` - manifest-driven download of six TTFs and three OFL texts
- `scripts/verify-pdf-fonts.py` - fontTools gate
- `assets/fonts-pdf/*.ttf` (6) - static CV PDF fonts
- `assets/fonts-pdf/OFL-*.txt` (3) - SIL OFL per family
- `.planning/phases/01-identidad-y-contenido/01-03-ANSWERS.md` - Teo's replies and Lectura lines

## Decisions Made
See key-decisions. D-19's `fonttools varLib.instancer` fallback was **not needed**: the official Funnel Display download ships both static files.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None.

## Next Phase Readiness
- 01-05 may install `yaml@2.9.1` (exact) as a devDependency (`yaml: sí`).
- 01-08 may install `@axe-core/playwright@4.14.0` (exact) as a devDependency (`axe: sí` and `axe-legitimidad: verificado`).
- Teo's standing instruction from his reply: ask him only about highly relevant matters. Orchestrators should weigh this when deciding which later checkpoints truly need him (blocking-human gates in the plans still apply).
- Phase 3 can `Font.register` the files by the names in .claude/CLAUDE.md §7; react-pdf rendering of these instances remains RESEARCH assumption A2 (phase 3 spike).

## Self-Check: PASSED

- FOUND: scripts/fetch-pdf-fonts.sh, scripts/verify-pdf-fonts.py, six TTFs, three OFL files, 01-03-ANSWERS.md
- FOUND commits: 9856cea, 03fab8f, 1474707 (all ancestors of HEAD)
