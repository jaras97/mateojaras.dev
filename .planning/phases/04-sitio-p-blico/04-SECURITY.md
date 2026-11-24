---
phase: "04"
slug: "sitio-p-blico"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-24"
---

# Phase 04: Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| DB (admin-edited) → public HTML | Settings, rich text, captions, URLs and media JSON rendered to visitors | published content (public) |
| DB → inline scripts | Overlap template and time zone embedded in the status clock script | settings strings (public) |
| localStorage → inline theme script | Client-controlled value read before paint | theme preference (low) |
| route params → language href | URL data becomes an href in the language switch | path segments (low) |
| browser → public Server Action (submitContact) | Anonymous POST with arbitrary payload; network/deploy skew can reject the call | visitor name, email, message (PII, medium) |
| server → Upstash / Resend | Third-party services that may be slow, down or misconfigured | hashed IP, message content (medium) |
| crawler → metadata routes | Anonymous requests to sitemap, robots, OG handlers | published slugs (public) |
| thrown value → error boundary | error.tsx receives whatever was thrown | error messages/digests (medium) |
| Teo → repo/chat; local tooling → protected Preview | Secrets created by Teo; bypass secret used for Lighthouse runs | API keys, bypass secret (high) |
| e2e harness → Neon dev | Specs insert and delete fixture rows | test fixtures (low) |

---

## Threat Register

