# Phase 2: Base técnica - Research

**Researched:** 2026-11-15
**Domain:** Next.js 16.4 Cache Components + next-intl root params with two root layouts, Better Auth single-admin on Vercel Preview, Drizzle/Neon migrations and seed, CI, static CSP
**Confidence:** HIGH for framework behavior (verified against installed sources and bundled Next docs). MEDIUM for the Vercel/Neon dashboard setup (vendor docs are vague, so Teo has to confirm it).

## Summary

The stack research in `.claude/CLAUDE.md` and `.planning/research/ARCHITECTURE.md` already describes the target architecture. This file checks it against the installed sources and covers the four research flags. It also turned up five problems that none of the earlier research mentions. The planner has to act on them:

1. **Next 16.4.3 is affected by the November 2026 security release.** GHSA-vc7v-qv4w-wrv8 (nested `use cache` functions that read a root param can serve one locale's content to the other locale) and GHSA-mfr8-8qww-v76h both hit `cacheComponents` + `next/root-params`, which is this project's setup. The fix is in **16.4.5**, and npm latest is 16.4.6. Better Auth 1.7.14 is below **1.7.16**, the fix for 12 advisories, one of which covers revoked sessions that stay valid when a cookie cache is used. Neither bump is in D-01. Both are patch-level dependency changes, so Teo has to approve them at the start of the phase. They belong in the same single approval request. [VERIFIED: nextjs.org/blog/november-2026-security-release, better-auth.com/blog/security-release-2026-11-03, npm registry]
2. **Better Auth's rate limit only runs on the HTTP router** (`/api/auth/*`). A Server Action that calls `auth.api.signInEmail()` skips both the rate limit and the origin check. The login form therefore has to post to `/api/auth/sign-in/email` through the Better Auth client. Even then the default storage is in memory, and on Vercel serverless each instance keeps its own count. [VERIFIED: better-auth dist/api/index.mjs `onRequest` → `onRequestRateLimit`]
3. **`import 'server-only'` throws in plain Node** (tsx scripts, the `auth` CLI, Vitest). The package resolves to an empty module only under the `react-server` condition. `scripts/seed.ts`, `scripts/export-content.ts`, `scripts/migrate.ts` and the CLI cannot import guarded modules. That forces a "core vs guarded" split of `db` and `auth`. [VERIFIED: `npm view server-only exports`]
4. **`baseURL: { allowedHosts: ['*.vercel.app'] }` trusts every Vercel deployment on the internet**, including an attacker's. Better Auth adds every allowed host to `trustedOrigins`. Build the allowlist from `VERCEL_URL`, `VERCEL_BRANCH_URL` and `VERCEL_PROJECT_PRODUCTION_URL` instead. [VERIFIED: better-auth dist/context/helpers.mjs `getTrustedOrigins`]
5. **The Neon "preview branch per deployment" option conflicts with the plan.** It creates `preview/<git-branch>` from the default branch (main) and injects env vars that override the Preview variables. The result is an unseeded or unmigrated DB, and `generateStaticParams` fails the build. Preview branching must be off, and the Preview `DATABASE_URL`/`DATABASE_URL_UNPOOLED` must point at `dev` by hand. Drizzle's migrator takes no lock, so CI and the Vercel build migrating `dev` at the same time can race. [VERIFIED: neon.com/docs/guides/vercel-native-integration-previews; drizzle-orm pg-core/dialect.js]

**Primary recommendation:** Ask for all approvals in one message (D-01 + Next 16.4.6 + better-auth 1.7.25 + the `auth` CLI at the same version). Next, build the walking skeleton in this order: DB/migrations → auth core → i18n + proxy → cached queries + public skeleton → seed/export → CI/Vercel → CSP. Run the Plan B go/no-go on the built output (`next build && next start`) on day 3, not on `next dev`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Aprobaciones de arranque (las dio Teo en esta discusión, 2026-11-15)
- **D-01:** Dependencias aprobadas, todas: `react` y `react-dom` 19.3.0 → **19.3.1**. Directas: `@tiptap/pm`, `@tiptap/static-renderer` (todos los `@tiptap/*` a la misma versión exacta), `@dnd-kit/utilities` y `server-only`. Dev: `@testing-library/dom`, `@testing-library/user-event` y `tsx`. `@types/node` de `^20` a `^24`. Se instalan en la primera tarea de la fase y se registran en `docs/decisions.md` como decisión de Teo. `@axe-core/playwright` 4.14.0 ya está instalado desde la fase 1.
- **D-02:** `docs/data-model.md` se edita en las dos cosas aprobadas, y en nada más: (1) añadir `site_settings.languages` en formato CEFR (aprobado el 2026-10-29); (2) cambiar `npx @better-auth/cli generate` por `pnpm dlx auth@1.7.14 generate --output src/db/auth-schema.ts`. El esquema y la primera migración se escriben contra el doc ya corregido. — **Reversibility:** one-way — la columna `languages` entra en la primera migración aplicada en Neon `dev` y `main`, y quitarla después exige otra migración.
- **D-03:** Se enmienda CLAUDE.md, sección "Next 16: cosas que cambiaron". `proxy.ts` aplica las reescrituras de next-intl (rutas localizadas en `/es`) **y** la comprobación optimista de la cookie en `/admin`. La validación real de la sesión es un `AuthGate` dentro de `<Suspense>` en `src/app/admin/(panel)/layout.tsx`, más `requireSession()` en cada loader, Server Action y endpoint de subida del admin. Se registra en `docs/decisions.md`.
- **D-04:** **Biome se queda en 2.4.2.** No se sube a 2.6 en esta fase.

#### Defaults de Claude (Teo no eligió discutirlos; puede vetarlos al revisar este archivo)
- **D-05 · Seed y contenido pendiente:** el seed lee `docs/content/*.md` y guarda solo los campos verificables. Los campos de `pendingFields` quedan `null` y nunca se rellenan con texto. ManuJ y EcoExport (`clientPermission: true`) se siembran como `published`. Inventario y Finanzas, que no tienen permiso confirmado, se siembran como `draft`. Las imágenes (`coverImage`, `media`) no se siembran porque `material/` no está versionado y Blob llega en la fase 3. `site_settings` se siembra con los valores reales del fixture de G2 (open, `availableFrom` null, `Medellín, Colombia`, `UTC-5`) y los idiomas que ya constan en PROJECT.md (español nativo, inglés B2). Experiencia y educación se siembran solo con los hechos de PROJECT.md (Sofka ago-2021 a ago-2025 y freelance desde sep-2025; U. de Antioquia y Sofka U), con los bullets de Sofka en `null`. Skills solo si el dato está en `docs/content/`. El texto en inglés en `draft-translation` se siembra tal cual: el esqueleto solo muestra títulos, y la aprobación de esos textos es de la fase 3.
- **D-06 · Dónde corre el seed:** el seed nunca se ejecuta dentro del build. Teo lo corre a mano desde local con `pnpm seed` contra Neon `dev` (Preview y CI). Para `main` se corre una sola vez, a propósito, antes del primer deploy de Production. El build solo aplica las migraciones (`DATABASE_URL_UNPOOLED`). Nunca se usa `drizzle-kit push` contra `main`. Las credenciales del admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) viven solo en `.env.local`, porque solo el seed las usa, y no se cargan en Vercel.
- **D-07 · Entornos:** el gate de la fase es el Preview. Production puede desplegarse en su URL `*.vercel.app` para probar AUTH-04, pero **`mateojaras.dev` no se apunta al proyecto hasta el lanzamiento (fase 5)**. Preview usa la rama `dev` de Neon y Production la rama `main`: se verifica en la integración Neon–Vercel antes del primer build. El build de CI (GitHub Actions) corre contra Neon `dev` con `DATABASE_URL` como secret del repo. Cuando haga falta, se le pide a Teo con los pasos exactos (regla de cuentas de CLAUDE.md).
- **D-08 · Admin mínimo:** `/admin/login` es un formulario de email y contraseña (shadcn + RHF + Zod) con los tokens de DESIGN.md, sin diseño extra. Después del login, `/admin` es una cáscara: cabecera con el nombre, botón "Cerrar sesión" y un panel vacío. La navegación y el CRUD son de la fase 3. La UI del admin va en español, con `getTranslations({ locale: 'es' })` explícito y los textos en `messages/es.json` (y su par en `messages/en.json` por paridad). Esta decisión se registra en `docs/decisions.md`.
- **D-09 · Esqueleto público:** las cuatro rutas renderizan solo lo que pide BASE-08 (título real y lista de proyectos publicados) con tokens y tipografía, sin el diseño de la fase 4. Lo que no tiene contenido no se renderiza. Un slug desconocido o en `draft` da `notFound()`.
- **D-10 · `/lab`:** se borra en la primera tarea de la fase, como ya se decidió el 2026-10-30 en `docs/decisions.md`. Los componentes de `src/components/site/` (hero A, StatusLine) se conservan para la fase 4.

