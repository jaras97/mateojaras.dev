---
phase: 04-sitio-p-blico
plan: 05
subsystem: site-motion
tags: [gsap, scrolltrigger, case-study, motion, e2e, screenshots]
requires: [04-03, 04-04, 04-12]
provides:
  - ScrollScene (the site's single scrubbed scene, case study only)
  - SectionMarginNumber (two-layer margin number)
  - e2e/case-study-motion.spec.ts, e2e/screens-case.spec.ts
affects: [04-11]
key-files:
  created:
    - src/components/motion/scroll-scene.tsx
    - src/components/site/case-study/section-margin-number.tsx
    - e2e/case-study-motion.spec.ts
    - e2e/screens-case.spec.ts
  modified:
    - src/components/site/page-section.tsx
    - src/components/site/case-study/case-sections.tsx
    - src/components/site/case-study/case-study.test.tsx
    - src/app/[locale]/projects/[slug]/page.tsx
requirements-completed: [MOTN-03, MOTN-04, CASE-03, QUAL-04]
duration: ~25 min
completed: 2026-11-22
---

# Phase 4 Plan 05: Scrubbed section number and case-study review Summary

One GSAP ScrollTrigger scene (opacity only, lazy-loaded, Activity-safe, off under reduced motion and below 1024px) raises an accent copy of each case section's margin number, plus 12 screenshots and a review of the case view.

## Tasks

| Task | Commit | Notes |
|------|--------|-------|
| 1 Scrubbed margin number | 58b9df7 | ScrollScene, SectionMarginNumber, motion e2e (5 tests green) |
| 2 Screenshots and audit | b217fc3 | 12 PNGs in test-results/screens/case/, alignment fix |

`pnpm check` passes (typecheck, lint, test, build).

## Deviations from Plan

**1. [Rule 3] PageSection gained `marginNumber` and `scene` props.** The plan listed page-section.tsx neither in files nor as untouched, but the number cell has to span the section height (for sticky) and the inline number must hide at lg. Optional props, existing callers unchanged. Commit 58b9df7.

**2. [Rule 1] Bundle assertion marker.** The plan asserted no script on `/` or `/about` contains "ScrollTrigger". Next prefetches the case route's chunks from home links, which includes the tiny ScrollScene wrapper (the literal string appears in its dynamic import). The library itself is a separate dynamic chunk. The test now looks for `scrollerProxy`, a method present only in the library; it is absent on `/` and `/about` and present after the case page runs the scene. Intent of D-16 holds.

**3. Audit fix touched page-section's neighbour only inside case-study files** (section-margin-number.tsx), as the plan requires.

## impeccable

The impeccable skill commands (`/impeccable:audit`, `/impeccable:critique`) and Playwright MCP were not available to this agent. Findings below are derived by manual review of the 1440 light, 768 dark (es) and 390 dark captures. The formal slash-command runs are **pending** and should be run by Teo or in 04-11.

- Margin number sat at the content row, visibly lower than the h2 at lg (misaligned with the heading baseline): **fixed** (lg:-mt-13 aligns it with the h2 line).
- No horizontal scroll at 390/768/1440 in light and dark, en and es: pass (asserted by captureMatrix).
- Single accent per view: accent only appears on the scrubbed number, one at a time: pass.
- Contrast of base number (muted-foreground on background) in light and dark looks adequate; formal contrast check: **pending** (axe gate unchanged, header language link issue remains in deferred-items.md).
- At 1440, sections without a Marginalia aside leave the right three columns empty, giving a left-weighted layout: **rejected** (intentional per UI-SPEC grid; revisit in 04-11 if Teo disagrees).
- Cover screenshot of the project is a white-footer image that reads slightly heavy in dark mode at 390: **deferred to 04-11** (content/media decision, not a case-study component bug).
- The sticky margin number's top offset (32px) sits under no fixed header (header is static): pass.
- Metrics block and live-url-null variant: not captured; the dev DB has only one project with all fields and no published project with liveUrl null, so only ManuJ was captured: **pending** (needs data).

No open criticals within the case-study files.

## Decisiones

| Decision | Quién | Por qué |
|----------|-------|---------|
| PageSection extended with optional `marginNumber`/`scene` props instead of duplicating the section layout in case-study | Claude | Keeps one section primitive; sticky needs the number cell to span the section |
| `lg:-mt-13` offset aligns the number with the h2 | Claude | Avoids restructuring the two-row section grid; value derives from h2 line-height 1.75rem + mt-6; revisit if h2 size changes |
| Bundle check keys on `scrollerProxy` rather than "ScrollTrigger" | Claude | Prefetched wrapper chunk contains the word; library chunk is what D-16 cares about |

## Known Stubs

None.

## Self-Check: PASSED

Files exist, commits 58b9df7 and b217fc3 present, motion e2e 5/5, screens e2e passes with 12 PNGs, `pnpm check` green.
