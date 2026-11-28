---
phase: 04-sitio-p-blico
plan: 08
subsystem: site-home
tags: [home, hero, status-line, overlap, splittext, gsap, e2e, screenshots]
requires: [04-03, 04-04, 04-12]
provides:
  - EntryList / Entry (dated project entries), HomeContact
  - overlapHours (DST-aware, self-contained), StatusClockScript, LocalTime
  - SplitHeading (the only GSAP on the home)
  - e2e/home-motion.spec.ts, e2e/screens-home.spec.ts
affects: [04-11]
key-files:
  created:
    - src/components/site/entry-list.tsx
    - src/components/site/home-contact.tsx
    - src/components/site/local-time.tsx
    - src/components/site/status-clock-script.tsx
    - src/lib/overlap.ts
    - src/components/motion/split-heading.tsx
    - e2e/home-motion.spec.ts
    - e2e/screens-home.spec.ts
  modified:
    - src/app/[locale]/page.tsx
    - src/components/site/hero/hero-a.tsx
    - src/components/site/status-line.tsx
    - src/components/site/hero-copy.ts
    - src/lib/messages.ts
    - messages/en.json
    - messages/es.json
    - e2e/public.spec.ts
requirements-completed: [SITE-01, SITE-02, SITE-03, CONT-05, MOTN-01, MOTN-02, QUAL-04]
completed: 2026-11-22
---

# Phase 4 Plan 08: Home Summary

Home with hero A, DST-aware live status line (inline script + minute client leaf, no clock in the prerender), dated project entries, contact close and a GSAP SplitText word-split H1 that never stays hidden past 1 s.

## Tasks

| Task | Commits | Notes |
|------|---------|-------|
| 1 Home, entries, contact | 622ba5b (RED), a4a4302 | `Site.home.projectsHeading` deleted from both message files; public.spec rewritten |
| 2 Live time and overlap | 64d3fca (RED), 9982092 | Vectors pass under TZ=UTC and TZ=America/Bogota; raw-HTML e2e confirms no clock time |
| 3 SplitHeading, e2e, screenshots | 5da0af4 | 12 PNGs in test-results/screens/home/ |

`pnpm tsc`, `pnpm lint`, `pnpm test` (395 tests) and the e2e specs public, home-motion and screens-home pass (build runs inside Playwright's webServer).

## Deviations from Plan

**1. [Rule 1 - Bug] Overlap segment overflowed at 390px**
- Found during: Task 3 screenshots (horizontal scroll 12px).
- Issue: once the script writes "overlaps 9 h with Toronto and 3 h with Madrid" the nowrap segment exceeded the viewport.
- Fix: the overlap segment uses `whitespace-normal` so it wraps inside its segment. Files: status-line.tsx. Commit 5da0af4.

**2. [Rule 3 - Blocking] Reveal placement**
- The plan lists "StatusLine+CTA (0)". Reveal wraps StatusLine, the clock script and CTA inside HeroA (the H1 stays outside), not the whole HeroA from page.tsx. Both grid column classes moved to that wrapper and to SplitHeading's `className`.

**3. Test note.** The status-line test that asserted "no `<time>` unless showEntryDate" now checks `dateTime=` because the offset is itself a `<time data-status-time>`.

**4. e2e no-replay check** uses `window.next.router.push` (client navigation): the header About link causes a full load, where `played` resets by design (once per page load).

## Decisiones

| Decision | Quién | Por qué |
|----------|-------|---------|
| Overlap computed for the Bogotá calendar date of the instant, whole hours, weekends not special-cased | Claude (assumption flagged in the plan) | Matches P1 vectors; no clock in the shell |
| Overlap phrase may wrap inside its segment | Claude | Prevents 390px overflow; separators still never start a line |
| Home list shows all published+visible projects (not only featured), project without dates has no date column | Claude (D-14) | Plan assumption |
| Header language link stays excluded from axe in public.spec | Open (deferred-items, awaiting Teo's copy decision) | label-content-name-mismatch needs a copy change |

## LCP

LCP local: 344-384 ms (4x CPU throttle via CDP, no network throttle, local production build). The H1 stays hidden until fonts.ready plus the GSAP import, capped at 1000 ms by the CSS failsafe; at these numbers Plan B (P4, server split + CSS) does not look needed locally. 04-11 must confirm on the Preview with real network.

## impeccable

Formal `/impeccable:audit` and `/impeccable:critique` were not available in this run: PENDING (to run before 04-11). Manual review of the 12 captures (390/768/1440, light/dark, en/es):
- Hero, status line, 01 Work, 02 Contact render without horizontal scroll at all widths (captureMatrix assertion). Fixed: overlap overflow at 390 (above).
- Entries read as dated list, no cards or shadows; empty tagline and stack lines leave no gap (EcoExport has only a title).
- Dark theme contrast and accent use look consistent with DESIGN.md.
- Observation (no change): the status line at 390 breaks after "17:09 UTC-5 ·", leaving a line ending with a separator, which the plan allows.

## Known Stubs

None.

## Threat surface

T-04-21 mitigated (JSON.stringify plus `<` escaped to `<` in the script literals). T-04-22 mitigated (public getProjects core; e2e asserts each entry targets a published slug).

## Self-Check: PASSED
