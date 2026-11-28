# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Lanzamiento

**Shipped:** 2026-11-28
**Phases:** 6 (1, 2, 3, 4, 4.1, 5) | **Plans:** 72 | **Sessions:** not tracked

### What Was Built
- Bilingual portfolio (en `/`, es `/es`) live at mateojaras.dev, with case studies that carry Marginalia on technical decisions.
- Its own admin at `/admin` (single user, draft/published, ordering, Blob uploads) and an en/es PDF CV generated from the same data.
- Contact through Resend + Upstash + honeypot; per-locale SEO; CSP in enforce mode; WCAG AA; real 404s; Vercel Analytics; sitemap in Search Console.

### What Worked
- Phase gates with check scripts (content:check, check-live, check-cv-pdf) caught regressions before Teo did.
- Cache Components + `next/root-params` held up for the whole milestone; the pre-planned Plan B was never needed.
- Logging who decided what (`docs/decisions.md`) made re-scopes (D-07, D-10, D-18) explicit instead of silent.
- Three review profiles (client, recruiter, developer) produced specific, actionable findings, all of which got a disposition.

### What Was Inefficient
- The plan assumed content would arrive in phase 1. It moved to the admin at G4/G7, which forced replans (01-13, IDEN-05..07) and the inserted phase 4.1.
- The timeline ran about 30 days against a 14-day target. That was accepted under the quality-over-date rule, but the estimate was off.
- The soft 404 under `cacheComponents` + `partialPrefetching` cost several attempts in 04-10 before it was fixed in phase 5.
- Verifications for phases 1, 3 and 4 went stale because later phases edited files they covered, so the milestone closed with overrides.

### Patterns Established
- Mutations: `requireSession()` → Zod → Drizzle → `updateTag` → `exportContent()`.
- Keys and accounts are requested only when a phase needs them, and code stays behind an env check until then.
- Production content changes go through the admin UI only, never direct DB writes.
- The Next.js 16 bundled docs plus context7 are the source of truth for APIs.

### Key Lessons
1. Confirm early who supplies content and when. If the owner prefers to enter it in the product, plan the admin before the content gates.
2. Re-run the verifier (or record overrides) at each phase close when a later phase touches files an earlier verification covered.
3. Plan human review as a scheduled task with named people. Agent reviews are useful but don't replace it.
4. Run `/gsd-audit-milestone` and `/gsd-secure-phase` as part of the last phase, not after it.

### Cost Observations
- Model mix: Opus for analysis, planning, review and debugging; Sonnet for execution and verification (see `.planning/config.json`). Exact percentages not tracked.
- Notable: subagent reviews (code review, three profiles) were the costliest step and the most useful one.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | n/a | 6 | First milestone; added an inserted phase (4.1) for positioning |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 82 unit files + 43 e2e specs | not measured | n/a |

### Top Lessons (Verified Across Milestones)

1. (Fills in after v1.1.)
