---
phase: 01-identidad-y-contenido
plan: 06
subsystem: ui
tags: [hero, lab, server-components, cache-components, playwright, vitest, react-dom-server]

requires:
  - phase: 01-identidad-y-contenido
    provides: "01-01 Button/tokens/check; 01-02 /lab, Lab namespace, labMessages; 01-04 heroFixture with Teo's G2 values, heroFixtureMeta provenance, StatusLine, heroCopy, localized()"
provides:
  - "src/components/site/hero/hero-a.tsx, hero-b.tsx, hero-c.tsx: HeroA, HeroB, HeroC static Server Components ({ settings, locale, cta }) that return null on an empty headline"
  - "src/components/site/hero/hero-parts.tsx: HeroProps, heroSectionClass, heroTitleClass, HeroCta (44px Button link)"
  - "/lab/hero: variant/lang/theme/capture params read inside Suspense, nested dark theme, unknown-variant and empty-headline states"
  - "src/app/lab/_components/lab-bar.tsx: LabBar (next/link, no client JS) and labHeroHref"
  - "Lab.hero strings in messages/en.json and messages/es.json"
  - "scripts/capture-lab.ts check: next start on port 3100 plus 14 Chromium checks"
affects: [01-08 captures and axe, 01-09 critique and G3, 01-12 G7, phase 2 /lab deletion and home hero]

actuals:
  tokens: 8700
  tasks: 2
  commits: 2
plan_head_before: bad91ce04a2724ecec501ab13a8e8fa186467cb3
plan_head_after: 205bc0689a7971d4045a3d5ef2d1f5fb219960e3

tech-stack:
  added: []
  patterns:
    - "Hero variants share props, container classes and the CTA through hero-parts; each variant keeps its own h1#hero-title and localized() call"
    - "Lab harness as a single Node 24 type-stripped script: spawns next start detached and kills the process group on every exit path"
    - "Browser-side token assertions with probe elements (var(--bg), var(--accent)) instead of hardcoded OKLCH values"

key-files:
  created:
    - src/components/site/hero/hero-a.tsx
    - src/components/site/hero/hero-b.tsx
    - src/components/site/hero/hero-c.tsx
    - src/components/site/hero/hero-parts.tsx
    - src/components/site/hero/hero.test.tsx
    - src/app/lab/hero/page.tsx
    - src/app/lab/_components/lab-bar.tsx
    - scripts/capture-lab.ts
  modified:
    - messages/en.json
    - messages/es.json

key-decisions:
  - "LabBar headline notes read heroFixtureMeta.headlineEsStatus + headlineAuthorship and headlineEnStatus, so /lab/hero always says the headline is Claude's draft at Teo's request, pending G7. It never presents it as Teo's approved text"
  - "The docs/copy.md draft note is kept behind its original condition (headlineSource contains docs/copy.md) and does not fire with the current fixture"
  - "Shared hero pieces live in hero-parts.tsx, but every variant keeps its own h1#hero-title and localized() call so the per-file contract stays greppable"

patterns-established:
  - "Lab checks run against pnpm build output on port 3100 at 390px with reducedMotion reduce, and every check also asserts there is no horizontal scroll"

requirements-completed: [IDEN-04]

coverage:
  - id: D1
    description: "HeroA, HeroB and HeroC render the fixture headline in h1#hero-title, return null on an empty headline and share the CTA href per locale"
    requirement: IDEN-04
    verification:
      - kind: unit
        ref: "src/components/site/hero/hero.test.tsx (19 tests)"
        status: pass
    human_judgment: false
  - id: D2
    description: "/lab/hero renders A, B and C in en/es and light/dark at 390px with no horizontal scroll, headline >= 44.8px balanced, no separator at line start, one accent element, nested dark cascade, unknown-variant state"
    requirement: IDEN-04
    verification:
      - kind: automated_ui
        ref: "node scripts/capture-lab.ts check (14 passed, 0 failed)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Visual hierarchy and wrapping quality of the three variants"
    verification: []
    human_judgment: true
    rationale: "Hierarchy and wrapping are visual judgments; formal review is 01-08 captures and 01-09 critique plus Teo's G3 choice"

