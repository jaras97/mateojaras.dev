---
phase: 02-base-t-cnica
plan: 05
subsystem: routing
tags: [next-intl, proxy, root-params, i18n, cache-components]
requires: [02-03, 02-04]
provides:
  - next-intl routing (en at /, es at /es, localized /es/proyectos/[slug])
  - single src/proxy.ts (i18n + optimistic admin cookie gate)
  - getSiteSettings cached query, case-study skeleton page, not-found page
affects: [02-06, 02-07, 02-08, 04]
tech-stack:
  added: []
  patterns: [NextIntlClientProvider with messages=null so client Links get the locale, request.ts over next/root-params with admin fallback to es]
key-files:
  created: [src/i18n/routing.ts, src/i18n/routing.test.ts, src/i18n/request.ts, src/i18n/navigation.ts, src/i18n/app-config.d.ts, src/proxy.ts, src/features/site-settings/queries.ts, "src/app/[locale]/projects/[slug]/page.tsx", "src/app/[locale]/not-found.tsx"]
  modified: [next.config.ts, "src/app/[locale]/layout.tsx", "src/app/[locale]/page.tsx", messages/en.json, messages/es.json, e2e/public.spec.ts, playwright.config.ts]
key-decisions:
  - "Unknown or draft slugs render the not-found UI with status 200 + noindex (Cache Components streams the shell first); e2e asserts the UI and noindex, not the status"
requirements-completed: [BASE-03, BASE-04, BASE-08]
duration: ~30min
completed: 2026-11-15
---

# Phase 2 Plan 05: next-intl routing and proxy Summary

`/` serves English and `/es` Spanish through one `proxy.ts` (next-intl, as-needed prefix, no detection, no cookie), with prerendered case-study skeletons at `/projects/[slug]` and `/es/proyectos/[slug]`.

## Commits

| Task | Commit |
|------|--------|
| 1 Tracer: / and /es via proxy | 65a2447 |
| 2 Case-study routes, notFound | b29bcc6 |

## Results

- Build route table: `/[locale]` prerendered for `/en` and `/es`; `/[locale]/projects/[slug]` prerendered for `/en/projects/centro-estetico-manuj` plus 4 more paths (es and en, two published slugs). No draft slug in the log; no "Uncached data" or empty-generate-static-params.
- `pnpm check` green (79 tests, build). `pnpm test:e2e`: 13 passed (axe clean on `/`, `/es` and one case study per locale).
- playwright webServer.url is back to `/`.

## Deviations from Plan

1. [Rule 3] `NextIntlClientProvider` (locale only, `messages={null}`) added to `[locale]/layout.tsx`; the next-intl `Link` is a client component and failed prerender ("No intl context") without it. Not in the plan's file list for this file's content but within the file listed.
2. Links do not pass `locale` explicitly: doing so forced `/en/...` prefixes; the provider locale gives `/projects/<slug>` and `/es/proyectos/<slug>`.
3. **404 status**: the plan truth says draft and unknown slugs "return 404". With Cache Components the shell is sent before the request-time `notFound()`, so the status is 200 with `<meta name="robots" content="noindex">` and the not-found UI (documented in Next loading.md "Status codes"). The e2e asserts the UI, noindex and absence of draft titles. A proxy-level slug check would give a true 404 but needs a DB lookup in proxy; left for the 02-08 go/no-go to weigh (Plan B `cacheComponents: false` would restore 404).

## Known Stubs

None. Case-study page is an intentional skeleton (title and back link) until phase 3.

## Threat Flags

None.

## Self-Check: PASSED
