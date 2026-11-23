---
phase: 04-sitio-p-blico
verified: 2026-11-23T00:00:00Z
status: gaps_found
score: 4/5 roadmap success criteria verified (SC3 partial)
overrides_applied: 0
covered_files:
  - ".planning/phases/04-sitio-p-blico/04-01-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-01-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-02-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-02-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-03-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-03-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-04-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-04-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-05-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-05-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-06-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-06-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-07-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-07-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-08-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-08-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-09-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-09-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-10-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-10-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-11-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-11-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-12-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-12-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-LIGHTHOUSE.md"
  - "src/app/[locale]/layout.tsx"
  - "src/app/sitemap.ts"
  - "src/features/contact/components/contact-form.tsx"
  - "src/features/contact/submit-core.ts"
  - "src/lib/rate-limit.ts"
  - "src/lib/seo.ts"
covered_digest: "v4:sha256:e9a624c6acc3c13f12ddef74f39814d1794b21489a9e194bdd5d5b9fa46a1f67"
gaps:
  - truth: "A visitor can reach Teo from the contact form (roadmap SC3; goal clause 'desde ahí puede contactarlo'), including when the Server Action call fails"
    status: partial
    reason: "CR-01 confirmed in code. contact-form.tsx onSubmit awaits submitContact inside startTransition with no try/catch, and there is no src/app/[locale]/error.tsx or global-error.tsx. A network failure or a stale Server Action ID after a redeploy throws to the error boundary and shows Next's generic error; the localized 'unavailable' alert with the mailto fallback never appears. The happy path and all fail-closed server paths work."
    artifacts:
      - path: "src/features/contact/components/contact-form.tsx"
        issue: "lines ~117-136: no try/catch around await submitContact(locale, payload)"
      - path: "src/app/[locale]/"
        issue: "no error.tsx; global-error.tsx also absent"
    missing:
      - "try/catch around submitContact that calls setFormError('unavailable') and keeps typed values"
      - "src/app/[locale]/error.tsx (client, localized retry + mailto)"
      - "a unit test in contact-form.test.tsx that mocks submitContact rejecting and asserts the alert with mailto"
human_verification:
  - test: "Live contact delivery: set RESEND_API_KEY (domain verified in Porkbun DNS) and Upstash vars in .env.local and Vercel Production+Preview, submit the form on the Preview"
    expected: "Confirmation in the visitor's language; row in contact_messages; Teo receives the email with Reply-To = visitor; email_sent_at becomes non-null; 4th send within an hour is rejected"
    why_human: "04-02 answers A/B were 'luego'; keys do not exist. Fail-closed paths are verified by unit tests, but real delivery cannot be checked without the services (CONT-02, CONT-04 live)"
  - test: "Load ManuJ (centro-estetico-manuj) and EcoExport content from /admin (problem, role, case study, results, metrics, tech decisions in en and es, media), then review /projects/[slug] in en and es"
    expected: "All sections 01-05, Marginalia, metrics with sources, gallery with captions render; Lighthouse stays >= 95 on the populated case"
    why_human: "Lighthouse was measured on a sparsely populated case; the populated-case visual/perf check is content owned by Teo"
  - test: "Run /impeccable:audit and /impeccable:critique on each public view (home, case, about, contact, header/footer) in en and es"
    expected: "No critical findings"
    why_human: "Formal slash commands were not run; a manual checklist was used (QUAL-04)"
  - test: "Visual review at 390/768/1440 light and dark, including the 04-05 scrubbed margin-number scene and theme View Transition with no flash"
    expected: "Matches UI-SPEC; one accent per view; no horizontal scroll"
    why_human: "Visual and motion behavior"
deferred: []
---

# Phase 4: Sitio publico Verification Report

**Phase Goal:** A client or recruiter reads, in English or Spanish, a case study that shows the problem, what Teo did, the result and the technical decisions and why, and from there can contact him.
**Verified:** 2026-11-23
**Status:** gaps_found (1 gap, small fix; plus human_needed items)
**Re-verification:** No, initial verification

## Goal Achievement

