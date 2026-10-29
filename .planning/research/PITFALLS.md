# Pitfalls Research

**Domain:** Bilingual developer portfolio (en at `/`, es at `/es`) with a custom admin, CV PDF generation, on Next.js 16.4 (`cacheComponents`, React Compiler, Turbopack) deployed to Vercel
**Researched:** 2026-10-29
**Confidence:** HIGH for Next.js behaviour (verified against the bundled 16.4.3 docs in `node_modules/next/dist/docs`), MEDIUM for library behaviour (Context7 official docs), LOW where only web/community sources exist. Each pitfall is tagged.

Phases referenced below are Teo's five: **1** identity/content, **2** technical base, **3** admin, **4** public site, **5** polish.

---

## Critical Pitfalls

Mistakes that cost a day or more, force a rewrite, or fail a launch gate.

### Pitfall 1: Reading the locale the wrong way under Cache Components

**What goes wrong:**
Public queries marked `'use cache'` end up calling `headers()`, `cookies()`, or anything that transitively reads them (older next-intl internals, `getLocale()` without root params, `auth.api.getSession()`), and you get `next-request-in-use-cache`. The docs are explicit that on a dynamically rendered route this *passes `next build` and fails under `next start`*, so it surfaces on the Vercel preview, not locally. The opposite failure: you lift the locale out of the cache and forget to pass it in, and the English home page is served at `/es` because the cache key never included the locale.

**Why it happens:**
Until Next 16.3 there was no sanctioned way to read a root segment deep in the tree, so every i18n library leaned on request headers. `next/root-params` fixes this, but only in Server Components. It is **not available in Server Actions, Route Handlers, or Client Components** (bundled docs, `next-root-params.md`), which is exactly where the contact action, `/resume.json`, and the PDF route live.

**How to avoid:**
- `src/i18n/request.ts`: `getRequestConfig(async ({locale}) => { if (!locale) { const v = await rootParams.locale(); if (!hasLocale(routing.locales, v)) notFound(); locale = v } ... })` (next-intl setup docs). Drop `setRequestLocale` everywhere; keep `generateStaticParams` in `app/[locale]/layout.tsx`.
- Inside `'use cache'` functions call `await locale()` from `next/root-params` directly; Next adds it to the cache key automatically. Never pass `headers()`-derived values in.
- Server Actions and Route Handlers receive the locale explicitly: hidden `<input name="locale">` or `action.bind(null, locale)`; PDF/JSON routes live under `app/[locale]/resume.pdf/route.ts` and read `params`, not root params.
- `/admin` is a second root layout (`src/app/admin/layout.tsx`), so `locale()` is typed `string | undefined` there and next-intl's request config would `notFound()` the admin. Give the admin an explicit locale (`getTranslations({locale: 'es'})` or a fallback in `request.ts`).
- Pin `next >= 16.3.8`. CVE-2026-103004 (16.3.0 to 16.3.7): a nested `'use cache'` that read a root param could leak one locale's cached output to the other. 16.4.3 is fine; do not downgrade. **[HIGH: NVD/OpenCVE]**

**Warning signs:**
`next-request-in-use-cache` in the Vercel function logs; `/es` showing English text after the first deploy; "Uncached data accessed outside Suspense" insights in the dev overlay pointing at `getTranslations`.

**Phase to address:** Phase 2 (spike on day 3 is already the agreed Plan B trigger: if the `[locale]` + `'use cache'` shell does not build cleanly by end of day 3, flip to `cacheComponents: false` + ISR).

**Confidence:** HIGH (Next docs) / MEDIUM (next-intl docs and blog, 2026-08-04).

---

### Pitfall 2: `generateStaticParams` must return real values, including project slugs from the database

**What goes wrong:**
With `cacheComponents: true`, every dynamic segment needs `generateStaticParams` returning **at least one** param or the build fails with `empty-generate-static-params`. That includes `[slug]` under `/projects` and `/es/proyectos`. The slugs come from Neon, so `next build` on Vercel now needs `DATABASE_URL`, a reachable branch, and at least one published project. First deploy with an empty table: red build. Preview branch whose Neon branch was not yet created: red build (see Pitfall 7).

**Why it happens:**
Cache Components uses the params to validate at build time that the route does not touch `cookies()`/`headers()`. `dynamicParams = false` also does not work with Cache Components (next-intl blog), so you cannot sidestep it.

**How to avoid:**
- `app/[locale]/layout.tsx`: `generateStaticParams` returns both locales.
- `projects/[slug]/page.tsx`: `generateStaticParams` reads `await locale()` and queries published slugs; if the result is empty (fresh DB), return `[{slug: '__placeholder__'}]` and `notFound()` on it in the page. The docs allow this but note it weakens validation; keep it as a fallback branch only.
- Make the seed (`pnpm seed`) part of Phase 2's definition of done so the build never sees an empty table on `main`.
- Unknown slugs: runtime `notFound()`; do not rely on `dynamicParams`.

**Warning signs:**
Build log mentions `generateStaticParams` or `empty-generate-static-params`; a preview deploy fails only on brand-new branches.

**Phase to address:** Phase 2 (schema + seed + first Vercel preview). Re-verify in Phase 4 when the localized `/es/proyectos/[slug]` pathname is added.

**Confidence:** HIGH (bundled `generate-static-params.md`, `next-root-params.md`).

---

### Pitfall 3: Admin session read placed where Cache Components forbids it

**What goes wrong:**
`auth.api.getSession({headers: await headers()})` at the top of `src/app/admin/layout.tsx` (exactly what CLAUDE.md prescribes) either blocks the whole admin segment behind the request or triggers the `blocking-prerender-runtime` insight / instant-navigation validation errors. Worse, if any admin query is wrapped in `'use cache'` and calls the session helper, it throws at runtime.