### Claude's Discretion
- Driver de Neon (`neon-http` + `db.batch()`), estructura de `src/db/`, `src/lib/auth.ts`, el helper de creación del admin sobre `internalAdapter`, y los nombres de los archivos.
- Cómo se hace la prueba go/no-go del plan B el día 3 (qué rutas, qué señales) y el formato del registro, siempre que quede en `docs/decisions.md` al final del día 3.
- El contenido exacto de la CSP en Report-Only y las cabeceras de seguridad, sin nonce.
- El formato de `content/*.json` y el modo `--from-content` del seed, siempre que el ciclo export → seed restaure la base en local.
- La configuración de Better Auth para las URLs de Preview (`trustedOrigins`/`allowedHosts`).

### Deferred Ideas (OUT OF SCOPE)
- Biome 2.4 → 2.6: se descartó para esta fase (D-04). Se puede revisar en el pulido de la fase 5.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BASE-01 | Drizzle schema from `docs/data-model.md` (+ `site_settings.languages` CEFR) migrated in Neon `dev` and `main` | §Pattern 1 (db split), §Pattern 7 (locked migrate script), `languages` shape in §Code Examples; Pitfall 6/7 |
| BASE-02 | Two root layouts (`app/[locale]`, `app/admin`), scaffold layout removed | §Recommended Structure; Pitfall 2 (`locale()` is `string \| undefined`), Pitfall 10 (global 404) |
| BASE-03 | `proxy.ts` = next-intl rewrites + `/admin` cookie check | §Pattern 3 (`src/proxy.ts`, admin branch before intl) |
| BASE-04 | Locale via `next/root-params`; explicit in Actions/Route Handlers; `/` always English | §Pattern 2 (`request.ts` with override + admin fallback), `localeDetection:false` + `localeCookie:false` |
| BASE-05 | `'use cache'` + `cacheTag`, core + cached wrapper, respects Draft Mode | §Pattern 4 (wrapper reads `draftMode()` inside the cached scope) |
| BASE-06 | `pnpm seed` loads `docs/content/` + creates the single admin from env | §Pattern 6 (internalAdapter helper, idempotent, non-empty guard) |
| BASE-07 | `exportContent()` → `content/*.json` locally, Blob in prod (skipped with notice) | §Pattern 8; Pitfall 11 (read-only FS on Vercel), Pitfall 12 (public repo) |
| BASE-08 | Four public routes prerendered with real titles | §Pattern 4/5; `generateStaticParams` ≥1 entry (seeded DB) |
| BASE-09 | Plan B go/no-go logged day 3 | §Plan B go/no-go protocol |
| BASE-10 | CI `pnpm check` per push; Preview deploys against `dev` with migrations | §Pattern 7, §CI workflow, §Vercel/Neon setup; Pitfall 5/6 |
| BASE-11 | Static CSP + security headers, Report-Only first | §Code Examples (headers), Pitfall 13 (Vercel toolbar), Pitfall 14 |
| AUTH-01 | Email+password login, signup disabled | §Pattern 5 (client sign-in via HTTP router), `disableSignUp` |
| AUTH-02 | Session persists across reloads; logout | Default DB session (7d) + `signOut` Server Action with `nextCookies` |
| AUTH-03 | Every admin route/loader/action/upload rejects without session server-side | §Pattern 5 (`AuthGate` + `requireSession` + `requireSessionForRequest`), forged-cookie e2e |
| AUTH-04 | Login works on Preview URLs and prod | §Pattern 5 dynamic `baseURL.allowedHosts` from `VERCEL_*` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Read `AGENTS.md` and the matching guide in `node_modules/next/dist/docs/` before writing Next code. Do not edit the `nextjs-agent-rules` block.
- The stack is fixed. **Ask before adding or changing dependencies** (this covers patch bumps outside D-01), touching DESIGN.md, copy, the palette or typography, changing `docs/data-model.md` beyond D-02 or an existing migration, adding routes, or adding external services.
- `proxy.ts` replaces middleware. Real validation happens in the admin layout gate and in every Server Action (amended by D-03).
- `params`, `cookies()` and `headers()` are async. Use `updateTag` in Server Actions and `revalidateTag(tag, 'max')` elsewhere. `'use cache'` cannot read `headers()`, so the locale comes from `next/root-params`. Lint is Biome (2.4.2).
- Organize by feature (`src/features/<entity>/{schema,queries,actions,validation}.ts`). Use Server Components by default. Mutation order: Zod → session → Drizzle → `updateTag` → `exportContent()`.
- Tables in `snake_case`, code in `camelCase`, `_en`/`_es` columns, read through `localized()`. UI strings go in `messages/{en,es}.json`. Content comes from the DB only. Missing content means the component does not render. No invented content.
- One conventional commit per task. Tests sit next to the code, e2e in `e2e/`. `pnpm check` must pass before each closing commit.
- Design bans apply to the login and the skeleton too: no system fonts or gradients, no em-dashes in copy, no emojis.
- Accounts rule: when a variable is missing from `.env.local`, STOP and give Teo (1) the service, (2) the dashboard steps, (3) the variable name and where to put it. Code stays behind an explicit env check, never a fake value.
- Security: no secrets in versioned files, a single admin, signup disabled, Zod on the server, CSP and headers in `next.config.ts`.
- Log every non-trivial decision in `docs/decisions.md`: who decided and why.
- GSD workflow enforcement: edits go through `/gsd-execute-phase`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Locale routing (`/` en, `/es`, `/es/proyectos/*` rewrite) | Frontend Server (proxy) | — | next-intl middleware in `src/proxy.ts`. Nothing reads `Accept-Language` |
| Locale resolution in RSC | Frontend Server (RSC) | — | `next/root-params` `locale()`; part of the `'use cache'` key only if read inside |
| Admin optimistic gate | Frontend Server (proxy) | — | Cookie presence only (`getSessionCookie`). Never authoritative |
| Session validation | API/Backend (DAL) | Frontend Server (AuthGate in Suspense) | `requireSession()` in every loader and Server Action. AuthGate is a UX layer on top |
| Login / logout | API/Backend (`/api/auth/*` router) | Browser (RHF form) | The HTTP router applies the rate limit and origin check. A Server Action does not |
| Public reads | Frontend Server (`'use cache'`) | Database | Prerendered at build; the DB is hit at build and on tag revalidation |
| Schema + migrations | Database | Build (Vercel buildCommand) | Locked migrate script with `DATABASE_URL_UNPOOLED` |
| Seed / export / restore | Local scripts (tsx) | Database, Blob (phase 3) | Never inside the build (D-06) |
| CSP + security headers | CDN/Static (`next.config.ts` headers) | — | Static header, no nonce, so the static shell stays intact |
| CI | GitHub Actions | Neon `dev` | `pnpm check` (includes `next build` → needs a seeded DB) |

