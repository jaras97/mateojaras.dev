# 05-REVIEW-DISPOSITION

Source: 05-REVIEW.md (1 critical, 8 warning, 8 info). The review gate is advisory. Teo closed the phase on 2026-11-27 ("dala por terminada"), so no fixes were applied in this phase. Every finding goes to the backlog ("Code review de la fase 5" in docs/backlog.md) for a follow-up `/gsd-code-review 05 --fix` or a quick task.

| ID | Area | Disposition | Note |
|---|---|---|---|
| CR-01 | scripts/load-content.ts | deferred | The loader is never run against main (D-18), so the production draft is not at risk today. Fix before any future `--apply` |
| WR-01 | content-lint | deferred | Affects only the loader lint, not the public site |
| WR-02 | src/proxy.ts | deferred | Database read per unknown slug; consider rate limiting or a negative cache |
| WR-03 | e2e/db.ts | deferred | Use the `seed-guard` check on DATABASE_URL |
| WR-04 | requested-path.tsx | deferred | The 404 works in production (check-live); possible SSR path mismatch |
| WR-05 | 404 page | deferred | Possible duplicate `<title>` |
| WR-06 | scripts/load-content.ts | deferred | Same as CR-01: the loader is not run against main |
| WR-07 | scripts/load-content.ts | deferred | Same as CR-01 |
| WR-08 | scripts/load-content.ts | deferred | Same as CR-01 |
| IN-01..IN-08 | various | deferred | Minor; batch them with the fixes above |
