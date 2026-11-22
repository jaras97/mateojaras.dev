
## From 04-04
- Header language link (`a[hreflang]`, src/components/site/lang-switch.tsx, 04-03): axe `label-content-name-mismatch` (serious). The aria-label ("Ver esta página en español") does not contain the visible text ("ES"). Fix needs a copy change in `Site.header.toOtherLocale`; e2e/case-study.spec.ts excludes the link until then.

## From 04-09
- Header nav does a full page load on every link (observed in 04-08). Diagnosis: `src/components/site/nav-links.tsx` renders plain `<a href>` in `StaticNav` (used by both the Suspense fallback and the active-state `NavLinks`), with hrefs built by `getPathname`. It is not a root-layout split. Fix: render `Link` from `@/i18n/navigation` (next-intl) in `StaticNav` with `href` as the pathname object/`locale` prop, keeping `aria-current`. File is outside 04-09's scope (04-03); fix in a header polish pass or 04-11. The `#work` hash link may need a plain anchor or `Link` with a hash.
- /about renders no Stack section because the dev DB has no published visible skills; the component and e2e handle both cases.

## From 04-02
- Language link label fix (see "From 04-04") is approved by Teo ("ES, ver esta página en español" / "EN, view this page in English", no em-dash; docs/decisions.md 2026-11-22). Assigned to 04-11 together with the nav-links `<a>` to next-intl `Link` fix (see "From 04-09"). 04-11 also removes the axe exclusion in e2e/case-study.spec.ts.

## From 04-10
- Soft 404 on unknown `/projects/[slug]` (and `/es/proyectos/[slug]`): the not-found UI renders but the status is HTTP 200. Tried resolving the slug above the Suspense boundary (await params + cached published-slug list + `notFound()` at the top of the page): with `cacheComponents` + `partialPrefetching` the unlisted slug is still served from the route shell and answers 200, and reading `params` outside Suspense is what 04-04 found to break shell regeneration. Getting a real 404 needs an architectural change (e.g. dropping partialPrefetching/App Shell for this route, or `cacheComponents: false` per the Plan B). Mitigation in place: Next injects `<meta name="robots" content="noindex">` in the not-found render (documented in not-found.md, asserted in e2e/seo.spec.ts), and the sitemap lists only published+visible slugs.
- OG `alt` is not localized: `generateImageMetadata` receives empty `params` for `[locale]` routes while Next collects page data (build fails on `notFound()`), so the OG routes export only `size` and `contentType` and emit no `og:image:alt`. Revisit if alt text is wanted.
