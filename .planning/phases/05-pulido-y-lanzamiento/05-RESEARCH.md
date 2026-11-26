# Phase 5: Pulido y lanzamiento - Research

**Researched:** 2026-11-25
**Domain:** Launch hardening on Next.js 16.4.6 (cacheComponents + PPR): real HTTP 404 from `proxy.ts`, localized 404 with two root layouts, CSP enforce, Vercel Web Analytics, CI e2e, file-based favicon, custom domain on Vercel + Porkbun, agent reviews
**Confidence:** HIGH for the 404 mechanism (reproduced locally on 16.4.6), Blob host, analytics loading and CSP. MEDIUM for Vercel-platform behaviour that can only be checked on a Preview (proxy module memo reuse, analytics unique-path routing, DNS values shown in the dashboard).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Analytics (QUAL-07)
- **D-01:** **Vercel Web Analytics** with `@vercel/analytics`. Teo approved the dependency by choosing it on 2026-11-25. No Speed Insights and no Umami. Remove `NEXT_PUBLIC_UMAMI_WEBSITE_ID` from `.env.example`. Teo enables Web Analytics in the Vercel dashboard when the task needs it, following the CLAUDE.md accounts rule: give him the exact steps.
- **D-02:** **Visits and referrers only.** No custom events (Vercel Hobby does not include them). It is cookieless, so there is no consent banner.
- **D-03:** The `<Analytics />` component loads **only on the public site** (`[locale]` layout), never in `/admin`. Teo's own visits to the public site count like anyone else's.

#### 404 (SITE-08)
- **D-04:** The 404 shows a short **logbook-style message** and below it the **list of published, visible projects** (reuse `EntryList`, the same order as the home), plus links to home and contact. The list query is the existing cached published-projects query. If there are no projects, the list does not render.
- **D-05:** Copy tone is **"bitácora, seco"**, with no jokes and no em-dashes. The idea: "404 · No hay ninguna entrada en esta dirección." with the requested path in mono. **Claude proposes the en/es text and Teo approves it**, because it is copy (CLAUDE.md autonomy rule). Strings go in `messages/en.json` and `messages/es.json` (`Site.notFound`) with parity. The language comes from the URL prefix only (prior decision: Accept-Language is ignored).
- **D-06:** **Fix the soft 404**: unknown or draft project slugs must return a real **HTTP 404**, checked in `src/proxy.ts` against the list of published slugs. The list must stay correct after the admin publishes or unpublishes, so a stale list must never 404 a just-published project. The researcher picks the mechanism (cached read, tag invalidation, or cost of a DB read per project request) within the Lighthouse budget. This reverses the accepted cost logged in `docs/decisions.md` (phase 2 signal 4, 04-10); update that entry. No new route. — **Reversibility:** reversible — it is a proxy check and can be removed.

