# Stack Research

**Domain:** Bilingual (en/es) developer portfolio with a custom admin panel and a generated PDF résumé, on Next.js 16.4 App Router
**Researched:** 2026-10-29
**Confidence:** HIGH overall. Versions were checked against the npm registry today and against the installed `node_modules`. Integration patterns come from the docs bundled in `node_modules/next/dist/docs/`, from Context7, and from reading the installed package sources. Lower-confidence items are marked inline.

> **Scope note.** The owner fixed the stack (CLAUDE.md, PROJECT.md). This document checks it and makes it prescriptive. It does not reopen the choices. Every library in the fixed list is compatible with Next 16.4.3 + React 19.3; none has a blocking issue. The flagged items below are configuration traps, missing direct dependencies, and two stale references in the docs. None of them needs a replacement library.

## Verdict per library (TL;DR)

| Library | Installed | Latest (npm, 2026-10-29) | Status | Confidence |
|---|---|---|---|---|
| next | 16.4.3 | 16.4.3 | OK. Latest stable. Includes the fix for CVE-2026-103004 (root-params cache-key leak, 16.3.0–16.3.7) | HIGH |
| react / react-dom | 19.3.0 (exact pin) | **19.3.1** | **Bump to 19.3.1** (patch). It shipped 2026-10-14 together with backports 19.0.9 / 19.1.10 / 19.2.9, which is the pattern of a security release. Ask Teo first (dependency change) | MEDIUM (I could not confirm the advisory text) |
| typescript | 5.9.3 (`^5`) | 7.0.2 (Go-native) | **Stay on 5.9.** TS 7 is a major. The `next` TS language-service plugin in tsconfig is a JS plugin and is not confirmed to work with tsgo | MEDIUM |
| tailwindcss + @tailwindcss/turbopack | 4.3.3 | 4.3.3 | OK. The scaffold uses the Turbopack loader rule in `next.config.ts`, not PostCSS | HIGH |
| shadcn (CLI) + @base-ui/react | 4.23.0 / 1.9.0 | same | OK. Style `base-nova` = shadcn on **Base UI**, not Radix. `cn` comes from the `cn` package, not clsx + tailwind-merge | HIGH |
| drizzle-orm / drizzle-kit | 0.45.4 / 0.31.11 | same (1.0 is still `rc.5`) | OK. **Do not adopt 1.0 RC** | HIGH |
| @neondatabase/serverless | 1.2.0 | 1.2.0 | OK. Use with `drizzle-orm/neon-http` | HIGH |
| better-auth | 1.7.14 | 1.7.14 | OK. Peer range includes next ^16 and drizzle-orm ^0.45.2. **CLI moved to the `auth` package** | HIGH |
| next-intl | 4.14.9 | 4.14.9 | OK. Supports `next/root-params` natively (no `setRequestLocale`) | HIGH |
| @tiptap/react + starter-kit | 3.32.0 | 3.32.1 | OK. **`@tiptap/pm` and `@tiptap/static-renderer` must be direct deps** | HIGH |
| @vercel/blob | 2.8.2 | 2.8.2 | OK. Create the store as **Public** | HIGH |
| @react-pdf/renderer | 4.9.0 | 4.9.0 | OK. Already in Next's default `serverExternalPackages`. Static TTF fonts only | HIGH |
| gsap + @gsap/react | 3.15.0 / 2.1.2 | same | OK. All plugins (SplitText, ScrollTrigger) are free and ship in the public npm package | HIGH |
| motion | 14.7.1 | 14.8.0 | OK. Import from `motion/react` (or `motion/react-m` with `LazyMotion`). 13.0 and 14.0 have no breaking changes that affect this project | HIGH |
| react-hook-form + @hookform/resolvers | 7.91.0 / 6.0.2 | same | OK. Resolvers v6's only breaking change is Effect v4. `zodResolver` with Zod 4 is unchanged | HIGH |
| zod | 4.6.7 | 4.6.7 | OK | HIGH |
| @tanstack/react-table | 9.3.1 | 9.3.1 | OK, but **v9 API**: `useTable` + `tableFeatures`. shadcn's DataTable recipe is v8 and must be translated | HIGH |
| @dnd-kit/core + sortable | 6.3.1 / 10.0.0 | same | OK. Legacy line (no release since Dec 2024) but stable on React 19. **`@dnd-kit/utilities` must be a direct dep**. Do not move to `@dnd-kit/react` 0.5 (pre-1.0) | MEDIUM |
| resend | 6.35.0 | 6.35.0 | OK. Use `text`/`html`. The `react:` prop needs `@react-email/render` (not installed) | HIGH |
| @upstash/ratelimit + redis | 2.2.0 / 1.40.0 | same | OK. `Redis.fromEnv()` reads `UPSTASH_REDIS_REST_*` **or** `KV_REST_API_*` | HIGH |
| vitest + @vitejs/plugin-react + jsdom | 5.0.5 / 6.1.2 / 30.1.3 | same | OK (Vite 8.3.5 resolved). Async Server Components cannot be unit-tested | HIGH |
| @testing-library/react | 16.3.3 | same | OK. **`@testing-library/dom` must be a direct dep** (peer, not importable under pnpm) | HIGH |
| @playwright/test | 1.64.1 | same | OK. Add `@axe-core/playwright` for the axe gate | HIGH |
| @biomejs/biome | 2.4.2 (exact) | 2.6.4 | OK. Optional minor bump; update the `$schema` URL with it | HIGH |
| babel-plugin-react-compiler | 1.0.0 | 1.0.0 | OK. Keep Babel. The experimental Rust compiler (`turbopackRustReactCompiler`) is not needed | HIGH |
| @types/node | 20.19 (`^20`) | 26.x | **Bump to `^24`**: local Node is 24.22, and vitest 5 peer wants `^22 \|\| >=24` | HIGH |

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js (App Router, Turbopack) | 16.4.3 | Framework, routing, RSC, caching, Server Actions, `proxy.ts` | Single deploy for site + admin + PDF + JSON Resume. `cacheComponents` gives a static shell per locale with tag invalidation from the admin, so there is no redeploy. Bundled docs in `node_modules/next/dist/docs/` are authoritative for 16.4 |
| React | 19.3.1 | UI runtime | Required by Next 16.4. Patch bump over the pinned 19.3.0 |
| TypeScript | 5.9.x (strict) | Types | Stable with the `next` TS plugin and `next typegen` (types for `next/root-params`, `PageProps`, `LayoutProps`). TS 7 is post-v1 |
| Tailwind CSS v4 + `@tailwindcss/turbopack` | 4.3.3 | Styling via CSS-first `@theme` tokens | OKLCH tokens live in `globals.css`. No JS config. Biome's `tailwindDirectives` parser is already on |
| shadcn/ui (style `base-nova`, Base UI primitives) | CLI 4.23.0, @base-ui/react 1.9.0 | Admin and form primitives with a custom theme | Components are copied into the repo, so they can be re-themed to the "workshop logbook" direction. Base UI is accessible and unstyled |
| Drizzle ORM + drizzle-kit | 0.45.4 / 0.31.11 | Schema, typed queries, migrations | SQL-first and lightweight. The `neon-http` driver is fetch-based, so it works anywhere, including inside `'use cache'` scopes |
| Neon Postgres via `@neondatabase/serverless` | 1.2.0 | Database (branches `main` and `dev`) | Already provisioned from Vercel. The HTTP driver means no connection pooling problems on serverless |
| Better Auth | 1.7.14 | Single-admin email+password auth | First-class Drizzle adapter, `nextCookies` plugin, cookie helper for `proxy.ts`, `disableSignUp` |
| next-intl | 4.14.9 | i18n routing (`/` en, `/es` es, localized pathnames), messages, formatting | Native `next/root-params` support since Next 16.3, so `'use cache'` functions can read the locale and it becomes part of the cache key |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tiptap/react + @tiptap/starter-kit + **@tiptap/pm** | 3.32.x (align all `@tiptap/*` to one exact version) | Rich-text editor in the admin (`case_study_*`, `now_*`) | Admin only, in a client component. Never import on public routes |
| **@tiptap/static-renderer** | 3.32.x | Render stored Tiptap JSON to React on the server | Public case studies and `/now`. Ships zero ProseMirror JS, which protects the Lighthouse ≥ 95 budget |
| @vercel/blob | 2.8.2 | Images and CV PDFs | Admin uploads (client upload + `handleUpload`). PDF upload from a Server Action with `put()` |
| @react-pdf/renderer | 4.9.0 | CV PDF en/es from DB data | Server-side only (`renderToBuffer`) in a Node-runtime Server Action or Route Handler |
| motion | 14.x | Enter/exit, layout, staggered reveal | `motion/react-m` + `LazyMotion` + `domAnimation` to keep the bundle small |
| gsap + @gsap/react | 3.15.0 / 2.1.2 | 1–2 scrubbed scenes (ScrollTrigger), SplitText headings | Only inside `src/components/motion/`, client components, `useGSAP` |
| react-hook-form + @hookform/resolvers + zod | 7.91 / 6.0.2 / 4.6.7 | Admin forms with client validation | The same Zod schema in `validation.ts` runs on the client (resolver) and in the Server Action |
| @tanstack/react-table | 9.3.1 | Admin lists (projects, skills, experience, messages) | v9 API only (`useTable`, `tableFeatures`) |
| @dnd-kit/core + @dnd-kit/sortable + **@dnd-kit/utilities** | 6.3.1 / 10.0.0 / 3.2.x | Drag-to-reorder (`order` column) | Admin lists. Pair with keyboard sensor and up/down buttons for a11y |
| resend | 6.35.0 | Contact form notification email | Phase 4. Plain `text` body, `replyTo` = sender |
| @upstash/ratelimit + @upstash/redis | 2.2.0 / 1.40.0 | Rate limit on the contact Server Action | Phase 4. `slidingWindow` keyed by hashed IP |
| lucide-react | 1.63.0 | Icons (admin) | Already installed by shadcn. Never icons-in-rounded-tiles (DESIGN rule) |
| tw-animate-css | 1.4.0 | Keyframes used by shadcn overlays | Keep. It is shadcn infrastructure, not an effects library |
| **server-only** | latest | Guard DAL/auth/db modules | `import 'server-only'` in `src/lib/auth.ts`, `src/db/index.ts`, DAL. Not needed in files that import `next/root-params` |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm 12.16 | Package manager | **Strict node_modules**: transitive and auto-installed peer deps (`@tiptap/pm`, `@dnd-kit/utilities`, `@testing-library/dom`) are NOT importable from app code. Add them as direct deps. `sharp: false` in `allowBuilds` is fine (sharp ≥0.33 uses prebuilt `@img/*` binaries; Vercel optimizes images itself) |
| Biome 2.x | Lint + format (`next` and `react` domains already on) | Replaces `next lint` (removed in 16) |
| Vitest 5 + RTL 16 + jsdom 30 | Unit/component tests | Test sync components, Zod schemas, `localized()`, actions' pure logic. Async RSC goes to Playwright |
| Playwright 1.64 + `@axe-core/playwright` 4.14 | E2E (login, project CRUD, contact) + axe gate | Run against `next build && next start` with a seeded Neon `dev` branch |
| `auth` CLI (Better Auth) 1.7.14 | Generate Better Auth Drizzle tables | `pnpm dlx auth@1.7.14 generate --output src/db/auth-schema.ts`. **Not** `@better-auth/cli` (frozen at 1.4.22) |
| tsx 4.x | Run `scripts/seed.ts` / `scripts/export-content.ts` with `@/` path aliases | `tsx --env-file=.env.local scripts/seed.ts`. Node 24's native type-stripping does not resolve tsconfig `paths` |
| drizzle-kit | `db:generate`, `db:migrate`, `db:studio` | Load env with Node 24's `process.loadEnvFile('.env.local')` in `drizzle.config.ts` (no dotenv needed). Migrate with `DATABASE_URL_UNPOOLED` |

