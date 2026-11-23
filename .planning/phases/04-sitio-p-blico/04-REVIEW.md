---
phase: 04-sitio-p-blico
reviewed: 2026-11-23T00:00:00Z
depth: standard
files_reviewed: 146
files_reviewed_list:
  - .env.example
  - drizzle/0003_thankful_white_tiger.sql
  - e2e/about.spec.ts
  - e2e/accent.spec.ts
  - e2e/admin-messages.spec.ts
  - e2e/admin-reorder.spec.ts
  - e2e/admin-settings.spec.ts
  - e2e/axe.ts
  - e2e/case-study-motion.spec.ts
  - e2e/case-study.spec.ts
  - e2e/contact-live.spec.ts
  - e2e/contact.spec.ts
  - e2e/headers.spec.ts
  - e2e/home-motion.spec.ts
  - e2e/keyboard.spec.ts
  - e2e/lang-theme.spec.ts
  - e2e/nav-client.spec.ts
  - e2e/public.spec.ts
  - e2e/reduced-motion.spec.ts
  - e2e/route-transition.spec.ts
  - e2e/routes.spec.ts
  - e2e/screens-about.spec.ts
  - e2e/screens-case.spec.ts
  - e2e/screens-contact.spec.ts
  - e2e/screens-home.spec.ts
  - e2e/screens.ts
  - e2e/seo.spec.ts
  - messages/en.json
  - messages/es.json
  - next.config.ts
  - scripts/lighthouse-preview.mjs
  - scripts/project-status.mjs
  - src/app/[locale]/about/opengraph-image.tsx
  - src/app/[locale]/about/page.tsx
  - src/app/[locale]/contact/opengraph-image.tsx
  - src/app/[locale]/contact/page.tsx
  - src/app/[locale]/layout.tsx
  - src/app/[locale]/not-found.tsx
  - src/app/[locale]/opengraph-image.tsx
  - src/app/[locale]/page.tsx
  - src/app/[locale]/projects/[slug]/opengraph-image.tsx
  - src/app/[locale]/projects/[slug]/page.tsx
  - src/app/admin/(panel)/mensajes/page.tsx
  - src/app/globals.css
  - src/app/robots.ts
  - src/app/sitemap.ts
  - src/components/admin/image-uploader.tsx
  - src/components/motion/reveal.test.tsx
  - src/components/motion/reveal.tsx
  - src/components/motion/scroll-scene.tsx
  - src/components/site/about/about.test.tsx
  - src/components/site/about/education-list.tsx
  - src/components/site/about/experience-list.tsx
  - src/components/site/about/language-list.tsx
  - src/components/site/about/now-section.tsx
  - src/components/site/about/stack-list.tsx
  - src/components/site/alternate-href.test.ts
  - src/components/site/alternate-href.ts
  - src/components/site/case-study/case-cover.tsx
  - src/components/site/case-study/case-cta.tsx
  - src/components/site/case-study/case-gallery.tsx
  - src/components/site/case-study/case-header.tsx
  - src/components/site/case-study/case-metrics.tsx
  - src/components/site/case-study/case-sections.tsx
  - src/components/site/case-study/case-study.test.tsx
  - src/components/site/case-study/plain-text.tsx
  - src/components/site/case-study/prev-next.tsx
  - src/components/site/case-study/section-margin-number.tsx
  - src/components/site/copy-email.test.tsx
  - src/components/site/copy-email.tsx
  - src/components/site/entry-list.test.tsx
  - src/components/site/entry-list.tsx
  - src/components/site/footer-line.tsx
  - src/components/site/hero-copy.ts
  - src/components/site/hero/hero-a.tsx
  - src/components/site/hero/hero-parts.tsx
  - src/components/site/hero/hero.test.tsx
  - src/components/site/home-contact.tsx
  - src/components/site/inline-script.tsx
  - src/components/site/lang-switch.test.tsx
  - src/components/site/lang-switch.tsx
  - src/components/site/local-time.tsx
  - src/components/site/marginalia.test.tsx
  - src/components/site/marginalia.tsx
  - src/components/site/nav-links.tsx
  - src/components/site/page-section.test.tsx
  - src/components/site/page-section.tsx
  - src/components/site/segment-line.test.tsx
  - src/components/site/segment-line.tsx
  - src/components/site/site-footer.test.tsx
  - src/components/site/site-footer.tsx
  - src/components/site/site-header.tsx
  - src/components/site/status-clock-script.tsx
  - src/components/site/status-line.test.tsx
  - src/components/site/status-line.tsx
  - src/components/site/theme-script.tsx
  - src/components/site/theme-toggle.tsx
  - src/components/ui/textarea.tsx
  - src/db/schema.test.ts
  - src/features/contact/admin-queries.ts
  - src/features/contact/components/contact-aside.test.tsx
  - src/features/contact/components/contact-aside.tsx
  - src/features/contact/components/contact-form.test.tsx
  - src/features/contact/components/contact-form.tsx
  - src/features/contact/components/message-reader.tsx
  - src/features/contact/components/messages-table.tsx
  - src/features/contact/notify.test.ts
  - src/features/contact/notify.ts
  - src/features/contact/public-actions.ts
  - src/features/contact/schema.ts
  - src/features/contact/submit-core.test.ts
  - src/features/contact/submit-core.ts
  - src/features/contact/validation.test.ts
  - src/features/contact/validation.ts
  - src/features/projects/adjacent.test.ts
  - src/features/projects/adjacent.ts
  - src/features/projects/content-schema.ts
  - src/features/projects/form-model.ts
  - src/features/projects/queries.test.ts
  - src/features/projects/queries.ts
  - src/features/projects/schema.ts
  - src/features/projects/validation.test.ts
  - src/features/projects/validation.ts
  - src/i18n/routing.test.ts
  - src/i18n/routing.ts
  - src/lib/ip-hash.test.ts
  - src/lib/ip-hash.ts
  - src/lib/mailer.ts
  - src/lib/messages.test.ts
  - src/lib/messages.ts
  - src/lib/og-page.tsx
  - src/lib/og.test.ts
  - src/lib/og.tsx
  - src/lib/overlap.test.ts
  - src/lib/overlap.ts
  - src/lib/plain-text.test.ts
  - src/lib/plain-text.ts
  - src/lib/section-numbers.test.ts
  - src/lib/section-numbers.ts
  - src/lib/seo.test.ts
  - src/lib/seo.ts
  - src/lib/site-url.test.ts
  - src/lib/site-url.ts
  - src/proxy.ts
  - vitest.config.ts
