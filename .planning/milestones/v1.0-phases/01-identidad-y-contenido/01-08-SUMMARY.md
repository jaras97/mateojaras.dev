---
phase: 01-identidad-y-contenido
plan: 08
subsystem: ui
tags: [lab, playwright, axe, captures, impeccable-audit, accessibility]

requires:
  - phase: 01-identidad-y-contenido
    provides: "01-03 Teo's G1 approval (axe: sí) and legitimacy verdict (axe-legitimidad: verificado); 01-06 /lab/hero variants A, B, C and the scripts/capture-lab.ts check harness"
provides:
  - "node scripts/capture-lab.ts capture: 24 full-page PNGs of the D-05 matrix into <main-checkout>/.lab-captures/ ({variant}-{theme}-{lang}-{width}.png)"
  - "axe gate inside node scripts/capture-lab.ts check: /lab/tokens and /lab/hero a/b/c light/dark at 1440, fails on serious or critical"
  - "@axe-core/playwright 4.14.0 (exact devDependency)"
  - ".gitignore excludes /.lab-captures/"
  - ".planning/phases/01-identidad-y-contenido/01-LAB-REVIEW.md: Capturas, /lab/tokens: auditoría, Comprobaciones automáticas"
affects: [01-09 per-variant critique and G3 (appends to 01-LAB-REVIEW.md), 01-12 G7, phase 2 a11y gate and /lab deletion]

actuals:
  tokens: 5019
  tasks: 2
  commits: 2
plan_head_before: 7aaee47121222762f1b4d934516d36f6eccb1f65
plan_head_after: a0c24004e4b225d03e34200fd046547052c975ee

tech-stack:
  added: ["@axe-core/playwright@4.14.0 (dev)"]
  patterns:
    - "Optional dev tooling loaded through a variable-specifier dynamic import plus a local structural type, so the script typechecks and runs with or without the package"
    - "Harness server lifecycle shared by modes through withServer(label, body): build check, port check, detached next start, guaranteed teardown"
    - "Review artifacts resolved to the main checkout via dirname(git rev-parse --path-format=absolute --git-common-dir)"

key-files:
  created:
    - .planning/phases/01-identidad-y-contenido/01-LAB-REVIEW.md
  modified:
    - scripts/capture-lab.ts
    - .gitignore
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Installed @axe-core/playwright@4.14.0 exactly after re-checking Teo's own words: G1 '1 si, 2 si' (item 2 is this package) and legitimacy 'verificado'"
  - "capture mode deletes earlier PNGs in .lab-captures/ before writing, so the folder always holds exactly the current 24-file matrix"
  - "Audit findings are reported, not fixed (D-05): the axe serious at 390 on /lab/tokens is handed to Teo/01-09 instead of being patched or added to the gate"

patterns-established:
  - "axe runs only against the production build through the lab harness; SKIP is printed (never PASS) when the package is absent"

requirements-completed: []
requirements-advanced: [IDEN-04]  # stays Pending until Teo picks a variant at G3 (01-09)

coverage:
  - id: D1
    description: "24 full-page captures (A/B/C x 390/768/1440 x light/dark in en, plus es light at 390/1440) from the production build with fonts loaded, written outside git"
    requirement: IDEN-04
    verification:
      - kind: automated_ui
        ref: "node scripts/capture-lab.ts capture (lab capture: 24 written); find .lab-captures -name '*.png' = 24; git check-ignore -q .lab-captures/a-light-en-390.png"
        status: pass
    human_judgment: false
  - id: D2
    description: "axe reports no serious or critical violation on /lab/tokens and /lab/hero A, B, C in light and dark"
    requirement: IDEN-04
    verification:
      - kind: automated_ui
        ref: "node scripts/capture-lab.ts check (21 passed, 0 failed; 7 axe checks at 1440)"
        status: pass
    human_judgment: false
  - id: D3
    description: "/impeccable audit of /lab/tokens and the automated-check results written to 01-LAB-REVIEW.md"
    requirement: IDEN-04
    verification:
      - kind: other
        ref: "Task 2 verify: sections present, 24 file names listed, DESIGN.md unchanged, no PRODUCT.md, no src/ diff"
        status: pass
    human_judgment: true
    rationale: "Teo reads the review and decides on the findings at G3 (01-09)"

duration: 9min
completed: 2026-10-30
status: complete
---

# Phase 1 Plan 08: Lab captures, axe gate and /lab/tokens audit Summary

**The lab harness gained a capture mode that writes the full 24-PNG D-05 matrix to an ignored folder in the main checkout, plus an axe gate (@axe-core/playwright 4.14.0, approved and verified by Teo). The gate passes on all 7 pages. The /impeccable audit of /lab/tokens scored 17/20 and found one axe-serious issue that only shows at 390 px. All of it is collected in 01-LAB-REVIEW.md for 01-09.**

## Performance

