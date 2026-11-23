---
phase: 04-sitio-p-blico
plan: 11
subsystem: quality-gate
tags: [lighthouse, vercel-preview, reduced-motion, keyboard, accent, impeccable, a11y]
requires:
  - phase: 04-sitio-p-blico
    provides: public views (04-03..04-10), seo (04-10)
provides:
  - 8-row Lighthouse mobile table on a Vercel Preview (all >= 96)
  - P4 Plan B applied to the hero headline (CSS-only split)
  - reduced-motion, keyboard, accent and soft-navigation e2e specs
  - global 2px accent focus ring, language link label and client-side header nav fixes
affects: [phase 5 CSP and analytics]
key-files:
  created:
    - .planning/phases/04-sitio-p-blico/04-LIGHTHOUSE.md
    - scripts/lighthouse-preview.mjs
    - scripts/project-status.mjs
    - e2e/reduced-motion.spec.ts
    - e2e/keyboard.spec.ts
    - e2e/accent.spec.ts
    - e2e/nav-client.spec.ts
    - e2e/route-transition.spec.ts
  modified:
    - src/components/site/hero/hero-a.tsx
    - src/components/site/nav-links.tsx
    - src/components/site/site-header.tsx
    - src/components/ui/textarea.tsx
    - src/app/globals.css
    - messages/en.json
    - messages/es.json
    - docs/decisions.md
  deleted:
    - src/components/motion/split-heading.tsx
key-decisions:
  - "P4 applied: server-split words, CSS keyframes (home LCP 4.66 s -> 2.21 s)"
  - "No route-level ViewTransition (it broke the case ScrollScene accent)"
  - "Cover stays outside Reveal; Reveal replay after Activity accepted"
  - "Global :focus-visible ring 2px/2px accent"
metrics:
  tasks: 3
  completed: 2026-11-23
---

# Phase 4 Plan 11: Phase gate Summary

Lighthouse mobile on the Vercel Preview passes on all 8 URLs (performance 96 to 97, LCP 2.18 to 2.28 s, CLS 0, TBT 18 to 30 ms) after the pre-approved P4 Plan B replaced GSAP SplitText on the hero H1; reduced-motion, keyboard and accent e2e passes are in place, and the full e2e suite and `pnpm check` are green.

## What was done

- **Approved fixes**: language link `aria-label` now starts with the visible text ("ES, ver esta página en español" / "EN, view this page in English"); the axe exclusions for header/footer were removed from the about, case-study, public and contact specs and axe still reports no serious/critical. `StaticNav` uses next-intl `Link` (hash href for Work) and keeps `aria-current`; `e2e/nav-client.spec.ts` proves no full page load.
- **DB pre-check**: `e2e-stale-probe` no longer exists in the dev DB (checked with `scripts/project-status.mjs`), so nothing to draft. ManuJ has tagline, problem and cover; EcoExport is published but empty. Measured on that content.
- **Lighthouse (method a)**: `scripts/lighthouse-preview.mjs` loads the bypass secret via `process.loadEnvFile`, writes it to a 0600 temp file removed afterwards, runs `pnpm dlx lighthouse`, prints only scores. No secret and no token URL in the repo. First Preview (`a51dbb3`): `/` and `/es` failed (LCP 4.66 s, perf 81). After P4 (Preview of `b952ade`): all 8 pass. Details in `04-LIGHTHOUSE.md`.
- **P4**: `hero-a.tsx` renders `span.split-word` per word, `globals.css` animates under `prefers-reduced-motion: no-preference` (500 ms plus at most 200 ms stagger); `SplitHeading` deleted. The h1 has no `aria-label` (plan suggested one): inline words separated by spaces already read as one phrase.
- **Route ViewTransition**: tried, removed. With motion allowed the case ScrollScene stopped lighting the current number (2 of 5 case-motion e2e failed) and the previous page lingered in the DOM. Logged as "sin transición de ruta". Theme-toggle transition is unaffected.
- **Focus ring**: the keyboard e2e found the public site used the browser default ring and the textarea a 3 px 50% ring. Added a base `:focus-visible` rule (2px solid `--ring`, offset 2px); textarea aligned with input.
- **Decisions**: consolidated 04-03..04-10 decisions plus the 04-11 ones into `docs/decisions.md`.
- **Stale specs**: `admin-settings` and `admin-reorder` still assumed the pre-04-08 home (H1 = name; links in main = titles). Updated to the current markup.

## Verification