duration: 7min
completed: 2026-10-30
status: complete
---

# Phase 1 Plan 06: Hero variants A, B and C in /lab/hero Summary

**Three static hero Server Components (headline-first, logbook-entry and editorial-index) built from Teo's fixture and wired into a param-driven /lab/hero. A Chromium harness on port 3100 checks them at 390px in en/es and light/dark, plus C's index layout at 1440px.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-10-30T20:11:29Z
- **Completed:** 2026-10-30T20:18:01Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- HeroA puts the headline first, the StatusLine 32px below and the CTA 48px below that. HeroB opens with the StatusLine and its entry date, then a 1px rule 16px below, then the headline and the CTA 48px apart. HeroC puts the headline block in columns 1-8 and a plain-text 01/02/03 index in columns 10-12 behind a 1px rule. Below lg, C's index moves under the CTA. None of them has a client directive, an animation, a shadow or a gradient. The only accent is the StatusLine dot.
- /lab/hero reads `searchParams` inside Suspense, with an empty `min-h-dvh bg-background` fallback, so the route builds as a partial prerender. `variant`, `lang`, `theme` and `capture` are whitelisted. An unknown variant is echoed only as a React text child. An unknown lang or theme falls back to en and light.
- LabBar has three link groups (Variante, Tema, Idioma) with `aria-current` on the active option and no accent. It also shows the headline provenance notes. All lab chrome strings are in `Lab.hero` of both messages files, and key parity holds.
- `node scripts/capture-lab.ts check` passes 14 checks. They cover /lab, /lab/tokens (noindex and 8 format samples), the default LabBar state, each variant in en and es (fixture headline, at least 44.8px, balanced wrap, no line starting with "·", at most one accent element, no bar with capture=1), the dark cascade for each variant, C's layout at 1440px and the unknown variant.

## Task Commits

1. **Task 1: Tracer, HeroA from the fixture through /lab/hero to a real-browser check** - `45e14c7` (feat)
2. **Task 2: Variants B and C, registered and checked** - `205bc06` (feat)

The tracer gate re-ran `pnpm check && node scripts/capture-lab.ts check` (7 passed) before expansion. Human-verify mode is end-of-phase and the verify step is automated only, so no checkpoint was needed.

## Files Created/Modified

- `src/components/site/hero/hero-a.tsx`, `hero-b.tsx`, `hero-c.tsx`: the three variants
- `src/components/site/hero/hero-parts.tsx`: shared props, container and title classes, HeroCta
- `src/components/site/hero/hero.test.tsx`: 19 renderToStaticMarkup tests
- `src/app/lab/hero/page.tsx`: the lab page (Suspense, whitelist, states, variant registry)
- `src/app/lab/_components/lab-bar.tsx`: LabBar and labHeroHref
- `scripts/capture-lab.ts`: the `check` harness
- `messages/en.json`, `messages/es.json`: `Lab.hero` (bar, notes, unknownVariant, emptyHeadline)

## Decisions Made

See key-decisions in the frontmatter. The headline's authorship was already logged in `docs/decisions.md` by 01-04, so no new entry was needed.

## Deviations from Plan

### Plan adjustments

**1. [Orchestrator adjustment from 01-04] LabBar headline note reads the new provenance fields**
- **Found during:** Task 1
- **Issue:** The plan's note, "Headline: borrador de docs/copy.md", fires only while `headlineSource` points at docs/copy.md. After G2, `headlineSource` is "Teo, 2026-10-30". The Spanish headline, however, is Claude's completion at Teo's request (`headlineEsStatus: "draft"`, `headlineAuthorship`), and the English one is Claude's translation (`headlineEnStatus: "draft-translation"`).
- **Fix:** LabBar now shows "Headline ES: borrador, propuesta de Claude por encargo de Teo, 2026-10-30, pendiente de aprobación en G7" while `headlineEsStatus` is draft, and "Headline EN: traducción pendiente de aprobación" while `headlineEnStatus` is draft-translation. Both are templates from `Lab.hero.notes`. The docs/copy.md note keeps its original condition. The harness asserts that both notes are present on the default /lab/hero.
- **Files modified:** src/app/lab/hero/page.tsx, messages/en.json, messages/es.json
- **Committed in:** 45e14c7