**Why it happens:**
With Cache Components, `cookies()`/`headers()` must be read inside a `<Suspense>` boundary, never inside plain `'use cache'`. Better Auth's helper reads the cookie deep inside its own code, so you cannot lift the value out.

**How to avoid:**
- Keep `proxy.ts` to `getSessionCookie(request)` presence check + redirect (Better Auth docs call this "NOT SECURE" by design; it is only the optimistic redirect).
- In the admin layout, render the shell (nav, fonts) statically and put the session check in a child component wrapped in `<Suspense>`; or add `export const instant = false` on the admin layout since nothing in `/admin` needs a static shell. `instant = false` does not fix synchronous IO errors, so still avoid `new Date()` in the shell.
- Every Server Action re-reads the session (`requireSession()`), with `disableCookieCache: true` for destructive actions if `session.cookieCache` is enabled.
- Never put the session read (or anything that calls it) inside `'use cache'`. If you want cached per-user data later, use `'use cache: private'`, but the admin does not need it.
- `nextCookies()` must be the **last** plugin in `betterAuth({plugins})` or sign-in from a Server Action will not set the cookie.
- Preview deployments: `BETTER_AUTH_URL` differs per preview; use `baseURL: { allowedHosts: ['mateojaras.dev', '*.vercel.app'] }` or set the env per environment, otherwise login on previews fails with an untrusted-origin error.

**Warning signs:**
Dev overlay insights on `/admin`; login works locally but not on the preview URL; "Set-Cookie" missing after a Server Action sign-in.

**Phase to address:** Phase 2 (gate is "login admin + preview green").

**Confidence:** HIGH (bundled `authentication-with-cache-components.md`, `migrating-to-cache-components.md`) / MEDIUM (Better Auth docs via Context7).

---

### Pitfall 4: Seeding the single admin while sign-up is disabled

**What goes wrong:**
`emailAndPassword.disableSignUp: true` makes the sign-up endpoint throw `EMAIL_PASSWORD_SIGN_UP_DISABLED` server-side too, so a seed that calls `auth.api.signUpEmail` fails and the project has no way in. Teams then either leave sign-up open "for now" (security gate fails) or insert a user row by hand with an unhashed password (login fails).

**How to avoid:**
Pick one, in Phase 2:
1. Seed with the Better Auth CLI `create-admin` command (requires the `admin()` plugin; uses `auth.api.createUser`, hashes correctly, bypasses the sign-up gate). Adds one plugin but is the documented path.
2. Or run the seed with a temporary env flag that enables sign-up for the seed process only (`disableSignUp: process.env.ALLOW_SIGNUP !== '1'`), call `auth.api.signUpEmail`, and never set the flag on Vercel.
Either way: generate the Better Auth tables with `npx @better-auth/cli generate` into the Drizzle schema **before** `pnpm db:generate` so there is a single migration history, and store `ADMIN_EMAIL`/`ADMIN_PASSWORD` only in `.env.local`.

**Warning signs:**
Seed script crashes on the auth step; a `user` table row exists but login says invalid credentials.

**Phase to address:** Phase 2.

**Confidence:** MEDIUM (Better Auth source and CLI docs via Context7).

---

### Pitfall 5: The CV PDF ships without accents, with the wrong weights, or not at all on Vercel

**What goes wrong:**
Four distinct failures, all seen with `@react-pdf/renderer`:
- Variable fonts (Funnel Display and Hanken Grotesk from Google are variable) render at one weight or garble glyphs. The docs state OpenType variable fonts do not work (PDF spec).
- WOFF2 is not supported; only TTF and WOFF.
- Fonts registered with a relative path work locally and throw `ENOENT ... .next/server/...` on Vercel because the file was not traced into the function bundle.
- Spanish words break with English hyphenation rules (default is `en-us`).
And a fifth: importing the renderer anywhere in a client tree or a `'use client'` file breaks the build or hydration.

**How to avoid:**
- Download **static TTF** instances per weight into `assets/fonts-pdf/` (DESIGN.md already says so); `Font.register({ family, fonts: [{src, fontWeight: 400}, {src, fontWeight: 600}] })`.
- `src: path.join(process.cwd(), 'assets/fonts-pdf/...')` and `outputFileTracingIncludes: { '/[locale]/resume.pdf': ['./assets/fonts-pdf/**'] }` in `next.config.ts`. `@react-pdf/renderer` is already in Next's default `serverExternalPackages` list; no webpack override is needed with Turbopack.
- Register a Spanish hyphenation callback for the ES document (`@react-pdf/hyphenate` ships per-language `syllables`; if Spanish is missing, disable hyphenation with `word => [word]` rather than ship English breaks).
- Generate the PDF **on publish in the admin** (Server Action, `renderToBuffer`), store it in Blob, record it in `resume_versions`, and have the public "Resume (PDF)" link point at the Blob URL. The public route never pays the cold start (renderer + fontkit + yoga is a multi-MB function) and never hits the 4.5 MB body limit.
- Test the gate ("tildes y ñ correct in both languages") with an automated check: render both PDFs in CI and `pdftotext`/`pdf-parse` for `ñ`, `á`, `é`, `í`, `ó`, `ú`, `Medellín`.
- Spike this on day 5, not day 7: React 19.3 + react-pdf v4 peer compatibility (`react-reconciler`) is unverified for 19.3 specifically. **[LOW: compatibility page lists React 19 support since v4.1.0, not 19.3]**

**Warning signs:**
PDF shows boxes/missing glyphs; all text one weight; works in `pnpm dev`, 500 on Vercel; function size warning in the deploy log.

