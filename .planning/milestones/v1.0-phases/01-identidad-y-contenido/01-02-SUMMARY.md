---
phase: 01-identidad-y-contenido
plan: 02
subsystem: ui
tags: [lab, tokens, next-app-router, messages, vitest]

requires:
  - phase: 01-01
    provides: "DESIGN.md tokens on :root/.dark with the ':root, .dark' alias layer, type scale, fonts.ts, rethemed Button, pnpm check"
provides:
  - "/lab (index: two links) and /lab/tokens sections 01 Color, 02 Tipografía, 03 Espacio y radios, 04 Componentes"
  - "Lab layout: robots noindex/nofollow, notFound() when VERCEL_ENV is production, lang es"
  - "SectionNumber (src/components/site/section-number.tsx)"
  - "messages/en.json and messages/es.json with the Lab namespace (same keys)"
  - "src/lib/messages.ts: labMessages (es Lab namespace typed as en) and the LabMessages type"
  - "src/lib/messages.test.ts: two-way namespace and key parity of both messages files, inside pnpm test"
affects: [01-04 status line section 05 and Hero namespace, 01-06 /lab/hero, phase 2 next-intl wiring and /lab deletion]

actuals:
  tokens: 4239
  tasks: 2
  commits: 2
plan_head_before: 591372262476ab53d150c798958d218f00541df6
plan_head_after: 0c2c467a98fbde1752b74b39764f51ff9ecb5dd0

tech-stack:
  added: []
  patterns:
    - "Interface strings read from messages/*.json through relative JSON imports until next-intl is wired (phase 2); en is imported as a type only, es is the rendered value"
    - "Nested .dark container (class first in the list) shows the dark theme next to the light one"
    - "Specimen data (token names, OKLCH values, contrast rows, Button variant names, sample text) stays in code; chrome comes from messages/"

key-files:
  created:
    - src/app/lab/layout.tsx
    - src/app/lab/page.tsx
    - src/app/lab/tokens/page.tsx
    - src/app/lab/_components/specimens.tsx
    - src/components/site/section-number.tsx
    - messages/en.json
    - messages/es.json
    - src/lib/messages.ts
    - src/lib/messages.test.ts
  modified: []

key-decisions:
  - "Lab chrome lives in messages/en.json and messages/es.json from the start (CLAUDE.md rule); departs only from the UI-SPEC note that kept lab strings in code. 01-05 logs it in docs/decisions.md"
  - "src/lib/messages.ts uses `import type` for en.json (Biome useImportType): en only provides the type, so it never ships in a bundle"
  - "Lab message keys nested by page and section (Lab.index.*, Lab.tokens.sections.*, Lab.tokens.color.*, Lab.tokens.typography.*, Lab.tokens.spacing.*)"

patterns-established:
  - "Any new namespace in messages/ must exist in both files with identical key paths, or pnpm check fails"
  - "SectionNumber + h2 (font-heading text-xl font-semibold) in a flex baseline row with gap-4 is the section heading chrome"

requirements-completed: [IDEN-02, IDEN-03]

coverage:
  - id: D1
    description: "/lab/tokens prerenders sections 01 to 04 with the nested dark column, robots noindex and self-hosted font files under /_next/static/media"
    requirement: IDEN-02
    verification:
      - kind: other
        ref: "pnpm check; grep checks on .next/server/app/lab/tokens.html (>Tokens<, >Color<, >Tipografía<, >Espacio y radios<, >Componentes<, noindex, class=\"dark, /_next/static/media/*.woff2, 16 data-slot=\"button\")"
        status: pass
    human_judgment: true
    rationale: "Color, glyph rendering and focus feel are visual; Teo inspects /lab/tokens at the end-of-phase review (backstop truth on the Tab ring)"
  - id: D2
    description: "Glyph row á é í ó ú ü ñ Ñ ¿ ¡ in Funnel Display, Hanken Grotesk and Geist Mono, served from /_next/static/media"
    requirement: IDEN-03
    verification:
      - kind: automated_ui
        ref: "playwright screenshot of /lab/tokens at 390 and 1440 (scrollWidth equals viewport, no horizontal scroll)"
        status: pass
    human_judgment: true
    rationale: "Glyph quality is a visual judgment for Teo"
  - id: D3
    description: "messages/en.json and messages/es.json carry the same namespaces and keys, enforced both ways"
    verification:
      - kind: unit
        ref: "src/lib/messages.test.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: "Lab is unreachable in Vercel production and unlinked from outside /lab"
    verification:
      - kind: other
        ref: "grep VERCEL_ENV/notFound in src/app/lab/layout.tsx; grep -rn '/lab' src/app --include='*.tsx' outside src/app/lab prints nothing"
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-10-30
status: complete
---