## Standard Stack

### Core (already installed, versions verified 2026-11-15)

| Library | Installed | Target | Purpose | Note |
|---------|-----------|--------|---------|------|
| next | 16.4.3 | **16.4.6** (≥16.4.5) | Framework | Security: GHSA-vc7v-qv4w-wrv8 and GHSA-mfr8-8qww-v76h hit cacheComponents + root params (16.3.0–16.4.4). **Needs Teo's approval** [VERIFIED: nextjs.org blog, npm] |
| react / react-dom | 19.3.0 | 19.3.1 | Runtime | Approved D-01 [VERIFIED: npm] |
| better-auth | 1.7.14 | **1.7.25** (≥1.7.16) | Auth | Nov-3 security release. **Needs Teo's approval**. Peer drizzle-orm `^0.45.2` is still satisfied [VERIFIED: npm, better-auth.com blog] |
| next-intl | 4.14.9 | keep | i18n routing + messages | Root-params integration documented. 4.15.1 exists but is not needed [VERIFIED: npm, installed source] |
| drizzle-orm / drizzle-kit | 0.45.4 / 0.31.11 | keep (latest) | ORM + migrations | [VERIFIED: npm] |
| @neondatabase/serverless | 1.2.0 | keep | `neon()` HTTP + `Client` (WebSocket) | Falls back to global `WebSocket` (Node 24 has it) [VERIFIED: installed index.mjs] |
| zod / react-hook-form / @hookform/resolvers | 4.6.7 / 7.91 / 6.0.2 | keep | Login form + server validation | |

### Supporting (approved in D-01, install in task 1)

| Library | Version | Purpose |
|---------|---------|---------|
| server-only | 0.0.1 | Guard for `src/db/index.ts`, `src/lib/auth.ts`, `src/lib/dal.ts` |
| tsx | 4.23.15 | Runs `scripts/*.ts` with `@/` aliases |
| @types/node | ^24 (24.19.2) | Matches Node 24.22 and the vitest 5 peer |
| @testing-library/dom / user-event | 10.4.2 / 14.6.10 | Login form component test |
| @tiptap/pm, @tiptap/static-renderer | **3.32.0 exact** (match installed @tiptap/react 3.32.0; 3.34.0 is latest) | Phase 3 use; install now per D-01 |
| @dnd-kit/utilities | 3.2.2 | Phase 3 use |
| auth (CLI, via `pnpm dlx`) | same version as better-auth (1.7.14, or 1.7.25 if bumped) | Generate `src/db/auth-schema.ts` |

**Installation (after the single approval message):**
```bash
pnpm add react@19.3.1 react-dom@19.3.1 server-only @tiptap/pm@3.32.0 @tiptap/static-renderer@3.32.0 @dnd-kit/utilities@3.2.2
pnpm add -D tsx @types/node@^24 @testing-library/dom @testing-library/user-event
# Only if Teo approves the security bumps:
pnpm add next@16.4.6 better-auth@1.7.25
```
Pin `@tiptap/react` and `@tiptap/starter-kit` to exact `3.32.0` too (they are `^3.32.0` today, and a fresh install would float to 3.34.0 while `pm` stays put).

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Login via Better Auth HTTP router (client `signIn.email`) | Server Action → `auth.api.signInEmail` | The Server Action skips rate limit + origin check (verified). Only acceptable with our own limiter (Upstash arrives in phase 4) |
| `rateLimit.storage: 'memory'` | `storage: 'database'` | Database storage survives serverless instances but adds a `rateLimit` table, which is a data-model change (ask Teo). See Open Question 2 |
| Dynamic `baseURL.allowedHosts` from `VERCEL_*` | `allowedHosts: ['*.vercel.app']` | The wildcard trusts any Vercel deployment as an origin (CSRF surface) |
| Custom `scripts/migrate.ts` with an advisory lock | `drizzle-kit migrate` | drizzle-kit has no lock. Concurrent CI + Vercel runs on `dev` race (see Pitfall 6) |
| Queries locale-agnostic (return both columns) | Read `locale()` inside `'use cache'` | Locale-agnostic queries have one cache entry per entity, stay immune to the root-param leak advisory class, and make Plan B simpler |

## Package Legitimacy Audit

slopcheck 0.x ran via `slopcheck scan <package.json> --json` (the `install` subcommand would have installed the packages, so it was not used).

