# Phase 05: Pulido y lanzamiento - Pattern Map

**Mapped:** 2026-11-25
**Files analyzed:** 27 (new + modified, code and docs)
**Analogs found:** 24 / 27

Language note: code comments in this repo are English; `docs/*.md` entries are Spanish. Keep both.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/proxy.ts` (modify: async + slug guard) | middleware | request-response | itself (`src/proxy.ts` 1-24) | exact |
| `src/lib/published-slug-guard.ts` (new) | utility (pure decision + memo) | transform / cache | `src/lib/rate-limit.ts` (module memo) + `src/lib/upstash-env.ts` (pure, env-injected) | role-match |
| `src/lib/published-slug-guard.test.ts` (new) | test | unit | `src/lib/upstash-env.test.ts` | exact |
| `src/features/projects/slug-index.ts` (new loader, no server-only) | service (DB read) | CRUD read | `src/features/projects/queries.ts` `projectsQuery`/`sitemapProjectsQuery` + `src/db/client.ts` `createDb` | exact |
| `src/features/projects/queries.ts` (modify: `publishedSlugsQuery(handle)`) | service | CRUD read | `sitemapProjectsQuery` (lines 47-57) | exact |
| `src/features/projects/queries.test.ts` (extend) | test | unit (toSQL) | itself lines 1-37 | exact |
| `src/app/[locale]/[...rest]/page.tsx` (new, D-21) | route | request-response | none (one-liner `notFound()`) | no analog needed |
| `src/app/[locale]/not-found.tsx` (redesign) | component (RSC) | request-response, cached read | `src/app/[locale]/page.tsx` (EntryList block 32-70) + current not-found 1-26 | exact |
| `src/components/site/requested-path.tsx` (new client leaf) | component (client) | event/browser | `src/components/site/lang-switch.tsx` (next/navigation hook leaf) | role-match |
| Theme fallback on 404 (Pitfall 2) | component (client effect) | browser | `src/components/site/theme-toggle.tsx` lines 28-47 | exact |
| `src/components/site/site-analytics.tsx` (new) | component (RSC env gate) | config | `src/lib/rate-limit.ts` env gate + `next.config.ts` `isPreview` | partial |
| `src/app/[locale]/layout.tsx` (modify: mount analytics) | layout | — | itself lines 55-73 | exact |
| `next.config.ts` (modify: CSP enforce, connect-src, toolbar list) | config | — | itself lines 4-39 | exact |
| `messages/en.json`, `messages/es.json` (`Site.notFound` keys) | config (i18n) | — | existing `Site.notFound` lines 53-57 | exact |
| `.env.example` (remove `NEXT_PUBLIC_UMAMI_WEBSITE_ID`) | config | — | itself | exact |
| `.github/workflows/ci.yml` (add e2e job) | config (CI) | batch | `check` job lines 11-27 | exact |
| `e2e/csp.ts` (new collector) | test helper | event-driven | `watchCsp` in `e2e/headers.spec.ts` 7-14 + `e2e/axe.ts` | exact |
| `e2e/headers.spec.ts` (modify: enforce header, collector, dynamic slug) | test | request-response | itself + `e2e/keyboard.spec.ts` (`firstPublishedProject`) | exact |
| `e2e/not-found.spec.ts` (new) | test | request-response | `e2e/public.spec.ts` 151-179 | exact |
| `e2e/public.spec.ts`, `e2e/case-study.spec.ts`, `e2e/seo.spec.ts` (flip `[200,404]` → 404) | test | — | `public.spec.ts` 155-174 | exact |
| `e2e/admin-projects.spec.ts` (add: just-published slug 200 on first hit) | test | CRUD | itself 20-60 (fixture) | exact |
| `e2e/keyboard.spec.ts` (add es routes, 404, 390 px) | test | — | itself 65-104 | exact |
| `e2e/reduced-motion.spec.ts` (add 404) | test | — | itself 9-23 | exact |
| `e2e/screens-not-found.spec.ts` (new) | test | — | `e2e/screens-home.spec.ts` + `e2e/screens.ts` | exact |
| `src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/favicon.ico` (replace) | static asset | file-I/O | none in repo (metadata files) | no analog |
| `docs/decisions.md`, `docs/backlog.md`, `docs/reviews.md` (new), REQUIREMENTS/ROADMAP edits | docs | — | `docs/decisions.md` 568-580 entry format; `docs/backlog.md` checkbox lists | exact (reviews.md: format from RESEARCH) |
| Review guide en/es + persona prompts | docs | — | none | no analog |

## Pattern Assignments

### `src/proxy.ts` (middleware, request-response) — MODIFY

**Analog:** itself. Current full file:
```ts
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (getSessionCookie(req)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return handleI18n(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*/opengraph-image|.*\\..*).*)"],
};
```
**Change:** keep the admin branch byte-for-byte; make the function `async (req, event: NextFetchEvent)`; replace `return handleI18n(req)` with the RESEARCH Pattern 1 block (read `x-middleware-rewrite`, match `^/(en|es)/projects/([^/]+)/?$`, bypass on `__prerender_bypass` cookie, call `isPublishedSlug`, else `NextResponse.rewrite(new URL(\`/${l}/__missing\`, req.url))`). Keep the explanatory comment style (lines 8-11: short "why" comment above the function). Matcher stays unchanged (static favicon files have a dot, so they are already excluded).
**Do not import** `@/db` (line 1 of `src/db/index.ts` is `import "server-only"`) or `@/features/projects/queries` (imports `next/cache`, `next/headers`).

---

### `src/lib/published-slug-guard.ts` (utility, memo + decision) — NEW

**Analog A (module-level memo):** `src/lib/rate-limit.ts` lines 6-21
```ts
let limiter: Ratelimit | null | undefined;

// Null when no complete credential pair exists; the caller fails closed (D-12).
export function getContactLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  ...
  limiter = new Ratelimit({ ..., timeout: 2000 });
  return limiter;
}
```
**Analog B (pure, dependencies injected, no env read inside):** `src/lib/upstash-env.ts` lines 1-18 (takes `env` as an argument so tests pass plain objects).

**Apply:** module `let memo: { slugs: Set<string>; at: number } | null = null;`, exported `isPublishedSlug(slug, { load, waitUntil, now = Date.now })` per RESEARCH Pattern 1. Export a `__resetForTests()` (or accept the memo as an injected store) so the unit test can start cold. No `server-only` (proxy imports it), no `next/*` imports. Header comment explains fail-open and "never memoize negatives".

---

### `src/lib/published-slug-guard.test.ts` (test, unit) — NEW

**Analog:** `src/lib/upstash-env.test.ts` lines 1-13
```ts
import { describe, expect, it } from "vitest";
import { resolveUpstashCredentials } from "./upstash-env";

describe("resolveUpstashCredentials", () => {
  it("returns the UPSTASH pair when complete", () => {
    expect(resolveUpstashCredentials({ ... })).toEqual({ url: "https://u", token: "t" });
  });
```
**Apply:** one `it` per branch: cold → true + waitUntil called; warm hit → true, no load; warm hit stale → true + background refresh; warm miss found → true; warm miss not found → false; load rejects / times out → true; negative result is never memoized (second call re-loads). Inject `load: vi.fn()`, `waitUntil: vi.fn()`, `now: () => t`. Use `vi.useFakeTimers()` for the timeout case.

---

### `src/features/projects/slug-index.ts` (service, DB read for proxy) — NEW
### `src/features/projects/queries.ts` (modify: extract `publishedSlugsQuery`)

**Analog:** `src/features/projects/queries.ts` lines 36-57 (current `getPublishedSlugsCore` and the `handle`-taking `sitemapProjectsQuery`)
```ts
export async function getPublishedSlugsCore() {
  const rows = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(and(eq(projects.status, "published"), eq(projects.visible, true)))
    .orderBy(asc(projects.order));
  return rows.map((r) => r.slug);
}

export function sitemapProjectsQuery(handle: Db) {
  return handle
    .select({ slug: projects.slug, updatedAt: projects.updatedAt })
    .from(projects)
    .where(and(eq(projects.status, "published"), eq(projects.visible, true)))
    .orderBy(asc(projects.order));
}
export async function getSitemapProjectsCore() { return sitemapProjectsQuery(db); }
```
**Apply:** `publishedSlugsQuery(handle: Db)` lives in a module with **no** `next/cache` / `server-only` imports (put it in `slug-index.ts` itself, or a new `published-slugs-query.ts`), and `queries.ts` re-uses it: `getPublishedSlugsCore = async () => (await publishedSlugsQuery(db)).map(r => r.slug)`. Consumer `src/app/[locale]/projects/[slug]/page.tsx` line 31-33 (`generateStaticParams`) stays unchanged.

**DB handle analog:** `src/db/client.ts` (unguarded factory, safe for proxy)
```ts
// neon-http client factory. Unguarded (no server-only) so scripts can import it.
export function createDb(url: string) { return drizzle({ client: neon(url), schema }); }
```
plus `src/lib/env.ts` `requireEnv("DATABASE_URL")`. In `slug-index.ts` create the handle lazily inside `loadPublishedSlugs()` (memoized like `rate-limit.ts`), so a missing env throws inside the guard's try and the guard fails open.

**Test analog:** `src/features/projects/queries.test.ts` lines 17-37 (`createDb(URL)` with a synthetic URL + `.toSQL()` asserting `"projects"."status" = $1`, params `["published", true]`). Add a `publishedSlugsQuery` describe block the same way.

---

### `src/app/[locale]/[...rest]/page.tsx` (route) — NEW (D-21 approved)

No analog needed; next-intl recipe:
```tsx
import { notFound } from "next/navigation";

// Unmatched paths under a locale render [locale]/not-found with HTTP 404.
export default function CatchAll() {
  notFound();
}
```
Log in `docs/decisions.md` as Teo's decision (D-21).

---

### `src/app/[locale]/not-found.tsx` (component RSC, cached read) — REDESIGN

**Analog 1 (locale + translations, current file lines 1-12):**
```tsx
import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isLocale } from "@/lib/locale";

export default async function NotFound() {
  const param = await locale();
  const active = isLocale(param) ? param : "en";
  const t = await getTranslations({ locale: active, namespace: "Site.notFound" });
```
**Analog 2 (project list, `src/app/[locale]/page.tsx` lines 35-42, 48, 53-69):**
```tsx
const [t, tc, tp, settings, rows, stacks] = await Promise.all([
  getTranslations({ locale: param, namespace: "Site.home" }),
  ...
  getTranslations({ locale: param, namespace: "Site.project" }),
  getProjects(),
  getProjectStacks(),
]);
const hasWork = rows.length > 0;
...
<div className="mx-auto max-w-page px-6 md:px-12">
  {hasWork && (
    <Reveal index={1}>
      <PageSection id="work" number="01" title={copy.index[0].label} className="mt-0">
        <EntryList rows={rows} stacks={stacks} locale={param}
          labels={{ internalTool: tp("internalTool") }} />
      </PageSection>
    </Reveal>
  )}
```
**Apply:** `Promise.all([t(Site.notFound), tp(Site.project), getProjects(), getProjectStacks()])`; heading classes from current lines 15-17 (`font-heading text-4xl font-semibold tracking-display text-balance`); container `mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16`; `<RequestedPath />` in `font-mono`; `EntryList` renders `null` itself when `rows` is empty (entry-list.tsx line 32), but guard the section heading with `rows.length > 0` as the home does. Links: `Link` from `@/i18n/navigation` to `/` and `/contact`. Optional `<title>` element (React 19) since only root not-found supports `metadata`. Consider `PageSection` for the list (same as home). No `Reveal` required (motion budget: keep it static or reuse `Reveal index={1}` only if it matches the home reveal).

---

### `src/components/site/requested-path.tsx` (client leaf) — NEW

**Analog:** `src/components/site/lang-switch.tsx` lines 1-23
```tsx
"use client";

import { useParams, useSelectedLayoutSegments } from "next/navigation";
...
// useParams/useSelectedLayoutSegments live here so they stay inside Suspense.
export function LangSwitch({ locale, toOther }: { ... }) {
  const params = useParams<{ slug?: string }>();
```
**Apply:** `"use client"`, `usePathname()` from `next/navigation`, render `<code className="font-mono text-sm text-muted-foreground">{pathname}</code>`. Do NOT render user-controlled text via `dangerouslySetInnerHTML`; plain text node only. Decode with `decodeURIComponent` inside a try. Unit test analog: `src/components/site/lang-switch.test.tsx` (mock `next/navigation`).

---

### Theme fallback on the 404 error shell (Pitfall 2)

**Analog:** `src/components/site/theme-toggle.tsx` lines 28-47 (`useLayoutEffect` re-applying `motion-ok` and `dark` from localStorage / `prefers-color-scheme`). The `ThemeToggle` lives in the header, which the 404 renders through the layout, so first **verify with a dark screenshot** whether this effect already covers it; only add a leaf if it does not. Inline-script inertness is explained in `src/components/site/inline-script.tsx` lines 1-13 (`type="text/plain"` on the client).

---

### `src/components/site/site-analytics.tsx` (RSC env gate) — NEW
### `src/app/[locale]/layout.tsx` — MODIFY

**Env-gate analog:** `next.config.ts` line 5 `const isPreview = process.env.VERCEL_ENV === "preview";` and `rate-limit.ts` "return null when env missing" pattern.
```tsx
import { Analytics } from "@vercel/analytics/next";

// Public site only (D-03). Production and Preview (D-23); nothing locally or in CI.
export function SiteAnalytics() {
  const env = process.env.VERCEL_ENV;
  return env === "production" || env === "preview" ? <Analytics /> : null;
}
```
**Mount point:** `src/app/[locale]/layout.tsx` lines 63-72, after `<SiteFooter locale={param} />` inside `<body>` (inside or just after `NextIntlClientProvider`). Never in `src/app/admin/layout.tsx`. Import order follows lines 6-14 (`@/components/site/...` alphabetical).

---

### `next.config.ts` (config) — MODIFY

**Analog:** itself lines 4-26
```ts
const isPreview = process.env.VERCEL_ENV === "preview";
const vercelLive = isPreview ? " https://vercel.live" : "";
const blobHost = "https://*.public.blob.vercel-storage.com";

// Static CSP sent as a header: per-request tokens would force dynamic
// rendering and break the static shell. Report-Only until the reports are reviewed.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${blobHost}${vercelLive}`,
  "font-src 'self'",
  `connect-src 'self'${vercelLive}`,
  ...(isPreview ? ["frame-src https://vercel.live"] : []),
  ...
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
```
**Apply:** add `const blobApi = "https://vercel.com/api/blob/";` next to `blobHost`; `connect-src 'self' ${blobApi} ${blobHost}` + Preview toolbar hosts; extend the Preview-only additions per RESEARCH Pattern 4 table (style-src/font-src/img-src/connect-src `wss://ws-us3.pusher.com`, `https://assets.vercel.com`, `https://vercel.com`) using the same `isPreview ? "..." : ""` string-suffix style; change the key to `"Content-Security-Policy"`; update the comment ("Enforced since 05-03; zero violations on Preview and Production"). Same commit flips `e2e/headers.spec.ts`.

---

### `.github/workflows/ci.yml` — MODIFY (add `e2e` job)

**Analog:** the `check` job, lines 11-27
```yaml
  check:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      DATABASE_URL_UNPOOLED: ${{ secrets.DATABASE_URL_UNPOOLED }}
      BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
      - run: pnpm check
```
**Apply:** copy the same `env` + first four steps verbatim (same action majors), add `ADMIN_EMAIL`/`ADMIN_PASSWORD` secrets, `needs: check`, job-level `concurrency: { group: e2e-neon-dev, cancel-in-progress: false }` (top-level `concurrency` at lines 7-9 is per-ref; leave it), Playwright browser cache + `install --with-deps chromium`, run the spec list from RESEARCH "CI e2e job", upload `playwright-report` on failure. `playwright.config.ts` already handles CI (line 30 `reuseExistingServer: !process.env.CI`, webServer `pnpm build && pnpm start -p 3100`). Do not set Resend/Upstash/Blob vars.

---

### `e2e/csp.ts` (test helper) — NEW

**Analog:** `e2e/headers.spec.ts` lines 7-14 (`watchCsp`) and the helper-module shape of `e2e/axe.ts` (named exports, one-line purpose comment, fails with a JSON message).
```ts
function watchCsp(page: Page) {
  const violations: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (/Content[ -]Security[ -]Policy/i.test(text)) violations.push(text);
  });
  return violations;
}
```
**Apply:** move `watchCsp` here and extend it with the `securitypolicyviolation` listener via `page.addInitScript` (RESEARCH Pattern 5); export `collectCsp(page)` returning an async getter, and an `expectNoCspViolations(page, get)` that mirrors `expectNoBlockingViolations` (`expect(list, JSON.stringify(list, null, 2)).toEqual([])`). Also send `x-vercel-skip-toolbar: 1` via `page.setExtraHTTPHeaders` when `E2E_BASE_URL` is set.

---

### `e2e/headers.spec.ts` — MODIFY

**Analog:** itself. Changes: line 5 hard-coded `slug = "centro-estetico-manuj"` → `firstPublishedProject()` from `e2e/db.ts` (pattern in `e2e/keyboard.spec.ts` lines 83-84 and `reduced-motion.spec.ts` lines 9-23, with `test.skip(!project, "no published project")`); lines 32-37 and 72-74 key `content-security-policy-report-only` → `content-security-policy` and assert the report-only header is absent; add `connect-src` contains `https://vercel.com/api/blob/`; add es case-study path and the 404 paths; swap `watchCsp` for the shared collector. Keep the signed-in describe (lines 55-80) including the 11 s rate-limit waits.

---

### `e2e/not-found.spec.ts` (test) — NEW

**Analog:** `e2e/public.spec.ts` lines 155-174
```ts
for (const [path, heading] of [
  [`/projects/${slug}`, "Page not found"],
  [`/es/proyectos/${slug}`, "Página no encontrada"],
] as const) {
  const res = await page.goto(path);
  expect([200, 404]).toContain(res?.status());
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  const robots = page.locator('meta[name="robots"]');
  await expect(robots.first()).toHaveAttribute("content", "noindex");
```
**Apply:** cases `/foo`, `/es/foo`, `/projects/no-existe`, `/es/proyectos/no-existe` and a draft slug (via `insertTempProject()` / `deleteTempProjects()` from `e2e/db.ts` lines 41-56). Assert `res.status() === 404`, `html[lang]` en/es, heading (new copy), path visible in mono, the first published project title link present (`firstPublishedProject()`), links home/contact, noindex, `expectNoBlockingViolations(page)` (from `e2e/axe.ts`) in light and dark (`test.use({ colorScheme })` as in `keyboard.spec.ts` 65-67). Pitfall 1: always `await expect(h1).toBeVisible()` before axe/text assertions. Pitfall 9: prime the memo with one request to a real slug before asserting 404 on a slug path (or assert on the second request). Skip guard: `test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set")` (pattern used in every DB-backed spec).

### `e2e/public.spec.ts` 151-179, `e2e/case-study.spec.ts` ~95, `e2e/seo.spec.ts` ~127-140 — MODIFY
Replace `expect([200, 404]).toContain(...)` with `toBe(404)` after priming, update the explanatory comments (they cite the accepted soft-404 cost that D-06 reverses) and the heading strings to the approved copy.

### `e2e/admin-projects.spec.ts` — EXTEND
Use the fixture pattern at lines 20-41 (`FIXTURE_SLUG`, `createFixture`, `removeFixture`, `afterEach`). Add: after publishing, the first request to `/es/proyectos/${FIXTURE_SLUG}` returns 200 (warm-miss path); after unpublish, eventually 404 or noindex UI.

### `e2e/keyboard.spec.ts`, `e2e/reduced-motion.spec.ts` — EXTEND
- keyboard: route list at lines 85-90 → add `/es`, `/es/proyectos/${slug}`, `/es/sobre-mi`, `/es/contacto`, `/foo`; add a 390 px describe (mobile nav) reusing `tabThrough` + `hasRing` (lines 21-63).
- reduced-motion: `routes()` lines 9-23 → append `/foo` and `/es/foo`.

### `e2e/screens-not-found.spec.ts` — NEW
**Analog:** `e2e/screens-home.spec.ts` (9 lines) calling `captureMatrix(page, { name, paths })` from `e2e/screens.ts` lines 9-22 (390/768/1440 × light/dark, overflow assertion). Paths: `/foo`, `/es/foo`.

---

### `messages/en.json`, `messages/es.json` — MODIFY
Existing block (line 53-57 both files):
```json
"notFound": { "title": "Page not found", "body": "This page does not exist.", "home": "Back to home" },
```
Add keys (e.g. `eyebrow`/`code`, `pathLabel`, `listTitle`, `contact`) in both files with identical key sets; parity enforced by `src/lib/messages.test.ts`. Copy needs Teo's approval (D-05), no em-dashes.

### `.env.example` — MODIFY
Delete lines `# Analytics (fase 5): vacio si usas Vercel Analytics` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID=`. If Resend/Upstash vars change wording after D-22 setup, keep the existing Spanish comment style.

---

### Favicon files (`src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/favicon.ico`) — NEW/REPLACE

No in-repo analog (only the default `src/app/favicon.ico`). Follow RESEARCH "Favicon glyph extraction": one-off scratch script (fontkit from the pnpm store, `assets/fonts-pdf/FunnelDisplay-Bold.ttf`), outlines as `<path>`, hex tokens, `<style>@media (prefers-color-scheme: dark){...}</style>` inside the SVG; rasterize with Playwright. Scripts go in the scratchpad, not the repo. Static files at `src/app/` root apply to both root layouts; no `icon.tsx` (proxy matcher). Font source reference for the OG renderer if needed: `src/lib/og-page.tsx` / `src/app/[locale]/opengraph-image.tsx` (reads `assets/fonts-pdf/*.ttf`, traced via `next.config.ts` lines 58-62).

---

### Docs: `docs/decisions.md`, `docs/backlog.md`, `docs/reviews.md`

**decisions.md entry format** (lines 568-573):
```md
## 2026-11-23 · Anillo de foco global (04-11)
Contexto: ...
Decisión: ...
Quién: Claude Code.
Por qué: ...
Verificación: e2e/keyboard.spec.ts.
```
Entries needed: D-06 reversal (edit the phase-2 signal-4 paragraph at line ~207 and the SEO soft-404 entry at ~520), D-09 QUAL-08 re-scope (Quién: Teo), D-16 Blob connect-src closure (~434), D-17 `'unsafe-inline'` accepted (~536 T-04-06), D-20 favicon variant, D-21 route file, D-22 Resend/Upstash, D-23 analytics on Preview, proxy-memo unpublish window (accepted).

**backlog.md format:** `## Técnica` section with `- [ ] ...` checkboxes. Add: hash/SRI `script-src` (D-17); content loader CR-01, WR-01..07 with "fix before reusing the loader; CR-01 and WR-06 discard drafts" (D-19); custom analytics events; Speed Insights.

**reviews.md:** no analog; use the table format in RESEARCH "Agent Reviews" (ID | Reviewer | Task | Locale·viewport·URL | Finding | Severity | Type | Evidence | Disposition).

## Shared Patterns

### Skip guards in e2e (env-dependent specs)
**Source:** `e2e/admin-projects.spec.ts` lines 6-11, `e2e/contact-live.spec.ts` lines 5-12
```ts
test.skip(
  !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.DATABASE_URL,
  "ADMIN_EMAIL / ADMIN_PASSWORD / DATABASE_URL are not set",
);
```
Apply to every new spec that needs DB, admin or live services. CI relies on `contact-live.spec.ts` skipping (no Resend/Upstash) and `contact.spec.ts` asserting the fail-closed branch (`HAS_LIMITER` via `resolveUpstashCredentials`).

### Axe gate
**Source:** `e2e/axe.ts` `expectNoBlockingViolations(page, exclude?)`. Apply to the 404 (en/es, light/dark) and any new view. No exclusions (decisions 04-11 removed them).

### Locale handling in RSC
**Source:** `src/app/[locale]/not-found.tsx` lines 7-12 / `layout.tsx` lines 32-38: `await locale()` from `next/root-params`, `isLocale()` guard, explicit `getTranslations({ locale, namespace })`. Never `setRequestLocale`, never read headers.

### Cached public reads
**Source:** `src/features/projects/queries.ts` lines 76-82 (`'use cache'` + `cacheTag(tags.projects)` + `cacheLife("max")`). The 404 reuses `getProjects()`/`getProjectStacks()` unchanged. The proxy must NOT use `'use cache'`/`cacheTag` (throws in proxy).

### Env-gated behavior, never a mock
**Source:** `src/lib/rate-limit.ts` lines 8-13 (return `null`, caller fails closed), `src/lib/env.ts` `requireEnv` (Spanish error message). Apply to analytics gating (`VERCEL_ENV`), the slug loader (missing `DATABASE_URL` → guard fails open), and CI.

### Comments
Short English "why" comments above functions, citing decision IDs (`(D-12)`, `(02-06)`), as in `src/proxy.ts` 8-11 and `rate-limit.ts` 8-9. Keep this for D-06, D-03, D-16, D-17, D-21.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/app/[locale]/[...rest]/page.tsx` | route | request-response | No catch-all exists; trivial `notFound()` from next-intl recipe |
| `src/app/icon.svg`, `apple-icon.png`, `favicon.ico` | static asset | file-I/O | No metadata icon files yet; use RESEARCH favicon recipe |
| `docs/reviews.md` + review guide en/es + persona prompts | docs | — | New artifact; use RESEARCH "Agent Reviews" format |

Dashboard-only work (no files): Vercel Domains + env (`NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`), Porkbun DNS (apex/www + Resend SPF/DKIM), Search Console TXT, Web Analytics toggle, GitHub secrets `ADMIN_EMAIL`/`ADMIN_PASSWORD`, Resend + Upstash env (D-22). URL sources already env-driven via `src/lib/site-url.ts` (no code change for the domain switch).

## Metadata

**Analog search scope:** `src/proxy.ts`, `next.config.ts`, `src/app/**`, `src/components/site/**`, `src/features/projects/**`, `src/lib/**`, `src/db/**`, `e2e/**`, `.github/workflows/`, `playwright.config.ts`, `messages/`, `docs/`, `.env.example`
**Files scanned:** ~45 listed, 28 read
**Pattern extraction date:** 2026-11-25
