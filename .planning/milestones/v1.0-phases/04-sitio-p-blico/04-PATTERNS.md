# Phase 4: Sitio público - Pattern Map

**Mapped:** 2026-11-22
**Files analyzed:** 52 (new + modified, grouped where they share an analog)
**Analogs found:** 45 / 52

All analog paths below are git-tracked (`git ls-files`). Line numbers are from the current `main` (c496a2b).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/[locale]/layout.tsx` (MOD: head script, header, footer, `<main id="main">`, `metadataBase`) | layout | request-response (static shell) | itself | exact |
| `src/app/[locale]/page.tsx` (MOD: home) | page | CRUD read | itself + `src/components/site/hero/hero-a.tsx` | exact |
| `src/app/[locale]/projects/[slug]/page.tsx` (MOD: full case study) | page | CRUD read (Suspense slug) | itself | exact |
| `src/app/[locale]/about/page.tsx` | page | CRUD read | `src/app/[locale]/page.tsx` | role-match |
| `src/app/[locale]/contact/page.tsx` | page | request-response | `src/app/[locale]/page.tsx` + `src/app/admin/login/page.tsx` | role-match |
| `src/app/[locale]/**/opengraph-image.tsx` (home, about, contact, projects/[slug]) | metadata route handler | file-I/O + transform | `src/app/api/cv/[lang]/route.ts` (params locale) + `src/features/resume/pdf/fonts.ts` (TTF paths) | partial |
| `src/app/sitemap.ts`, `src/app/robots.ts` | metadata route | CRUD read | `src/features/projects/queries.ts` (`getPublishedSlugsCore`) | partial |
| `src/proxy.ts` (MOD: matcher excludes `.*/opengraph-image`) | middleware | request-response | itself | exact |
| `src/i18n/routing.ts` (MOD: `/about`, `/contact` pathnames) | config | — | itself | exact |
| `src/i18n/routing.test.ts` (MOD) | test | — | itself | exact |
| `next.config.ts` (MOD: `outputFileTracingIncludes` for OG) | config | — | itself line 58 | exact |
| `src/components/site/site-header.tsx` | component (RSC) | request-response | `src/components/site/draft-banner.tsx` | role-match |
| `src/components/site/site-footer.tsx` | component (RSC) | transform | `src/components/site/status-line.tsx` (separator pattern) | role-match |
| `src/components/site/nav-links.tsx`, `lang-switch.tsx` | component (client, URL hooks) | event-driven | `src/components/site/draft-exit-form.tsx` | role-match |
| `src/components/site/theme-toggle.tsx` | component (client) | event-driven | `src/components/site/draft-exit-form.tsx` + `hero-parts.tsx` Button | partial |
| `src/components/site/theme-script.tsx`, `inline-script.tsx` | component (RSC, inline script) | — | none (RESEARCH Code Examples "Inline script helper") | none |
| `src/components/site/local-time.tsx` | component (client) | event-driven (timer) | none (RESEARCH Pattern 4) | none |
| `src/components/site/status-line.tsx` (MOD: time + overlap segments) | component (RSC) | transform | itself | exact |
| `src/components/site/page-section.tsx` | component (RSC) | transform | `src/components/site/section-number.tsx` + `hero-parts.tsx` grid class | role-match |
| `src/components/site/entry-list.tsx` | component (RSC) | transform | `src/app/[locale]/page.tsx` lines 25-46 (project list) | role-match |
| `src/components/site/marginalia.tsx` | component (RSC) | transform | `src/components/site/status-line.tsx` | partial |
| `src/components/site/copy-email.tsx` | component (client) | event-driven | `src/app/admin/login/login-form.tsx` (client + labels prop) | partial |
| `src/components/site/case-study/{header,metrics,cover,sections,gallery,prev-next}.tsx` | component (RSC) | transform | `src/components/site/hero/hero-a.tsx` + `status-line.tsx` | role-match |
| `src/components/site/hero-copy.ts` (MOD: `CTA_HREF` → `getPathname`) | utility | — | itself | exact |
| `src/components/motion/reveal.tsx` | component (RSC, CSS) | — | none | none |
| `src/components/motion/split-heading.tsx`, `scroll-scene.tsx`, `load-gsap.ts` | component (client, GSAP) | event-driven | none | none |
| `src/app/globals.css` (MOD: reveal keyframes, VT CSS, prose, split failsafe) | config (styles) | — | itself | exact |
| `src/features/contact/validation.ts` | validation (Zod) | — | `src/features/auth/validation.ts` + `src/features/projects/validation.ts` | exact |
| `src/features/contact/public-actions.ts` | Server Action (public) | request-response | `src/features/contact/actions.ts` | role-match |
| `src/features/contact/submit-core.ts` (+ `.test.ts`) | service (pure core, injected deps) | request-response | `src/features/resume/actions.ts` (env gate) + `src/features/contact/actions.test.ts` (fakes) | role-match |
| `src/features/contact/components/contact-form.tsx` (+ `.test.tsx`) | component (client form) | request-response | `src/app/admin/login/login-form.tsx` + `.test.tsx` | exact |
| `src/features/contact/schema.ts` (MOD: `emailSentAt`) | model | CRUD | itself line 15 (`readAt`) | exact |
| `drizzle/0003_*.sql` + `drizzle/meta/*` | migration | — | `drizzle/0002_keen_mentor.sql` (generated) | exact |
| `src/features/contact/admin-queries.ts` (MOD: select `emailSentAt`) | query | CRUD read | itself | exact |
| `src/features/contact/components/{messages-table,message-reader}.tsx` (MOD: badge) | component (client) | — | itself + `src/components/admin/status-badge.tsx` | exact |
| `src/app/admin/(panel)/mensajes/page.tsx` (MOD: label + ISO mapping) | page | CRUD read | itself lines 33-37 | exact |
| `src/features/projects/queries.ts` (MOD: `getProjectStacks`, sitemap rows) | query | CRUD read | itself (`getProjectsCore` + `getProjects`) | exact |
| `src/features/projects/schema.ts` + `validation.ts` + `src/components/admin/image-uploader.tsx` (MOD: `captionEn/captionEs/capturedAt`) | model + validation + admin form | CRUD | themselves (`mediaItem`, `MediaItem`) | exact |
| `src/lib/overlap.ts` (+ `.test.ts`) | utility (pure) | transform | `src/lib/format.ts` + `format.test.ts` | role-match |
| `src/lib/seo.ts` (+ `.test.ts`) | utility | transform | `src/lib/mailto.ts` + `mailto.test.ts` | partial |
| `src/lib/site-url.ts` | utility | — | `src/lib/blob.ts` (`hasBlobToken`) / `src/lib/env.ts` | role-match |
| `src/lib/plain-text.ts` (paragraph / `- ` list splitter, + test) | utility (pure) | transform | `src/lib/format.ts` | role-match |
| `src/lib/rate-limit.ts` / `src/lib/mailer.ts` (env-gated clients) | utility | request-response | `src/lib/blob.ts` | role-match |
| `messages/en.json`, `messages/es.json` (MOD: Site.* keys) | config (i18n) | — | themselves (`Site` namespace lines 16-28) + `src/lib/messages.test.ts` | exact |
| `.env.example` (MOD: drop `NEXT_PUBLIC_CAL_URL`, `CONTACT_TO_EMAIL`) | config | — | itself | exact |
| `e2e/public.spec.ts` (MOD: rewrite h1 asserts) | test (e2e) | — | itself | exact |
| `e2e/case-study.spec.ts`, `about.spec.ts`, `contact.spec.ts`, `lang-theme.spec.ts` | test (e2e) | — | `e2e/public.spec.ts` | exact |
| `e2e/seo.spec.ts` (OG fetch, sitemap, robots) | test (e2e) | request-response | `e2e/public.spec.ts` lines 41-57 (request context) + `e2e/headers.spec.ts` | role-match |
| Unit tests for new RSC components (`entry-list.test.tsx`, `metrics.test.tsx`, …) | test | — | `src/components/site/status-line.test.tsx` | exact |
| `docs/decisions.md`, `docs/data-model.md` (MOD) | docs | — | n/a (not code) | — |

---

## Pattern Assignments

### `src/app/[locale]/layout.tsx` (layout, MODIFY)

**Analog:** itself (full file, 36 lines).

Current structure to keep (lines 11-36):
```tsx
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return settings ? { title: settings.name } : {};
}

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function RootLayout({ children }: LayoutProps<"/[locale]">) {
  const param = await locale();
  if (!isLocale(param)) notFound();
  return (
    <html lang={param} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={param} messages={null}>
          <DraftBanner locale={param} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```
Changes the planner must specify:
- `<html ... suppressHydrationWarning>` + `<head><ThemeScript /></head>` (RESEARCH Pattern 2).
- Skip link first in `<body>`, then `DraftBanner`, `SiteHeader`, `<main id="main" tabIndex={-1}>{children}</main>`, `SiteFooter`. Pages stop rendering their own `<main>` (today `page.tsx:19`, `projects/[slug]/page.tsx:57`, `not-found.tsx:14` each render `<main>`; convert to `<div>`/`<article>`).
- `messages={null}` stays: client leaves receive labels as props (Pattern 3).
- `generateMetadata` returns `metadataBase: new URL(siteUrl())` plus defaults via `buildPageMetadata`.

---

### `src/app/[locale]/page.tsx` (home, MODIFY)

**Analog:** itself + `src/components/site/hero/hero-a.tsx`.

Locale + parallel data load (lines 10-17), copy into about/contact pages:
```tsx
export default async function Home() {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const [t, settings, rows] = await Promise.all([
    getTranslations({ locale: param, namespace: "Site.home" }),
    getSiteSettings(),
    getProjects(),
  ]);
```
Conditional-render rule (lines 20, 25): `{settings && ...}`, `{rows.length > 0 && ...}` — missing content means no block. Localized link to a case (lines 33-40):
```tsx
<Link href={{ pathname: "/projects/[slug]", params: { slug: row.slug } }}>
  {localized(row, "title", param) as string}
</Link>
```
Hero composition: `HeroA` (hero-a.tsx lines 13-35) takes `{ settings, locale, cta }`; wrap `h1#hero-title` (line 22-27) in `<SplitHeading>`. Remove `Site.home.projectsHeading` usage (UI-SPEC: replaced by `Hero.index`).

---

### `src/app/[locale]/projects/[slug]/page.tsx` (case study, MODIFY)

**Analog:** itself. Keep the Suspense-for-URL-data structure verbatim (lines 12-69):
```tsx
export async function generateStaticParams() {
  return (await getPublishedSlugsCore()).map((slug) => ({ slug }));
}

// The slug is URL data: it is read inside Suspense so the route's App Shell
// (unknown slug) never awaits it. ...
async function CaseStudy({ params, locale }: { params: Params; locale: Locale }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return ( /* header, metrics, cover, sections, gallery, prev-next */ );
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const t = await getTranslations({ locale: param, namespace: "Site.project" });
  return (
    <Suspense fallback={<div aria-hidden="true" className="h-10" />}>
      <CaseStudy params={params} locale={param} />
    </Suspense>
  );
}
```
- `generateMetadata` (lines 16-24) already awaits `params` + `locale()`; swap the return for `buildPageMetadata(...)`.
- Prev/next: inside `CaseStudy`, `await getProjects()` (already cached, same `order`), find index of slug, no wrap (D-03).
- Stack line: new `getProjectStacks()` (see queries below).
- All in-page ids slug-prefixed (`${slug}-problem`) — Pitfall 3.
- Back link pattern (lines 62-66) becomes `ArrowLeft` + `t("backHome")` to `/#work`.

