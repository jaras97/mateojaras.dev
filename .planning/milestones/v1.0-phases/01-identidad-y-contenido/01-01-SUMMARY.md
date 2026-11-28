---
phase: 01-identidad-y-contenido
plan: 01
subsystem: ui
tags: [tailwind-v4, shadcn, next-font, oklch, biome, vitest]

requires: []
provides:
  - "DESIGN.md §3 tokens (--bg, --bg-elev, --ink, --ink-2, --line, --accent, --accent-ink) on :root and .dark"
  - "shadcn alias layer on ':root, .dark' (re-resolves inside nested .dark)"
  - "Tailwind utilities bg-signal/text-signal (terracotta), text-ink-2, font-sans/heading/mono, tracking-display, max-w-page, rounded-sm|md|lg (4px), rounded-xl (8px)"
  - "DESIGN.md §2 type scale with line-height pairs (1.55 xs-lg, 1.1 xl-4xl)"
  - "src/app/fonts.ts: funnelDisplay, hankenGrotesk, geistMono, fontVariables"
  - "Button rethemed: variants default/outline/secondary/ghost/link, sizes sm/default/lg/icon/icon-sm/icon-lg"
  - "pnpm check (typecheck + lint + test + build) green"
affects: [01-02 lab tokens, 01-04 hero, phase 2 root layouts, phase 3 admin, phase 4 public site]

actuals:
  tokens: 3978
  tasks: 2
  commits: 2
plan_head_before: 246f034f2f09519720f5f9ec060997f792bbcaff
plan_head_after: ce629a8922540015e7e3dcc74f7a94fb4e3a5478

tech-stack:
  added: []
  patterns:
    - "Tokens in plain custom properties, shadcn names as aliases on ':root, .dark', Tailwind colors via @theme inline"
    - "Terracotta reaches components only through --color-signal (bg-signal/text-signal) and --ring"
    - "Shared next/font module (src/app/fonts.ts) for every root layout"

key-files:
  created:
    - src/app/fonts.ts
    - vitest.config.ts
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/components/ui/button.tsx
    - src/lib/utils.ts
    - biome.json
    - package.json

key-decisions:
  - "Biome also excludes .impeccable/ (local cache written by the impeccable design hook, ignored only via .git/info/exclude, which Biome does not read)"
  - "Alias selector ':root, .dark' kept on one line with a biome-ignore format comment so the pairing stays greppable"
  - "Biome's CSS formatter normalizes oklch(0.70 ...) and oklch(0.30 ...) to 0.7 / 0.3; numerically identical to DESIGN.md"

patterns-established:
  - "Never edit vendored .claude/ or .agents/ files to satisfy lint; exclude them in biome.json"
  - "Button focus: solid ring-2 ring-ring with ring-offset-2; hover is color-only under motion-safe"

requirements-completed: [IDEN-02, IDEN-03]

coverage:
  - id: D1
    description: "Quality gate pnpm check (next typegen + tsc, biome, vitest, next build) exits 0"
    requirement: IDEN-02
    verification:
      - kind: other
        ref: "pnpm check"
        status: pass
    human_judgment: false
  - id: D2
    description: "DESIGN.md light/dark tokens, alias layer on ':root, .dark', type scale and radii in globals.css; built CSS rule for --background:var(--bg) includes .dark"
    requirement: IDEN-02
    verification:
      - kind: other
        ref: "cat .next/static/chunks/*.css | grep -Eo '[^}]*\\{[^}]*--background:var\\(--bg\\)' | grep -q '\\.dark'"
        status: pass
    human_judgment: false
  - id: D3
    description: "Funnel Display, Hanken Grotesk and Geist Mono self-hosted via next/font (latin + latin-ext, swap), no Google font host in build output"
    requirement: IDEN-03
    verification:
      - kind: other
        ref: "grep -q -- '--font-funnel-display' built CSS && no fonts.(googleapis|gstatic).com under .next/static and .next/server/app"
        status: pass
    human_judgment: false
  - id: D4
    description: "Button retheme matches UI-SPEC (variants, sizes, solid ring, color-only hover, no destructive/xs)"
    verification:
      - kind: other
        ref: "Task 2 automated grep verify + pnpm check"
        status: pass
    human_judgment: true
    rationale: "Visual look of every variant/size and the focus ring is inspected by Teo on /lab/tokens section 04 (plan 01-02)"

duration: 3min
completed: 2026-10-30
status: complete
---

# Phase 1 Plan 01: Tokens, self-hosted fonts and Button retheme Summary

**DESIGN.md OKLCH tokens with a nested-dark-safe shadcn alias layer, the 8-step type scale, Funnel Display/Hanken Grotesk/Geist Mono self-hosted through next/font, a UI-SPEC Button, and a green `pnpm check` gate.**