# Phase 1 Plan 02: Lab token specimen Summary

**`/lab` and `/lab/tokens` render the DESIGN.md tokens light and dark side by side with the measured contrast table, the 8-step type scale and glyph row in the three self-hosted families, the spacing and radius scale, and every Button variant and size. The chrome is read from a Lab namespace that tsc and a Vitest parity test keep in sync across `messages/en.json` and `messages/es.json`.**

## Performance

- **Duration:** ~4 min of recorded execution
- **Started:** 2026-10-30T19:25:04Z
- **Completed:** 2026-10-30T19:28:52Z
- **Tasks:** 2
- **Files:** 9 created

## Accomplishments
- `/lab`: h1 and two `next/link` links (`/lab/tokens`, `/lab/hero`; the latter arrives in 01-06).
- `/lab/tokens` (static, prerendered): 01 Color has light and nested `.dark` swatch columns with verbatim OKLCH values, plus the UI-SPEC "Contraste medido" table. 02 Tipografía shows the family weights and the 8 steps with their line-heights. 03 Espacio y radios shows 4 to 64px bars, the 96/128 note and the 4/8/0 radii. 04 Componentes has 15 Buttons plus a disabled one.
- Lab layout: `robots: { index: false, follow: false }`, `notFound()` under `VERCEL_ENV === "production"`, `lang="es"`.
- `SectionNumber` for /lab/tokens and hero variant C.
- `messages/` created with the Lab namespace. The parity test fails on an extra key in es that tsc lets through (checked: added a throwaway key, the test failed and tsc passed, then reverted).

## Task Commits

1. **Task 1: Tracer, /lab and /lab/tokens sections 01 to 03 from messages/** - `26ff749` (feat)
2. **Task 2: /lab/tokens section 04 Componentes** - `0c2c467` (feat)

Tracer gate: `human_verify_mode` is end-of-phase and the verify block is automated, so I re-ran it before expanding. `pnpm check`, the prerender greps, the node parity check and the vitest file all passed. Visual checks with Playwright: no horizontal scroll at 390 or 1440, and the dark column really renders dark. In section 04 the computed focus `box-shadow` shows a 2px `--bg` offset and a 2px solid accent ring in both themes.

## Files Created/Modified
- `src/app/lab/layout.tsx` - noindex lab wrapper, production guard
- `src/app/lab/page.tsx` - lab index
- `src/app/lab/tokens/page.tsx` - sections 01 to 04
- `src/app/lab/_components/specimens.tsx` - TOKENS, TokenSwatchColumn, ContrastTable, TypeSpecimen, SpacingScale, RadiusSamples
- `src/components/site/section-number.tsx` - SectionNumber
- `messages/en.json`, `messages/es.json` - Lab namespace
- `src/lib/messages.ts` - labMessages, LabMessages
- `src/lib/messages.test.ts` - two-way parity test

## Decisions Made
See key-decisions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Biome useImportType warning on messages.ts**
- **Found during:** Task 1
- **Issue:** `en.json` is only used for its type, and Biome warned.
- **Fix:** `import type en from "../../messages/en.json"`. The key-link pattern `messages/en.json` still matches.
- **Files modified:** src/lib/messages.ts
- **Commit:** 26ff749

**2. [Note] Acceptance grep `grep -c '"Lab"' messages/en.json` returns 2, not 1**
- The namespace key appears once. The second match is the /lab h1 value `"title": "Lab"`, which the plan requires. The intent of the criterion (the Lab namespace exists) holds, and the node parity check and vitest confirm it.

**3. [Note] Dark column class order**
- `cn("dark", ...)` puts `dark` first so the prerendered HTML matches the plan's `class="dark` grep, and the wrapper also sets `text-foreground` so inherited text re-resolves to the dark ink.

---

**Total deviations:** 1 auto-fixed (Rule 3), 2 notes. **Impact on plan:** none on behavior or scope. No dependency added (29 / 15 unchanged).

## Issues Encountered
None.

## Known Stubs
None. The `/lab/hero` link points to a route that plan 01-06 creates. The UI-SPEC defines the link, so this is intentional and not a stub.

## Threat Model
- T-01-02 mitigated: noindex metadata in the prerendered HTML, a `VERCEL_ENV` production guard and no inbound links from outside `src/app/lab`.
- T-01-SC mitigated: nothing installed.

## User Setup Required
None.

## Next Phase Readiness
01-04 can add section 05 (StatusLine) and a Hero namespace. The parity test covers new namespaces without edits, and `labMessages` shows the pattern for `heroMessages`.

## Self-Check: PASSED
- FOUND: all 9 created files
- FOUND commits: 26ff749, 0c2c467 (ancestors of HEAD)