- `pnpm check`: pass (typecheck, biome with 3 pre-existing warnings, 421 unit tests, build).
- `pnpm test:e2e` full: 144 passed, 5 skipped (Blob token, live contact keys), 2 failed on a first clean run (the two stale admin specs above); both pass after the fix (7/7 in those files). An earlier run was invalidated by two overlapping runs of mine on port 3100 and was discarded.
- Reduced motion (8 routes en/es): no running animation, H1 opacity 1 at domcontentloaded, margin numbers not sticky and accents at 0, no GSAP/SplitText/ScrollTrigger request, theme toggle makes zero `startViewTransition` calls.
- Keyboard (light and dark, 4 views): skip link first and moves focus to `#main`; every focus stop shows the 2px accent ring; honeypot never focused; each home entry is one tab stop.
- Accent: one accent element at rest on `/`, `/about`, `/contact` (en and es), one current number on the case at 1440 with motion, zero at 390; no accent text below 24 px.

## impeccable

Formal vs manual: the `/impeccable:audit` and `/impeccable:critique` slash commands and Playwright MCP were not used. Formal: the bundled detector (`.claude/skills/impeccable/scripts/impeccable detect --json src/components/site "src/app/[locale]"`) returned `[]`. Manual: the skill's audit checklist (a11y, performance, theming, responsive, implementation integrity) applied to the scripted Playwright captures (390/768/1440, light and dark, en and es; no horizontal scroll asserted per capture), axe (no serious/critical, no exclusions), and the keyboard, accent and reduced-motion specs. No scored health report was produced and the critique's heuristic scoring was not run; Teo may want to run both commands once.

| # | Finding | Severity | Disposition |
|---|---------|----------|-------------|
| 1 | Language link label mismatch (axe serious) | P1 | Fixed (copy approved) |
| 2 | Public focus ring was the browser default; textarea 3 px 50% | P1 | Fixed (global ring, textarea) |
| 3 | Header nav did full page loads | P2 | Fixed (next-intl Link) |
| 4 | Home LCP 4.66 s from SplitText hiding the H1 | P1 | Fixed (P4) |
| 5 | Case meta row shows "Aug 2026 - Aug 2026" when start and end month are equal | P3 | Open: collapse equal dates; touches content/format, left for Teo |
| 6 | FCP = LCP about 2.2 s on every route (Preview TTFB about 0.8 s); 0.3 s of margin to 2.5 s | P2 | Open: re-measure on production domain in phase 5 |
| 7 | Reveal replays after an Activity re-show | P3 | Accepted (logged) |
| 8 | Status line at 390 px can end a line with a separator | P3 | Accepted: spec forbids a line starting with it |
| 9 | Soft 404 on unknown slug; no localized og:image:alt | P2 | Accepted known limitations (noindex mitigation) |

críticos abiertos: 0

## Revisión de Teo

1. P6 [propuesta] copy: review every proposed string in `messages/en.json` and `messages/es.json` and the "Send" vs "Send message" choice (listed as pending since 04-01; this run changed only `toOtherLocale`).
2. The 8-row Lighthouse table in `04-LIGHTHOUSE.md` (all >= 96, LCP <= 2.28 s, CLS 0).
3. Read ManuJ in en and es; fill EcoExport or keep it hidden. The populated-case backstop is `human_needed`.
4. Theme crossfade on a real device.
5. Live contact email: pending Resend and Upstash keys (04-02 A and B answered "luego").
6. Run `/impeccable:audit` and `/impeccable:critique` formally if you want a scored report (finding 5 above).
7. Hero entrance: the headline now animates with CSS (deviation from the letter of MOTN-02, approved as P4).

## Deviations from Plan

- **[Rule 2] Focus ring**: added global `:focus-visible` and textarea ring so the keyboard criterion could hold.
- **[Rule 1] Stale admin specs** fixed (see above).
- **Route ViewTransition** not shipped (plan allowed it).
- Plan listed `src/app/[locale]/projects/[slug]/page.tsx` and `layout.tsx` as files to modify; neither needed a change.
- Lighthouse used the median of 3 runs per URL rather than a single run.

## Hand-off to phase 5

- Strict CSP needs hashes or `'unsafe-inline'` for `ThemeScript` and `StatusClockScript` (T-04-29, accepted).
- Real 404 for unknown slugs and localized OG alt remain open (see deferred-items.md).
- Preview URL measured: `https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app` (protected; no token stored).

## Known Stubs

None.

## Self-Check: PASSED

Files exist (04-LIGHTHOUSE.md, specs, scripts); commits eea14da, a51dbb3, 605f27e, b952ade and the docs commit are in `git log`.
