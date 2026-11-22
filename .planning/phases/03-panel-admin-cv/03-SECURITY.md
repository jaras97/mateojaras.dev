---
phase: "03"
slug: "panel-admin-cv"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-22"
---

# Phase 03: Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| browser → admin Server Actions / loaders | Single admin session (Better Auth) gates every mutation and admin read | content drafts, flags, ordering (low) |
| browser → /api/blob/upload | Route handler issuing scoped write tokens to the public Blob store | image files (public) |
| browser → Vercel Blob | Direct client upload with a scoped token | image files (public) |
| browser → /api/draft | Draft Mode toggle for the admin preview | draft content (unpublished, medium) |
| DB → public pages, CV, JSON Resume | Public reads strip drafts unless Draft Mode is on; CV and JSON Resume never include drafts | published content (public) |
| scripts (seed, export, checker) → Neon | Operator scripts; production guarded by `assertNotProduction` | all content (medium) |
| admin → contact messages | Inbox read behind session; `ipHash` never selected | visitor PII (high) |

---

## Threat Register

Severity is the auditor's assessment; the plans did not declare one. Evidence per row is in the audit of 2026-11-22 (gsd-security-auditor).

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-SC | Tampering | sonner / unpdf install | medium | mitigate | exact pins in package.json, no next-themes | closed |
| T-03-01 | Information disclosure | BLOB token | high | mitigate | `.env*` gitignored, no token in tracked files | closed |
| T-03-02 | Tampering | shadcn overwrite | low | mitigate | diff check recorded in 03-01-SUMMARY | closed |
| T-03-03 | Tampering | seed vs Neon main | high | mitigate | `src/lib/seed-guard.ts` `assertNotProduction` + `--allow-production` | closed |
| T-03-04 | Tampering | seed --force | medium | mitigate | `onConflictDoNothing`; non-empty tables skipped | closed |
| T-03-05 | Information disclosure | Blob backups | medium | mitigate | `addRandomSuffix: true` in `content-export.ts` | closed |
| T-03-06 | Information disclosure | content/*.json | medium | mitigate | `/content/` gitignored, 0 tracked files | closed |
| T-03-07 | Elevation of privilege | projects/actions.ts | high | mitigate | `requireActionSession()` first in every export | closed |
| T-03-08 | Information disclosure | public project cores | high | mitigate | `applyDraft`/`stripDraft` keyed on draftMode | closed |
| T-03-09 | Tampering | slug change | medium | mitigate | `checkSlug` blocks changes once published, checks uniqueness | closed |
| T-03-10 | Tampering | mass assignment | high | mitigate | `projectDraftSchema` strictObject without status/flags/id | closed |
| T-03-11 | Tampering | stored XSS (rich text) | high | mitigate | `rich-text-schema.ts` node/mark allowlist, https/mailto hrefs | closed |
| T-03-12 | Elevation of privilege | list actions and pages | high | mitigate | session-first in list actions; `requireSession` in panel pages | closed |
| T-03-13 | Tampering | reorderProjects | medium | mitigate | id set equality before `db.batch` | closed |
| T-03-14 | Tampering | deleteProject | medium | mitigate | typed-name confirmation, single-id delete | closed |
| T-03-15 | Denial of service | accidental delete | low | accept | see Accepted Risks | closed |
| T-03-16 | Tampering | rich-text links | high | mitigate | server `HREF` regex + tests rejecting `javascript:`/`http:` | closed |
| T-03-17 | Information disclosure | RichText renderer | high | mitigate | `safeParse` then static renderer; no `dangerouslySetInnerHTML` | closed |
| T-03-18 | Data loss | session expiry | low | mitigate | actions return `{error:"session"}`, forms keep input | closed |
| T-03-19 | Elevation of privilege | GET /api/draft | high | mitigate | `requireSessionForRequest` first; e2e asserts 401 | closed |
| T-03-20 | Open redirect | /api/draft | medium | mitigate | DB-derived path; `safeReturnPath` allowlist + tests | closed |
| T-03-21 | Information disclosure | drafts in public pages | high | mitigate | drafts only via `applyDraft` when Draft Mode is on; e2e | closed |
| T-03-22 | Tampering (CSRF) | POST /api/draft disable | low | accept | see Accepted Risks | closed |
| T-03-23 | Elevation of privilege | POST /api/blob/upload | high | mitigate | `requireSessionForRequest` first; e2e asserts 401 | closed |
| T-03-24 | Tampering | upload type / size | medium | mitigate | 4 image types, 8 MB cap in `onBeforeGenerateToken` | closed |
| T-03-25 | Tampering | path traversal / overwrite | medium | mitigate | `isAllowedUploadPath` regex + `addRandomSuffix` | closed |
| T-03-26 | Information disclosure | CSP widened for Blob | low | accept | see Accepted Risks | closed |
| T-03-27 | Denial of service | orphaned blobs | low | accept | see Accepted Risks | closed |
| T-03-28 | Elevation of privilege | settings / education | high | mitigate | session-first actions and pages | closed |
| T-03-29 | Tampering | settings URLs / Now | medium | mitigate | `HTTPS_URL` regex, strictObject, rich-text allowlist | closed |
| T-03-30 | Information disclosure | settings draft | medium | mitigate | `applyDraft`/`stripDraft` on draft mode | closed |
| T-03-31 | Elevation of privilege | experience | high | mitigate | session-first actions and pages | closed |
| T-03-32 | Tampering | relation ids | medium | mitigate | `z.array(z.uuid())`, single `db.batch` | closed |
| T-03-33 | Tampering | reorderSkills | medium | mitigate | category id set equality before batch | closed |
| T-03-34 | Stored XSS | message-reader | high | mitigate | text node with `whitespace-pre-wrap` | closed |
| T-03-35 | Injection | replyMailto | medium | mitigate | `encodeURIComponent` per part, subject capped | closed |
| T-03-36 | Information disclosure | contact PII | high | mitigate | session-gated, `ipHash` never selected, excluded from export | closed |
| T-03-37 | Information disclosure | buildCvData | high | mitigate | `includeDrafts: false`, no draftMode import | closed |
| T-03-38 | Elevation of privilege | generateCv | high | mitigate | `requireActionSession()` first | closed |
| T-03-39 | Tampering | /api/cv/[lang] | medium | mitigate | en/es allowlist, URL from DB row | closed |
| T-03-40 | Integrity | PDF re-encoding | low | mitigate | streams upstream body; checker verifies magic bytes | closed |
| T-03-41 | Denial of service | repeated CV generation | low | accept | see Accepted Risks | closed |
| T-03-42 | Information disclosure | JSON Resume | high | mitigate | built from `buildCvData` (no drafts); e2e | closed |
| T-03-43 | Tampering | resume lang param | low | mitigate | 404 outside en/es | closed |
| T-03-44 | Integrity | invalid JSON Resume | low | mitigate | `jsonResumeSchema.safeParse`, 500 on failure | closed |
| T-03-45 | Tampering | restore to main | high | mitigate | `assertNotProduction` + flag; no restore run on main | closed |
| T-03-46 | Information disclosure | main DATABASE_URL | high | mitigate | not in tracked files or conversation | closed |
| T-03-47 | Repudiation | content authorship | low | mitigate | 03-13-CARGA.md records who loaded what and when | closed |
| T-03-48 | Elevation of privilege | skills actions / pages | high | mitigate | session-first actions and pages | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-15 | D-14: hard delete is Teo's choice; recovery comes from the content export backups | Teo (plan decision D-14) | 2026-11-22 |
| AR-03-02 | T-03-22 | POST /api/draft only disables preview; no impact beyond the admin's own view, and `safeReturnPath` bounds the redirect | Plan 03-06 | 2026-11-22 |
| AR-03-03 | T-03-26 | Blob host added to `img-src` only; CSP is still Report-Only. `connect-src` for Blob and the vercel.com upload endpoint is NOT added yet: Teo must approve it before the CSP is enforced in phase 5, or client uploads will break | Plan 03-07; pending Teo for phase 5 | 2026-11-22 |
| AR-03-04 | T-03-27 | Low volume, single admin; e2e deletes its own uploads | Plan 03-07 | 2026-11-22 |
| AR-03-05 | T-03-41 | Single admin; each click creates one version pair; Blob paths are never overwritten | Plan 03-11 | 2026-11-22 |

*Accepted risks do not resurface in future audit runs.*

Informational (not threats): the content backups live in the public Blob store protected only by random suffixes (as T-03-05 specified), so anyone holding a backup URL can read it.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-22 | 49 | 49 | 0 | gsd-security-auditor (sonnet), ASVS L1, block_on high |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-22