findings:
  critical: 1
  warning: 9
  info: 9
  total: 19
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-11-23
**Depth:** standard
**Files Reviewed:** 146
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

I reviewed the public site for phase 04: the home, case study, about and contact pages, the contact Server Action pipeline (Zod, honeypot and elapsed check, Upstash fail-closed limiter, insert, Resend in `after()`), SEO/OG/sitemap, the inline scripts, motion, i18n routing and the admin inbox.

The main security work holds up:
- Zod validation runs on the server with `strictObject`.
- The locale is passed as an argument and validated.
- The email subject strips CR/LF, and the email body is plain `text` through Resend's JSON API, so there is no header injection.
- Logs carry only error names and ids.
- `ipHash` is never selected for the admin.
- Rich text goes through a Zod schema that allows only `https:` and `mailto:` links, and it is rendered as React elements.
- The stored strings in `StatusClockScript` are escaped with JSON plus `<` → `<`.
- The cached queries never read the locale.

The defects are in other places:
- The contact form crashes when the Server Action call fails, for example on a network error or a "Failed to find Server Action" error after a redeploy. This is the one blocker.
- The rate limit is easy to get around over IPv6.
- One env fallback silently disables the form.
- One unvalidated jsonb date can crash a published case study.
- The status line's clock and its overlap hours disagree when the timezone setting changes.
- One script, and parts of the e2e suite, bypass or exhaust the project's own pipelines.

