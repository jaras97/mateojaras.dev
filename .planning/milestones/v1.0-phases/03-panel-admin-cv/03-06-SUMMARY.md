---
phase: 03-panel-admin-cv
plan: 06
subsystem: draft-mode-preview
tags: [draft-mode, route-handler, banner, e2e, open-redirect]
requires: [03-04, 03-05]
provides: [/api/draft, draftPreviewHref, safeReturnPath, DraftBanner, DraftExitForm, draft-aware getSiteSettings]
affects: [03-08]
key-files:
  created: [src/app/api/draft/route.ts, src/lib/draft-preview.ts, src/lib/draft-preview.test.ts, src/components/site/draft-banner.tsx, src/components/site/draft-exit-form.tsx, src/features/site-settings/queries.test.ts, e2e/draft-mode.spec.ts, e2e/draft-banner-screens.spec.ts]
  modified: [src/app/[locale]/layout.tsx, src/features/site-settings/queries.ts, src/app/admin/(panel)/proyectos/[id]/page.tsx, src/app/admin/(panel)/proyectos/page.tsx, src/features/projects/components/projects-table.tsx, src/components/admin/admin-page-header.tsx]
decisions:
  - "Exit path is sanitized to a same-origin path matching a known public route (/, /es, /projects/<slug>, /es/proyectos/<slug>)"
  - "Previsualizar in the form header is disabled while the form is dirty (header-level, not page-level)"
metrics:
  completed: 2026-11-16
requirements-completed: [ADMN-11]
---

# Phase 3 Plan 06: Draft Mode preview Summary

Previsualizar opens the real public route with Draft Mode: session-gated GET /api/draft, POST exit, a 40px inverted band in the locale layout, draft-aware site settings, and preview entries in the project form and list menu.

## Commits

- `ee42461` test: failing tests for draft-preview helpers (RED)
- `87a0336` feat(site): draft mode preview with public band (GREEN + tracer e2e)
- `e8c6bfa` test: failing tests for draft-aware settings (RED)
- `7549f43` feat(site): draft-aware site settings (GREEN)
- `31d3c71` fix(site): harden draft exit return path against open redirect
- `da2d79c` test(site): draft banner screenshots
- `8f776ed` fix(site): keep exit link on one line at 390px

## RED evidence

- draft-preview: stub returning "" / String(value); 7 target tests failed on assertions of the planned behavior (empty href, un-sanitized path). Semantic assessment: valid RED (the first attempt without a stub was a module-load failure, discarded as invalid).
- site-settings: 3 of 4 tests failed on `not.toHaveProperty("draft")` and `headlineEs` "x" expectation against the unchanged core; the null-row test already passed (existing behavior). Valid RED.

## Deviations

1. **[Security, coordinator request] Open redirect hardening.** The review flagged prefix-only checks in `safeReturnPath`. It now rejects control chars, whitespace, backslash (also after percent-decoding), resolves with `new URL(v, "http://x")`, requires same origin, and requires a known public route; otherwise "/". Tests added for `//evil.com`, `/\evil.com`, `/%5Cevil.com`, tab, `https://`, `javascript:`, `/%2F%2Fevil.com`, unknown route, plus valid routes. Commit `31d3c71`.
2. **[Rule 1 - Bug] Banner wrapped at 390 px.** The exit link broke onto two lines and overflowed the 40px band. Fixed with nowrap + shrink-0 and a truncating message with `title`. Commit `8f776ed`.
3. Lint: `role="region"` on a div replaced by `<section aria-label>`; the menu anchor carries its label as child content (a11y lint).
4. Fixture: e2e creates its own published, visible project and deletes it by SQL (not the plan's "Descartar cambios" cleanup, per the no-seeded-content rule).
5. The 401 e2e also asserts no `__prerender_bypass` cookie; POST e2e accepts absolute or relative Location equal to "/".

## Observations

- Build: no "Uncached data", `empty-generate-static-params` or bail-out messages; `/`, `/[locale]/projects/[slug]` still prerender (static shell with PPR).
- During `next build` inside e2e, the log prints "Unexpected cache miss after cache warming phase during prerendering" for `/[locale]` and `/[locale]/projects/[slug]` (generateMetadata/getSiteSettings paths), plus admin prerender fetch rejections from Better Auth. I did not establish a baseline for these before this plan, so I cannot say whether the first is new; flagged for follow-up, no failing build or test.
- 03-04 stale-HTML-after-updateTag finding: the e2e preview and visitor assertions did not hit it (visitor context loaded the published page after draft save, and showed the published title), so no new observation.
- Draft Mode inside `'use cache'` re-executes uncached as documented; visitors without the cookie get the published title.

## impeccable

The `/impeccable:audit` and `/impeccable:critique` slash commands could not be invoked from this agent session. I reviewed the 24 screenshots (`test-results/draft-banner/{en-home,es-home,en-project,es-project}-{390,768,1440}-{light,dark}.png`, gitignored) against the skill criteria manually. Teo or the verifier should run the two commands before 03-08.

| Finding | Severity | Disposition |
|---|---|---|
| Exit link wrapped to two lines and overflowed the band at 390 px | High | Fixed (`8f776ed`) |
| Message truncates to "Vista previa · contenido…" at 390 px | Low | Accepted, full text in `title` and in the region label |
| Dark captures are identical to light | Info | prefers-color-scheme only; the theme script arrives in phase 4, so the palette does not switch yet |
| Band uses ink bg / bg text, no accent, no gradient, no icon, mono 12px | Pass | none |
| Band is sticky 40px; content starts below it, title not covered | Pass | none |
| Focus ring on the exit button is inverted (`outline-background`) | Pass | none |

## Pending manual items

- Teo/verifier: visual check of `test-results/draft-banner` and run the two impeccable commands.
- `BLOB_READ_WRITE_TOKEN` still pending (not needed here).

## Known Stubs

None. Experience/skills/education forms intentionally pass no `previewHref`.

## Self-Check: PASSED

Commits ee42461, 87a0336, e8c6bfa, 7549f43, 31d3c71, da2d79c, 8f776ed exist; lint, tsc, vitest and e2e (draft-mode, draft-banner-screens) green; build clean of the plan's forbidden messages.
