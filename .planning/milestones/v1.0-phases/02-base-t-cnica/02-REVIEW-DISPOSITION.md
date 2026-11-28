---
phase: 02-base-t-cnica
source: 02-REVIEW.md
recorded: 2026-11-16
counts: { critical: 2, warning: 7, info: 4, open: 13 }
---

# Phase 2 code review disposition

All findings are open. None blocks the phase gate (no admin-edited content exists yet; Neon main was seeded once without `--force`). CR-01, CR-02 and WR-01 must be resolved before phase 3 writes admin content.

| ID | Severity | Finding | Disposition | Note |
|----|----------|---------|-------------|------|
| CR-01 | critical | `seed --force` upsert overwrites whole rows (case studies to null, status, order, copy); experience key can duplicate | open | Verified at scripts/seed.ts:150-157 and seed-map.ts:46-47. Fix before phase 3 |
| CR-02 | critical | No production guard on seed / `--from-content --force` restore | open | Fix before phase 3 |
| WR-01 | warning | Admin pages rely on layout AuthGate; `AdminHome` lacks `requireSession()` | open | Every phase 3 admin page must call `requireSession()` |
| WR-02 | warning | Vercel build migrates before build passes; CI/Preview apply unmerged migrations to shared dev | open | Accepted design for v1; revisit with migration review |
| WR-03 | warning | CSP Report-Only has no report endpoint | open | Plan avoided a new route; decide before enforcing (phase 5) |
| WR-04 | warning | Better Auth rate limit in memory, per instance | open | Consider DB/Upstash storage in phase 4 |
| WR-05 | warning | `ensureAdmin` can create a second admin; password rotation keeps sessions | open | |
| WR-06 | warning | Content backups to guessable public Blob paths; drafts in public `content/*.json` | open | Must be resolved before drafts exist (phase 3) |
| WR-07 | warning | `go-no-go.sh` runs `pkill -f next-server` | open | Dev-only script |
| IN-01 | info | Proxy matcher skips `api*` prefixes; dotted paths go to generic 404 | open | |
| IN-02 | info | Login shows "invalid credentials" on 429/5xx | open | |
| IN-03 | info | Admin password validated after content batch write | open | |
| IN-04 | info | Explicit `locale` reaches messages import unvalidated | open | |
