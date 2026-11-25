<!-- GSD:project-start source:PROJECT.md -->

## Project

**mateojaras.dev**

Portafolio bilingüe (inglés en `/`, español en `/es`) de Mateo Jaramillo (Teo), AI full stack developer de Medellín (UTC-5) con 5+ años en React/Next.js: 4 años como desarrollador frontend en Sofka (2021–2025) y freelance desde sep-2025 con productos full stack. Está dirigido a clientes freelance y reclutadores, con foco en Canadá y Europa. Incluye un panel admin propio en `/admin` para editar todo el contenido sin redeploy, y genera el CV en PDF (en/es) desde los mismos datos.

**Core Value:** Los casos de estudio (`/projects/[slug]`) tienen que convencer a un cliente o reclutador de que Teo sabe decidir y entregar: qué problema había, qué hizo él, qué resultado tuvo, qué decidió técnicamente y por qué. Si a día 14 solo una cosa puede quedar impecable, es esta; el resto puede ser sobrio.

### Constraints

- **Tech stack**: Next.js 16.4 (cacheComponents, React Compiler, Turbopack), React 19.3, TS estricto, Tailwind v4 + shadcn, Drizzle + Neon, Better Auth, next-intl, Tiptap, Vercel Blob, @react-pdf/renderer, Motion + GSAP, RHF + Zod, TanStack Table, dnd-kit, Resend, Upstash, Vitest + RTL, Playwright, Biome, pnpm — fijado; no cambiar versiones mayores sin preguntar
- **Plan B de caché**: si Cache Components + next-intl da problemas el día 3, pasar a `cacheComponents: false` + ISR — decidido de antemano para no perder días
- **Timeline**: 10 días hábiles + 4 de margen como objetivo, sin fecha dura externa — Teo prefiere calidad a cumplir una fecha
- **Cuentas**: Blob (fase 3), Resend/Upstash/Cal.com (fase 4), analytics (fase 5) se crean en la fase que los necesita; el código queda detrás de una comprobación de la variable, nunca con valores inventados
- **Performance**: Lighthouse móvil ≥ 95 en `/`, `/projects/[slug]`, `/about`, `/contact` (en y es); LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1
- **Accesibilidad**: WCAG AA, foco visible, teclado, axe sin `serious`/`critical`
- **Seguridad**: claves nunca versionadas; validación Zod en servidor; sesión verificada en layout de admin y en cada Server Action; CSP y cabeceras en `next.config.ts`
- **Autonomía**: preguntar antes de añadir dependencias, tocar DESIGN.md/copy/paleta/tipografía, cambiar el modelo de datos o una migración, añadir rutas, animaciones fuera del presupuesto o servicios externos

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

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

### 2. next-intl with `next/root-params` + `cacheComponents`

- No `setRequestLocale` anywhere (unnecessary with root params). `generateStaticParams` in `[locale]/layout.tsx` is **required** with Cache Components.
- Inside `'use cache'` functions, read the locale with `await locale()` from `next/root-params`. Only the root params a cached function actually reads go into its key. For translations inside cached scopes, prefer `getTranslations({ locale, namespace })` with the explicit value.
- **Root params are unavailable in Server Actions and Route Handlers.** The contact action must receive `locale` as an argument (`action.bind(null, locale)` or a hidden field validated by Zod). `/resume.json` and the admin must call `getTranslations({ locale: 'es' | 'en', … })` explicitly.
- `dynamicParams = false` does not work with Cache Components. Validate slugs at runtime with `notFound()`.
- The admin is outside `[locale]`. Decide once (log it in `docs/decisions.md`): admin UI in Spanish via explicit `locale: 'es'`, with strings still in `messages/es.json`.

### 3. `proxy.ts` (one file: i18n + optimistic admin gate)

### 4. Better Auth (single admin, signup disabled)

