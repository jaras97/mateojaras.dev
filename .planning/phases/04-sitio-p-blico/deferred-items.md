
## From 04-04
- Header language link (`a[hreflang]`, src/components/site/lang-switch.tsx, 04-03): axe `label-content-name-mismatch` (serious). The aria-label ("Ver esta página en español") does not contain the visible text ("ES"). Fix needs a copy change in `Site.header.toOtherLocale`; e2e/case-study.spec.ts excludes the link until then.

## From 04-09
- Header nav does a full page load on every link (observed in 04-08). Diagnosis: `src/components/site/nav-links.tsx` renders plain `<a href>` in `StaticNav` (used by both the Suspense fallback and the active-state `NavLinks`), with hrefs built by `getPathname`. It is not a root-layout split. Fix: render `Link` from `@/i18n/navigation` (next-intl) in `StaticNav` with `href` as the pathname object/`locale` prop, keeping `aria-current`. File is outside 04-09's scope (04-03); fix in a header polish pass or 04-11. The `#work` hash link may need a plain anchor or `Link` with a hash.
- /about renders no Stack section because the dev DB has no published visible skills; the component and e2e handle both cases.