**Phase to address:** Phase 3 (gate: "PDF with accents"). Font files land in Phase 1 with the rest of the typography assets.

**Confidence:** MEDIUM (react-pdf docs via Context7) / LOW (Vercel ENOENT pattern, community).

---

### Pitfall 6: CSP that is incompatible with the static shell, or that blocks the theme script

**What goes wrong:**
The textbook Next CSP uses a per-request nonce from `proxy.ts`. The bundled docs say plainly: nonces require dynamic rendering and **PPR is incompatible with nonce-based CSP** because static-shell scripts never see the nonce. With `cacheComponents` on, a nonce CSP either breaks hydration (blocked inline scripts) or silently forces everything dynamic and kills the Lighthouse gate. Separately, the no-flash theme script (Pitfall 8) is an inline `<script>`, and Vercel Analytics (Phase 5) adds `/_vercel/insights/script.js`.

**How to avoid:**
- Set CSP as a static header in `next.config.ts` (`headers()`), not in proxy.
- `script-src 'self' 'unsafe-inline'` in production (the docs' "Without Nonces" variant) **or** a hash for the one theme script plus `'self'` for everything else; `'unsafe-eval'` only in development. Hash-based SRI (`experimental.sri`) is an option but experimental; do not bet the timeline on it.
- `style-src 'self' 'unsafe-inline'` (Tailwind v4 and next/font emit files, but React and Motion set inline `style` attributes; GSAP mutates `el.style` via CSSOM, which CSP does not block, but SplitText writes `style` attributes on created spans).
- `img-src 'self' blob: data: https://*.public.blob.vercel-storage.com`; `font-src 'self'`; `connect-src 'self'` (Analytics beacons are same-origin in prod; `va.vercel-scripts.com` only in dev); `frame-src https://cal.com https://app.cal.com` if Cal.com is embedded, otherwise plain link; `frame-ancestors 'none'`; `form-action 'self'`.
- Ship `Content-Security-Policy-Report-Only` first on the preview, read the console, then enforce.

**Warning signs:**
Blank page with "Refused to execute inline script" in the console; theme flashes only in production; Lighthouse "best practices" fine but LCP suddenly server-bound.

**Phase to address:** Phase 2 defines the header skeleton; Phase 4 (theme script, GSAP, Blob images) and Phase 5 (analytics) extend it. Add a Playwright check that asserts zero CSP violations on the four routes.

**Confidence:** HIGH (bundled `content-security-policy.md`) / LOW (Vercel Analytics directive list, community).

---

### Pitfall 7: Neon driver and migration choices that break under Vercel

**What goes wrong:**
- `drizzle-orm/neon-http` throws `No transactions support in neon-http driver` the first time an action wraps "update project + replace project_skills rows" in `db.transaction`.
- Migrations run with `drizzle-kit push` from a laptop against `main`, so the preview branch (separate Neon branch, separate `DATABASE_URL`) is missing tables and the preview 500s.
- Neon's Vercel integration injects `DATABASE_URL`/`DATABASE_URL_UNPOOLED` per preview branch, but the first build of a new git branch can start before the branch exists (community report). Build fails once, then works on retry.
- drizzle-kit `0.31` vs the v1 beta: migration folder layout changed (no `journal.json`). Mixing versions across machines corrupts the history.

**How to avoid:**
- Default to `neon-http` for the public queries (fastest, stateless, fine for Fluid). For actions that need atomicity, either use `db.batch()` (supported on neon-http) or create a second `drizzle-orm/neon-serverless` `Pool` client at module scope for the admin only. Decide in Phase 2 and write it in `docs/decisions.md`.
- Commit migrations; run `drizzle-kit migrate` in the Vercel build command (`pnpm db:migrate && pnpm build`) using `DATABASE_URL_UNPOOLED` in `drizzle.config.ts`. Never `push` against `main`.
- Treat the one-off first-preview failure as known; re-run the deploy rather than debugging it.
- Pin `drizzle-kit` exactly in `package.json` and do not upgrade mid-milestone.
- `date` columns come back as strings; format with `Intl.DateTimeFormat(locale, {timeZone: 'America/Bogota'})` on the server to avoid off-by-one days in the PDF and the experience timeline.

**Warning signs:**
"No transactions support" in logs; preview works for pages but admin saves fail; `relation does not exist` on preview only.

**Phase to address:** Phase 2.

**Confidence:** MEDIUM (Drizzle docs, Neon docs via web; transaction error widely reported).

---

### Pitfall 8: Theme toggle that flashes, or View Transitions that fight each other

**What goes wrong:**
Dark-mode preference lives in `localStorage`, which the server cannot read. Deferring to `useEffect` paints light then dark (visible flash, and a CLS/LCP hit on the first paint). Wrapping the toggle in `document.startViewTransition` does not help the initial load. Enabling Next's `experimental.viewTransition` for route changes at the same time stacks a route transition on top of your theme transition and a GSAP reveal.

**How to avoid:**
- Blocking inline script in `<head>` (bundled guide "Preventing flash before hydration"): read `localStorage.theme`, else `matchMedia('(prefers-color-scheme: dark)')`, set `data-theme` on `<html>`, with `suppressHydrationWarning` on `<html>`. This is the one inline script the CSP must allow (Pitfall 6).
- Toggle: feature-detect `startViewTransition`; inside the callback flip `data-theme` and write `localStorage`; CSS `::view-transition-old(root), ::view-transition-new(root) { animation-duration: 250ms }` and `0s` under `prefers-reduced-motion: reduce`.
- Leave route-level `<ViewTransition>` off for v1 (DESIGN.md already makes it conditional; backlog lists it). One transition system at a time.
- Do not use `next-themes`; it is an extra dependency doing the same inline-script trick and would need approval.

**Warning signs:**
White flash on reload in dark mode; Lighthouse CLS > 0 on first load only in dark mode; the reveal animation plays twice.

**Phase to address:** Phase 4 (ThemeToggle), re-checked in Phase 5 reduced-motion pass.

**Confidence:** HIGH for the inline-script pattern (bundled guide) / LOW for View Transitions interplay (web).

---

### Pitfall 9: Synchronous IO in the prerendered shell (the "live status line")

**What goes wrong:**
The hero status line ("Available from Nov 2026 · Medellín, UTC-5 · overlaps with Toronto and Madrid") tempts a `new Date()` to compute "now", local time, or overlap windows. With Cache Components, `new Date()`, `Date.now()`, `Math.random()`, `crypto.randomUUID()` during prerender are **build errors that `instant = false` does not clear** (bundled migration guide). The same trap hits "updated 3 days ago" labels and the `/now` entry's date.

**How to avoid:**
- Everything that depends on the current time is either (a) computed inside a `'use cache'` function with an explicit `cacheLife` (allowed; it becomes part of the cached output and refreshes on schedule), (b) behind `<Suspense>` after `await connection()`, or (c) a small Client Component with `suppressHydrationWarning`.
- The status line's text is admin data (`availability_status`, `available_from`, `timezone`, `location`); render it from the DB and keep "overlaps with Toronto and Madrid" as stored copy, not a computed clock.
- If a live Medellín clock is wanted, it is a leaf client component that renders nothing until mounted.

**Warning signs:**
Build error naming `Date`/`Math.random` during prerender; hydration mismatch on relative dates.

**Phase to address:** Phase 4 (StatusLine). Agree on the rule in Phase 2.

**Confidence:** HIGH (bundled `migrating-to-cache-components.md`).

---

### Pitfall 10: Content is not ready when the admin is

**What goes wrong:**
PROJECT.md says `docs/content/` has the four projects' copy, screenshots, URLs and metrics; on 2026-10-29 the folder has a `.gitkeep`, `material/` is empty, and `docs/copy.md` is all `[Teo escribe]` markers. Phase 3's gate is "real content loaded from the admin" and Phase 1's gate includes approved copy. If the material is late, every later phase fills the gap with placeholder text, which CLAUDE.md forbids, and the case studies (the stated core value) ship thin.

**How to avoid:**
- Make day 1 an inventory with a hard checklist per project: tagline, problem, role, solution, 2 to 3 results, 2 to 3 tech decisions, 3+ screenshots at 16:10, live URL, permission to show client work (ManuJ, EcoExport).
- Any metric that cannot be sourced (analytics export, Lighthouse report, client message) is written as a qualitative result, not a number. Record provenance next to each metric in `docs/content/<project>/metrics.md`.
- The seed reads from `docs/content/*.json`; the schema allows nulls so missing fields hide sections instead of rendering lorem ipsum.
- Clone/tutorial-looking projects are a known recruiter red flag; the inventory project (no public URL) needs screenshots with fictitious data and a clear "internal system" framing, plus its tech decisions, or it drags the others down.

**Warning signs:**
Seed JSON has `""` or `"TODO"`; a case study page with fewer than three sections rendered; screenshots at mixed aspect ratios.

**Phase to address:** Phase 1 (gate), verified again at Phase 3 gate.

**Confidence:** HIGH for the repo state (observed) / LOW for recruiter behaviour (community, UX-heavy sources).

---

## Moderate Pitfalls

### GSAP SplitText before fonts load (CLS and broken lines)
Splitting the H1 before Funnel Display finishes loading measures the fallback font, so lines re-break after swap and the stagger animates the wrong words; SplitText itself warns about this. Use `autoSplit: true` and create the tween inside `onSplit` (returned so it is reverted on re-split), or await `document.fonts.ready` first; keep the H1 at `opacity: 0` only via the animation, never via CSS that persists under reduced motion. Default `aria: "auto"` labels the heading and hides the pieces, which is fine for a plain H1; if the heading contains a link use `aria: "hidden"` plus an sr-only duplicate. Gate all GSAP in `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. **Phase 4.** [MEDIUM: GSAP docs]

### GSAP + React Compiler + Activity-preserved routes
`useGSAP({scope})` with refs is compiler-safe; manual `gsap.to` in event handlers is not cleaned up unless wrapped in `contextSafe`. Cache Components keeps recently visited routes mounted in a hidden `<Activity>`, cleaning up effects on hide and re-running them on show: ScrollTrigger instances must be created inside `useGSAP` (so they revert on hide) and `ScrollTrigger.refresh()` after images/fonts settle. Keep GSAP only in `src/components/motion/` as CLAUDE.md says. **Phase 4.** [MEDIUM: GSAP React docs + bundled cacheComponents doc]

### Tiptap rendered twice: editor in the admin, editor on the site
Rendering stored JSON on the public site through `useEditor({editable: false})` ships the whole editor plus ProseMirror to the public bundle and requires `'use client'`. Use `@tiptap/static-renderer` (`renderToReactElement` from `/pm/react`) in a Server Component with the same extension list as the editor, and map `image`/`link` nodes to `next/image` and `next/link`. In the admin, `useEditor({immediatelyRender: false})` to avoid hydration mismatch, and read state through `useEditorState` because Tiptap v3 does not re-render on every transaction by default (toolbar buttons appear stuck). `@tiptap/static-renderer` is not in `package.json`: ask before adding. **Phase 3 (editor), Phase 4 (renderer).** [MEDIUM: Tiptap docs; LOW for the v3 rerender default]

### Localized pathnames and locale detection that fight SEO
`localePrefix: 'as-needed'` with default middleware behaviour sets `NEXT_LOCALE` and may redirect `/` to `/es` from the cookie or `Accept-Language`. For a portfolio aimed at Canada/Europe where `/` must stay English and crawlable, set `localeDetection: false` and let `LangSwitch` do the switching. Define `pathnames` for `/projects/[slug]` -> `/es/proyectos/[slug]`, `/about` -> `/es/sobre-mi`, `/contact` -> `/es/contacto` once, in `routing.ts`, and generate `hreflang` (`alternates.languages` with `x-default` pointing at `/`) and OG per locale in `generateMetadata` from `site_settings`. Exclude `/admin`, `/api`, `/_vercel`, and dotted paths from the i18n matcher. **Phase 2 (routing), Phase 4 (metadata).** [MEDIUM: next-intl docs]

### `exportContent()` writing to the filesystem in production
The data model says every publish exports `content/*.json`. Vercel functions have a read-only filesystem except `/tmp`; a `fs.writeFile` into the repo path throws and the Server Action fails after the DB write succeeded (inconsistent state, confusing error). Branch on `process.env.VERCEL`: local writes to `content/`, production writes to Blob under `backup/<date>/`. Run the export after `updateTag`, and never let an export failure roll back a successful save (log and continue). **Phase 3.** [HIGH: Vercel platform constraint]

### Vercel Blob upload path
`put()` from a Server Action goes through a Vercel Function with a 4.5 MB body limit; a 5 MB PNG from Teo's screenshots fails with an opaque error. Use client uploads (`upload()` + `handleUpload` route) for images, `addRandomSuffix: true`, and compress to WebP/AVIF at 1600px before upload. Add `images.remotePatterns` for `https://<store-id>.public.blob.vercel-storage.com/**` or `next/image` refuses the URL. Store `alt_en`/`alt_es` alongside the URL (the `media` JSON already does). **Phase 3.** [MEDIUM: Vercel docs]

### Rate limiting that fails open and keys on the wrong thing
Upstash `Ratelimit` times out after 5 s by default and **allows** the request on timeout; instantiate the limiter and its `ephemeralCache` at module scope; key on a hash of `x-forwarded-for` (first IP) plus the honeypot result; `await pending` (or `after(() => pending)`) when analytics is on. Resend: a custom `from@mateojaras.dev` requires SPF/DKIM records at Porkbun, which take time to propagate, so request the Resend setup at the start of Phase 4, not on the contact-form day; until then the code must refuse to send with a clear message when `RESEND_API_KEY` is absent (CLAUDE.md rule), never a silent mock. **Phase 4.** [MEDIUM: Upstash docs / LOW: Resend DNS timing is operational knowledge]

### Self-hosted fonts that hurt LCP instead of helping
Three families, two of them variable, plus latin-ext subsets can add 300+ KB before first text. `next/font/local` preloads every file by default: set `preload: false` on Geist Mono (used below the fold) and on any weight not used in the hero, keep `display: 'swap'` with `adjustFontFallback` so the fallback is metric-matched (no CLS), and make sure the hero H1 uses a preloaded file so the LCP element is not waiting on a font. Measure on the Vercel preview with Lighthouse mobile, not locally. **Phase 1 chooses files; Phase 4 verifies the 95 gate.** [MEDIUM: Next font docs + Vercel academy]

---

## Minor Pitfalls

- **`partialPrefetching` unset.** Next 16.4 logs a warning unless it is explicitly set next to `cacheComponents: true`. Set it to `true` from day 3. [HIGH]
- **`runtime` exports.** Any `export const runtime = 'nodejs'|'edge'` fails the build under Cache Components. Grep for it before each PR. [HIGH]
- **`dynamic`, `revalidate`, `fetchCache` segment configs** are legacy under Cache Components; copy-pasted snippets with `export const revalidate = 3600` need to become `cacheLife`. [HIGH]
- **Nested short-lived caches.** A `'use cache'` with `cacheLife('minutes')` inside one without an explicit profile fails prerender. Always set `cacheLife('max')` on the public queries, as the data model already says. [HIGH]
- **`React.cache` does not cross a `'use cache'` boundary.** Pass data as arguments. [HIGH]
- **Proxy composition.** One `proxy.ts` must run next-intl's middleware, the admin cookie check, and nothing slow; set the matcher so `/admin` skips i18n and `/_vercel`, `/api/auth` skip both. [MEDIUM]
- **`images.qualities`.** Next 16 defaults to `[75]`; passing `quality={90}` on cover images throws unless listed. [MEDIUM: Next 16 release notes, not re-verified in bundled docs]
- **Slug immutability.** Changing a published slug breaks `hreflang` pairs and inbound links; the data model already says "redirect in `next.config.ts`", so add a `slug_history` or a redirects list from day one. [HIGH: project rule]
- **`localized()` fallback hides missing Spanish.** Falling back to English silently means `/es` can read half-English without anyone noticing; add an admin "translation completeness" indicator per row. [MEDIUM]
- **Timezone in tests.** Run Vitest and Playwright with `TZ=UTC` locally so date formatting bugs show before Vercel (which runs in UTC). [HIGH: bundled flash guide recommends it]

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Placeholder `generateStaticParams` slug to get the build green | Unblocks first deploy | Disables Cache Components' build-time validation; runtime 404s | Only as the empty-DB fallback branch, never the primary path |
| `'unsafe-inline'` in `script-src` | CSP works with the static shell today | Weaker XSS defence | Acceptable for v1 (no user-generated HTML on the public site; Tiptap JSON is rendered through a whitelist of nodes). Revisit when SRI stabilises |
| `instant = false` on `/admin` | Avoids restructuring the admin layout around Suspense | Admin navigations are not instant | Acceptable for a single-user admin |
| Generating the PDF on request | Always fresh | Multi-MB cold start on every click, body-size risk | Never; generate on publish and serve from Blob |
| `pnpm db:push` from laptop | Fast iteration | Preview and prod schemas drift, no history | Only against a throwaway Neon branch during Phase 2 spikes |
| Fallback to English in `localized()` | Nothing crashes | Half-translated Spanish pages | Acceptable for v1 with an admin completeness indicator |
| `cacheComponents: false` + ISR (Plan B) | Removes an entire class of build errors | Loses the static shell + streaming model; must re-add `revalidate`/`revalidateTag` | Acceptable if the day-3 spike fails; the decision is already pre-approved |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| next-intl | Calling `getLocale()`/`headers()` inside `'use cache'`; relying on `setRequestLocale` | Root params in `request.ts`; explicit locale in actions/route handlers; `generateStaticParams` kept |
| Better Auth | `nextCookies()` not last; session read in `'use cache'`; sign-up left enabled | Plugin order; Suspense/`instant=false`; `disableSignUp` + CLI `create-admin` or env-gated seed |
| Drizzle + Neon | `db.transaction` on `neon-http`; `push` to `main`; mixed drizzle-kit versions | `batch()` or a WebSocket `Pool` for admin writes; `migrate` in the build command; pinned versions |
| @react-pdf/renderer | Variable/WOFF2 fonts; relative font paths; client import | Static TTF per weight; `process.cwd()` + `outputFileTracingIncludes`; server-only render on publish |
| Tiptap | `useEditor` on the public site; missing `immediatelyRender:false` | `@tiptap/static-renderer` in RSC; `immediatelyRender:false` + `useEditorState` in the admin |
| GSAP | Splitting before fonts; tweens outside context; running under reduced motion | `autoSplit`/`fonts.ready`; `useGSAP` + `contextSafe`; `gsap.matchMedia` |
| Vercel Blob | Server upload of >4.5 MB; missing `remotePatterns` | Client upload flow; exact store hostname in `images.remotePatterns` |
| Resend | Sending from an unverified domain; silent mock when key missing | Verify `mateojaras.dev` DNS early; refuse loudly without the key |
| Upstash | Limiter created per request; ignoring `timeout` fail-open | Module-scope instance + `ephemeralCache`; short timeout and treat timeout as a soft deny if abuse is observed |
| Vercel Analytics | Adding `va.vercel-scripts.com` to prod CSP only | Prod is same-origin `/_vercel/insights`; exclude `/_vercel` from the i18n matcher |
| Cal.com | Embedding the widget (third-party script, iframe, CSP, LCP) | Plain link to the Cal.com page for v1 |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Three font families fully preloaded | LCP > 2.5 s on mobile, Lighthouse < 95 | Preload only hero files; `preload:false` on mono; subset latin + latin-ext only | Immediately on 4G mobile |
| GSAP + SplitText + Motion all in the first paint bundle | TBT/INP regressions on `/` | Import GSAP plugins only in `src/components/motion/` leaves; `next/dynamic` for `ScrollScene`; keep home hero animation to one plugin | At first Lighthouse run |
| Tiptap editor code in the public bundle | +200 KB JS on `/projects/[slug]` | Static renderer in RSC | Immediately |
| PDF rendered on request | 2 to 5 s TTFB on "Resume (PDF)" | Generate on publish, serve Blob | First click after a cold start |
| Unoptimized Blob screenshots | LCP image 1 MB+ | Pre-compress; `next/image` with `sizes`; `priority` only on the first cover | Immediately |
| In-memory `'use cache'` on serverless | Public queries hit Neon on every cold instance | Rely on the prerendered shell + tags (build-time cache works); `cacheLife('max')`; do not expect runtime LRU reuse on Vercel | Not a problem at portfolio traffic; noted so nobody "fixes" it with `use cache: remote` |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting `proxy.ts` cookie presence as auth | Forged cookie reaches admin pages | `auth.api.getSession` in the layout component and in every Server Action |
| Sign-up endpoint left enabled "temporarily" | Anyone creates an admin | `disableSignUp: true` from the first commit; seed via CLI/env-gated path |
| Session or email in `'use cache'` args or `cacheTag` | Plain-text cache keys leak PII | Never cache per-user data on the public site; tags are entity names only |
| Rendering Tiptap JSON via `dangerouslySetInnerHTML` from `renderToHTMLString` | Stored XSS if the admin is ever compromised | `renderToReactElement` with an explicit node/mark whitelist |
| Contact form without server Zod + honeypot + rate limit | Spam, email bombing via Resend | Zod on the action, hidden field check, Upstash limiter, store `ip_hash` not IP |
| `BETTER_AUTH_SECRET` or Blob token in `NEXT_PUBLIC_*` | Full compromise | Keep server-only; `.env.example` documents names only |
| CSP missing `frame-ancestors`/`form-action` | Clickjacking, form hijack | Static header in `next.config.ts` with both set |
| Content export `backup/` Blob set to public | Draft content and messages readable by URL | `access: 'private'` for backups; public only for images and the CV |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Auto-redirecting `/` to `/es` from `Accept-Language` | Canadian recruiter with a Spanish OS lands on Spanish; crawlers confused | `localeDetection: false`; explicit `LangSwitch` that preserves the current page |
| LangSwitch that drops to the home page | Loses place in a case study | Map localized pathnames both ways via next-intl `Link`/`pathnames` |
| Case study that reads as a feature list | Fails the stated core value ("knows how to decide and deliver") | Enforce the four questions per project in the admin form (problem, role, result, decision) with required fields for published status |
| Metrics with no provenance | Reads invented; recruiters discount everything else | Only numbers with a source in `docs/content/`; otherwise qualitative |
| Reveal + SplitText + scroll scene on every page | Feels like a template, hurts reduced-motion users | Respect the budget: one reveal, one SplitHeading on the hero only, at most one ScrollScene per page |
| Status line that lies ("Available now") | Trust damage | Admin-driven `availability_status` + `available_from`; render nothing if unset |
| Dark mode flash | Perceived jank on the very first impression | Blocking theme script |
| PDF with English hyphenation in Spanish | Looks careless to Spanish-speaking clients | Spanish hyphenation callback or none |

## "Looks Done But Isn't" Checklist

- [ ] **i18n under cache:** `/es` renders Spanish after a cold deploy and after an admin edit; `next start` locally shows no `next-request-in-use-cache`.
- [ ] **Static params:** build passes with the real DB and with an empty DB (fallback branch); unknown slug returns 404 in both locales.
- [ ] **Auth:** forged `better-auth.session_token` cookie gets redirected by proxy *and* rejected by the layout and by a direct Server Action call; sign-up endpoint returns 400.
- [ ] **PDF:** both PDFs contain `ñ`, `á`, `é`, `í`, `ó`, `ú` (automated text extraction), weights differ visually, generated on publish, served from Blob, under 1 MB.
- [ ] **CSP:** zero violations in the console on `/`, `/projects/[slug]`, `/about`, `/contact`, both locales, light and dark, with the theme script and GSAP running.
- [ ] **Theme:** no flash on reload in dark mode; `prefers-reduced-motion: reduce` disables the view transition, the reveal, SplitText and ScrollScene.
- [ ] **hreflang/OG:** each public page has `en`, `es`, and `x-default` alternates and locale-specific OG title/description/image from `site_settings`.
- [ ] **Content:** no string literals of site content in components (grep for Spanish/English sentences in `src/`); hidden sections when data is missing.
- [ ] **Contact:** honeypot rejects bots, limiter blocks after N posts, missing `RESEND_API_KEY` yields a clear error, message stored with `ip_hash`.
- [ ] **Blob:** 6 MB screenshot upload succeeds via client upload; `next/image` serves it; `alt` in both languages.
- [ ] **Export:** publishing on Vercel does not throw on `fs`; backup lands in Blob as private.
- [ ] **Perf:** Lighthouse mobile >= 95 on 8 route/locale combinations measured on the Vercel preview, not localhost; LCP element is text in the hero, not an image.
- [ ] **a11y:** axe reports no serious/critical; SplitText heading reads as a sentence in VoiceOver; focus ring visible on the terracota link states.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Cache Components + next-intl will not build by day 3 | MEDIUM | Pre-approved Plan B: `cacheComponents: false`, `revalidate` + `revalidateTag` ISR, keep `next/root-params` in Server Components, keep tags. Log in `docs/decisions.md` |
| Locale leaking across cache entries | LOW | Confirm `next >= 16.3.8`; ensure the inner function reads `locale()` itself; redeploy (cache key includes build ID) |
| Admin locked out (seed failed, sign-up disabled) | LOW | Run CLI `create-admin` or env-gated seed against the branch; rotate `BETTER_AUTH_SECRET` if credentials were exposed |
| PDF broken on Vercel only | LOW/MEDIUM | Switch to absolute paths + tracing includes; if react-pdf and React 19.3 conflict, generate the PDF in a CI job (Node) on publish and upload to Blob instead of inside the function |
| Nonce CSP shipped and pages broke | LOW | Replace with the static header variant; redeploy |
| Preview schema drift | LOW | Add `db:migrate` to the build command; reset the Neon preview branch from `main` |
| Content late | HIGH (schedule) | Reorder: Phase 2 and the admin skeleton can proceed with the seed reading whatever exists; block only Phase 3's gate and Phase 4's case-study pages on content, not the whole timeline |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Content not ready / invented metrics | Phase 1 | Inventory checklist complete; every metric has a source file |
| Font files (web + PDF static TTF) | Phase 1 | Files in `src/assets/fonts/` and `assets/fonts-pdf/`; static instances per weight |
| Locale under Cache Components | Phase 2 (day 3 spike) | `next build` + `next start` clean; `/es` correct after cold deploy |
| `generateStaticParams` with DB slugs | Phase 2 | Build green on `main` and on a fresh preview branch |
| Better Auth placement, plugin order, sign-up disabled, admin seed | Phase 2 | Playwright login e2e; forged-cookie test; sign-up 400 |
| Neon driver / migrations / preview branches | Phase 2 | Admin write with multi-table change on preview succeeds; migrations in build log |
| CSP skeleton | Phase 2 | Report-only header present on preview |
| Synchronous IO rule | Phase 2 (rule), Phase 4 (StatusLine) | Build has no Date/Math.random prerender errors |
| PDF fonts, paths, generation on publish | Phase 3 | Automated accent check on both PDFs; Blob URL served |
| Tiptap SSR and static renderer | Phase 3 / Phase 4 | No hydration warnings; no `@tiptap/react` in public route bundles (`next build` output) |
| Blob client uploads + remotePatterns | Phase 3 | 6 MB upload e2e; images render via `next/image` |
| `exportContent` on Vercel | Phase 3 | Publish on preview succeeds; private backup exists |
| Theme script + View Transitions | Phase 4 | No flash; reduced-motion disables transitions |
| GSAP fonts/aria/reduced motion/Activity | Phase 4 | SplitText after `fonts.ready`; axe clean; route back/forward re-runs ScrollTrigger |
| Locale detection, pathnames, hreflang/OG | Phase 2 (routing), Phase 4 (metadata) | `curl -H 'Accept-Language: es' /` returns English; alternates present |
| Contact: Resend DNS, Upstash fail-open, honeypot | Phase 4 (request keys on day 8 morning) | Rate limit e2e; email delivered from `mateojaras.dev` |
| Font loading vs LCP | Phase 4 | Lighthouse mobile >= 95 on all 8 combos on the preview |
| Analytics CSP and matcher | Phase 5 | Beacons visible in Vercel Analytics; no CSP violations |
| a11y of split headings and focus | Phase 5 | axe + VoiceOver pass |

## Sources

**Official, bundled with the installed Next.js 16.4.3 (HIGH):**
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md` (not in Client Components, Server Actions, Route Handlers; cache key behaviour; `generateStaticParams` required with Cache Components)
- `.../03-api-reference/04-functions/generate-static-params.md` (at least one param; placeholder caveat)
- `.../03-api-reference/01-directives/use-cache.md` (request APIs forbidden; passes build, fails at runtime; serverless in-memory caveats; nested short-lived caches)
- `.../03-api-reference/05-config/01-next-config-js/cacheComponents.md` (`partialPrefetching`, Node runtime only, Activity navigation)
- `.../02-guides/migrating-to-cache-components.md` (`instant = false`, synchronous IO build errors, `cookies()/headers()` under Suspense, `runtime` export removal, route handlers)
- `.../02-guides/authentication-with-cache-components.md` (session reads behind Suspense, never in plain `use cache`, plain-text cache keys)
- `.../02-guides/content-security-policy.md` (nonce requires dynamic rendering; PPR incompatible; `unsafe-inline` and SRI alternatives)
- `.../02-guides/preventing-flash-before-hydration.md` (blocking inline script, `suppressHydrationWarning`, `TZ=UTC` tip)
- `.../02-guides/internationalization.md`, `.../01-getting-started/16-proxy.md`, `.../03-api-reference/05-config/01-next-config-js/serverExternalPackages.md` (`@react-pdf/renderer` in the default list), `.../output.md` (file tracing)

**Official library docs via Context7 (MEDIUM):**
- next-intl: https://next-intl.dev/docs/routing/setup, https://next-intl.dev/docs/routing/configuration, https://next-intl.dev/docs/routing/middleware, https://next-intl.dev/blog/nextjs-root-params (2026-08-04)
- Better Auth: https://better-auth.com/docs/integrations/next, https://better-auth.com/docs/concepts/cli (`create-admin`), https://better-auth.com/docs/concepts/session-management, https://better-auth.com/docs/guides/dynamic-base-url
- Drizzle: https://orm.drizzle.team/docs/connect-neon, drizzle-kit migration folder changes
- react-pdf: https://react-pdf.org/docs/v4/fonts, https://react-pdf.org/docs/v4/node, https://react-pdf.org/docs/v4/compatibility
- Tiptap: https://tiptap.dev/docs/editor/getting-started/install/nextjs, https://tiptap.dev/docs/editor/api/utilities/static-renderer
- GSAP: https://gsap.com/docs/v3/Plugins/SplitText, https://gsap.com/docs/v3/GSAP/gsap.matchMedia(), https://github.com/greensock/react
- Vercel Blob: https://vercel.com/docs/vercel-blob/public-storage, https://vercel.com/docs/vercel-blob/server-upload, https://vercel.com/docs/vercel-blob/client-upload
- Upstash Ratelimit: https://upstash.com/docs/redis/sdks/ratelimit-ts/features, https://upstash.com/docs/redis/sdks/ratelimit-ts/methods

**Advisories and community (LOW unless noted):**
- CVE-2026-103004, Next.js 16.3.0 to 16.3.7 root-param cache key leak, fixed 16.3.8: https://app.opencve.io/cve/CVE-2026-103004 (HIGH for the fact; verified against NVD text)
- Neon Vercel previews integration and build-command migrations: https://neon.com/docs/guides/vercel-previews-integration; first-build race: https://community.neon.tech/t/vercel-integration-adds-config-variables-too-late-when-new-branch-is-pushed/863
- neon-http transaction error reports: https://community.neon.tech/t/how-do-i-handle-transactions/1067, https://www.answeroverflow.com/m/1149370348593217619
- Aurora Scharff, next-intl with Cache Components demo: https://github.com/aurorascharff/next-intl-cache-components
- Vercel Analytics CSP: https://vercel.com/docs/speed-insights/package, https://community.vercel.com/t/speed-vitals-failing-csp/17861
- Font loading and fallbacks: https://vercel.com/academy/nextjs-foundations/fonts-with-next-font, https://developer.chrome.com/blog/framework-tools-font-fallback
- react-pdf ENOENT font path on serverless (2023, Pages Router): https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/76429708/reactpdf-rendertofile-not-rendering-arabic-text
- Portfolio/case-study reviewer heuristics (UX-heavy, anecdotal): https://uxdesign.cc/only-30-seconds-to-reject-your-portfolio-8cb14ac70674, https://dev.to/robobobboy/i-audited-50-developer-portfolios-heres-what-they-all-get-wrong-j84, https://blog.uxfol.io/case-study-mistakes/

**Not verified (flagged for phase research):**
- react-pdf v4 + React 19.3 reconciler compatibility (spike in Phase 3, day 5)
- Tiptap v3 default `shouldRerenderOnTransaction` behaviour (check during Phase 3)
- Next 16 `images.qualities` default (check `next.config.ts` typing during Phase 3)
- Exact Spanish hyphenation support in `@react-pdf/hyphenate` (check package exports in Phase 3)

---
*Pitfalls research for: mateojaras.dev, bilingual portfolio + custom admin on Next.js 16.4 / Vercel*
*Researched: 2026-10-29*