---

### `src/app/[locale]/about/page.tsx`, `contact/page.tsx` (pages, NEW)

**Analog:** `src/app/[locale]/page.tsx` lines 10-17 (locale guard + `Promise.all` of `getTranslations({ locale, namespace })` and cached getters). About adds `getSkills()`, `getExperiences()` (`src/features/experience/queries.ts` `getExperiences`), `getEducation()`. Now = `<RichText doc={localized(settings, "now", param)} />` guarded by `docHasText` (`src/lib/rich-text.tsx` lines 8-13).

Contact page passes labels + locale to the client form, exactly as the admin login page passes `labels` to `LoginForm` (see `login-form.tsx` lines 14-22 `LoginLabels` type).

---

### `src/app/[locale]/**/opengraph-image.tsx` (metadata route handlers, NEW)

**Analog (params, not root params):** `src/app/api/cv/[lang]/route.ts` lines 6-14:
```ts
export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  await connection();
  const { lang } = await params;
  if (lang !== "en" && lang !== "es") {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
```
Use `const { locale } = await params; if (!isLocale(locale)) notFound();` and `getTranslations({ locale, namespace })` with explicit locale (root params throw in route handlers). Do NOT call `connection()` (OG should be static when params are known).

**Analog (TTF paths):** `src/features/resume/pdf/fonts.ts` lines 10-11:
```ts
const file = (name: string) => path.join(process.cwd(), "assets/fonts-pdf", name);
```
OG reads `FunnelDisplay-SemiBold.ttf` and `GeistMono-Regular.ttf` with `readFile` at module scope.

