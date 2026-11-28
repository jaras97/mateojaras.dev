# Milestones

## v1.0 Lanzamiento (Shipped: 2026-11-28)

**Delivered:** bilingual portfolio live at https://mateojaras.dev (en at `/`, es at `/es`), with its own admin at `/admin` and an en/es PDF CV generated from the same data.

**Phases completed:** 6 phases (1, 2, 3, 4, 4.1 inserted, 5), 72 plans
**Timeline:** 2026-10-29 → 2026-11-27 (428 commits, `2fa9f24`..`89fe4d5`)
**Code:** ~29,000 lines of TypeScript in `src/`, 82 unit test files, 43 e2e specs
**Requirements:** 87/87 v1 requirements checked off (archive: `milestones/v1.0-REQUIREMENTS.md`)
**Closeout type:** override_closeout

**Key accomplishments:**
- Phase 1: "workshop logbook" identity approved by Teo (DESIGN.md, OKLCH tokens, three self-hosted families, hero variant A) and a Zod content contract with gates.
- Phase 2: walking skeleton on Vercel: Drizzle + Neon schema, Better Auth with a single admin, next-intl with `next/root-params` and Cache Components, CI and Preview.
- Phase 3: admin for every entity, with draft/published, visible and ordering, Vercel Blob uploads, and the "Generar CV" button producing en/es PDFs plus `/resume.json`.
- Phase 4: public site (home, case studies with Marginalia, about, now, contact via Resend + Upstash), per-locale SEO, and motion within budget.
- Phase 4.1: content and CV rewritten for the full stack + AI positioning, using only verifiable facts.
- Phase 5: WCAG AA pass, real 404s, CSP in enforce mode, Vercel Analytics, reviews by three agent profiles with every finding dispositioned, CV v6, and the sitemap submitted to Search Console.

**Known verification overrides:** 6 newly acknowledged, 0 carried forward from a prior close (see STATE.md Deferred Items).
- Phases 1, 3 and 4 close on their original `passed` verification. The fingerprint is stale only because later phases edited files those verifications covered. No re-verification was run, by Teo's decision (2026-11-28).
- No `/gsd-audit-milestone` was run before the close.

### Known Gaps

- QUAL-07: Teo has not yet confirmed visits on the Vercel Analytics dashboard. The script and the beacon return 200 in production.
- QUAL-08: the three-profile review was done by agents (D-07). A human review is still pending (D-10).
- `og:image:alt` is not localized (accepted in 04-10).
- Phase 5 code review: CR-01 (`scripts/load-content.ts` silently discards a pending site-settings draft) and WR-01..08 are deferred in `docs/backlog.md`.
- `/gsd-secure-phase 05` was not run, so phase 5 has no SECURITY.md.

---