Known items in `deferred-items.md` (soft 404 with noindex, unlocalized `og:image:alt`) are not repeated. The Report-Only CSP decision is accepted; WR-08 covers only the part of its mitigation that does not work.

## Critical Issues

### CR-01: The contact form crashes when the Server Action call throws (redeploy skew, network error)

**File:** `src/features/contact/components/contact-form.tsx:126-143`
**Issue:** `onSubmit` awaits `submitContact(...)` inside `startTransition(async () => ...)` with no `try/catch`. Server Action calls throw on the client in several ordinary cases:
- a network blip or offline visitor ("Failed to fetch");
- a 5xx before the action body runs;
- an action ID that no longer exists after a deployment ("Failed to find Server Action").

The bundled Next docs (`02-guides/server-actions.md` §Deployment considerations) say IDs rotate on new deployments and recommend: "Surface the error as a retry path in the UI rather than a hard failure." The contact page is a static, long-cached shell, so a visitor can easily have it open across one of Teo's deploys.

In React 19, an error thrown inside a transition goes to the nearest error boundary. There is no `error.tsx` under `src/app/[locale]/` and no `global-error.tsx`, so the visitor gets Next's generic "Application error" screen and loses the typed message. The `unavailable` alert with the mailto fallback, which exists for exactly this case, never appears. This is the site's only conversion form.
**Fix:**
```tsx
startTransition(async () => {
  let result: ContactResult;
  try {
    result = await submitContact(locale, payload);
  } catch {
    setFormError("unavailable"); // keeps the typed values; the alert offers mailto
    return;
  }
  // ...existing handling
});
```
Also add a `src/app/[locale]/error.tsx` (client component, localized retry plus mailto) so other unexpected errors degrade the same way.

## Warnings

### WR-01: The rate limit is per exact IP, so rotating IPv6 addresses gets around it, and there is no global cap

**File:** `src/features/contact/public-actions.ts:19-20`, `src/lib/rate-limit.ts:18-23`
**Issue:** The limiter key is the HMAC of the full client address (3 per hour). Any IPv6 client controls at least a /64 (2^64 addresses), so a single host can send without limit by rotating source addresses. Every message lands in `contact_messages` and triggers a Resend email to Teo's inbox. Nothing else bounds the volume: there is no per-/64 bucket and no site-wide ceiling, and the honeypot and elapsed-time checks are client-supplied and trivial to fake.
**Fix:** Normalize IPv6 to its /64 prefix before hashing, and add a second, global limiter (for example `slidingWindow(30, "1 h")` on the key `"global"`) that is checked after the per-IP one:
```ts
const key = ip.includes(":") ? ip.split(":").slice(0, 4).join(":") + "::/64" : ip;
```
(Use a proper IPv6 expansion before slicing, because `::` compression breaks the naive split.)

### WR-02: The `??` env fallback ignores `KV_REST_API_*` when `UPSTASH_REDIS_REST_*` is set but empty

**File:** `src/lib/rate-limit.ts:11-16`
**Issue:** `process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL` only falls through on `undefined`. `.env.example` ships `UPSTASH_REDIS_REST_URL=` and `UPSTASH_REDIS_REST_TOKEN=` as empty lines. A `.env.local` copied from it, with Marketplace `KV_REST_API_*` added, therefore yields `"".trim()` → `!url` → `null`, and the form is permanently `unavailable`. The URL and the token can also come from different providers when only one of each pair is set.

`e2e/contact-live.spec.ts:4-6` and `e2e/contact.spec.ts` use `||` for `HAS_LIMITER`. In that configuration the tests assume a limiter exists while the app has none, and they fail with a misleading error.
**Fix:**
```ts
const pick = (a?: string, b?: string) => (a?.trim() || b?.trim()) || undefined;
const url = pick(process.env.UPSTASH_REDIS_REST_URL, process.env.KV_REST_API_URL);
const token = pick(process.env.UPSTASH_REDIS_REST_TOKEN, process.env.KV_REST_API_TOKEN);
```
Better still, choose one pair as a whole: use `UPSTASH_*` only if both are non-empty, otherwise `KV_*`.