**Tracing:** `next.config.ts` line 58 — extend:
```ts
outputFileTracingIncludes: { "/admin/**": ["./assets/fonts-pdf/*.ttf"] },
```
add an entry for the OG routes (e.g. `"/[locale]/**/opengraph-image": [...]`).

---

### `src/app/sitemap.ts`, `src/app/robots.ts` (NEW)

**Analog:** `src/features/projects/queries.ts` lines 36-43 (published+visible slug query). Sitemap needs `updatedAt` too, so add a sibling core `getSitemapProjectsCore()` selecting `{ slug, updatedAt }` with the same `where`/`orderBy`, plus a cached wrapper tagged `tags.projects`. Use RESEARCH "Sitemap entry with next-intl" (`getPathname` for en/es/x-default). No `new Date()`.

---

### `src/proxy.ts` (MODIFY)

**Analog:** itself line 22-24:
```ts
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```
Change to `["/((?!api|_next|_vercel|.*/opengraph-image|.*\\..*).*)"]`. Do not touch the `/admin` branch (lines 12-20).

---

### `src/i18n/routing.ts` + `routing.test.ts` (MODIFY)

**Analog:** `routing.ts` lines 11-14:
```ts
pathnames: {
  "/": "/",
  "/projects/[slug]": { en: "/projects/[slug]", es: "/proyectos/[slug]" },
},
```
Add `"/about": { en: "/about", es: "/sobre-mi" }` and `"/contact": { en: "/contact", es: "/contacto" }`. Test: copy the `it("localizes the case-study path in Spanish")` block (routing.test.ts lines 12-18) for each new entry.

