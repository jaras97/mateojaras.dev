---
phase: 02-base-t-cnica
verified: 2026-11-16T00:00:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
re_verification: false
human_verification_completed:
  - test: "Sign in, reload, sign out at /admin on Preview and Production; titles from Neon on /, /es and project routes"
    result: "Teo replied approved (orchestrator-reported)"
warnings:
  - "02-REVIEW CR-01 and CR-02 (seed --force overwrite, no production guard on restore) and WR-01, WR-06 are open and must be resolved before phase 3 writes admin content"
  - "REQUIREMENTS.md still shows BASE-01, BASE-10, BASE-11, AUTH-04 as Pending/unchecked; ROADMAP Phase 2 unchecked. Orchestrator should update these"
---

# Phase 2: Base técnica Verification Report

**Goal:** Walking skeleton deployed: admin login on a Vercel Preview, public routes in both languages show real Neon content, prerendered, cache strategy decided.
**Status:** passed. **Re-verification:** No.

Note: `gsd-sdk` is not installed here and `verification fingerprint` is not a gsd-tools command in this install (the CLI printed "Unknown command: verification"). Fingerprint step skipped. Remote facts (Vercel, GitHub, Neon, human check) are taken from the orchestrator as observed; code facts were checked locally.

## Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Login at /admin on Preview and local, session persists on reload, sign out, no signup path | VERIFIED | `auth-options.ts` has `emailAndPassword.disableSignUp: true`; no signUp usage in `src` (only a comment in `auth-client.ts`). `signOutAction` in `src/app/admin/(panel)/actions.ts`. `baseURL.allowedHosts` built from Vercel system env vars. Teo approved sign-in, reload and sign-out on Preview and Production. e2e `auth.spec.ts` exists. |
| 2 | Request without valid session is rejected server-side even bypassing proxy.ts | VERIFIED | `dal.ts` `requireSession` (redirects) and `requireSessionForRequest` (401 JSON for route handlers). `AuthGate` calls `requireSession()` inside `<Suspense>` in `admin/(panel)/layout.tsx`. `signOutAction` calls `requireSession()` first. `proxy.ts` only checks the cookie (documented as a UX hint). `dal.test.ts`, `actions.test.ts`, e2e `auth-api.spec.ts` exist. Gap noted as WR-01: `AdminHome` relies on the layout gate; there are no other admin pages yet. |
| 3 | / , /es, /projects/[slug], /es/proyectos/[slug] show real Neon titles, prerendered, `/` English regardless of browser | VERIFIED | Pages read `locale()` from `next/root-params`, use `getProjects` and `getProject` (`'use cache'`, `cacheTag`, `cacheLife('max')`), `generateStaticParams` from published slugs, `localized()` for titles. `routing.ts`: `defaultLocale: 'en'`, `localePrefix: 'as-needed'`, `localeDetection: false`, `localeCookie: false`, localized pathnames. Teo saw Neon titles on all four routes on Preview and Production. Seeded: 4 projects, 2 published. |
| 4 | Every push runs `pnpm check` in CI; Preview build migrates Neon dev and deploys green; CSP Report-Only and security headers | VERIFIED | `.github/workflows/ci.yml` runs on `push` and `pull_request`: install, `db:migrate`, `pnpm check`. `vercel.json` `buildCommand: pnpm db:migrate && pnpm build`. `next.config.ts` sends `Content-Security-Policy-Report-Only` plus nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, COOP, HSTS, noindex on /admin. Orchestrator: CI green on PR, branch and main; Preview migrated `ep-floral-queen` (dev), Production `ep-billowing-union` (main); production responses carry the CSP header. `e2e/headers.spec.ts` exists. |
| 5 | decisions.md records go/no-go; exportContent cycle restores the DB locally; production skips with visible warning | VERIFIED | `docs/decisions.md` has "2026-11-16 Go/no-go del plan B": GO, `cacheComponents: true` kept (via `scripts/go-no-go.sh`). `content-export.ts` serializes an allowlist of content tables to `content/*.json` (files present) and Blob, with `restoreContent`; `seed.ts --from-content --force` restores. `AuthGate` shows the `exportSkipped` notice when on Vercel without `BLOB_READ_WRITE_TOKEN`. `content-export.test.ts` passes. |