#### Review (QUAL-08, re-scoped)
- **D-07:** Teo has no reviewers available ("no tengo a nadie, podrias revisarlo tu"). **QUAL-08 is re-scoped:** Claude runs **3 reviews with distinct profiles**: (1) a recruiter hiring in Canada/Europe, (2) a prospective freelance client, (3) a frontend/full-stack developer looking at code and detail. Each runs as a **separate agent** on **production (mateojaras.dev)**, in both languages, with Playwright. These three close the gate.
- **D-08:** Every review follows the **short guide with 3 tasks**: "What does Teo do and for whom?", "Read one case study: what did he decide?", "How would you contact him?", plus 2 open questions. Claude writes the guide in en/es so it can be reused for the human review in D-10.
- **D-09:** Findings go to a log (`docs/reviews.md`). Each finding ends up **fixed** (with its commit) or **dismissed** (with the reason and Teo's OK). Backlog-level findings go to `docs/backlog.md`. A finding counts as resolved only in one of those states. Log the re-scope in `docs/decisions.md` as Teo's decision, and update the QUAL-08 wording in REQUIREMENTS.md and the ROADMAP success criterion 4.
- **D-10:** **One real human review later, non-blocking.** The guide stays ready for when Teo finds someone (ex-Sofka colleague, client). Its findings go to the same log after launch.

#### Launch (QUAL-09)
- **D-11:** **Canonical domain is `mateojaras.dev`** (apex). `www.mateojaras.dev` returns a 308 to the apex. Porkbun DNS: A record on the apex and a CNAME for www, pointing to Vercel (remove the Porkbun parking records). Claude gives Teo the exact steps (Vercel → Domains, Porkbun records). Production env vars point at Neon `main`. Preview stays on `dev`. **Updated: connect the domain at the START of Phase 5**, not at the end. The site is already public on vercel.app, so there is no new exposure; DNS propagation and Search Console verification start earlier, and polish and reviews run on the real domain. After the switch, check that `BETTER_AUTH_URL` / `trustedOrigins`, `metadataBase`, canonical/hreflang URLs, sitemap, robots, OG URLs and `/resume.json` use `https://mateojaras.dev` (not the vercel.app host), and that admin login works on the apex.
- **D-12:** **Google Search Console on launch day**: DNS verification (TXT in Porkbun), sitemap submission, and an indexing check of the en and es URLs. Claude gives Teo the exact steps.
- **D-13:** **Content and positioning are NOT in this phase.** That was Phase 4.1, now **complete** and live in production. Phase 5 launches with the 4.1 content. Content changes in Phase 5 come only from review findings (D-18).
- **D-14 (updated):** Order: **domain on mateojaras.dev + Search Console** (D-11, D-12) → polish on a branch (a11y, 404 + soft-404 fix, CSP enforce, analytics, CI e2e, favicon) verified on Preview → merge to `main` (Production) → 3 reviews on mateojaras.dev **after** polish is live → fixes → gate.

#### Release flow (new)
- **D-15:** **Polish work goes on a branch, not straight to `main`.** It is verified on the Vercel Preview of that branch (Neon `dev`), then merged to `main` in one or two cuts. Going live is a merge to `main`, which needs Teo's go (outward-facing action). This matters most for the CSP switch to enforce: the zero-violation pass runs on Preview first, then again on Production after the merge.

#### CSP (new)
- **D-16:** **Teo approves adding the Vercel Blob hosts to `connect-src`** (`https://*.public.blob.vercel-storage.com` and the Vercel Blob client-upload endpoint on vercel.com; the researcher confirms the exact host the `@vercel/blob` 2.8.2 client calls). This closes the pending condition from `docs/decisions.md` 2026-11-22 (03-07, T-03-26 / AR-03-03). One policy for the whole site (no separate `/admin` CSP). After enforce, an admin image upload must still work (e2e or manual check on Preview).
- **D-17:** **`script-src` keeps `'unsafe-inline'`** when the CSP moves to enforce. No hashes and no SRI in v1 (static shell, no nonce, as in STACK.md). This resolves T-04-06 (hash ThemeScript and the clock script) as **accepted**: log it in `docs/decisions.md` and `04-SECURITY.md`. Hashes/SRI go to `docs/backlog.md`.

#### Review fixes and 4.1 leftovers (new)
- **D-18:** **Content findings from the reviews are fixed through the production admin.** Claude proposes the new text in en/es, Teo approves it and enters it in the admin on mateojaras.dev. The 4.1 loader script is **not** run again against `main` in this phase. Code/design findings are fixed in code on a branch (D-15).
- **D-19:** **CR-01 and WR-01..07 from `04.1-CODE-REVIEW.md`** (all about the content loader script) go to **`docs/backlog.md`**, not this phase. The script did its job and does not affect the public site. The backlog entry must say they must be fixed before the loader is used again (CR-01 and WR-06 silently discard drafts).

#### Favicon (new, added by Teo)
- **D-20:** **"MJ" monogram favicon**, Funnel Display, terracotta accent on the paper background, with a dark variant. Claude draws it from the DESIGN.md tokens, shows Teo 2–3 variants rendered at real sizes (16, 32, 180 px, light and dark tabs), and **Teo approves one** before it ships (it is identity, CLAUDE.md autonomy rule). It replaces the default `src/app/favicon.ico`. No new dependency. It must comply with DESIGN.md: no rounded tile behind the letters, no gradient. Log the approval in `docs/decisions.md`.

### Claude's Discretion
- **CI e2e (QUAL-05):** add an e2e job to `.github/workflows/ci.yml` against the Neon `dev` branch (secrets already used by `check`), running the login, project CRUD and contact specs. Contact in CI must not send real email or require live Upstash. Use the existing env-check behavior and specs (`e2e/contact.spec.ts` vs `contact-live.spec.ts`), and never add a silent mock that fakes success in production code.
- **CSP enforce (QUAL-06):** switch `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `next.config.ts` after one pass with zero violations on all public routes (en/es, light/dark, reduced motion) **and the admin** (login, editor, image upload, CV generation), with analytics active. Vercel Analytics is same-origin (`/_vercel/insights`), so check whether `script-src`/`connect-src` need changes. Lighthouse ≥ 95 must not regress (baseline now `04.1-PROD-VERIFY.md`: 96–97, LCP `/` 2.29 s; `04-LIGHTHOUSE.md` is the older one). Keep the Preview-only `vercel.live` allowance.
- **Favicon technique (D-20):** file-based metadata (`icon.svg` with a `prefers-color-scheme` dark variant, plus PNG fallbacks and `apple-icon`), static files or `ImageResponse` with the self-hosted Funnel Display; convert the letters to paths if the SVG would otherwise depend on the font. Applies to both root layouts (`[locale]` and `admin`). Whether to add a web manifest is Claude's call (no new route beyond Next's metadata files).
- **404 for unmatched URLs** (`/foo`, `/es/foo`): make sure they render the localized 404 (multiple root layouts: `[locale]` and `admin`). The researcher checks `global-not-found` vs the current `[locale]/not-found.tsx` and how next-intl rewrites interact.
- **A11y + reduced motion pass (QUAL-03):** keyboard-only walk of every public route in both languages, focus visible, axe with no serious/critical (`e2e/axe.ts`), reduced motion confirms phase 4 behavior. The 404 gets the same screenshots (390/768/1440, light/dark) and impeccable audit/critique as the other public views.
- Whether analytics also loads on Preview deployments (default: production only).

### Deferred Ideas (OUT OF SCOPE)
- ~~Phase 4.1: Contenido y posicionamiento full stack + AI~~ — done (2026-11-25).
- Content loader fixes (CR-01, WR-01..07 of 04.1-CODE-REVIEW.md) → `docs/backlog.md` (D-19).
- Hash- or SRI-based `script-src` (drop `'unsafe-inline'`) → `docs/backlog.md` (D-17).
- Human review (1 person), non-blocking, after launch (D-10).
- Custom analytics events (CV download, contact submit, Cal.com click): not now; would need Umami or Vercel Pro.
- Speed Insights: not now.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-08 | Existe una página 404 en ambos idiomas | §"404: the mechanism" (catch-all + proxy rewrite, reproduced locally with 404 status and localized layout); §Pitfalls 1–3 (error shell, inert ThemeScript, title) |
| QUAL-03 | WCAG AA, foco visible, teclado, axe sin serious/critical | §"A11y coverage gaps" (es routes and 404 missing from keyboard spec, axe not run in dark, 404 not in reduced-motion spec) |
| QUAL-05 | E2E de login, CRUD de proyecto y contacto | §"CI e2e" (job shape, secrets ADMIN_EMAIL/ADMIN_PASSWORD missing from GitHub, fail-closed contact path, global concurrency) |
| QUAL-06 | CSP en bloqueo sin violaciones | §"CSP enforce" (directive table, exact Blob host `https://vercel.com/api/blob`, full Vercel Toolbar allowance for Preview, violation listener) |
| QUAL-07 | Analytics con la CSP ajustada | §"Vercel Web Analytics" (2.0.1 source read: same-origin script and endpoints, mode from NODE_ENV, gating by VERCEL_ENV) |
| QUAL-08 | Revisión (re-scoped to 3 agent personas, D-07..D-09) | §"Agent reviews" (isolation, no-submit rule, log format) |
| QUAL-09 | Producción en mateojaras.dev | §"Domain switch" (every URL source in code, env vars to change, CV regeneration, Vercel + Porkbun + Search Console steps) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Read `AGENTS.md` and the bundled docs in `node_modules/next/dist/docs/` before writing Next code; use context7 for API doubts. Do not edit the `nextjs-agent-rules` block.
- Stack fixed; ask before adding or changing dependencies (D-01 already approves `@vercel/analytics`; nothing else is added in this research).
- **Ask before adding routes.** The localized 404 needs one route file (`src/app/[locale]/[...rest]/page.tsx`). See Open Question 1: this needs Teo's explicit OK.
- Ask before touching `DESIGN.md`, `docs/copy.md`, palette/typography, `docs/data-model.md` or a migration. Nothing here touches them.
- Accounts rule: when a task needs a variable not in `.env.local`, stop and give Teo (1) the service, (2) dashboard steps, (3) the variable and where to put it. Code stays behind an env check, never a mock.
- Interface strings live in `messages/en.json` and `messages/es.json` (parity enforced by `src/lib/messages.test.ts`); content lives in the DB.
- Server Components by default; `'use client'` only on interactive leaves. GSAP only inside `src/components/motion/`.
- No em-dashes in copy, no emojis in UI, no rounded tiles behind icons, no gradients.
- One commit per task, conventional messages; `pnpm check` green before a closing commit.
- After each public view: Playwright screenshots at 390/768/1440 light and dark, `/impeccable:audit` and `/impeccable:critique`.
- Lighthouse mobile ≥ 95 on `/`, `/projects/[slug]`, `/about`, `/contact` (en and es); LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. WCAG AA, axe without serious/critical.
- Log every non-trivial decision in `docs/decisions.md` (who decided what and why).
- Never write keys into versioned files. CSP and security headers live in `next.config.ts`.
- GSD workflow: changes go through `/gsd-execute-phase`.

## Summary

The single hardest question in this phase is the 404, and it has a clean answer. The bundled Next 16.4 docs say it directly: with Cache Components the prerendered shell always starts a `200`, and "to return a request-time 404, use Proxy before the page renders" (`02-guides/streaming.md`, "The HTTP contract"). They also say `'use cache'` has no effect in Proxy and that `cacheTag` throws there (`01-directives/use-cache.md` lines 422–424). So the proxy cannot share the page's tagged cache, and `updateTag(projects)` can never reach it. I built a minimal Next 16.4.6 app with the project's shape (`cacheComponents`, `partialPrefetching`, two root layouts, `[locale]/not-found`, slug read inside Suspense) and confirmed the recipe end to end. A `[locale]/[...rest]/page.tsx` that only calls `notFound()` makes `/foo` and `/es/foo` answer **HTTP 404 with the localized layout and not-found UI**. A proxy that rewrites an unknown slug to `/{locale}/<anything-unmatched>` gives `/projects/nope` and `/es/proyectos/nope` a **real 404** in the right language. Without the catch-all, unmatched URLs answer 404 with Next's default English page. Production shows that today: `/foo` serves "404: This page could not be found.". `global-not-found` cannot fix this: it bypasses the layouts, so it cannot know the locale, and it is experimental.

For freshness without a per-request DB hit, I recommend a **positive-only memo in the proxy, an authoritative DB check on a miss, and fail-open everywhere**. A slug in the memo passes immediately, and a stale memo refreshes in the background with `event.waitUntil`. A slug not in a warm memo triggers one blocking `neon-http` read, so a just-published project passes and an unknown one gets a 404. A cold memo, a DB error or a timeout lets the request through, and the page's existing in-Suspense `notFound()` still renders a soft 404 with noindex. This keeps the DB off the path of real visitors to real projects. That matters because the case-study LCP margin is only about 0.3 s (2.19 s against 2.5 s), and Neon is idle most of the time because every public read is cached. A just-published project can never be 404'd, because a miss always re-checks the database.

The rest is configuration with verified facts. The `@vercel/blob` 2.8.2 client uploads to **`https://vercel.com/api/blob`** (`defaultVercelBlobApiUrl` in `dist/chunk-XKVPKJPO.js`). `@vercel/analytics` 2.0.1 loads a same-origin script, so `'self'` covers it with no CSP change. The site URL is env-driven (`NEXT_PUBLIC_SITE_URL`, which production currently sets to the vercel.app host), so the domain switch is an env change plus a redeploy plus a **CV regeneration**, because the stored PDFs embed the URL. One launch risk sits outside the listed requirements: Resend and Upstash were never configured, so the production contact form fails closed with a mailto fallback. Reviewer task 3 ("How would you contact him?") will run into that.

**Primary recommendation:** Do the domain switch first, with no code involved. Then, on one polish branch, build the tracer: the `[...rest]` catch-all (after Teo approves the route file), then the proxy slug guard, then the redesigned not-found. Verify a real 404 on a Preview before anything else, then layer on CSP enforce + analytics, CI e2e, favicon and the a11y sweep.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HTTP 404 for unknown/draft slugs | Proxy (`src/proxy.ts`, Node runtime) | DB (neon-http, miss path only) | Only the proxy runs before the PPR shell commits a 200 (bundled streaming.md) |
| 404 for unmatched URLs + localized UI | Frontend server (`[locale]/[...rest]` + `[locale]/not-found.tsx`) | Proxy (next-intl rewrite supplies the locale) | Root params give the locale; the catch-all routes unmatched paths into the `[locale]` segment |
| Requested path shown on the 404 | Browser (client leaf with `usePathname`) | — | The prerendered 404 can't know the path; `usePathname` returns the visible URL even after a proxy rewrite (verified) |
| Project list on the 404 | Frontend server (`getProjects()` `'use cache'` + tag `projects`) | — | Same cached query as the home (D-04) |
| CSP | CDN/headers (`next.config.ts` `headers()`) | — | Static header keeps the static shell (no nonce) |
| Analytics | Browser (client component, deferred same-origin script) | Vercel platform (`/_vercel/insights/*`, `/<unique-path>/*`) | Script and beacons are served by the platform, not by the app |
| Favicon | CDN/static (`src/app/icon.svg`, `apple-icon.png`, `favicon.ico`) | — | Static metadata files at the `app/` root apply to both root layouts (production shows the current `favicon.ico` link on `/` and `/admin/login`) |
| Domain, TLS, www→apex 308 | Vercel platform + Porkbun DNS | — | Dashboard configuration, no code |
| Canonical/sitemap/robots/resume URLs | Frontend server (`siteUrl()`, `NEXT_PUBLIC_SITE_URL`) | — | Env-only by design (`src/lib/site-url.ts`) |
| CI e2e | GitHub Actions | Neon `dev` | Build + start locally in the runner against `dev` |

## Standard Stack

### Core (already installed, versions read from `package.json`)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.4.6 | Proxy, not-found, metadata files, headers | Fixed stack. Bundled docs are authoritative |
| next-intl | ^4.14.9 | Locale rewrites in proxy | Its docs prescribe `[locale]/[...rest]/page.tsx` → `notFound()` for unknown routes [CITED: context7 /amannn/next-intl/v4.14.9 error-files.mdx] |
| @neondatabase/serverless + drizzle-orm | 1.2.0 / 0.45.4 | Miss-path slug check in proxy | Fetch-based, works in the Node proxy. `createDb` in `src/db/client.ts` has no `server-only` guard |
| @vercel/blob | 2.8.2 | Client upload host for `connect-src` | Read from the installed source |
| @playwright/test + @axe-core/playwright | 1.64.1 / 4.14.0 | e2e, CSP violation capture, review agents | Already the project's harness |

### New (approved by D-01)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vercel/analytics | 2.0.1 (latest dist-tag, published 2026-03-12) | Web Analytics `<Analytics />` from `@vercel/analytics/next` | Mounted only in `src/app/[locale]/layout.tsx` [VERIFIED: npm registry + CITED: vercel.com/docs/analytics/package] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `[locale]/[...rest]` catch-all | `experimental.globalNotFound` + `app/global-not-found.tsx` | Experimental. It bypasses both root layouts (no header/footer, fonts and CSS re-imported) and gets no root params, so it cannot be localized server-side. Rejected |
| Proxy memo + DB on miss | DB read on every `/projects/*` request | It also runs on every RSC prefetch (6 links on the home) and puts Neon wake-up on the TTFB of real visitors. Risks the 0.3 s LCP margin. Rejected |
| Proxy memo + DB on miss | Proxy fetching the cached `/sitemap.xml` | No DB, but it adds a fetch to every request, needs XML parsing, and breaks on Preview behind Deployment Protection. Rejected |
| Proxy memo + DB on miss | Vercel Edge Config | New external service (CLAUDE.md asks first). Not needed |
| `NextResponse.rewrite(url, { status: 404 })` to a normal page | — | `next start` sets `res.statusCode` from the proxy response (`resolve-routes.js` line 377), but a prerendered page's cached status can override it, and on Vercel the behaviour is undocumented (the NextResponse docs show no `init.status` for rewrite). Not used |
| Static favicon files | `icon.tsx` with `ImageResponse` | A generated `/icon` URL has no dot, so the proxy matcher would send it through next-intl (the same reason the matcher already excludes `opengraph-image`). Static files avoid a matcher change |

**Installation:**
```bash
pnpm add @vercel/analytics@2.0.1
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| @vercel/analytics | npm | created 2022-10-24; 2.0.1 on 2026-03-12 | not checked | github.com/vercel/analytics | not run (see note) | Approved (D-01, Teo). Named in official Vercel docs; no `postinstall` script (`npm view … scripts`: build/dev/test only); tarball source read in this session |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
*slopcheck is installed, but its only checking command (`slopcheck install`) also installs the package, so I did not run it. The package is confirmed by official Vercel docs and the registry, and Teo already approved it in D-01. No extra human-verify checkpoint is needed beyond D-01.*

## Architecture Patterns

### System Architecture Diagram

```
Browser request ──► Vercel edge ──► platform routes (/_vercel/insights/*, /<unique-path>/*) ─► Analytics intake
                         │
                         ▼
                 proxy.ts (Node)
                 ├─ /admin/* ──► optimistic cookie check ──► admin root layout
                 └─ else ──► next-intl handleI18n(req)
                               │  (redirect? return it)
                               ▼  x-middleware-rewrite = /{en|es}/...
                        is it /{l}/projects/{slug}?
                         no ─► pass response through
                         yes ─► draft cookie (__prerender_bypass)? ─► pass
                                 │ no
                                 ▼
                        memo has slug? ─yes─► pass (refresh in waitUntil if stale)
                                 │ no
                        memo cold? ─yes─► pass + waitUntil(refresh)   [soft-404 fallback]
                                 │ no (warm miss)
                        DB: published+visible slugs (timeout) ─error─► pass
                                 │ ok
                        slug in fresh list? ─yes─► pass
                                 │ no
                                 ▼
                 NextResponse.rewrite(/{l}/__missing) ─► [locale]/[...rest] → notFound()
                                 ▼
                 [locale]/layout (root params l) + [locale]/not-found.tsx  ──► HTTP 404, noindex
                       └─ getProjects() 'use cache' tag projects → EntryList
                       └─ <RequestedPath/> client leaf (usePathname)
```

### Recommended Project Structure (new/changed files only)
```
src/
├── proxy.ts                               # + slug guard after handleI18n
├── lib/published-slug-guard.ts            # pure memo/decision logic (unit-tested, injected loader/clock)
├── features/projects/slug-index.ts        # loader: createDb(DATABASE_URL) + publishedSlugsQuery(handle); no server-only, no next/cache
├── app/
│   ├── icon.svg                           # MJ paths + @media (prefers-color-scheme: dark)
│   ├── apple-icon.png                     # 180x180
│   ├── favicon.ico                        # replaced: PNG-in-ICO 32+48
│   └── [locale]/
│       ├── [...rest]/page.tsx             # notFound() only  (needs Teo OK: route file)
│       ├── not-found.tsx                  # redesigned (D-04/D-05)
│       └── layout.tsx                     # + <SiteAnalytics/> gated by VERCEL_ENV
├── components/site/requested-path.tsx     # 'use client' usePathname leaf
└── components/site/site-analytics.tsx     # wraps <Analytics/> (server gate)
e2e/
├── not-found.spec.ts                      # status + locale + list + noindex, en/es, light/dark
├── csp.ts                                 # shared violation collector
└── headers.spec.ts                        # asserts enforce header, uses collector, dynamic slug
.github/workflows/ci.yml                   # + e2e job
```

### Pattern 1: Proxy slug guard (D-06)
**What:** Run next-intl first, read its internal rewrite target, and for `/{l}/projects/{slug}` decide pass or 404 with a positive-only memo.
**When:** Every request the matcher sends to the proxy (HTML and RSC/prefetch alike; Next strips Flight headers in proxy, so the two cannot be told apart, per proxy.md line 476).
**Example:**
```ts
// src/proxy.ts (shape; names are suggestions)
import type { NextFetchEvent, NextRequest } from "next/server";
export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) { /* unchanged */ }
  const res = handleI18n(req);
  const target = res.headers.get("x-middleware-rewrite");
  const m = target ? new URL(target).pathname.match(/^\/(en|es)\/projects\/([^/]+)\/?$/) : null;
  if (!m || req.cookies.has("__prerender_bypass")) return res;
  const slug = decodeURIComponent(m[2]);
  const ok = await isPublishedSlug(slug, { load: loadPublishedSlugs, waitUntil: (p) => event.waitUntil(p) });
  return ok ? res : NextResponse.rewrite(new URL(`/${m[1]}/__missing`, req.url));
}
```
```ts
// src/lib/published-slug-guard.ts (decision logic; unit-test every branch)
const TTL_MS = 60_000, TIMEOUT_MS = 1_500;
let memo: { slugs: Set<string>; at: number } | null = null;
export async function isPublishedSlug(slug, { load, waitUntil, now = Date.now }) {
  const refresh = () => withTimeout(load(), TIMEOUT_MS).then((s) => { memo = { slugs: new Set(s), at: now() }; }).catch(() => {});
  if (memo?.slugs.has(slug)) { if (now() - memo.at > TTL_MS) waitUntil(refresh()); return true; }
  if (!memo) { waitUntil(refresh()); return true; }          // cold: fail open
  try { const s = await withTimeout(load(), TIMEOUT_MS); memo = { slugs: new Set(s), at: now() }; return memo.slugs.has(slug); }
  catch { return true; }                                      // DB trouble: fail open
}
```
Notes:
- Never memoize negatives. That is what guarantees "never 404 a just-published project".
- Unpublish freshness: a slug that was just unpublished can still pass for up to the TTL plus one refresh. The page's own `notFound()` (its cache is invalidated by `updateTag(projects)`) still shows the not-found UI with noindex during that window. Accept it and log it.
- Draft Mode (`__prerender_bypass`, `next/dist/server/api-utils/index.js` line 120) must bypass the guard, or the admin's draft preview of an unpublished slug breaks.
- Refactor `getPublishedSlugsCore()` into `publishedSlugsQuery(handle)` (the same pattern as `projectsQuery`) so the proxy loader and `generateStaticParams` share one filter. Do not import `src/db/index.ts` (it imports `server-only`) or `features/projects/queries.ts` (it uses `next/cache`) in the proxy.
- Make `proxy` `async` and accept `NextFetchEvent` (documented signature, proxy.md line 165).
- Rewrite target: any path that no route matches under `[locale]` works. `/{l}/__missing` is matched by `[...rest]`. Verified that `/es/__not-found` returned 404 with `lang=es`.

### Pattern 2: Localized 404 for unmatched URLs
```tsx
// src/app/[locale]/[...rest]/page.tsx  (route file, needs Teo's OK; next-intl documented recipe)
import { notFound } from "next/navigation";
export default function CatchAll() { notFound(); }
```
Verified locally on 16.4.6 (webpack build of a minimal replica; Playwright, real Chromium):

| URL | Status | `<html lang>` | Rendered |
|-----|--------|---------------|----------|
| `/foo` | 404 | en | layout + `[locale]/not-found` + cached list + path `/foo` |
| `/es/foo` | 404 | es | same, Spanish |
| `/projects/nope` (proxy rewrite) | 404 | en | same, path `/projects/nope` |
| `/es/proyectos/nope` (proxy rewrite) | 404 | es | same |
| `/es/proyectos/late` (not in generateStaticParams, allowed) | 200 | es | case study |

Without the catch-all, `/foo` gets 404 with Next's default `_not-found` page (production today). No `generateStaticParams` is needed in the catch-all. The build prerenders a fallback shell (`◐ /[locale]/[...rest]`).

### Pattern 3: Analytics mount, public only
```tsx
// src/components/site/site-analytics.tsx (Server Component)
import { Analytics } from "@vercel/analytics/next";
export function SiteAnalytics() {
  const env = process.env.VERCEL_ENV;
  return env === "production" || env === "preview" ? <Analytics /> : null;
}
// in src/app/[locale]/layout.tsx, inside <body> after <SiteFooter/>
```
Facts from the 2.0.1 source (`dist/next/index.mjs`):
- `<Analytics>` is `'use client'`, wraps itself in `<Suspense fallback={null}>`, and uses `useParams`/`useSearchParams`/`usePathname`. Wrapped like that, it does not block the static shell.
- The script URL is `props.scriptSrc`, or `${NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH}/insights/script.js`, or `/_vercel/insights/script.js`. It is appended as `<script defer>`. In development mode (NODE_ENV `development`/`test`) it loads `https://va.vercel-scripts.com/v1/script.debug.js`. Production builds use same-origin, so **no CSP change** is needed in Production or Preview.
- Vercel v2 injects `NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG` at build with `/<unique-path>/script.js` and `/<unique-path>/view` [CITED: vercel.com/docs/analytics/package "Dynamic configuration"]. Still same-origin.
- Mode `auto` reads NODE_ENV, so a Preview build counts as "production" for the package. Loading on Preview is a deliberate choice: D-15 and the CSP discretion want the zero-violation pass "with analytics active" on Preview first. Locally and in CI (no `VERCEL_ENV`) nothing renders, which avoids a 404'd script and its console noise.