`src/components/site/hero-copy.ts` lines 19-22 hardcode `CTA_HREF`; replace with `getPathname({ locale, href: "/contact" })` from `@/i18n/navigation` (navigation.ts line 4 exports it).

---

### `src/components/site/site-header.tsx` (RSC, NEW)

**Analog:** `src/components/site/draft-banner.tsx` (async RSC that loads its own translations and renders a client leaf with string props), lines 8-23:
```tsx
export async function DraftBanner({ locale }: { locale: Locale }) {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  const t = await getTranslations({ locale, namespace: "DraftMode" });
  return (
    <section aria-label={t("label")} className="...">
      <p ...>{t("text")}</p>
      <DraftExitForm label={t("exit")} />
    </section>
  );
}
```
Header: `getTranslations({ locale, namespace: "Site.header" })` + `getSiteSettings()`, then `<Suspense fallback={<StaticNav/>}><NavLinks labels=… /></Suspense>` and same for `LangSwitch` (Pitfall 2). Container class: reuse `mx-auto max-w-page px-6 md:px-12` (hero-parts.tsx line 15).

### `src/components/site/nav-links.tsx`, `lang-switch.tsx` (client leaves, NEW)

**Analog:** `src/components/site/draft-exit-form.tsx` lines 1-8 (minimal client leaf, label from props, URL hook):
```tsx
"use client";
import { usePathname } from "next/navigation";
export function DraftExitForm({ label }: { label: string }) {
  const pathname = usePathname();
```
Deviation (RESEARCH Pattern 3): use `useSelectedLayoutSegment()` (NavLinks) and `useParams()` + `useSelectedLayoutSegments()` (LangSwitch) instead of `usePathname`. LangSwitch renders a plain `<a href hrefLang lang>` built with `getPathname`, never next-intl `<Link locale>`.

### `src/components/site/theme-toggle.tsx` (client, NEW)

**Analog for the button:** `src/components/site/hero/hero-parts.tsx` lines 1, 31-38 (`Button` from `@/components/ui/button`, `size` prop). Use `variant="ghost" size="icon-sm"`, both `Sun`/`Moon` icons rendered with `dark:hidden` / `hidden dark:inline` (Pitfall 10). No analog for `startViewTransition`; follow RESEARCH Pattern 2.

### `src/components/site/theme-script.tsx`, `inline-script.tsx`, `local-time.tsx`

No analog. Use RESEARCH "Inline script helper" (lines 466-478) and Pattern 4 (`useSyncExternalStore` with `() => null` server snapshot).

---

### `src/components/site/status-line.tsx` (MODIFY)

**Analog:** itself. Add two segments following the existing `segments.push` shape (lines 67-76):
```tsx
segments.push({
  key: "offset",
  content: formatUtcOffset(settings.timezone, settings.updatedAt),
  className: "text-muted-foreground",
});
segments.push({ key: "overlap", content: copy.overlap, className: "text-muted-foreground" });
```
The `offset` segment becomes `<time suppressHydrationWarning>` (+ offset text) and `overlap` a `<span suppressHydrationWarning>`, each with a stable id/data attribute the inline script targets. Keep the separator-closes-segment render (lines 78-100) — it is the rule "no line starts with ·", tested in `status-line.test.tsx` lines 95-102. Update test `hidden.length` expectation (line 122) if segment count changes.

### `src/components/site/site-footer.tsx`, `marginalia.tsx`, case-study meta row

**Analog:** `status-line.tsx` lines 11, 80-101 — the `Segment[]` + `whitespace-nowrap` span + `aria-hidden` `·` separator. Footer and the case-study meta row (`period · stack · live link · Source code`) must reuse this exact rendering (consider extracting a `SegmentLine` helper from StatusLine rather than duplicating). Settings-derived links render only when non-null (`githubUrl`, `linkedinUrl`, `calendarUrl` in `site-settings/schema.ts` lines 32-34).

### `src/components/site/page-section.tsx`, `entry-list.tsx`, `case-study/*` (RSC, NEW)

**Analog for grid + heading classes:** `src/components/site/hero/hero-parts.tsx` lines 13-19:
```ts
export const heroSectionClass =
  "mx-auto grid max-w-page grid-cols-1 gap-x-6 px-6 py-12 md:px-12 lg:grid-cols-12 lg:py-16";
export const heroTitleClass =
  "font-heading text-4xl font-semibold tracking-display text-balance hyphens-manual text-foreground";
```
UI-SPEC wants one shared `pageGridClass`; extract it from `heroSectionClass` (same value) into one place and reuse for H1 on case study/about/contact (`heroTitleClass`).

**Analog for number:** `src/components/site/section-number.tsx` lines 3-15 (`font-mono text-sm text-muted-foreground`). PageSection = rule + `SectionNumber` + h2.

