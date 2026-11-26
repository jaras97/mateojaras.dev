---
phase: 05-pulido-y-lanzamiento
plan: 03
subsystem: site
tags: [404, favicon, approvals, not-found]
requires: [05-02]
provides:
  - "Redesigned localized 404 with requested path and entry list"
  - "MJ favicon variants a/b/c with preview sheets; variant a approved"
  - "05-APPROVALS.md with Teo's verbatim answers"
affects: [05-05]
key-files:
  created:
    - .planning/phases/05-pulido-y-lanzamiento/05-APPROVALS.md
    - .planning/phases/05-pulido-y-lanzamiento/favicon/
  modified:
    - messages/en.json
    - messages/es.json
    - .planning/phases/05-pulido-y-lanzamiento/05-DOMAIN-VERIFY.md
key-decisions:
  - "Favicon variant a (terracotta MJ on paper square) chosen by Teo; 05-05 installs it in src/app and logs it in docs/decisions.md"
  - "404 copy approved as-is, no edits"
  - "prod-db != preview-db check waived by Teo"
requirements-completed: [SITE-08, QUAL-03]
duration: multi-session
completed: 2026-11-26
---

# Phase 5 Plan 3: 404 y favicon Summary

Redesigned 404 (requested path plus entry list) and three MJ favicon variants with real-size previews, both approved by Teo in one batch on 2026-11-26 (404 ok, favicon a).

## Commits

- b3ec993 feat(site): redesigned 404 with requested path and entry list
- 17644c8 docs(05-03): MJ favicon variants with real-size previews
- 9e03643 docs(05-03): record Teo's approvals and resolve 05-01 pendientes

## Approvals

Recorded verbatim in 05-APPROVALS.md. No copy edits were needed, so no `approved 404 copy` commit exists.

## 05-01 pendientes resolved in this batch

- CV regenerated; check-cv-pdf PASS on es and en (en only fails the default accent-char check because the English CV has no á ó ú ñ, not a defect).
- Contact verified live by Teo by hand (thanks screen, email received, message in /admin/messages). The automated contact-live spec was not run because Production `DATABASE_URL` is Sensitive and cannot be pulled. This also confirms admin login on the apex.
- Production env has RESEND_API_KEY (Prod and Preview) and Upstash vars (Production only, Teo's decision; Preview contact fails closed by design). Production redeployed.
- Search Console verified, Web Analytics enabled.
- prod-db vs preview-db check waived by Teo.

## Deviations from Plan

None. The checkpoint was batched with the 05-01 pendientes as the plan specified.

## Notes for Teo

- Content: the Prendo project's English stack tags include a Spanish tag "Subagentes y skills". It lives in DB content; fix it in the admin.

## Known Stubs

None.

## Self-Check: PASSED

Commits b3ec993, 17644c8 and 9e03643 exist on phase-05-polish; 05-APPROVALS.md exists.
