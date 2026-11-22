---
phase: 04-sitio-p-blico
plan: 10
subsystem: seo
tags: [metadata, hreflang, opengraph, sitemap, robots, next-og]
requires: [04-05, 04-07, 04-08, 04-09]
provides:
  - buildPageMetadata / truncateAtWord (complete metadata per page)
  - renderOgImage typographic OG renderer and four OG routes
  - /sitemap.xml with hreflang alternates, /robots.txt
affects: [04-11]
tech-stack:
  added: []
  patterns: [params-based OG routes, complete metadata objects (no shallow-merge loss)]
key-files:
  created:
    - src/lib/seo.ts
    - src/lib/seo.test.ts
    - src/lib/og.tsx
    - src/lib/og.test.ts
    - src/lib/og-page.tsx
    - src/app/sitemap.ts
    - src/app/robots.ts
    - "src/app/[locale]/opengraph-image.tsx"
    - "src/app/[locale]/about/opengraph-image.tsx"
    - "src/app/[locale]/contact/opengraph-image.tsx"
    - "src/app/[locale]/projects/[slug]/opengraph-image.tsx"
    - e2e/seo.spec.ts
  modified:
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/app/[locale]/about/page.tsx
    - src/app/[locale]/contact/page.tsx
    - src/app/[locale]/projects/[slug]/page.tsx
    - src/proxy.ts
    - next.config.ts
    - src/features/projects/queries.ts
    - src/features/projects/queries.test.ts
    - docs/decisions.md
    - .planning/phases/04-sitio-p-blico/deferred-items.md
requirements-completed: [SEO-01, SEO-02, SEO-03]
duration: ~35 min
completed: 2026-11-22
---

# Phase 4 Plan 10: SEO Summary

Complete per-page metadata with en/es/x-default hreflang, typographic OG images (Funnel Display + Geist Mono TTFs), sitemap.xml and robots.txt, verified by e2e on 8 pages.

## Commits
- RED: d3a13ca test(seo) failing tests for helper/renderer; failing test for sitemap query
- ff6e80e feat(seo): case study metadata, hreflang and og image
- 38c3215 feat(seo): page metadata, og images, sitemap and robots
- fix(seo): sitemap query test column qualification
- ed8b725 test(seo): unknown slug noindex e2e, soft 404 documented

## Deviations from Plan

1. **[Rule 3 - Blocking] No localized OG alt.** `generateImageMetadata` receives empty `params` for `[locale]` routes during page-data collection, so `notFound()` there failed the build. Routes export only `size`/`contentType`; no `og:image:alt`.
2. **[Rule 3] Added `src/lib/og-page.tsx`** shared by the home/about/contact OG routes (avoids triplicated code).
3. **Colors in hex** in `og.tsx` (the renderer does not parse oklch); values approximate the light tokens.
4. **Sitemap:** one entry per page (English URL) with es/x-default alternates, as the plan specified.
5. **Orchestrator-requested docs edit:** `docs/decisions.md` was edited (soft-404 and OG alt decisions) at the dispatcher's instruction, although the plan said 04-11 would copy them.

## Soft 404 on unknown /projects/[slug] (investigated)
Tried `await params` + cached published-slug list + `notFound()` above Suspense. With `cacheComponents` + `partialPrefetching` the unknown slug still answered HTTP 200 (served from the route shell), and it contradicts the 04-04 finding about params outside Suspense. Reverted. Mitigation: Next injects `<meta name="robots" content="noindex">` in the not-found render (asserted in e2e), the sitemap lists only published+visible slugs. Documented in deferred-items.md and docs/decisions.md. A real 404 needs an architectural change.

## Decisiones
- Soft 404 accepted with noindex (Quién: Claude Code). OG sin alt localizado (Quién: Claude Code). Detail in docs/decisions.md.

## Known Stubs
None.

## Verification
`pnpm check` green (typecheck, lint, test, build). `pnpm test:e2e e2e/seo.spec.ts e2e/public.spec.ts e2e/case-study.spec.ts` 35 passed.

## Self-Check: PASSED