### WR-03: An invalid `capturedAt` month crashes the published case study (RangeError)

**File:** `src/features/projects/validation.ts:44-47`, `src/components/site/case-study/case-gallery.tsx:42-49`, `src/lib/format.ts:8-14`
**Issue:** `capturedAt` is stored in `media` jsonb and validated only by `/^\d{4}-\d{2}(-\d{2})?$/`, so `2025-13`, `2025-00` or `2025-02-31` pass. `formatMonthYear` builds `new Date("2025-13-01T00:00:00Z")`, which is an Invalid Date, and `Intl.DateTimeFormat#format` throws `RangeError: Invalid time value`. The whole `/projects/[slug]` render fails.

The admin uses `<input type="month">` (`image-uploader.tsx`), but desktop Safari renders that as a free-text field, so a typo is realistic. Unlike `startedAt`/`finishedAt` (Postgres `date` columns), Postgres does not check jsonb values.
**Fix:** Validate real dates in Zod, and make the formatter defensive:
```ts
capturedAt: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/)
  .refine((v) => !Number.isNaN(Date.parse(`${v.length === 7 ? `${v}-01` : v}T00:00:00Z`)))
  .optional(),
```
In `CaseGallery`, skip the date segment when the parsed date is invalid instead of throwing.

### WR-04: The status line's overlap hours ignore `settings.timezone`, and the UTC offset is frozen at `updatedAt`

**File:** `src/lib/overlap.ts:5-17`, `src/components/site/status-clock-script.tsx:20`, `src/components/site/local-time.tsx:55`, `src/components/site/status-line.tsx:68-70`
**Issue:**
1. `timezone` is an editable setting (`site-settings/validation.ts:56,99`, any known IANA zone). The clock uses it, but `overlapHours` hardcodes `America/Bogota` and 14:00-23:00 UTC. If Teo changes the zone, the line shows his new local time next to overlap hours computed for Bogotá.
2. The offset text ("UTC-5") is computed server-side at `settings.updatedAt`. Both the inline script and `LocalTime` replace only the `HH:MM ` prefix and keep the stale offset. For any DST zone, the offset is wrong for half the year until the settings are saved again.

**Fix:** Pass `timeZone` into `overlapHours` and derive the home workday from it, the same way `hoursWith` does for Toronto and Madrid. In the script and in `LocalTime`, recompute the offset client-side (`timeZoneName: "shortOffset"`) and write the whole `HH:MM UTC±N` string, not just the time.

### WR-05: A decision with an empty title renders an empty `<h3>` and duplicate React keys

**File:** `src/components/site/case-study/case-sections.tsx:59-63, 132-138`
**Issue:** The filter keeps a decision when `title` **or** `body` has text, so `{ title: "", body: "..." }` passes. It renders `<h3 className="font-semibold"></h3>` (an empty heading, which axe flags), and `key={decision.title}` collides as soon as two decisions have an empty or identical title. The draft schema (`techDecisions.decisions: { title: text, body: text }`) does not require a title.
**Fix:** Render the `<h3>` only when `decision.title.trim()` is non-empty, and key by index (static, never reordered) or by `${i}-${title}`.

### WR-06: The footer renders an empty segment and a dangling separator when `location` is empty

**File:** `src/components/site/footer-line.tsx:28-30`, `src/components/site/segment-line.tsx:17-19`
**Issue:** `location` is not required to publish (`settingsPublishSchema` checks only name, headline, bio and email), so it can be `""`. `SegmentLine` filters only `null`/`undefined`, so the footer prints "Mateo Jaramillo ·  · GitHub ...". `StatusLine` guards with `location.trim() !== ""`, but `FooterLine` has no such check.
**Fix:** `content: settings.location.trim() ? settings.location : null`, or make `SegmentLine` also drop empty strings.

