# 05 Production Verify

## Readiness

Date: 2026-11-26. Branch: phase-05-polish at 7d1b0c2.

- PR: https://github.com/jaras97/mateojaras.dev/pull/2 (state OPEN)
- Commits main..phase-05-polish: 32
- pnpm check: pass (run on 0215c21; 82 files, 505 tests, build OK). Not re-run on 7d1b0c2, which only touches one e2e spec; the CI check job is green on it.
- CI run 45881853774 on 7d1b0c2: check success, e2e success. PR checks: Vercel pass, check pass, e2e pass.
- wait-preview: `READY 7d1b0c2ab5b08adb627e618f8e2d46cf96ccd3d2`
- Preview alias: https://mateojaras-dev-git-phase-05-polish-mateos-projects-85710491.vercel.app
- check-live (notfound, headers, analytics) on the Preview, last line: `RESULT: all PASS`
- 05-APPROVALS.md: 404 `ok`, favicon `a`. Shipped Site.notFound copy (en and es) matches the approved redesign with no edits.

### Deviations

- Flaky test: run 45880349149 on 0215c21 failed e2e (`e2e/admin-projects.spec.ts:49`, title field concatenated instead of replaced). Fixed by the orchestrator in 7d1b0c2 (wait for hydration before editing the title); CI green after.

## Decisión

2026-11-26. Teo answered "merge" at the checkpoint (relayed by the orchestrator) and merged PR #2 himself from GitHub (jaras97, 2026-11-26T19:52:11Z, merge commit 9a4aad4, verified with `gh pr view 2`).

## Producción (parcial, bloqueada en e2e y contact-live)

Production deployment: https://mateojaras-6863yn21o-mateos-projects-85710491.vercel.app (Ready, merge 9a4aad4).

- check-live https://mateojaras.dev --only=domain,notfound,headers,analytics: 23 PASS, `RESULT: all PASS`.
- check-cv-pdf en (`--chars=éí --reject-text=vercel.app`): PASS https://mateojaras.dev/cv/en.pdf
- check-cv-pdf es (`--reject-text=vercel.app`): PASS https://mateojaras.dev/cv/es.pdf
- Lighthouse mobile (1 run, LH_SLUG=prendo):

| Route | Perf | LCP s | CLS |
|---|---|---|---|
| / | 96 | 2.19 | 0 |
| /projects/prendo | 97 | 2.20 | 0 |
| /about | 97 | 2.17 | 0 |
| /contact | 96 | 2.22 | 0 |
| /es | 96 | 2.18 | 0 |
| /es/proyectos/prendo | 97 | 2.19 | 0 |
| /es/sobre-mi | 97 | 2.19 | 0 |
| /es/contacto | 97 | 2.17 | 0 |

- Pendiente: e2e not-found, csp-sweep, headers on production and contact-live. Blocker: `DATABASE_URL` of Production is Sensitive; `vercel env pull` returns a placeholder, so the specs' DB access fails (neon: not a valid URL). Nothing was written to production.