### Roadmap Success Criteria

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Case study page: header/meta row, metrics with source, cover, sections 01-05 (empty hidden), Marginalia, internal-tool wording, prev/next + CTA, new project opens without redeploy | VERIFIED (structure) | `src/components/site/case-study/*` (case-header, case-metrics, case-cover, case-sections, marginalia, prev-next, case-cta, section-margin-number) present with tests; 04-04 uses Suspense for slug so CASE-07 holds; `case-study.test.tsx` and e2e specs exist. Populated-case visual check is human (ManuJ content incomplete) |
| 2 | Home: hero, status line (availability, UTC-5, live time, DST overlap), dated entries; About: bio, Now, stack, experience, education, languages; language switch, theme with VT no flash, footer links | VERIFIED | `hero-a.tsx`, `status-line.tsx`, `status-clock-script.tsx`, `local-time.tsx`, `overlap.ts`, `entry-list.tsx`, about components, `lang-switch.tsx`, `theme-script.tsx`, `theme-toggle.tsx`, `site-footer.tsx` exist with unit tests |
| 3 | Contact form: send, localized confirmation, stored, Resend with replyTo, honeypot/<3s silent discard, rate limit rejects and fails closed, copy-email + Cal.com | PARTIAL | `submit-core.ts` implements D-09 order: Zod, honeypot/elapsed silent discard, limiter (null limiter, timeout, throw all return `unavailable`), insert, `after()` notify; `copy-email.tsx` present. FAILED edge: no try/catch around the Server Action call on the client and no `[locale]/error.tsx` (CR-01). Live delivery unverified (keys pending) |
| 4 | Per-page title/description/OG/hreflang (en, es, x-default), sitemap and robots; motion limited to staggered reveal, hero H1 split by words w/o CLS, <=1 scrubbed scene; reduced motion respected | VERIFIED (with logged deviation) | `src/lib/seo.ts` alternates en/es/x-default; `sitemap.ts` lists pages and published projects with alternates; `robots.ts`; OG routes per page and case. H1 split is server-rendered words with CSS keyframes (Plan B P4, pre-approved by Teo, logged in docs/decisions.md ~line 549), deviating from the letter of MOTN-02 (SplitText). GSAP only in `scroll-scene.tsx` (one scene). Reduced-motion e2e exists |
| 5 | /impeccable:audit no criticals; Lighthouse mobile >= 95, LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 on 4 routes in en and es on the Vercel Preview | VERIFIED for Lighthouse; audit is human | `04-LIGHTHOUSE.md`: 8 URLs, median of 3, Performance 96-97, LCP 2.18-2.28 s, CLS 0, TBT 18-30 ms (INP proxy). Measured at commit b952ade; subsequent commits are docs only. Home initially failed (81 / 4.66 s) and was fixed via Plan B. /impeccable audit not run formally (manual checklist) |

### Automated checks

| Check | Result |
|-------|--------|
| `pnpm test` (vitest) | 71 files, 421 tests passed |
| Debt markers (TBD/FIXME/XXX) in src, e2e, scripts | none found |
| `error.tsx` / `global-error.tsx` under src/app | none |

### CR-01 decision

**Gap (not a blocker for the happy path, but must be closed before phase 5).** The review finding is accurate in the code. It affects the phase goal's last clause, and the trigger (a page open across one of Teo's deploys, or a flaky connection) is ordinary rather than exotic. The fix is about 10 lines plus one test. It is classified as a gap rather than deferred: Phase 5 (SITE-08, 404 page) does not cover a route error boundary for this form.

### Accepted, not gaps

- Unknown slug returns HTTP 200 soft 404 with `noindex` (deferred-items.md, decisions.md 2026-11-22).
- No localized `og:image:alt` (deferred-items.md).
- Report-Only CSP (accepted until phase 5, QUAL-06). WR-08 (no reporting endpoint) should be considered when phase 5 hardens it.
- Live Resend/Upstash delivery pending Teo's keys: human_needed. Fail-closed behaviour is code- and test-verified.

### Requirements Coverage

All 29 IDs appear in plan frontmatter and in the ROADMAP Phase 4 list: CASE-01..07 (04-04, 04-05), SITE-01..07 (04-01, 04-03, 04-08, 04-09), CONT-01..05 (04-01, 04-02, 04-06, 04-07, 04-08, 04-12), SEO-01..03 (04-10), MOTN-01..04 (04-03, 04-04, 04-05, 04-08, 04-11, 04-12), QUAL-01/02/04 (04-02, 04-05, 04-07, 04-08, 04-09, 04-11). No orphaned IDs. SITE-08 and QUAL-03/05..09 are mapped to Phase 5, correctly excluded.

| Requirement | Status |
|-------------|--------|
| CASE-01..07 | SATISFIED (code); populated-case review human |
| SITE-01..07 | SATISFIED |
| CONT-01, CONT-02 | CODE SATISFIED; live send human_needed; CR-01 gap on client error path |
| CONT-03, CONT-04 | SATISFIED (unit-tested in submit-core.test.ts); IPv6 bypass (WR-01) is a hardening warning |
| CONT-05 | SATISFIED |
| SEO-01..03 | SATISFIED |
| MOTN-01, 03, 04 | SATISFIED |
| MOTN-02 | SATISFIED in intent (words split, no CLS); letter deviated via approved Plan B |
| QUAL-01, QUAL-02 | SATISFIED per 04-LIGHTHOUSE.md (lab; INP via TBT proxy) |
| QUAL-04 | human_needed (manual checklist, formal command not run) |

Note: the REQUIREMENTS.md traceability table still shows many Phase 4 rows as `Pending` and unchecked boxes (SITE-01..04, CONT-01..04, SEO-*, MOTN-02/03, QUAL-01/02/04). The orchestrator should update them once the gap is closed.

### Other review findings (warnings, non-gap)

WR-01 (IPv6 rate-limit bypass, no global cap), WR-02 (`??` env fallback with empty vars disables form), WR-03 (invalid `capturedAt` crashes case page), WR-04..WR-09 and IN-01..IN-09 are open per 04-REVIEW-DISPOSITION.md. None breaks a success criterion on its own, but WR-02 and WR-03 can take down the contact form or a published case in realistic setups and should be fixed in the same closure plan as CR-01.

### Gaps Summary

One gap: harden the contact form against a thrown Server Action call (try/catch to the `unavailable` state plus a localized `[locale]/error.tsx`). Everything else in the phase goal is present, wired and tested; remaining items are human verification (live email delivery, populated ManuJ content, formal impeccable audit, visual check).

---

_Verified: 2026-11-23_
_Verifier: Claude (gsd-verifier)_