### WR-07: `scripts/project-status.mjs` changes project status without `updateTag` or `exportContent`

**File:** `scripts/project-status.mjs:11-17`
**Issue:** `draft SLUG` runs a raw `UPDATE projects SET status='draft'` against whatever `DATABASE_URL` is in `.env.local`. It also leaves `updated_at` unchanged, so the sitemap's `lastModified` is stale. Public queries use `cacheLife("max")` with `cacheTag(tags.projects)`, so the unpublished case study keeps being served from cache, and it stays in the sitemap and in the home list until another admin mutation happens to invalidate the tag. The content export also goes out of sync. CLAUDE.md says every mutation is a Server Action ending in `updateTag` → `exportContent()`.
**Fix:** Remove the mutating branch and use the admin's unpublish action. If a CLI path is needed, call `revalidateTag(tags.projects, "max")` through an authenticated route, or at least print a loud warning that caches stay stale, and refuse to run when `VERCEL_ENV=production`.

### WR-08: The Report-Only CSP has no reporting endpoint, so its review condition can never be met

**File:** `next.config.ts:9-26`
**Issue:** The CSP is `Content-Security-Policy-Report-Only` "until the reports are reviewed", but it has no `report-uri` or `report-to`. Violations go only to each visitor's devtools console, so no reports reach anyone, and the site has no enforced CSP at all. Report-Only itself is accepted until phase 5 (decisions.md 2026-11-22). This finding is about the mitigation not working.

There is a second problem for the phase 5 plan to hash `ThemeScript` and the clock script (T-04-06). `StatusClockScript` interpolates `settings.timezone` and the overlap template, so its hash changes every time those settings change. A static header hash will break the clock after the first settings edit.
**Fix:** Add `report-to` with a `Reporting-Endpoints` header (or `report-uri`) pointing to a small route handler, or document that reports are collected manually. For phase 5, move the dynamic values into `data-*` attributes on the status line, so the script body stays a constant string and gets a stable hash.

### WR-09: The name max-length error tells the visitor to "Write your name."

**File:** `src/features/contact/validation.ts:9`
**Issue:** `.max(100, "nameRequired")` reuses the "required" code, so a visitor whose name is over 100 characters sees "Write your name." / "Escribe tu nombre." next to a filled field. The client resolver blocks the submit, and the message gives no hint of what to change. `message` has a separate `messageLong` code. `name` does not.
**Fix:** Add a `nameLong` code with `Site.contact.errors.nameLong` in both message files, and add it to `ErrorCode` in `contact-form.tsx`.

## Info

### IN-01: The `motion-ok` class is set but no CSS uses it

**File:** `src/components/site/theme-script.tsx:5`, `src/components/site/theme-toggle.tsx:32-34`
**Issue:** Both add `motion-ok` to `<html>`, but `globals.css` gates motion with `@media (prefers-reduced-motion: no-preference)`, and only an e2e test reads the class. It is also never removed when the preference changes at runtime.
**Fix:** Remove the class or use it in CSS, and drop the e2e assertion that depends on it.

### IN-02: The `typeof window` ternary in `InlineScript` is dead code and its comment is misleading

**File:** `src/components/site/inline-script.tsx:4-11`
**Issue:** `InlineScript` is a Server Component (no `'use client'`), so `typeof window` is always `"undefined"` and the RSC payload always says `text/javascript`. The comment says the client renders `text/plain`, which never happens. The real reason the script does not re-run is that React does not execute scripts it inserts on the client.
**Fix:** Hardcode the attribute (or omit `type`) and correct the comment.

### IN-03: `String.replace` with visitor-controlled replacement strings interprets `$` patterns

**File:** `src/features/contact/components/message-reader.tsx:128, 187-190`
**Issue:** `labels.reader.replace("{nombre}", message.name)` treats `$&`, `` $` `` and `$'` in the visitor's name as special patterns, so a name like `$'` renders garbled admin text. React escapes the output, so this is cosmetic, not XSS.
**Fix:** Use a replacer function: `.replace("{nombre}", () => message.name)`.

