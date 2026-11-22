---
phase: 03
review: 03-REVIEW.md
titles: json
findings:
  - id: CR-01
    severity: critical
    disposition: open
    title: "A deleted skill or project leaves a stale id inside other rows' pending drafts, and publishing those rows then fails for good"
  - id: WR-01
    severity: warning
    disposition: open
    title: "Names with leading or trailing whitespace can never be deleted"
  - id: WR-02
    severity: warning
    disposition: open
    title: "Project actions don't validate `id`, and the first DB reads sit outside `try`"
  - id: WR-03
    severity: warning
    disposition: open
    title: "Project `startedAt` / `finishedAt` reach a `date` column with no server validation"
  - id: WR-04
    severity: warning
    disposition: open
    title: "An invalid timezone in the settings draft crashes the Draft Mode home preview"
  - id: WR-05
    severity: warning
    disposition: open
    title: "Draft Mode outlives sign-out, so unpublished and hidden content stays visible in that browser"
  - id: WR-06
    severity: warning
    disposition: open
    title: "`generateCv` sends raw internal error messages to the client"
  - id: WR-07
    severity: warning
    disposition: open
    title: "`generateCv` skips `exportContent()`, so the content backup drifts and a restore rolls the CV back"
  - id: WR-08
    severity: warning
    disposition: open
    title: "The upload path regex rejects ordinary file names, and the uploader shows only a generic error"
  - id: WR-09
    severity: warning
    disposition: open
    title: "The editor creates `http://` links that the server schema rejects, and the error points at no field"
  - id: WR-10
    severity: warning
    disposition: open
    title: "Signing out with unsaved changes skips the unsaved-changes guard"
  - id: WR-11
    severity: warning
    disposition: open
    title: "Content backups go to a public Blob store and include unpublished and hidden content"
  - id: IN-01
    severity: info
    disposition: open
    title: "The server-side delete confirmation compares the row name with itself"
  - id: IN-02
    severity: info
    disposition: open
    title: "`\"code\"` is listed as a node type in the rich-text allowlist"
  - id: IN-03
    severity: info
    disposition: open
    title: "`DATE_PATTERN` accepts dates that don't exist"
  - id: IN-04
    severity: info
    disposition: open
    title: "Changing a skill's category keeps its old `order`"
  - id: IN-05
    severity: info
    disposition: open
    title: "`GenerateCvButton` is rendered twice with separate busy state"
  - id: IN-06
    severity: info
    disposition: open
    title: "The CSP is Report-Only, so it is not enforced"
  - id: IN-07
    severity: info
    disposition: open
    title: "`media[].url` and `coverImage` accept any string"
  - id: IN-08
    severity: info
    disposition: open
    title: "Saves are last-write-wins across tabs"
  - id: IN-09
    severity: info
    disposition: open
    title: "`seed --from-content` only checks `projects` before wiping all nine tables"
  - id: IN-10
    severity: info
    disposition: open
    title: "`createProject` reports a slug race as `server`, not `conflict`"
open: 22
total: 22
recorded: 2026-11-22T19:16:36.015Z
---

# Phase 03: Code Review Disposition

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
| WR-10 | warning | open | - |
| WR-11 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-03 | info | open | - |
| IN-04 | info | open | - |
| IN-05 | info | open | - |
| IN-06 | info | open | - |
| IN-07 | info | open | - |
| IN-08 | info | open | - |
| IN-09 | info | open | - |
| IN-10 | info | open | - |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