Severity is not declared in the plans; the register was authored at plan time and verified at ASVS L1 (grep depth) on 2026-11-24. Evidence column cites the file found.

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-04-01 | Information disclosure | about/contact pages | medium | mitigate | No `admin-queries` import under `src/app/[locale]`; reads via `getSiteSettings()` | closed |
| T-04-SC | Tampering | package installs | low | accept | No new packages in phase 4 | closed |
| T-04-03 | Information disclosure | 04-02-ANSWERS.md, chat | high | mitigate | No Resend/Upstash key shapes in tracked files; keys in `.env.local` + Vercel | closed |
| T-04-04 | Tampering | theme-script.tsx | low | mitigate | Static string; only literal `"dark"` trusted (`src/components/site/theme-script.tsx:3`) | closed |
| T-04-05 | Tampering | lang-switch.tsx | low | mitigate | href from `getPathname` / `alternate-href.ts` fixed pathnames | closed |
| T-04-06 | Elevation of privilege | future strict CSP | low | accept | Report-Only CSP today; phase 5 hashes inline scripts | closed |
| T-04-07 | Information disclosure | case page, prev/next | medium | mitigate | Public cores `getProject`/`getProjects` (published+visible, stripDraft) | closed |
| T-04-08 | Tampering (stored XSS) | case_study rich text | high | mitigate | `src/lib/rich-text-schema.ts` allowlist (https/mailto hrefs) | closed |
| T-04-09 | Tampering | media caption fields | low | mitigate | `z.strictObject`, `max(120)` (`src/features/projects/validation.ts:43`) | closed |
| T-04-10 | Tampering | liveUrl/repoUrl hrefs | medium | mitigate | `httpsUrl` validation (`validation.ts:72-73`); no `dangerouslySetInnerHTML` outside inline-script components | closed |
| T-04-11 | Denial of service (client) | scroll-scene.tsx | low | mitigate | Triggers scoped and reverted on unmount/Activity hide | closed |
| T-04-12 | Denial of service | submitContact | high | mitigate | Honeypot + elapsed check + `slidingWindow(3, "1 h")` (`src/lib/rate-limit.ts:16`), fail closed | closed |
| T-04-13 | Tampering | email subject | medium | mitigate | CR/LF stripped (`src/features/contact/notify.ts:16`) + test | closed |
| T-04-14 | Information disclosure | logs, ip_hash | high | mitigate | HMAC-SHA256 (`src/lib/ip-hash.ts`); no raw IP stored | closed |
| T-04-15 | Tampering | mass assignment | medium | mitigate | `z.strictObject` (`src/features/contact/validation.ts:8`) | closed |
| T-04-16 | Spoofing | cross-site form posts | medium | mitigate | Next Server Action Origin/Host check + 1 MB body limit (built-in) | closed |
| T-04-17 | Elevation of privilege | admin inbox | high | mitigate | `requireSession` in `src/features/contact/admin-queries.ts` | closed |
| T-04-18 | Tampering | contact-aside calendar link | medium | mitigate | `calendarUrl?.startsWith("https://")` (`contact-aside.tsx:20`) | closed |
| T-04-19 | Information disclosure | stale confirmation after back-nav | low | mitigate | Activity cleanup resets status and form (`contact-form.tsx:96-108`) | closed |
| T-04-20 | Denial of service | live e2e burning rate limit | low | accept | Burst gated behind `E2E_RATE_LIMIT=1` | closed |
| T-04-21 | Tampering (XSS) | status-clock-script.tsx | high | mitigate | `JSON.stringify(...).replace(/</g, ...)` (`status-clock-script.tsx:7`) | closed |
| T-04-22 | Information disclosure | home list | medium | mitigate | `getProjects()` public core | closed |
| T-04-23 | Tampering (stored XSS) | now-section.tsx | high | mitigate | `RichText` with allowlist schema (`now-section.tsx:2`) | closed |
| T-04-24 | Information disclosure | about lists | medium | mitigate | Only cached public cores imported | closed |
| T-04-25 | Information disclosure | sitemap.ts | medium | mitigate | `getSitemapProjectsCore` published+visible (`src/features/projects/queries.ts:55`) | closed |
| T-04-26 | Denial of service | OG routes, arbitrary slugs | low | mitigate | `notFound()` in `projects/[slug]/opengraph-image.tsx` | closed |
| T-04-27 | Elevation of privilege | proxy matcher `.*/opengraph-image` | low | accept | Only skips optimistic redirect; every admin loader/action calls `requireSession()` | closed |
| T-04-28 | Information disclosure | VERCEL_AUTOMATION_BYPASS_SECRET | high | mitigate | Read via `--env-file`; 0 occurrences in 04-LIGHTHOUSE.md | closed |
| T-04-29 | Elevation of privilege | phase 5 strict CSP vs inline scripts | low | accept | Hand-off to phase 5 | closed |
| T-04-02 | Tampering | CopyEmail | low | accept | Copies a server-provided address | closed |
| T-04-30 | Spoofing | siteUrl | low | accept | Env-only (`NEXT_PUBLIC_SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL`), never request headers | closed |
| T-04-31 | Information disclosure | `[locale]/error.tsx` | medium | mitigate | Never renders/logs `error`; covered by error.test.tsx | closed |
| T-04-32 | Denial of service | contact-form onSubmit | medium | mitigate | try/catch → 'unavailable' alert (`contact-form.tsx:130`) | closed |
| T-04-33 | Information disclosure | contact-form catch block | low | mitigate | `catch {}` binds nothing; fixed localized text | closed |
| T-04-34 | Tampering | mailto from settings.email | low | accept | Written only by authenticated admin | closed |
| T-04-35 | Denial of service | retry() | low | accept | User-initiated per click, no loop | closed |
| T-04-36 | Denial of service | rate-limit env resolution | high | mitigate | `resolveUpstashCredentials` (`src/lib/upstash-env.ts:6`) + tests | closed |
| T-04-37 | Spoofing / Tampering | Upstash credential mixing | medium | mitigate | Same-pair only; mixed config → null → fail closed | closed |
| T-04-38 | Elevation of privilege (bypass) | rate limit fail-closed | high | mitigate | null not memoized; options pinned (slidingWindow 3/h, timeout 2000) | closed |
| T-04-39 | Denial of service | case-gallery / formatMonthYear | medium | mitigate | `toCalendarDay` guard + Zod refine (`src/features/projects/validation.ts:3`) | closed |
| T-04-40 | Repudiation | REQUIREMENTS.md status | low | mitigate | CONT-02/CONT-04/QUAL-04 kept Human Needed | closed |
| T-04-41 | Denial of service | IPv6 rotation bypass (WR-01) | medium | accept | Deferred to phase 5 hardening (04-REVIEW-DISPOSITION.md) | closed |
| T-04-15-01 | Denial of service | `projects/[slug]/page.tsx` | high | mitigate | `t.raw("figure")` (line 167) + unit and e2e regression | closed |
| T-04-15-02 | Tampering | CaseGallery template substitution | low | accept | Template from versioned catalog; React text escaping | closed |
| T-04-15-03 | Tampering | e2e fixture rows | low | mitigate | `e2e-late-` prefix, cleanup in finally/afterAll, dev branch only | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-04-01 | T-04-SC | No packages installed in phase 4 | plan 04-01 | 2026-11-24 |
| AR-04-02 | T-04-06, T-04-29 | Inline theme/clock scripts allowed by Report-Only CSP; phase 5 adds hashes before enforcing | plans 04-03, 04-11 | 2026-11-24 |
| AR-04-03 | T-04-20 | Rate-limit burst e2e only with `E2E_RATE_LIMIT=1` | plan 04-07 | 2026-11-24 |
| AR-04-04 | T-04-27 | Matcher exclusion only skips the optimistic cookie redirect; real gate is `requireSession()` | plan 04-10 | 2026-11-24 |
| AR-04-05 | T-04-02, T-04-34 | Values come from the server / authenticated admin, not visitor input | plans 04-12, 04-13 | 2026-11-24 |
| AR-04-06 | T-04-30 | Canonical URLs come from env, never request headers | plan 04-12 | 2026-11-24 |
| AR-04-07 | T-04-35 | Retry is user-initiated | plan 04-13 | 2026-11-24 |
| AR-04-08 | T-04-41 | IPv6 /64 rotation can bypass per-IP limit; deferred to phase 5 hardening | plan 04-14 | 2026-11-24 |
| AR-04-09 | T-04-15-02 | Catalog template, React-escaped output | plan 04-15 | 2026-11-24 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-24 | 45 | 45 | 0 | /gsd-secure-phase (L1 grep, orchestrator; auditor skipped per short-circuit rule) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-24