### Pattern 4: CSP enforce
Target policy (one site-wide policy, D-16/D-17):

| Directive | Value | Needed by |
|-----------|-------|-----------|
| default-src | `'self'` | — |
| script-src | `'self' 'unsafe-inline'` (+ `'unsafe-eval'` dev only) + Preview `https://vercel.live` | Next inline RSC/bootstrap scripts, ThemeScript, clock script, `__NEXT_CLIENT_RESUME` inline script on 404 error shells; analytics script is same-origin |
| style-src | `'self' 'unsafe-inline'` + Preview `https://vercel.live` | Motion/GSAP inline styles, sonner, next/font |
| img-src | `'self' blob: data: https://*.public.blob.vercel-storage.com` + Preview `https://vercel.live https://vercel.com` | Blob images, admin `blob:` previews, `/_next/image` |
| font-src | `'self'` + Preview `https://vercel.live https://assets.vercel.com` | next/font self-hosted |
| connect-src | `'self' https://vercel.com/api/blob/ https://*.public.blob.vercel-storage.com` + Preview `https://vercel.live wss://ws-us3.pusher.com` | Blob client upload (`https://vercel.com/api/blob/?pathname=…`, XHR with progress), RSC fetches, analytics beacons (same-origin) |
| frame-src | Preview only `https://vercel.live` | Toolbar |
| object-src / base-uri / form-action / frame-ancestors | `'none'` / `'self'` / `'self'` / `'none'` | unchanged |