## Exact Integration Configuration

### 1. `next.config.ts` (target shape)

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isDev = process.env.NODE_ENV === 'development';

// No nonce: nonce CSP forces dynamic rendering and kills the static shell (Next CSP guide).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.public.blob.vercel-storage.com",
  "font-src 'self'",
  "connect-src 'self' https://*.public.blob.vercel-storage.com https://vercel.com", // blob client uploads; extend for analytics in phase 5
  "frame-src https://cal.com",           // only if Cal embed is used; a plain link needs nothing
  "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,      // already in scaffold; requires cacheComponents
  reactCompiler: true,
  typedRoutes: true,             // optional, cheap safety for the 4 routes
  turbopack: { rules: { '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' } } },
  // @react-pdf/renderer is already in Next's built-in serverExternalPackages list;
  // listing it is harmless and documents intent.
  serverExternalPackages: ['@react-pdf/renderer'],
  outputFileTracingIncludes: {
    '/admin/**': ['./assets/fonts-pdf/**/*.ttf'],   // Server Action that renders the CV
    '/api/resume/**': ['./assets/fonts-pdf/**/*.ttf'], // if a route handler renders it instead
  },
  images: { remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }] },
  experimental: { globalNotFound: true }, // needed because there is no single root layout (see 3)
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]}];
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
```
Confidence: HIGH for options (verified in bundled docs: `serverExternalPackages.md`, `output.md`, `not-found.md`, `content-security-policy.md`). MEDIUM for the exact CSP host list. Verify it in the browser console once Blob, Cal and analytics exist.

### 2. next-intl with `next/root-params` + `cacheComponents`

**File layout (multiple root layouts, no `app/layout.tsx`):**
```
src/app/
  [locale]/layout.tsx           ← root layout #1 (<html lang>), generateStaticParams → en, es
  [locale]/(site)/page.tsx, projects/[slug]/page.tsx, about/…, contact/…, now/…
  admin/layout.tsx              ← root layout #2 (<html lang="es">), unlocalized
  admin/login/page.tsx
  admin/(panel)/layout.tsx      ← session guard inside <Suspense>
  api/auth/[...all]/route.ts    ← Better Auth
  api/blob/upload/route.ts      ← Blob client-upload token
  resume.json/route.ts          ← JSON Resume
  global-not-found.tsx
