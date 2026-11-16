---
phase: 02-base-t-cnica
plan: 09
subsystem: infra
tags: [security-headers, csp, ci, vercel, neon, deploy]
requires: [02-08]
provides:
  - Report-Only CSP and static security headers in next.config.ts
  - CI workflow running pnpm db:migrate + pnpm check on every push and PR
  - vercel.json buildCommand migrating before build
  - Vercel Preview on Neon dev, Production on Neon main (migrated and seeded once)
affects: [03, 04, 05]
key-files:
  created: [vercel.json, .github/workflows/ci.yml, e2e/headers.spec.ts, src/app/admin/login/zod-jitless.ts]
  modified: [next.config.ts, src/app/admin/login/login-form.tsx, docs/decisions.md]
key-decisions:
  - "Neon integration injects Production only; Preview DATABASE_URL* set by hand to dev"
  - "Distinct BETTER_AUTH_SECRET for local, CI, Preview and Production; BETTER_AUTH_URL only in Production"
  - "Zod JIT disabled in the login form so its new Function probe is not a CSP violation"
requirements-completed: [BASE-01, BASE-10, BASE-11, AUTH-04]
duration: ~3h (including dashboard steps)
completed: 2026-11-16
---

# Phase 2 Plan 09: Vercel, CI and security headers Summary

The phase gate is closed: CI is green, the Preview builds against Neon dev, Production builds against Neon main (migrated and seeded once by hand), and Teo signed in, reloaded and signed out on both the Preview and the Production `*.vercel.app` URL.

## Commits

| Step | Commit |
|------|--------|
| Task 1: CSP Report-Only, headers, CI, vercel.json, headers e2e | d99e56b |
| Task 3: decisions.md environment entry | b255b61 |
| PR #1 merged into main | 169d11f |

## Results

- CI `check` passed (53 s) on push and pull_request for b255b61, and on the main push after the merge (169d11f).
- Preview build log: `migrate target: ep-floral-queen-b7qz90m0` (dev), `migrations applied`.
- Production build log: `migrate target: ep-billowing-union-b7eem4b6` (main), `migrations applied`.
- Neon main by hand: migrations applied; `seeded projects: 4 (2 published)`, `admin created`. Host differs from dev.
- Production aliases include `https://mateojaras-dev.vercel.app` (matches BETTER_AUTH_URL); `/`, `/es`, `/admin/login` return 200; `content-security-policy-report-only` present. `mateojaras.dev` not assigned (D-07).
- `vercel env ls`: DATABASE_URL* on Production (integration) and Preview (manual, dev); BETTER_AUTH_SECRET on both; BETTER_AUTH_URL on Production. `gh secret list`: DATABASE_URL, DATABASE_URL_UNPOOLED, BETTER_AUTH_SECRET.
- Human checks: Teo replied "approved" after login, reload and logout on Preview and Production.

## Task 2 reply (Teo)

> "listo, lo de Environment Variables: turn on "Automatically expose System Environment Variables" no lo encontre, pero el resto esta listo"

The toggle no longer exists in current Vercel; system env vars are exposed by default, and the Preview login proved it. A second pass was needed: the Neon integration still injected Preview with the same variables as Production, so Teo limited it to Production ("listo").

## Deviations from Plan

- [Rule 3] Secrets that live in `.env.local` and the Neon main URLs could not be read by Claude (secret-read guard; the auto-mode classifier also blocked a dev migrate). Teo ran a script (`env-setup.sh` in the session scratchpad) that piped values without printing them and read the main URLs with hidden input. `vercel env pull` was not used because the integration marks the variables Sensitive.
- [Rule 1] First script version shell-sourced `.env.local`; the unquoted `&` in Neon URLs made the value empty. Rewritten to use Node's `parseEnv`.
- [Rule 3] `vercel env add NAME preview` prompts for a Git branch under CLI 59.4; the non-interactive form is `vercel env add NAME preview "" --yes` (probed with a dummy variable, then removed).
- `psql` counts on main were replaced by the seed's own output (4 projects, admin created).
- Teo merged PR #1 before the checks finished; all checks then passed, and Preview and Production were verified after the merge.
- `vercel link` added `VERCEL_OIDC_TOKEN` to `.env.local`; the five required keys were confirmed present.