### IN-04: The OG card date uses the UTC day, unlike the rest of the site

**File:** `src/lib/og-page.tsx:34-37`
**Issue:** `settings.updatedAt.toISOString().slice(0, 10)` takes the UTC date. Near a month boundary (evening in Bogotá), the OG card shows the next month. `formatEntryDate(at, timeZone)` already exists for exactly this.
**Fix:** `formatMonthYear(formatEntryDate(settings.updatedAt, settings.timezone), locale)`.

### IN-05: The IP hashing key and the trusted IP source are implicit

**File:** `src/features/contact/public-actions.ts:19-23`
**Issue:**
- The HMAC key reuses `BETTER_AUTH_SECRET`. Rotating the auth secret silently resets every rate-limit window and breaks correlation of stored `ip_hash` values.
- The first `x-forwarded-for` entry is trustworthy only behind Vercel's edge, which overwrites the header. Self-hosted or behind another proxy, a visitor can spoof it and get a fresh bucket on every request.
- Requests without the header all share the `"unknown"` bucket, so one bot could lock out every such visitor.

**Fix:** Use a dedicated `CONTACT_IP_HASH_KEY` (or derive one with HKDF from the auth secret and a label). Read `x-real-ip` / `@vercel/functions` `ipAddress()`, and fail closed (`unavailable`) when no IP is available instead of pooling.

### IN-06: The proxy matcher's `.*/opengraph-image` exclusion is unanchored

**File:** `src/proxy.ts:23`
**Issue:** The negative lookahead matches any path that contains `/opengraph-image`. A project slug starting with `opengraph-image` (which `SLUG_PATTERN` allows) would skip the next-intl rewrite and 404 on `/projects/opengraph-image-...` and `/es/proyectos/...`.
**Fix:** Anchor it: `.*/opengraph-image(?:-[\\w]+)?$`, or match the generated suffix exactly.

### IN-07: A failed GSAP chunk import in `ScrollScene` is an unhandled rejection

**File:** `src/components/motion/scroll-scene.tsx:18-49`
**Issue:** The `Promise.all([import("gsap"), ...]).then(...)` chain has no `.catch`. A failed chunk load (offline, or a stale deploy) logs an unhandled rejection. The scene is progressive enhancement, so this should fail silently.
**Fix:** Append `.catch(() => {})`.

### IN-08: Content-keyed lists can produce duplicate React keys

**File:** `src/components/site/case-study/plain-text.tsx:19`, `src/components/site/case-study/case-sections.tsx:116-118`, `src/components/site/about/experience-list.tsx:55-57`, `src/components/site/case-study/case-metrics.tsx:23`
**Issue:** `key={item}`, `key={result}`, `key={b}` and `key={label-value}` collide when an editor enters two identical lines. React warns and may reconcile the wrong nodes.
**Fix:** Use the index for these static, never-reordered lists, as `PlainText` already does for blocks.

### IN-09: The rate-limit count is hardcoded in two places

**File:** `messages/en.json` / `messages/es.json` (`Site.contact.errors.rateLimited`), `src/lib/rate-limit.ts:20`
**Issue:** The copy says "You've sent 3 messages in the last hour", and the limiter uses `slidingWindow(3, "1 h")`. Changing one leaves the other wrong. The message is also inaccurate for visitors on a shared IP (an office or NAT, or the `"unknown"` bucket) who sent nothing themselves. Relatedly, with a real limiter configured, `e2e/contact.spec.ts` (2 real sends) plus `e2e/contact-live.spec.ts` (1) use up the whole 3-per-hour window from the test machine's IP, so a second e2e run within an hour fails as `rate_limited`.
**Fix:** Pass the limit as an ICU argument (`{limit}`) from a shared constant. For tests, use a separate limiter prefix or allow-list the test IP when `E2E=1`, or give each test run its own `x-forwarded-for` (only against a local, non-Vercel server).

---

_Reviewed: 2026-11-23_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
