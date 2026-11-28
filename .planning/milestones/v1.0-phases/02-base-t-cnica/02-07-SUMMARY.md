---
phase: 02-base-t-cnica
plan: 07
subsystem: auth
tags: [better-auth, admin, login, rhf, e2e]
requires: [02-05, 02-06]
provides:
  - Admin root layout (lang es, noindex) and /admin/login form over authClient
  - (panel) layout with AuthGate inside Suspense, signOutAction, export-skipped notice
  - e2e/auth.spec.ts covering login lifecycle, replayed and forged cookies
affects: [02-08, 02-09, 03]
tech-stack:
  added: []
  patterns: [AuthGate RSC calls requireSession per request inside Suspense; admin strings via getTranslations with explicit locale 'es']
key-files:
  created: [src/lib/auth-client.ts, src/features/auth/validation.ts, src/app/admin/layout.tsx, src/app/admin/login/page.tsx, src/app/admin/login/login-form.tsx, src/app/admin/login/login-form.test.tsx, "src/app/admin/(panel)/layout.tsx", "src/app/admin/(panel)/page.tsx", "src/app/admin/(panel)/actions.ts", "src/app/admin/(panel)/actions.test.ts", "src/app/admin/(panel)/_components/auth-gate.tsx", src/components/ui/input.tsx, src/components/ui/label.tsx, e2e/auth.spec.ts]
  modified: [messages/es.json, messages/en.json]
key-decisions:
  - "shadcn Input restyled to DESIGN tokens (h-10, var(--radius), ring-2 offset); added no dependency"
  - "Export notice uses <output> (implicit role status) to satisfy Biome useSemanticElements"
requirements-completed: [AUTH-01, AUTH-02, AUTH-03]
duration: ~40min
completed: 2026-11-15
---

# Phase 2 Plan 07: Admin login and gated shell Summary

Teo signs in at /admin/login through the Better Auth client, sees his name on the AuthGate-protected /admin, and logout, replayed-cookie and forged-cookie cases are proven through the browser.

## Commits

| Task | Commit |
|------|--------|
| 1 Tracer: login form and gated /admin shell | a25d27d |
| 2 Logout action, export notice, unit tests | c89bdf5 |
| 3 e2e lifecycle and proxy-bypass cases | b365515 |

## Results

- `pnpm check` green (91 unit tests, build). `pnpm test:e2e`: 21 passed (5 new in auth.spec.ts, 3 auth-api, 13 public).
- Unit: signOutAction (2: rejects without session and never calls signOut; signs out with session) and LoginForm (4: invalid email, success, generic server error, no sign-up control).
- Browser cookie behaviour: the real Chromium flow works with `__Secure-better-auth.session_token` on http://localhost:3100. Sign-in sets it, reload keeps the session, sign-out revokes it, and the cookie replayed after logout is rejected by AuthGate (redirect to /admin/login, no admin name in the raw body).
- Forged `better-auth.session_token=forged` passes the proxy and is rejected by AuthGate with no admin content in the HTML.

## Deviations from Plan

**1. Redirect status is not asserted.** requireSession's redirect runs inside Suspense, so Next streams it after a 200 shell instead of a 307. The e2e asserts the raw body carries no admin name or sign-out button and that the browser ends on /admin/login. No admin content leaks.

**2. Label lint suppression.** shadcn's generic Label trips Biome `noLabelWithoutControl`; a `biome-ignore` with reason was added (callers pass htmlFor).

**3. Axe on /admin/login is its own test** (5 tests total, plan asked for at least 5); axe on /admin runs inside the lifecycle test to avoid an extra rate-limited sign-in.

## Observations

- `next start` logs a `HANGING_PROMISE_REJECTION` / NeonDbError "During prerendering, fetch() rejects when the prerender is complete" for route /admin after a client sign-in navigation (looks like a runtime prefetch render with the session cookie being aborted). The real render succeeds and tests pass. Worth a look in 02-09 on Vercel; no change made.
- Sign-in specs wait 11 s per UI sign-in to stay under the 3 per 10 s limit; the file takes about 1 minute.

## Requirements

AUTH-01, AUTH-02, AUTH-03 closed (UI flow plus replay edge). BASE-02 and BASE-04 are exercised here but belong to the phase gate; not marked.

## Known Stubs

None. /admin panel body is intentionally empty (D-08).

## Self-Check: PASSED
