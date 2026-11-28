---
phase: 02-base-t-cnica
reviewed: 2026-11-16T12:00:00Z
depth: standard
files_reviewed: 81
files_reviewed_list:
  - .env.example
  - .github/workflows/ci.yml
  - .gitignore
  - drizzle.config.ts
  - e2e/auth-api.spec.ts
  - e2e/auth.spec.ts
  - e2e/axe.ts
  - e2e/headers.spec.ts
  - e2e/public.spec.ts
  - next.config.ts
  - playwright.config.ts
  - scripts/auth-cli.ts
  - scripts/export-content.ts
  - scripts/go-no-go.sh
  - scripts/lib/admin.ts
  - scripts/lib/env.ts
  - scripts/lib/seed-facts.ts
  - scripts/migrate.ts
  - scripts/seed.ts
  - src/app/[locale]/layout.tsx
  - src/app/[locale]/not-found.tsx
  - src/app/[locale]/page.tsx
  - src/app/[locale]/projects/[slug]/page.tsx
  - src/app/admin/(panel)/_components/auth-gate.tsx
  - src/app/admin/(panel)/actions.test.ts
  - src/app/admin/(panel)/actions.ts
  - src/app/admin/(panel)/layout.tsx
  - src/app/admin/(panel)/page.tsx
  - src/app/admin/layout.tsx
  - src/app/admin/login/login-form.test.tsx
  - src/app/admin/login/login-form.tsx
  - src/app/admin/login/page.tsx
  - src/app/admin/login/zod-jitless.ts
  - src/app/api/auth/[...all]/route.ts
  - src/components/site/hero/hero.test.tsx
  - src/db/auth-schema.ts
  - src/db/client.ts
  - src/db/columns.ts
  - src/db/index.ts
  - src/db/schema.test.ts
  - src/db/schema.ts
  - src/features/auth/validation.ts
  - src/features/contact/schema.ts
  - src/features/education/schema.ts
  - src/features/experience/schema.ts
  - src/features/projects/queries.test.ts
  - src/features/projects/queries.ts
  - src/features/projects/schema.ts
  - src/features/projects/seed-map.test.ts
  - src/features/projects/seed-map.ts
  - src/features/resume/schema.ts
  - src/features/site-settings/copy-doc.test.ts
  - src/features/site-settings/copy-doc.ts
  - src/features/site-settings/fixture.ts
  - src/features/site-settings/queries.ts
  - src/features/site-settings/schema.ts
  - src/features/site-settings/types.ts
  - src/features/skills/schema.ts
  - src/i18n/app-config.d.ts
  - src/i18n/navigation.ts
  - src/i18n/request.ts
  - src/i18n/routing.test.ts
  - src/i18n/routing.ts
  - src/lib/auth-client.ts
  - src/lib/auth-options.ts
  - src/lib/auth.ts
  - src/lib/cache-tags.ts
  - src/lib/content-export.test.ts
  - src/lib/content-export.ts
  - src/lib/dal.test.ts
  - src/lib/dal.ts
  - src/lib/db-target.test.ts
  - src/lib/db-target.ts
  - src/lib/env.ts
  - src/lib/locale.ts
  - src/lib/messages.ts
  - src/lib/seed-guard.test.ts
  - src/lib/seed-guard.ts
  - src/proxy.ts
  - src/test/server-only-stub.ts
  - vitest.config.ts
findings:
  critical: 2
  warning: 7
  info: 4
  total: 13
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-11-16T12:00:00Z
**Depth:** standard
**Files Reviewed:** 81
**Status:** issues_found

## Summary

I reviewed the phase 2 technical base: the Drizzle schema, the Neon client, migrate, seed and export scripts, Better Auth wiring, the DAL, the proxy, the admin shell and login, the public routes under `[locale]`, the security headers, CI, and the e2e and unit tests. Vercel's `vercel.json` was also read because its build command runs `scripts/migrate.ts`.

The auth path itself is sound. Sessions live in the database with no cookie cache, sign-up is disabled, the proxy is only a UX hint, `requireSession` validates against the session table, and the sign-out action is guarded. The cached public queries follow the Cache Components rules: no locale read, and `draftMode().isEnabled` is allowed inside `'use cache'` per the bundled 16.4 docs.

The serious problems are in the operator scripts:

