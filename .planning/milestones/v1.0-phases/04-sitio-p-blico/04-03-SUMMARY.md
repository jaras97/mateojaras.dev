---
phase: 04-sitio-p-blico
plan: 03
subsystem: public-site
tags: [header, footer, theme, view-transitions, i18n, e2e]
requires: ["04-01", "04-12"]
provides:
  - "SiteHeader, NavLinks, LangSwitch, alternateHref"
  - "ThemeScript, InlineScript, ThemeToggle (html.dark, html.motion-ok, localStorage.theme)"
  - "SiteFooter, FooterLine, SOURCE_URL"
  - "captureMatrix screenshot helper (e2e/screens.ts)"
affects: [04-05, 04-07, 04-08, 04-09]
key-files:
  created:
    - src/components/site/site-header.tsx
    - src/components/site/nav-links.tsx
    - src/components/site/lang-switch.tsx
    - src/components/site/alternate-href.ts
    - src/components/site/theme-toggle.tsx
    - src/components/site/theme-script.tsx
    - src/components/site/inline-script.tsx
    - src/components/site/site-footer.tsx
    - src/components/site/footer-line.tsx
    - e2e/lang-theme.spec.ts
    - e2e/screens.ts
  modified:
    - src/app/[locale]/layout.tsx
requirements-completed: [SITE-05, SITE-06, SITE-07, MOTN-04]
completed: 2026-11-22
---

# Phase 4 Plan 03: Site chrome Summary

Header (name/initials, three nav links, plain-anchor EN/ES link that keeps the page and hash, theme toggle), footer segment line, and a head script that sets `dark`/`motion-ok` before paint; toggle crossfades through View Transitions only when motion is allowed.

## Accomplishments
- `alternateHref` maps layout segments + slug to a fixed internal next-intl href; `LangSwitch` builds the other-locale URL with `getPathname`, never `<Link locale>`.
- NavLinks/LangSwitch sit in `<Suspense>` with static fallbacks; `pnpm build` shows no client-hook/Suspense error (CASE-07 holds).
- Active nav (About/Contact) gets `aria-current="page"` and the accent underline; none active on `/` and case studies.
- Footer: name, location, GitHub and LinkedIn only when set, `/cv/<locale>.pdf`, source link.
- Verification: vitest 323/323, tsc clean, build clean, `e2e/lang-theme.spec.ts` 10/10 (including the slug pair, hash, html.dark within 500 ms, no hydration console message, 390 px header fit).

## Deviations from Plan

**1. [Rule 3] FooterLine lives in `footer-line.tsx`, not `site-footer.tsx`.** Importing `site-footer` in a unit test pulls in the DB client (requires DATABASE_URL). The test imports `footer-line`. Same symbols, one extra file.

**2. [Rule 1] lang-switch test mocks `next/navigation` with `importOriginal`** so next-intl's `createNavigation` still finds `redirect`.

**3. Commit granularity.** Layout wires header, toggle and footer together, so tasks 1 and 2 source went into one `feat` commit (e4a1bd4); e2e and screenshot helper in a second `test` commit (97f46b9).

**4. e2e theme test seeds dark once** (a `seeded` flag in the init script) so a reload is not re-forced to dark.

## Decisiones
- Quién: Claude. Fallback nav/lang in Suspense render the same links with no active state and the other locale's home.
- Quién: Claude. `ThemeToggle` keeps no theme in React state; the class on `<html>` is the source of truth.
- T-04-06 (accept): phase 5 must hash `ThemeScript` and the home clock script when CSP goes strict.

## Pending
- Playwright MCP screenshots at 768/1440 (light/dark), `/impeccable:audit` and `/impeccable:critique` were not run (tools unavailable); only the scripted capture (header, 390 px es, light and dark) ran. Pending for end-of-phase review.
- Human check: Teo toggles theme on a real device (crossfade, no flash in dark).
- Pre-existing biome warning (`!important` in globals.css:160) is out of scope.
- One unit-test run flaked once (1 failed of 323) and passed on rerun; not identified.

## Known Stubs
None.

## Self-Check: PASSED
