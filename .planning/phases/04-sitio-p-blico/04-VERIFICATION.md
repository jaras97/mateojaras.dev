---
phase: 04-sitio-p-blico
verified: 2026-11-24T00:00:00Z
status: human_needed
score: 5/5 roadmap success criteria verified in code (live delivery, populated case, formal audit and visual review pending human)
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 5/5
  gaps_closed:
    - "G-04-2: case study with gallery media threw FORMATTING_ERROR (t(\"figure\") without values)"
    - "CR-01: contact form crashed to Next's generic error when the Server Action call threw"
    - "WR-02: empty UPSTASH_REDIS_REST_* shadowed a complete KV_REST_API_* pair (limiter disabled)"
    - "WR-03: impossible capturedAt crashed the published case study"
  gaps_remaining: []
  regressions: []
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
  - ".planning/phases/04-sitio-p-blico/04-13-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-13-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-14-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-14-SUMMARY.md"
  - ".planning/phases/04-sitio-p-blico/04-15-PLAN.md"
  - ".planning/phases/04-sitio-p-blico/04-15-SUMMARY.md"
  - "e2e/case-study.spec.ts"
  - "src/app/[locale]/error.tsx"
  - "src/app/[locale]/projects/[slug]/page.tsx"
  - "src/components/site/case-study/case-gallery.tsx"
  - "src/components/site/case-study/case-study.test.tsx"
  - "src/features/contact/components/contact-form.tsx"
  - "src/features/projects/validation.ts"
  - "src/lib/format.ts"
  - "src/lib/rate-limit.ts"
  - "src/lib/upstash-env.ts"
covered_digest: "v4:sha256:5beaacf1638926c4149244084364cb5f5c74062fc19a55613a716eb7b4ca8d1a"
human_verification:
  - test: "UAT re-test G-04-2: open a seeded project with non-cover media (e.g. /es/proyectos/centro-estetico-manuj and /projects/<slug>)"
    expected: "No FORMATTING_ERROR; gallery figures render with 01 / NN counters or captions"
    why_human: "UAT gap was reported by Teo; code fix and tests are in place, but the human re-test is not recorded"
  - test: "Live contact delivery: set RESEND_API_KEY (domain verified in Porkbun DNS) and Upstash vars in .env.local and Vercel Production+Preview, submit the form on the Preview"
    expected: "Confirmation in the visitor's language; row in contact_messages; Teo receives the email with Reply-To = visitor; email_sent_at non-null; 4th send within an hour rejected"
    why_human: "Keys do not exist yet (04-02 answers were 'luego'). Fail-closed paths are unit-tested; real delivery needs the services (CONT-02, CONT-04 live)"
  - test: "Load ManuJ and EcoExport content from /admin (problem, role, case study, results, metrics, tech decisions in en and es, media), then review /projects/[slug] in en and es"
    expected: "Sections 01-05, Marginalia, metrics with sources and gallery with captions render; Lighthouse stays >= 95 on the populated case"
    why_human: "Lighthouse was measured on a sparsely populated case; content is owned by Teo"
  - test: "Run /impeccable:audit and /impeccable:critique on each public view in en and es"
    expected: "No critical findings"
    why_human: "Formal slash commands not run; a manual checklist was used (QUAL-04)"
  - test: "Visual review at 390/768/1440 light and dark, including the scrubbed margin-number scene, theme View Transition with no flash, and the new error boundary copy"
    expected: "Matches UI-SPEC; one accent; no horizontal scroll; Site.error copy approved by Teo"
    why_human: "Visual and motion behavior; Site.error copy is a proposal pending Teo (CLAUDE.md: ask before copy changes)"
---

# Phase 4: Sitio publico Verification Report (re-verification)

**Phase Goal:** A client or recruiter reads, in English or Spanish, a case study that shows the problem, what Teo did, the result and the technical decisions and why, and from there can contact him.
**Verified:** 2026-11-24
**Status:** human_needed
**Re-verification:** Yes, after gap closure plans 04-13, 04-14 and 04-15

## Re-verification of prior gaps

| Gap | Status | Evidence (read in code, not SUMMARY) |
|-----|--------|-------------------------------------|
| CR-01 contact form crash on thrown action | CLOSED | `contact-form.tsx` lines ~125-135: `try { result = await submitContact(...) } catch { setFormError("unavailable"); return; }`. No `reset()` on that path, so typed values stay. `src/app/[locale]/error.tsx` exists (client, `retry` prop, heading focus, retry button, mailto from context). `SiteErrorProvider` is mounted in `[locale]/layout.tsx` (line 67). `error.test.tsx` and rejection tests in `contact-form.test.tsx` exist and pass. |
| WR-02 empty UPSTASH_* shadows KV_* | CLOSED | `src/lib/upstash-env.ts` `resolveUpstashCredentials` trims, picks a whole complete pair (UPSTASH first, else KV), never mixes, returns null otherwise. `rate-limit.ts` uses it; null still fails closed. `upstash-env.test.ts` present. |
| WR-03 invalid capturedAt crash | CLOSED | `toCalendarDay` in `src/lib/format.ts` round-trips Y/M/D (rejects 2025-13, 2025-02-31). `case-gallery.tsx` line 42 treats null as no date. `projectDraftSchema` refines with it. |

No regressions: full suite run at HEAD, 73 files, 437 tests passed. No TBD/FIXME/XXX in src, e2e or scripts. Working tree has only untracked planning scratch.