**Score:** 5/5

## Requirements Coverage

All 15 IDs are claimed by plans: BASE-01 (01, 03, 09), BASE-02 (02, 05, 06), BASE-03 (03, 05), BASE-04 (05, 06), BASE-05 (02, 05), BASE-06 (02, 04), BASE-07 (04), BASE-08 (02, 05), BASE-09 (07), BASE-10 (03, 09), BASE-11 (09), AUTH-01 (04, 06), AUTH-02 (06), AUTH-03 (04, 06), AUTH-04 (04, 09). No orphaned requirement for Phase 2.

| Req | Status | Evidence |
|-----|--------|----------|
| BASE-01 | SATISFIED | drizzle/0000, 0001 migrations; applied to dev and main per build logs |
| BASE-02 | SATISFIED | `src/app/[locale]/layout.tsx` and `src/app/admin/layout.tsx` are the roots |
| BASE-03 | SATISFIED | `src/proxy.ts` |
| BASE-04 | SATISFIED | `next/root-params` in pages; routing config |
| BASE-05 | SATISFIED | `queries.ts` cores plus cached wrappers, `draftMode()` respected |
| BASE-06 | SATISFIED | `scripts/seed.ts`, `scripts/lib/admin.ts`; seeded main |
| BASE-07 | SATISFIED | `content-export.ts`, `content/*.json` |
| BASE-08 | SATISFIED | pages above, human-approved |
| BASE-09 | SATISFIED | decisions.md entry |
| BASE-10 | SATISFIED | ci.yml, vercel.json, build logs |
| BASE-11 | SATISFIED | `next.config.ts`, header present in production |
| AUTH-01 to AUTH-03 | SATISFIED | see truths 1 and 2 |
| AUTH-04 | SATISFIED | Teo approved login on Preview and Production URLs |

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Unit and component suite | `pnpm test` | 17 files, 91 tests passed | PASS |
| Debt markers TBD/FIXME/XXX in src, scripts, config | grep | none found | PASS |

Probe execution: none declared; no `probe-*.sh` in scope. Playwright e2e was not re-run (requires a seeded Neon).

## Anti-Patterns / Review Findings (advisory, all open per 02-REVIEW-DISPOSITION)

| ID | Severity | Impact on Phase 2 goal |
|----|----------|------------------------|
| CR-01 seed --force overwrites whole rows | Critical, but not exercised (main seeded once without --force) | No goal impact. Must fix before phase 3 |
| CR-02 no production guard on seed/restore | Critical, same | No goal impact. Must fix before phase 3 |
| WR-01 AdminHome lacks `requireSession()` | Warning | Layout gate covers it today. Each phase 3 page and loader must call it |
| WR-06 public Blob backups may expose drafts | Warning | Must resolve before drafts exist |
| WR-02, 03, 04, 05, 07, IN-01 to 04 | Warning/Info | Do not affect the goal |

## Human Verification

Already completed: Teo approved sign-in, reload and sign-out on Preview and Production, and Neon titles on the four public routes. No remaining items.

## Gaps Summary

No gaps against the phase goal. Bookkeeping for the orchestrator: tick BASE-01, BASE-10, BASE-11, AUTH-04 in `.planning/REQUIREMENTS.md` (traceability table and checkboxes) and Phase 2 in ROADMAP. Carry CR-01, CR-02, WR-01 and WR-06 into phase 3 planning as pre-conditions.

---
_Verified: 2026-11-16_
_Verifier: Claude (gsd-verifier)_
