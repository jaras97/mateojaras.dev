# 05-04 Preview verification

Preview alias: `https://mateojaras-dev-git-phase-05-polish-mateos-projects-85710491.vercel.app` (from `.preview-url`).
HEAD verified: `wait-preview` reported `READY 146d2bdc4137822cb53cd7e6c16bcef798491b4e` (the commit that adds the `headers` group; code identical to the enforced-CSP build). Analytics was first verified on `READY cdb2ae4d85f3fe27957b12c60e1c9df9408d6b0a`.

## Analytics beacon (QUAL-07, Pitfall 5)

`pnpm tsx scripts/check-live.ts <alias> --only=headers,notfound,analytics` printed `RESULT: all PASS`:

- script answers 200 at `/e45e9493d8fd6399/script.js` (build-time unique path, same origin)
- view beacon answers 200 at `/e45e9493d8fd6399/view`
- `/` and `/es` send an enforced `Content-Security-Policy` with `connect-src 'self' https://vercel.com/api/blob/`, and no `Content-Security-Policy-Report-Only`
- `/foo`, `/es/foo`, unknown project slugs answer 404

The platform serves the unique path before the proxy, so the `scriptSrc`/`viewEndpoint` fallback props were not needed.
The Vercel script ignores automated browsers (`navigator.webdriver` or a Headless user agent), so the check launches Chromium with `--disable-blink-features=AutomationControlled` and a regular Chrome user agent. Without that no beacon is sent at all.

## E2E on the Preview (analytics active, CSP enforced)

`E2E_BASE_URL=<alias> pnpm exec playwright test e2e/csp-sweep.spec.ts e2e/headers.spec.ts e2e/admin-images.spec.ts e2e/cv.spec.ts e2e/not-found.spec.ts`: 19 passed, 3 skipped, 1 failed.

- Passed with zero CSP violations: the sweep (10 routes x light/dark x reduced motion on/off, plus admin login, list, editor, CV), headers (including signed-in `/admin`), CV generation, not-found.
- Skipped (3): the no-token and empty-state variants of the cv and admin-images specs, which only apply without a Blob token or without CV versions.
- Failed: `admin-images.spec.ts` "uploads a screenshot". Cause is the test harness, not the policy. `playwright.config.ts` sends `x-vercel-protection-bypass`, `x-vercel-set-bypass-cookie` and `x-vercel-skip-toolbar` on every request, including the cross-origin client upload to `https://vercel.com/api/blob/`. vercel.com rejects those headers in the CORS preflight (`Request header field x-vercel-skip-toolbar is not allowed`). A debug run showed `/api/blob/upload` answering 200 (token issued) and the browser reaching the CORS stage for `vercel.com/api/blob/`, with no `securitypolicyviolation` event, so `connect-src` allows the call. Three harness workarounds (route override, priming the bypass cookie, proxying the call) did not work and were reverted.
- The same upload test passes locally with `BLOB_READ_WRITE_TOKEN` present under the enforced policy (without the Preview-only allowances).
- Pending, needs Teo: one manual image upload in the project editor on the Preview from a normal browser (no bypass headers) to close this gap.

## Vercel Toolbar

Not checked. The toolbar only renders for a Vercel-signed-in browser; the automation bypass hides it. Folded into the manual Preview pass above (open the editor with the toolbar visible and watch the console).

## Lighthouse mobile (3 runs, median), baseline 04.1-PROD-VERIFY.md 96-97

| Route | Performance | LCP (s) | CLS | TBT (ms) |
|---|---|---|---|---|
| `/` | 97 | 2.13 | 0 | 29 |
| `/projects/prendo` | 97 | 2.19 | 0 | 57 |
| `/about` | 97 | 2.18 | 0 | 43 |
| `/contact` | 97 | 2.19 | 0 | 64 |
| `/es` | 96 | 2.20 | 0 | 57 |
| `/es/proyectos/prendo` | 97 | 2.20 | 0 | 40 |
| `/es/sobre-mi` | 97 | 2.19 | 0 | 46 |
| `/es/contacto` | 97 | 2.20 | 0 | 63 |

Every score is at or above 95, LCP at or under 2.5 s, CLS 0.

## Violation found and fixed during the pass

Opening the project editor under the enforced policy reported `script-src eval` from Zod 4's `new Function("")` probe. Fixed by importing the existing `@/lib/zod-jitless` in every client form that loads Zod (commit `dcd6556`).