```
Delete the scaffold's `src/app/layout.tsx` and `src/app/page.tsx`. A pass-through root layout would stop `[locale]` from being a root param. With two root layouts, `locale()` is typed `string | undefined`.

```ts
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',        // "/" = en, "/es" = es
  localeDetection: false,           // "/" must always be English (SEO/hreflang); no cookie redirects
  pathnames: {
    '/': '/',
    '/projects/[slug]': { en: '/projects/[slug]', es: '/proyectos/[slug]' },
    '/about': { en: '/about', es: '/sobre-mi' },
    '/contact': { en: '/contact', es: '/contacto' },
    '/now': '/now',
  },
});
```
```ts
// src/i18n/request.ts
import * as rootParams from 'next/root-params';
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {                              // explicit override wins (Server Actions, admin, route handlers)
    const param = await rootParams.locale();
    if (hasLocale(routing.locales, param)) locale = param; else notFound();
  }
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
```
Rules:
- No `setRequestLocale` anywhere (unnecessary with root params). `generateStaticParams` in `[locale]/layout.tsx` is **required** with Cache Components.
- Inside `'use cache'` functions, read the locale with `await locale()` from `next/root-params`. Only the root params a cached function actually reads go into its key. For translations inside cached scopes, prefer `getTranslations({ locale, namespace })` with the explicit value.
- **Root params are unavailable in Server Actions and Route Handlers.** The contact action must receive `locale` as an argument (`action.bind(null, locale)` or a hidden field validated by Zod). `/resume.json` and the admin must call `getTranslations({ locale: 'es' | 'en', … })` explicitly.
- `dynamicParams = false` does not work with Cache Components. Validate slugs at runtime with `notFound()`.
- The admin is outside `[locale]`. Decide once (log it in `docs/decisions.md`): admin UI in Spanish via explicit `locale: 'es'`, with strings still in `messages/es.json`.

Confidence: HIGH (next-intl 4.14.9 docs via Context7, next-intl root-params blog, bundled `next-root-params.md`).

### 3. `proxy.ts` (one file: i18n + optimistic admin gate)

```ts
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getSessionCookie } from 'better-auth/cookies';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    return getSessionCookie(req) ? NextResponse.next()
      : NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return intl(req);
}