| Package | Registry | Source Repo | slopcheck | Disposition |
|---------|----------|-------------|-----------|-------------|
| react / react-dom 19.3.1 | npm | github.com/react/react | [OK] | Approved (D-01) |
| @tiptap/pm, @tiptap/static-renderer 3.32.0 | npm | github.com/ueberdosis/tiptap | [OK] | Approved (D-01) |
| @dnd-kit/utilities 3.2.2 | npm | github.com/clauderic/dnd-kit | [OK] | Approved (D-01) |
| server-only 0.0.1 | npm | none linked (maintainer sebmarkbage; also vendored at `next/dist/compiled/server-only`) | [OK] (info: NO_REPO) | Approved (D-01) |
| @testing-library/dom 10.4.2, user-event 14.6.10 | npm | github.com/testing-library/* | [OK] | Approved (D-01) |
| tsx 4.23.15 | npm | github.com/privatenumber/tsx | [OK] | Approved (D-01) |
| @types/node 24.19.2 | npm | DefinitelyTyped | [OK] | Approved (D-01) |
| next 16.4.6 | npm | github.com/vercel/next.js | [OK] | **Needs approval** (security patch) |
| better-auth 1.7.25 | npm | github.com/better-auth/better-auth | [OK] | **Needs approval** (security patch) |
| auth 1.7.x (CLI, run via `pnpm dlx`, not installed) | npm | github.com/better-auth/better-auth ("The CLI for Better Auth") | [OK] | Approved (D-02) |

No package has a `postinstall` script (checked with `npm view <pkg> scripts.postinstall`). **Removed:** none. **Flagged [SUS]:** none.

## Architecture Patterns

### System Architecture Diagram

```
Browser request
   │
   ▼
src/proxy.ts (Node runtime; matcher excludes api,_next,_vercel,dotted files)
   ├─ path starts /admin ─┬─ /admin/login → next()
   │                      └─ else: getSessionCookie? next() : redirect /admin/login   (optimistic only)
   └─ else → next-intl middleware (as-needed, localeDetection:false, localeCookie:false)
              "/" → rewrite /en ;  "/es/proyectos/x" → rewrite /es/projects/x ; "/en/..." → 308 "/..."
   │
   ▼
App Router
   ├─ app/[locale]/layout.tsx (root #1, generateStaticParams en/es, hasLocale→notFound)
   │     page.tsx, projects/[slug]/page.tsx (generateStaticParams = published slugs)
   │       └─ features/*/queries.ts  getX()  ['use cache' + cacheTag + cacheLife('max') + draftMode()]
   │             └─ getXCore({includeDrafts}) ── neon-http ──► Neon (dev | main)
   │       render: localized(row,'title', await locale())
   ├─ app/admin/layout.tsx (root #2, lang="es", fonts; no session read)
   │     login/page.tsx ──client form──► POST /api/auth/sign-in/email (rate limit + origin check)
   │     (panel)/layout.tsx  <Suspense><AuthGate>{children}</AuthGate></Suspense>, instant=false
   │          AuthGate/loaders/actions → requireSession() → auth.api.getSession({headers}) ─► Neon
   └─ app/api/auth/[...all]/route.ts → toNextJsHandler(auth)
                         ▲
Vercel build: tsx scripts/migrate.ts (advisory lock, UNPOOLED) && next build
Local only:   pnpm seed [--from-content] | pnpm export:content → content/*.json
CI (push):    pnpm install → pnpm check (typecheck, lint, test, build vs Neon dev)
```

### Recommended Project Structure

```
src/
├── proxy.ts                      # must sit next to app/ (src/), not repo root [CITED: proxy.md]
├── i18n/{routing,request,navigation}.ts
├── app/
│   ├── [locale]/{layout,page,not-found}.tsx
│   ├── [locale]/projects/[slug]/page.tsx
│   ├── admin/layout.tsx          # root #2
│   ├── admin/login/page.tsx      # outside the gate
│   ├── admin/(panel)/{layout,page}.tsx
│   ├── admin/(panel)/_components/auth-gate.tsx
│   └── api/auth/[...all]/route.ts
├── db/
│   ├── client.ts                 # createDb(url) — NO server-only (scripts import it)
│   ├── index.ts                  # import 'server-only'; export const db = createDb(env)
│   ├── schema.ts                 # re-exports features/*/schema.ts + auth-schema.ts
│   └── auth-schema.ts            # generated by `auth generate`
├── lib/
│   ├── auth-options.ts           # betterAuth options factory, NO server-only, no next imports
│   ├── auth.ts                   # import 'server-only'; betterAuth({...options, plugins:[nextCookies()]})
│   ├── auth-client.ts            # 'use client' createAuthClient (admin only)
│   ├── dal.ts                    # import 'server-only'; requireSession(), requireSessionForRequest()
│   ├── cache-tags.ts, i18n-fields.ts (exists), env.ts
│   └── content-export.ts         # serialize/deserialize (pure, testable) + exportContent()
├── features/{site-settings,projects,experience,skills,education,resume,contact}/schema.ts
├── features/{projects,site-settings}/queries.ts
drizzle/                          # migrations (drizzle-kit generate output)
drizzle.config.ts
scripts/{migrate,seed,export-content}.ts
e2e/{auth.spec.ts,public.spec.ts}
playwright.config.ts
.github/workflows/ci.yml
vercel.json                       # buildCommand
content/                          # export output (see Open Question 3 on committing)
```

### Pattern 1: Core vs guarded modules (server-only split)
**What:** Put everything scripts need in unguarded files (`db/client.ts`, `lib/auth-options.ts`, `lib/content-export.ts` core). Re-export through guarded files for app code.
**Why:** `server-only`'s `default` export is `index.js`, which throws. Only the `react-server` condition resolves to `empty.js` [VERIFIED: npm view server-only exports]. tsx, the `auth` CLI and Vitest all run under the default condition.
**Vitest:** add `resolve.alias: { 'server-only': <path to an empty stub> }` in `vitest.config.ts`. That way unit tests of the DAL with `vi.mock('@/lib/auth')` can import guarded files.

### Pattern 2: `src/i18n/request.ts` with override + admin fallback
```ts
// Source: next-intl.dev/blog/nextjs-root-params (override pattern) + next-root-params.md (multiple root layouts)
import * as rootParams from 'next/root-params';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const param = await rootParams.locale();      // string | undefined (admin root has no [locale])
    if (param === undefined) locale = 'es';       // admin root layout: Spanish UI (D-08)
    else if (hasLocale(routing.locales, param)) locale = param;
    else notFound();
  }
  return {
    locale,
    timeZone: 'America/Bogota',                   // avoid next-intl's server Intl fallback
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```
- `rootParams.locale()` returns `string | undefined` because `app/admin` is a second root layout without `[locale]` [CITED: next-root-params.md "Multiple root layouts"].
- **In Server Actions and Route Handlers, `rootParams.locale()` throws** (it does not return undefined) [CITED: next-root-params.md Restrictions]. Every call in those contexts must pass `{ locale }` explicitly, so `request.ts` never reaches the getter. D-08 already requires `getTranslations({ locale: 'es', namespace })` in the admin.
- Wrap the config: `next.config.ts` = `createNextIntlPlugin('./src/i18n/request.ts')(nextConfig)`.
- `routing.ts`: `defineRouting({ locales: ['en','es'], defaultLocale: 'en', localePrefix: 'as-needed', localeDetection: false, localeCookie: false, pathnames: { '/': '/', '/projects/[slug]': { en: '/projects/[slug]', es: '/proyectos/[slug]' } } })`. In v4, `localeDetection: false` no longer disables the cookie. That needs `localeCookie: false` [CITED: next-intl 4.0 blog via Context7].
- Do not add `/about` and `/contact` to `pathnames` until phase 4 creates them. A mapping for a route that does not exist only produces 404s.

### Pattern 3: One proxy, two jobs (`src/proxy.ts`)
```ts
import createMiddleware from 'next-intl/middleware';
import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname === '/admin/login') return NextResponse.next();
    return getSessionCookie(req) ? NextResponse.next()
      : NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return handleI18n(req);   // must never see /admin, or it rewrites to /en/admin
}
export const config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] };
```
`getSessionCookie` already checks both the `__Secure-`-prefixed and the plain name [VERIFIED: better-auth dist/cookies/index.mjs]. Do not set `runtime` in proxy, because it throws [CITED: proxy.md].

### Pattern 4: Core + cached wrapper with Draft Mode (BASE-05)
```ts
// features/projects/queries.ts
import { cacheLife, cacheTag } from 'next/cache';
import { draftMode } from 'next/headers';

export async function getProjectsCore(opts: { includeDrafts: boolean }) { /* drizzle select, both _en/_es columns */ }

export async function getPublishedProjects() {
  'use cache';
  cacheTag(tags.projects);
  cacheLife('max');
  const { isEnabled } = await draftMode();   // allowed inside 'use cache' [CITED: draft-mode.md]
  return getProjectsCore({ includeDrafts: isEnabled });
}
```
- In Draft Mode, `'use cache'` scopes re-execute on every request and are not stored, so drafts never pollute the cache [CITED: draft-mode guide]. `cookies()`/`headers()` stay forbidden in the scope.
- The queries **do not read the locale**. Pages read `await locale()` from `next/root-params` (or next-intl `getLocale()`) and call `localized(row, 'title', locale)`.
- The slug page: `generateStaticParams` returns the published slugs (from the core, so it never ties into Draft Mode). It must return ≥1 entry with Cache Components or the build errors (`empty-generate-static-params`) [CITED: generate-static-params.md]. With `generateStaticParams`, the page may `await params` directly. Unknown slugs render at runtime and are then saved [CITED: dynamic-routes.md "With Cache Components"]. A null result calls `notFound()` (D-09). Never set `dynamicParams = false`.
- Page bodies may only use the cached wrappers. An uncached DB call outside `<Suspense>` during prerender fails the build.
- **Plan B mapping:** replace each wrapper with `unstable_cache(() => getXCore({ includeDrafts: false }), [key], { tags })`, reading `draftMode()` outside it. Root params throw inside `unstable_cache` [CITED: next-root-params.md], but the queries don't read them, so nothing else changes.

### Pattern 5: Auth (single admin, Preview-safe)
```ts
// lib/auth-options.ts (no server-only, no next/* imports)
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { BetterAuthOptions } from 'better-auth';

