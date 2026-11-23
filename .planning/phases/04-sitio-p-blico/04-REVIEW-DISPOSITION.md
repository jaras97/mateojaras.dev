---
phase: 04
review: 04-REVIEW.md
titles: json
findings:
  - id: CR-01
    severity: critical
    disposition: open
    title: "The contact form crashes when the Server Action call throws (redeploy skew, network error)"
  - id: WR-01
    severity: warning
    disposition: open
    title: "The rate limit is per exact IP, so rotating IPv6 addresses gets around it, and there is no global cap"
  - id: WR-02
    severity: warning
    disposition: open
    title: "The `??` env fallback ignores `KV_REST_API_*` when `UPSTASH_REDIS_REST_*` is set but empty"
  - id: WR-03
    severity: warning
    disposition: open
    title: "An invalid `capturedAt` month crashes the published case study (RangeError)"
  - id: WR-04
    severity: warning
    disposition: open
    title: "The status line's overlap hours ignore `settings.timezone`, and the UTC offset is frozen at `updatedAt`"
  - id: WR-05
    severity: warning
    disposition: open
    title: "A decision with an empty title renders an empty `<h3>` and duplicate React keys"
  - id: WR-06
    severity: warning
    disposition: open
    title: "The footer renders an empty segment and a dangling separator when `location` is empty"
  - id: WR-07
    severity: warning
    disposition: open
    title: "`scripts/project-status.mjs` changes project status without `updateTag` or `exportContent`"
  - id: WR-08
    severity: warning
    disposition: open
    title: "The Report-Only CSP has no reporting endpoint, so its review condition can never be met"
  - id: WR-09
    severity: warning
    disposition: open
    title: "The name max-length error tells the visitor to \"Write your name.\""
  - id: IN-01
    severity: info
    disposition: open
    title: "The `motion-ok` class is set but no CSS uses it"
  - id: IN-02
    severity: info
    disposition: open
    title: "The `typeof window` ternary in `InlineScript` is dead code and its comment is misleading"
  - id: IN-03
    severity: info
    disposition: open
    title: "`String.replace` with visitor-controlled replacement strings interprets `$` patterns"
  - id: IN-04
    severity: info
    disposition: open
    title: "The OG card date uses the UTC day, unlike the rest of the site"
  - id: IN-05
    severity: info
    disposition: open
    title: "The IP hashing key and the trusted IP source are implicit"
  - id: IN-06
    severity: info
    disposition: open
    title: "The proxy matcher's `.*/opengraph-image` exclusion is unanchored"
  - id: IN-07
    severity: info
    disposition: open
    title: "A failed GSAP chunk import in `ScrollScene` is an unhandled rejection"
  - id: IN-08
    severity: info
    disposition: open
    title: "Content-keyed lists can produce duplicate React keys"
  - id: IN-09
    severity: info
    disposition: open
    title: "The rate-limit count is hardcoded in two places"
open: 19
total: 19
recorded: 2026-11-23T20:10:25.018Z
---

# Phase 04: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| CR-01 | critical | open | - |
| WR-01 | warning | open | - |
| WR-02 | warning | open | - |
| WR-03 | warning | open | - |
| WR-04 | warning | open | - |
| WR-05 | warning | open | - |
| WR-06 | warning | open | - |
| WR-07 | warning | open | - |
| WR-08 | warning | open | - |
| WR-09 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-03 | info | open | - |
| IN-04 | info | open | - |
| IN-05 | info | open | - |
| IN-06 | info | open | - |
| IN-07 | info | open | - |
| IN-08 | info | open | - |
| IN-09 | info | open | - |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