**2. [Rule 3 - Blocking] Biome a11y/useAnchorContent on the Base UI render anchor**
- **Found during:** Task 1 (`pnpm check`)
- **Issue:** Biome cannot see that Base UI renders the Button's children (`cta.label`) inside `render={<a href />}`.
- **Fix:** Added a scoped `biome-ignore` comment with that reason on the render prop. The anchor does have text, as the tests and harness confirm.
- **Files modified:** src/components/site/hero/hero-a.tsx, later hero-parts.tsx
- **Committed in:** 45e14c7, 205bc06

**3. Extra file hero-parts.tsx and LabBar prop shape**
- `hero-parts.tsx` was not in `files_modified`. It holds the props type, the container and title classes and the CTA for all three variants, which avoids three copies of the CTA suppression. Each variant still has its own `h1#hero-title` and `localized(` call, so the Task 1 greps and key_links still match `hero-a.tsx`.
- LabBar takes `{ params, notes: string[] }` instead of `{ variant, theme, lang, note }`, because more than one note can apply. This is internal structure only.

**4. Harness checks beyond the plan (Rule 2, proving the plan's prohibitions)**
- Added: a single-accent-element assertion in every hero check (the prohibition "accent at most once per view"), C's layout at 1440px (index to the right, top-aligned, 1px left rule, no links), the default LabBar state and notes, and the backstop truth checks (font-size at least 44.8px, text-wrap balance, no "·" at a line start).

**5. TDD commit shape (Task 2)**
- RED was observed locally: the suite failed on the missing hero-b and hero-c modules. GREEN is the task commit. As in 01-04, there is one commit per task (CLAUDE.md) instead of separate test/feat commits.

---

**Total deviations:** 1 orchestrator adjustment, 1 Rule 3 fix, 1 Rule 2 addition and 2 structural notes.
**Impact on plan:** None on scope. The headline note is now accurate, and the extra checks make the plan's prohibitions machine-checked.

## Issues Encountered

- **The headline is long at 390px. Report this to Teo in 01-09, and do not shorten it silently.** In my own screenshots, not committed, the Spanish headline wraps to about 13 lines at 390px and the English one to 8 lines at 1440px in variant C's 8 columns. That is over the 7-line threshold in the plan's edge_coverage. There is no horizontal scroll and the size stays at or above 44.8px, so it is a copy-length question for G7, not a layout bug.
- Node prints a `MODULE_TYPELESS_PACKAGE_JSON` warning when running the `.ts` script, because package.json has no `"type"`. It is harmless. Changing package.json `type` is out of scope.

## Known Stubs

None. Variant C's index is plain text by design (UI-SPEC: sections arrive in phase 4). The CTA's 404 on /contact and /es/contacto is accepted for phase 1.

## User Setup Required

None. No external service configuration is required.

## Next Phase Readiness

- 01-08 can add `capture` mode and axe to `scripts/capture-lab.ts`. `buildChecks`, `runCheck` (with a per-check viewport) and the server lifecycle can be reused.
- 01-09 must surface the headline length (above) and the headline's draft status together with the critique.

## Self-Check: PASSED

- FOUND: src/components/site/hero/hero-a.tsx, hero-b.tsx, hero-c.tsx, hero-parts.tsx, hero.test.tsx, src/app/lab/hero/page.tsx, src/app/lab/_components/lab-bar.tsx, scripts/capture-lab.ts
- FOUND commits: 45e14c7, 205bc06 (ancestors of HEAD)
- `pnpm check` exit 0 (62 tests). `node scripts/capture-lab.ts check`: 14 passed, 0 failed. All Task 1 and Task 2 acceptance greps pass. Lab key parity exits 0.