**Analog for null-guard on empty content:** `hero-a.tsx` lines 14-18:
```tsx
const headline = localized(settings, "headline", locale) as string;
if (headline.trim() === "") {
  return null;
}
```
Every case-study part (metrics, cover, gallery, marginalia, each section) returns `null` the same way.

**Data shapes:** `src/features/projects/schema.ts` lines 16-23 (`TechDecisions`, `Metric`), 51-54 (`media`). Dates: `formatMonthYear(iso, locale)` from `src/lib/format.ts` lines 8-14 (`startedAt`/`finishedAt` are `'YYYY-MM-DD'` strings).

**Cover image:** `next/image` with `fetchPriority="high" loading="eager"` (not `priority`). Remote Blob host already allowed in `next.config.ts` lines 52-56.

**Rich text:** `RichText` from `src/lib/rich-text.tsx` lines 18-25; wrap in a prose container class (do not add `'use client'` anywhere in that import chain).

### `src/components/site/copy-email.tsx` (client, NEW)

**Analog:** `login-form.tsx` lines 1-22 (client leaf, `labels` prop type exported, `useState` for status) and the `role="alert"`/`text-destructive` message (lines 83-87). Use `<span aria-live="polite" className="sr-only">` for the "Copied" announcement.

---

### `src/features/contact/validation.ts` (NEW)

**Analog:** `src/features/auth/validation.ts` (full, 8 lines):
```ts
import { z } from "zod";
export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;
```
and the "shared by client form and Server Action" header comment from `src/features/projects/validation.ts` line 5. Contact schema: `name` (trim, 1-100), `email` (`z.email()`, ≤254), `message` (10-5000), `website` (honeypot, string, default ""), `elapsedMs` (`z.coerce.number()` default 0), `locale: z.enum(["en","es"])`. Error messages are codes, mapped to localized strings in the form (labels prop), as `login-form.tsx` maps any error to `labels.required`.

### `src/features/contact/public-actions.ts` (Server Action, NEW)

**Analog:** `src/features/contact/actions.ts` lines 1-33:
```ts
"use server";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
...
async function run(id: string, write: (id: string) => Promise<unknown>): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "validation" };
  try {
    await write(parsed.data);
  } catch (error) {
    console.error("contact action failed", error);
    return { ok: false, error: "server" };
  }
  return ok();
}
```
Copy: `"use server"` header, `safeParse` → `{ ok: false, error: "validation" }`, try/catch with `console.error("<name> failed", error)` and a plain-data result (no thrown errors cross the boundary — `src/lib/action-result.ts` lines 1-2). **Differences:** no `requireActionSession` (public), no `updateTag`/`exportContent` (contact_messages is private and excluded from export — actions.ts lines 10-11). Result type: define a separate `ContactResult` (`{ ok: true } | { ok: false; error: "validation" | "rate_limited" | "unavailable"; fieldErrors? }`) rather than widening the admin `ActionResult` union (whose `savedAt` is admin-specific). Order is fixed by D-09 / RESEARCH Pattern 5.

### `src/features/contact/submit-core.ts` + `submit-core.test.ts` (NEW)

**Env-gate analog:** `src/features/resume/actions.ts` lines 27-29 + `src/lib/blob.ts` lines 5-7:
```ts
if (!hasBlobToken()) return { ok: false, error: "token" };
...
export function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}
```
Mirror as `getLimiter(): Ratelimit | null` and `getMailer(): Resend | null` (in `src/lib/rate-limit.ts` / `src/lib/mailer.ts`, `import "server-only"`). Missing Upstash → `unavailable` + `console.error("Falta UPSTASH_REDIS_REST_URL/TOKEN")` (message style of `src/lib/env.ts` line 4). Missing Resend → save, confirm, log.

**Test analog:** `src/features/contact/actions.test.ts` lines 1-55 — `vi.fn()` call recorders, a hand-built `fakeDb` chain, `vi.mock("@/db", …)`, `vi.resetModules()` in `beforeEach`, dynamic `await import("./actions")`:
```ts
const fakeDb = {
  update: (...args: unknown[]) => {
    calls.update(...args);
    return { set: (value: unknown) => { calls.set(value); return { where: async (cond: unknown) => { calls.where(cond); return []; } }; } };
  },
  ...
};
vi.mock("@/db", () => ({ db: fakeDb }));
```
For the core, inject `{ db, limiter, sendEmail, headers }` as arguments instead of `vi.mock`, and cover: honeypot, elapsed < 3000, limiter null, `reason: "timeout"`, `success: false`, limiter throws, insert ok + mailer error → still `{ ok: true }`.

### `src/features/contact/components/contact-form.tsx` + `.test.tsx` (client form, NEW)