export const config = {
  // exclude api, Next internals, Vercel internals, files with extensions (incl. resume.json)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```
Proxy runs on the Node.js runtime by default in 16 (setting `runtime` there throws). It only checks that the cookie **exists**. Real validation is `auth.api.getSession()` (see 4).

### 4. Better Auth (single admin, signup disabled)

```ts
// src/lib/auth.ts
import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle'; // re-exports @better-auth/drizzle-adapter
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }), // transaction defaults to false → neon-http OK
  emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12 },
  trustedOrigins: [process.env.NEXT_PUBLIC_SITE_URL!, process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`].filter(Boolean) as string[],
  plugins: [nextCookies()], // must be LAST
});
```
```ts
// src/app/api/auth/[...all]/route.ts
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';
export const { GET, POST } = toNextJsHandler(auth);
```
- **Schema generation:** `pnpm dlx auth@1.7.14 generate --output src/db/auth-schema.ts`, then re-export it from `src/db/schema.ts` and run `pnpm db:generate`. `docs/data-model.md` line 144 says `npx @better-auth/cli generate`. That package is frozen at 1.4.22 and should not be used against 1.7. Fixing the doc touches `docs/data-model.md`, so ask Teo first.
- **Creating the one admin with signup disabled:** in `scripts/seed.ts`, use `const ctx = await auth.$context; const hash = await ctx.password.hash(pw); const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true }); await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: 'credential', accountId: user.id, password: hash });`. Read the email and password from env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) used only by the seed. Never commit them. (Verified: `createUser` and `linkAccount` exist on the 1.7.14 internal adapter types.) Confidence MEDIUM. This is an internal API, so wrap it in one helper.
- **Session checks with Cache Components:** reading `headers()`/`cookies()` must sit inside a `<Suspense>` boundary, or the route gets the blocking-route insight and the shell is held. Implement "validation in `admin/layout.tsx`" as `admin/(panel)/layout.tsx` → `<Suspense fallback={<AdminSkeleton/>}><AdminGate>{children}</AdminGate></Suspense>`, where `AdminGate` calls `requireSession()` (`auth.api.getSession({ headers: await headers() })` → `redirect('/admin/login')`). Layout checks are not enough on their own: every Server Action **and** every admin data loader calls `requireSession()` (DAL pattern from Next's auth guide). The admin is fully dynamic, so `export const instant = false` on `admin/(panel)/layout.tsx` is acceptable to silence instant-navigation validation.
- **Env:** `BETTER_AUTH_SECRET` (`openssl rand -base64 32`). Set `BETTER_AUTH_URL` for Production only. On Preview, Better Auth infers the URL from the request, and `trustedOrigins` covers the branch URL. Confidence MEDIUM. Verify login on the first Vercel preview (phase 2 gate).

### 5. Drizzle + Neon driver choice

**Use `drizzle-orm/neon-http` as the only runtime driver.** One HTTP round-trip per query, no sockets or pools. It works inside `'use cache'`, Server Actions, and Route Handlers on Vercel. For multi-statement writes that must be atomic (project + `project_skills` replace, bulk `order` updates), use `db.batch([...])`, which runs as one non-interactive transaction. Do not use `db.transaction()`: it is unsupported on neon-http. If an interactive transaction (read-then-write) ever becomes necessary, add a second `neon-serverless` `Pool` client for that action only.

```ts
// src/db/index.ts
import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
export const db = drizzle({ client: neon(process.env.DATABASE_URL!), schema });
```
```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
process.loadEnvFile?.('.env.local');            // Node 24 built-in; no dotenv dependency
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
  strict: true, verbose: true,
});
```
- The data model already names every column explicitly (`text('title_en')`), so **do not** also set `casing: 'snake_case'`. Pick one mechanism.
- `text(...).array()`, `jsonb().$type<>()`, `pgEnum`, `$onUpdate` are all supported in 0.45.4.
- `drizzle-kit` bundles its own `ws`, so no extra package is needed for migrations against Neon.
- Make sure Vercel **Preview** uses the Neon `dev` branch and only **Production** uses `main`. Check the Neon–Vercel integration's branch settings.

Confidence: HIGH.

### 6. Tiptap (admin editor + server rendering)

```tsx
// src/features/projects/components/case-study-editor.tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
export function CaseStudyEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: value,
    immediatelyRender: false,               // REQUIRED under SSR, avoids hydration mismatch
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });
  return <EditorContent editor={editor} />;
}
```
```tsx
// src/components/site/rich-text.tsx (Server Component)
import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import StarterKit from '@tiptap/starter-kit';
export function RichText({ doc }: { doc: JSONContent }) {
  return renderToReactElement({ extensions: [StarterKit], content: doc,
    options: { nodeMapping: { /* map paragraph/heading to design-system elements */ } } });
}
```
- Keep **one shared extensions list** (`src/lib/tiptap-extensions.ts`) for both editor and renderer. A mismatch silently drops nodes.
- Use `useEditorState` for toolbar active states (Tiptap 3 doesn't re-render on every transaction by default).
- Validate stored JSON with a Zod schema (`type: 'doc'`, `content: array`) in the Server Action before writing.
- The `/static-renderer/pm/react` entry needs `@tiptap/pm`. If it gives trouble in RSC, `@tiptap/static-renderer/react` is the PM-free variant (MEDIUM; both entries are documented).

Confidence: HIGH for `immediatelyRender`, MEDIUM for the exact static-renderer entry point.

### 7. @react-pdf/renderer (CV en/es)

- Render **server-side only** with `renderToBuffer(<ResumeDocument …/>)` in an admin Server Action ("Generate CV" → `put('resume/en/v{n}.pdf', buffer, { access: 'public', contentType: 'application/pdf' })` → insert `resume_versions` → `updateTag(tags.resume)`). Pre-generating to Blob means public visitors never pay render cost.
- `@react-pdf/renderer` is **already** in Next's built-in `serverExternalPackages` list (verified in the bundled docs). The explicit entry in `next.config.ts` is harmless.
- **Fonts:** `Font.register({ family: 'Hanken Grotesk', fonts: [{ src: path.join(process.cwd(), 'assets/fonts-pdf/HankenGrotesk-Regular.ttf') }, { src: …-Bold.ttf, fontWeight: 700 }, { src: …-Italic.ttf, fontStyle: 'italic' }] })`. Use **static TTF** instances, not WOFF2 (unsupported) and not variable fonts (fontkit renders only the default instance). Google Fonts' download ZIPs include `static/` folders for Hanken Grotesk and Geist Mono. Confirm one exists for Funnel Display. If not, instance it with `fonttools varLib.instancer` (MEDIUM). Include the files in the trace with `outputFileTracingIncludes` (see 1). Static TTFs with the Latin subset cover á é í ó ú ü ñ ¿ ¡, which is the phase 3 gate.
- Disable hyphenation for Spanish names: `Font.registerHyphenationCallback((w) => [w])`.
- Do not use `PDFViewer`/`PDFDownloadLink` (client-side, heavy). Link to the Blob URL.

Confidence: HIGH (compat: React 19 supported since 4.1; externals verified).

### 8. Vercel Blob

- **Create the store with Public access** (access is per store and encoded in the hostname `<id>.public.blob.vercel-storage.com`). Portfolio images and the CV must be publicly readable.
- Admin image uploads: **client upload**. The browser calls `upload(pathname, file, { access: 'public', handleUploadUrl: '/api/blob/upload' })`. The route handler calls `handleUpload({ onBeforeGenerateToken })`. Inside `onBeforeGenerateToken`, **call `requireSession()`** and restrict `allowedContentTypes: ['image/avif','image/webp','image/jpeg','image/png']` and `maximumSizeInBytes`. This bypasses the 4.5 MB function body limit and the 1 MB Server Action default.
- Do **not** rely on `onUploadCompleted` to persist URLs: Vercel cannot call back to `localhost`. Take `blob.url` from the `upload()` result and save it through the entity's Server Action.
- `addRandomSuffix` and `allowOverwrite` default to `false` in v2. Use versioned paths (`resume/es/v3.pdf`) instead of overwriting, because the CDN caches Blob URLs (default max-age 1 month).
- Phase 3 env: `BLOB_READ_WRITE_TOKEN`.

Confidence: HIGH.

### 9. Motion + GSAP

- **Motion** (`motion` 14.x): import from `motion/react`. For the public site, use `LazyMotion features={domAnimation}` + `m.*` from `motion/react-m` to keep the initial JS small. Respect reduced motion with `<MotionConfig reducedMotion="user">`. 13.0 only changed `@emotion/is-prop-valid` handling and 14.0 has no breaking changes, so neither affects this project.
- **GSAP** 3.15: since 3.13 every plugin (SplitText, ScrollTrigger, MorphSVG…) is free under the "Standard no-charge license" and ships in the public `gsap` npm package (verified: `node_modules/gsap/SplitText.js`). The only prohibited use is building visual no-code animation builders that compete with Webflow, which a portfolio is not.
  ```tsx
  'use client'; // src/components/motion/scrub-scene.tsx
  import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import { SplitText } from 'gsap/SplitText';
  import { useGSAP } from '@gsap/react';
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  // inside component: useGSAP(() => { const mm = gsap.matchMedia(); mm.add('(prefers-reduced-motion: no-preference)', () => { … }); }, { scope: ref });
  ```
  SplitText: use `SplitText.create(el, { type: 'lines,words', aria: 'auto', autoSplit: true, onSplit: self => … })`. `aria: 'auto'` keeps headings readable to screen readers. `autoSplit` re-splits after fonts load or resize. `useGSAP` reverts DOM changes on unmount, so there are no hydration leftovers.
- Load GSAP only in the client components that use it. Never import it from a shared layout, so it stays out of every route's bundle.

Confidence: HIGH.

### 10. Forms: React Hook Form + Zod 4

- `zodResolver` from `@hookform/resolvers/zod` (v6 is unchanged for Zod). When schemas transform or coerce, type the form as `useForm<z.input<typeof S>, unknown, z.output<typeof S>>`.
- Under the React Compiler, use `useWatch` / `useFormState`, not `watch()` / `formState` destructuring outside render paths. Compiler memoization can otherwise hide updates (MEDIUM).
- The Server Action re-parses with the **same** schema (`validation.ts`) and returns `{ fieldErrors }` from `z.flattenError` / `z.treeifyError` (Zod 4 APIs).

### 11. TanStack Table v9 (not v8)

shadcn's DataTable docs and most examples are v8 (`useReactTable`, `getCoreRowModel`). In 9.3.1:
```ts
import { useTable, tableFeatures, rowSortingFeature, createSortedRowModel, sortFn_text, createColumnHelper, FlexRender } from '@tanstack/react-table';
const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns: { text: sortFn_text } });
const col = createColumnHelper<typeof features, ProjectRow>();
const table = useTable({ features, columns, data });   // no getCoreRowModel; state via table.state
```
Built on TanStack Store, so it works correctly with the React Compiler (v8 needed `'use no memo'`). `useLegacyTable` exists only as a migration shim. Do not use it.

Confidence: HIGH (official v9 migration guide).

### 12. dnd-kit (reorder)

`DndContext` + `SortableContext` + `useSortable` + `CSS.Transform.toString` from **`@dnd-kit/utilities`** (direct dep needed under pnpm). Add `KeyboardSensor` with `sortableKeyboardCoordinates` and visible up/down buttons as the WCAG-friendly fallback. Persist with one Server Action that writes all `order` values in a single `db.batch()`. Do not migrate to `@dnd-kit/react` (0.5.x, pre-1.0).

### 13. Contact: Resend + Upstash (phase 4)

```ts
// in features/contact/actions.ts ('use server')
const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(3, '10 m'), prefix: 'rl:contact' });
const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
const ipHash = sha256(ip + process.env.BETTER_AUTH_SECRET);  // never store raw IP
const { success } = await ratelimit.limit(ipHash);
// honeypot field must be empty; Zod-parse; insert contact_messages; then:
await resend.emails.send({ from: 'mateojaras.dev <contact@mateojaras.dev>', to: process.env.CONTACT_TO_EMAIL!, replyTo: data.email, subject, text });
```
- `Redis.fromEnv()` accepts `UPSTASH_REDIS_REST_URL/TOKEN` **and** `KV_REST_API_URL/TOKEN`. The latter are the names you get when Upstash is provisioned through the Vercel Marketplace. Verified in the installed source.
- Resend needs `mateojaras.dev` verified (SPF/DKIM records in Porkbun). Start DNS on day 1 of phase 4, because propagation can take hours.
- The action receives `locale` explicitly (root params are not available in Server Actions).
- Keep everything behind env checks with a clear message until keys exist (CLAUDE.md rule).

### 14. Testing

```ts
// vitest.config.mts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },          // Vite 8 native; else add vite-tsconfig-paths
  test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], include: ['src/**/*.test.{ts,tsx}'] },
});
```
- `vitest.setup.ts`: `import '@testing-library/jest-dom/vitest'`.
- Async Server Components are not supported by Vitest (Next docs). Cover them with Playwright.
- Playwright `webServer: { command: 'pnpm build && pnpm start', env: { DATABASE_URL: <dev branch> } }`. Add `@axe-core/playwright` for the "no serious/critical" gate.
- `resolve.tsconfigPaths` in Vite 8 is MEDIUM confidence. If it errors, use `vite-tsconfig-paths` 6.1.1 (Next's official Vitest guide uses it).

### 15. Fonts and theme (no new dependency)

- `next/font/google` has all three families with `latin` + `latin-ext` subsets (verified in the bundled `font-data.json`): `Funnel_Display` (wght 300–800 variable), `Hanken_Grotesk` (100–900), `Geist_Mono` (100–900). Latin covers Spanish. Load them in **each** root layout (`[locale]` and `admin`).
- Light by default, dark from system preference, plus a toggle with View Transitions: use an inline `<script>` in `<head>` that sets `.dark` before paint (Next's "Preventing flash before hydration" guide pattern, with the `type` swap trick to avoid React's script warning), and `document.startViewTransition()` in the toggle's click handler. **Do not add `next-themes`**: it isn't in the fixed stack, and the inline-script pattern is the documented first-party approach. Use the same inline-script pattern for any "local time now" in the hero status line. A server-rendered clock would break the static shell or cause hydration mismatches.

## Installation

Every addition below needs Teo's approval first (CLAUDE.md: ask before adding or changing dependencies). They are listed so the roadmap can ask once, in phase 2.

```bash
# Patch bump (security-pattern release)
pnpm add react@19.3.1 react-dom@19.3.1