- **CR-01:** the "idempotent" `pnpm seed --force` upsert overwrites every admin-editable column, including setting case studies to `null`.
- **CR-02:** nothing stops `seed` or `seed --from-content --force` (which deletes every content table) from running against the production branch.

Other concerns:

- The admin's authorization still rests on a layout-only gate.
- Migrations run inside every Vercel build and on every CI push.
- The CSP is Report-Only with nowhere to report to.
- The sign-in rate limit uses per-instance memory.

## Critical Issues

### CR-01: `pnpm seed --force` overwrites admin edits and sets case studies to null

**File:** `scripts/seed.ts:150-157`, `src/features/projects/seed-map.ts:31-58`, `scripts/seed.ts:123-127,135-138,146-149`
**Issue:** The header comment calls `--force` "upserts by slug; idempotent", and the seed guard's error message tells the operator to "Repite con --force para actualizar por slug". So `--force` is the routine, presented-as-safe path. But the conflict clause is `set: { ...row }`, and `row` comes from `projectRowFromContent`, which hard-codes `caseStudyEs: null, caseStudyEn: null` (seed-map.ts:46-47). It also re-derives `status` from `clientPermission`, `order` from the directory listing index, and every localized text field from `docs/content`. Once phase 3 lets Teo edit in `/admin`, one re-seed would:
- set every Tiptap case study to null (the project's stated Core Value),
- re-publish projects he unpublished, or unpublish ones he published,
- reset his manual ordering,
- revert his copy edits.

`site_settings` (headline, bio, name, links) and `experiences`/`education` are overwritten the same way. The experience match key is `company + startDate`, so if a start date is edited in the admin, a re-seed inserts a duplicate row instead.
**Fix:** On conflict, only fill columns that are still empty. Never touch editorial columns once a row exists:
```ts
.onConflictDoUpdate({
  target: projects.slug,
  // Only seed-owned columns; never status/order/caseStudy*/text the admin edits.
  set: { updatedAt: sql`now()` },
})
// or: .onConflictDoNothing({ target: projects.slug })
```
If a refresh from `docs/content` is really wanted, make it a separate, explicitly named flag (for example `--overwrite-from-docs`) that lists the columns it will replace and asks for confirmation. Remove `caseStudyEs/En: null` from the upsert set in every case.

### CR-02: No production guard on seed, restore or export; `--from-content --force` deletes every content table

**File:** `scripts/seed.ts:72-82`, `src/lib/content-export.ts:180-201`, `src/lib/db-target.ts:2-11`, `scripts/lib/env.ts:5-11`
**Issue:** `describeDbTarget` only logs the endpoint id. The scripts never refuse a target. `loadLocalEnv` deliberately does not override variables already in `process.env`, so a shell that has production variables (from `vercel env pull`, a prior `export`, or a CI job) silently wins over `.env.local`. On that target:
- `pnpm seed --from-content --force` runs `restoreContent`, which issues `DELETE` on all nine content tables and re-inserts from `content/*.json`. That throws away every production edit made since the last export (data loss).
- `pnpm seed --force` hits CR-01 on production.

The only protection is `assertSeedable`. It checks `projects` alone and is bypassed by the same `--force` flag that the docs present as routine.
**Fix:** Refuse known production endpoints unless an explicit, non-routine confirmation is present, and print the target before any write:
```ts
// src/lib/seed-guard.ts
export function assertNotProduction(url: string) {
  const prod = process.env.PRODUCTION_DB_ENDPOINT; // ep-... of the Neon main branch, not a secret
  const endpoint = describeDbTarget(url).split(" ")[0];
  if (prod && endpoint === prod && process.env.I_KNOW_THIS_IS_PRODUCTION !== endpoint) {
    throw new Error(`Refusing to write to production (${endpoint}). Set I_KNOW_THIS_IS_PRODUCTION=${endpoint} to proceed.`);
  }
}
```
Call it in `seed.ts` before `seedFromContent` and before the batch. Also make `restoreContent` take an export of the current rows first, so a restore can be undone.

## Warnings

### WR-01: Admin authorization depends on a layout gate that partial rendering can skip; admin pages do not call `requireSession`

**File:** `src/app/admin/(panel)/_components/auth-gate.tsx:7-10`, `src/app/admin/(panel)/page.tsx:3-11`
**Issue:** The comment calls `AuthGate` the "Real authorization point". In the App Router, layouts are not re-rendered on client navigation. An RSC request whose `Next-Router-State-Tree` header says the `(panel)` layout is already mounted gets only the page segment, so `AuthGate` never runs. The proxy only checks that a cookie exists, so a forged cookie value passes it (the e2e at `e2e/auth.spec.ts:78` shows exactly that). Today `AdminHome` renders only a static title, so nothing leaks yet. But it is the template every phase 3 admin page will copy, and it does not call `requireSession()`. CLAUDE.md requires `requireSession()` in every loader. The e2e tests only cover full document requests, never RSC segment requests.
**Fix:** Call `await requireSession()` at the top of every admin `page.tsx` (and in every loader), starting with `AdminHome`. Change the AuthGate comment to describe it as the shell gate, not the authorization point. Add an e2e test that sends `RSC: 1` with a forged cookie to `/admin` and asserts no admin data in the body.

### WR-02: Migrations run in every Vercel build (before the build) and in CI on every push of every branch

**File:** `vercel.json:3`, `.github/workflows/ci.yml:3-5,26`
**Issue:**
- `buildCommand: "pnpm db:migrate && pnpm build"`: on Production, the migration is applied to the `main` branch before the build is known to succeed. If `next build` then fails, the live (previous) deployment keeps serving against the new schema. A non-backward-compatible migration (column drop or rename) breaks the live site with no rollback.
- Every Preview build, and every CI run on any pushed branch (`on: push` with no branch filter), applies that branch's unmerged migrations to the shared `dev` database (the one local dev and every other preview use). If a migration file is later amended or dropped before merge, the dev branch is left with a schema and `__drizzle_migrations` journal that no longer match the repo.
**Fix:** Run production migrations as a separate, deliberate step, either a manual `pnpm db:migrate` or a protected GitHub workflow on `main`, and require expand/contract (backward-compatible) migrations. In CI, migrate an ephemeral Neon branch created per run (or restrict the migrate step to `main`). Drop `db:migrate` from the Preview build, or point Preview at per-deployment Neon branches.

### WR-03: CSP is Report-Only with no reporting endpoint, so it neither enforces nor reports

**File:** `next.config.ts:8-25`
**Issue:** The comment says "Report-Only until the reports are reviewed", but the policy has no `report-uri` or `report-to` directive, so browsers send violation reports nowhere. Violations only appear in each visitor's own console. The policy therefore gives zero XSS protection and no telemetry, and there is no data to ever justify switching to enforcement. The CLAUDE.md security rule ("CSP y cabeceras de seguridad en `next.config.ts`") is only nominally met. `script-src 'unsafe-inline'` is a documented trade-off, but combined with Report-Only it means no script restriction at all.
**Fix:** Either enforce now (`Content-Security-Policy`; the e2e suite already asserts zero console violations on every page), or add a reporting directive pointing at a collector and set a dated deadline in `docs/decisions.md` for the switch:
```ts
"report-uri /api/csp-report", // plus a Route Handler that logs and returns 204
```

### WR-04: Sign-in rate limit uses Better Auth's in-memory storage on serverless

**File:** `src/lib/auth-options.ts:19-31`
**Issue:** The inline note confirms the default memory storage. On Vercel each function instance has its own counter, and instances are created and recycled freely. The "3 sign-ins per 10 s" limit the e2e specs rely on is therefore per instance, and it resets on every cold start, so the single admin account has no real brute-force protection. The only remaining control is the 12-character minimum enforced by the seed.
**Fix:** Configure `rateLimit: { storage: "database" }` (or `secondary-storage` backed by Upstash once phase 4 adds it), with an explicit `customRules` entry for `/sign-in/email`. Log the choice in `docs/decisions.md`.

### WR-05: `ensureAdmin` can create a second admin and does not revoke sessions on password rotation

**File:** `scripts/lib/admin.ts:11-29`
**Issue:**
- (a) The lookup is by `ADMIN_EMAIL` only. Changing the email in `.env.local` and re-seeding creates a new user and leaves the old account, with its old password and live sessions, fully able to sign in. That violates "Un solo usuario admin".
- (b) When the user exists, the password is re-hashed, but existing sessions stay valid. Rotating the password after a suspected leak does not log the attacker out.
- (c) If the user exists without a `credential` account row, `updatePassword` updates nothing, yet the function returns `"updated"`.
**Fix:** Before creating, count users and refuse (or delete the others explicitly) when a different user already exists. After `updatePassword`, call `ctx.internalAdapter.deleteSessions(found.user.id)`. Verify that a credential account exists (`findAccounts`), and call `linkAccount` when it is missing.

### WR-06: Content backups go to public Blob paths and to the public repo, including draft rows

**File:** `src/lib/content-export.ts:152-158`, `scripts/export-content.ts:14`, `.gitignore` (no `/content/` entry)
**Issue:**
- On Vercel, backups are `put` with `access: "public"` at a predictable path: `backup/<ISO timestamp>/projects.json` with `addRandomSuffix: false`, on the same public store host that every image URL reveals.
- Locally, they are written to `content/*.json`, which is tracked in the public GitHub repo (`content/projects.json` currently holds `finanzas-personales` and `sistema-gestion-inventario` as drafts, whose `clientPermission` is still pending).

From phase 3 on, these exports will carry anything Teo drafts in the admin: unpublished case studies, metrics without client permission, unannounced availability. Anyone who learns or guesses a timestamp, or reads the repo, gets content the site deliberately hides.
**Fix:** Write Blob backups with `addRandomSuffix: true` (or to a separate private store), never link them, and filter or redact `status = 'draft'` rows from the committed `content/` export. Alternatively, move `content/` to `.gitignore` and keep backups only in Blob.

### WR-07: `go-no-go.sh` cleanup kills every `next-server` on the machine

**File:** `scripts/go-no-go.sh:19`
**Issue:** `pkill -f "next-server"` in the EXIT trap terminates any running Next server, including Teo's `pnpm dev` session or another project's server, every time the script exits (pass, fail or Ctrl-C).
**Fix:** Start the server in its own process group and kill only that group:
```bash
set -m; pnpm start -p $PORT >/dev/null 2>&1 & SERVER_PID=$!; set +m
cleanup() { [ -n "$SERVER_PID" ] && kill -- -"$SERVER_PID" 2>/dev/null; true; }
```

## Info

### IN-01: Proxy matcher skips any path that starts with `api` or contains a dot

**File:** `src/proxy.ts:23`
**Issue:** `(?!api|...)` also excludes `/apis`, `/api-docs` and similar routes from next-intl. `.*\\..*` sends dotted paths (for example `/foo.php`) straight to `[locale]` with `locale = "foo.php"`. The root layout then calls `notFound()`, which a same-segment `not-found.tsx` cannot catch, so the visitor gets Next's generic 404 instead of the localized page.
**Fix:** Use `api/|api$` in the negative lookahead, and add `app/global-not-found.tsx` (or validate in the proxy) for paths that reach `[locale]` with a non-locale value.

### IN-02: The login form shows "invalid credentials" for rate-limit and server errors

**File:** `src/app/admin/login/login-form.tsx:37-40`
**Issue:** Any `error` (including 429 and 5xx) sets `failed`. When rate-limited, Teo sees "Correo o contraseña incorrectos." and may retry with other passwords, which extends the lockout.
**Fix:** Branch on `error.status === 429` and show a distinct "too many attempts" message (strings in `messages/es.json`).

### IN-03: The seed validates `ADMIN_PASSWORD` only after writing content

**File:** `scripts/seed.ts:57-63,162,171`
**Issue:** The 12-character check and `requireEnv("ADMIN_EMAIL")` run after the content batch has committed. `process.exit(1)` then leaves a half-seeded run with no admin.
**Fix:** Read and validate both admin variables at the top of `main()`, before any write.

### IN-04: An explicit `locale` reaches a dynamic import without validation

**File:** `src/i18n/request.ts:7-19`
**Issue:** When a caller passes `locale` explicitly (`getTranslations({ locale })`), it is used unvalidated in the `import(\`../../messages/${resolved}.json\`)` path. Every caller today passes a validated value. The phase 4 contact action will receive `locale` from the client, and if its Zod check is forgotten, this becomes an error path (bundler-limited, but a 500).
**Fix:** Run `hasLocale(routing.locales, resolved)` on every path, not only the root-param path, and call `notFound()` when it fails.

---

_Reviewed: 2026-11-16T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