const vercelHosts = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter((h): h is string => Boolean(h));

export function authOptions(db: Db): BetterAuthOptions {
  return {
    database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
    emailAndPassword: { enabled: true, disableSignUp: true },
    baseURL: {
      allowedHosts: [...vercelHosts, 'localhost:3000'],
      fallback: process.env.BETTER_AUTH_URL,          // local: http://localhost:3000
      protocol: 'auto',
    },
    // session.cookieCache: leave OFF (revocation advisory class, GHSA-fvxx-76fc-893x)
  };
}
// lib/auth.ts
import 'server-only';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
export const auth = betterAuth({ ...authOptions(db), plugins: [nextCookies()] }); // nextCookies last
```
- How the dynamic `baseURL` behaves (verified in source): it matches the request `host` (or `x-forwarded-host` only with `advanced.trustedProxyHeaders`) against `allowedHosts`, falls back to `fallback`, and adds each allowed host to `trustedOrigins` [VERIFIED: dist/utils/url.mjs `resolveDynamicBaseURL`, dist/context/helpers.mjs]. With the dynamic config, `BETTER_AUTH_URL` is only the fallback, so copying it to Vercel (ROADMAP) is harmless.
- `VERCEL_URL`, `VERCEL_BRANCH_URL` and `VERCEL_PROJECT_PRODUCTION_URL` are available at build and at runtime, without the protocol, once "system environment variables" is enabled for the project [CITED: vercel.com/docs/environment-variables/system-environment-variables].
- **Login**: a client component (RHF + Zod) calls `authClient.signIn.email({ email, password })`, which posts to `/api/auth/sign-in/email`. On success: `router.replace('/admin'); router.refresh()`. Default special rule: 3 requests per 10 s on `/sign-in*` [VERIFIED: dist/api/rate-limiter `getDefaultSpecialRules`]. The rate limit is enabled by default only in production. IP comes from `x-forwarded-for` [VERIFIED: core utils/ip.mjs].
- **Logout**: a Server Action calls `requireSession()`, then `auth.api.signOut({ headers: await headers() })` (`nextCookies` clears the cookie), then `redirect('/admin/login')`.
- **Gate**: `admin/(panel)/layout.tsx` renders `<Suspense fallback={<AdminSkeleton/>}><AuthGate>{children}</AuthGate></Suspense>` with `export const instant = false`. Reading `headers()` outside Suspense is a build error with Cache Components [CITED: authentication-with-cache-components.md]. `AuthGate` calls `requireSession()`. Children render inside the gate, so no admin data streams before the check.
- **DAL**: `requireSession = cache(async () => { const s = await auth.api.getSession({ headers: await headers() }); if (!s) redirect('/admin/login'); return { userId: s.user.id, name: s.user.name }; })`. Route Handlers (the phase 3 upload) use `requireSessionForRequest(req)`, which returns `401` instead of redirecting. Ship it in phase 2 with a unit test so AUTH-03's "endpoint de subida" clause has a ready helper.
- `/admin/login` must not redirect to `/admin` just because the cookie exists. Only a valid `getSession()` counts. Otherwise a stale cookie loops: proxy lets `/admin` through, the gate redirects to login, and login redirects back.
- `app/api/auth/[...all]/route.ts` (`toNextJsHandler(auth)`) is a new route. It is implied by AUTH-01, but log it in `docs/decisions.md`.

### Pattern 6: Seed admin helper (signup disabled)
```ts
// scripts/lib/admin.ts — uses a script-side betterAuth instance built from authOptions(createDb(UNPOOLED or pooled))
const ctx = await auth.$context;
const hash = await ctx.password.hash(password);
const found = await ctx.internalAdapter.findUserByEmail(email);
if (found) await ctx.internalAdapter.updatePassword(found.user.id, hash);
else {
  const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true });
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: 'credential', accountId: user.id, password: hash });
}
```
`createUser`, `linkAccount`, `findUserByEmail` and `updatePassword` exist in 1.7.14. `updatePassword` matches `providerId: 'credential'` and `accountId = userId`, so `linkAccount` must use `accountId: user.id` [VERIFIED: dist/db/internal-adapter.mjs]. This is an internal API: wrap it in this one helper and cover it with a manual login check after each Better Auth bump. Read `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env.local`, and fail with a clear message if either is missing.

**Seed rules:**
- Idempotent: fixed `site_settings` id, and upsert projects by `slug`.
- Write content in `db.batch([...])`, which neon-http runs through `client.transaction` [VERIFIED: drizzle-orm neon-http/session.js]. `db.transaction()` throws on neon-http.
- Refuse to overwrite non-empty content tables without `--force`, because main will hold Teo's admin edits after phase 3.
- Print the target DB host before writing.
- Never delete the auth tables.
- Map content to rows: `titleEn/Es`, `taglineEn/Es` (null when pending), `liveUrl`, `repoUrl`, `startedAt`, `finishedAt`, `metrics` → `[]`/null. `status` comes from `clientPermission === true`. The contract fields `stack`, `sampleData`, `enStatus` and `altStatus` have no column and are dropped.

### Pattern 7: Locked migrations (Vercel build + CI)
`scripts/migrate.ts`:
1. Create a `Client` from `@neondatabase/serverless` on `DATABASE_URL_UNPOOLED` (one WebSocket connection, global `WebSocket` in Node 24).
2. Run `SELECT pg_advisory_lock(<const>)`.
3. Run `migrate(drizzle(client), { migrationsFolder: 'drizzle' })` from `drizzle-orm/neon-serverless/migrator`. This is transactional, unlike `neon-http/migrator`, which runs the statements outside a transaction [VERIFIED: installed sources].
4. Unlock, then end the connection.

Load `.env.local` only when it exists: `if (existsSync('.env.local')) process.loadEnvFile('.env.local')`. `drizzle.config.ts` does the same and keeps `drizzle-kit generate`/`studio`.

Set `vercel.json` to `{ "buildCommand": "pnpm db:migrate && pnpm build" }` so the command is versioned. `db:migrate` = `tsx scripts/migrate.ts`. Never use `drizzle-kit push`.

### Pattern 8: exportContent
- A pure `serializeTable(rows)` / `deserializeTable(json)`, unit tested: dates as ISO strings, revived to `Date` for timestamps; `date()` columns stay strings.
- `exportContent(table?)`:
  - not on Vercel (`!process.env.VERCEL`): write `content/<table>.json` as `{ table, exportedAt, rows }`.
  - on Vercel with `BLOB_READ_WRITE_TOKEN`: phase 3 Blob `put('backup/<date>/<table>.json')`.
  - on Vercel without the token: return `{ status: 'skipped', reason: 'missing BLOB_READ_WRITE_TOKEN' }` and log `console.warn`.

  The admin shell shows a visible notice when `process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN`. Read that inside AuthGate, which is already dynamic. Strings go in messages.
- Export **only content tables**: site_settings, projects, experiences, skills, education, the join tables, resume_versions. **Never** user/session/account/verification or contact_messages.
- Restore order: parents first (settings, skills, projects, experiences, education), then the joins. Delete in reverse. All inside one `db.batch`.
- Admin actions call it via `after(() => exportContent(...))` (phase 3).

### Plan B go/no-go protocol (BASE-09, day 3)

Run on `pnpm build && pnpm start` with the seeded `dev` branch.

| # | Signal | Pass criterion |
|---|--------|----------------|
| 1 | `next build` route table | `/[locale]` and `/[locale]/projects/[slug]` show as prerendered for en/es and both published slugs. No "Uncached data accessed outside Suspense" or `empty-generate-static-params` error |
| 2 | `curl -s localhost:3000/` and `/es` | `<html lang="en">` / `lang="es"`. The real project titles from Neon are in the HTML. `curl -H 'Accept-Language: es' /` still returns English |
| 3 | `/es/proyectos/<slug>`, `/projects/<slug>`, `/es/projects/<slug>` | 200, 200, redirect to `/es/proyectos/<slug>` |
| 4 | Draft or unknown slug | 404 |
| 5 | Admin under cacheComponents | Build passes with AuthGate in Suspense; login, reload and logout work on `next start` |
| 6 | Cross-locale check | `/` never contains Spanish-only strings and `/es` never contains English UI strings, after repeated warm requests |
| 7 | Read-your-writes | Optional: there is no admin mutation yet. Note it as "verified in phase 3" |

Signals 1–5 green means GO for cacheComponents. Any blocker that cannot be fixed in about 2 hours means NO-GO: apply Plan B (pre-approved). The `docs/decisions.md` entry records each signal and its result, the Next version, and who decided (Claude, under Teo's pre-approval).

### Anti-Patterns to Avoid
- **`allowedHosts: ['*.vercel.app']`**: trusts any Vercel deployment's origin.
- **Login through a Server Action calling `auth.api`**: no rate limit, no origin check.
- **Importing `@/db` or `@/lib/auth` from scripts**: `server-only` throws.
- **next-intl middleware seeing `/admin`**: it rewrites to `/en/admin` and returns 404.
- **Reading `locale()` inside query wrappers**: it adds no value and widens the cache key. That is exactly the surface of GHSA-vc7v.
- **`neon-http/migrator`**: not transactional.
- **Running the seed in the build**: forbidden by D-06, and it would overwrite main.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | custom scrypt/bcrypt | `ctx.password.hash` (Better Auth) | Must match what Better Auth verifies at sign-in |
| Session cookie parsing in proxy | regex on `cookie` | `getSessionCookie` from `better-auth/cookies` | Handles `__Secure-` prefix and both separators |
| Locale negotiation / localized path rewrite | custom rewrites | next-intl middleware + `pathnames` | Redirects `/en/*` → `/*` and `/es/projects/*` → `/es/proyectos/*` |
| Login rate limiting (until phase 4) | in-memory counter in an action | Better Auth router rate limit (or its database storage) | Already applied per path. Hand-rolled memory has the same serverless weakness |
| Migration tracking | own SQL runner | drizzle `migrate()` (wrapped with a lock) | Hash/`created_at` bookkeeping in `drizzle.__drizzle_migrations` |
| CSRF on Server Actions | tokens | Next's built-in Origin/Host check + Better Auth `trustedOrigins` | Both built in |

## Runtime State Inventory

Not a rename phase. The only removal is `/lab` (D-10).

| Category | Items Found | Action |
|----------|-------------|--------|
| Stored data | None. The Neon `dev`/`main` branches are empty; this phase creates the schema | — |
| Live service config | Vercel project env vars and the Neon integration settings live in dashboards, not git | Teo verifies (see Environment Availability) |
| OS-registered state | None | — |
| Secrets/env vars | `.env.local` **does not exist** on the machine | Teo creates it (blocking) |
| Build artifacts | `scripts/capture-lab.ts` and `scripts/check-phase-1.sh` target `/lab` routes that D-10 deletes. `labMessages` and the `Lab` namespace in messages become dead code | Delete or archive them in the `/lab` task. Keep `heroFixture`, which the seed and hero tests use |

## Common Pitfalls

### Pitfall 1: Shipping on a vulnerable Next/Better Auth
**What goes wrong:** locale content leaks across `/` and `/es` under nested `use cache` (GHSA-vc7v-qv4w-wrv8, 16.3.0–16.4.4). Revoked sessions stay valid with a cookie cache (Better Auth < 1.7.16).
**How to avoid:** put the bumps in the first approval message. If Teo declines, keep the queries locale-agnostic (Pattern 4) and the cookie cache off. Both measures shrink the exposure.

### Pitfall 2: `locale()` in the admin tree
**What goes wrong:** `request.ts` calls `notFound()` for every admin page, or a Server Action calls `getTranslations()` without a locale and throws.
**How to avoid:** use the Pattern 2 fallback and an explicit `{ locale }` in every Action and Route Handler.

### Pitfall 3: `server-only` in non-Next runtimes
**Warning signs:** "This module cannot be imported from a Client Component module" when running `pnpm seed`, `auth generate` or `vitest`.
**How to avoid:** use the Pattern 1 split, the Vitest alias, and `auth generate --config scripts/auth-cli.ts` (an unguarded instance built from `authOptions`). Or skip the config with `--adapter drizzle --dialect postgresql`, which only works with no plugins [CITED: Better Auth CLI docs via Context7].

### Pitfall 4: Missing `BETTER_AUTH_SECRET` in CI/Vercel builds
**What goes wrong:** with `NODE_ENV=production`, Better Auth throws "You are using the default secret" [VERIFIED: create-context.mjs `validateSecret`]. `next build` in CI evaluates `auth.ts` and fails.
**How to avoid:** add a CI-only random `BETTER_AUTH_SECRET` repo secret. Set Vercel Production and Preview to separate values.

### Pitfall 5: Neon preview branching or a wrong Preview DB
**What goes wrong:** with "Create database branch for deployment → Preview" checked, each preview gets `preview/<branch>` forked from the default branch, and the injected env vars override the Preview variables [CITED: neon.com native integration previews]. That branch is unseeded, so `generateStaticParams` returns 0 and the build fails. Worse: if the integration injects Preview vars that point at main, the Preview build migrates main.
**How to avoid:** before the first push, Teo (1) leaves Preview branching unchecked, (2) checks which environments the integration injects into, and (3) sets Preview `DATABASE_URL` + `DATABASE_URL_UNPOOLED` to the `dev` branch strings. `scripts/migrate.ts` logs the masked endpoint host (`ep-…`) so the first build log proves the target.

### Pitfall 6: Concurrent migrations on `dev`
**What goes wrong:** a push triggers CI and the Vercel Preview at the same time. drizzle's `migrate()` reads the last applied migration, then applies, with no lock [VERIFIED: pg-core/dialect.js]. Two runners can both apply the same migration, and the second fails with "already exists" (red build, no corruption, because the neon-serverless migrator is transactional).
**How to avoid:** the advisory lock in `scripts/migrate.ts`. CI runs `pnpm db:migrate` before `pnpm check`, so a PR's new migration is applied before its build queries the new column.

### Pitfall 7: `process.loadEnvFile` / `--env-file` on a missing file
**What goes wrong:** both throw when `.env.local` is absent, which is the case on CI and Vercel.
**How to avoid:** guard with `existsSync`.

### Pitfall 8: Stale cookie redirect loop
See Pattern 5. Login only redirects to `/admin` after a valid `getSession()`.

### Pitfall 9: Uncached reads in page bodies
**What goes wrong:** a page calls `getProjectsCore` directly, and the build fails with an uncached-data-outside-Suspense error.
**How to avoid:** pages only call the cached wrappers. `generateStaticParams` may call the core.

### Pitfall 10: No `app/layout.tsx` → unmatched-URL 404
**What goes wrong:** with two root layouts, unmatched URLs fall back to Next's built-in 404 layout (`next/dist/client/components/builtin/layout.js` exists) [VERIFIED: installed]. `notFound()` inside `[locale]` uses `[locale]/not-found.tsx`.
**How to handle:** add a minimal `[locale]/not-found.tsx` now, because D-09 needs `notFound()`. The designed bilingual 404, `global-not-found` (experimental flag) and a `[locale]/[...rest]` catch-all belong to SITE-08 in phase 5. Do not add them now; they are routes.

### Pitfall 11: Writing `content/` on Vercel
**What goes wrong:** the function filesystem is read-only, so `exportContent()` would throw inside an admin action.
**How to avoid:** branch on `process.env.VERCEL` (Pattern 8).

### Pitfall 12: Exporting private tables to a public repo
**What goes wrong:** the repo is public. Exporting auth tables (password hashes) or contact_messages (phase 4 PII) would publish them.
**How to avoid:** allowlist the content tables in the exporter and test the allowlist.

### Pitfall 13: Vercel toolbar vs CSP on Previews
**What goes wrong:** the Preview toolbar and comments load from `vercel.live` (and related hosts). Report-Only only logs violations, but enforcing in a later phase would break the toolbar. The community allowlists disagree [LOW: community.vercel.com threads, gist].
**How to avoid:** keep Report-Only in phase 2. Add `https://vercel.live` to `script-src`/`connect-src`/`frame-src`/`img-src` only when `VERCEL_ENV === 'preview'`, or disable the toolbar for the project. Decide before switching to enforce.

### Pitfall 14: CSP details
- `upgrade-insecure-requests` is ignored in Report-Only (the browser warns), so leave it out until enforce.
- Dev needs `'unsafe-eval'` [CITED: content-security-policy.md].
- Without `report-to`/`report-uri`, violations only show in the browser console. A report endpoint would be a new route (ask Teo).

## Code Examples

### `next.config.ts` headers (Report-Only, no nonce)
```ts
// Source: node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md "Without Nonces"
const isDev = process.env.NODE_ENV === 'development';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",            // phase 3 adds https://*.public.blob.vercel-storage.com
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
].join('; ');
const security = [
  { key: 'Content-Security-Policy-Report-Only', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }, // no `preload` (one-way)
];
// headers(): [{ source: '/(.*)', headers: security }, { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
// also: poweredByHeader: false
```

### `site_settings.languages` (D-02, JSON Resume–compatible)
```ts
languages: jsonb('languages').$type<{ code: 'es' | 'en' | string; level: 'native' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' }[]>().notNull().default([]),
// seed: [{ code: 'es', level: 'native' }, { code: 'en', level: 'B2' }]
```
The display names ("Spanish", "Español") come from messages or `Intl.DisplayNames`. This shape is a recommendation, and the doc edit (D-02) fixes it [ASSUMED: exact shape; the FEATURES research suggested `[{language, fluency}]`].

### CI workflow (`.github/workflows/ci.yml`)
```yaml
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}            # Neon dev, pooled
      DATABASE_URL_UNPOOLED: ${{ secrets.DATABASE_URL_UNPOOLED }}
      BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }} # CI-only random value
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4        # reads package.json "packageManager"
      - uses: actions/setup-node@v5
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
      - run: pnpm check
```
Add `"packageManager": "pnpm@12.16.1"` and `"engines": { "node": "24.x" }` to package.json. Fork PRs don't receive secrets. Irrelevant for a single-author repo. Action major versions are [ASSUMED]; check the current tags when writing the file.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `setRequestLocale` + `params.locale` | `next/root-params` in `getRequestConfig` | Next 16.3 / next-intl 4.x | No per-page boilerplate. Locale reachable from shared code |
| `localeDetection:false` also disabled the cookie | Separate `localeCookie:false` | next-intl 4.0 | Must set both for "no detection, no cookie" |
| `@better-auth/cli` | `auth` package CLI | Better Auth 1.5+ | `pnpm dlx auth@<ver> generate` |
| static `baseURL` / env only | `baseURL: { allowedHosts, fallback, protocol }` | Better Auth 1.5+ | Per-request host resolution for Preview URLs |
| `middleware.ts` | `src/proxy.ts` (Node runtime) | Next 16 | `runtime` export throws |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `languages` jsonb shape `{code, level}[]` | Code Examples | Low. The doc edit fixes it before the migration (one-way after) |
| A2 | GitHub Action major versions (checkout@v5, setup-node@v5, pnpm/action-setup@v4) | CI | Low. Workflow fails fast |
| A3 | Toolbar CSP hosts (`vercel.live`…) | Pitfall 13 | Low while Report-Only |
| A4 | Vercel's Neon integration lets Teo override Preview DB vars by hand when preview branching is off | Pitfall 5 | Medium. If the vars are integration-managed and locked, disconnect Preview from the integration and add the vars manually |
| A5 | Root params count as prerender-known in pages under `[locale]` with `generateStaticParams` (no Suspense needed) | Pattern 4 | Medium. Signal 1 of the go/no-go verifies it on day 3 |
| A6 | Next's builtin 404 layout lets `next build` pass without `app/layout.tsx` | Pitfall 10 | Low. If the build errors, add a minimal `global-not-found` (needs a route decision) |

## Open Questions (RESOLVED)

Each question is owned by a plan:
- Q1 RESOLVED → 02-01 approval checkpoint, item A (D-02 doc line follows Teo's answer).
- Q2 RESOLVED → 02-01 approval checkpoint, item B; implemented in 02-06.
- Q3 RESOLVED → Claude's decision, logged in 02-04 (exportContent).
- Q4 RESOLVED → 02-01 item E (bio and freelance bullets); seed scope in 02-03/02-04 (skills not seeded, logged).
- Q5 RESOLVED → 02-01 item F; dashboard checkpoint in 02-09.

1. **Security bumps (Next 16.4.6, better-auth 1.7.25 + `auth` CLI at the same version).**
   - Known: both fix advisories that touch this exact setup.
   - Recommendation: add them to the single phase-start approval message. If Teo approves, D-02's doc line becomes `pnpm dlx auth@1.7.25 generate --output src/db/auth-schema.ts`. Tell Teo this, because D-02 quotes 1.7.14.
2. **Login brute-force storage.** Memory rate limiting is per serverless instance. `storage: 'database'` adds a Better Auth `rateLimit` table, which changes the data model.
   - Recommendation: phase 2 ships memory (default) plus HTTP-router login. Ask Teo in the same message whether he wants the `rateLimit` table now or wants to wait for Upstash in phase 4.
3. **Commit `content/*.json` to the public repo?** ARCHITECTURE.md says "committed". Draft projects (Inventario, Finanzas) are already public in `docs/content/`, so content tables add little new exposure.
   - Recommendation: commit only the allowlisted content tables, or gitignore `content/` if Teo prefers. Low stakes, and Claude can decide and log it.
4. **NOT NULL columns with no verified value.**
   - `site_settings.bio_en/bio_es`, `email` and `name` are NOT NULL. `name` ("Mateo Jaramillo") and `email` (mateojaras@gmail.com) are in PROJECT.md. For the bio, `docs/copy.md` §About holds text Teo accepted in G6 (draft-translation for EN).
   - `skills.category` is NOT NULL, but `docs/content` only lists stack names.
   - Recommendation: seed the bio from `docs/copy.md` About, marked draft, consistent with D-05's "draft-translation se siembra tal cual". Skip skills in phase 2 (no verified category). The freelance bullets in `docs/copy.md` (accepted G6) can be seeded, or left `[]` per a literal reading of D-05. Claude decides and logs it.
5. **Does the Vercel project already exist and is it linked to the GitHub repo?** `.vercel/` is absent locally. The Vercel CLI 59.4.0 is installed.
   - Recommendation: the first deploy task asks Teo to confirm the Git integration and to enable "system environment variables".

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | everything | ✓ | 24.22.1 | — |
| pnpm | everything | ✓ | 12.16.1 | — |
| `.env.local` (DATABASE_URL, DATABASE_URL_UNPOOLED for `dev`) | migrate, seed, build, dev | **✗ (file absent)** | — | **None, blocking.** Ask Teo per CLAUDE.md |
| BETTER_AUTH_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD | auth, seed | ✗ | — | Claude generates the secret command (`openssl rand -base64 32`, openssl 4.1 present). Teo picks the credentials |
| Vercel CLI | optional env pull / inspect | ✓ | 59.4.0 | Dashboard |
| gh CLI | setting repo secrets (`gh secret set`) | ✓ | 2.101.0 | GitHub UI |
| psql | manual DB inspection | ✓ | 14.18 | Drizzle Studio |
| Playwright browsers | e2e login/public | ✓ | chromium-1248 | — |
| neonctl | — | ✗ | — | Neon console (not needed) |
| slopcheck | audit | ✓ | — | — |

**Missing with no fallback:** `.env.local` with the Neon `dev` strings. The first DB-dependent task must stop and request: (1) Neon console → branch `dev` → Connect → copy the pooled and unpooled strings; (2) put them in `.env.local` as `DATABASE_URL`/`DATABASE_URL_UNPOOLED`; (3) Vercel → Settings → Environment Variables: Preview = dev strings, Production = main strings; Preview branching off; system env vars on; (4) GitHub repo secrets `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (dev) and `BETTER_AUTH_SECRET` (CI-only value).

## Security Domain

ASVS Level 1, `security_block_on: high`.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth email+password, `disableSignUp`, scrypt hashing, router rate limit on `/sign-in` |
| V3 Session Management | yes | Better Auth DB sessions (httpOnly, `__Secure-` on https), cookie cache off, `signOut` revokes |
| V4 Access Control | yes | `requireSession()` in AuthGate, loaders and actions; `requireSessionForRequest()` for handlers; proxy is optimistic only |
| V5 Input Validation | yes | Zod 4 on the login (client + Better Auth server validation), seed content via `content-schema.ts`, locale via `hasLocale` |
| V6 Cryptography | yes (secrets) | `BETTER_AUTH_SECRET` ≥32 chars random; never committed |
| V14 Config | yes | Static CSP (Report-Only), HSTS, nosniff, frame-ancestors, `X-Robots-Tag` on /admin, `poweredByHeader: false` |

### Known Threat Patterns

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Proxy bypass (forged cookie) | Elevation | Server-side `getSession` in gate and actions; e2e with a forged `better-auth.session_token` cookie |
| Login brute force | Spoofing | HTTP-router rate limit (3/10 s); database storage optional (OQ2) |
| CSRF via trusted origins wildcard | Tampering | `allowedHosts` built from `VERCEL_*` + localhost only |
| Cross-locale cache disclosure | Info disclosure | Next ≥16.4.5; locale-agnostic cached queries |
| Secrets/hashes in public repo | Info disclosure | `.env*` gitignored (already); export allowlist excludes auth tables |
| Preview build migrating `main` | Tampering | Preview vars → dev; migrate logs the endpoint host; never `push` |

## Validation

`workflow.nyquist_validation` is `false`, so this file has no Validation Architecture section. The verification items the planner still needs:
- `vitest.config.ts`: alias `server-only`, and add `environment: 'jsdom'` per-file (`// @vitest-environment jsdom`) for the login form test.
- `playwright.config.ts` + `e2e/`: neither exists yet. Add a `test:e2e` script, plus `webServer: pnpm build && pnpm start` with `.env.local` loaded.
- e2e (local, not CI, because the admin credentials live only in `.env.local`): (a) login → reload → still in → logout → `/admin` redirects; (b) forged cookie on `/admin`: no admin content, redirect to login; (c) `/`, `/es`, `/projects/<slug>`, `/es/proyectos/<slug>` show the DB titles; `/` with `Accept-Language: es` stays English; a draft slug returns 404.
- Unit tests:
  - `requireSession` / `requireSessionForRequest` with mocked `auth.api.getSession` (null → redirect / 401)
  - content serialize/deserialize round trip and the export table allowlist
  - seed row mapping (pending → null, permission → status)
  - `routing` pathnames
  - `messages` parity (existing test)
- Missing package scripts: `db:generate`, `db:migrate`, `db:studio`, `seed`, `export:content`, `test:e2e` (CLAUDE.md lists them).

## Sources

### Primary (HIGH confidence)
- Installed sources:
  - `better-auth@1.7.14` dist: `utils/url.mjs`, `context/helpers.mjs`, `context/create-context.mjs`, `db/internal-adapter.mjs`, `api/index.mjs`, `api/rate-limiter/index.mjs`, `cookies/index.mjs`
  - `@better-auth/core` `types/init-options.d.mts`, `utils/ip.mjs`
  - `next-intl@4.14.9` `server/react-server/getConfig.js`, `getRequestConfig.d.ts`
  - `drizzle-orm@0.45.4` `pg-core/dialect.js`, `neon-http/{migrator,session}.js`, `neon-serverless/migrator`
  - `@neondatabase/serverless@1.2.0` index.mjs
- Bundled Next 16.4.3 docs: `next-root-params.md`, `authentication-with-cache-components.md`, `draft-mode.md` (guide + API), `generate-static-params.md`, `dynamic-routes.md`, `content-security-policy.md`, `proxy.md`, `not-found.md`, `instant.md`
- npm registry (`npm view`, 2026-11-15): versions, repos, postinstall, `server-only` exports, release times
- https://nextjs.org/blog/november-2026-security-release (advisories, fixed 16.4.5)
- https://better-auth.com/blog/security-release-2026-11-03 (fixed 1.7.16)
- https://vercel.com/docs/environment-variables/system-environment-variables

### Secondary (MEDIUM confidence)
- Context7 `/amannn/next-intl/v4.14.9`: routing config, `localeCookie`, middleware composition, matcher
- https://next-intl.dev/blog/nextjs-root-params: request.ts override pattern, multiple root layouts fallback, caveats
- Context7 `/better-auth/better-auth/v1.7.15`: CLI generate flags
- Context7 `/drizzle-team/drizzle-orm-docs`: batch, drizzle.config
- https://neon.com/docs/guides/vercel-native-integration-previews and https://neon.com/docs/guides/vercel-native-integration: preview branching toggle, injected vars override Preview vars

### Tertiary (LOW confidence)
- https://community.vercel.com/t/vercel-toolbar-with-strict-csp/471, https://gist.github.com/piraka9011/aa0910877644ca5c18aeeb665a68646d: toolbar CSP hosts
- https://www.buildmvpfast.com/blog/nextjs-november-2026-security-release-cache-leak: secondary summary of the advisories

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Registry checked, and the security advisories come from the official blogs.
- Architecture: HIGH. Root params, Draft Mode, Better Auth host resolution and the rate-limit path were read in the installed source. A5 is checked on day 3.
- Pitfalls: HIGH for code-level items, MEDIUM for the Vercel/Neon dashboard behavior (A4).

**Research date:** 2026-11-15
**Valid until:** 2026-11-29. Next and Better Auth ship patches weekly; re-check `npm view next version` and `better-auth` before installing.
