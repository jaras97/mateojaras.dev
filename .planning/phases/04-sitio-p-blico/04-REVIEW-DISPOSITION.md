---
phase: 04
review: 04-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "The e2e checks for `FORMATTING_ERROR` and for the error title can never fail against a production build"
  - id: WR-02
    severity: warning
    disposition: open
    title: "The gallery fixture writes a published, visible project to the shared dev database without invalidating caches, and the cleanup by prefix deletes other runs' rows"
  - id: WR-03
    severity: warning
    disposition: open
    title: "The raw-template contract is stringly typed, so the same bug comes back as soon as any caller passes `t(\"figure\")`"
  - id: IN-01
    severity: info
    disposition: open
    title: "The new \"real catalog\" unit tests mostly repeat the existing `CaseGallery` tests"
  - id: IN-02
    severity: info
    disposition: open
    title: "The fixture media points at a blob host that does not exist, which adds image-optimizer 4xx noise on every run"
  - id: IN-04
    severity: info
    disposition: open
    title: "The error boundary renders a blank `<main>` without its provider, ignores `error`, and its copy is still unapproved"
  - id: CR-01
    severity: critical
    disposition: open
    title: "The contact form crashes when the Server Action call throws (redeploy skew, network error)"
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
  - id: IN-03
    severity: info
    disposition: open
    title: "`String.replace` with visitor-controlled replacement strings interprets `$` patterns"
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
recorded: 2026-11-24T16:00:27.265Z
---

# Phase 04: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| WR-02 | warning | open | - |
| WR-03 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-04 | info | open | - (not in the current review) |
| CR-01 | critical | open | - (not in the current review) |
| WR-04 | warning | open | - (not in the current review) |
| WR-05 | warning | open | - (not in the current review) |
| WR-06 | warning | open | - (not in the current review) |
| WR-07 | warning | open | - (not in the current review) |
| WR-08 | warning | open | - (not in the current review) |
| WR-09 | warning | open | - (not in the current review) |
| IN-03 | info | open | - (not in the current review) |
| IN-05 | info | open | - (not in the current review) |
| IN-06 | info | open | - (not in the current review) |
| IN-07 | info | open | - (not in the current review) |
| IN-08 | info | open | - (not in the current review) |
| IN-09 | info | open | - (not in the current review) |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
