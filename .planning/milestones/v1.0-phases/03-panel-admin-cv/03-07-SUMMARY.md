---
phase: 03-panel-admin-cv
plan: 07
subsystem: admin
tags: [vercel-blob, uploads, next-config, csp, e2e]
requires: [03-05]
provides:
  - "POST /api/blob/upload (session-gated client-upload tokens)"
  - "ImageUploader and EnvMissingNotice, section 05 Imágenes in ProjectForm"
  - "next.config: Blob img-src, remotePatterns, font tracing, CV/resume rewrites"
affects: [03-11, 03-12, 03-13]
key-files:
  created:
    - src/app/api/blob/upload/route.ts
    - src/lib/blob-upload.ts
    - src/lib/blob.test.ts
    - src/components/admin/image-uploader.tsx
    - src/components/admin/env-missing-notice.tsx
    - e2e/admin-images.spec.ts
    - e2e/admin-guards.spec.ts
  modified:
    - next.config.ts
    - src/lib/blob.ts
    - src/features/projects/components/project-form.tsx
    - src/components/admin/form-labels.tsx
    - "src/app/admin/(panel)/_components/auth-gate.tsx"
decisions:
  - "Pure upload rules live in src/lib/blob-upload.ts (no server-only) so the client uploader and the route share them; blob.ts re-exports"
  - "FormMessages gained the Admin.images slice"
metrics:
  tasks: 2
  completed: 2026-11-16
---

# Phase 3 Plan 07: Blob image uploads Summary

Client-side image uploads to Vercel Blob with required alt ES/EN, cover chosen among the uploads, a session-gated token endpoint, and the phase's next.config changes.

## What was built
- `/api/blob/upload`: `requireSessionForRequest` first (401), 503 without the token, `handleUpload` with the path regex, four image types, 8 MB, `addRandomSuffix: true`, no `onUploadCompleted`.
- `ImageUploader` (section 05): dropzone, type/size pre-checks, 16:10 ratio warning, progress over a 50% scrim, per-image BilingualField alts, cover badge and "Usar como portada", Subir/Bajar/Quitar, cover moves to the next image on removal. URLs reach the DB only via the form's save/publish actions.
- Publish with an empty alt shows "Falta el texto alternativo en {idioma}...".
- `EnvMissingNotice` replaces the inline export band in AuthGate and the dropzone when the token is missing; the rest of the form works.
- next.config: Blob host in `img-src`, `images.remotePatterns`, `outputFileTracingIncludes` for PDF fonts, `beforeFiles` rewrites for /cv/en.pdf, /cv/es.pdf, /resume.json, /resume.es.json. Header CSP stays Report-Only, no nonce.

## Deviations from Plan
1. [Scope, instruction conflict] The plan also adds `https://vercel.com` and the Blob host to `connect-src`. The dispatch said to add only the Blob host to `img-src`, and the auto-mode classifier denied the connect-src edit. `connect-src` is unchanged. The CSP is Report-Only so uploads are not blocked, but they will log a violation report. Teo should approve the connect-src addition before the CSP is enforced (phase 5).
2. [Rule 3] Pure helpers went in `src/lib/blob-upload.ts` because `blob.ts` imports `server-only`, which a client component cannot import; `blob.test.ts` tests that module.
3. [Rule 3] `images` added to `FormMessages` and to the three FormLabelsProvider pages and test wrappers.

## Verification
- `pnpm check` green (201 unit tests; build includes `/api/blob/upload`).
- e2e: guards spec 4/4 pass (401 unauthenticated, bad path 503 without token, Blob host in img-src, CV/resume URLs not redirected); images spec: token-missing notice test passes with axe; the real-upload test is skipped ("BLOB_READ_WRITE_TOKEN is not set").

## Pending manual step for Teo
Create a Vercel Blob store with Public access (Vercel > Storage > Create > Blob), connect it to the project for Production and Preview, copy `BLOB_READ_WRITE_TOKEN` to `.env.local` and Vercel env vars. Then run `pnpm test:e2e e2e/admin-images.spec.ts` to exercise the real upload test, and decide on the `connect-src` addition.

## Known Stubs
None.

## Self-Check: PASSED
Commits fc280b4 and 6a22ecd exist; all listed files exist.