- Blob host: `defaultVercelBlobApiUrl = "https://vercel.com/api/blob"`, and `requestApi()` builds `getApiUrl(pathname)` from it. An override is possible only through `VERCEL_BLOB_API_URL`/`NEXT_PUBLIC_VERCEL_BLOB_API_URL`, which are not set [VERIFIED: node_modules/@vercel/blob 2.8.2 dist/chunk-XKVPKJPO.js lines 110, 257–266, 744]. The trailing slash in `https://vercel.com/api/blob/` makes it a path-prefix source.
- Vercel Toolbar CSP list [CITED: vercel.com/docs/vercel-toolbar/managing-toolbar "Using a Content Security Policy"]. Today's Preview allowance has only `script-src`/`img-src`/`connect-src`/`frame-src vercel.live`, so in enforce mode the toolbar would raise violations on Preview. Either add the full list (Preview only) or send `x-vercel-skip-toolbar: 1` from Playwright runs against a Preview. Do both: the full list keeps manual Preview checks clean, and the header keeps automated runs deterministic.
- Change the header key to `Content-Security-Policy`. `e2e/headers.spec.ts` asserts `content-security-policy-report-only` today and must flip in the same commit.

### Pattern 5: CSP violation collector for e2e
```ts
// e2e/csp.ts
export async function collectCsp(page: Page) {
  const seen: string[] = [];
  await page.addInitScript(() => {
    (window as any).__csp = [];
    document.addEventListener("securitypolicyviolation", (e) =>
      (window as any).__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  page.on("console", (m) => { if (/Content[ -]Security[ -]Policy/i.test(m.text())) seen.push(m.text()); });
  return async () => [...seen, ...(await page.evaluate(() => (window as any).__csp ?? []))];
}
```
Run it over every public route in en/es, light and dark, reduced motion on and off (the motion paths add inline styles), the 404, and the admin flows: login, edit a project in Tiptap, image upload (needs `BLOB_READ_WRITE_TOKEN`, so run it on Preview or locally with the token), and CV generate. Replace the hard-coded slug `centro-estetico-manuj` in `headers.spec.ts` with `firstPublishedProject()`, because the dev branch data can differ.