**Analog:** `src/app/admin/login/login-form.tsx` lines 1-93. Imports (lines 1-11):
```tsx
"use client";
import "@/lib/zod-jitless";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
```
Field block with a11y wiring (lines 51-66):
```tsx
<div className="flex flex-col gap-2">
  <Label htmlFor="email">{labels.email}</Label>
  <Input
    id="email" type="email" autoComplete="email"
    aria-invalid={errors.email ? true : undefined}
    aria-describedby={errors.email ? "email-error" : undefined}
    {...register("email")}
  />
  {errors.email ? <p id="email-error" className="text-sm text-destructive">{labels.required}</p> : null}
</div>
```
Form-level error (lines 83-87): `<p role="alert" className="text-sm text-destructive">`. `useFormState({ control })` not destructured `formState` (React Compiler rule, line 29). Add: `textarea` from `@/components/ui/textarea`, honeypot in `sr-only aria-hidden` wrapper, `performance.now()` at mount for `elapsedMs`, `submitContact.bind(null, locale)` or pass locale arg, confirmation block replacing the form with focused `h2 tabIndex={-1}`, Activity reset `useLayoutEffect` (RESEARCH Pattern 1). IDs should be namespaced (`contact-email`) to avoid collisions with hidden Activity routes.

**Test analog:** `src/app/admin/login/login-form.test.tsx` lines 1-46 (`// @vitest-environment jsdom`, `vi.hoisted` mocks, `userEvent.setup()`, `getByLabelText`, `findByRole("alert")`). Mock `../public-actions` the way it mocks `@/lib/auth-client` (lines 12-14).

### `src/features/contact/schema.ts` + migration (MODIFY)

**Analog:** itself line 15:
```ts
readAt: timestamp("read_at", { withTimezone: true }),
```
Add `emailSentAt: timestamp("email_sent_at", { withTimezone: true }),`. Run `pnpm db:generate` → `drizzle/0003_*.sql` (shape like `drizzle/0002_keen_mentor.sql`: `ALTER TABLE "contact_messages" ADD COLUMN "email_sent_at" timestamp with time zone;`). Never hand-edit; never touch 0000-0002.

### `/admin/mensajes` badge (MODIFY)

- `src/features/contact/admin-queries.ts` lines 10-19: add `emailSentAt: contactMessages.emailSentAt` to the select (keep `ipHash` out, comment line 7).
- `src/app/admin/(panel)/mensajes/page.tsx` lines 33-37: ISO mapping, add `emailSentAt: row.emailSentAt ? row.emailSentAt.toISOString() : null`.
- `message-reader.tsx` lines 27-35: add `emailSentAt: string | null` to `MessageRow`; labels via `MessageReaderLabels` + `Admin.messages` keys.
- `messages-table.tsx` `NameCell` lines 62-82: next to the `labels.new` span, render a badge using `src/components/admin/status-badge.tsx` `base` class + `HiddenBadge` shape (lines 10-11, 52-58):
```tsx
const base = "inline-flex h-6 items-center rounded-[var(--radius)] border px-2 font-mono text-xs whitespace-nowrap";
export function HiddenBadge({ label }: { label: string }) {
  return <span className={cn(base, "border-border text-muted-foreground")}>{label}</span>;
}
```
(UI-SPEC: outline, no accent, no destructive.)

---

### `src/features/projects/queries.ts` (MODIFY: `getProjectStacks`)

**Analog:** itself — core + cached wrapper (lines 31-34 and 62-68):
```ts
export async function getProjectsCore(opts: Opts) {
  const rows = await projectsQuery(db, opts);
  return rows.map((row) => mapRow(row, opts));
}

export async function getProjects() {
  "use cache";
  cacheTag(tags.projects);
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getProjectsCore({ includeDrafts: isEnabled });
}
```
`getProjectStacksCore(opts)`: `db.select({ projectId: projectSkills.projectId, name: skills.name }).from(projectSkills).innerJoin(skills, eq(...))` with skill `status = 'published' AND visible` (filter pattern lines 20-22), `orderBy(asc(skills.order))`; group into `Record<projectId, string[]>`. Wrapper: `cacheTag(tags.projects, tags.skills)`. Wrappers never read the locale (header comment lines 1-3). Skills filter analog: `src/features/skills/queries.ts` lines 14-23.

**Test analog:** `src/features/projects/queries.test.ts` lines 17-37 (`.toSQL()` against `createDb(URL)` with `vi.stubEnv("DATABASE_URL", URL)` before import). Export the query builder taking `handle: Db` (like `projectsQuery`, line 15) so it is SQL-testable.

### `media` caption fields (MODIFY, P2)

- `src/features/projects/schema.ts` lines 51-54: extend `$type<{ url; altEn; altEs; type; captionEn?: string; captionEs?: string; capturedAt?: string }[]>`.
- `src/features/projects/validation.ts` lines 37-42 `mediaItem` strictObject: add `captionEn: text.optional()`, `captionEs: text.optional()`, `capturedAt: z.string().optional()` (strictObject would reject them otherwise).
- `src/components/admin/image-uploader.tsx` lines 18-23 `MediaItem` type + the `BilingualField` usage at lines 223-229 — add a second `BilingualField` for `media.${index}.captionEs/En` with the same props shape.