# Missing direct deps (pnpm strict: currently NOT importable although present transitively)
pnpm add @tiptap/pm@3.32.1 @tiptap/static-renderer@3.32.1 @tiptap/react@3.32.1 @tiptap/starter-kit@3.32.1
pnpm add @dnd-kit/utilities server-only

# Dev
pnpm add -D @types/node@^24 @testing-library/dom@^10 @testing-library/user-event@^14 @axe-core/playwright@^4.14 tsx@^4

# Phase 5 only (analytics), if Vercel Analytics is chosen
pnpm add @vercel/analytics @vercel/speed-insights
```
Also add `"engines": { "node": "24.x" }` to `package.json` so Vercel runs the same major as local.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `drizzle-orm/neon-http` + `db.batch()` | `drizzle-orm/neon-serverless` (WebSocket `Pool`) | Only if an action needs an interactive transaction (read, decide, write atomically). Create the Pool per request |
| `@tiptap/static-renderer` on the server | Hydrating a read-only `useEditor` on public pages | Never for this project: it ships ProseMirror to visitors and hurts LCP/INP |
| Pre-render CV to Blob from admin | Render PDF on demand in a Route Handler | If the CV must reflect DB changes instantly without clicking "Generate". Costs a cold render per request |
| Header CSP without nonce (`'unsafe-inline'` scripts) | `experimental.sri` hash-based CSP | If a stricter CSP is wanted later. SRI is experimental. Try it in phase 5 polish, not before |
| Inline theme script | `next-themes` 0.4.6 | Only if Teo explicitly wants the dependency. It is not in the fixed stack |
| Better Auth `disableSignUp` + seeded admin | Better Auth `admin` plugin | Only if roles or more admins appear (backlog). v1 is single-user |
| `useTable` (v9) | `useLegacyTable` | Never: it's a temporary migration shim |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@better-auth/cli` | Frozen at 1.4.22 (Mar 2026). The CLI moved to the `auth` package (1.7.14) | `pnpm dlx auth@1.7.14 generate` |
| drizzle-orm / drizzle-kit 1.0 RC | Pre-release with RQB v2 and casing rework. The adapter peer range allows it but it's churn | 0.45.4 / 0.31.11 |
| TypeScript 7 (tsgo) during v1 | Major. JS language-service plugins (`next`) are not confirmed under tsgo | TS 5.9.x |
| `setRequestLocale` / `unstable_setRequestLocale` | Obsolete with `next/root-params` | `rootParams.locale()` in `request.ts` |
| `unstable_cache` (while cacheComponents is on) | Root params throw inside it. It is the legacy API | `'use cache'` + `cacheTag` + `cacheLife` |
| `revalidateTag(tag)` without a profile | Deprecated in 16 | `updateTag(tag)` in Server Actions; `revalidateTag(tag, 'max')` elsewhere |
| `middleware.ts`, `runtime = 'edge'` in proxy | Renamed to `proxy.ts` in 16. `runtime` in proxy throws | `proxy.ts` (Node runtime) |
| Nonce-based CSP | Forces dynamic rendering, incompatible with the PPR static shell | Header CSP from `next.config.ts` |
| `db.transaction()` on neon-http | Not supported by the HTTP driver | `db.batch([...])` |
| `PDFViewer`, `PDFDownloadLink`, `usePDF` on public pages | Client-side, very heavy | Pre-generated Blob PDF link |
| `framer-motion` package | Renamed. Duplicate runtime if both are installed | `motion` (`motion/react`) |
| `gsap-trial`, private GSAP registry, `.npmrc` tokens | Obsolete since 3.13 | Public `gsap` package |
| `@dnd-kit/react` 0.5 | Pre-1.0 API churn | `@dnd-kit/core` 6 + `sortable` 10 |
| `next-themes`, Lenis, any effects library | Outside the fixed stack or banned by DESIGN/CLAUDE | Inline theme script, native scroll |
| `dynamicParams = false` | Unsupported with Cache Components | `notFound()` at runtime |