### Anti-Patterns to Avoid
- **`'use cache'`/`cacheTag` in proxy code:** no effect, and `cacheTag` throws (use-cache.md 422–424).
- **Moving the slug read above Suspense in the case-study page:** reintroduces the 500-after-`updateTag(settings)` bug (`.planning/debug/case-study-500-after-updatetag.md`). The proxy guard leaves the page untouched.
- **Negative memo in the guard:** would 404 a project published within the TTL.
- **`dynamicParams = false`:** unsupported with Cache Components.
- **`icon.tsx`/`apple-icon.tsx` generated routes:** no-dot URLs go through the next-intl proxy. Use static files.
- **Mounting `<Analytics/>` in a shared component used by `/admin`:** violates D-03.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Localized 404 for unmatched paths | Path allowlist in proxy | `[locale]/[...rest]` → `notFound()` | Next routing already knows what matches. An allowlist drifts every time a route is added |
| 404 status | Custom 404 Response body from proxy | Proxy rewrite to an unmatched `[locale]` path | Keeps the real layout, header/footer, i18n and theme |
| Analytics beacon | Custom script/endpoint | `@vercel/analytics/next` | Route-aware pageviews, platform intake |
| Glyph outlines for the SVG favicon | Hand-traced paths | fontkit 2.0.4 already in the pnpm store (dependency of `@react-pdf/font`) from a **one-off scratch script**, not committed as a dependency | `font.layout('MJ')` + `glyph.path.toSVG()` produced real Funnel Display Bold outlines in this session (unitsPerEm 1200) |
| PNG rasterization | New image library | Playwright screenshot of the approved SVG at 16/32/48/180 (`omitBackground` where needed) | Already installed |
| ICO container | New dependency | Write PNG-in-ICO by hand (6-byte header + 16-byte entry per image + PNG bytes) in the same one-off script | All current browsers accept PNG-encoded ICO entries [ASSUMED] |

## Runtime State Inventory (domain switch)

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | CV PDFs in Blob (`resume/{en,es}/v{n}.pdf`) embed `siteUrl` from `NEXT_PUBLIC_SITE_URL` (`cv-data.ts` line 121). `/resume.json` output is cached (`'use cache'`, `cacheLife('max')`) and currently says `"url":"https://mateojaras-dev.vercel.app"` (verified with curl) | After the env change and redeploy, Teo regenerates the CV en/es from `/admin/cv` on the apex. The redeploy resets the resume cache (new build) |
| Live service config | Vercel Production env `NEXT_PUBLIC_SITE_URL` = vercel.app host (inferred from live robots/sitemap/canonical/resume output). Probably `BETTER_AUTH_URL` too. Vercel Domains: none. Porkbun: apex A 207.207.210.229/.107 (pixie parking), `www` CNAME → `pixie.porkbun.com` (probably a wildcard `*`). No Resend DKIM/SPF records exist | Teo: set `NEXT_PUBLIC_SITE_URL=https://mateojaras.dev` and `BETTER_AUTH_URL=https://mateojaras.dev` (Production only), add domains, replace DNS records, redeploy Production |
| OS-registered state | None. Verified: no cron, no local services involved | None |
| Secrets/env vars | `allowedHosts()` in `src/lib/auth-options.ts` uses `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets to the production custom domain once one is assigned [ASSUMED] | Verify admin login on `https://mateojaras.dev/admin/login` after redeploy. If it fails, `BETTER_AUTH_URL` (the fallback) covers it |
| Build artifacts | `NEXT_PUBLIC_*` is inlined at build, and the static shell plus cached outputs (metadataBase, sitemap, robots) are built with the old value | A Production **redeploy** after changing env (Vercel → Deployments → Redeploy, without build cache not required) |

## Common Pitfalls

### Pitfall 1: 404 pages are an empty "error shell" rendered client-side
**What goes wrong:** With cacheComponents on 16.4.6, any prerendered `notFound()` (catch-all or proxy-rewritten) is stored as `<html id="__next_error__">` with an empty body plus an inline `__NEXT_CLIENT_RESUME` fetch. The layout and not-found UI render in the browser from the RSC payload. Verified: `.next/server/app/es/__not-found.html` is that shell, with meta `"status": 404`. It was the same with `partialPrefetching` off and with a synchronous not-found.
**Why:** Next's `createErrorShell` path for HTTP-access-fallback errors in prerender (`app-render.js` ~line 1325).
**How to avoid:** Accept it. Status and noindex are correct, the 404 is not in the Lighthouse set, and real browsers render it. But e2e and axe on the 404 must `await expect(h1).toBeVisible()` before asserting, and the inline script must stay allowed in CSP (`'unsafe-inline'`).
**Warning signs:** curl shows no text, which is expected. A blank page in a JS-enabled browser is a real bug.