## Performance

- **Duration:** ~3 min of recorded execution (start recorded after context reading)
- **Started:** 2026-10-30T18:49:40Z
- **Completed:** 2026-10-30T18:51:54Z
- **Tasks:** 2
- **Files modified:** 8 (2 created, 6 modified)

## Accomplishments
- `pnpm check` exists and exits 0 (baseline: `pnpm lint` failed on vendored skill code and the check script did not exist).
- `globals.css` rewritten: verbatim DESIGN.md §3 tokens on `:root` / `.dark`, shadcn aliases on `:root, .dark`, `--color-signal` as the only path to the terracotta, `--color-accent` kept neutral, type scale with all 8 line-height pairs, 4px/8px radii; scaffold gray theme, chart/sidebar/destructive variables removed.
- `src/app/fonts.ts` shares the three families; the root layout uses `fontVariables`, title "Mateo Jaramillo". Font files ship from `/_next/static/media`; no Google host anywhere in the build output.
- Button rethemed to the UI-SPEC contract.

## Task Commits

1. **Task 1: Tracer, quality gate green, tokens and the three families reach the prerendered shell** - `fd82bb0` (feat)
2. **Task 2: Button retheme to the UI-SPEC contract** - `ce629a8` (feat)

Tracer gate: `human_verify_mode` end-of-phase and automated-only verify, so the verify was re-run (pnpm check exit 0, built-CSS check exit 0) before expanding to Task 2.

## Files Created/Modified
- `src/app/globals.css` - tokens, alias layer, @theme mapping, type scale, radii, base layer
- `src/app/fonts.ts` - next/font/google instances and `fontVariables`
- `src/app/layout.tsx` - root layout wired to `fontVariables`, scaffold Geist removed
- `src/components/ui/button.tsx` - Biome formatting (Task 1) and UI-SPEC retheme (Task 2)
- `src/lib/utils.ts` - Biome formatting only
- `biome.json` - excludes `.claude`, `.agents`, `.planning`, `.impeccable`
- `package.json` - scripts `typecheck`, `test`, `check` (dependencies unchanged: 29 / 15)
- `vitest.config.ts` - `@` alias, `src/**/*.test.ts(x)`, node environment

## Decisions Made
See key-decisions. The Biome exclusion of vendored dirs is logged in `docs/decisions.md` by 01-05 (per threat T-01-03).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Biome linted the impeccable hook cache**
- **Found during:** Task 1
- **Issue:** `pnpm lint` failed on `.impeccable/hook.cache.json`, a file the impeccable PostToolUse hook rewrites on every edit. It is ignored only through `.git/info/exclude`, which Biome's `useIgnoreFile` does not read.
- **Fix:** added `"!.impeccable"` to `biome.json` `files.includes` (same category as the vendored `.claude` / `.agents` exclusion).
- **Files modified:** biome.json
- **Verification:** `pnpm check` exit 0
- **Committed in:** fd82bb0

**2. [Rule 3 - Blocking] Acceptance grep `^:root, ?\.dark` vs Biome formatter**
- **Found during:** Task 1
- **Issue:** Biome's CSS formatter splits `:root, .dark` onto two lines, so the criterion's grep returned 0 even though the selector was correct (the built-CSS verify passed).
- **Fix:** `/* biome-ignore format: ... */` above the rule keeps the selector on one line.
- **Files modified:** src/app/globals.css
- **Verification:** grep returns 1; `biome check` clean
- **Committed in:** fd82bb0

**3. [Note] Numeric normalization of two dark tokens**
- Biome formats `oklch(0.70 0.015 260)` and `oklch(0.30 0.012 260)` as `0.7` / `0.3`. Same values; the criteria greps for `0.985 0.006 80` and `0.72 0.16 40` pass.

---

**Total deviations:** 2 auto-fixed (Rule 3), 1 note. **Impact on plan:** tooling only, no visual or dependency change.

## Issues Encountered
None.

## Threat Model
- T-01-01 mitigated: `grep -rlE 'fonts\.(googleapis|gstatic)\.com' .next/static .next/server/app` prints nothing.
- T-01-SC mitigated: dependencies 29 / devDependencies 15, nothing installed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Ready for 01-02 (`/lab` + `/lab/tokens` render the tokens, type scale and every Button combination). The accent 3.19:1 contrast on light `--bg` remains Teo's call at G3 (01-09).

## Self-Check: PASSED
- FOUND: src/app/fonts.ts, vitest.config.ts, src/app/globals.css, src/app/layout.tsx, src/components/ui/button.tsx, biome.json, package.json
- FOUND commits: fd82bb0, ce629a8
- All Task 1 and Task 2 acceptance criteria re-run: PASS
