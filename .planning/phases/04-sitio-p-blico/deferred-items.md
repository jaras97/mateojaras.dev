
## From 04-04
- Header language link (`a[hreflang]`, src/components/site/lang-switch.tsx, 04-03): axe `label-content-name-mismatch` (serious). The aria-label ("Ver esta página en español") does not contain the visible text ("ES"). Fix needs a copy change in `Site.header.toOtherLocale`; e2e/case-study.spec.ts excludes the link until then.