### Pitfall 2: ThemeScript is inert on the 404, so dark mode and `motion-ok` are lost
**What goes wrong:** `InlineScript` renders `type="text/plain"` on the client so hydration does not re-run it. On the error shell the `<head>` is produced by the client, so the theme script never executes: a stored or system dark theme is not applied and `motion-ok` is never added. [ASSUMED from code reading + Pitfall 1; verify with a dark screenshot]
**How to avoid:** Add a tiny client leaf on the 404 (or in `ThemeToggle`'s mount effect) that runs the same logic when `document.documentElement` has no theme marker yet. Check with the dark screenshots (390/768/1440) the phase already requires.

### Pitfall 3: Proxy memo may not survive between invocations on Vercel
**What goes wrong:** If each proxy invocation starts cold, the guard always fails open and never returns 404.
**How to avoid:** On the Preview, request a real slug, then an unknown slug twice. The second unknown must be a 404. If it never is, switch the cold branch to a blocking read with a short timeout (~400 ms) and re-measure Lighthouse on `/projects/<slug>`. [ASSUMED: Vercel reuses Node proxy instances under Fluid compute]

### Pitfall 4: Lighthouse regression from proxy work
The case-study LCP is 2.19 s against a 2.5 s limit (`04.1-PROD-VERIFY.md`). Any blocking DB call on the positive path eats that margin. The guard design keeps real-slug requests DB-free except on a cold memo with no background result yet (fail-open) or a just-published slug.

### Pitfall 5: Analytics unique-path vs the proxy matcher
`/_vercel` is excluded by the matcher, but the v2 `/<unique-path>/view` has no dot and is not excluded. Vercel documents these as platform routes added on deploy ("Enabling Web Analytics will add new routes scoped at `/_vercel/insights/*` and `/<unique-path>/*`" [CITED: vercel.com/docs/analytics/quickstart]), so they should be answered before the proxy, but that is not stated. **Verify on Preview:** the Network tab shows the `…/view` request with 2xx and the dashboard records the visit. Fallback: pass `scriptSrc="/_vercel/insights/script.js"` and `viewEndpoint="/_vercel/insights/view"`, which are covered by the existing matcher exclusion.

### Pitfall 6: Domain switch leaves stale URLs
These all have to move from the vercel.app host to the apex: canonical/hreflang/og:url (metadataBase), sitemap, robots, resume.json and the CV PDFs. Grep found no hard-coded `mateojaras-dev.vercel.app` in `src/` (only in `docs/decisions.md`). The static `"mateojaras.dev"` strings in `og.tsx`, `auth-gate.tsx` and `notify.ts` are already correct.

### Pitfall 7: Deleting the wrong Porkbun records
Remove only the parking records (apex ALIAS/A to pixie, the `www`/`*` CNAME to `pixie.porkbun.com`) and turn off Porkbun URL forwarding if it is on. Keep any TXT/MX. `.dev` is HSTS-preloaded: until Vercel issues the certificate (minutes after DNS resolves) the apex shows a TLS error. That is fine at current traffic.

### Pitfall 8: Contact form is fail-closed in production
`RESEND_API_KEY` and the Upstash/KV vars do not exist (`04-02-SUMMARY`, `04-07-SUMMARY`). The live form shows "I couldn't send your message right now" with a mailto. CI e2e is fine with that (it tests the fail-closed branch), but the reviewers' task 3 and real visitors will hit it. See Open Question 2.

### Pitfall 9: e2e assumptions that change with the guard
`public.spec.ts` line ~164 and `case-study.spec.ts`/`seo.spec.ts` comments accept `[200, 404]` for drafts/unknown slugs. After the guard they should assert 404. Because the memo is cold on a fresh `next start`, first prime with one request to a real slug, or assert 404 on the second request. `admin-projects.spec.ts` should add: a just-published fixture slug answers 200 on its first request (warm-miss path).

### Pitfall 10: CI e2e and shared Neon `dev`
`on: [push, pull_request]` runs twice for a PR branch, and Preview deployments and local dev share `dev`. Give the e2e job a global concurrency group (`group: e2e-neon-dev`, `cancel-in-progress: false`) and keep the specs' own fixture cleanup.

## Code Examples

### CI e2e job (shape)
```yaml
  e2e:
    needs: check
    runs-on: ubuntu-latest
    concurrency: { group: e2e-neon-dev, cancel-in-progress: false }
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      DATABASE_URL_UNPOOLED: ${{ secrets.DATABASE_URL_UNPOOLED }}
      BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
      ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}        # new secret (Teo)
      ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}  # new secret (Teo)
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - id: pw
        run: echo "v=$(pnpm exec playwright --version | awk '{print $2}')" >> "$GITHUB_OUTPUT"
      - uses: actions/cache@v4
        with: { path: ~/.cache/ms-playwright, key: pw-${{ runner.os }}-${{ steps.pw.outputs.v }} }
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm exec playwright test e2e/auth.spec.ts e2e/admin-projects.spec.ts e2e/contact.spec.ts e2e/not-found.spec.ts e2e/headers.spec.ts
      - if: failure()
        uses: actions/upload-artifact@v4
        with: { name: playwright-report, path: playwright-report }
```
- Upstash, Resend and Blob vars stay unset. `contact.spec.ts` asserts the fail-closed path (`HAS_LIMITER` false), `contact-live.spec.ts` and the Blob upload test skip with a printed reason. No production mock.
- `webServer` in `playwright.config.ts` runs `pnpm build && pnpm start -p 3100` and does not reuse a server when `CI` is set. `allowedHosts()` adds `localhost:3100` when `VERCEL` is unset. `auth.spec.ts` hard-codes `http://localhost:3100`, which is fine in CI.
- Existing GitHub secrets: `BETTER_AUTH_SECRET`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (verified with `gh secret list`). Teo must add `ADMIN_EMAIL` and `ADMIN_PASSWORD` (the values of the seeded admin on `dev`): GitHub → repo → Settings → Secrets and variables → Actions → New repository secret. The repo is public, but secrets are not exposed to fork PRs.
- Check the action versions against what `check` already uses (`checkout@v7`, `setup-node@v7`, `pnpm/action-setup@v6`). The `actions/cache` and `upload-artifact` majors are [ASSUMED]. Use the current majors.

### Favicon glyph extraction (one-off script, scratch only)
```js
// run with: node <scratch>/glyphs.mjs ; fontkit resolved from node_modules/.pnpm/fontkit@2.0.4
import * as fk from ".../fontkit@2.0.4/node_modules/fontkit/dist/module.mjs";
const font = fk.openSync("assets/fonts-pdf/FunnelDisplay-Bold.ttf"); // also SemiBold available
const run = font.layout("MJ"); let x = 0; const d = [];
run.glyphs.forEach((g, i) => { d.push(g.path.translate(x, 0).toSVG()); x += run.positions[i].xAdvance; });
// font units are y-up (unitsPerEm 1200): wrap in <g transform="translate(...) scale(s,-s)">
```
Token hex values for the SVG (OKLCH from `globals.css` converted, sRGB): light paper `#fcfaf6`, accent `#e56636`, ink `#171f2e`; dark bg `#0d1014`, accent `#f67d51`, ink `#efebe4`. Use hex in the SVG, because favicon renderers are not CSS engines. Dark variant: `<style>@media (prefers-color-scheme: dark){…}</style>` inside `icon.svg`. It follows the OS/browser scheme, not the site toggle. A full-bleed square paper background is not a "rounded tile". A transparent background is the other option to show Teo.

### Not-found (shape)
```tsx
// src/app/[locale]/not-found.tsx
export default async function NotFound() {
  const param = await locale(); const active = isLocale(param) ? param : "en";
  const [t, tp, rows, stacks] = await Promise.all([
    getTranslations({ locale: active, namespace: "Site.notFound" }),
    getTranslations({ locale: active, namespace: "Site.project" }),
    getProjects(), getProjectStacks()]);
  return (<section>…<h1>{t("title")}</h1><RequestedPath />…
    <EntryList rows={rows} stacks={stacks} locale={active} labels={{ internalTool: tp("internalTool") }} />
    <Link href="/">{t("home")}</Link> <Link href="/contact">{t("contact")}</Link></section>);
}
```
Only the root `app/not-found` and `global-not-found` support `metadata` (not-found.md). For a `<title>`, render a React 19 `<title>` element in the component, or rely on the layout's `generateMetadata` (site name). Next injects noindex automatically.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `notFound()` in page for 404 status | Proxy decides before render; page `notFound()` is soft (200 + noindex) under PPR | Cache Components (Next 16) | D-06 needs the proxy |
| `@vercel/analytics` 1.x `/_vercel/insights/*` only | 2.x "Resilient Intake" `/<unique-path>/*` via build-time client config | 2.0 (2026-03) | Same-origin. Check the proxy matcher interplay (Pitfall 5) |
| Vercel A `76.76.21.21`, CNAME `cname.vercel-dns.com` | Dashboard shows project-specific values (CNAME like `<hash>.vercel-dns-017.com` [CITED: vercel.com/docs/domains/.../add-a-domain]); the newer apex A IP is shown in the dashboard image only | 2025 | **Copy the values the Vercel dashboard shows**, not a remembered IP. I believe the newer apex IP is `216.198.79.1` and the old one still works [ASSUMED] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel reuses Node proxy instances, so a module-level memo persists | Pattern 1, Pitfall 3 | Guard never 404s (fails open). Detectable on Preview; fallback is a blocking cold read |
| A2 | Vercel serves the prerendered 404 (meta status 404) with HTTP 404 through a proxy rewrite, as `next start` does | Pattern 2 | Status stays 200 on Vercel. Verify first on Preview (tracer) |
| A3 | Analytics `/<unique-path>/*` is answered by the platform before the proxy | Pitfall 5 | No visits recorded. Fallback props are documented |
| A4 | `VERCEL_PROJECT_PRODUCTION_URL` becomes `mateojaras.dev` once the domain is assigned | Runtime inventory | Login on apex rejected. `BETTER_AUTH_URL` fallback + verification step |
| A5 | ThemeScript does not run on the client-rendered 404 | Pitfall 2 | Low. Dark screenshot shows it either way |
| A6 | Neon production compute idles (scale to zero), so a blocking read could cost hundreds of ms | Summary, Pitfall 4 | If always warm, a blocking cold read is cheap (only matters for the A1 fallback) |
| A7 | PNG-in-ICO is accepted by current browsers; GitHub action majors for cache/upload-artifact | Don't Hand-Roll, CI | Minor. Fallback is an `icon.png` link |
| A8 | Apex A value `216.198.79.1` (old `76.76.21.21` still valid) | State of the Art | None if Teo copies the dashboard values |

## Open Questions (RESOLVED)

All three were answered by Teo on 2026-11-25 (05-CONTEXT.md D-21, D-22, D-23).

1. **Route file approval for `[locale]/[...rest]/page.tsx`** (RESOLVED: D-21)
   - What we know: without it, unmatched URLs and proxy-rewritten slugs answer 404 with Next's default English page. `global-not-found` cannot read the locale and bypasses the layouts. The file serves no content; every URL it matches answers 404. next-intl documents it as the standard recipe.
   - What's unclear: CLAUDE.md says "ask before adding routes", and D-06 says "no new route".
   - Recommendation: ask Teo at the start of the 404 plan (checkpoint). If he refuses, the fallback is `global-not-found` with a bilingual page whose language an inline script picks from `location.pathname`. Worse on every axis, so flag it as such.
   - **RESOLVED (D-21):** Teo approved the route file. It only calls `notFound()`; no other new route. Implemented in 05-02 Task 1.

2. **Contact delivery for launch (Resend + Upstash never created)** (RESOLVED: D-22)
   - What we know: production fails closed with mailto. The reviewer task "How would you contact him?" exercises it. The phase does not list CONT requirements.
   - Recommendation: ask Teo in the domain plan whether to create Resend (DNS on Porkbun, which can be done in the same DNS session as the apex records) and Upstash now, so `contact-live.spec.ts` can finally run. Otherwise launch with mailto and log it as Teo's decision.
   - **RESOLVED (D-22):** Resend and Upstash are set up in this phase, in the same Porkbun DNS session as the domain (05-01). Production contact must pass `e2e/contact-live.spec.ts` before the reviews (05-07). CI keeps the fail-closed path.

3. **Analytics on Preview** (RESOLVED: D-23). Recommendation: load it on `production` and `preview` (Pattern 3), so the enforce pass on Preview has analytics active. Whether the dashboard separates Preview traffic is not verified [ASSUMED]. If Teo wants clean numbers, switch to production-only after the Preview pass.
   - **RESOLVED (D-23):** analytics loads on Preview and Production, never locally or in CI (05-04 `SiteAnalytics`).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, scripts | ✓ | 24.22.1 | — |
| pnpm | install | ✓ | 12.16.1 (packageManager) | — |
| Playwright Chromium | e2e, reviews, favicon raster | ✓ (ran in this session) | 1.64.1 | — |
| gh CLI (authenticated) | secrets list, CI runs | ✓ | — | GitHub UI |
| fontkit (transitive) | one-off glyph script | ✓ in pnpm store | 2.0.4 | — |
| Vercel Web Analytics enabled | QUAL-07 | ✗ | — | Teo enables (Dashboard → project → Analytics → Enable), then redeploy |
| Custom domain on Vercel / Porkbun records | QUAL-09 | ✗ (parking) | — | Teo dashboard steps |
| GitHub secrets ADMIN_EMAIL / ADMIN_PASSWORD | QUAL-05 CI | ✗ | — | Teo adds them |
| BLOB_READ_WRITE_TOKEN in CI | upload e2e | ✗ (by design) | — | Upload checked on Preview/local |
| Resend / Upstash | live contact | ✗ | — | Created in 05-01 (D-22, resolves Open Question 2) |

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (domain switch) | Better Auth `baseURL.allowedHosts` + `BETTER_AUTH_URL`. Verify login on apex |
| V3 Session Management | no change | — |
| V4 Access Control | yes | Proxy guard is not authorization. The admin check is unchanged. Draft bypass relies on the Next-signed `__prerender_bypass` cookie; skipping the guard with a forged cookie only yields the soft-404 path, never draft content |
| V5 Input Validation | yes | Slug from URL only compared against a Set and passed as a parameterized drizzle/neon query, never interpolated |
| V14 Config | yes | CSP enforce, HSTS already set, `X-Frame-Options DENY`, `frame-ancestors 'none'` |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unknown-slug flood forcing DB reads (warm-miss path) | DoS | One list query per miss with a 1.5 s timeout and fail-open. Acceptable at portfolio scale. Note in `05-SECURITY` threat model |
| XSS with `'unsafe-inline'` scripts | Tampering | Accepted (D-17). No user HTML is rendered unsanitized; Tiptap JSON rendered by the static renderer |
| Blob upload abuse | Tampering | `handleUpload` `onBeforeGenerateToken` → `requireSession()` + content-type/size limits (existing) |

## Agent Reviews (D-07..D-09), practical notes

- Run each persona as a **separate agent with no access to `.planning/` or `docs/`**. Give it only the guide (D-08) and `https://mateojaras.dev` (plus the public GitHub repo for the developer persona via the footer source link), so it judges like a first-time visitor and findings stay independent. Run them in parallel; none sees another's output.
- Each agent uses Playwright on production: 390 px and 1440 px, `/` and `/es` (at least one review fully in English, one fully in Spanish, the dev in both), screenshots saved under `.planning/phases/05-pulido-y-lanzamiento/reviews/<persona>/`.
- Rules for the agents: **do not submit the contact form** (it writes to production `contact_messages`, and with Resend live it would email Teo); do not open `/admin`; do not run Lighthouse or load tests; report the contact path as observed.
- Persona prompts must reflect 4.1 positioning ("AI full stack developer", Canada/Europe recruiters, freelance clients).
- Log format for `docs/reviews.md` (one table per review, then a consolidated status):

| ID | Reviewer | Task/Question | Locale · viewport · URL | Finding | Severity (blocker/major/minor/nit) | Type (content/design/code/a11y) | Evidence | Disposition (fixed `<sha>` / dismissed: reason + Teo OK / backlog) |
|----|----------|---------------|-------------------------|---------|-----|------|----------|-------------|

- Content findings: Claude proposes en/es text, Teo enters it in the production admin (D-18). Code findings go on a fix branch, verified on Preview, then merged with Teo's go.

## A11y coverage gaps (QUAL-03)

| Area | Covered today | Gap |
|------|---------------|-----|
| Keyboard ring + skip link | `keyboard.spec.ts`: `/`, case study, `/about`, `/contact` (en), light + dark, 1440 | Spanish routes (`/es`, `/es/proyectos/<slug>`, `/es/sobre-mi`, `/es/contacto`), the 404, 390 px (mobile nav) |
| axe serious/critical | home (public.spec), about/contact en/es (routes.spec), case study, contact, admin specs | 404 en/es; dark theme on any route (axe runs with the default light scheme); 390 viewport |
| Reduced motion | `reduced-motion.spec.ts`: 8 public routes | 404 |
| 404 | `case-study.spec.ts`/`public.spec.ts` assert UI + noindex, status-agnostic | Status 404, localized `lang`, project list, path shown, unmatched `/foo` `/es/foo` |

## Recommended Plan Breakdown (coarse, tracer-first, D-14 order)

| Plan | Scope | Requirements | Human checkpoints |
|------|-------|--------------|-------------------|
| 05-01 Domain + Search Console (on `main`, no code) | Teo steps: Vercel Domains add `mateojaras.dev` (primary) + `www` → 308 redirect to apex; Porkbun records (copy values from Vercel); Production env `NEXT_PUBLIC_SITE_URL`/`BETTER_AUTH_URL` = `https://mateojaras.dev`; redeploy; CV regenerate; Search Console Domain property (TXT), sitemap `https://mateojaras.dev/sitemap.xml`, URL inspection of `/` and `/es`. Claude verifies canonical/hreflang/og:url/sitemap/robots/resume.json/login on apex, Neon `main`. Docs: decisions (D-06 reversal pending, D-09 re-scope, D-17, D-19 backlog), review guide en/es (D-08) can be written here | QUAL-09 (start) | Teo dashboard (Vercel, Porkbun, Search Console); Open Question 2 |
| 05-02 404 tracer + soft-404 fix (branch) | Route-file approval; `[...rest]`; slug guard + unit tests; not-found redesign (copy approval); theme fallback; `not-found.spec.ts`; e2e assertions flipped to 404; **verify on Preview first: real 404 status, A1/A2**; screenshots + impeccable | SITE-08, part of QUAL-03 | Route approval, 404 copy en/es |
| 05-03 CSP enforce + analytics (branch) | `@vercel/analytics` install; `SiteAnalytics`; CSP table (Blob, Toolbar Preview list); header flip; collector; Teo enables Web Analytics; Preview zero-violation pass incl. admin upload and CV; Preview Lighthouse (`scripts/lighthouse-preview.mjs`); remove `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | QUAL-06, QUAL-07 | Teo enables Analytics |
| 05-04 CI e2e (branch) | e2e job; secrets | QUAL-05 | Teo adds 2 GitHub secrets |
| 05-05 Favicon + a11y sweep (branch) | 2–3 MJ variants rendered at 16/32/180 light/dark; static files; delete default favicon; keyboard/axe/reduced-motion gaps above | QUAL-03, D-20 | Teo picks a variant |
| 05-06 Merge + production verification | Teo's go → merge; on mateojaras.dev: CSP zero violations, analytics visit recorded, 404 statuses, Lighthouse mobile ≥ 95 on the 8 routes | QUAL-06/07/09 | Merge go |
| 05-07 Reviews | 3 persona agents in parallel on production; `docs/reviews.md` | QUAL-08 | — |
| 05-08 Fixes + gate | Fix branch for code findings, admin edits for content (Teo), dismissals with Teo's OK; REQUIREMENTS/ROADMAP QUAL-08 wording; final `pnpm check`, CI green, gate | QUAL-08, gate | Teo OKs dismissals, content entry, final merge |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/02-guides/streaming.md` "The HTTP contract": Cache Components send 200 before a request-time notFound(); use Proxy for a 404
- `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md` lines 422–424: no `use cache` in Proxy, `cacheTag` throws
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`: `global-not-found` (experimental, bypasses layouts), metadata only on root not-found
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`: Node runtime, `NextFetchEvent.waitUntil`, Flight headers stripped
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`: favicon only in `app/` root; icon.svg `sizes="any"`
- Local reproduction on Next 16.4.6 (minimal replica, `next build --webpack` + `next start` + Playwright): statuses, locale and rendering in the 404 tables above; `.next/server/app/es/__not-found.{html,meta}`
- `node_modules/@vercel/blob` 2.8.2 `dist/chunk-XKVPKJPO.js`: `https://vercel.com/api/blob`
- `@vercel/analytics` 2.0.1 tarball `dist/next/index.mjs`: script src logic, mode, Suspense wrapper
- Context7 `/amannn/next-intl/v4.14.9` error-files.mdx: `[locale]/[...rest]` recipe
- Live checks with curl/dig (2026-11-25): production statuses, canonical/sitemap/resume host, CSP header, DNS parking records; `gh secret list`

### Secondary (MEDIUM confidence)
- https://vercel.com/docs/analytics/package (v2 dynamic config, mode)
- https://vercel.com/docs/analytics/quickstart (enable steps, platform routes)
- https://vercel.com/docs/vercel-toolbar/managing-toolbar (CSP list, `x-vercel-skip-toolbar`)
- https://vercel.com/docs/domains/working-with-domains/add-a-domain (project-specific CNAME, www redirect)

### Tertiary (LOW confidence)
- Vercel apex IP value, Neon idle behaviour, Vercel proxy instance reuse (see Assumptions Log)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Only one new package, read from source.
- Architecture (404 + guard): HIGH locally, MEDIUM on Vercel until the Preview tracer passes (A1, A2).
- CSP/analytics: HIGH for hosts, MEDIUM for the unique-path routing (A3).
- Domain switch: HIGH for code-side URL sources, MEDIUM for dashboard values.

**Research date:** 2026-11-25
**Valid until:** 2026-12-25 (Vercel dashboard/DNS values: re-check on the day)