## Roadmap Success Criteria

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Case study page structure (header, metrics with source, cover, sections 01-05 hidden when empty, Marginalia, internal-tool wording, prev/next + CTA, publish without redeploy) | VERIFIED (structure) | Unchanged from prior verification; `case-gallery.tsx` hardened; `case-study.test.tsx` passes. Populated-case review is human |
| 2 | Home, status line, About, language switch, theme VT, footer | VERIFIED | Unchanged, tests pass |
| 3 | Contact: send, localized confirmation, stored, Resend replyTo, honeypot/<3s discard, rate limit fail-closed, copy-email + Cal.com | VERIFIED in code (live delivery human) | `submit-core.ts` fail-closed order intact; client failure path now degrades to the localized alert with mailto; boundary covers other errors |
| 4 | SEO/hreflang/sitemap/robots; motion budget; reduced motion | VERIFIED (logged Plan B deviation for MOTN-02) | Unchanged |
| 5 | Audit no criticals; Lighthouse >= 95 etc. | VERIFIED for Lighthouse (04-LIGHTHOUSE.md); audit human | Unchanged |

## Requirements Coverage

All 29 IDs are declared in plan frontmatter and in ROADMAP; none orphaned. SITE-08 and QUAL-03/05..09 belong to Phase 5.

REQUIREMENTS.md traceability checked against code and evidence, and it is accurate:
- 26 rows Complete (CASE-01..07, SITE-01..07, CONT-01, CONT-03, CONT-05, SEO-01..03, MOTN-01..04, QUAL-01, QUAL-02) have code and test evidence; checkboxes match the table.
- CONT-02 (Resend delivery with replyTo), CONT-04 (live Upstash limiting) correctly Human Needed: code and unit tests exist but no keys, so no live delivery was observed. Marking them Complete would be unsupported.
- QUAL-04 correctly Human Needed: formal /impeccable commands not run.
- MOTN-02 Complete with a note pointing to the approved Plan B (server-split words with CSS) is acceptable: intent (words reveal, no CLS) met, deviation logged in docs/decisions.md.

## Open review warnings: do any block the goal?

| ID | Verdict |
|----|---------|
| WR-01 (skew: "try again" copy cannot recover; reload needed) | Non-blocking. The form no longer crashes and a mailto is always offered; recovery by reload still works. Recommend a "stale" state or Skew Protection in Phase 5 |
| WR-02 (admin save shows no field message for rejected capturedAt) | Non-blocking for the public goal. Admin UX regression risk for any stored bad value; fix with message code plus render in `image-uploader.tsx` |
| WR-03 (IPv6 /64 rotation, no global cap) | Non-blocking hardening; CONT-04 is satisfied as specified (per-IP, fail closed). Track for Phase 5 |
| WR-04 (name max-length message wrong) | Non-blocking copy bug |
| IN-04 (`error.tsx` returns null without provider; Site.error copy unapproved) | Non-blocking; copy approval by Teo is an open item |

Previously open WR-04..WR-08 and IN items from the prior review remain tracked in 04-REVIEW-DISPOSITION.md and are not goal-blocking.


## Plan 04-15 (G-04-2) re-verification

| Must-have truth | Status | Evidence (read in code) |
|---|---|---|
| Project with non-cover media opens in en without FORMATTING_ERROR and renders gallery | VERIFIED | `page.tsx:167` is `labels={{ figure: t.raw("figure") as string }}`; no `t("figure")` remains. `CaseGallery` substitutes `{n}`/`{total}` itself. |
| Same in es | VERIFIED | Same call site, locale-agnostic; e2e loop covers `/es/proyectos/` |
| No caption/date shows zero-padded counter | VERIFIED | `case-study.test.tsx` new catalog-backed tests (en/es JSON) pass: vitest run of src/components/site/case-study = 20/20 |
| e2e exercises CaseGallery branch in en and es | VERIFIED (with caveat) | `withGalleryFixture` inserts cover + non-cover media; per-locale test asserts `figure` whose figcaption has "01 / 01" and the `img` alt. Per the review's trace, on an unfixed production build the figcaption would read `Site.project.figure`, so the figcaption locator fails: the regression is caught. |

Review warnings weighed:
- WR-01 (the FORMATTING_ERROR console listener and the error-title `toBeHidden` can never fail in a prod build): confirmed in the spec (lines ~209-225). They are dead assertions, but the "01 / 01" figcaption and `alt` assertions do guard the regression, so the truth holds. Non-blocking; misleading comments should be fixed.
- WR-02 (fixture writes a published row into the shared dev DB without cache invalidation, prefix cleanup): test hygiene and flakiness risk, not a goal blocker. Non-blocking.
- WR-03 (stringly-typed raw template): maintainability risk; recurrence is now guarded by the e2e. Non-blocking.
These do not undermine any 04-15 truth. They are recommended follow-ups.

Build/test: executor-reported `pnpm build`, `pnpm test` and e2e 9/9 were not re-run by the verifier except the case-study unit file (20/20 pass). Live e2e not re-run.

G-04-2 UAT status: addressed in code; the human UAT re-test is still pending and is listed in human_verification.

## Gaps Summary

No code gaps remain. The phase goal is achieved in code and tests. Status is human_needed because live email delivery and rate limiting, a populated case study, the formal impeccable audit, visual review and approval of the new error copy cannot be verified programmatically.

---

_Verified: 2026-11-23_
_Verifier: Claude (gsd-verifier)_
