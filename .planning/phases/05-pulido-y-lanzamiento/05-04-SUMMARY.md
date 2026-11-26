---
phase: 05-pulido-y-lanzamiento
plan: 04
subsystem: security
tags: [csp, vercel-analytics, playwright, lighthouse]

requires:
  - phase: 05-pulido-y-lanzamiento
    provides: "05-02 wait-preview and Preview alias, 05-03 404 and favicon"
provides:
  - "Vercel Web Analytics on the public site only (SiteAnalytics gate)"
  - "Enforced Content-Security-Policy with Blob connect-src"
  - "Shared CSP collector fixture and route/scheme/motion sweep"
  - "check-live groups analytics and headers"
affects: [05-05, launch]

tech-stack:
  added: ["@vercel/analytics 2.0.1"]
  patterns: ["e2e/csp.ts fixture fails any spec on a CSP violation", "Preview-only CSP allowances behind one helper"]

key-files:
  created:
    - src/components/site/site-analytics.tsx
    - e2e/csp.ts
    - e2e/csp-sweep.spec.ts
    - .planning/phases/05-pulido-y-lanzamiento/05-PREVIEW-VERIFY.md
  modified:
    - next.config.ts
    - src/app/[locale]/layout.tsx
    - scripts/check-live.ts
    - e2e/headers.spec.ts
    - e2e/admin-guards.spec.ts
    - e2e/admin-images.spec.ts
    - e2e/cv.spec.ts
    - docs/decisions.md
    - docs/backlog.md

key-decisions:
  - "Analytics mounts only through SiteAnalytics in the [locale] layout, production and preview only (D-01, D-03, D-23)"
  - "script-src keeps 'unsafe-inline' (D-17); hashes/SRI go to the backlog"
  - "connect-src allows https://vercel.com/api/blob/ and the public Blob host (D-16)"

requirements-completed: [QUAL-07]

duration: long session
completed: 2026-11-26
---

# Phase 5 Plan 04: Analytics and enforced CSP Summary

Vercel Web Analytics on the public site and an enforced CSP with the Blob hosts, verified with zero violations on the Preview and Lighthouse 96-97, except one manual image upload on the Preview still waiting on Teo.

## Tasks

| Task | Commit |
|---|---|
| 1 Analytics + check-live analytics group | cdb2ae4, 79df21a |
| 2 Enforced CSP + collector | c1d1817 |
| 3 Sweep + admin flows | 26ec393, dcd6556 |
| 4 Preview verification | 146d2bd, c3f47c8 |
| 5 Decisions, backlog, security logs | f4fe922 |

## Verification

- `pnpm check` green.
- Preview (HEAD 146d2bd READY): check-live `headers,notfound,analytics` all PASS; script and view beacon answer 200 on the unique same-origin path (Pitfall 5 did not occur, no fallback props).
- Preview e2e: 19 passed, 3 skipped, 1 failed (upload, harness CORS issue, see below). Zero CSP violations in the sweep, headers, CV generation and not-found.
- Lighthouse mobile, 8 routes: 96-97, LCP 2.13-2.20 s, CLS 0.

## Deviations from Plan

**1. [Rule 1 - Bug] Zod JIT probe violated the enforced CSP.** The project editor reported `script-src eval` from `new Function("")`. Fix: import the existing `@/lib/zod-jitless` in the 11 other client forms. Commit dcd6556.

**2. [Rule 3 - Blocking] Analytics check saw no beacon.** The Vercel script skips `navigator.webdriver` and Headless clients. check-live now launches Chromium without the automation flag. Commit 79df21a.

## Issues

- The Preview upload e2e fails because `playwright.config.ts` sends the Vercel bypass headers cross-origin and vercel.com rejects them in CORS preflight. The CSP does not block the call (no violation event; the local run with a Blob token passes the upload under the enforced policy). Three harness workarounds failed and were reverted.
- The Vercel Toolbar console check was not run (the bypass hides the toolbar).
- Both items need one manual image upload on the Preview from a normal logged-in browser. QUAL-06 stays open until Teo confirms it.

## Self-Check: PASSED

Files and commits listed above exist; main was not pushed (origin/main unchanged at 16168e0).