- **Schema generation:** `pnpm dlx auth@1.7.14 generate --output src/db/auth-schema.ts`, then re-export it from `src/db/schema.ts` and run `pnpm db:generate`. `docs/data-model.md` line 144 says `npx @better-auth/cli generate`. That package is frozen at 1.4.22 and should not be used against 1.7. Fixing the doc touches `docs/data-model.md`, so ask Teo first.
- **Creating the one admin with signup disabled:** in `scripts/seed.ts`, use `const ctx = await auth.$context; const hash = await ctx.password.hash(pw); const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true }); await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: 'credential', accountId: user.id, password: hash });`. Read the email and password from env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) used only by the seed. Never commit them. (Verified: `createUser` and `linkAccount` exist on the 1.7.14 internal adapter types.) Confidence MEDIUM. This is an internal API, so wrap it in one helper.
- **Session checks with Cache Components:** reading `headers()`/`cookies()` must sit inside a `<Suspense>` boundary, or the route gets the blocking-route insight and the shell is held. Implement "validation in `admin/layout.tsx`" as `admin/(panel)/layout.tsx` → `<Suspense fallback={<AdminSkeleton/>}><AdminGate>{children}</AdminGate></Suspense>`, where `AdminGate` calls `requireSession()` (`auth.api.getSession({ headers: await headers() })` → `redirect('/admin/login')`). Layout checks are not enough on their own: every Server Action **and** every admin data loader calls `requireSession()` (DAL pattern from Next's auth guide). The admin is fully dynamic, so `export const instant = false` on `admin/(panel)/layout.tsx` is acceptable to silence instant-navigation validation.
- **Env:** `BETTER_AUTH_SECRET` (`openssl rand -base64 32`). Set `BETTER_AUTH_URL` for Production only. On Preview, Better Auth infers the URL from the request, and `trustedOrigins` covers the branch URL. Confidence MEDIUM. Verify login on the first Vercel preview (phase 2 gate).

### 5. Drizzle + Neon driver choice

- The data model already names every column explicitly (`text('title_en')`), so **do not** also set `casing: 'snake_case'`. Pick one mechanism.
- `text(...).array()`, `jsonb().$type<>()`, `pgEnum`, `$onUpdate` are all supported in 0.45.4.
- `drizzle-kit` bundles its own `ws`, so no extra package is needed for migrations against Neon.
- Make sure Vercel **Preview** uses the Neon `dev` branch and only **Production** uses `main`. Check the Neon–Vercel integration's branch settings.

### 6. Tiptap (admin editor + server rendering)

- Keep **one shared extensions list** (`src/lib/tiptap-extensions.ts`) for both editor and renderer. A mismatch silently drops nodes.
- Use `useEditorState` for toolbar active states (Tiptap 3 doesn't re-render on every transaction by default).
- Validate stored JSON with a Zod schema (`type: 'doc'`, `content: array`) in the Server Action before writing.
- The `/static-renderer/pm/react` entry needs `@tiptap/pm`. If it gives trouble in RSC, `@tiptap/static-renderer/react` is the PM-free variant (MEDIUM; both entries are documented).

### 7. @react-pdf/renderer (CV en/es)

- Render **server-side only** with `renderToBuffer(<ResumeDocument …/>)` in an admin Server Action ("Generate CV" → `put('resume/en/v{n}.pdf', buffer, { access: 'public', contentType: 'application/pdf' })` → insert `resume_versions` → `updateTag(tags.resume)`). Pre-generating to Blob means public visitors never pay render cost.
- `@react-pdf/renderer` is **already** in Next's built-in `serverExternalPackages` list (verified in the bundled docs). The explicit entry in `next.config.ts` is harmless.
- **Fonts:** `Font.register({ family: 'Hanken Grotesk', fonts: [{ src: path.join(process.cwd(), 'assets/fonts-pdf/HankenGrotesk-Regular.ttf') }, { src: …-Bold.ttf, fontWeight: 700 }, { src: …-Italic.ttf, fontStyle: 'italic' }] })`. Use **static TTF** instances, not WOFF2 (unsupported) and not variable fonts (fontkit renders only the default instance). Google Fonts' download ZIPs include `static/` folders for Hanken Grotesk and Geist Mono. Confirm one exists for Funnel Display. If not, instance it with `fonttools varLib.instancer` (MEDIUM). Include the files in the trace with `outputFileTracingIncludes` (see 1). Static TTFs with the Latin subset cover á é í ó ú ü ñ ¿ ¡, which is the phase 3 gate.
- Disable hyphenation for Spanish names: `Font.registerHyphenationCallback((w) => [w])`.
- Do not use `PDFViewer`/`PDFDownloadLink` (client-side, heavy). Link to the Blob URL.

### 8. Vercel Blob

- **Create the store with Public access** (access is per store and encoded in the hostname `<id>.public.blob.vercel-storage.com`). Portfolio images and the CV must be publicly readable.
- Admin image uploads: **client upload**. The browser calls `upload(pathname, file, { access: 'public', handleUploadUrl: '/api/blob/upload' })`. The route handler calls `handleUpload({ onBeforeGenerateToken })`. Inside `onBeforeGenerateToken`, **call `requireSession()`** and restrict `allowedContentTypes: ['image/avif','image/webp','image/jpeg','image/png']` and `maximumSizeInBytes`. This bypasses the 4.5 MB function body limit and the 1 MB Server Action default.
- Do **not** rely on `onUploadCompleted` to persist URLs: Vercel cannot call back to `localhost`. Take `blob.url` from the `upload()` result and save it through the entity's Server Action.
- `addRandomSuffix` and `allowOverwrite` default to `false` in v2. Use versioned paths (`resume/es/v3.pdf`) instead of overwriting, because the CDN caches Blob URLs (default max-age 1 month).
- Phase 3 env: `BLOB_READ_WRITE_TOKEN`.

### 9. Motion + GSAP

- **Motion** (`motion` 14.x): import from `motion/react`. For the public site, use `LazyMotion features={domAnimation}` + `m.*` from `motion/react-m` to keep the initial JS small. Respect reduced motion with `<MotionConfig reducedMotion="user">`. 13.0 only changed `@emotion/is-prop-valid` handling and 14.0 has no breaking changes, so neither affects this project.
- **GSAP** 3.15: since 3.13 every plugin (SplitText, ScrollTrigger, MorphSVG…) is free under the "Standard no-charge license" and ships in the public `gsap` npm package (verified: `node_modules/gsap/SplitText.js`). The only prohibited use is building visual no-code animation builders that compete with Webflow, which a portfolio is not.
- Load GSAP only in the client components that use it. Never import it from a shared layout, so it stays out of every route's bundle.

### 10. Forms: React Hook Form + Zod 4

- `zodResolver` from `@hookform/resolvers/zod` (v6 is unchanged for Zod). When schemas transform or coerce, type the form as `useForm<z.input<typeof S>, unknown, z.output<typeof S>>`.
- Under the React Compiler, use `useWatch` / `useFormState`, not `watch()` / `formState` destructuring outside render paths. Compiler memoization can otherwise hide updates (MEDIUM).
- The Server Action re-parses with the **same** schema (`validation.ts`) and returns `{ fieldErrors }` from `z.flattenError` / `z.treeifyError` (Zod 4 APIs).

### 11. TanStack Table v9 (not v8)

### 12. dnd-kit (reorder)

### 13. Contact: Resend + Upstash (phase 4)

- `Redis.fromEnv()` accepts `UPSTASH_REDIS_REST_URL/TOKEN` **and** `KV_REST_API_URL/TOKEN`. The latter are the names you get when Upstash is provisioned through the Vercel Marketplace. Verified in the installed source.
- Resend needs `mateojaras.dev` verified (SPF/DKIM records in Porkbun). Start DNS on day 1 of phase 4, because propagation can take hours.
- The action receives `locale` explicitly (root params are not available in Server Actions).
- Keep everything behind env checks with a clear message until keys exist (CLAUDE.md rule).

### 14. Testing

- `vitest.setup.ts`: `import '@testing-library/jest-dom/vitest'`.
- Async Server Components are not supported by Vitest (Next docs). Cover them with Playwright.
- Playwright `webServer: { command: 'pnpm build && pnpm start', env: { DATABASE_URL: <dev branch> } }`. Add `@axe-core/playwright` for the "no serious/critical" gate.
- `resolve.tsconfigPaths` in Vite 8 is MEDIUM confidence. If it errors, use `vite-tsconfig-paths` 6.1.1 (Next's official Vitest guide uses it).

### 15. Fonts and theme (no new dependency)

- `next/font/google` has all three families with `latin` + `latin-ext` subsets (verified in the bundled `font-data.json`): `Funnel_Display` (wght 300–800 variable), `Hanken_Grotesk` (100–900), `Geist_Mono` (100–900). Latin covers Spanish. Load them in **each** root layout (`[locale]` and `admin`).
- Light by default, dark from system preference, plus a toggle with View Transitions: use an inline `<script>` in `<head>` that sets `.dark` before paint (Next's "Preventing flash before hydration" guide pattern, with the `type` swap trick to avoid React's script warning), and `document.startViewTransition()` in the toggle's click handler. **Do not add `next-themes`**: it isn't in the fixed stack, and the inline-script pattern is the documented first-party approach. Use the same inline-script pattern for any "local time now" in the hero status line. A server-rendered clock would break the static shell or cause hydration mismatches.

## Installation

# Patch bump (security-pattern release)

# Missing direct deps (pnpm strict: currently NOT importable although present transitively)

# Dev

# Phase 5 only (analytics), if Vercel Analytics is chosen

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

- Public queries: `'use cache'` + `cacheTag(tags.x)` + `cacheLife('max')` in `features/*/queries.ts`, reading the locale via `next/root-params` where needed.
- Mutations: `requireSession()` → Zod → Drizzle → `updateTag(tag)` → `exportContent()`.
- `generateStaticParams` returns `[{locale:'en'},{locale:'es'}]` and the published slugs. **With Cache Components it must return ≥ 1 entry or the build fails** (`empty-generate-static-params`). So `next build` needs a reachable, **seeded** database. That applies to Vercel Preview and Production builds and to the CI build job (pass `DATABASE_URL` for the Neon `dev` branch as a CI secret).
- Flip `cacheComponents: false` and remove `partialPrefetching` (it requires cacheComponents).
- Keep `request.ts` reading `rootParams.locale()`: root params work without Cache Components, and `generateStaticParams` becomes optional again.
- Replace each `'use cache'` query with `unstable_cache(fn, [key], { tags })`. **Pass `locale` as an argument**, because root params throw inside `unstable_cache`.
- Pages: `export const revalidate = false` (on-demand only) + `generateStaticParams`. Empty arrays are allowed again (ISR on first visit).
- Invalidation: keep `updateTag(tag)` in Server Actions (it targets tags regardless). Fall back to `revalidateTag(tag, { expire: 0 })` if read-your-writes misbehaves.
- **To make the switch mechanical:** write every query as `getXUncached(locale, …)` plus a thin cached wrapper in the same `queries.ts`. Plan B then only rewrites the wrappers.
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

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| impeccable | "Use when the user wants to design, redesign, shape, critique, audit, polish, simplify, harden, animate, or otherwise improve a frontend interface: websites, landing pages, dashboards, product UI, components, forms, settings, onboarding, empty states, and native iOS or Android screens. Handles UX review, hierarchy, layout, typography, color, motion, UX copy, accessibility, responsive behavior, edge cases, and capturing or documenting design systems (DESIGN.md, tokens). Also for making bland UI bolder, loud UI quieter, or ambitious visual effects. Not for backend-only or non-UI tasks." | `.claude/skills/impeccable/SKILL.md` |
| deploy-to-vercel | Deploy applications and websites to Vercel. Use when the user requests deployment actions like "deploy my app", "deploy and give me the link", "push this live", or "create a preview deployment". | `.agents/skills/deploy-to-vercel/SKILL.md` |
| vercel-cli-with-tokens | Deploy and manage projects on Vercel using token-based authentication. Use when working with Vercel CLI using access tokens rather than interactive login — e.g. "deploy to vercel", "set up vercel", "add environment variables to vercel". | `.agents/skills/vercel-cli-with-tokens/SKILL.md` |
| vercel-composition-patterns | React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on tasks involving compound components, render props, context providers, or component architecture. Includes React 19 API changes. | `.agents/skills/vercel-composition-patterns/SKILL.md` |
| vercel-optimize | "Use for Vercel cost and performance optimization on deployed projects, especially Next.js, SvelteKit, Nuxt, and limited Astro apps. Collect Vercel metrics, usage, project config, and code scan results first; investigate only metric-backed candidates; produce ranked recommendations grounded in verified files and version-aware Vercel/framework docs. Trigger for Vercel bill reduction, slow or expensive routes, caching opportunities, Function Invocations, Build Minutes, Fast Data Transfer, Core Web Vitals, Bot Management, Fluid compute, or cost breakdown requests." | `.agents/skills/vercel-optimize/SKILL.md` |
| vercel-react-best-practices | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements. | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| vercel-react-native-skills | React Native and Expo best practices for building performant mobile apps. Use when building React Native components, optimizing list performance, implementing animations, or working with native modules. Triggers on tasks involving React Native, Expo, mobile performance, or native platform APIs. | `.agents/skills/vercel-react-native-skills/SKILL.md` |
| vercel-react-view-transitions | Guide for implementing smooth, native-feeling animations using React's View Transition API (`<ViewTransition>` component, `addTransitionType`, and CSS view transition pseudo-elements). Use this skill whenever the user wants to add page transitions, animate route changes, create shared element animations, animate enter/exit of components, animate list reorder, implement directional (forward/back) navigation animations, or integrate view transitions in Next.js. Also use when the user mentions view transitions, `startViewTransition`, `ViewTransition`, transition types, or asks about animating between UI states in React without third-party animation libraries. | `.agents/skills/vercel-react-view-transitions/SKILL.md` |
| web-design-guidelines | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices". | `.agents/skills/web-design-guidelines/SKILL.md` |
| writing-guidelines | Review docs/prose for Writing Guidelines compliance. Use when asked to "review my docs", "check writing style", "audit prose", "review docs voice and tone", or "check this page against the writing handbook". | `.agents/skills/writing-guidelines/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-fast` for a trivial task inline, with no subagents and no PLAN.md
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
