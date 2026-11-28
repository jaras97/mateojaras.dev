---
phase: 05-pulido-y-lanzamiento
verified: 2026-11-27T12:00:00Z
status: passed
score: 7/7 requirements verified (3 owner-accepted deviations listed)
overrides_applied: 3
overrides:
  - must_have: "D-22: production contact form delivers: e2e/contact-live.spec.ts passes against https://mateojaras.dev"
    reason: "DATABASE_URL of Production is Sensitive, so the spec cannot read the DB. Teo chose manual verification (05-DOMAIN-VERIFY.md, 05-PROD-VERIFY.md)."
    accepted_by: "Teo"
    accepted_at: "2026-11-26"
  - must_have: "D-18: content findings are entered by Teo in the production admin"
    reason: "Claude entered C-2..C-4 through the admin UI with Teo's authorization (docs/decisions.md 2026-11-27). No direct DB access; load-content.ts not run."
    accepted_by: "Teo"
    accepted_at: "2026-11-27"
  - must_have: "QUAL-07: Teo confirms the Analytics dashboard shows visits for mateojaras.dev"
    reason: "Teo took the dashboard check as his own task. Script and beacon answer 200 in production."
    accepted_by: "Teo"
    accepted_at: "2026-11-27"
re_verification: false
covered_files:
  - ".github/workflows/ci.yml"
  - ".planning/REQUIREMENTS.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-01-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-01-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-02-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-02-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-03-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-03-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-04-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-04-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-05-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-05-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-06-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-06-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-07-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-07-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-08-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-08-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-09-PLAN.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-09-SUMMARY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-FIXES.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-GATE.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-PROD-VERIFY.md"
  - ".planning/phases/05-pulido-y-lanzamiento/05-REVIEW-DISPOSITION.md"
  - "docs/decisions.md"
  - "docs/reviews.md"
  - "next.config.ts"
  - "src/components/site/site-analytics.tsx"
  - "src/proxy.ts"
covered_digest: "v4:sha256:c4560974a94c82d884ebb09da55bdafaed9e5bef433eda539d274c3b7fdce083"
---

# Phase 5: Pulido y lanzamiento Verification Report

**Phase Goal:** El sitio es accesible, está medido, lo revisaron tres perfiles distintos (agentes, D-07; revisión humana pendiente, D-10) y está en producción en mateojaras.dev.
**Verified:** 2026-11-27
**Status:** passed
**Re-verification:** No, initial verification

## Observable Truths (independent checks run by the verifier)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Site is live on mateojaras.dev, en and es | VERIFIED | curl: `/` 200, `/es` 200, `www` 308, `/sitemap.xml` 200 application/xml, `/cv/en.pdf` and `/cv/es.pdf` 200 application/pdf |
| 2 | SITE-08: 404 in both languages, first request | VERIFIED | curl: `/foo`, `/es/foo`, `/projects/no-existe-x`, `/es/proyectos/no-existe-x` all 404; `src/app/[locale]/not-found.tsx` exists; RSC payload carries `lang:"en"` / `lang:"es"` |
| 3 | QUAL-06: CSP enforced, not Report-Only | VERIFIED | Live `content-security-policy` header present with Blob connect-src; no report-only header (grep empty); check-live headers PASS in 05-GATE.md |
| 4 | QUAL-07: Analytics installed | VERIFIED | `@vercel/analytics` imported only in `src/components/site/site-analytics.tsx`; no `track(` in src; script and beacon 200 (05-GATE.md). Dashboard confirmation deferred to Teo (override) |
| 5 | QUAL-05: e2e in CI | VERIFIED | `.github/workflows/ci.yml` has `e2e` job, `needs: check`, group `e2e-neon-dev`; CI run on main green per orchestrator and 05-GATE.md |
| 6 | QUAL-03: a11y/focus, favicon | VERIFIED (artifacts) | `src/app/icon.svg`, `apple-icon.png`, `favicon.ico` exist; `/icon.svg` 200 image/svg+xml; axe/keyboard walks recorded in 05-03/05-05 summaries and covered by e2e specs |
| 7 | QUAL-08: three agent reviews, all findings resolved | VERIFIED | `docs/reviews.md` has three reviewer sections; 31 consolidated K rows, 0 containing "abierto"; dispositions in 05-GATE.md; `docs/review-guide.md` exists; re-scope logged in decisions.md |
| 8 | QUAL-09: production | VERIFIED | Same as truth 1; merge 2860c16 on main, check-live all PASS, Lighthouse mobile 96-97 on all 8 routes with LCP ≤ 2.22 s and CLS 0 (05-PROD-VERIFY.md, run before the final merge) |

## Requirements Coverage

| Requirement | Status | Evidence |
|---|---|---|
| SITE-08 | SATISFIED | Truth 2 |
| QUAL-03 | SATISFIED | Truth 6 |
| QUAL-05 | SATISFIED | Truth 5 |
| QUAL-06 | SATISFIED | Truth 3 |
| QUAL-07 | SATISFIED (dashboard check owner-deferred) | Truth 4 |
| QUAL-08 | SATISFIED (agents; human review pending D-10) | Truth 7 |
| QUAL-09 | SATISFIED | Truths 1, 8 |

All seven IDs are claimed by PLAN frontmatter and mapped Complete in REQUIREMENTS.md. No orphaned requirements (QUAL-04 maps to Phase 4).

## Owner-accepted deviations (not gaps)

1. contact-live delivery check waived; manual verification by Teo (D-22).
2. D-18 exception: Claude entered C-2..C-4 via the admin UI with Teo's OK.
3. QUAL-07 dashboard confirmation deferred to Teo.

Also waived by Teo: production e2e sweeps (not-found, csp-sweep, headers) because Production DATABASE_URL is Sensitive; covered instead by check-live notfound and headers groups.

## Anti-Patterns / Warnings

| Severity | Finding |
|---|---|
| Warning | Raw SSR HTML of `/foo` and `/es/foo` is the Next error shell (`<html id="__next_error__">` with no `lang` attribute); `lang` and the localized UI arrive via the RSC payload after hydration. This falls short of the 05-02 plan wording ("answers 404 with `<html lang>`") for non-JS clients; the page is noindex, status is 404, and Playwright (post-hydration) sees the right lang. Matches advisory WR-04 in 05-REVIEW.md. Backlog candidate. |
| Warning | 05-REVIEW.md: 1 critical (CR-01, scripts/load-content.ts, never run against main) plus 8 warnings, all deferred to backlog by Teo. Not goal-blocking. |
| Warning | Lighthouse numbers are from the first production deploy (9a4aad4), not re-run after merge 2860c16, which changed content and copy only. |
| Info | Local `origin/main` ref was at 579f198 (docs commit after the merge); no debt markers found in `src`. |

## Human Verification Required

None blocking. Pending by decision: Vercel Analytics dashboard (Teo) and the human review (D-10).

## Gaps Summary

No gaps. The goal is achieved: the site is live and enforced-CSP, 404s behave in both locales, analytics script/beacon respond, CI e2e exists, three agent reviews are fully dispositioned, and every deviation is an owner-accepted override. The only caveat worth backlogging is the missing `lang` attribute in the raw 404 HTML.

---

_Verified: 2026-11-27_
_Verifier: Claude (gsd-verifier)_