---

### `src/lib/overlap.ts`, `src/lib/plain-text.ts` (pure utilities, NEW)

**Analog:** `src/lib/format.ts` lines 1-4 (header comment: deterministic, never reads the clock, never depends on machine TZ) and the `Intl.DateTimeFormat` + `timeZone` usage (lines 17-24). `overlap.ts` must be self-contained (no imports) because it is stringified into the inline script.

**Test analog:** `src/lib/format.test.ts` lines 1-30 (`describe`/`it` with literal expected strings; note line 8-9: tests also run under `TZ=America/Bogota` and `TZ=UTC`). Use the RESEARCH DST vector table (Pattern 4) as cases, plus `new Function("return " + String(overlapHours))()` evaluation (Assumption A4).

### `src/lib/seo.ts`, `src/lib/site-url.ts` (NEW)

**Analog:** `src/lib/mailto.ts` (small pure helper with one exported function and a test, `mailto.test.ts`). `siteUrl()`: `NEXT_PUBLIC_SITE_URL` (exists in `.env.example` line 13) → `https://${VERCEL_PROJECT_PRODUCTION_URL}` → `http://localhost:3000`, styled like `hasBlobToken` (`?.trim()` check). `buildPageMetadata({ locale, title, description, href })` returns complete `alternates`/`openGraph`/`twitter` objects (Pitfall 12).

---

### `messages/en.json` / `es.json` (MODIFY)

**Analog:** `Site` namespace (en.json lines 16-28):
```json
"Site": {
  "home": { "projectsHeading": "Projects" },
  "project": { "backHome": "All projects" },
  "notFound": { ... }
}
```
Add `Site.header`, `Site.footer`, `Site.project.*`, `Site.about`, `Site.contact`, `Site.og`, and `Admin.messages.emailNotSent*`. Parity is enforced by `src/lib/messages.test.ts` (namespace + key parity, lines 20-40). Server reads via `getTranslations({ locale, namespace })`; client components get strings as props (layout `messages={null}`).

---

### `e2e/public.spec.ts` (MODIFY) and new e2e specs

**Analog:** itself. Keep the data-driven loop (lines 12-19, 82-107) and `expectNoBlockingViolations` from `e2e/axe.ts`. Must change: line 30 `expect(page.locator("h1")).toHaveText(siteName)` (hero headline replaces the name) and lines 86/89 `page.locator("h1")` → `page.getByRole("heading", { level: 1 })` or `.filter({ visible: true })` (Pitfall 3, Activity-hidden routes). Request-context pattern for OG/sitemap/robots (lines 41-57):
```ts
const ctx = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { ... } });
const res = await ctx.get("/");
expect(res.status()).toBe(200);
```
Header assertions style: `e2e/headers.spec.ts` lines 16-40 (loop over paths, add `/about`, `/contact`, `/es/sobre-mi`, `/es/contacto`). DB helpers for contact e2e (insert/cleanup) go in `e2e/db.ts`, which already exports `sql` (line 5) and temp-row helpers (lines 41-56).

### RSC unit tests (NEW)

**Analog:** `src/components/site/status-line.test.tsx` lines 1-29 (`renderToStaticMarkup`, a `base` fixture stating every field "Test inputs, not site content", `render(overrides, locale)` helper) and `src/components/site/hero/hero.test.tsx` lines 1-30 (uses `heroFixture` from `src/features/site-settings/fixture.ts`). Only sync components are unit-testable; async pages go to Playwright.

---

## Shared Patterns

### Locale resolution in pages
**Source:** `src/app/[locale]/page.tsx` lines 11-12, `src/app/[locale]/not-found.tsx` lines 7-12
**Apply to:** every new page and layout under `[locale]`
```tsx
const param = await locale();          // from "next/root-params"
if (!isLocale(param)) notFound();      // from "@/lib/locale"
const t = await getTranslations({ locale: param, namespace: "Site.x" });
```
**Not available** in Server Actions and route handlers (OG): there use an explicit `locale` argument / `params.locale` (pattern from `src/app/api/cv/[lang]/route.ts` lines 11-14).

### Cached public queries (core + wrapper, Plan B seam)
**Source:** `src/features/projects/queries.ts` lines 1-3, 31-34, 62-76; `src/features/site-settings/queries.ts` lines 12-32
**Apply to:** `getProjectStacks`, sitemap query
- Core takes `{ includeDrafts }`, wrapper does `"use cache"` + `cacheTag(...)` + `cacheLife("max")` + `draftMode()`; wrappers never read the locale; pages apply `localized()`.

### Localized fields
**Source:** `src/lib/i18n-fields.ts` lines 5-12
**Apply to:** all case-study, about, OG, metadata rendering
```ts
localized(row, "title", locale) as string  // falls back to En only on null/undefined, keeps ""
```