## Stack Patterns by Variant

**Default (Plan A): `cacheComponents: true`**
- Public queries: `'use cache'` + `cacheTag(tags.x)` + `cacheLife('max')` in `features/*/queries.ts`, reading the locale via `next/root-params` where needed.
- Mutations: `requireSession()` → Zod → Drizzle → `updateTag(tag)` → `exportContent()`.
- `generateStaticParams` returns `[{locale:'en'},{locale:'es'}]` and the published slugs. **With Cache Components it must return ≥ 1 entry or the build fails** (`empty-generate-static-params`). So `next build` needs a reachable, **seeded** database. That applies to Vercel Preview and Production builds and to the CI build job (pass `DATABASE_URL` for the Neon `dev` branch as a CI secret).

**If Cache Components + next-intl breaks on day 3 (owner's Plan B): `cacheComponents: false` + ISR**
- Flip `cacheComponents: false` and remove `partialPrefetching` (it requires cacheComponents).
- Keep `request.ts` reading `rootParams.locale()`: root params work without Cache Components, and `generateStaticParams` becomes optional again.
- Replace each `'use cache'` query with `unstable_cache(fn, [key], { tags })`. **Pass `locale` as an argument**, because root params throw inside `unstable_cache`.
- Pages: `export const revalidate = false` (on-demand only) + `generateStaticParams`. Empty arrays are allowed again (ISR on first visit).
- Invalidation: keep `updateTag(tag)` in Server Actions (it targets tags regardless). Fall back to `revalidateTag(tag, { expire: 0 })` if read-your-writes misbehaves.
- **To make the switch mechanical:** write every query as `getXUncached(locale, …)` plus a thin cached wrapper in the same `queries.ts`. Plan B then only rewrites the wrappers.

**If a Preview build has no published projects yet**
- Return a placeholder `[{ slug: '__placeholder__' }]` that the page turns into `notFound()` (documented Next escape hatch). Better: make `pnpm seed` part of the phase 2 gate so this never happens.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@16.4.3 | react@19.3.x, react-dom@19.3.x | `next/root-params` stable since 16.3. Root-param cache leak fixed in 16.3.8 |
| next-intl@4.14.9 | next ^12–^16, react ≥19 | Native root-params integration |
| better-auth@1.7.14 | next ^14–^16, react ^18–^19, drizzle-orm ^0.45.2 \|\| ≥1.0.0-rc.1, drizzle-kit ≥0.31.4, vitest ≤5 | All satisfied |
| drizzle-orm@0.45.4 | @neondatabase/serverless ≥0.10 | 1.2.0 installed |
| @tiptap/react@3.32.x | @tiptap/core and @tiptap/pm at the **same exact** version | Pin all `@tiptap/*` together |
| @react-pdf/renderer@4.9.0 | react ^16.8–^19 | React 19 support since 4.1.0 |
| motion@14.x | react ^18 \|\| ^19 | |
| @gsap/react@2.1.2 | gsap ^3.12.5, react ≥17 | |
| @hookform/resolvers@6.0.2 | react-hook-form ^7.55, zod ^3.25 \|\| ^4 | |
| @tanstack/react-table@9.3.1 | react ≥18 | v9 API |
| @dnd-kit/sortable@10.0.0 | @dnd-kit/core ^6.3 | |
| @upstash/ratelimit@2.2.0 | @upstash/redis ^1.38.2 | 1.40.0 installed |
| vitest@5.0.5 | vite ^6.4–^8 (8.3.5 resolved), @types/node ^22 \|\| ≥24 | **@types/node 20 violates the peer range**. Bump to ^24 |
| @vitejs/plugin-react@6.1.2 | vite ^8 | OK |
| @testing-library/react@16.3.3 | @testing-library/dom ^10 (peer, must be direct) | |
| Node (local) 24.22 | Next 16.4, Vercel Node 24.x | Pin `engines.node` |

## Flagged Issues (non-blocking, need action or decision)

1. **React 19.3.0 → 19.3.1.** The simultaneous backport releases on 2026-10-14 look like a security fix. Ask Teo and bump in phase 2. (MEDIUM)
2. **Missing direct dependencies under pnpm**: `@tiptap/pm`, `@tiptap/static-renderer`, `@dnd-kit/utilities`, `@testing-library/dom`, `@testing-library/user-event`, `server-only`, `tsx`, `@axe-core/playwright`, `@types/node@^24`. Without them, imports fail at build time. Ask once, in phase 2. (HIGH)
3. **`docs/data-model.md` references `npx @better-auth/cli generate`.** It should be `auth@1.7.14 generate`. Editing the file requires Teo's approval. (HIGH)
4. **Scaffold root layout must go.** `src/app/layout.tsx` and `page.tsx` conflict with `[locale]` + `admin` as two root layouts. `global-not-found` needs `experimental.globalNotFound`. (HIGH)
5. **Build needs a seeded DB** because of Cache Components' non-empty `generateStaticParams` and prerendering with DB reads. Affects CI and Vercel Preview. (HIGH)
6. **Session reads under Cache Components** must sit inside `<Suspense>` in the admin. The "validate in `admin/layout.tsx`" rule becomes "guard component inside Suspense in `admin/(panel)/layout.tsx`", plus `requireSession()` in every action and loader. (HIGH)
7. **Root params are not available in Server Actions or Route Handlers.** Pass the locale explicitly to the contact action, `/resume.json`, and any OG image route. (HIGH)
8. **TanStack Table v9** differs from shadcn recipes. Budget time in phase 3. (HIGH)
9. **CSP must be header-based without nonces** to keep the static shell (Lighthouse gate). (HIGH)
10. **Blob store must be Public. Resend DNS on Porkbun should start early. Upstash via Vercel Marketplace uses `KV_REST_API_*` names.** Update `.env.example` when the keys arrive. (HIGH)
11. **`partialPrefetching: true`** is in the scaffold config but not in CLAUDE.md's stack line. It is valid in 16.4 and requires `cacheComponents`. Remove it in Plan B. (HIGH)

No library in the fixed stack is incompatible with Next 16.4 / React 19.3, and none has a known blocking issue.

## Sources

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md`: root params API, Server Action and Route Handler restriction, `use cache` keying, multiple root layouts (HIGH, bundled with 16.4.3)
- `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`: Suspense requirement for session reads, `use cache: private`, `instant = false` (HIGH)
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/{serverExternalPackages,output,reactCompiler,turbopackRustReactCompiler}.md`: default externals include `@react-pdf/renderer`, `outputFileTracingIncludes` syntax (HIGH)
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/{generate-static-params,revalidateTag,updateTag}.md`: non-empty params with Cache Components, `revalidateTag` profile (HIGH)
- `node_modules/next/dist/docs/01-app/02-guides/{content-security-policy,preventing-flash-before-hydration,caching-without-cache-components,adopting-partial-prefetching}.md`: CSP and static rendering, inline theme script, Plan B APIs (HIGH)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/{proxy,not-found}.md`: proxy Node runtime, `globalNotFound` flag (HIGH)
- Context7 `/amannn/next-intl/v4.14.9`: `rootParams.locale()` in `getRequestConfig`, `localePrefix: 'as-needed'`, proxy composition (MEDIUM per classifier; matches bundled Next docs)
- https://next-intl.dev/blog/nextjs-root-params: Server Action/Route Handler caveat, `dynamicParams` caveat, remove pass-through layout (MEDIUM)
- Context7 `/better-auth/better-auth`: `toNextJsHandler`, `nextCookies` last, `getSessionCookie` in `proxy.ts`, `disableSignUp`, `auth generate` CLI (MEDIUM; cross-checked against installed 1.7.14 exports and the drizzle-adapter source: `transaction` default false)
- Context7 `/drizzle-team/drizzle-orm-docs`: neon-http vs neon-serverless, `db.batch` (MEDIUM; standard, long-stable API)
- Context7 `/ueberdosis/tiptap-docs`: `@tiptap/static-renderer` `renderToReactElement` (MEDIUM)
- Context7 `/vercel/storage`: `handleUpload`, per-store access, v2 defaults (MEDIUM; cross-checked against installed env var usage)
- https://tanstack.com/table/latest/docs/framework/react/guide/migrating.md: v9 API (MEDIUM, official)
- https://motion.dev/docs/react-upgrade-guide: 13.0 and 14.0 breaking changes (MEDIUM, official)
- https://gsap.com/standard-license: free commercial use incl. SplitText, Webflow-competitor restriction (MEDIUM, official); plugin files verified in `node_modules/gsap`
- https://github.com/react-hook-form/resolvers/releases: v6 breaking change limited to Effect (MEDIUM, official)
- https://app.opencve.io/cve/CVE-2026-103004: root-params cache leak in 16.3.0–16.3.7 (MEDIUM)
- npm registry (`npm view … version / dist-tags / time`, run 2026-10-29): all version numbers and release dates (HIGH)
- Installed sources: `node_modules/@upstash/redis` (reads `KV_REST_API_*`), `node_modules/@vercel/blob` (`BLOB_READ_WRITE_TOKEN`), `next/dist/compiled/@next/font/dist/google/font-data.json` (font axes and subsets) (HIGH)
- TS 7 + `next` plugin compatibility: secondary blogs only, not confirmed (LOW → stay on 5.9)

---
*Stack research for: bilingual developer portfolio + custom admin (Next.js 16.4)*
*Researched: 2026-10-29*