- **Duration:** about 9 min
- **Started:** 2026-10-30T20:18Z (approximate)
- **Completed:** 2026-10-30T20:27Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- **Axe ran; no deviation applies.** 01-03-ANSWERS.md reads `axe: sí` and `axe-legitimidad: verificado`. Both lines match Teo's own words: G1 "1 si, 2 si", where item 2 is @axe-core/playwright, and "verificado, …". The package is pinned to exactly 4.14.0 in devDependencies.
- `node scripts/capture-lab.ts check` now has 21 checks: the 14 from 01-06 plus 7 axe checks (wcag2a/aa, wcag21a/aa) on /lab/tokens and /lab/hero a/b/c in light and dark at 1440. All 21 pass.
- `node scripts/capture-lab.ts capture` writes 24 full-page PNGs to `/Users/mateojaramillo/projects/mateojaras.dev/.lab-captures/`. Each capture uses a new context with reduced motion, `capture=1` and `document.fonts.ready`. The folder is git-ignored, and `git status` shows nothing under it.
- 01-LAB-REVIEW.md has three sections, "Capturas", "/lab/tokens: auditoría" and "Comprobaciones automáticas", and no variant sections. It includes a measured headline line-count table: ES is 13 lines at 390 and 10 at 1440, EN is 10 lines at 390 and 8 at 1440, the same in all three variants. That way the ES headline length issue from 01-06 reaches Teo at 01-09 without the headline being shortened here.

## Task Commits

1. **Task 1: Tracer, capture matrix and axe gate end to end on the production build**: `6fe7e8c` (feat)
2. **Task 2: Audit of /lab/tokens and the first half of 01-LAB-REVIEW.md**: `a0c2400` (docs)

Tracer gate: `pnpm check && node scripts/capture-lab.ts check && node scripts/capture-lab.ts capture` passed end to end (21/21 checks, 24 written), and so did the count/ignore verify, before Task 2.

## Files Created/Modified

- `scripts/capture-lab.ts`: `capture` mode, axe checks inside `check`, a shared `withServer` lifecycle and main-checkout root resolution
- `.gitignore`: commented `/.lab-captures/` block
- `package.json`, `pnpm-lock.yaml`: `@axe-core/playwright` 4.14.0 exact (dev)
- `.planning/phases/01-identidad-y-contenido/01-LAB-REVIEW.md`: review package, first half

## Audit highlights (full detail in 01-LAB-REVIEW.md)

- **P1:** at 390 px the contrast table on /lab/tokens overflows inside its `overflow-x-auto` wrapper (455 px in 342 px), and the wrapper has no tabindex. axe flags `scrollable-region-focusable` as **serious**. Chromium 156 makes the scroller focusable by itself, but Safari does not. The plan's gate runs axe at 1440, where the table fits, so it passes. I reported this and did not fix it (D-05).
- **P1 (handed to 01-09):** light `--accent` measures 3.19:1 on `--bg`. On /lab/tokens it appears only as non-text (swatch, 8 px status dots, focus ring), which passes 1.4.11. Used as small text, it would fail AA. That is a palette decision for Teo.
- P2: `sm` buttons are 32 px (they pass 2.5.8 at 24 px but are below 44). The scroller's focus style is the browser default outline. P3: three single-word last lines at 390.
- Detector notes: `overused-font` (Geist Mono) and `cream-palette` (`--bg`) both point at values fixed in DESIGN.md, so they stay Teo's call. `em-dash-overuse` is a false positive: the detector counts `--token` names.
- An extra axe pass on /lab/hero a/b/c at 390 and 768 (light and dark, en and es, 24 combinations) found 0 violations of any severity.

## Decisions Made

See key-decisions in the frontmatter. None of them is non-trivial at the product level, so `docs/decisions.md` has no new entry. The axe install is Teo's own approval, already recorded in 01-03-ANSWERS.md.

## Deviations from Plan

**1. [Minor wording] Capture summary line includes the output path.** The plan's interface says `lab capture: N written`. The script prints `lab capture: 24 written to <dir>`, which keeps the `lab capture: 24 written` prefix the verify relies on and also shows Teo where the files are.

**2. [Impeccable directive] No structured question tool in this subagent.** The impeccable context script asks for a one-time interview probe. This executor has no way to ask, and the plan forbids init/PRODUCT.md, so product context came from PROJECT.md and the audit ran without the probe. No file was created.

Otherwise the plan ran exactly as written.

## Issues Encountered

- `pkill -f "next start -p 3111"` did not stop the scratch audit server because the process renames itself to next-server. I stopped it by port with `lsof -ti tcp:3111 | xargs kill`. The harness's own process-group teardown on 3100 was unaffected.

- `requirements.mark-complete IDEN-04` checked IDEN-04 off. IDEN-04 ends with "y Teo elige una", and that choice happens at G3 in 01-09, so I reverted REQUIREMENTS.md to Pending. It is advanced here, not complete.

## Known Stubs

None.

## Threat Flags

None. The only new surface is a local, git-ignored capture folder (T-01-14, mitigated as planned) and a dev-only package installed behind Teo's G1 and legitimacy gates (T-01-SC). DESIGN.md is unchanged, no PRODUCT.md exists and src/ has no diff in Task 2 (T-01-15).

## Next Phase Readiness

- 01-09 appends the per-variant critique and the open questions to 01-LAB-REVIEW.md and presents the review at G3. Items to carry: the ES headline length (13 lines at 390), the light-accent-as-text P1 and the tokens-table scroll region P1.
- Teo can open the 24 captures at `/Users/mateojaramillo/projects/mateojaras.dev/.lab-captures/`.

## Self-Check: PASSED

- FOUND: scripts/capture-lab.ts, .gitignore (/.lab-captures/), .planning/phases/01-identidad-y-contenido/01-LAB-REVIEW.md, 24 PNGs in .lab-captures/
- FOUND: 6fe7e8c, a0c2400 (ancestors of HEAD)
- devDependencies['@axe-core/playwright'] === '4.14.0'