### Missing content = no render
**Source:** `src/components/site/hero/hero-a.tsx` lines 14-18; `src/lib/rich-text.tsx` lines 19-20 (`docHasText`); `src/app/[locale]/page.tsx` lines 20, 25
**Apply to:** every site component and section.

### Server Action result shape and error logging
**Source:** `src/lib/action-result.ts` lines 1-15; `src/features/contact/actions.ts` lines 20-33
**Apply to:** `public-actions.ts`
- Plain-data `{ ok: true } | { ok: false, error, fieldErrors? }`; `console.error("<thing> failed", error)`; never throw across the boundary; log codes/names, never message bodies or emails (RESEARCH V7).

### Env-gated external clients
**Source:** `src/lib/blob.ts` lines 1-7; `src/features/resume/actions.ts` line 29; `src/lib/env.ts` line 4 (Spanish "Falta X" message)
**Apply to:** Upstash limiter, Resend mailer, `siteUrl()`
- `import "server-only"`, a `hasX()`/`getX(): Client | null` check, callers branch with a clear message; never a mock or invented value.

### Client leaves get strings as props
**Source:** `src/components/site/draft-banner.tsx` lines 11-20 → `draft-exit-form.tsx` line 6; `login-form.tsx` lines 14-22 (exported `Labels` type)
**Apply to:** `NavLinks`, `LangSwitch`, `ThemeToggle`, `CopyEmail`, `ContactForm`, `LocalTime`

### Segment line with trailing separator
**Source:** `src/components/site/status-line.tsx` lines 11, 78-101
**Apply to:** StatusLine additions, footer, case-study meta row, entry stack line, figcaption (`caption · date`)

### Accessible form fields
**Source:** `src/app/admin/login/login-form.tsx` lines 51-87
**Apply to:** `ContactForm` (and `CopyEmail` error text)
- `Label htmlFor` + `aria-invalid` + `aria-describedby` + `text-sm text-destructive` error; `role="alert"` for form-level errors; `noValidate` + `zodResolver`; `useFormState({ control })`.

### Link buttons
**Source:** `src/components/site/hero/hero-parts.tsx` lines 29-39
**Apply to:** case-study closing CTA "Let's talk", "Ask for a demo" if rendered as a button
```tsx
<Button size="lg" nativeButton={false}
  // biome-ignore lint/a11y/useAnchorContent: Base UI renders the children inside this anchor
  render={<a href={cta.href} />}>
  {cta.label}
</Button>
```

### Localized URLs
**Source:** `src/i18n/navigation.ts` line 4 (`getPathname`, `Link`); `src/app/[locale]/page.tsx` lines 33-40
**Apply to:** sitemap, `alternates.languages`, LangSwitch, hero/closing CTA (replace `hero-copy.ts` `CTA_HREF`), "All projects" back link, prev/next. Never string-concatenate `/es/proyectos/`.

### Deterministic dates
**Source:** `src/lib/format.ts` lines 1-34
**Apply to:** entry dates, period, Now "Updated" date, OG footer date, figcaption date
- `formatMonthYear(iso, locale)`, `formatEntryDate(at, tz)`. Never `new Date()` during prerender.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/components/site/theme-script.tsx` / `inline-script.tsx` | RSC inline script | — | No inline scripts exist yet; use RESEARCH "Inline script helper" + Pattern 2 |
| `src/components/site/local-time.tsx` | client timer | event-driven | No `useSyncExternalStore` usage in repo; RESEARCH Pattern 4 |
| `src/components/motion/reveal.tsx` | CSS motion | — | `src/components/motion/` does not exist; RESEARCH Pattern 8 (keyframes go in `globals.css` after the `@layer base` block, lines 109-119) |
| `src/components/motion/split-heading.tsx` | client GSAP | event-driven | No GSAP usage yet; RESEARCH Pattern 8, dynamic `import("gsap")` |
| `src/components/motion/scroll-scene.tsx` | client GSAP | event-driven | Same; `gsap.matchMedia`, scoped to ref |
| `src/app/[locale]/**/opengraph-image.tsx` (`ImageResponse` body) | OG render | transform | No `next/og` usage yet; only params/fonts patterns have analogs (above) |
| Route `<ViewTransition>` in layout | layout wrapper | — | No VT usage; `.agents/skills/vercel-react-view-transitions/SKILL.md` + RESEARCH Pattern 8 last bullet; drop if glitchy |

## Metadata

**Analog search scope:** `src/app/[locale]/`, `src/app/admin/`, `src/app/api/`, `src/components/site/`, `src/components/admin/`, `src/features/{contact,projects,skills,experience,site-settings,resume,auth}/`, `src/lib/`, `src/i18n/`, `src/proxy.ts`, `next.config.ts`, `drizzle/`, `e2e/`, `messages/`
**Files scanned:** ~45 read, ~230 listed
**Pattern extraction date:** 2026-11-22
